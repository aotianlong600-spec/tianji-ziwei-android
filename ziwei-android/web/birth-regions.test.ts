import { strict as assert } from 'node:assert';
import { BIRTH_REGIONS } from './birth-regions';

const provinces = new Set(BIRTH_REGIONS.map(region => region.province));
assert.equal(provinces.size, 34, '国内省级选择包含港澳台共 34 项');
assert.equal(new Set(BIRTH_REGIONS.map(region => region.id)).size, BIRTH_REGIONS.length, '地区 ID 唯一');
assert.equal(new Set(BIRTH_REGIONS.map(region => `${region.province}/${region.city}`)).size, BIRTH_REGIONS.length, '省内城市不重复');
for (const region of BIRTH_REGIONS) {
  assert.ok(region.id && region.province && region.city, '地区名称与 ID 不得为空');
  assert.ok(Number.isFinite(region.longitude) && region.longitude >= 73 && region.longitude <= 136, `${region.city} 经度应位于国内范围`);
  assert.doesNotMatch(region.city, /直辖县级行政区划|^市辖区$|^县$/, '不能用上级行政汇总的坐标冒充城市');
}
for (const [province, city, min, max] of [
  ['北京市', '北京市', 116.35, 116.50],
  ['上海市', '上海市', 121.40, 121.55],
  ['新疆维吾尔自治区', '乌鲁木齐市', 87.55, 87.70],
  ['西藏自治区', '拉萨市', 91.05, 91.20],
  ['台湾省', '台北市', 121.50, 121.65],
  ['海南省', '三沙市', 112.30, 112.36],
  ['海南省', '东方市', 108.60, 108.80],
  ['河北省', '邢台市', 114.40, 114.60],
  ['海南省', '儋州市', 109.50, 109.65],
  ['四川省', '阿坝藏族羌族自治州', 102.15, 102.30],
  ['贵州省', '黔西南布依族苗族自治州', 104.80, 105.00],
  ['云南省', '红河哈尼族彝族自治州', 103.30, 103.45],
] as const) {
  const region = BIRTH_REGIONS.find(item => item.province === province && item.city === city);
  assert.ok(region && region.longitude >= min && region.longitude <= max, `${province}${city} 使用代表经度而非错误回退`);
}
assert.equal(BIRTH_REGIONS.filter(region => region.province === '台湾省').length, 22, '台湾县市包括金门、连江');
assert.ok(provinces.has('香港特别行政区') && provinces.has('澳门特别行政区'));
console.log('离线出生地数据：34 省级覆盖、ID、经度及已知错误坐标回归测试通过');
