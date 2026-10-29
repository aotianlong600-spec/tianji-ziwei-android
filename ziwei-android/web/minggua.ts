export interface Gua { code: number; line: number }
export interface Period extends Gua { phase: '先天' | '后天'; startAge: number; endAge: number }
export interface Minggua {
  pillars: [string, string, string, string];
  heavenSum: number; earthSum: number; heavenNumber: number; earthNumber: number;
  before: Gua; after: Gua; periods: Period[]; birthYear: number; notes: string[];
}

const stems = '甲乙丙丁戊己庚辛壬癸';
const branches = '子丑寅卯辰巳午未申酉戌亥';
const stemNumbers = [6, 2, 8, 7, 1, 9, 3, 4, 6, 2];
const branchNumbers = [[1, 6], [5, 10], [3, 8], [3, 8], [5, 10], [2, 7], [2, 7], [5, 10], [4, 9], [4, 9], [5, 10], [1, 6]];
// 每行依下卦坤、震、坎、兑、艮、离、巽、乾排序；行号为上卦。
const hexNames = [
  ['坤为地', '地雷复', '地水师', '地泽临', '地山谦', '地火明夷', '地风升', '地天泰'],
  ['雷地豫', '震为雷', '雷水解', '雷泽归妹', '雷山小过', '雷火丰', '雷风恒', '雷天大壮'],
  ['水地比', '水雷屯', '坎为水', '水泽节', '水山蹇', '水火既济', '水风井', '水天需'],
  ['泽地萃', '泽雷随', '泽水困', '兑为泽', '泽山咸', '泽火革', '泽风大过', '泽天夬'],
  ['山地剥', '山雷颐', '山水蒙', '山泽损', '艮为山', '山火贲', '山风蛊', '山天大畜'],
  ['火地晋', '火雷噬嗑', '火水未济', '火泽睽', '火山旅', '离为火', '火风鼎', '火天大有'],
  ['风地观', '风雷益', '风水涣', '风泽中孚', '风山渐', '风火家人', '巽为风', '风天小畜'],
  ['天地否', '天雷无妄', '天水讼', '天泽履', '天山遯', '天火同人', '天风姤', '乾为天'],
];
const notes = [
  '依据《天机道》书44–55页（PDF48–59页）的数表、纯乾纯坤与三至尊图。',
  '天数超过25、地数超过30时仅扣一次基数；零尾取十位的细则补参《河洛理数》“遇十不用例”，原书此处未完整列明。',
  '按本项目约定规则，天数5按4算、取巽；地数5仍按原书三元与性别寄宫。',
  '命卦以四柱年柱为节点：立春前出生归上一干支年，该年起一岁；年份卡片与卦年序均按此起算。紫微小限另按农历出生年计算虚岁。',
  '流年按各大运原始命卦重起；阳爻首年看年阴阳，第二年取应爻、第三年回本爻，再逐爻顺进。以本书例图为主，并参《三才发秘》“小象阳爻九年运行例”。',
  '流月按单月从年动爻进一位逐爻变、双月取对应单月的应爻变；原书只完整示范益卦五爻，阴元堂沿此法外推，未有完整原例核验。',
  '元堂图的讼卦四爻重复印“卯”、大有上爻多印“丑”，本实现按同极性爻由下向上计时的其余图例校正。',
];
const mod = (n: number, d: number) => ((n % d) + d) % d;
const nextLine = (line: number, steps = 1) => mod(line - 1 + steps, 6) + 1;
const opposite = (line: number) => nextLine(line, 3);
const isYang = (code: number, line: number) => !!(code & (1 << (line - 1)));
const flip = (code: number, line: number) => code ^ (1 << (line - 1));

function checkGua({ code, line }: Gua): void {
  if (!Number.isInteger(code) || code < 0 || code > 63) throw new Error('卦码须为0至63');
  if (!Number.isInteger(line) || line < 1 || line > 6) throw new Error('爻位须为1至6');
}
export function hexName(code: number): string {
  checkGua({ code, line: 1 });
  return hexNames[code >> 3][code & 7];
}
export function lineName(code: number, line: number): string {
  checkGua({ code, line });
  const value = isYang(code, line) ? '九' : '六';
  return line === 1 ? `初${value}` : line === 6 ? `上${value}` : `${value}${'一二三四五六'[line - 1]}`;
}

function reducedNumber(sum: number, base: number): number {
  const remainder = sum > base ? sum - base : sum;
  return remainder % 10 || Math.floor(remainder / 10);
}
function yuanTang(code: number, hour: number, gender: 'male' | 'female', yangSeason: boolean): number {
  if (code === 63 || code === 0) {
    const reverse = code === 63 ? gender === 'female' && yangSeason : gender === 'male' && !yangSeason;
    return (reverse ? [6, 5, 4, 6, 5, 4, 3, 2, 1, 3, 2, 1] : [1, 2, 3, 1, 2, 3, 4, 5, 6, 4, 5, 6])[hour];
  }
  const wanted = hour < 6;
  const same = [1, 2, 3, 4, 5, 6].filter(line => isYang(code, line) === wanted);
  const other = [1, 2, 3, 4, 5, 6].filter(line => isYang(code, line) !== wanted);
  return [...same, ...(same.length <= 3 ? same : []), ...other][hour % 6];
}
function laterGua(before: Gua, yangSeason: boolean): Gua {
  const special: Record<number, [number, number, number, number]> = {
    18: [2, 8, 22, 49], 17: [1, 32, 14, 52], 20: [4, 16, 38, 50],
  };
  if (special[before.code] && (before.line === 5 || before.line === 6)) {
    const index = (before.line === 6 ? 2 : 0) + (yangSeason ? 1 : 0);
    return { code: special[before.code][index], line: before.line === 5 ? (yangSeason ? 2 : 5) : (yangSeason ? 6 : 3) };
  }
  const changed = flip(before.code, before.line);
  return { code: ((changed & 7) << 3) | (changed >> 3), line: opposite(before.line) };
}
export function fromPillars(pillars: [string, string, string, string], gender: 'male' | 'female', birthYear: number, hour: number, yangSeason: boolean): Minggua {
  if (pillars.length !== 4 || pillars.some(p => p.length !== 2 || !stems.includes(p[0]) || !branches.includes(p[1]) || stems.indexOf(p[0]) % 2 !== branches.indexOf(p[1]) % 2)) throw new Error('四柱须为四组有效干支');
  if (gender !== 'male' && gender !== 'female') throw new Error('性别须为男或女');
  if (!Number.isInteger(birthYear) || birthYear < 1) throw new Error('出生年份须为正整数');
  if (!Number.isInteger(hour) || hour < 0 || hour > 11) throw new Error('时辰须为子至亥的0至11');
  if (typeof yangSeason !== 'boolean') throw new Error('请指定出生时处于阳令或阴令');
  let heavenSum = 0, earthSum = 0;
  for (const pillar of pillars) {
    for (const value of [stemNumbers[stems.indexOf(pillar[0])], ...branchNumbers[branches.indexOf(pillar[1])]]) {
      if (value % 2) heavenSum += value;
      else earthSum += value;
    }
  }
  const rawHeavenNumber = reducedNumber(heavenSum, 25);
  const heavenNumber = rawHeavenNumber === 5 ? 4 : rawHeavenNumber, earthNumber = reducedNumber(earthSum, 30);
  const yangYear = branches.indexOf(pillars[0][1]) % 2 === 0;
  const heavenOnTop = (gender === 'male') === yangYear;
  const eraYear = 1864 + mod(birthYear - 1864, 180);
  const five = eraYear < 1924 ? (gender === 'male' ? 4 : 0) : eraYear < 1984 ? (heavenOnTop ? 4 : 0) : (gender === 'male' ? 5 : 3);
  const trigrams: Record<number, number> = { 1: 2, 2: 0, 3: 1, 4: 6, 5: five, 6: 7, 7: 3, 8: 4, 9: 5 };
  const heaven = trigrams[heavenNumber], earth = trigrams[earthNumber];
  if (heaven === undefined || earth === undefined) throw new Error('天地数不能对应八卦，请核对四柱');
  const code = heavenOnTop ? (heaven << 3) | earth : (earth << 3) | heaven;
  const before = { code, line: yuanTang(code, hour, gender, yangSeason) };
  const after = laterGua(before, yangSeason);
  const resultNotes = [...notes];
  if (birthYear < 1864 || birthYear > 2043) resultNotes.push('五数寄宫超出原表1864–2043年，补充约定按180年周期外推。');
  return { pillars: [...pillars], heavenSum, earthSum, heavenNumber, earthNumber, before, after, periods: buildPeriods(before, after), birthYear, notes: resultNotes };
}
export function buildPeriods(before: Gua, after: Gua): Period[] {
  checkGua(before);
  checkGua(after);
  const periods: Period[] = [];
  let age = 1;
  for (const [gua, phase] of [[before, '先天'], [after, '后天']] as const) {
    for (let i = 0; i < 6; i++) {
      const line = nextLine(gua.line, i), endAge = age + (isYang(gua.code, line) ? 9 : 6) - 1;
      periods.push({ code: gua.code, line, phase, startAge: age, endAge });
      age = endAge + 1;
    }
  }
  return periods;
}
export function annualGua(m: Minggua, age: number): Gua & { period: Period; age: number; year: number; stemBranch: string } {
  if (!Number.isInteger(age) || age < 1) throw new Error('年龄须为从出生年起算的正整数');
  const period = m.periods.find(p => age >= p.startAge && age <= p.endAge);
  if (!period) throw new Error('年龄超出先天、后天两轮大运范围');
  checkGua(period);
  let code = period.code, line = period.line;
  const offset = age - period.startAge;
  if (isYang(period.code, period.line)) {
    if ((m.birthYear + period.startAge - 1) % 2 !== 0) code = flip(code, line);
    if (offset >= 1) { line = opposite(period.line); code = flip(code, line); }
    if (offset >= 2) { line = period.line; code = flip(code, line); }
    for (let i = 3; i <= offset; i++) { line = nextLine(period.line, i - 2); code = flip(code, line); }
  } else {
    for (let i = 0; i <= offset; i++) { line = nextLine(period.line, i); code = flip(code, line); }
  }
  const year = m.birthYear + age - 1;
  return { code, line, period, age, year, stemBranch: stems[mod(year - 4, 10)] + branches[mod(year - 4, 12)] };
}
export function monthGuas(gua: Gua): Array<Gua & { month: number }> {
  checkGua(gua);
  const months: Array<Gua & { month: number }> = [];
  let code = gua.code;
  for (let i = 0; i < 6; i++) {
    const line = nextLine(gua.line, i + 1);
    code = flip(code, line);
    months.push({ code, line, month: i * 2 + 1 });
    const evenLine = opposite(line);
    months.push({ code: flip(code, evenLine), line: evenLine, month: i * 2 + 2 });
  }
  return months;
}
export function textbookExample(): Minggua {
  const m = fromPillars(['甲午', '丙寅', '戊子', '乙卯'], 'male', 1954, 3, true);
  m.notes.push(
    '原书四柱得天15、地40；这里按本项目约定天数5按4算，得风水涣九二→地风升六五，与该例的正文和大运图一致。',
    '原书11–13岁图形与逐爻变法对应姤、鼎、恒，卦名却印作履、睽、归妹；1岁及7岁圆点亦与文字爻位不符，这里依正文及卦形校正。',
  );
  return m;
}
