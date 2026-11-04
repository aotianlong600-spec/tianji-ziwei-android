export type ClockBasis = 'beijing' | 'daylight' | 'xinjiang' | 'local';
export type TimeDisambiguation = 'earlier' | 'later';
export interface SolarTimeConversion {
  originalMoment: string;
  beijingMoment: string;
  solarMoment: string;
  longitude: number;
  longitudeMinutes: number;
  utcOffsetMinutes: number;
  offsetMinutes: number;
  dateLineMinutes: number;
  equationMinutes: number;
  totalMinutes: number;
  dayShift: number;
  clockBasis: ClockBasis;
  timeZone?: string;
  birthplaceTimeZone?: string;
  placeOffsetMinutes?: number;
}

function timeZoneLocalMs(timeZone:string|undefined):(instant:number)=>number {
  if (typeof timeZone!=='string' || !timeZone) throw new Error('请选择出生地 IANA 时区');
  if (typeof Intl==='undefined' || typeof Intl.DateTimeFormat!=='function' || typeof Intl.DateTimeFormat.prototype.formatToParts!=='function') throw new Error('当前环境不支持当地时区换算，请更新浏览器或系统');
  let formatter:Intl.DateTimeFormat;
  try {
    formatter=new Intl.DateTimeFormat('en-CA',{timeZone,calendar:'gregory',numberingSystem:'latn',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false,hourCycle:'h23'});
  } catch {
    throw new Error(`当前环境不支持时区 ${timeZone}，请核对时区或更新系统`);
  }
  return (instant:number)=>{
    const parts:Record<string,number>={};
    for (const part of formatter.formatToParts(instant)) if (part.type!=='literal') parts[part.type]=Number(part.value);
    const value=Date.UTC(parts.year,parts.month-1,parts.day,parts.hour%24,parts.minute,parts.second);
    if (!Number.isFinite(value)) throw new Error('当前环境不支持完整的当地时区换算，请更新浏览器或系统');
    return value;
  };
}

function localClockUtc(original:number, localMs:(instant:number)=>number, timeDisambiguation:TimeDisambiguation|undefined):number {
  if (timeDisambiguation!==undefined && timeDisambiguation!=='earlier' && timeDisambiguation!=='later') throw new Error('重复钟表时间须选择较早或较晚的一次');
  // 采集跳时前后的实际偏移，再逐个反查完整年月日时分秒；不假定整小时或一小时夏令差。
  const offsets=new Set<number>();
  for (let hours=-48;hours<=48;hours+=6) {
    const instant=original+hours*3600000;
    offsets.add(localMs(instant)-instant);
  }
  const candidates=[...offsets].map(offset=>original-offset).filter(instant=>localMs(instant)===original).sort((a,b)=>a-b);
  if (!candidates.length) throw new Error('此当地钟表时间因时制跳时而不存在，请核对出生记录');
  if (candidates.length>1 && !timeDisambiguation) throw new Error('此当地钟表时间因时制回拨出现两次，请选择较早或较晚的一次');
  return candidates[timeDisambiguation==='later'?candidates.length-1:0];
}

export function convertSolarTime(date: { year:number; month:number; day:number }, clock:string|undefined, longitude:number|undefined, clockBasis:ClockBasis='beijing', timeZone?:string, timeDisambiguation?:TimeDisambiguation) {
  if (!date || ![date.year,date.month,date.day].every(Number.isInteger)) throw new Error('公历日期须为完整有效的年月日');
  const check=new Date(Date.UTC(date.year,date.month-1,date.day));
  if (check.getUTCFullYear()!==date.year || check.getUTCMonth()!==date.month-1 || check.getUTCDate()!==date.day) throw new Error('公历日期不存在');
  if (typeof clock!=='string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(clock)) throw new Error('真太阳时须填写准确出生时间（00:00–23:59）');
  if (typeof longitude!=='number' || !Number.isFinite(longitude) || longitude<-180 || longitude>180) throw new Error('出生地经度须在 -180° 至 180° 之间（东经为正，西经为负）');
  if (!['beijing','daylight','xinjiang','local'].includes(clockBasis)) throw new Error('请选择正确的出生钟表口径');
  const [hour,minute]=clock.split(':').map(Number);
  const original=Date.UTC(date.year,date.month-1,date.day,hour,minute);
  const manualOffset=clockBasis==='daylight'?540:clockBasis==='xinjiang'?360:480;
  const localMs=clockBasis==='local'||timeZone!==undefined?timeZoneLocalMs(timeZone):undefined;
  const utc=clockBasis==='local'?localClockUtc(original,localMs!,timeDisambiguation):original-manualOffset*60000;
  const utcOffsetMinutes=(original-utc)/60000;
  const placeOffsetMinutes=localMs?(localMs(utc)-utc)/60000:undefined;
  const offsetMinutes=480-utcOffsetMinutes;
  // USNO 近似太阳坐标（约适用 1800–2200）：https://aa.usno.navy.mil/faq/sun_approx
  const d=utc/86400000+2440587.5-2451545;
  const rad=Math.PI/180;
  const g=(357.529+0.98560028*d)*rad;
  const q=280.459+0.98564736*d;
  const l=(q+1.915*Math.sin(g)+0.020*Math.sin(2*g))*rad;
  const e=(23.439-0.00000036*d)*rad;
  const ra=Math.atan2(Math.cos(e)*Math.sin(l),Math.cos(l))/rad;
  const equationMinutes=4*((((q-ra+180)%360)+360)%360-180);
  const longitudeMinutes=4*(longitude-120);
  const geometricMinutes=offsetMinutes+longitudeMinutes;
  // 太阳日期按出生地在该瞬间的民用日期选支，避免同一出生因记录为北京时间而差一天。
  const dateLineMinutes=placeOffsetMinutes===undefined?0:0-1440*Math.floor((4*longitude-placeOffsetMinutes+720)/1440);
  const totalMinutes=geometricMinutes+dateLineMinutes+equationMinutes;
  const apparent=utc+longitude*240000+(equationMinutes+dateLineMinutes)*60000;
  // 向下取整到秒供显示及历法库使用，不四舍五入到分钟，避免提前跨日/时辰。
  const solar=new Date(Math.floor(apparent/1000)*1000);
  const beijing=new Date(utc+8*3600000);
  const moment=(value:number)=>new Date(value).toISOString().slice(0,19).replace('T',' ');
  const conversion:SolarTimeConversion={
    originalMoment:moment(original),beijingMoment:moment(beijing.getTime()),solarMoment:moment(solar.getTime()),
    longitude,longitudeMinutes,utcOffsetMinutes,offsetMinutes,dateLineMinutes,equationMinutes,totalMinutes,
    dayShift:Math.floor(apparent/86400000)-Math.floor(original/86400000),clockBasis,
    ...(clockBasis==='local'?{timeZone}:{}),
    ...(localMs?{birthplaceTimeZone:timeZone,placeOffsetMinutes}:{}),
  };
  return {solar,beijing,conversion};
}
