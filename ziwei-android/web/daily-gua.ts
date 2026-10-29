import { Solar, Lunar, LunarMonth } from 'lunar-javascript';
import { annualGua, monthGuas, type Gua, type Minggua } from './minggua';

export type DailyCalendar='solar'|'lunar';
export interface DailyGuaResult extends Gua { changeLine:number; group:number }
export interface DailyDateResult {
  dateTime:string; flowYear:number; age:number; month:number; term:string;
  monthStart:string; monthEnd:string; dayIndex:number; intervalStart:string; intervalEnd:string;
  annual:ReturnType<typeof annualGua>; monthly:ReturnType<typeof monthGuas>[number];
  daily:DailyGuaResult|null; pendingReason:string;
}

const dayMilliseconds=86400000;
const terms=['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
const termAliases=['LI_CHUN','JING_ZHE','QING_MING','LI_XIA','MANG_ZHONG','XIAO_SHU','LI_QIU','BAI_LU','HAN_LU','LI_DONG','DA_XUE','XIAO_HAN'];
const monthStartCache=new Map<string,string>();

export function dailyGua(monthly:Gua,dayIndex:number):DailyGuaResult {
  if(!monthly||!Number.isInteger(monthly.code)||monthly.code<0||monthly.code>63||!Number.isInteger(monthly.line)||monthly.line<1||monthly.line>6)throw new Error('月卦须为有效卦码0–63和爻位1–6');
  if(!Number.isInteger(dayIndex)||dayIndex<1||dayIndex>30)throw new Error('流日序号仅接受1至30；第31日起的超额日规则待核');
  const group=Math.floor((dayIndex-1)/6)+1;
  const changeLine=(monthly.line+group-1)%6+1;
  // 六日组从原月卦各翻一爻；图中各日值爻与生成该组的变爻分开记录。
  return {code:monthly.code^(1<<(changeLine-1)),line:(dayIndex-1)%6+1,changeLine,group};
}

export function solarMonthStart(flowYear:number,month:number):string {
  if(!Number.isInteger(flowYear)||flowYear<1899||flowYear>2200)throw new Error('节令年须为1899至2200的整数');
  if(!Number.isInteger(month)||month<1||month>12)throw new Error('节令月须为1至12');
  const cacheKey=`${flowYear}-${month}`;
  const cached=monthStartCache.get(cacheKey);
  if(cached)return cached;
  const calendarYear=flowYear+(month===12?1:0), calendarMonth=month===12?1:month+1;
  // 大雪/小寒等在节气表中有相邻年别名，必须核对条目的真实公历年。
  for(const anchor of [calendarYear,calendarYear+1,calendarYear-1]) {
    const table=Solar.fromYmd(anchor,7,1).getLunar().getJieQiTable();
    for(const key of [terms[month-1],termAliases[month-1]]) {
      const term=table[key];
      if(term&&term.getYear()===calendarYear&&term.getMonth()===calendarMonth) {
        const value=term.toYmdHms();
        monthStartCache.set(cacheKey,value);
        return value;
      }
    }
  }
  throw new Error(`无法确定${flowYear}年${terms[month-1]}的交节时刻`);
}

function wallMilliseconds(dateTime:string):number {
  const [year,month,day,hour,minute,second]=dateTime.split(/\D/).map(Number);
  return Date.UTC(year,month-1,day,hour,minute,second);
}
function wallLabel(milliseconds:number):string {
  const d=new Date(milliseconds), pad=(n:number)=>String(n).padStart(2,'0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}
function queryTime(date:string,clock:string) {
  const parts=typeof date==='string'?/^(\d{4})-(\d{2})-(\d{2})$/.exec(date):null;
  if(!parts)throw new Error('查询日期须为1900–2200年有效公历日期（YYYY-MM-DD）');
  const [year,month,day]=parts.slice(1).map(Number), check=new Date(Date.UTC(year,month-1,day));
  if(year<1900||year>2200||check.getUTCFullYear()!==year||check.getUTCMonth()!==month-1||check.getUTCDate()!==day)throw new Error('查询日期须为1900–2200年有效公历日期（YYYY-MM-DD）');
  const timeParts=typeof clock==='string'?/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(clock):null;
  if(!timeParts)throw new Error('查询时间须为HH:mm或HH:mm:ss');
  const dateTime=`${date} ${timeParts[1]}:${timeParts[2]}:${timeParts[3]||'00'}`;
  return {year,dateTime,milliseconds:wallMilliseconds(dateTime)};
}

export function dailySolarDate(calendar:DailyCalendar,date:string,leap=false):string {
  if(calendar!=='solar'&&calendar!=='lunar')throw new Error('查询历法须为公历或农历');
  if(typeof leap!=='boolean')throw new Error('农历闰月标记须为是或否');
  if(calendar==='solar') {queryTime(date,'00:00');return date;}
  const parts=typeof date==='string'?/^(\d{4})-(\d{2})-(\d{2})$/.exec(date):null;
  if(!parts)throw new Error('农历日期须为有效的YYYY-MM-DD格式');
  const [year,month,day]=parts.slice(1).map(Number);
  if(year<1899||year>2200||month<1||month>12||day<1||day>30)throw new Error('农历日期须为1899–2200年的有效年月日');
  const lunarMonth=LunarMonth.fromYm(year,leap?-month:month);
  if(!lunarMonth||day>lunarMonth.getDayCount())throw new Error('农历日期不存在，请核对年月日和闰月');
  // 此处只转换真实日历，不使用紫微安星的“闰月作下月”口径。
  const solar=Lunar.fromYmd(year,leap?-month:month,day).getSolar();
  const result=`${solar.getYear()}-${String(solar.getMonth()).padStart(2,'0')}-${String(solar.getDay()).padStart(2,'0')}`;
  queryTime(result,'00:00');
  return result;
}

export function dailyCalendarDates(solarDate:string):{solar:string;lunar:string;leap:boolean;lunarLabel:string} {
  queryTime(solarDate,'00:00');
  const [year,month,day]=solarDate.split('-').map(Number);
  const lunar=Solar.fromYmd(year,month,day).getLunar();
  const lunarYear=lunar.getYear(), lunarMonth=Math.abs(lunar.getMonth()), lunarDay=lunar.getDay(), leap=lunar.getMonth()<0;
  return {solar:solarDate,lunar:`${lunarYear}-${String(lunarMonth).padStart(2,'0')}-${String(lunarDay).padStart(2,'0')}`,leap,lunarLabel:`${lunarYear}年${leap?'闰':''}${lunarMonth}月${lunarDay}日`};
}

export function dailyFromDate(data:Minggua,date:string,clock:string):DailyDateResult {
  const query=queryTime(date,clock);
  const flowYear=query.year-(query.milliseconds<wallMilliseconds(solarMonthStart(query.year,1))?1:0);
  const age=flowYear-data.birthYear+1, annual=annualGua(data,age);
  let month=1;
  for(let candidate=2;candidate<=12;candidate++) {
    if(query.milliseconds>=wallMilliseconds(solarMonthStart(flowYear,candidate)))month=candidate;
  }
  const monthStart=solarMonthStart(flowYear,month);
  const monthEnd=month===12?solarMonthStart(flowYear+1,1):solarMonthStart(flowYear,month+1);
  const startMilliseconds=wallMilliseconds(monthStart), endMilliseconds=wallMilliseconds(monthEnd);
  const dayIndex=Math.floor((query.milliseconds-startMilliseconds)/dayMilliseconds)+1;
  const intervalStartMilliseconds=startMilliseconds+(dayIndex-1)*dayMilliseconds;
  const monthly=monthGuas(annual)[month-1], daily=dayIndex<=30?dailyGua(monthly,dayIndex):null;
  return {
    dateTime:query.dateTime,flowYear,age,month,term:terms[month-1],monthStart,monthEnd,dayIndex,
    intervalStart:wallLabel(intervalStartMilliseconds),
    intervalEnd:wallLabel(Math.min(intervalStartMilliseconds+dayMilliseconds,endMilliseconds)),
    annual,monthly,daily,
    pendingReason:daily?'':`当前为交节起算第${dayIndex}卦日；第31日起的超额日处理尚待核对，暂不排流日卦。`,
  };
}
