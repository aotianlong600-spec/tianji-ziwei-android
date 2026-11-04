export type ClockBasis = 'beijing' | 'daylight' | 'xinjiang';
export interface SolarTimeConversion {
  originalMoment: string;
  beijingMoment: string;
  solarMoment: string;
  longitude: number;
  longitudeMinutes: number;
  equationMinutes: number;
  totalMinutes: number;
  dayShift: number;
  clockBasis: ClockBasis;
}

export function convertSolarTime(date: { year:number; month:number; day:number }, clock:string|undefined, longitude:number|undefined, clockBasis:ClockBasis='beijing') {
  if (!date || ![date.year,date.month,date.day].every(Number.isInteger)) throw new Error('公历日期须为完整有效的年月日');
  const check=new Date(Date.UTC(date.year,date.month-1,date.day));
  if (check.getUTCFullYear()!==date.year || check.getUTCMonth()!==date.month-1 || check.getUTCDate()!==date.day) throw new Error('公历日期不存在');
  if (typeof clock!=='string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(clock)) throw new Error('真太阳时须填写准确出生时间（00:00–23:59）');
  if (typeof longitude!=='number' || !Number.isFinite(longitude) || longitude<73 || longitude>136) throw new Error('出生地经度须在东经 73° 至 136° 之间');
  if (!['beijing','daylight','xinjiang'].includes(clockBasis)) throw new Error('请选择正确的出生钟表口径');
  const [hour,minute]=clock.split(':').map(Number);
  const original=Date.UTC(date.year,date.month-1,date.day,hour,minute);
  const offset=clockBasis==='daylight'?9:clockBasis==='xinjiang'?6:8;
  const utc=original-offset*3600000;
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
  const totalMinutes=(8-offset)*60+longitudeMinutes+equationMinutes;
  const apparent=original+totalMinutes*60000;
  // 向下取整到秒供显示及历法库使用，不四舍五入到分钟，避免提前跨日/时辰。
  const solar=new Date(Math.floor(apparent/1000)*1000);
  const beijing=new Date(utc+8*3600000);
  const moment=(value:number)=>new Date(value).toISOString().slice(0,19).replace('T',' ');
  const conversion:SolarTimeConversion={
    originalMoment:moment(original),beijingMoment:moment(beijing.getTime()),solarMoment:moment(solar.getTime()),
    longitude,longitudeMinutes,equationMinutes,totalMinutes,
    dayShift:Math.floor(apparent/86400000)-Math.floor(original/86400000),clockBasis,
  };
  return {solar,beijing,conversion};
}
