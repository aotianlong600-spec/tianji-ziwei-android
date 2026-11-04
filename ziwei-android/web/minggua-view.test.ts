import { strict as assert } from 'node:assert';
import { textbookExample } from './minggua';
import { mingguaHTML } from './minggua-view';

const note='地点 <img src=x onerror=alert(1)> & 原始记录';
const visible=mingguaHTML(textbookExample(),1,false,note);
assert.ok(!visible.includes('<img src=x'),'外部地点名称只能作为文本显示');
assert.ok(visible.includes('&lt;img src=x onerror=alert(1)&gt; &amp; 原始记录'));
const hidden=mingguaHTML(textbookExample(),1,false,note,'','12:00:00','','solar',false,true);
assert.ok(!hidden.includes('原始记录'),'隐藏生辰同时隐藏地点和时制说明');
console.log('命卦时间说明转义与隐藏生辰测试通过');
