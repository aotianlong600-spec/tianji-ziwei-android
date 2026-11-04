/**
 * Offline representative longitudes, rounded to 0.01°; rounding is not an accuracy guarantee.
 * City Geo: Copyright (c) 2020-present, b3log.org, Mulan PSL v2 (AS IS).
 * https://github.com/88250/city-geo/tree/0e7cb877cb75f4767a81d51c5921de33aacc8089
 * data.json city-level rows; license: ../third-party/city-geo-MulanPSL2.txt.
 * These mainland city centers originate from Baidu geocoding (BD-09), NOT surveyed WGS84.
 * Municipalities are collapsed; administrative aggregates with false fallback locations are omitted.
 * HK/Macau/Taiwan, provincial direct divisions and corrected rows: Wikidata P625 (WGS84, CC0),
 * fetched 2026-11-04; each supplementary row pins its entity revision below.
 * https://www.wikidata.org/wiki/Wikidata:Licensing
 * Sansha: Yongxing Island 112°20′E, https://hainan.weather.com.cn/gywm/101310217.shtml
 * Caohu government seat: https://www.xinjiang.gov.cn/xinjiang/tzgg/202604/3691350b13064945947d8f78933ccb3e.shtml
 * Caohu representative point: 76°2′16.519″E, nearby public road project (not city centroid),
 * https://xjbtnss.gov.cn/mobile/xwzx/tzgg/202404/W020240418711857730627.pdf
 * shortcut: city/county representative points cannot locate a hospital or cover large regions;
 * use the caller's custom longitude for a more precise birthplace or an unlisted county/town.
 */
export interface BirthRegion {
  id: string;
  province: string;
  city: string;
  longitude: number;
}

export const BIRTH_REGIONS: BirthRegion[] = [
  {"id":"北京市/北京市","province":"北京市","city":"北京市","longitude":116.41},
  {"id":"天津市/天津市","province":"天津市","city":"天津市","longitude":117.21},
  {"id":"河北省/石家庄市","province":"河北省","city":"石家庄市","longitude":114.47},
  {"id":"河北省/唐山市","province":"河北省","city":"唐山市","longitude":118.19},
  {"id":"河北省/秦皇岛市","province":"河北省","city":"秦皇岛市","longitude":119.61},
  {"id":"河北省/邯郸市","province":"河北省","city":"邯郸市","longitude":114.55},
  {"id":"河北省/邢台市","province":"河北省","city":"邢台市","longitude":114.48}, // Wikidata Q58576@2559652523
  {"id":"河北省/保定市","province":"河北省","city":"保定市","longitude":115.47},
  {"id":"河北省/张家口市","province":"河北省","city":"张家口市","longitude":114.89},
  {"id":"河北省/承德市","province":"河北省","city":"承德市","longitude":117.97},
  {"id":"河北省/沧州市","province":"河北省","city":"沧州市","longitude":116.85},
  {"id":"河北省/廊坊市","province":"河北省","city":"廊坊市","longitude":116.69},
  {"id":"河北省/衡水市","province":"河北省","city":"衡水市","longitude":115.68},
  {"id":"山西省/太原市","province":"山西省","city":"太原市","longitude":112.56},
  {"id":"山西省/大同市","province":"山西省","city":"大同市","longitude":113.31},
  {"id":"山西省/阳泉市","province":"山西省","city":"阳泉市","longitude":113.59},
  {"id":"山西省/长治市","province":"山西省","city":"长治市","longitude":113.12},
  {"id":"山西省/晋城市","province":"山西省","city":"晋城市","longitude":112.86},
  {"id":"山西省/朔州市","province":"山西省","city":"朔州市","longitude":112.44},
  {"id":"山西省/晋中市","province":"山西省","city":"晋中市","longitude":112.76},
  {"id":"山西省/运城市","province":"山西省","city":"运城市","longitude":111.01},
  {"id":"山西省/忻州市","province":"山西省","city":"忻州市","longitude":112.74},
  {"id":"山西省/临汾市","province":"山西省","city":"临汾市","longitude":111.53},
  {"id":"山西省/吕梁市","province":"山西省","city":"吕梁市","longitude":111.15},
  {"id":"内蒙古自治区/呼和浩特市","province":"内蒙古自治区","city":"呼和浩特市","longitude":111.76},
  {"id":"内蒙古自治区/包头市","province":"内蒙古自治区","city":"包头市","longitude":109.85},
  {"id":"内蒙古自治区/乌海市","province":"内蒙古自治区","city":"乌海市","longitude":106.8},
  {"id":"内蒙古自治区/赤峰市","province":"内蒙古自治区","city":"赤峰市","longitude":118.9},
  {"id":"内蒙古自治区/通辽市","province":"内蒙古自治区","city":"通辽市","longitude":122.25},
  {"id":"内蒙古自治区/鄂尔多斯市","province":"内蒙古自治区","city":"鄂尔多斯市","longitude":109.79},
  {"id":"内蒙古自治区/呼伦贝尔市","province":"内蒙古自治区","city":"呼伦贝尔市","longitude":119.77},
  {"id":"内蒙古自治区/巴彦淖尔市","province":"内蒙古自治区","city":"巴彦淖尔市","longitude":107.39},
  {"id":"内蒙古自治区/乌兰察布市","province":"内蒙古自治区","city":"乌兰察布市","longitude":113.14},
  {"id":"内蒙古自治区/兴安盟","province":"内蒙古自治区","city":"兴安盟","longitude":122.04},
  {"id":"内蒙古自治区/锡林郭勒盟","province":"内蒙古自治区","city":"锡林郭勒盟","longitude":116.05},
  {"id":"内蒙古自治区/阿拉善盟","province":"内蒙古自治区","city":"阿拉善盟","longitude":105.74},
  {"id":"辽宁省/沈阳市","province":"辽宁省","city":"沈阳市","longitude":123.47},
  {"id":"辽宁省/大连市","province":"辽宁省","city":"大连市","longitude":121.62},
  {"id":"辽宁省/鞍山市","province":"辽宁省","city":"鞍山市","longitude":123.0},
  {"id":"辽宁省/抚顺市","province":"辽宁省","city":"抚顺市","longitude":123.96},
  {"id":"辽宁省/本溪市","province":"辽宁省","city":"本溪市","longitude":123.69},
  {"id":"辽宁省/丹东市","province":"辽宁省","city":"丹东市","longitude":124.36},
  {"id":"辽宁省/锦州市","province":"辽宁省","city":"锦州市","longitude":121.13},
  {"id":"辽宁省/营口市","province":"辽宁省","city":"营口市","longitude":122.24},
  {"id":"辽宁省/阜新市","province":"辽宁省","city":"阜新市","longitude":121.68},
  {"id":"辽宁省/辽阳市","province":"辽宁省","city":"辽阳市","longitude":123.24},
  {"id":"辽宁省/盘锦市","province":"辽宁省","city":"盘锦市","longitude":122.08},
  {"id":"辽宁省/铁岭市","province":"辽宁省","city":"铁岭市","longitude":123.73},
  {"id":"辽宁省/朝阳市","province":"辽宁省","city":"朝阳市","longitude":120.46},
  {"id":"辽宁省/葫芦岛市","province":"辽宁省","city":"葫芦岛市","longitude":120.84},
  {"id":"吉林省/长春市","province":"吉林省","city":"长春市","longitude":125.33},
  {"id":"吉林省/吉林市","province":"吉林省","city":"吉林市","longitude":126.56},
  {"id":"吉林省/四平市","province":"吉林省","city":"四平市","longitude":124.36},
  {"id":"吉林省/辽源市","province":"吉林省","city":"辽源市","longitude":125.15},
  {"id":"吉林省/通化市","province":"吉林省","city":"通化市","longitude":125.95},
  {"id":"吉林省/白山市","province":"吉林省","city":"白山市","longitude":126.43},
  {"id":"吉林省/松原市","province":"吉林省","city":"松原市","longitude":124.83},
  {"id":"吉林省/白城市","province":"吉林省","city":"白城市","longitude":122.85},
  {"id":"吉林省/延边朝鲜族自治州","province":"吉林省","city":"延边朝鲜族自治州","longitude":129.48},
  {"id":"黑龙江省/哈尔滨市","province":"黑龙江省","city":"哈尔滨市","longitude":126.54},
  {"id":"黑龙江省/齐齐哈尔市","province":"黑龙江省","city":"齐齐哈尔市","longitude":123.92},
  {"id":"黑龙江省/鸡西市","province":"黑龙江省","city":"鸡西市","longitude":130.98},
  {"id":"黑龙江省/鹤岗市","province":"黑龙江省","city":"鹤岗市","longitude":130.3},
  {"id":"黑龙江省/双鸭山市","province":"黑龙江省","city":"双鸭山市","longitude":131.17},
  {"id":"黑龙江省/大庆市","province":"黑龙江省","city":"大庆市","longitude":125.11},
  {"id":"黑龙江省/伊春市","province":"黑龙江省","city":"伊春市","longitude":128.85},
  {"id":"黑龙江省/佳木斯市","province":"黑龙江省","city":"佳木斯市","longitude":130.33},
  {"id":"黑龙江省/七台河市","province":"黑龙江省","city":"七台河市","longitude":131.01},
  {"id":"黑龙江省/牡丹江市","province":"黑龙江省","city":"牡丹江市","longitude":129.64},
  {"id":"黑龙江省/黑河市","province":"黑龙江省","city":"黑河市","longitude":127.54},
  {"id":"黑龙江省/绥化市","province":"黑龙江省","city":"绥化市","longitude":126.98},
  {"id":"黑龙江省/大兴安岭地区","province":"黑龙江省","city":"大兴安岭地区","longitude":124.15},
  {"id":"上海市/上海市","province":"上海市","city":"上海市","longitude":121.48},
  {"id":"江苏省/南京市","province":"江苏省","city":"南京市","longitude":118.8},
  {"id":"江苏省/无锡市","province":"江苏省","city":"无锡市","longitude":120.32},
  {"id":"江苏省/徐州市","province":"江苏省","city":"徐州市","longitude":117.29},
  {"id":"江苏省/常州市","province":"江苏省","city":"常州市","longitude":119.98},
  {"id":"江苏省/苏州市","province":"江苏省","city":"苏州市","longitude":120.59},
  {"id":"江苏省/南通市","province":"江苏省","city":"南通市","longitude":120.9},
  {"id":"江苏省/连云港市","province":"江苏省","city":"连云港市","longitude":119.23},
  {"id":"江苏省/淮安市","province":"江苏省","city":"淮安市","longitude":119.02},
  {"id":"江苏省/盐城市","province":"江苏省","city":"盐城市","longitude":120.17},
  {"id":"江苏省/扬州市","province":"江苏省","city":"扬州市","longitude":119.42},
  {"id":"江苏省/镇江市","province":"江苏省","city":"镇江市","longitude":119.43},
  {"id":"江苏省/泰州市","province":"江苏省","city":"泰州市","longitude":119.93},
  {"id":"江苏省/宿迁市","province":"江苏省","city":"宿迁市","longitude":118.28},
  {"id":"浙江省/杭州市","province":"浙江省","city":"杭州市","longitude":120.22},
  {"id":"浙江省/宁波市","province":"浙江省","city":"宁波市","longitude":121.63},
  {"id":"浙江省/温州市","province":"浙江省","city":"温州市","longitude":120.71},
  {"id":"浙江省/嘉兴市","province":"浙江省","city":"嘉兴市","longitude":120.76},
  {"id":"浙江省/湖州市","province":"浙江省","city":"湖州市","longitude":120.09},
  {"id":"浙江省/绍兴市","province":"浙江省","city":"绍兴市","longitude":120.59},
  {"id":"浙江省/金华市","province":"浙江省","city":"金华市","longitude":119.65},
  {"id":"浙江省/衢州市","province":"浙江省","city":"衢州市","longitude":118.87},
  {"id":"浙江省/舟山市","province":"浙江省","city":"舟山市","longitude":122.21},
  {"id":"浙江省/台州市","province":"浙江省","city":"台州市","longitude":121.43},
  {"id":"浙江省/丽水市","province":"浙江省","city":"丽水市","longitude":119.93},
  {"id":"安徽省/合肥市","province":"安徽省","city":"合肥市","longitude":117.23},
  {"id":"安徽省/芜湖市","province":"安徽省","city":"芜湖市","longitude":118.44},
  {"id":"安徽省/蚌埠市","province":"安徽省","city":"蚌埠市","longitude":117.4},
  {"id":"安徽省/淮南市","province":"安徽省","city":"淮南市","longitude":117.01},
  {"id":"安徽省/马鞍山市","province":"安徽省","city":"马鞍山市","longitude":118.51},
  {"id":"安徽省/淮北市","province":"安徽省","city":"淮北市","longitude":116.8},
  {"id":"安徽省/铜陵市","province":"安徽省","city":"铜陵市","longitude":117.82},
  {"id":"安徽省/安庆市","province":"安徽省","city":"安庆市","longitude":117.06},
  {"id":"安徽省/黄山市","province":"安徽省","city":"黄山市","longitude":118.35},
  {"id":"安徽省/滁州市","province":"安徽省","city":"滁州市","longitude":118.34},
  {"id":"安徽省/阜阳市","province":"安徽省","city":"阜阳市","longitude":115.82},
  {"id":"安徽省/宿州市","province":"安徽省","city":"宿州市","longitude":116.97},
  {"id":"安徽省/六安市","province":"安徽省","city":"六安市","longitude":116.53},
  {"id":"安徽省/亳州市","province":"安徽省","city":"亳州市","longitude":115.78},
  {"id":"安徽省/池州市","province":"安徽省","city":"池州市","longitude":117.5},
  {"id":"安徽省/宣城市","province":"安徽省","city":"宣城市","longitude":118.77},
  {"id":"福建省/福州市","province":"福建省","city":"福州市","longitude":119.3},
  {"id":"福建省/厦门市","province":"福建省","city":"厦门市","longitude":118.1},
  {"id":"福建省/莆田市","province":"福建省","city":"莆田市","longitude":119.01},
  {"id":"福建省/三明市","province":"福建省","city":"三明市","longitude":117.65},
  {"id":"福建省/泉州市","province":"福建省","city":"泉州市","longitude":118.68},
  {"id":"福建省/漳州市","province":"福建省","city":"漳州市","longitude":117.65},
  {"id":"福建省/南平市","province":"福建省","city":"南平市","longitude":118.18},
  {"id":"福建省/龙岩市","province":"福建省","city":"龙岩市","longitude":117.02},
  {"id":"福建省/宁德市","province":"福建省","city":"宁德市","longitude":119.55},
  {"id":"江西省/南昌市","province":"江西省","city":"南昌市","longitude":115.86},
  {"id":"江西省/景德镇市","province":"江西省","city":"景德镇市","longitude":117.18},
  {"id":"江西省/萍乡市","province":"江西省","city":"萍乡市","longitude":113.86},
  {"id":"江西省/九江市","province":"江西省","city":"九江市","longitude":116.01},
  {"id":"江西省/新余市","province":"江西省","city":"新余市","longitude":114.92},
  {"id":"江西省/鹰潭市","province":"江西省","city":"鹰潭市","longitude":117.08},
  {"id":"江西省/赣州市","province":"江西省","city":"赣州市","longitude":114.94},
  {"id":"江西省/吉安市","province":"江西省","city":"吉安市","longitude":115.0},
  {"id":"江西省/宜春市","province":"江西省","city":"宜春市","longitude":114.42},
  {"id":"江西省/抚州市","province":"江西省","city":"抚州市","longitude":116.36},
  {"id":"江西省/上饶市","province":"江西省","city":"上饶市","longitude":117.95},
  {"id":"山东省/济南市","province":"山东省","city":"济南市","longitude":117.13},
  {"id":"山东省/青岛市","province":"山东省","city":"青岛市","longitude":120.39},
  {"id":"山东省/淄博市","province":"山东省","city":"淄博市","longitude":118.06},
  {"id":"山东省/枣庄市","province":"山东省","city":"枣庄市","longitude":117.33},
  {"id":"山东省/东营市","province":"山东省","city":"东营市","longitude":118.68},
  {"id":"山东省/烟台市","province":"山东省","city":"烟台市","longitude":121.45},
  {"id":"山东省/潍坊市","province":"山东省","city":"潍坊市","longitude":119.17},
  {"id":"山东省/济宁市","province":"山东省","city":"济宁市","longitude":116.59},
  {"id":"山东省/泰安市","province":"山东省","city":"泰安市","longitude":117.09},
  {"id":"山东省/威海市","province":"山东省","city":"威海市","longitude":122.13},
  {"id":"山东省/日照市","province":"山东省","city":"日照市","longitude":119.53},
  {"id":"山东省/临沂市","province":"山东省","city":"临沂市","longitude":118.36},
  {"id":"山东省/德州市","province":"山东省","city":"德州市","longitude":116.37},
  {"id":"山东省/聊城市","province":"山东省","city":"聊城市","longitude":115.99},
  {"id":"山东省/滨州市","province":"山东省","city":"滨州市","longitude":117.98},
  {"id":"山东省/菏泽市","province":"山东省","city":"菏泽市","longitude":115.49},
  {"id":"河南省/郑州市","province":"河南省","city":"郑州市","longitude":113.63},
  {"id":"河南省/开封市","province":"河南省","city":"开封市","longitude":114.31},
  {"id":"河南省/洛阳市","province":"河南省","city":"洛阳市","longitude":112.46},
  {"id":"河南省/平顶山市","province":"河南省","city":"平顶山市","longitude":113.2},
  {"id":"河南省/安阳市","province":"河南省","city":"安阳市","longitude":114.4},
  {"id":"河南省/鹤壁市","province":"河南省","city":"鹤壁市","longitude":114.3},
  {"id":"河南省/新乡市","province":"河南省","city":"新乡市","longitude":113.93},
  {"id":"河南省/焦作市","province":"河南省","city":"焦作市","longitude":113.25},
  {"id":"河南省/濮阳市","province":"河南省","city":"濮阳市","longitude":115.04},
  {"id":"河南省/许昌市","province":"河南省","city":"许昌市","longitude":113.86},
  {"id":"河南省/漯河市","province":"河南省","city":"漯河市","longitude":114.02},
  {"id":"河南省/三门峡市","province":"河南省","city":"三门峡市","longitude":111.21},
  {"id":"河南省/南阳市","province":"河南省","city":"南阳市","longitude":112.53},
  {"id":"河南省/商丘市","province":"河南省","city":"商丘市","longitude":115.66},
  {"id":"河南省/信阳市","province":"河南省","city":"信阳市","longitude":114.1},
  {"id":"河南省/周口市","province":"河南省","city":"周口市","longitude":114.7},
  {"id":"河南省/驻马店市","province":"河南省","city":"驻马店市","longitude":114.03},
  {"id":"河南省/济源市","province":"河南省","city":"济源市","longitude":112.58}, // Wikidata Q997623@2549808199
  {"id":"湖北省/武汉市","province":"湖北省","city":"武汉市","longitude":114.31},
  {"id":"湖北省/黄石市","province":"湖北省","city":"黄石市","longitude":115.05},
  {"id":"湖北省/十堰市","province":"湖北省","city":"十堰市","longitude":110.8},
  {"id":"湖北省/宜昌市","province":"湖北省","city":"宜昌市","longitude":111.29},
  {"id":"湖北省/襄阳市","province":"湖北省","city":"襄阳市","longitude":112.13},
  {"id":"湖北省/鄂州市","province":"湖北省","city":"鄂州市","longitude":114.9},
  {"id":"湖北省/荆门市","province":"湖北省","city":"荆门市","longitude":112.21},
  {"id":"湖北省/孝感市","province":"湖北省","city":"孝感市","longitude":113.92},
  {"id":"湖北省/荆州市","province":"湖北省","city":"荆州市","longitude":112.25},
  {"id":"湖北省/黄冈市","province":"湖北省","city":"黄冈市","longitude":114.88},
  {"id":"湖北省/咸宁市","province":"湖北省","city":"咸宁市","longitude":114.33},
  {"id":"湖北省/随州市","province":"湖北省","city":"随州市","longitude":113.39},
  {"id":"湖北省/恩施土家族苗族自治州","province":"湖北省","city":"恩施土家族苗族自治州","longitude":109.49},
  {"id":"湖北省/仙桃市","province":"湖北省","city":"仙桃市","longitude":113.4}, // Wikidata Q71455@2550162024
  {"id":"湖北省/潜江市","province":"湖北省","city":"潜江市","longitude":112.85}, // Wikidata Q71489@2550832980
  {"id":"湖北省/天门市","province":"湖北省","city":"天门市","longitude":113.17}, // Wikidata Q71468@2553743506
  {"id":"湖北省/神农架林区","province":"湖北省","city":"神农架林区","longitude":110.67}, // Wikidata Q1359055@2558383022
  {"id":"湖南省/长沙市","province":"湖南省","city":"长沙市","longitude":112.95},
  {"id":"湖南省/株洲市","province":"湖南省","city":"株洲市","longitude":113.14},
  {"id":"湖南省/湘潭市","province":"湖南省","city":"湘潭市","longitude":112.95},
  {"id":"湖南省/衡阳市","province":"湖南省","city":"衡阳市","longitude":112.58},
  {"id":"湖南省/邵阳市","province":"湖南省","city":"邵阳市","longitude":111.47},
  {"id":"湖南省/岳阳市","province":"湖南省","city":"岳阳市","longitude":113.14},
  {"id":"湖南省/常德市","province":"湖南省","city":"常德市","longitude":111.71},
  {"id":"湖南省/张家界市","province":"湖南省","city":"张家界市","longitude":110.49},
  {"id":"湖南省/益阳市","province":"湖南省","city":"益阳市","longitude":112.36},
  {"id":"湖南省/郴州市","province":"湖南省","city":"郴州市","longitude":113.02},
  {"id":"湖南省/永州市","province":"湖南省","city":"永州市","longitude":111.62},
  {"id":"湖南省/怀化市","province":"湖南省","city":"怀化市","longitude":110.01},
  {"id":"湖南省/娄底市","province":"湖南省","city":"娄底市","longitude":112.0},
  {"id":"湖南省/湘西土家族苗族自治州","province":"湖南省","city":"湘西土家族苗族自治州","longitude":109.75},
  {"id":"广东省/广州市","province":"广东省","city":"广州市","longitude":113.27},
  {"id":"广东省/韶关市","province":"广东省","city":"韶关市","longitude":113.6},
  {"id":"广东省/深圳市","province":"广东省","city":"深圳市","longitude":114.06},
  {"id":"广东省/珠海市","province":"广东省","city":"珠海市","longitude":113.58},
  {"id":"广东省/汕头市","province":"广东省","city":"汕头市","longitude":116.69},
  {"id":"广东省/佛山市","province":"广东省","city":"佛山市","longitude":113.13},
  {"id":"广东省/江门市","province":"广东省","city":"江门市","longitude":113.09},
  {"id":"广东省/湛江市","province":"广东省","city":"湛江市","longitude":110.37},
  {"id":"广东省/茂名市","province":"广东省","city":"茂名市","longitude":110.93},
  {"id":"广东省/肇庆市","province":"广东省","city":"肇庆市","longitude":112.47},
  {"id":"广东省/惠州市","province":"广东省","city":"惠州市","longitude":114.42},
  {"id":"广东省/梅州市","province":"广东省","city":"梅州市","longitude":116.13},
  {"id":"广东省/汕尾市","province":"广东省","city":"汕尾市","longitude":115.38},
  {"id":"广东省/河源市","province":"广东省","city":"河源市","longitude":114.71},
  {"id":"广东省/阳江市","province":"广东省","city":"阳江市","longitude":111.99},
  {"id":"广东省/清远市","province":"广东省","city":"清远市","longitude":113.06},
  {"id":"广东省/东莞市","province":"广东省","city":"东莞市","longitude":113.76},
  {"id":"广东省/中山市","province":"广东省","city":"中山市","longitude":113.4},
  {"id":"广东省/潮州市","province":"广东省","city":"潮州市","longitude":116.63},
  {"id":"广东省/揭阳市","province":"广东省","city":"揭阳市","longitude":116.38},
  {"id":"广东省/云浮市","province":"广东省","city":"云浮市","longitude":112.05},
  {"id":"广西壮族自治区/南宁市","province":"广西壮族自治区","city":"南宁市","longitude":108.37},
  {"id":"广西壮族自治区/柳州市","province":"广西壮族自治区","city":"柳州市","longitude":109.43},
  {"id":"广西壮族自治区/桂林市","province":"广西壮族自治区","city":"桂林市","longitude":110.2},
  {"id":"广西壮族自治区/梧州市","province":"广西壮族自治区","city":"梧州市","longitude":111.29},
  {"id":"广西壮族自治区/北海市","province":"广西壮族自治区","city":"北海市","longitude":109.13},
  {"id":"广西壮族自治区/防城港市","province":"广西壮族自治区","city":"防城港市","longitude":108.36},
  {"id":"广西壮族自治区/钦州市","province":"广西壮族自治区","city":"钦州市","longitude":108.66},
  {"id":"广西壮族自治区/贵港市","province":"广西壮族自治区","city":"贵港市","longitude":109.61},
  {"id":"广西壮族自治区/玉林市","province":"广西壮族自治区","city":"玉林市","longitude":110.19},
  {"id":"广西壮族自治区/百色市","province":"广西壮族自治区","city":"百色市","longitude":106.62},
  {"id":"广西壮族自治区/贺州市","province":"广西壮族自治区","city":"贺州市","longitude":111.57},
  {"id":"广西壮族自治区/河池市","province":"广西壮族自治区","city":"河池市","longitude":108.09},
  {"id":"广西壮族自治区/来宾市","province":"广西壮族自治区","city":"来宾市","longitude":109.23},
  {"id":"广西壮族自治区/崇左市","province":"广西壮族自治区","city":"崇左市","longitude":107.37},
  {"id":"海南省/海口市","province":"海南省","city":"海口市","longitude":110.33},
  {"id":"海南省/三亚市","province":"海南省","city":"三亚市","longitude":109.52},
  {"id":"海南省/三沙市","province":"海南省","city":"三沙市","longitude":112.33}, // 永兴岛，海南气象局 112°20′；修正上游荆州误匹配。
  {"id":"海南省/儋州市","province":"海南省","city":"儋州市","longitude":109.58}, // Wikidata Q1015132@2549816758
  {"id":"海南省/五指山市","province":"海南省","city":"五指山市","longitude":109.51}, // Wikidata Q1001424@2550166032
  {"id":"海南省/琼海市","province":"海南省","city":"琼海市","longitude":110.46}, // Wikidata Q1005059@2550166883
  {"id":"海南省/文昌市","province":"海南省","city":"文昌市","longitude":110.75}, // Wikidata Q997767@2550164140
  {"id":"海南省/万宁市","province":"海南省","city":"万宁市","longitude":110.4}, // Wikidata Q997593@2550163466
  {"id":"海南省/东方市","province":"海南省","city":"东方市","longitude":108.65}, // Wikidata Q174123@2550161495
  {"id":"海南省/定安县","province":"海南省","city":"定安县","longitude":110.33}, // Wikidata Q1022249@2526541982
  {"id":"海南省/屯昌县","province":"海南省","city":"屯昌县","longitude":110.1}, // Wikidata Q1022271@2526541994
  {"id":"海南省/澄迈县","province":"海南省","city":"澄迈县","longitude":109.99}, // Wikidata Q511654@2526611841
  {"id":"海南省/临高县","province":"海南省","city":"临高县","longitude":109.71}, // Wikidata Q1028107@2526542459
  {"id":"海南省/白沙黎族自治县","province":"海南省","city":"白沙黎族自治县","longitude":109.45}, // Wikidata Q203510@2526608758
  {"id":"海南省/昌江黎族自治县","province":"海南省","city":"昌江黎族自治县","longitude":109.08}, // Wikidata Q1027323@2526542402
  {"id":"海南省/乐东黎族自治县","province":"海南省","city":"乐东黎族自治县","longitude":109.05}, // Wikidata Q1027316@2526542392
  {"id":"海南省/陵水黎族自治县","province":"海南省","city":"陵水黎族自治县","longitude":110.04}, // Wikidata Q944615@2526615344
  {"id":"海南省/保亭黎族苗族自治县","province":"海南省","city":"保亭黎族苗族自治县","longitude":109.67}, // Wikidata Q807080@2526614856
  {"id":"海南省/琼中黎族苗族自治县","province":"海南省","city":"琼中黎族苗族自治县","longitude":109.85}, // Wikidata Q1027336@2526542410
  {"id":"重庆市/重庆市","province":"重庆市","city":"重庆市","longitude":106.56},
  {"id":"四川省/成都市","province":"四川省","city":"成都市","longitude":104.08},
  {"id":"四川省/自贡市","province":"四川省","city":"自贡市","longitude":104.78},
  {"id":"四川省/攀枝花市","province":"四川省","city":"攀枝花市","longitude":101.73},
  {"id":"四川省/泸州市","province":"四川省","city":"泸州市","longitude":105.45},
  {"id":"四川省/德阳市","province":"四川省","city":"德阳市","longitude":104.4},
  {"id":"四川省/绵阳市","province":"四川省","city":"绵阳市","longitude":104.69},
  {"id":"四川省/广元市","province":"四川省","city":"广元市","longitude":105.85},
  {"id":"四川省/遂宁市","province":"四川省","city":"遂宁市","longitude":105.6},
  {"id":"四川省/内江市","province":"四川省","city":"内江市","longitude":105.06},
  {"id":"四川省/乐山市","province":"四川省","city":"乐山市","longitude":103.77},
  {"id":"四川省/南充市","province":"四川省","city":"南充市","longitude":106.12},
  {"id":"四川省/眉山市","province":"四川省","city":"眉山市","longitude":103.86},
  {"id":"四川省/宜宾市","province":"四川省","city":"宜宾市","longitude":104.65},
  {"id":"四川省/广安市","province":"四川省","city":"广安市","longitude":106.64},
  {"id":"四川省/达州市","province":"四川省","city":"达州市","longitude":107.47},
  {"id":"四川省/雅安市","province":"四川省","city":"雅安市","longitude":103.05},
  {"id":"四川省/巴中市","province":"四川省","city":"巴中市","longitude":106.75},
  {"id":"四川省/资阳市","province":"四川省","city":"资阳市","longitude":104.63},
  {"id":"四川省/阿坝藏族羌族自治州","province":"四川省","city":"阿坝藏族羌族自治州","longitude":102.22}, // Wikidata Q1012450@2559573165
  {"id":"四川省/甘孜藏族自治州","province":"四川省","city":"甘孜藏族自治州","longitude":101.97},
  {"id":"四川省/凉山彝族自治州","province":"四川省","city":"凉山彝族自治州","longitude":102.27},
  {"id":"贵州省/贵阳市","province":"贵州省","city":"贵阳市","longitude":106.64},
  {"id":"贵州省/六盘水市","province":"贵州省","city":"六盘水市","longitude":104.84},
  {"id":"贵州省/遵义市","province":"贵州省","city":"遵义市","longitude":106.93},
  {"id":"贵州省/安顺市","province":"贵州省","city":"安顺市","longitude":105.95},
  {"id":"贵州省/毕节市","province":"贵州省","city":"毕节市","longitude":105.3},
  {"id":"贵州省/铜仁市","province":"贵州省","city":"铜仁市","longitude":109.2},
  {"id":"贵州省/黔西南布依族苗族自治州","province":"贵州省","city":"黔西南布依族苗族自治州","longitude":104.9}, // Wikidata Q988844@2526615608
  {"id":"贵州省/黔东南苗族侗族自治州","province":"贵州省","city":"黔东南苗族侗族自治州","longitude":107.99},
  {"id":"贵州省/黔南布依族苗族自治州","province":"贵州省","city":"黔南布依族苗族自治州","longitude":107.53},
  {"id":"云南省/昆明市","province":"云南省","city":"昆明市","longitude":102.85},
  {"id":"云南省/曲靖市","province":"云南省","city":"曲靖市","longitude":103.8},
  {"id":"云南省/玉溪市","province":"云南省","city":"玉溪市","longitude":102.55},
  {"id":"云南省/保山市","province":"云南省","city":"保山市","longitude":99.18},
  {"id":"云南省/昭通市","province":"云南省","city":"昭通市","longitude":103.72},
  {"id":"云南省/丽江市","province":"云南省","city":"丽江市","longitude":100.23},
  {"id":"云南省/普洱市","province":"云南省","city":"普洱市","longitude":100.97},
  {"id":"云南省/临沧市","province":"云南省","city":"临沧市","longitude":100.1},
  {"id":"云南省/楚雄彝族自治州","province":"云南省","city":"楚雄彝族自治州","longitude":101.53},
  {"id":"云南省/红河哈尼族彝族自治州","province":"云南省","city":"红河哈尼族彝族自治州","longitude":103.38}, // Wikidata Q999102@2559851572
  {"id":"云南省/文山壮族苗族自治州","province":"云南省","city":"文山壮族苗族自治州","longitude":104.22},
  {"id":"云南省/西双版纳傣族自治州","province":"云南省","city":"西双版纳傣族自治州","longitude":100.8},
  {"id":"云南省/大理白族自治州","province":"云南省","city":"大理白族自治州","longitude":100.24},
  {"id":"云南省/德宏傣族景颇族自治州","province":"云南省","city":"德宏傣族景颇族自治州","longitude":98.59},
  {"id":"云南省/怒江傈僳族自治州","province":"云南省","city":"怒江傈僳族自治州","longitude":98.86},
  {"id":"云南省/迪庆藏族自治州","province":"云南省","city":"迪庆藏族自治州","longitude":99.71},
  {"id":"西藏自治区/拉萨市","province":"西藏自治区","city":"拉萨市","longitude":91.12},
  {"id":"西藏自治区/日喀则市","province":"西藏自治区","city":"日喀则市","longitude":88.89},
  {"id":"西藏自治区/昌都市","province":"西藏自治区","city":"昌都市","longitude":97.18},
  {"id":"西藏自治区/林芝市","province":"西藏自治区","city":"林芝市","longitude":94.37},
  {"id":"西藏自治区/山南市","province":"西藏自治区","city":"山南市","longitude":91.78},
  {"id":"西藏自治区/那曲市","province":"西藏自治区","city":"那曲市","longitude":92.06},
  {"id":"西藏自治区/阿里地区","province":"西藏自治区","city":"阿里地区","longitude":80.11},
  {"id":"陕西省/西安市","province":"陕西省","city":"西安市","longitude":108.95},
  {"id":"陕西省/铜川市","province":"陕西省","city":"铜川市","longitude":108.95},
  {"id":"陕西省/宝鸡市","province":"陕西省","city":"宝鸡市","longitude":107.24},
  {"id":"陕西省/咸阳市","province":"陕西省","city":"咸阳市","longitude":108.72},
  {"id":"陕西省/渭南市","province":"陕西省","city":"渭南市","longitude":109.52},
  {"id":"陕西省/延安市","province":"陕西省","city":"延安市","longitude":109.5},
  {"id":"陕西省/汉中市","province":"陕西省","city":"汉中市","longitude":107.03},
  {"id":"陕西省/榆林市","province":"陕西省","city":"榆林市","longitude":109.74},
  {"id":"陕西省/安康市","province":"陕西省","city":"安康市","longitude":109.04},
  {"id":"陕西省/商洛市","province":"陕西省","city":"商洛市","longitude":109.92},
  {"id":"甘肃省/兰州市","province":"甘肃省","city":"兰州市","longitude":103.84},
  {"id":"甘肃省/嘉峪关市","province":"甘肃省","city":"嘉峪关市","longitude":98.3},
  {"id":"甘肃省/金昌市","province":"甘肃省","city":"金昌市","longitude":102.19},
  {"id":"甘肃省/白银市","province":"甘肃省","city":"白银市","longitude":104.14},
  {"id":"甘肃省/天水市","province":"甘肃省","city":"天水市","longitude":105.73},
  {"id":"甘肃省/武威市","province":"甘肃省","city":"武威市","longitude":102.64},
  {"id":"甘肃省/张掖市","province":"甘肃省","city":"张掖市","longitude":100.46},
  {"id":"甘肃省/平凉市","province":"甘肃省","city":"平凉市","longitude":106.67},
  {"id":"甘肃省/酒泉市","province":"甘肃省","city":"酒泉市","longitude":98.5},
  {"id":"甘肃省/庆阳市","province":"甘肃省","city":"庆阳市","longitude":107.65},
  {"id":"甘肃省/定西市","province":"甘肃省","city":"定西市","longitude":104.63},
  {"id":"甘肃省/陇南市","province":"甘肃省","city":"陇南市","longitude":104.93},
  {"id":"甘肃省/临夏回族自治州","province":"甘肃省","city":"临夏回族自治州","longitude":103.25},
  {"id":"甘肃省/甘南藏族自治州","province":"甘肃省","city":"甘南藏族自治州","longitude":102.92},
  {"id":"青海省/西宁市","province":"青海省","city":"西宁市","longitude":101.78},
  {"id":"青海省/海东市","province":"青海省","city":"海东市","longitude":102.11},
  {"id":"青海省/海北藏族自治州","province":"青海省","city":"海北藏族自治州","longitude":100.91},
  {"id":"青海省/黄南藏族自治州","province":"青海省","city":"黄南藏族自治州","longitude":102.02},
  {"id":"青海省/海南藏族自治州","province":"青海省","city":"海南藏族自治州","longitude":100.63},
  {"id":"青海省/果洛藏族自治州","province":"青海省","city":"果洛藏族自治州","longitude":100.25},
  {"id":"青海省/玉树藏族自治州","province":"青海省","city":"玉树藏族自治州","longitude":97.01},
  {"id":"青海省/海西蒙古族藏族自治州","province":"青海省","city":"海西蒙古族藏族自治州","longitude":97.38},
  {"id":"宁夏回族自治区/银川市","province":"宁夏回族自治区","city":"银川市","longitude":106.24},
  {"id":"宁夏回族自治区/石嘴山市","province":"宁夏回族自治区","city":"石嘴山市","longitude":106.39},
  {"id":"宁夏回族自治区/吴忠市","province":"宁夏回族自治区","city":"吴忠市","longitude":106.21},
  {"id":"宁夏回族自治区/固原市","province":"宁夏回族自治区","city":"固原市","longitude":106.25},
  {"id":"宁夏回族自治区/中卫市","province":"宁夏回族自治区","city":"中卫市","longitude":105.2},
  {"id":"新疆维吾尔自治区/乌鲁木齐市","province":"新疆维吾尔自治区","city":"乌鲁木齐市","longitude":87.62},
  {"id":"新疆维吾尔自治区/克拉玛依市","province":"新疆维吾尔自治区","city":"克拉玛依市","longitude":84.9},
  {"id":"新疆维吾尔自治区/吐鲁番市","province":"新疆维吾尔自治区","city":"吐鲁番市","longitude":89.2},
  {"id":"新疆维吾尔自治区/哈密市","province":"新疆维吾尔自治区","city":"哈密市","longitude":93.52},
  {"id":"新疆维吾尔自治区/昌吉回族自治州","province":"新疆维吾尔自治区","city":"昌吉回族自治州","longitude":87.32},
  {"id":"新疆维吾尔自治区/博尔塔拉蒙古自治州","province":"新疆维吾尔自治区","city":"博尔塔拉蒙古自治州","longitude":82.07},
  {"id":"新疆维吾尔自治区/巴音郭楞蒙古自治州","province":"新疆维吾尔自治区","city":"巴音郭楞蒙古自治州","longitude":86.15},
  {"id":"新疆维吾尔自治区/阿克苏地区","province":"新疆维吾尔自治区","city":"阿克苏地区","longitude":80.27},
  {"id":"新疆维吾尔自治区/克孜勒苏柯尔克孜自治州","province":"新疆维吾尔自治区","city":"克孜勒苏柯尔克孜自治州","longitude":76.17},
  {"id":"新疆维吾尔自治区/喀什地区","province":"新疆维吾尔自治区","city":"喀什地区","longitude":76.0},
  {"id":"新疆维吾尔自治区/和田地区","province":"新疆维吾尔自治区","city":"和田地区","longitude":79.93},
  {"id":"新疆维吾尔自治区/伊犁哈萨克自治州","province":"新疆维吾尔自治区","city":"伊犁哈萨克自治州","longitude":81.33},
  {"id":"新疆维吾尔自治区/塔城地区","province":"新疆维吾尔自治区","city":"塔城地区","longitude":82.99},
  {"id":"新疆维吾尔自治区/阿勒泰地区","province":"新疆维吾尔自治区","city":"阿勒泰地区","longitude":88.15},
  {"id":"新疆维吾尔自治区/石河子市","province":"新疆维吾尔自治区","city":"石河子市","longitude":86.03}, // Wikidata Q848680@2547135888
  {"id":"新疆维吾尔自治区/阿拉尔市","province":"新疆维吾尔自治区","city":"阿拉尔市","longitude":81.26}, // Wikidata Q625554@2551502888
  {"id":"新疆维吾尔自治区/图木舒克市","province":"新疆维吾尔自治区","city":"图木舒克市","longitude":79.07}, // Wikidata Q989606@2551505475
  {"id":"新疆维吾尔自治区/五家渠市","province":"新疆维吾尔自治区","city":"五家渠市","longitude":87.54}, // Wikidata Q787317@2563998204
  {"id":"新疆维吾尔自治区/北屯市","province":"新疆维吾尔自治区","city":"北屯市","longitude":87.82}, // Wikidata Q814946@2550095764
  {"id":"新疆维吾尔自治区/铁门关市","province":"新疆维吾尔自治区","city":"铁门关市","longitude":85.65}, // Wikidata Q5103019@2526611827
  {"id":"新疆维吾尔自治区/可克达拉市","province":"新疆维吾尔自治区","city":"可克达拉市","longitude":81.0}, // Wikidata Q18651998@2551486897
  {"id":"新疆维吾尔自治区/昆玉市","province":"新疆维吾尔自治区","city":"昆玉市","longitude":79.29}, // Wikidata Q22704998@2526608997
  {"id":"新疆维吾尔自治区/胡杨河市","province":"新疆维吾尔自治区","city":"胡杨河市","longitude":84.82}, // Wikidata Q9435117@2526615326
  {"id":"新疆维吾尔自治区/新星市","province":"新疆维吾尔自治区","city":"新星市","longitude":93.75}, // Wikidata Q105300298@2526542816
  {"id":"新疆维吾尔自治区/白杨市","province":"新疆维吾尔自治区","city":"白杨市","longitude":82.9}, // Wikidata Q116265658@2526576756
  {"id":"新疆维吾尔自治区/双河市","province":"新疆维吾尔自治区","city":"双河市","longitude":82.35}, // Wikidata Q10930847@2526557250
  {"id":"新疆维吾尔自治区/草湖市","province":"新疆维吾尔自治区","city":"草湖市","longitude":76.04}, // 政府驻草湖镇；兵团政府公开道路项目代表点，见文件头来源。
  {"id":"台湾省/台北市","province":"台湾省","city":"台北市","longitude":121.56}, // Wikidata Q1867@2563744896
  {"id":"台湾省/新北市","province":"台湾省","city":"新北市","longitude":121.46}, // Wikidata Q244898@2557702788
  {"id":"台湾省/桃园市","province":"台湾省","city":"桃园市","longitude":121.31}, // Wikidata Q115256@2559849243
  {"id":"台湾省/台中市","province":"台湾省","city":"台中市","longitude":120.68}, // Wikidata Q245023@2557702851
  {"id":"台湾省/台南市","province":"台湾省","city":"台南市","longitude":120.18}, // Wikidata Q140631@2557702944
  {"id":"台湾省/高雄市","province":"台湾省","city":"高雄市","longitude":120.3}, // Wikidata Q181557@2563736333
  {"id":"台湾省/基隆市","province":"台湾省","city":"基隆市","longitude":121.74}, // Wikidata Q249996@2557703675
  {"id":"台湾省/新竹市","province":"台湾省","city":"新竹市","longitude":120.97}, // Wikidata Q249994@2558455559
  {"id":"台湾省/嘉义市","province":"台湾省","city":"嘉义市","longitude":120.45}, // Wikidata Q249995@2558456602
  {"id":"台湾省/新竹县","province":"台湾省","city":"新竹县","longitude":121.16}, // Wikidata Q74054@2561391268
  {"id":"台湾省/苗栗县","province":"台湾省","city":"苗栗县","longitude":120.83}, // Wikidata Q63706@2557703364
  {"id":"台湾省/彰化县","province":"台湾省","city":"彰化县","longitude":120.49}, // Wikidata Q133865@2557703397
  {"id":"台湾省/南投县","province":"台湾省","city":"南投县","longitude":120.69}, // Wikidata Q82357@2557703487
  {"id":"台湾省/云林县","province":"台湾省","city":"云林县","longitude":120.48}, // Wikidata Q153221@2557703415
  {"id":"台湾省/嘉义县","province":"台湾省","city":"嘉义县","longitude":120.64}, // Wikidata Q166977@2557703445
  {"id":"台湾省/屏东县","province":"台湾省","city":"屏东县","longitude":120.49}, // Wikidata Q194989@2557703471
  {"id":"台湾省/宜兰县","province":"台湾省","city":"宜兰县","longitude":121.75}, // Wikidata Q237258@2557703271
  {"id":"台湾省/花莲县","province":"台湾省","city":"花莲县","longitude":121.6}, // Wikidata Q249868@2557703299
  {"id":"台湾省/台东县","province":"台湾省","city":"台东县","longitude":120.93}, // Wikidata Q249904@2557703316
  {"id":"台湾省/澎湖县","province":"台湾省","city":"澎湖县","longitude":119.58}, // Wikidata Q198525@2557703518
  {"id":"台湾省/金门县","province":"台湾省","city":"金门县","longitude":118.33}, // Wikidata Q249870@2558857080
  {"id":"台湾省/连江县","province":"台湾省","city":"连江县","longitude":119.93}, // Wikidata Q249872@2557703556
  {"id":"香港特别行政区/香港特别行政区","province":"香港特别行政区","city":"香港特别行政区","longitude":114.16}, // Wikidata Q8646@2563803747
  {"id":"澳门特别行政区/澳门特别行政区","province":"澳门特别行政区","city":"澳门特别行政区","longitude":113.54}, // Wikidata Q14773@2564477591
];
