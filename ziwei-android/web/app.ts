import { makeChart, toBirthInfo, actualLunarLabel, pillarContext, type BirthInput } from './model';
import { fromPillars, textbookExample, annualGua, hexName, lineName } from './minggua';
import { mingguaHTML, guaDiagram } from './minggua-view';
import { dailyFromDate, solarMonthStart, dailySolarDate, dailyCalendarDates, type DailyCalendar } from './daily-gua';
import { yearPalaces, palaceAges } from './year-palace';
import { BRANCHES, STEMS } from '../../ziwei-doushu/lib/ziwei/constants';
import type { ZiweiChart, Palace } from '../../ziwei-doushu/lib/ziwei/types';

let showPalaceAges=true;
try {showPalaceAges=localStorage.getItem('tianji-show-ages-v1')!=='false';} catch {}
type RecordEntry = { id: string; input: BirthInput; saved: number };
type Page = 'form' | 'chart' | 'gua' | 'history';
const root = document.querySelector<HTMLDivElement>('#app')!;
const storageKey = 'tianji-charts-v1';
const hours = ['子时 23:00–01:00','丑时 01:00–03:00','寅时 03:00–05:00','卯时 05:00–07:00','辰时 07:00–09:00','巳时 09:00–11:00','午时 11:00–13:00','未时 13:00–15:00','申时 15:00–17:00','酉时 17:00–19:00','戌时 19:00–21:00','亥时 21:00–23:00'];
const positions: Record<number,[number,number]> = {5:[1,1],6:[1,2],7:[1,3],8:[1,4],4:[2,1],9:[2,4],3:[3,1],10:[3,4],2:[4,1],1:[4,2],0:[4,3],11:[4,4]};
const icon = (name:Page) => ({form:'＋',chart:'▦',gua:'☰',history:'▤'}[name]);
const escape = (s: unknown) => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let page: Page = 'form';
let draft: BirthInput = { name:'', year:NaN, month:NaN, day:NaN, hour:6, gender:'male', calendar:'solar', leap:false, brightness:'DOC' };
let chart: ZiweiChart | null = null;
let currentInput: BirthInput | null = null;
let selected: number | null = null;
let period = 'natal';
let periodIndex = 0;
let targetYear = new Date().getFullYear();
let guaExample = false;
let guaAge = 1;
let guaDate='', guaClock='12:00:00', guaDayError='';
let guaCalendar:DailyCalendar='solar', guaLeap=false;
let storageError = false;
let records: RecordEntry[] = [];
try {
  const raw=localStorage.getItem(storageKey);
  if(raw) {
    const parsed: unknown=JSON.parse(raw);
    if(!Array.isArray(parsed)) throw new Error();
    records=parsed.map(r=>{ if(!r || typeof r.id!=='string' || !r.input || typeof r.saved!=='number') throw new Error(); toBirthInfo(r.input); return r; });
  }
} catch { storageError=true; }

function toast(message:string) {
  const el=document.querySelector<HTMLDivElement>('#toast')!;
  el.textContent=message; el.classList.add('show');
  window.setTimeout(()=>el.classList.remove('show'),3000);
}
function changePage(next:Page) { page=next; render(); window.scrollTo(0,0); }
function option(value:unknown,label:string,current:unknown) { return `<option value="${escape(value)}" ${value===current?'selected':''}>${escape(label)}</option>`; }
function numeric(value:number) { return Number.isFinite(value)?value:''; }
function formHTML() {
  return `<section class="intro"><span class="eyebrow">始于生辰 · 归于十二宫</span><h1>观星知序<span>天纪紫微</span></h1><p>依据《天机道》排盘表，安星成盘。</p><div class="compass" aria-hidden="true"><span>✦</span></div></section>
  <form id="birth-form" class="card form-card" novalidate>
    <div class="section-head"><h2>新建命盘</h2><span class="muted">出生信息</span></div>
    <label class="field">姓名或称呼 <span class="optional">选填</span><input name="name" maxlength="30" autocomplete="off" placeholder="为这张命盘取个名字" value="${escape(draft.name)}"></label>
    <div class="field"><span>出生历法</span><div class="segmented"><button type="button" data-calendar="solar" class="${draft.calendar==='solar'?'active':''}">公历</button><button type="button" data-calendar="lunar" class="${draft.calendar==='lunar'?'active':''}">农历</button></div></div>
    <div class="date-fields"><label class="field">年<input name="year" type="number" inputmode="numeric" min="1900" max="${new Date().getFullYear()}" placeholder="1990" value="${numeric(draft.year)}" required></label><label class="field">月<select name="month" required>${option('','选择',NaN)}${Array.from({length:12},(_,i)=>option(i+1,`${i+1}月`,draft.month)).join('')}</select></label><label class="field">日<input name="day" type="number" inputmode="numeric" min="1" max="31" placeholder="15" value="${numeric(draft.day)}" required></label></div>
    ${draft.calendar==='lunar'?`<label class="check"><input name="leap" type="checkbox" ${draft.leap?'checked':''}> 该月为闰月 <span class="muted">闰月整月作下月论</span></label>`:''}
    <div class="two-fields"><label class="field">出生时辰<select name="hour">${hours.map((h,i)=>option(i,h,draft.hour)).join('')}</select></label><label class="field">性别<select name="gender">${option('male','男',draft.gender)}${option('female','女',draft.gender)}</select></label></div>
    <label class="field">准确出生时间 <span class="optional">选填 · 四柱交节时使用</span><input name="clock" type="time" value="${escape(draft.clock || '')}"></label>
    <label class="field">星曜亮度表<select name="brightness">${option('DOC','天纪盘例对照表',draft.brightness||'DOC')}${option('ZZ','中州原表',draft.brightness||'DOC')}${option('QS','斗数全书表',draft.brightness||'DOC')}</select></label>
    <p class="field-note">时辰与准确时间须一致；晚子时请填写23点的准确时间。四柱节气按北京时间计算；本版不自动校正真太阳时。未填准确时间时，命卦按所选时辰中点估算。</p>
    <p id="form-error" role="alert" class="error" hidden></p><button class="primary wide" type="submit">起盘 <span>→</span></button>
    <button type="button" id="sample" class="text-button wide">先看看示例命盘</button>
  </form><div class="assurance"><span>◌</span><p>本机离线排盘<br><small>出生资料仅保存在这台设备</small></p><span class="seal">天<br>纪</span></div><details class="rules"><summary>版本与开源信息</summary><p>天纪紫微 1.4.1<br>排盘引擎：ziwei-doushu、iztro<br>命卦依据《天机道》独立实现<br><a href="THIRD_PARTY_NOTICES.txt">查看开源许可</a></p></details>`;
}
function starsHTML(p:Palace) {
  const majors=p.stars.filter(s=>s.type==='major');
  const others=p.stars.filter(s=>s.type!=='major');
  return `<div class="major-stars">${majors.map(s=>`<span class="major">${escape(s.name)}${s.siHua?`<i class="hua h${s.siHua}">${s.siHua}</i>`:''}<small>${escape(s.brightnessRaw || '')}</small></span>`).join('')}</div><div class="minor-stars">${others.map(s=>`<span class="${s.type==='sha'?'sha':''}">${escape(s.name)}${s.siHua?`<i class="hua h${s.siHua}">${s.siHua}</i>`:''}${s.brightnessRaw?`<small class="star-brightness">${escape(s.brightnessRaw)}</small>`:''}</span>`).join('')}</div>`;
}
function periodBranch() {
  if(!chart) return null;
  if(period==='decadal') return chart.daXians[periodIndex]?.palaceBranch ?? null;
  if(period==='year') return yearPalaces(chart,targetYear).smallBranch;
  return null;
}
function chartHTML() {
  if(!chart || !currentInput) return `<div class="empty card"><span>✦</span><h2>还没有命盘</h2><p>填写出生信息，开始你的第一张命盘。</p><button class="primary" data-page="form">新建命盘</button></div>`;
  const c=chart;
  const at=periodBranch();
  const related=selected===null?[]:[selected,(selected+4)%12,(selected+6)%12,(selected+8)%12];
  const selectedPalace=selected===null?c.palaces.find(p=>p.isMingGong)!:c.palaces.find(p=>p.branch===selected)!;
  const b=toBirthInfo(currentInput);
  const context=pillarContext(currentInput);
  const minggua=fromPillars(context.pillars,currentInput.gender,context.birthYear,currentInput.hour,context.yangSeason);
  const yearContext=yearPalaces(c,targetYear);
  let yearSummary='';
  if(period==='year') {
    const age=targetYear-minggua.birthYear+1;
    if(age>=1&&age<=minggua.periods.slice(-1)[0].endAge) {
      const annual=annualGua(minggua,age);
      yearSummary=`<section class="card chart-year-summary"><div>${guaDiagram(annual)}</div><div><span class="eyebrow">四柱流年卦 · ${targetYear} · ${annual.stemBranch}</span><h2>${hexName(annual.code)}</h2><p>命卦第${age}岁 · 动爻 ${lineName(annual.code,annual.line)}</p><button class="text-button" data-gua-year="${targetYear}">查看这一年与十二流月 →</button></div></section>`;
    } else yearSummary='<p class="field-note">所选年份不在这张命卦的先后天大运范围内。</p>';
  }
  return `<section class="chart-heading"><div><span class="eyebrow">ZI WEI DOU SHU</span><h1>${escape(currentInput.name || '未命名命盘')}</h1><p>${b.year}.${String(b.month).padStart(2,'0')}.${String(b.day).padStart(2,'0')} · ${BRANCHES[b.hour]}时 · ${b.gender==='male'?'男':'女'}</p></div><button class="outline" id="edit">修改</button></section>
    <div class="lunar-line">农历 ${escape(actualLunarLabel(currentInput))}<span>${escape(c.yinYangGender || '')} · ${c.wuxingJuName}</span></div>
    <label class="period-control brightness-control">亮度表<select id="chart-brightness">${option('DOC','天纪盘例对照表',currentInput.brightness||'DOC')}${option('ZZ','中州原表',currentInput.brightness||'DOC')}${option('QS','斗数全书表',currentInput.brightness||'DOC')}</select></label>
    <label class="check age-display"><input id="show-ages" type="checkbox" ${showPalaceAges?'checked':''}> 宫内显示流年岁数<span class="muted">列至60岁</span></label>
    <div class="periods segmented">${[['natal','本命'],['decadal','大限'],['year','流年']].map(([value,label])=>`<button data-period="${value}" class="${period===value?'active':''}">${label}</button>`).join('')}</div>
    ${period==='decadal'?`<label class="period-control">选择大限<select id="decadal">${c.daXians.map((dx,i)=>option(i,`${dx.startAge}–${dx.endAge}岁 · ${dx.palaceName}`,periodIndex)).join('')}</select></label>`:''}
    ${period==='year'?`<label class="period-control">流年 <input id="target-year" type="number" min="1900" max="2100" value="${targetYear}"><span>${STEMS[((targetYear-4)%10+10)%10]}${BRANCHES[((targetYear-4)%12+12)%12]}年</span></label><div class="year-palaces"><strong>${yearContext.smallBranch===null?'尚未出生':`${yearContext.age}虚岁 · 流年在${BRANCHES[yearContext.smallBranch]}宫／${escape(c.palaces.find(p=>p.branch===yearContext.smallBranch)!.name)}`}</strong><span>太岁：${BRANCHES[yearContext.taiBranch]}宫／${escape(c.palaces.find(p=>p.branch===yearContext.taiBranch)!.name)}</span></div>`:''}
    ${yearSummary}
    <div class="chart-scroll"><div class="chart-grid ${showPalaceAges?'with-ages':'without-ages'}" aria-label="十二宫命盘">${c.palaces.map(p=>{const [row,col]=positions[p.branch];return `<button class="palace ${p.isMingGong?'ming':''} ${selected===p.branch?'selected':''} ${related.includes(p.branch)?'related':''} ${at===p.branch?'period-active':''}" data-palace="${p.branch}" style="grid-row:${row};grid-column:${col}" aria-label="${STEMS[p.stem]}${BRANCHES[p.branch]} ${p.name}"><div class="cell-top"><span>${STEMS[p.stem]}${BRANCHES[p.branch]}</span>${p.isShenGong?'<b>身</b>':''}${at===p.branch?`<b class="period-mark">${period==='year'?(showPalaceAges?`${yearContext.age}岁`:'流年'):'大限'}</b>`:''}${period==='year'&&p.branch===yearContext.taiBranch?'<b class="taisui-mark">太岁</b>':''}</div><small class="cell-hour" aria-label="${BRANCHES[p.branch]}时">${BRANCHES[p.branch]}</small>${starsHTML(p)}<div class="cell-footer">${showPalaceAges?`<div class="cell-ages" aria-label="流年虚岁"><small>流年</small>${palaceAges(c,p.branch).filter(age=>age<=60).map(age=>`<span class="${period==='year'&&age===yearContext.age?'age-active':''}">${age}</span>`).join('')}</div>`:''}<div class="cell-bottom"><small>${p.daXianAge?`大限 ${p.daXianAge.join('–')}`:''}</small><strong>${escape(p.name)}</strong></div></div></button>`}).join('')}
    <div class="chart-center"><b>天纪紫微</b><div class="center-date">公历 ${b.year}.${b.month}.${b.day}<br>农历 ${escape(actualLunarLabel(currentInput))}</div><div class="center-pillars">${context.pillars.map((p,i)=>`<div><small>${['年柱','月柱','日柱','时柱'][i]}</small><strong>${p[0]}</strong><strong>${p[1]}</strong></div>`).join('')}</div><div class="center-summary">${c.wuxingJuName} · 命${BRANCHES[c.mingGongBranch]} · 身${BRANCHES[c.shenGongBranch]}<br>命主${escape(c.mingZhu)} · 身主${escape(c.shenZhu)}</div><button class="center-gua" data-gua-current><span>先天 <b>${hexName(minggua.before.code)}</b></span><span>后天 <b>${hexName(minggua.after.code)}</b></span><small>展开命卦与流年 ›</small></button></div></div></div>
    <div class="chart-legend"><span class="h禄">● 禄</span><span class="h权">● 权</span><span class="h科">● 科</span><span class="h忌">● 忌</span><small>点击宫位 · 看三方四正</small></div>
    <section class="card palace-detail"><div class="section-head"><h2>${escape(selectedPalace.name)}</h2><span>${STEMS[selectedPalace.stem]}${BRANCHES[selectedPalace.branch]}${selectedPalace.isShenGong?' · 身宫':''}</span></div><p class="detail-ages">流年虚岁：${palaceAges(c,selectedPalace.branch).join('、')}</p><div class="detail-stars">${selectedPalace.stars.map(s=>`<span>${escape(s.name)}${s.siHua?` <b class="h${s.siHua}">化${s.siHua}</b>`:''}${s.brightnessRaw?` <small>${s.brightnessRaw}</small>`:''}</span>`).join('')}</div><p class="muted">三方四正：${[selectedPalace.branch,(selectedPalace.branch+4)%12,(selectedPalace.branch+8)%12,(selectedPalace.branch+6)%12].map(x=>`${c.palaces.find(p=>p.branch===x)!.name}（${BRANCHES[x]}）`).join(' · ')}</p></section>
    <button class="primary wide" id="save">保存到我的命盘 <span>＋</span></button><p class="rules">排盘口径：闰月作下月论 · 辛年魁午钺寅<br>流年：男顺女逆；虚岁按农历出生年起算。<br>太岁另按年支标示，生年四化固定。<br>${showPalaceAges?'宫内流年列至60岁；60岁以后仍可选年查询。':'已隐藏宫内流年岁数；可选年查询、点击宫位查看。'}</p>`;
}
function historyHTML() {
  return `<section class="page-heading"><span class="eyebrow">属于你的命盘簿</span><h1>我的命盘 <small>${records.length}</small></h1><p>保存在本机，随时打开继续查看。</p></section>${storageError?'<p class="error">本机档案读取失败，为避免覆盖，暂时不能保存新档案。</p>':''}${records.length?records.map(r=>`<article class="card record"><button class="record-open" data-record="${escape(r.id)}"><span class="record-emblem">${escape((r.input.name||'命')[0])}</span><span><b>${escape(r.input.name||'未命名命盘')}</b><small>${r.input.year}年${r.input.leap&&r.input.calendar==='lunar'?'闰':''}${r.input.month}月${r.input.day}日 · ${r.input.calendar==='lunar'?'农历':'公历'}<br>${BRANCHES[r.input.hour]}时 · ${r.input.gender==='male'?'男':'女'}</small></span><span class="record-arrow">↗</span></button><button class="delete" data-delete="${escape(r.id)}" aria-label="删除${escape(r.input.name||'命盘')}">删除</button></article>`).join(''):`<div class="card empty"><span>▤</span><h2>把重要的命盘留在这里</h2><p>起盘后点击“保存到我的命盘”，<br>下次打开即可继续查看。</p><button class="primary" data-page="form">新建命盘</button></div>`}<p class="rules">资料保存在应用内。卸载应用会删除本机档案。</p>`;
}
function guaPageHTML() {
  if (!currentInput && !guaExample) return `<section class="page-heading"><span class="eyebrow">四柱 · 先天 · 后天</span><h1>四柱命卦</h1><p>从生辰排先后天卦，查看流年、流月与流日。</p></section><div class="card empty"><span>☰</span><h2>先填写出生信息</h2><p>或查看书中的风水涣例案：<br>一岁元堂九二，后天为地风升。</p><button class="primary" data-page="form">填写生辰</button><button class="text-button wide" data-gua-source="book">查看书中例案</button></div>`;
  try {
    if (guaExample) return mingguaHTML(textbookExample(),guaAge,true,'',guaDate,guaClock,guaDayError,guaCalendar,guaLeap);
    const context=pillarContext(currentInput!);
    const data=fromPillars(context.pillars,currentInput!.gender,context.birthYear,currentInput!.hour,context.yangSeason);
    const note=`立春换年、节令换月；卦年序归${context.birthYear}（${context.pillars[0]}）年起一岁。${context.estimatedTime?'按时辰中点 '+context.clock+' 估算，交节附近请补准确时分。':'出生时间 '+context.clock+'（北京时间）。'}早晚子时日柱同日，晚子时时柱用次日日干。`;
    return mingguaHTML(data,guaAge,false,note,guaDate,guaClock,guaDayError,guaCalendar,guaLeap);
  } catch(error) {return `<p class="error">${escape((error as Error).message)}</p><button class="outline" data-page="form">核对出生信息</button>`;}
}
function activeMinggua() {
  if(guaExample)return textbookExample();
  if(!currentInput)throw new Error('请先起盘');
  const c=pillarContext(currentInput);
  return fromPillars(c.pillars,currentInput.gender,c.birthYear,currentInput.hour,c.yangSeason);
}
function readDailyForm() {
  const form=new FormData(root.querySelector<HTMLFormElement>('#daily-form')!);
  const date=guaCalendar==='solar'?String(form.get('daily-date')||''):`${form.get('daily-year')||''}-${String(form.get('daily-month')||'').padStart(2,'0')}-${String(form.get('daily-day')||'').padStart(2,'0')}`;
  return {date,clock:String(form.get('daily-clock')||''),leap:form.get('daily-leap')==='on'};
}
function readForm(): BirthInput {
  const form=root.querySelector<HTMLFormElement>('#birth-form')!;
  const data=new FormData(form);
  return {name:String(data.get('name')||''),year:Number(data.get('year')||NaN),month:Number(data.get('month')||NaN),day:Number(data.get('day')||NaN),hour:Number(data.get('hour')),gender:data.get('gender') as BirthInput['gender'],calendar:draft.calendar,leap:data.get('leap')==='on',clock:String(data.get('clock')||''),brightness:data.get('brightness') as BirthInput['brightness']};
}
function openInput(input:BirthInput) {
  try {
    const next=makeChart(input);
    draft={...input}; currentInput={...input}; chart=next; selected=null; period='natal'; guaExample=false; guaAge=1;guaDate='';guaDayError=''; periodIndex=Math.max(0,next.currentDaXianIndex); changePage('chart');
  } catch(e) { toast(e instanceof Error?e.message:'起盘失败，请核对出生信息'); }
}
function store(next:RecordEntry[]) {
  if(storageError) { toast('档案读取异常，暂不覆盖原有资料'); return false; }
  try {localStorage.setItem(storageKey,JSON.stringify(next)); records=next; return true;} catch {toast('保存失败，设备存储空间可能不足'); return false;}
}
function render() {
  root.innerHTML=`<header class="topbar"><span class="brand"><i>✦</i> 天纪紫微</span><span class="offline"><i></i> 离线排盘</span></header><main>${page==='form'?formHTML():page==='chart'?chartHTML():page==='gua'?guaPageHTML():historyHTML()}</main><nav class="bottom-nav" aria-label="主导航">${(['form','chart','gua','history'] as Page[]).map(p=>`<button data-page="${p}" class="${page===p?'active':''}" ${page===p?'aria-current="page"':''}><span>${icon(p)}</span>${{form:'起盘',chart:'命盘',gua:'命卦',history:'档案'}[p]}</button>`).join('')}</nav>`;
  root.querySelectorAll<HTMLButtonElement>('[data-page]').forEach(el=>el.onclick=()=>changePage(el.dataset.page as Page));
  root.querySelectorAll<HTMLButtonElement>('[data-gua-source]').forEach(el=>el.onclick=()=>{guaExample=el.dataset.guaSource==='book';guaAge=1;guaDate='';guaDayError='';changePage('gua');});
  root.querySelector<HTMLSelectElement>('#gua-age')?.addEventListener('change',e=>{guaAge=Number((e.target as HTMLSelectElement).value);guaDate='';guaDayError='';render();});
  root.querySelectorAll<HTMLButtonElement>('[data-gua-age]').forEach(el=>el.onclick=()=>{const scroll=root.querySelector('.year-strip')?.scrollLeft||0;guaAge=Number(el.dataset.guaAge);guaDate='';guaDayError='';render();const strip=root.querySelector('.year-strip');if(strip)strip.scrollLeft=scroll;});
  root.querySelectorAll<HTMLButtonElement>('[data-gua-year]').forEach(el=>el.onclick=()=>{if(!currentInput)return;guaExample=false;guaAge=Number(el.dataset.guaYear)-pillarContext(currentInput).birthYear+1;guaDate='';guaDayError='';changePage('gua');});
  root.querySelector<HTMLButtonElement>('[data-gua-current]')?.addEventListener('click',()=>{guaExample=false;guaAge=1;guaDate='';guaDayError='';changePage('gua');});
  root.querySelector<HTMLFormElement>('#daily-form')?.addEventListener('submit',e=>{
    e.preventDefault();const query=readDailyForm();
    guaDate=query.date;guaClock=query.clock;guaLeap=query.leap;guaDayError='';
    try{guaAge=dailyFromDate(activeMinggua(),dailySolarDate(guaCalendar,guaDate,guaLeap),guaClock).age;}catch(error){guaDayError=(error as Error).message;}
    render();root.querySelector('#daily-gua')?.scrollIntoView({block:'start'});
  });
  root.querySelectorAll<HTMLButtonElement>('[data-daily-calendar]').forEach(el=>el.onclick=()=>{
    const next=el.dataset.dailyCalendar as DailyCalendar;if(next===guaCalendar)return;
    try{const query=readDailyForm(),solar=dailySolarDate(guaCalendar,query.date,query.leap),dates=dailyCalendarDates(solar);
      guaCalendar=next;guaDate=next==='lunar'?dates.lunar:dates.solar;guaLeap=dates.leap;guaClock=query.clock;guaDayError='';
      try{guaAge=dailyFromDate(activeMinggua(),solar,guaClock).age;}catch(error){guaDayError=(error as Error).message;}
      render();root.querySelector('#daily-gua')?.scrollIntoView({block:'start'});
    }catch(error){toast((error as Error).message);}
  });
  root.querySelectorAll<HTMLButtonElement>('[data-gua-month]').forEach(el=>el.onclick=()=>{
    try{const m=activeMinggua(),moment=solarMonthStart(m.birthYear+guaAge-1,Number(el.dataset.guaMonth)),dates=dailyCalendarDates(moment.slice(0,10));guaDate=guaCalendar==='lunar'?dates.lunar:dates.solar;guaLeap=dates.leap;guaClock=moment.slice(11);guaDayError='';render();root.querySelector('#daily-gua')?.scrollIntoView({block:'start'});}catch(error){toast((error as Error).message);}
  });
  root.querySelector<HTMLInputElement>('#show-ages')?.addEventListener('change',e=>{showPalaceAges=(e.target as HTMLInputElement).checked;try{localStorage.setItem('tianji-show-ages-v1',String(showPalaceAges));}catch{toast('显示设置未能保存，本次切换仍有效');}render();});
  root.querySelector<HTMLSelectElement>('#chart-brightness')?.addEventListener('change',e=>{if(!currentInput)return;const input={...currentInput,brightness:(e.target as HTMLSelectElement).value as BirthInput['brightness']};chart=makeChart(input);currentInput=input;draft={...input};render();});
  root.querySelector<HTMLFormElement>('#birth-form')?.addEventListener('submit',e=>{
    e.preventDefault(); draft=readForm();
    try { toBirthInfo(draft); openInput(draft); } catch(error) { const el=root.querySelector<HTMLParagraphElement>('#form-error')!; el.hidden=false; el.textContent=(error as Error).message; }
  });
  root.querySelectorAll<HTMLButtonElement>('[data-calendar]').forEach(el=>el.onclick=()=>{draft={...readForm(),calendar:el.dataset.calendar as BirthInput['calendar'],leap:false};render();});
  const sample=root.querySelector<HTMLButtonElement>('#sample');if(sample) sample.onclick=()=>openInput({name:'示例命盘',year:1990,month:6,day:15,hour:6,gender:'male',calendar:'solar',leap:false});
  root.querySelectorAll<HTMLButtonElement>('[data-palace]').forEach(el=>el.onclick=()=>{selected=Number(el.dataset.palace);render();});
  root.querySelectorAll<HTMLButtonElement>('[data-period]').forEach(el=>el.onclick=()=>{period=el.dataset.period!;render();});
  root.querySelector<HTMLSelectElement>('#decadal')?.addEventListener('change',e=>{periodIndex=Number((e.target as HTMLSelectElement).value);render();});
  root.querySelector<HTMLInputElement>('#target-year')?.addEventListener('change',e=>{const y=Number((e.target as HTMLInputElement).value);if(!Number.isInteger(y)||y<1900||y>2100){toast('流年范围为 1900–2100');render();return;}if(y===targetYear)return;targetYear=y;render();});
  root.querySelector<HTMLInputElement>('#target-year')?.addEventListener('input',e=>{const raw=(e.target as HTMLInputElement).value;const y=Number(raw);if(raw.length===4&&Number.isInteger(y)&&y>=1900&&y<=2100){targetYear=y;render();}});
  const edit=root.querySelector<HTMLButtonElement>('#edit');if(edit) edit.onclick=()=>changePage('form');
  const save=root.querySelector<HTMLButtonElement>('#save');if(save) save.onclick=()=>{
    if(!currentInput) return;
    const input=currentInput, same=records.find(r=>JSON.stringify(r.input)===JSON.stringify(input));
    const entry={id:same?.id || `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,input:{...input},saved:Date.now()};
    if(store([entry,...records.filter(r=>r.id!==entry.id)])) toast('已保存到我的命盘');
  };
  root.querySelectorAll<HTMLButtonElement>('[data-record]').forEach(el=>el.onclick=()=>{const r=records.find(r=>r.id===el.dataset.record);if(r)openInput(r.input);});
  root.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(el=>el.onclick=()=>{if(confirm('删除这张本机命盘？'))if(store(records.filter(r=>r.id!==el.dataset.delete))){render();toast('命盘已删除');}});
}
(window as Window & {appBack?:()=>boolean}).appBack=()=>{if(page!=='form'){changePage('form');return true;}return false;};
render();
