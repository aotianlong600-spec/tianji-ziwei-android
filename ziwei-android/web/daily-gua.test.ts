import { strict as assert } from 'node:assert';
import { dailyGua, dailyFromDate, solarMonthStart, dailySolarDate, dailyCalendarDates, type DailyCalendar } from './daily-gua';
import { hexName, textbookExample } from './minggua';

const monthly={code:16,line:1};
const groupCodes=[18,20,24,0,48];
const groupNames=['坎为水','水山蹇','泽地萃','坤为地','风地观'];
for(let day=1;day<=30;day++) {
  const result=dailyGua(monthly,day);
  const group=Math.floor((day-1)/6);
  assert.deepEqual(result,{code:groupCodes[group],line:(day-1)%6+1,changeLine:group+2,group:group+1});
  assert.equal(hexName(result.code),groupNames[group]);
}
assert.deepEqual(monthly,{code:16,line:1},'六日组不累积改变原月卦');
for(const [day,code,name,changeLine] of [[1,17,'水雷屯',3],[7,29,'泽火革',4],[13,5,'地火明夷',5]] as const) {
  const result=dailyGua({code:21,line:2},day);
  assert.equal(result.code,code);
  assert.equal(hexName(result.code),name);
  assert.equal(result.line,1);
  assert.equal(result.changeLine,changeLine);
}
assert.deepEqual(dailyGua({code:63,line:6},1),{code:62,line:1,changeLine:1,group:1});
assert.deepEqual(dailyGua({code:63,line:6},30),{code:47,line:6,changeLine:5,group:5});
for(const day of [0,31,-1,1.5,NaN,Infinity])assert.throws(()=>dailyGua(monthly,day),/1.*30/);
for(const invalid of [{code:64,line:1},{code:-1,line:1},{code:1.5,line:1},{code:16,line:0},{code:16,line:7}])assert.throws(()=>dailyGua(invalid,1),/月卦/);

assert.equal(solarMonthStart(2026,1),'2026-02-04 04:02:08');
assert.equal(solarMonthStart(2026,3),'2026-04-05 02:40:00');
assert.equal(solarMonthStart(2026,11),'2026-12-07 10:52:32','大雪取真实2026年，不能误取表中上一年项');
assert.equal(solarMonthStart(2026,12),'2027-01-05 22:09:58','小寒属于立春年的次年一月');
for(const month of [0,13,1.5,NaN])assert.throws(()=>solarMonthStart(2026,month),/月/);
assert.throws(()=>solarMonthStart(2026.5,1),/年/);

const data=textbookExample();
const beforeSpring=dailyFromDate(data,'2026-02-04','04:02:07');
assert.deepEqual([beforeSpring.flowYear,beforeSpring.age,beforeSpring.month,beforeSpring.term],[2025,72,12,'小寒']);
const spring=dailyFromDate(data,'2026-02-04','04:02:08');
assert.deepEqual([spring.dateTime,spring.flowYear,spring.age,spring.month,spring.dayIndex],['2026-02-04 04:02:08',2026,73,1,1]);
assert.equal(spring.monthStart,'2026-02-04 04:02:08');
assert.equal(spring.monthEnd,'2026-03-05 21:59:00');
assert.equal(spring.annual.year,spring.flowYear);
assert.equal(spring.monthly.month,spring.month);
assert.equal(spring.intervalStart,'2026-02-04 04:02:08');
assert.equal(spring.intervalEnd,'2026-02-05 04:02:08');
assert.equal(spring.pendingReason,'');
assert.ok(spring.daily);
assert.equal(dailyFromDate(data,'2026-02-04','04:02:09').dayIndex,1);
assert.equal(dailyFromDate(data,'2026-02-04','04:02').flowYear,2025,'分钟输入不能提前跨交节秒');
assert.equal(dailyFromDate(data,'2026-02-05','04:02:07').dayIndex,1);
assert.equal(dailyFromDate(data,'2026-02-05','04:02:08').dayIndex,2,'卦日按交节钟分换，不按零点');
const beforeMonth=dailyFromDate(data,'2026-03-05','21:58:59');
assert.equal(beforeMonth.month,1);
assert.equal(beforeMonth.intervalEnd,'2026-03-05 21:59:00','最后一个卦日截到新节月界');
const atMonth=dailyFromDate(data,'2026-03-05','21:59:00');
assert.deepEqual([atMonth.month,atMonth.term,atMonth.dayIndex],[2,'惊蛰',1]);

const beforeMinorCold=dailyFromDate(data,'2027-01-05','22:09:57');
assert.deepEqual([beforeMinorCold.flowYear,beforeMinorCold.month,beforeMinorCold.term],[2026,11,'大雪']);
const minorCold=dailyFromDate(data,'2027-01-05','22:09:58');
assert.deepEqual([minorCold.flowYear,minorCold.age,minorCold.month,minorCold.term,minorCold.dayIndex],[2026,73,12,'小寒',1]);
assert.equal(minorCold.monthEnd,'2027-02-04 09:46:18');
assert.equal(dailyFromDate(data,'2027-02-04','09:46:17').flowYear,2026);
assert.equal(dailyFromDate(data,'2027-02-04','09:46:18').flowYear,2027);

const day30=dailyFromDate(data,'2026-07-05','23:48:20');
assert.equal(day30.dayIndex,30);
assert.ok(day30.daily);
const day31=dailyFromDate(data,'2026-07-05','23:48:21');
assert.deepEqual([day31.month,day31.term,day31.dayIndex,day31.daily],[5,'芒种',31,null]);
assert.ok(day31.pendingReason.includes('31'));
assert.equal(day31.intervalStart,'2026-07-05 23:48:21');
const beforeHeat=dailyFromDate(data,'2026-07-07','09:56:56');
assert.deepEqual([beforeHeat.dayIndex,beforeHeat.daily],[32,null]);
assert.equal(beforeHeat.intervalEnd,'2026-07-07 09:56:57');
const heat=dailyFromDate(data,'2026-07-07','09:56:57');
assert.deepEqual([heat.month,heat.term,heat.dayIndex],[6,'小暑',1]);
assert.ok(heat.daily);

for(const date of ['1899-12-31','2201-01-01','2026-02-29','1900-02-29','2026-04-31','2026-01-00','2026-13-01','2026-2-04',' 2026-02-04'])assert.throws(()=>dailyFromDate(data,date,'12:00'),/日期/);
for(const clock of ['', '24:00','23:60','12:00:60','7:00','00:00:00Z','00:00:00.000','12:00 '])assert.throws(()=>dailyFromDate(data,'2026-01-01',clock),/时间/);
assert.equal(dailyFromDate(data,'2000-02-29','12:00').dateTime,'2000-02-29 12:00:00');
assert.throws(()=>dailyFromDate(data,'2050-02-05','12:00'),/年龄超出/);
assert.throws(()=>dailyFromDate(data,'1953-12-01','12:00'),/年龄/);
assert.equal(dailyFromDate({...data,birthYear:1864},'1900-01-01','00:00').flowYear,1899);
assert.equal(dailyFromDate({...data,birthYear:2134},'2200-12-31','23:59:59').flowYear,2200);

const originalTimezone=process.env.TZ;
try {
  process.env.TZ='America/Los_Angeles';
  const west=dailyFromDate(data,'2026-02-04','04:02:08');
  process.env.TZ='Pacific/Kiritimati';
  assert.deepEqual(dailyFromDate(data,'2026-02-04','04:02:08'),west,'北京时间墙钟不受运行机时区影响');
} finally {
  if(originalTimezone===undefined)delete process.env.TZ;
  else process.env.TZ=originalTimezone;
}
console.log('流日卦测试通过：独立月卦组、交节秒、24小时日界、跨年小寒、31日起待核及输入边界');

assert.equal(dailySolarDate('lunar','2020-04-03',true),'2020-05-25','农历闰月按真实日历换算，不作下月安星处理');
assert.equal(dailySolarDate('lunar','2020-04-03',false),'2020-04-25');
assert.equal(dailySolarDate('solar','2020-05-25',true),'2020-05-25','公历输入忽略保留的农历闰月标记');
assert.equal(dailySolarDate('lunar','2020-04-30',false),'2020-05-22','正常四月允许三十日');
assert.equal(dailySolarDate('lunar','2020-04-29',true),'2020-06-20','闰四月末日为廿九');
assert.deepEqual(dailyCalendarDates('2020-05-25'),{solar:'2020-05-25',lunar:'2020-04-03',leap:true,lunarLabel:'2020年闰4月3日'});
assert.deepEqual(dailyCalendarDates('2020-04-25'),{solar:'2020-04-25',lunar:'2020-04-03',leap:false,lunarLabel:'2020年4月3日'});
for(const solar of ['1900-01-01','2000-02-29','2020-04-25','2020-05-25','2026-12-31','2051-01-01','2200-12-31']) {
  const converted=dailyCalendarDates(solar);
  assert.equal(dailySolarDate('lunar',converted.lunar,converted.leap),solar,'农历公历往返保持同一天');
  assert.equal(dailySolarDate('solar',solar),solar);
}
assert.equal(dailySolarDate('lunar','1899-12-01'),'1900-01-01');
assert.equal(dailyCalendarDates('1900-01-01').lunar,'1899-12-01');
assert.equal(dailyCalendarDates('2200-12-31').lunar,'2200-11-25');
for(const [date,leap] of [['2021-04-03',true],['2020-04-30',true],['2020-01-30',false],['1899-11-30',false],['2200-12-01',false],['2020-00-01',false],['2020-13-01',false],['2020-04-00',false],['2020-04-31',false],['1898-12-01',false],['2201-01-01',false],['2020-4-03',false],['2020-04-3',false],['2020-04-03 ',false]] as const) {
  assert.throws(()=>dailySolarDate('lunar',date,leap),/农历|公历|日期/);
}
for(const invalid of ['2026-02-29','1899-12-31','2201-01-01','2026-13-01','2026-01-00','2026-2-04']) {
  assert.throws(()=>dailySolarDate('solar',invalid),/公历|日期/);
  assert.throws(()=>dailyCalendarDates(invalid),/公历|日期/);
}
assert.throws(()=>dailySolarDate('invalid' as DailyCalendar,'2020-04-03'),/历法/);
const fromLunar=dailySolarDate('lunar','2020-04-03',true);
assert.deepEqual(dailyFromDate(data,fromLunar,'23:48:21'),dailyFromDate(data,'2020-05-25','23:48:21'),'历法显示切换不改变北京时间及流日结果');
console.log('流日公农历换算测试通过：闰月、29/30日、往返、1900与2200边界、同一北京时间同一卦');
