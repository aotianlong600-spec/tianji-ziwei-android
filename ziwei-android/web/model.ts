import type { BirthInfo } from '../../ziwei-doushu/lib/ziwei/types';
import { generateChart, setBrightnessSchool } from '../../ziwei-doushu/lib/ziwei/algorithm';
import { lunarToSolar } from '../../ziwei-doushu/lib/ziwei/lunar-solar';
import { Solar } from 'lunar-javascript';
export interface BirthInput { name: string; year: number; month: number; day: number; hour: number; gender: 'male' | 'female'; calendar: 'solar' | 'lunar'; leap: boolean; clock?: string; brightness?: 'DOC' | 'ZZ' | 'QS'; }
export function toBirthInfo(input: BirthInput): BirthInfo {
  const { year, month, day, hour, gender, calendar } = input;
  if (![year, month, day, hour].every(Number.isInteger)) throw new Error('请填写完整的出生日期与时辰');
  if (year < 1900 || year > new Date().getFullYear()) throw new Error('出生年份须在 1900 年至今年之间');
  if (!['male','female'].includes(gender)) throw new Error('请选择性别');
  if (hour < 0 || hour > 11) throw new Error('请选择正确的时辰');
  if (input.clock) {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.clock)) throw new Error('出生时间须为 00:00–23:59');
    const clockHour=Number(input.clock.slice(0,2));
    if (Math.floor((clockHour+1)/2)%12!==hour) throw new Error('准确出生时间与所选时辰不一致');
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
  return { name: input.name.trim().slice(0,30), ...date, hour, gender };
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
  const birth=toBirthInfo(input);
  const [hour,minute]=input.clock?input.clock.split(':').map(Number):[input.hour*2,0];
  const solar=Solar.fromYmdHms(birth.year,birth.month,birth.day,hour,minute,0);
  const lunar=solar.getLunar();
  const eight=lunar.getEightChar();
  eight.setSect(2);
  const pillars=[eight.getYear(),eight.getMonth(),eight.getDay(),eight.getTime()] as [string,string,string,string];
  const terms=lunar.getJieQiTable();
  const time=solar.toYmdHms();
  const yangSeason=time<terms['夏至'].toYmdHms() || time>=terms['DONG_ZHI'].toYmdHms();
  const branches='子丑寅卯辰巳午未申酉戌亥';
  const yearOffset=(((birth.year-4)%12)-branches.indexOf(pillars[0][1])+12)%12;
  return {pillars,birthYear:birth.year-yearOffset,yangSeason,estimatedTime:!input.clock,clock:input.clock||`${String(hour).padStart(2,'0')}:00`};
}
