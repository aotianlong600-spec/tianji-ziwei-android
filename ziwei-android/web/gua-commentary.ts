import { GUA_COMMENTARIES, type CommentaryCategory } from './gua-commentary-data';
import { hexName } from './minggua';

const labels={before:'先天',after:'后天',annual:'流年'};
const escape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const paragraphs=(text:string)=>text.split(/\n+/).filter(Boolean).map(line=>`<p>${escape(line)}</p>`).join('');

export function commentaryHTML(code:number,category:CommentaryCategory,idPrefix=''):string {
  hexName(code);
  if(!Object.prototype.hasOwnProperty.call(labels,category))throw new Error('条辨类别须为先天、后天或流年');
  const entry=GUA_COMMENTARIES.find(item=>item.code===code)!;
  const extra=entry.extra&&!(entry.number===1&&category==='annual');
  return `<details class="gua-commentary" id="${escape(idPrefix)}commentary-${category}-${code}"><summary>${entry.name} · ${labels[category]}条辨</summary><div class="commentary-body">${paragraphs(entry[category])}${extra?`<h4>补充${entry.number===1?'（先天／后天）':''}</h4>${paragraphs(entry.extra)}`:''}</div></details>`;
}
