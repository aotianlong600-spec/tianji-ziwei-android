// 合成日期；真太阳时不推断历史时区，出生钟表口径由输入明确指定。
import { strict as assert } from 'node:assert';
import { Solar } from 'lunar-javascript';
import { actualLunarLabel, makeChart, pillarContext, toBirthInfo, type BirthInput } from './model';
import { convertSolarTime } from './solar-time';

const base: BirthInput = { name:'测试',year:2020,month:2,day:11,hour:6,gender:'male',calendar:'solar',leap:false,clock:'12:00',trueSolar:true,longitude:120 };
const noon=pillarContext(base);
assert.equal(noon.clock.slice(0,5),'11:45','120°E 仍须加上负均时差，不能只做经度平太阳时');
assert.ok(noon.conversion!.equationMinutes < -14 && noon.conversion!.equationMinutes > -15);
assert.equal(noon.conversion!.originalMoment,'2020-02-11 12:00:00');
assert.equal(noon.conversion!.beijingMoment,'2020-02-11 12:00:00');
assert.equal(noon.conversion!.longitudeMinutes,0);
assert.equal(noon.estimatedTime,false);
assert.equal(noon.hour,6);

for (const [longitude,want,delta] of [[75,'08:45',-180],[135,'12:45',60]] as const) {
  const context=pillarContext({...base,longitude});
  assert.equal(context.clock.slice(0,5),want);
  assert.equal(context.conversion!.longitudeMinutes,delta);
  assert.equal(context.conversion!.dayShift,0);
}
for (const [clockBasis,want,beijing,total] of [['daylight','10:45','11:00',-74],['xinjiang','13:45','14:00',105]] as const) {
  const context=pillarContext({...base,clockBasis});
  assert.equal(context.clock.slice(0,5),want);
  assert.equal(context.conversion!.beijingMoment.slice(11,16),beijing);
  assert.equal(Math.trunc(context.conversion!.totalMinutes),total);
  assert.equal(context.conversion!.clockBasis,clockBasis);
}

// 负均时差使 2020 闰日与跨年保留在绝对日期上。
for (const [year,month,day,want] of [[2020,3,1,'2020-02-29'],[2021,1,1,'2020-12-31'],[2020,5,1,'2020-04-30']] as const) {
  const context=pillarContext({...base,year,month,day,hour:0,clock:'00:01',longitude:75});
  assert.equal(context.conversion!.solarMoment.slice(0,10),want);
  assert.equal(context.conversion!.dayShift,-1);
  const corrected=toBirthInfo({...base,year,month,day,hour:0,clock:'00:01',longitude:75});
  assert.equal(`${corrected.year}-${String(corrected.month).padStart(2,'0')}-${String(corrected.day).padStart(2,'0')}`,want);
}
const east=pillarContext({...base,year:2020,month:11,day:3,hour:0,clock:'23:30',longitude:135});
assert.equal(east.conversion!.solarMoment.slice(0,10),'2020-11-04');
assert.equal(east.conversion!.dayShift,1);
assert.equal(east.clock.slice(0,5),'00:46');
assert.equal(east.hour,0);

const west={...base,year:2020,month:3,day:1,hour:0,clock:'00:01',longitude:75};
const converted=toBirthInfo(west);
assert.deepEqual(converted,{name:'测试',year:2020,month:2,day:29,hour:10,gender:'male'});
const manual={...west,...converted,trueSolar:false,clock:undefined,calendar:'solar' as const};
assert.deepEqual(makeChart(west),makeChart(manual),'排盘须使用修正后的日期与时辰');
assert.equal(actualLunarLabel(west),actualLunarLabel(manual));
assert.deepEqual(pillarContext(west).pillars.slice(2),pillarContext({...manual,clock:'20:48'}).pillars.slice(2));

for (const invalid of [
  {clock:undefined},{clock:''},{clock:'24:00'},{clock:'12:00:00'},
  {longitude:undefined},{longitude:NaN},{longitude:Infinity},{longitude:72},{longitude:137},
  {clockBasis:'auto'},
]) assert.throws(()=>toBirthInfo({...base,...invalid} as BirthInput),/时间|经度|钟表/);
assert.throws(()=>toBirthInfo({...base,year:1900,month:1,day:1,hour:0,clock:'00:01',longitude:75}),/范围|1900/);
assert.doesNotThrow(()=>toBirthInfo({...base,hour:0}),'启用真太阳时时准确钟表输入优先于旧时辰字段');

// 不把 12:59:xx 四舍五入成 13:00，避免误跨未时。
const nearBranch=pillarContext({...base,longitude:123.5,clock:'13:00',hour:7});
assert.equal(nearBranch.clock.slice(0,5),'12:59');
assert.equal(nearBranch.hour,6);

// 交节按物理瞬间比较北京时间，不能把真太阳时拿去与北京时间交节表比较。
const terms=Solar.fromYmd(2004,6,1).getLunar().getJieQiTable();
for (const [term,month,day,clock,before] of [
  ['立春',2,4,'19:55',true],['立春',2,4,'19:57',false],
  ['夏至',6,21,'08:56',true],['夏至',6,21,'08:58',false],
  ['DONG_ZHI',12,21,'20:41',true],['DONG_ZHI',12,21,'20:43',false],
] as const) {
  const stamp=`2004-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')} ${clock}:00`;
  assert.equal(stamp<terms[term].toYmdHms(),before,'手工边界样例位于交节前后');
  const civil={...base,year:2004,month,day,clock,hour:Math.floor((Number(clock.slice(0,2))+1)/2)%12,trueSolar:false};
  const physical=pillarContext(civil);
  for (const longitude of [75,135]) {
    const apparent=pillarContext({...civil,trueSolar:true,longitude});
    assert.deepEqual(apparent.pillars.slice(0,2),physical.pillars.slice(0,2),`${term}前后年/月柱保持物理交节`);
    assert.equal(apparent.birthYear,physical.birthYear);
    assert.equal(apparent.yangSeason,physical.yangSeason);
  }
}
const beforeSpring=pillarContext({...base,year:2004,month:2,day:4,hour:10,clock:'19:55',longitude:135});
assert.equal(beforeSpring.pillars[0],'癸未');
assert.equal(beforeSpring.birthYear,2003);
const newYearXinjiang=pillarContext({...base,year:2020,month:12,day:31,clock:'23:30',hour:0,clockBasis:'xinjiang',longitude:75});
assert.equal(newYearXinjiang.conversion!.beijingMoment.slice(0,10),'2021-01-01');
assert.equal(newYearXinjiang.birthYear,2020,'四柱归年按物理北京年及年支推导');
for (const date of [
  {year:2020,month:2,day:30},{year:2021,month:2,day:29},
  {year:2020,month:13,day:1},{year:2020,month:1,day:0},
  {year:NaN,month:1,day:1},{year:2020,month:Infinity,day:1},{year:2020,month:1,day:1.5},
]) assert.throws(()=>convertSolarTime(date,'12:00',120),/公历|日期/,'独立换算入口禁止日期静默滚动');
for (const trueSolar of ['false','true',0,1,null]) {
  assert.throws(()=>toBirthInfo({...base,trueSolar} as unknown as BirthInput),/真太阳时/,'档案开关必须是布尔值');
}
// 香港天文台：天文台经度 114°10′27.6″E，经度时差为 -23 分 18.16 秒。
// https://www.hko.gov.hk/en/gts/astron2026/files/HKO_almanac_2026.pdf
const hongKong=convertSolarTime({year:2020,month:2,day:11},'12:00',114+10/60+27.6/3600);
assert.ok(Math.abs(hongKong.conversion.longitudeMinutes*60-(-1398.16))<1e-8);
console.log('真太阳时均时差、钟表口径、跨日与交节边界测试通过');
