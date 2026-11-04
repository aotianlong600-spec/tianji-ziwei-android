import { strict as assert } from 'node:assert';
import { GUA_COMMENTARIES } from './gua-commentary-data';
import { commentaryHTML } from './gua-commentary';
import { hexName } from './minggua';

assert.equal(GUA_COMMENTARIES.length,64);
assert.deepEqual([...new Set(GUA_COMMENTARIES.map(row=>row.code))].sort((a,b)=>a-b),Array.from({length:64},(_,i)=>i));
assert.deepEqual(GUA_COMMENTARIES.map(row=>row.number).sort((a,b)=>a-b),Array.from({length:64},(_,i)=>i+1));
for(const entry of GUA_COMMENTARIES) {
  assert.equal(entry.name,hexName(entry.code));
  for(const category of ['before','after','annual'] as const) {
    assert.ok(entry[category].trim());
    assert.ok(commentaryHTML(entry.code,category).includes(`commentary-${category}-${entry.code}`));
  }
}
assert.equal(GUA_COMMENTARIES.find(row=>row.code===63)!.number,1,'卦码与文王序号不可混用');
assert.equal(GUA_COMMENTARIES.find(row=>row.code===0)!.number,2);
assert.deepEqual(GUA_COMMENTARIES.filter(row=>row.inferredCategories.length).map(row=>row.number),[55,59,64]);
assert.ok(commentaryHTML(63,'before').includes('生带禄'));
assert.ok(commentaryHTML(63,'after').includes('官带加升'));
assert.ok(commentaryHTML(63,'annual').includes('连跳三级'));
assert.ok(commentaryHTML(63,'before').includes('真正丈夫在上位'));
assert.ok(!commentaryHTML(63,'annual').includes('真正丈夫在上位'),'先后天共用补充不能冒充流年专属断语');
assert.ok(GUA_COMMENTARIES.find(row=>row.code===50)!.inferredCategories.includes('before'));
assert.throws(()=>commentaryHTML(64,'before'),/卦码/);
const chartAnnual=commentaryHTML(63,'annual','chart-');
assert.ok(chartAnnual.includes('id="chart-commentary-annual-63"'),'双栏左侧条辨必须有独立定位ID');
assert.equal(chartAnnual.replace('id="chart-commentary-','id="commentary-'),commentaryHTML(63,'annual'),'双栏条辨正文与原条辨一致');
console.log('卦条辨测试通过：64卦码映射、192分类、分类元数据、共享补充与原文分类边界');
