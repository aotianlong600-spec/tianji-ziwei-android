import { strict as assert } from 'node:assert';
import { WORLD_COUNTRIES, WORLD_REGIONS } from './world-regions';

assert.ok(WORLD_REGIONS.length > 25000, '离线数据覆盖世界主要城市');
assert.ok(WORLD_COUNTRIES.length >= 240, '包括小国和属地，缺少城市时允许手动输入');
const countries = new Set(WORLD_COUNTRIES.map(country => country.code));
assert.equal(countries.size, WORLD_COUNTRIES.length, '地区代码唯一');
for (const country of WORLD_COUNTRIES) {
  assert.match(country.code, /^[A-Z]{2}$/);
  assert.ok(country.name.trim());
}
for (const code of ['CN', 'HK', 'MO', 'TW', 'CS', 'AN']) {
  assert.ok(!countries.has(code), '国内由原有选择器提供，不加入已废止国家代码');
}
assert.equal(new Set(WORLD_REGIONS.map(region => region.id)).size, WORLD_REGIONS.length, 'GeoNames ID 唯一');
const zones = new Set<string>();
for (const region of WORLD_REGIONS) {
  assert.match(region.id, /^geonames:\d+$/);
  assert.ok(countries.has(region.country), '城市必须属于可选择地区');
  assert.ok(region.city.trim() && region.timeZone.trim());
  assert.ok(Number.isFinite(region.longitude) && region.longitude >= -180 && region.longitude <= 180);
  zones.add(region.timeZone);
}
for (const zone of zones) {
  assert.doesNotThrow(() => new Intl.DateTimeFormat('en', { timeZone: zone }), `${zone} 应为有效时区`);
}
for (const [id, country, min, max, timeZone] of [
  ['5128581', 'US', -74.1, -73.9, 'America/New_York'],
  ['2643743', 'GB', -0.2, 0, 'Europe/London'],
  ['2147714', 'AU', 151.1, 151.3, 'Australia/Sydney'],
  ['2198148', 'FJ', 178.3, 178.6, 'Pacific/Fiji'],
  ['4035413', 'WS', -171.9, -171.6, 'Pacific/Apia'],
] as const) {
  const region = WORLD_REGIONS.find(item => item.id === `geonames:${id}`);
  assert.ok(region && region.country === country && region.longitude >= min && region.longitude <= max, `${country} 城市经度与正负号`);
  assert.equal(region.timeZone, timeZone, '国际日期变更线附近也保留当地时区');
}
assert.ok(countries.has('TK') && countries.has('AQ'), '无主要城市的地区仍可手动输入');
assert.ok(WORLD_REGIONS.some(region => region.country === 'FR' && region.city.includes('Paris') && region.city.includes('巴黎')), '源数据中明确的单一汉字别名可用于城市搜索');
console.log('离线世界城市：覆盖、唯一 ID、经度、IANA 时区及日期变更线测试通过');
