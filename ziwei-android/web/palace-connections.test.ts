import { strict as assert } from 'node:assert';
import { palaceConnectionEdges, palaceAnchor } from './palace-connections';

// Hand-checked triangle and opposition pairs for 子 through 亥.
const edges = [
  [[0,4],[4,8],[8,0],[0,6]],
  [[1,5],[5,9],[9,1],[1,7]],
  [[2,6],[6,10],[10,2],[2,8]],
  [[3,7],[7,11],[11,3],[3,9]],
  [[4,8],[8,0],[0,4],[4,10]],
  [[5,9],[9,1],[1,5],[5,11]],
  [[6,10],[10,2],[2,6],[6,0]],
  [[7,11],[11,3],[3,7],[7,1]],
  [[8,0],[0,4],[4,8],[8,2]],
  [[9,1],[1,5],[5,9],[9,3]],
  [[10,2],[2,6],[6,10],[10,4]],
  [[11,3],[3,7],[7,11],[11,5]],
];
edges.forEach((expected, branch) => assert.deepEqual(palaceConnectionEdges(branch), expected));
for (const branch of [-1,12,0.5,NaN]) assert.throws(() => palaceConnectionEdges(branch), /宫位/);

// The four rows deliberately have different heights; inner corners/edges must stay exact.
const center = {left:101,right:302,top:151,bottom:566};
const anchors = [
  [{left:202,right:302,top:567,bottom:756},[252,567]],
  [{left:101,right:201,top:567,bottom:756},[151,567]],
  [{left:0,right:100,top:567,bottom:756},[100,567]],
  [{left:0,right:100,top:322,bottom:566},[100,444]],
  [{left:0,right:100,top:151,bottom:321},[100,236]],
  [{left:0,right:100,top:0,bottom:150},[100,150]],
  [{left:101,right:201,top:0,bottom:150},[151,150]],
  [{left:202,right:302,top:0,bottom:150},[252,150]],
  [{left:303,right:403,top:0,bottom:150},[303,150]],
  [{left:303,right:403,top:151,bottom:321},[303,236]],
  [{left:303,right:403,top:322,bottom:566},[303,444]],
  [{left:303,right:403,top:567,bottom:756},[303,567]],
] as const;
anchors.forEach(([rect, expected]) => assert.deepEqual(palaceAnchor(rect, center), expected));
console.log('三方四正连线测试通过：十二宫三合三角与对宫、非等高宫位内边缘锚点');
