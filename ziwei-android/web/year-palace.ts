import type { ZiweiChart } from '../../ziwei-doushu/lib/ziwei/types';
export function smallLimitBranch(yearBranch:number,gender:'male'|'female',age:number):number {
  if(!Number.isInteger(yearBranch)||yearBranch<0||yearBranch>11)throw new Error('出生年支须为子至亥');
  if(gender!=='male'&&gender!=='female')throw new Error('请选择性别');
  if(!Number.isInteger(age)||age<1)throw new Error('小限年龄须为正整数');
  // 《天机道》起小限表：寅午戌辰、申子辰戌、巳酉丑未、亥卯未丑；男顺女逆。
  const start=[10,7,4,1,10,7,4,1,10,7,4,1][yearBranch];
  return ((start+(gender==='male'?age-1:1-age))%12+12)%12;
}
export function yearPalaces(chart:ZiweiChart,year:number) {
  if(!Number.isInteger(year)||year<1900||year>2100)throw new Error('流年须为1900–2100年的整数');
  const age=year-chart.lunarInfo.lunarYear+1;
  return {age,smallBranch:age<1?null:smallLimitBranch(chart.lunarInfo.yearBranch,chart.birthInfo.gender,age),taiBranch:((year-4)%12+12)%12};
}
export function palaceAges(chart:ZiweiChart,branch:number):number[] {
  const first=Array.from({length:12},(_,i)=>i+1).find(age=>smallLimitBranch(chart.lunarInfo.yearBranch,chart.birthInfo.gender,age)===branch);
  if(first===undefined)throw new Error('宫位须为子至亥');
  return Array.from({length:10},(_,i)=>first+i*12);
}
