// 合成档案，验证升级不丢失旧资料及分组操作。
import { strict as assert } from 'node:assert';
import { readRecords, recordGroups, upsertRecord } from './archive';

const input={name:'测试甲',year:1990,month:6,day:15,hour:6,gender:'male' as const,calendar:'solar' as const,leap:false};
const legacy={id:'old',input,saved:100};
const oldRaw=JSON.stringify([legacy]);
const records=readRecords(oldRaw);
assert.deepEqual(records,[legacy],'旧档案无需迁移，按空分组展示');
assert.deepEqual(readRecords(null),[]);
const grouped=upsertRecord(records,input,'  家人  ',200,'unused');
assert.equal(grouped.length,1,'重复保存更新原档案，不复制');
assert.equal(grouped[0].id,'old');
assert.equal(grouped[0].group,'家人');
assert.deepEqual(records,[legacy],'操作不能修改尚未成功写入的内存档案');
assert.equal(oldRaw,JSON.stringify(records));
assert.deepEqual(readRecords(JSON.stringify(grouped)),grouped,'分组与生辰一起持久化');
const second=upsertRecord(grouped,{...input,name:'测试乙'},'朋友',300,'new');
assert.deepEqual(recordGroups([...second,{...legacy,id:'third',group:'家人'}]),['家人','朋友']);
assert.equal(second[0].id,'new');
assert.deepEqual(second[1],grouped[0],'新档案不改动已有分组与生辰');
const ungrouped=upsertRecord(second,input,'',400,'unused');
assert.equal(ungrouped[0].group,'','支持移回未分组');
assert.deepEqual(recordGroups(ungrouped),['朋友']);
const special=upsertRecord(records,input,'@new',500,'unused');
assert.deepEqual(recordGroups(readRecords(JSON.stringify(special))),['@new'],'分组名与界面控制值不冲突');
for(const group of [null,42,'组'.repeat(31)]) {
  assert.throws(()=>readRecords(JSON.stringify([{...legacy,group}])),'异常分组阻止覆盖原始档案');
}
assert.throws(()=>upsertRecord(records,input,'组'.repeat(31),200,'new'),/30/);
assert.throws(()=>readRecords('{broken'));
assert.throws(()=>readRecords(JSON.stringify([{...legacy,saved:null}])));
console.log('档案分组测试通过：旧档案兼容、重复保存、分组往返、未分组、异常保护');
