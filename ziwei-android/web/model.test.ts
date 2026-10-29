// 日期均为合成测试数据；交节日期用于验证历法边界。
import { strict as assert } from 'node:assert';
import { toBirthInfo, makeChart, pillarContext } from './model';
const input = { name: '测试', year: 2020, month: 4, day: 3, hour: 0, gender: 'male' as const, calendar: 'lunar' as const, leap: true };
assert.deepEqual(toBirthInfo(input), { name: '测试', year: 2020, month: 5, day: 25, hour: 0, gender: 'male' });
assert.throws(() => toBirthInfo({ ...input, year: 2021 }), /闰月|农历/);
assert.throws(() => toBirthInfo({ ...input, calendar: 'solar', month: 2, day: 30 }), /日期/);
assert.throws(() => toBirthInfo({ ...input, hour: 12 }), /时辰/);
const chart = makeChart({ ...input, year: 1979, month: 6, day: 30 });
assert.equal(chart.lunarInfo.lunarDay, 30);
assert.equal(chart.ziweiPos, 11);
console.log('Android 输入校验、农历换算、闰月三十测试通过');
const base = { ...input, calendar: 'solar' as const, leap:false, year:2004, month:2, day:4, hour:1 };
assert.equal(pillarContext(base).pillars[0], '癸未');
assert.equal(pillarContext({...base,hour:11,clock:'21:30'}).pillars[0], '甲申');
assert.throws(()=>toBirthInfo({...base,clock:'21:30'}),/时辰/);
const midnight={...base,year:2026,month:10,day:29,hour:0};
assert.equal(pillarContext({...midnight,clock:'00:30'}).pillars[2],pillarContext({...midnight,clock:'23:30'}).pillars[2]);
assert.notEqual(pillarContext({...midnight,clock:'00:30'}).pillars[3],pillarContext({...midnight,clock:'23:30'}).pillars[3]);
console.log('四柱立春边界与早晚子时测试通过');
const brightnessCase={...input,year:2020,month:1,day:1,hour:0,leap:false,calendar:'solar' as const};
const ziweiBrightness=(brightness:'ZZ'|'QS')=>makeChart({...brightnessCase,brightness}).palaces.flatMap(p=>p.stars).find(s=>s.name==='紫微')!.brightnessRaw;
assert.equal(ziweiBrightness('ZZ'),'陷');
assert.equal(ziweiBrightness('QS'),'得');
assert.equal(ziweiBrightness('ZZ'),'陷','切换亮度表不残留上一张表');
console.log('合成日期紫微亮度及表切换测试通过');
for(const hour of [0,1,4,10,11]) {
  const seal=(brightness:'DOC'|'ZZ')=>makeChart({...brightnessCase,hour,brightness}).palaces.flatMap(p=>p.stars).find(s=>s.name==='封诰')!;
  assert.equal(seal('DOC').brightnessRaw,'庙','封诰已核实的五个星宫补庙');
  assert.equal(seal('ZZ').brightnessRaw,undefined,'盘例补值不改动中州原表');
}
const yaoCase={...input,year:2020,month:2,day:1,leap:false};
const yao=(brightness:'DOC'|'ZZ'|'QS')=>makeChart({...yaoCase,brightness}).palaces.flatMap(p=>p.stars).find(s=>s.name==='天姚')!.brightnessRaw;
assert.equal(yao('DOC'),'庙','天姚寅按两份不同日期盘例为庙');
assert.equal(yao('ZZ'),'旺');
assert.equal(yao('QS'),'旺');
assert.equal(pillarContext({...base,hour:1,clock:'02:30'}).birthYear,2003);
assert.equal(pillarContext({...base,hour:11,clock:'21:30'}).birthYear,2004);
console.log('先后天卦与立春归年、同日交节前后年序核对通过');
