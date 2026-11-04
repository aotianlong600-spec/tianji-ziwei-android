// 合成日期；国内手动时制保留，全球当地钟表按明确指定的 IANA 时区换算。
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
  {longitude:undefined},{longitude:NaN},{longitude:Infinity},{longitude:-181},{longitude:181},
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

// 2020 年纽约冬令 UTC−5、夏令 UTC−4；经度接近−74°，当地平太阳时接近冬令钟表。
for (const [month,offset,beijing] of [[1,-300,'2020-01-15 01:00:00'],[7,-240,'2020-07-15 00:00:00']] as const) {
  const context=pillarContext({...base,year:2020,month,day:14,clock:'12:00',longitude:-74.006,clockBasis:'local',timeZone:'America/New_York'});
  assert.equal(context.conversion!.utcOffsetMinutes,offset);
  assert.equal(context.conversion!.offsetMinutes,480-offset);
  assert.equal(context.conversion!.beijingMoment,beijing);
  assert.equal(context.conversion!.timeZone,'America/New_York');
  assert.equal(context.conversion!.solarMoment.slice(0,10),`2020-${String(month).padStart(2,'0')}-14`);
  const sameInstant={...base,year:2020,month,day:15,clock:month===1?'01:00':'00:00',hour:month===1?1:0,trueSolar:false};
  const physical=pillarContext(sameInstant);
  assert.deepEqual(context.pillars.slice(0,2),physical.pillars.slice(0,2),'海外年/月柱仍以同一物理交节判定');
  assert.equal(context.yangSeason,physical.yangSeason);
  const beijingRecord={...sameInstant,trueSolar:true,longitude:-74.006,clockBasis:'beijing' as const,timeZone:'America/New_York'};
  const sameBirth=pillarContext(beijingRecord);
  assert.equal(sameBirth.conversion!.solarMoment,context.conversion!.solarMoment,'同一纽约出生瞬间不能因记录为北京时间而改变太阳日期');
  assert.equal(sameBirth.conversion!.placeOffsetMinutes,offset);
  assert.deepEqual(sameBirth.pillars,context.pillars);
  assert.deepEqual(makeChart(beijingRecord),makeChart({...beijingRecord,day:14,clock:'12:00',clockBasis:'local'}));
}
const newYorkFold={year:2020,month:11,day:1};
assert.throws(()=>convertSolarTime(newYorkFold,'01:30',-74,'local','America/New_York'),/两次|重复|较早|较晚/);
const foldEarly=convertSolarTime(newYorkFold,'01:30',-74,'local','America/New_York','earlier');
const foldLate=convertSolarTime(newYorkFold,'01:30',-74,'local','America/New_York','later');
assert.equal(foldEarly.conversion.utcOffsetMinutes,-240);
assert.equal(foldLate.conversion.utcOffsetMinutes,-300);
assert.equal(foldEarly.conversion.beijingMoment,'2020-11-01 13:30:00');
assert.equal(foldLate.conversion.beijingMoment,'2020-11-01 14:30:00');
assert.equal(foldEarly.conversion.solarMoment.slice(11,16),'00:50');
assert.equal(foldLate.conversion.solarMoment.slice(11,16),'01:50');
const foldInput={...base,year:2020,month:11,day:1,clock:'01:30',longitude:-74,clockBasis:'local' as const,timeZone:'America/New_York'};
assert.throws(()=>toBirthInfo(foldInput),/两次|较早|较晚/);
assert.equal(toBirthInfo({...foldInput,timeDisambiguation:'earlier'}).hour,0,'模型必须传递重复时间选择给换算器');
assert.equal(toBirthInfo({...foldInput,timeDisambiguation:'later'}).hour,1);
assert.throws(()=>convertSolarTime({year:2020,month:3,day:8},'02:30',-74,'local','America/New_York'),/不存在|跳时/);
assert.throws(()=>convertSolarTime({year:2011,month:12,day:30},'12:00',-171.75,'local','Pacific/Apia'),/不存在|跳时/,'整日跳过也不能静默归入相邻日期');

for (const [timeZone,longitude,date,clock,wantOffset,wantBeijing] of [
  ['Asia/Kolkata',77.2,{year:2020,month:1,day:1},'12:00',330,'2020-01-01 14:30:00'],
  ['Asia/Kathmandu',85.32,{year:2020,month:1,day:1},'12:00',345,'2020-01-01 14:15:00'],
  ['Australia/Lord_Howe',159.08,{year:2020,month:1,day:1},'12:00',660,'2020-01-01 09:00:00'],
  ['Australia/Lord_Howe',159.08,{year:2020,month:7,day:1},'12:00',630,'2020-07-01 09:30:00'],
  ['Europe/Paris',2.35,{year:1900,month:1,day:1},'12:00',9.35,'1900-01-01 19:50:39'],
] as const) {
  const result=convertSolarTime(date,clock,longitude,'local',timeZone);
  assert.equal(result.conversion.utcOffsetMinutes,wantOffset,'时区偏移不能取整为小时或分钟');
  assert.equal(result.conversion.beijingMoment,wantBeijing);
}
const lordHoweFold={year:2020,month:4,day:5};
const lordHoweEarly=convertSolarTime(lordHoweFold,'01:45',159.08,'local','Australia/Lord_Howe','earlier');
const lordHoweLate=convertSolarTime(lordHoweFold,'01:45',159.08,'local','Australia/Lord_Howe','later');
assert.equal(lordHoweLate.beijing.getTime()-lordHoweEarly.beijing.getTime(),1800000,'夏令回拨也可能只有半小时');
assert.throws(()=>convertSolarTime({year:2020,month:10,day:4},'02:15',159.08,'local','Australia/Lord_Howe'),/不存在|跳时/);

const apia=convertSolarTime({year:2020,month:1,day:2},'12:00',-171.75,'local','Pacific/Apia');
assert.equal(apia.conversion.utcOffsetMinutes,840);
assert.equal(apia.conversion.beijingMoment,'2020-01-02 06:00:00');
assert.equal(apia.conversion.solarMoment.slice(0,10),'2020-01-02','当地时制以最接近当地民用日期的一支解释太阳日期');
assert.equal(apia.conversion.dayShift,0);
assert.equal(apia.conversion.dateLineMinutes,1440);
assert.ok(apia.conversion.totalMinutes < -87 && apia.conversion.totalMinutes > -92);
const apiaInput={...base,year:2020,month:1,day:2,clock:'12:00',longitude:-171.75,clockBasis:'local' as const,timeZone:'Pacific/Apia'};
assert.deepEqual(toBirthInfo(apiaInput),{name:'测试',year:2020,month:1,day:2,hour:5,gender:'male'});
assert.deepEqual(makeChart(apiaInput),makeChart({...apiaInput,trueSolar:false,hour:5,clock:undefined}),'世界出生盘按对齐后的真太阳日期与时辰排盘');
const apiaMidnight=convertSolarTime({year:2020,month:1,day:2},'00:01',-171.75,'local','Pacific/Apia');
assert.equal(apiaMidnight.conversion.solarMoment.slice(0,10),'2020-01-01','日期线对齐后仍保留真实的午夜跨日');
assert.equal(apiaMidnight.conversion.dayShift,-1);
for (const longitude of [-180,180]) {
  const previous=convertSolarTime({year:2020,month:2,day:11},'00:01',longitude,'local','Pacific/Tarawa');
  const next=convertSolarTime({year:2020,month:11,day:3},'23:59',longitude,'local','Pacific/Tarawa');
  assert.equal(previous.conversion.solarMoment.slice(0,10),'2020-02-10');
  assert.equal(previous.conversion.dayShift,-1);
  assert.equal(next.conversion.solarMoment.slice(0,10),'2020-11-04');
  assert.equal(next.conversion.dayShift,1);
  assert.equal(previous.conversion.dateLineMinutes,longitude===-180?1440:0);
}
const manualApia=convertSolarTime({year:2020,month:1,day:2},'06:00',-171.75,'beijing','Pacific/Apia');
assert.equal(manualApia.conversion.solarMoment,apia.conversion.solarMoment,'同一阿皮亚出生瞬间不能因钟表记录口径不同而差一天');
assert.equal(manualApia.conversion.dateLineMinutes,1440);
assert.equal(manualApia.conversion.utcOffsetMinutes,480,'UTC偏移保留原记录采用的钟表口径');
assert.equal(manualApia.conversion.placeOffsetMinutes,840,'日期线按出生地在该物理瞬间的时区偏移选择');
assert.equal(manualApia.conversion.timeZone,undefined,'手动钟表口径不冒充当地钟表');
assert.equal(manualApia.conversion.birthplaceTimeZone,'Pacific/Apia');
const manualApiaInput={...apiaInput,clock:'06:00',clockBasis:'beijing' as const};
assert.deepEqual(toBirthInfo(manualApiaInput),toBirthInfo(apiaInput));
assert.deepEqual(pillarContext(manualApiaInput).pillars,pillarContext(apiaInput).pillars);
assert.deepEqual(makeChart(manualApiaInput),makeChart(apiaInput));
const westernMidnight=convertSolarTime({year:2020,month:2,day:11},'00:01',-74.006,'local','America/New_York');
assert.equal(westernMidnight.conversion.solarMoment.slice(0,10),'2020-02-10');
assert.equal(westernMidnight.conversion.dayShift,-1);
const midnightUtc=convertSolarTime({year:2020,month:1,day:1},'00:00',0,'local','UTC');
assert.equal(midnightUtc.conversion.beijingMoment,'2020-01-01 08:00:00','午夜格式化为24时不得误进一天');

for (const timeZone of [undefined,'','Invalid/Zone']) {
  assert.throws(()=>convertSolarTime({year:2020,month:1,day:1},'12:00',-74,'local',timeZone),/时区|不支持/);
}
for (const timeZone of ['','Invalid/Zone']) assert.throws(()=>convertSolarTime({year:2020,month:1,day:1},'12:00',-74,'beijing',timeZone),/时区|不支持/,'手动钟表也不能静默忽略给定的无效出生地时区');
assert.throws(()=>convertSolarTime(newYorkFold,'01:30',-74,'local','America/New_York','auto' as 'earlier'),/较早|较晚|选择/);
for (const longitude of [-180,0,180]) assert.doesNotThrow(()=>convertSolarTime({year:2020,month:1,day:2},'12:00',longitude));

// 旧 Intl 忽略 hourCycle 选项；仍须明确使用 24 小时制，避免把下午误识别为上午。
const NativeDateTimeFormat=Intl.DateTimeFormat;
const LegacyDateTimeFormat=function(locales?:Intl.LocalesArgument,options?:Intl.DateTimeFormatOptions) {
  const {hourCycle,...legacyOptions}=options||{};
  return new NativeDateTimeFormat(locales,legacyOptions);
};
LegacyDateTimeFormat.prototype=NativeDateTimeFormat.prototype;
Object.setPrototypeOf(LegacyDateTimeFormat,NativeDateTimeFormat);
try {
  Intl.DateTimeFormat=LegacyDateTimeFormat as unknown as typeof Intl.DateTimeFormat;
  const legacy=convertSolarTime({year:2020,month:1,day:14},'01:30',-74,'local','America/New_York');
  assert.equal(legacy.conversion.utcOffsetMinutes,-300);
  assert.equal(legacy.conversion.beijingMoment,'2020-01-14 14:30:00');
  const legacyMidnight=convertSolarTime({year:2020,month:1,day:1},'00:00',0,'local','UTC');
  assert.equal(legacyMidnight.conversion.beijingMoment,'2020-01-01 08:00:00');
} finally {
  Intl.DateTimeFormat=NativeDateTimeFormat;
}
console.log('全球时区：冬夏令、重复/不存在时间、分数偏移及国际日期线测试通过');
