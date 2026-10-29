import { strict as assert } from 'node:assert';
import { annualGua, buildPeriods, fromPillars, hexName, lineName, monthGuas, textbookExample } from './minggua';
import type { Gua } from './minggua';

const example = textbookExample();
assert.deepEqual(example.before, { code: 50, line: 2 });
assert.deepEqual(example.after, { code: 6, line: 5 });
assert.deepEqual(example.periods.map(p => [p.phase, p.line, p.startAge, p.endAge]), [
  ['先天', 2, 1, 9], ['先天', 3, 10, 15], ['先天', 4, 16, 21],
  ['先天', 5, 22, 30], ['先天', 6, 31, 39], ['先天', 1, 40, 45],
  ['后天', 5, 46, 51], ['后天', 6, 52, 57], ['后天', 1, 58, 63],
  ['后天', 2, 64, 72], ['后天', 3, 73, 81], ['后天', 4, 82, 87],
]);
assert.deepEqual(Array.from({ length: 15 }, (_, i) => hexName(annualGua(example, i + 1).code)), [
  '风水涣', '山水蒙', '山地剥', '艮为山', '火山旅', '天山遯', '泽山咸', '泽火革', '泽天夬',
  '巽为风', '天风姤', '火风鼎', '雷风恒', '雷天大壮', '雷火丰',
]);
assert.deepEqual(Array.from({ length: 15 }, (_, i) => annualGua(example, i + 1).line), [
  2, 5, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6, 1, 2,
]);
assert.equal(annualGua(example, 2).stemBranch, '乙未');
assert.deepEqual([annualGua(example, 46).code, annualGua(example, 46).line], [22, 5]);
assert.equal(annualGua(example, 87).year, 2040);
assert.throws(() => annualGua(example, 0), /年龄/);
assert.throws(() => annualGua(example, 88), /年龄/);
const yinYearStart = { ...example, birthYear: 1955 };
assert.equal(annualGua(yinYearStart, 1).code, 48, '阳爻大运首逢阴年，先翻本爻');

const months = monthGuas({ code: 49, line: 5 });
assert.deepEqual(months.map(g => hexName(g.code)), [
  '水雷屯', '水火既济', '水地比', '泽地萃', '坎为水', '地水师',
  '水风井', '巽为风', '泽风大过', '泽天夬', '雷风恒', '雷山小过',
]);
assert.deepEqual(months.map(g => g.line), [6, 3, 1, 4, 2, 5, 3, 6, 4, 1, 5, 2]);
assert.deepEqual(months.map(g => g.month), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

// 这些四柱仅检验书中数表和爻位，不宣称为真实历法时刻。
const pureQian: [string, string, string, string] = ['己酉', '戊辰', '戊寅', '甲寅'];
const pureKun: [string, string, string, string] = ['甲子', '甲子', '甲子', '癸酉'];
const forward = [1, 2, 3, 1, 2, 3, 4, 5, 6, 4, 5, 6];
const reversed = [6, 5, 4, 6, 5, 4, 3, 2, 1, 3, 2, 1];
for (const [pillars, gender, yangSeason, code, wanted] of [
  [pureQian, 'male', true, 63, forward], [pureQian, 'male', false, 63, forward],
  [pureQian, 'female', true, 63, reversed], [pureQian, 'female', false, 63, forward],
  [pureKun, 'female', true, 0, forward], [pureKun, 'female', false, 0, forward],
  [pureKun, 'male', true, 0, forward], [pureKun, 'male', false, 0, reversed],
] as const) {
  for (let hour = 0; hour < 12; hour++) {
    assert.deepEqual(fromPillars([...pillars], gender, 1954, hour, yangSeason).before,
      { code, line: wanted[hour] }, `${hexName(code)} ${gender} ${yangSeason} 时${hour}`);
  }
}

for (const [pillars, beforeCode, yinFive, yangFive, yinSix, yangSix] of [
  [['甲子', '甲子', '甲子', '癸巳'], 18, 2, 8, 22, 49],
  [['甲子', '甲子', '己巳', '己酉'], 17, 1, 32, 14, 52],
  [['甲子', '甲子', '甲子', '戊午'], 20, 4, 16, 38, 50],
] as const) {
  for (const [hour, yangSeason, afterCode, afterLine] of [
    [1, false, yinFive, 5], [1, true, yangFive, 2],
    [9, false, yinSix, 3], [9, true, yangSix, 6],
  ] as const) {
    const m = fromPillars([...pillars], 'male', 1954, hour, yangSeason);
    assert.deepEqual(m.before, { code: beforeCode, line: hour === 1 ? 5 : 6 });
    assert.deepEqual(m.after, { code: afterCode, line: afterLine }, `${hexName(beforeCode)} 特例`);
  }
}

const ordinary = fromPillars(['甲子', '甲子', '甲子', '丁酉'], 'male', 1954, 0, true);
assert.deepEqual(ordinary.before, { code: 42, line: 2 });
assert.deepEqual(ordinary.after, { code: 5, line: 5 });
const calculated = fromPillars(['甲午', '丙寅', '戊子', '乙卯'], 'male', 1954, 3, true);
assert.deepEqual([calculated.heavenSum, calculated.earthSum, calculated.heavenNumber, calculated.earthNumber], [15, 40, 4, 1]);
assert.deepEqual(calculated.before, { code: 50, line: 2 }, '按本项目约定天5按4，得风水涣九二');
assert.deepEqual(calculated.after, { code: 6, line: 5 });
assert(calculated.notes.some(n => n.includes('天数5按4')));
assert(calculated.notes.some(n => n.includes('河洛理数')));
for (const [pillars, heavenSum, earthSum, heavenNumber, earthNumber] of [
  [['甲子', '甲子', '丁卯', '庚辰'], 20, 42, 2, 2],
  [['甲子', '乙丑', '己巳', '己酉'], 40, 30, 4, 3],
  [['乙丑', '壬申', '己酉', '己酉'], 50, 30, 4, 3],
  [['丁卯', '己巳', '己巳', '己酉'], 60, 16, 4, 6],
  [['甲子', '己巳', '己巳', '癸巳'], 40, 20, 4, 2],
  [['甲子', '甲子', '丙戌', '丙戌'], 12, 60, 2, 3],
] as const) {
  const m = fromPillars([...pillars], 'male', 1954, 0, true);
  assert.deepEqual([m.heavenSum, m.earthSum, m.heavenNumber, m.earthNumber], [heavenSum, earthSum, heavenNumber, earthNumber], '单次扣基数、零尾及天5按4边界');
}
assert(fromPillars(pureKun, 'male', 2134, 0, true).notes.some(n => n.includes('180')));
assert.throws(() => fromPillars(['甲子', '甲子', '甲子', '甲丑'], 'male', 1954, 0, true), /干支/);
assert.throws(() => fromPillars(pureQian, 'male', 1954, 12, true), /时辰/);
assert.throws(() => monthGuas({ code: 64, line: 1 }), /卦/);
assert.throws(() => buildPeriods({ code: 0, line: 0 }, { code: 0, line: 1 }), /爻/);
assert.equal(lineName(50, 2), '九二');
assert.equal(lineName(0, 1), '初六');
assert.equal(lineName(63, 6), '上九');
const unchanged: Gua = { code: 49, line: 5 };
monthGuas(unchanged);
assert.deepEqual(unchanged, { code: 49, line: 5 });
console.log('命卦算法测试通过：原书1–15岁、12个月、96种纯卦时辰、12种三至尊及输入边界');
