// 日期均为合成测试数据，不对应个人档案。
import { strict as assert } from 'node:assert';
import { smallLimitBranch, yearPalaces, palaceAges } from './year-palace';
import { makeChart, pillarContext } from './model';
import { fromPillars, annualGua, hexName } from './minggua';
const base={name:'',year:1994,month:7,day:15,hour:11,gender:'female' as const,calendar:'solar' as const,leap:false};
const chart=makeChart(base), yearly=yearPalaces(chart,2026);
assert.equal(yearly.age,33);
assert.equal(yearly.smallBranch,8);
assert.equal(chart.palaces.find(p=>p.branch===yearly.smallBranch)!.name,'命宫');
assert.equal(yearly.taiBranch,6);
assert.equal(chart.palaces.find(p=>p.branch===yearly.taiBranch)!.name,'夫妻');
const allAges=chart.palaces.flatMap(p=>{
  const ages=palaceAges(chart,p.branch);
  assert.equal(ages.length,10);
  for(const age of ages)assert.equal(smallLimitBranch(chart.lunarInfo.yearBranch,'female',age),p.branch);
  return ages;
});
assert.deepEqual(allAges.sort((a,b)=>a-b),Array.from({length:120},(_,i)=>i+1),'1至120虚岁各落入唯一宫位');
assert.ok(palaceAges(chart,yearly.smallBranch!).includes(yearly.age));
assert.throws(()=>palaceAges(chart,12),/宫位/);
const context=pillarContext(base);
assert.deepEqual(context.pillars,['甲戌','辛未','壬寅','辛亥']);
const minggua=fromPillars(context.pillars,base.gender,context.birthYear,base.hour,context.yangSeason);
assert.deepEqual([minggua.heavenSum,minggua.earthSum,minggua.heavenNumber,minggua.earthNumber],[14,54,4,4]);
assert.deepEqual(minggua.before,{code:54,line:3});
assert.deepEqual(minggua.after,{code:22,line:6});
assert.equal(hexName(annualGua(minggua,33).code),'离为火');
for(const [yearBranch,start] of [[0,10],[1,7],[2,4],[3,1],[4,10],[5,7],[6,4],[7,1],[8,10],[9,7],[10,4],[11,1]]) {
  assert.equal(smallLimitBranch(yearBranch,'male',1),start);
  assert.equal(smallLimitBranch(yearBranch,'female',1),start);
  assert.equal(smallLimitBranch(yearBranch,'male',2),(start+1)%12);
  assert.equal(smallLimitBranch(yearBranch,'female',2),(start+11)%12);
  assert.equal(smallLimitBranch(yearBranch,'female',13),start);
}
for(const [branch,male,female] of [[2,'辰巳午未申酉戌亥子丑寅卯','辰卯寅丑子亥戌酉申未午巳'],[0,'戌亥子丑寅卯辰巳午未申酉','戌酉申未午巳辰卯寅丑子亥'],[1,'未申酉戌亥子丑寅卯辰巳午','未午巳辰卯寅丑子亥戌酉申'],[3,'丑寅卯辰巳午未申酉戌亥子','丑子亥戌酉申未午巳辰卯寅']] as const) {
  for(let age=1;age<=12;age++) {
    assert.equal('子丑寅卯辰巳午未申酉戌亥'[smallLimitBranch(branch,'male',age)],male[age-1]);
    assert.equal('子丑寅卯辰巳午未申酉戌亥'[smallLimitBranch(branch,'female',age)],female[age-1]);
  }
}
const beforeNewYear=makeChart({...base,year:2004,month:1,day:1,hour:0});
assert.equal(yearPalaces(beforeNewYear,2026).age,24);
const springEdge={...base,year:2004,month:2,day:4,hour:1};
assert.equal(pillarContext(springEdge).birthYear,2003,'四柱立春前归2003');
assert.equal(yearPalaces(makeChart(springEdge),2026).age,23,'紫微已过春节，出生农历年为2004');
assert.throws(()=>smallLimitBranch(12,'male',1),/年支/);
assert.throws(()=>smallLimitBranch(0,'female',0),/年龄/);
console.log('流年小限与太岁区分测试通过：合成日期、宫内1–120虚岁、男女顺逆、农历虚岁');
