import type { BirthInfo } from '../../ziwei-doushu/lib/ziwei/types';
import { generateChart, setBrightnessSchool } from '../../ziwei-doushu/lib/ziwei/algorithm';
import { lunarToSolar } from '../../ziwei-doushu/lib/ziwei/lunar-solar';
import { Solar } from 'lunar-javascript';
import { convertSolarTime, type ClockBasis, type SolarTimeConversion, type TimeDisambiguation } from './solar-time';
export interface BirthInput { name: string; year: number; month: number; day: number; hour: number; gender: 'male' | 'female'; calendar: 'solar' | 'lunar'; leap: boolean; clock?: string; brightness?: 'DOC' | 'ZZ' | 'QS'; trueSolar?: boolean; region?: string; longitude?: number; clockBasis?: ClockBasis; timeZone?: string; timeDisambiguation?: TimeDisambiguation; }
function resolveBirth(input: BirthInput): { birth:BirthInfo; solar?:Date; beijing?:Date; conversion?:SolarTimeConversion } {
  if (input.trueSolar!==undefined && typeof input.trueSolar!=='boolean') throw new Error('真太阳时选项须为开启或关闭');
  const { year, month, day, hour, gender, calendar } = input;
  if (input.region!==undefined && typeof input.region!=='string') throw new Error('出生地区格式异常');
  if (![year, month, day, hour].every(Number.isInteger)) throw new Error('请填写完整的出生日期与时辰');
  if (year < 1900 || year > new Date().getFullYear()) throw new Error('出生年份须在 1900 年至今年之间');
  if (!['male','female'].includes(gender)) throw new Error('请选择性别');
  if (hour < 0 || hour > 11) throw new Error('请选择正确的时辰');
  if (input.clock) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.clock)) throw new Error('出生时间须为 00:00–23:59');
    const clockHour=Number(input.clock.slice(0,2));
    if (!input.trueSolar && Math.floor((clockHour+1)/2)%12!==hour) throw new Error('准确出生时间与所选时辰不一致');
  }
  if (calendar !== 'solar' && calendar !== 'lunar') throw new Error('请选择历法');
  if (input.brightness && !['DOC','ZZ','QS'].includes(input.brightness)) throw new Error('请选择星曜亮度表');
  let date = { year, month, day };
  if (calendar === 'lunar') {
    const converted = lunarToSolar(year, month, day, input.leap);
    if (!converted) throw new Error('农历日期不存在，请核对日期和闰月');
    date = converted;
  } else {
    const check = new Date(Date.UTC(year, month - 1, day));
    if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) throw new Error('公历日期不存在');
  }
  const birth={ name: input.name.trim().slice(0,30), ...date, hour, gender };
  if (!input.trueSolar) return {birth};
  const worldRegion=input.region?.startsWith('geonames:') || input.region?.startsWith('country:');
  const overseasLongitude=typeof input.longitude==='number' && Number.isFinite(input.longitude) && (input.longitude<73 || input.longitude>136);
  if (!input.timeZone && (worldRegion || overseasLongitude)) throw new Error('海外出生地或境外经度须填写出生地 IANA 时区，以正确确定出生日期');
  const result=convertSolarTime(date,input.clock,input.longitude,input.clockBasis,input.timeZone,input.timeDisambiguation);
  const solar=result.solar;
  const corrected={year:solar.getUTCFullYear(),month:solar.getUTCMonth()+1,day:solar.getUTCDate()};
  if (corrected.year<1900 || corrected.year>2050) throw new Error('真太阳时修正后的日期超出支持范围（1900–2050 年）');
  return {...result,birth:{...birth,...corrected,hour:Math.floor((solar.getUTCHours()+1)/2)%12}};
}
export function toBirthInfo(input: BirthInput): BirthInfo {
  return resolveBirth(input).birth;
}
export function makeChart(input: BirthInput) {
  const birth=toBirthInfo(input);
  const profile=input.brightness || 'DOC';
  setBrightnessSchool(profile==='DOC'?'ZZ':profile);
  const chart=generateChart(birth);
  if(profile==='DOC') {
    // 按盘例逐格补值，未覆盖项沿用中州表；封诰丑目前仅有一份明确盘例。
    for(const palace of chart.palaces) for(const star of palace.stars) {
      if((star.name==='天梁'&&palace.branch===9)||(star.name==='贪狼'&&palace.branch===3)) {star.brightnessRaw='地';star.brightness='normal';}
      if(star.name==='天相'&&palace.branch===10) {star.brightnessRaw='庙';star.brightness='bright';}
      if(star.name==='封诰'&&[0,1,2,3,6].includes(palace.branch)) {star.brightnessRaw='庙';star.brightness='bright';}
      if(star.name==='天姚'&&palace.branch===2) {star.brightnessRaw='庙';star.brightness='bright';}
    }
  }
  return chart;
}
export function actualLunarLabel(input: BirthInput): string {
  const b=toBirthInfo(input), l=Solar.fromYmd(b.year,b.month,b.day).getLunar();
  return `${l.getYear()}年${l.getMonth()<0?'闰':''}${Math.abs(l.getMonth())}月${l.getDay()}日`;
}

export function pillarContext(input: BirthInput) {
  const resolved=resolveBirth(input);
  const birth=resolved.birth;
  const [hour,minute]=input.clock?input.clock.split(':').map(Number):[input.hour*2,0];
  const asSolar=(date:Date)=>Solar.fromYmdHms(date.getUTCFullYear(),date.getUTCMonth()+1,date.getUTCDate(),date.getUTCHours(),date.getUTCMinutes(),date.getUTCSeconds());
  const solar=resolved.solar?asSolar(resolved.solar):Solar.fromYmdHms(birth.year,birth.month,birth.day,hour,minute,0);
  const physical=resolved.beijing?asSolar(resolved.beijing):solar;
  const lunar=physical.getLunar();
  const physicalEight=lunar.getEightChar();
  physicalEight.setSect(2);
  const eight=solar.getLunar().getEightChar();
  eight.setSect(2);
  const pillars=[physicalEight.getYear(),physicalEight.getMonth(),eight.getDay(),eight.getTime()] as [string,string,string,string];
  const terms=lunar.getJieQiTable();
  const time=physical.toYmdHms();
  const yangSeason=time<terms['夏至'].toYmdHms() || time>=terms['DONG_ZHI'].toYmdHms();
  const branches='子丑寅卯辰巳午未申酉戌亥';
  const physicalYear=resolved.beijing?resolved.beijing.getUTCFullYear():birth.year;
  const yearOffset=(((physicalYear-4)%12)-branches.indexOf(pillars[0][1])+12)%12;
  return {pillars,birthYear:physicalYear-yearOffset,yangSeason,hour:birth.hour,estimatedTime:!input.clock,clock:resolved.conversion?resolved.conversion.solarMoment.slice(11):input.clock||`${String(hour).padStart(2,'0')}:00`,conversion:resolved.conversion};
}
