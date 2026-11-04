import { toBirthInfo, type BirthInput } from './model';

export type RecordEntry = { id: string; input: BirthInput; saved: number; group?: string };

export function normalizeGroup(group:string):string {
  const name=group.trim();
  if(name.length>30)throw new Error('分组名称不能超过30字');
  return name;
}

export function readRecords(raw:string|null):RecordEntry[] {
  if(!raw)return [];
  const parsed:unknown=JSON.parse(raw);
  if(!Array.isArray(parsed))throw new Error('档案格式异常');
  return parsed.map(r=>{
    if(!r||typeof r.id!=='string'||!r.input||typeof r.saved!=='number'||!Number.isFinite(r.saved))throw new Error('档案格式异常');
    if(r.group!==undefined&&(typeof r.group!=='string'||normalizeGroup(r.group)!==r.group))throw new Error('分组格式异常');
    toBirthInfo(r.input);
    return r;
  });
}

export function recordGroups(records:RecordEntry[]):string[] {
  return [...new Set(records.map(r=>r.group||'').filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
}

export function upsertRecord(records:RecordEntry[],input:BirthInput,group:string,saved:number,id:string):RecordEntry[] {
  const same=records.find(r=>JSON.stringify(r.input)===JSON.stringify(input));
  const entry={...same,id:same?.id||id,input:{...input},saved,group:normalizeGroup(group)};
  return [entry,...records.filter(r=>r.id!==entry.id)];
}
