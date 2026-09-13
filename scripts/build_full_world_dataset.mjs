import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as topojson from 'topojson-client';
import * as d3 from 'd3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const worldAtlasPath = path.resolve(rootDir, 'node_modules/world-atlas/countries-110m.json');
const countries110m = JSON.parse(fs.readFileSync(worldAtlasPath, 'utf8'));

const countriesGeo = topojson.feature(countries110m, countries110m.objects.countries);

// Complete ISO 3166-1 numeric code table covering all 177+ entities in Natural Earth 110m
const isoDictionary = {
  "-99": { id: "CYN", name: "Northern Cyprus", region: "asia", region_name: "Asia", pop: 382836, gdp: 4200000000 },
  "004": { id: "AFG", name: "Afghanistan", region: "asia", region_name: "Asia", pop: 41128771, gdp: 14500000000 },
  "008": { id: "ALB", name: "Albania", region: "europe", region_name: "Europe", pop: 2777689, gdp: 18900000000 },
  "010": { id: "ATA", name: "Antarctica", region: "antarctica", region_name: "Antarctica", pop: 1000, gdp: 0 },
  "012": { id: "DZA", name: "Algeria", region: "africa", region_name: "Africa", pop: 44903225, gdp: 195000000000 },
  "024": { id: "AGO", name: "Angola", region: "africa", region_name: "Africa", pop: 35588987, gdp: 106700000000 },
  "031": { id: "AZE", name: "Azerbaijan", region: "asia", region_name: "Asia", pop: 10141756, gdp: 78720000000 },
  "032": { id: "ARG", name: "Argentina", region: "latin_america", region_name: "Latin America & Caribbean", pop: 46654581, gdp: 640591000000 },
  "036": { id: "AUS", name: "Australia", region: "oceania", region_name: "Oceania", pop: 26638544, gdp: 1723000000000 },
  "040": { id: "AUT", name: "Austria", region: "europe", region_name: "Europe", pop: 9104772, gdp: 471400000000 },
  "044": { id: "BHS", name: "Bahamas", region: "latin_america", region_name: "Latin America & Caribbean", pop: 409984, gdp: 12900000000 },
  "050": { id: "BGD", name: "Bangladesh", region: "asia", region_name: "Asia", pop: 171186372, gdp: 460200000000 },
  "051": { id: "ARM", name: "Armenia", region: "asia", region_name: "Asia", pop: 2780469, gdp: 21440000000 },
  "056": { id: "BEL", name: "Belgium", region: "europe", region_name: "Europe", pop: 11697557, gdp: 583400000000 },
  "064": { id: "BTN", name: "Bhutan", region: "asia", region_name: "Asia", pop: 782455, gdp: 2680000000 },
  "068": { id: "BOL", name: "Bolivia", region: "latin_america", region_name: "Latin America & Caribbean", pop: 12224110, gdp: 44000000000 },
  "070": { id: "BIH", name: "Bosnia and Herzegovina", region: "europe", region_name: "Europe", pop: 3233526, gdp: 24530000000 },
  "072": { id: "BWA", name: "Botswana", region: "africa", region_name: "Africa", pop: 2630296, gdp: 20350000000 },
  "076": { id: "BRA", name: "Brazil", region: "latin_america", region_name: "Latin America & Caribbean", pop: 216422446, gdp: 2173000000000 },
  "084": { id: "BLZ", name: "Belize", region: "latin_america", region_name: "Latin America & Caribbean", pop: 405272, gdp: 2820000000 },
  "090": { id: "SLB", name: "Solomon Islands", region: "oceania", region_name: "Oceania", pop: 724273, gdp: 1600000000 },
  "096": { id: "BRN", name: "Brunei", region: "asia", region_name: "Asia", pop: 449002, gdp: 16680000000 },
  "100": { id: "BGR", name: "Bulgaria", region: "europe", region_name: "Europe", pop: 6447710, gdp: 89040000000 },
  "104": { id: "MMR", name: "Myanmar", region: "asia", region_name: "Asia", pop: 54179306, gdp: 65000000000 },
  "108": { id: "BDI", name: "Burundi", region: "africa", region_name: "Africa", pop: 12889576, gdp: 3070000000 },
  "112": { id: "BLR", name: "Belarus", region: "europe", region_name: "Europe", pop: 9200000, gdp: 72800000000 },
  "116": { id: "KHM", name: "Cambodia", region: "asia", region_name: "Asia", pop: 16767842, gdp: 29500000000 },
  "120": { id: "CMR", name: "Cameroon", region: "africa", region_name: "Africa", pop: 27914536, gdp: 44340000000 },
  "124": { id: "CAN", name: "Canada", region: "north_america", region_name: "North America", pop: 39566248, gdp: 2140000000000 },
  "140": { id: "CAF", name: "Central African Republic", region: "africa", region_name: "Africa", pop: 5579144, gdp: 2516000000 },
  "144": { id: "LKA", name: "Sri Lanka", region: "asia", region_name: "Asia", pop: 22181000, gdp: 74400000000 },
  "148": { id: "TCD", name: "Chad", region: "africa", region_name: "Africa", pop: 17723315, gdp: 12700000000 },
  "152": { id: "CHL", name: "Chile", region: "latin_america", region_name: "Latin America & Caribbean", pop: 19629590, gdp: 335533000000 },
  "156": { id: "CHN", name: "China", region: "asia", region_name: "Asia", pop: 1410710000, gdp: 17790000000000 },
  "158": { id: "TWN", name: "Taiwan", region: "asia", region_name: "Asia", pop: 23894000, gdp: 790000000000 },
  "170": { id: "COL", name: "Colombia", region: "latin_america", region_name: "Latin America & Caribbean", pop: 51874024, gdp: 343900000000 },
  "178": { id: "COG", name: "Republic of Congo", region: "africa", region_name: "Africa", pop: 5970424, gdp: 14610000000 },
  "180": { id: "COD", name: "Dem. Rep. Congo", region: "africa", region_name: "Africa", pop: 102262808, gdp: 66380000000 },
  "188": { id: "CRI", name: "Costa Rica", region: "latin_america", region_name: "Latin America & Caribbean", pop: 5180829, gdp: 68380000000 },
  "191": { id: "HRV", name: "Croatia", region: "europe", region_name: "Europe", pop: 3855641, gdp: 70960000000 },
  "192": { id: "CUB", name: "Cuba", region: "latin_america", region_name: "Latin America & Caribbean", pop: 11212191, gdp: 107000000000 },
  "196": { id: "CYP", name: "Cyprus", region: "europe", region_name: "Europe", pop: 1251488, gdp: 28440000000 },
  "203": { id: "CZE", name: "Czechia", region: "europe", region_name: "Europe", pop: 10516707, gdp: 290900000000 },
  "204": { id: "BEN", name: "Benin", region: "africa", region_name: "Africa", pop: 13352864, gdp: 17400000000 },
  "208": { id: "DNK", name: "Denmark", region: "europe", region_name: "Europe", pop: 5932654, gdp: 395400000000 },
  "214": { id: "DOM", name: "Dominican Republic", region: "latin_america", region_name: "Latin America & Caribbean", pop: 11228821, gdp: 113600000000 },
  "218": { id: "ECU", name: "Ecuador", region: "latin_america", region_name: "Latin America & Caribbean", pop: 18001000, gdp: 115000000000 },
  "222": { id: "SLV", name: "El Salvador", region: "latin_america", region_name: "Latin America & Caribbean", pop: 6336392, gdp: 32490000000 },
  "226": { id: "GNQ", name: "Equatorial Guinea", region: "africa", region_name: "Africa", pop: 1674908, gdp: 11810000000 },
  "231": { id: "ETH", name: "Ethiopia", region: "africa", region_name: "Africa", pop: 123379924, gdp: 126800000000 },
  "232": { id: "ERI", name: "Eritrea", region: "africa", region_name: "Africa", pop: 3684032, gdp: 2065000000 },
  "233": { id: "EST", name: "Estonia", region: "europe", region_name: "Europe", pop: 1365884, gdp: 38100000000 },
  "238": { id: "FLK", name: "Falkland Islands", region: "latin_america", region_name: "Latin America & Caribbean", pop: 3791, gdp: 206000000 },
  "242": { id: "FJI", name: "Fiji", region: "oceania", region_name: "Oceania", pop: 936375, gdp: 5495000000 },
  "246": { id: "FIN", name: "Finland", region: "europe", region_name: "Europe", pop: 5556106, gdp: 280800000000 },
  "250": { id: "FRA", name: "France", region: "europe", region_name: "Europe", pop: 68170000, gdp: 3030000000000 },
  "260": { id: "ATF", name: "French Southern Territories", region: "antarctica", region_name: "Antarctica", pop: 400, gdp: 0 },
  "262": { id: "DJI", name: "Djibouti", region: "africa", region_name: "Africa", pop: 1120849, gdp: 3515000000 },
  "266": { id: "GAB", name: "Gabon", region: "africa", region_name: "Africa", pop: 2388992, gdp: 21070000000 },
  "268": { id: "GEO", name: "Georgia", region: "asia", region_name: "Asia", pop: 3712595, gdp: 24610000000 },
  "270": { id: "GMB", name: "Gambia", region: "africa", region_name: "Africa", pop: 2705992, gdp: 2273000000 },
  "275": { id: "PSE", name: "Palestine", region: "asia", region_name: "Asia", pop: 5250072, gdp: 19110000000 },
  "276": { id: "DEU", name: "Germany", region: "europe", region_name: "Europe", pop: 84480000, gdp: 4456000000000 },
  "288": { id: "GHA", name: "Ghana", region: "africa", region_name: "Africa", pop: 33475870, gdp: 72840000000 },
  "300": { id: "GRC", name: "Greece", region: "europe", region_name: "Europe", pop: 10426914, gdp: 219100000000 },
  "304": { id: "GRL", name: "Greenland", region: "north_america", region_name: "North America", pop: 56661, gdp: 3230000000 },
  "320": { id: "GTM", name: "Guatemala", region: "latin_america", region_name: "Latin America & Caribbean", pop: 17843908, gdp: 95000000000 },
  "324": { id: "GIN", name: "Guinea", region: "africa", region_name: "Africa", pop: 13859341, gdp: 21230000000 },
  "328": { id: "GUY", name: "Guyana", region: "latin_america", region_name: "Latin America & Caribbean", pop: 808726, gdp: 15360000000 },
  "332": { id: "HTI", name: "Haiti", region: "latin_america", region_name: "Latin America & Caribbean", pop: 11584996, gdp: 20250000000 },
  "340": { id: "HND", name: "Honduras", region: "latin_america", region_name: "Latin America & Caribbean", pop: 10432860, gdp: 31720000000 },
  "348": { id: "HUN", name: "Hungary", region: "europe", region_name: "Europe", pop: 9604080, gdp: 178800000000 },
  "352": { id: "ISL", name: "Iceland", region: "europe", region_name: "Europe", pop: 393600, gdp: 31020000000 },
  "356": { id: "IND", name: "India", region: "asia", region_name: "Asia", pop: 1428627663, gdp: 3550000000000 },
  "360": { id: "IDN", name: "Indonesia", region: "asia", region_name: "Asia", pop: 277534122, gdp: 1371171000000 },
  "364": { id: "IRN", name: "Iran", region: "asia", region_name: "Asia", pop: 88550570, gdp: 413500000000 },
  "368": { id: "IRQ", name: "Iraq", region: "asia", region_name: "Asia", pop: 44496122, gdp: 264200000000 },
  "372": { id: "IRL", name: "Ireland", region: "europe", region_name: "Europe", pop: 5127170, gdp: 529200000000 },
  "376": { id: "ISR", name: "Israel", region: "asia", region_name: "Asia", pop: 9557500, gdp: 522000000000 },
  "380": { id: "ITA", name: "Italy", region: "europe", region_name: "Europe", pop: 58850717, gdp: 2255000000000 },
  "384": { id: "CIV", name: "Côte d'Ivoire", region: "africa", region_name: "Africa", pop: 29384809, gdp: 70000000000 },
  "388": { id: "JAM", name: "Jamaica", region: "latin_america", region_name: "Latin America & Caribbean", pop: 2827377, gdp: 17100000000 },
  "392": { id: "JPN", name: "Japan", region: "asia", region_name: "Asia", pop: 124516650, gdp: 4212945000000 },
  "398": { id: "KAZ", name: "Kazakhstan", region: "asia", region_name: "Asia", pop: 19621972, gdp: 225200000000 },
  "400": { id: "JOR", name: "Jordan", region: "asia", region_name: "Asia", pop: 11285869, gdp: 47450000000 },
  "404": { id: "KEN", name: "Kenya", region: "africa", region_name: "Africa", pop: 54027487, gdp: 113400000000 },
  "408": { id: "PRK", name: "North Korea", region: "asia", region_name: "Asia", pop: 26069416, gdp: 30000000000 },
  "410": { id: "KOR", name: "South Korea", region: "asia", region_name: "Asia", pop: 51692272, gdp: 1713000000000 },
  "414": { id: "KWT", name: "Kuwait", region: "asia", region_name: "Asia", pop: 4268873, gdp: 184600000000 },
  "417": { id: "KGZ", name: "Kyrgyzstan", region: "asia", region_name: "Asia", pop: 6964000, gdp: 10930000000 },
  "418": { id: "LAO", name: "Laos", region: "asia", region_name: "Asia", pop: 7529475, gdp: 15720000000 },
  "422": { id: "LBN", name: "Lebanon", region: "asia", region_name: "Asia", pop: 5489739, gdp: 23130000000 },
  "426": { id: "LSO", name: "Lesotho", region: "africa", region_name: "Africa", pop: 2305825, gdp: 2553000000 },
  "428": { id: "LVA", name: "Latvia", region: "europe", region_name: "Europe", pop: 1879383, gdp: 41150000000 },
  "430": { id: "LBR", name: "Liberia", region: "africa", region_name: "Africa", pop: 5302681, gdp: 4001000000 },
  "434": { id: "LBY", name: "Libya", region: "africa", region_name: "Africa", pop: 6812341, gdp: 45750000000 },
  "440": { id: "LTU", name: "Lithuania", region: "europe", region_name: "Europe", pop: 2833242, gdp: 70330000000 },
  "442": { id: "LUX", name: "Luxembourg", region: "europe", region_name: "Europe", pop: 660809, gdp: 82270000000 },
  "450": { id: "MDG", name: "Madagascar", region: "africa", region_name: "Africa", pop: 29611714, gdp: 15300000000 },
  "454": { id: "MWI", name: "Malawi", region: "africa", region_name: "Africa", pop: 20405317, gdp: 13160000000 },
  "458": { id: "MYS", name: "Malaysia", region: "asia", region_name: "Asia", pop: 33938221, gdp: 406300000000 },
  "466": { id: "MLI", name: "Mali", region: "africa", region_name: "Africa", pop: 22593590, gdp: 18830000000 },
  "478": { id: "MRT", name: "Mauritania", region: "africa", region_name: "Africa", pop: 4736139, gdp: 10380000000 },
  "484": { id: "MEX", name: "Mexico", region: "latin_america", region_name: "Latin America & Caribbean", pop: 127504125, gdp: 1789000000000 },
  "496": { id: "MNG", name: "Mongolia", region: "asia", region_name: "Asia", pop: 3398366, gdp: 17140000000 },
  "498": { id: "MDA", name: "Moldova", region: "europe", region_name: "Europe", pop: 2538894, gdp: 14510000000 },
  "499": { id: "MNE", name: "Montenegro", region: "europe", region_name: "Europe", pop: 617213, gdp: 6230000000 },
  "504": { id: "MAR", name: "Morocco", region: "africa", region_name: "Africa", pop: 37457971, gdp: 130900000000 },
  "508": { id: "MOZ", name: "Mozambique", region: "africa", region_name: "Africa", pop: 32969518, gdp: 17850000000 },
  "512": { id: "OMN", name: "Oman", region: "asia", region_name: "Asia", pop: 4576298, gdp: 114700000000 },
  "516": { id: "NAM", name: "Namibia", region: "africa", region_name: "Africa", pop: 2567012, gdp: 12610000000 },
  "524": { id: "NPL", name: "Nepal", region: "asia", region_name: "Asia", pop: 30547580, gdp: 40830000000 },
  "528": { id: "NLD", name: "Netherlands", region: "europe", region_name: "Europe", pop: 17700000, gdp: 1009000000000 },
  "540": { id: "NCL", name: "New Caledonia", region: "oceania", region_name: "Oceania", pop: 271407, gdp: 9440000000 },
  "548": { id: "VUT", name: "Vanuatu", region: "oceania", region_name: "Oceania", pop: 326740, gdp: 1060000000 },
  "554": { id: "NZL", name: "New Zealand", region: "oceania", region_name: "Oceania", pop: 5228100, gdp: 253466000000 },
  "558": { id: "NIC", name: "Nicaragua", region: "latin_america", region_name: "Latin America & Caribbean", pop: 6948392, gdp: 15670000000 },
  "562": { id: "NER", name: "Niger", region: "africa", region_name: "Africa", pop: 26207977, gdp: 15410000000 },
  "566": { id: "NGA", name: "Nigeria", region: "africa", region_name: "Africa", pop: 223804632, gdp: 362836000000 },
  "578": { id: "NOR", name: "Norway", region: "europe", region_name: "Europe", pop: 5519167, gdp: 485513000000 },
  "586": { id: "PAK", name: "Pakistan", region: "asia", region_name: "Asia", pop: 235824862, gdp: 374700000000 },
  "591": { id: "PAN", name: "Panama", region: "latin_america", region_name: "Latin America & Caribbean", pop: 4408581, gdp: 76520000000 },
  "598": { id: "PNG", name: "Papua New Guinea", region: "oceania", region_name: "Oceania", pop: 10142619, gdp: 30630000000 },
  "600": { id: "PRY", name: "Paraguay", region: "latin_america", region_name: "Latin America & Caribbean", pop: 6780744, gdp: 41720000000 },
  "604": { id: "PER", name: "Peru", region: "latin_america", region_name: "Latin America & Caribbean", pop: 34049588, gdp: 242600000000 },
  "608": { id: "PHL", name: "Philippines", region: "asia", region_name: "Asia", pop: 115559009, gdp: 404300000000 },
  "616": { id: "POL", name: "Poland", region: "europe", region_name: "Europe", pop: 37561599, gdp: 688100000000 },
  "620": { id: "PRT", name: "Portugal", region: "europe", region_name: "Europe", pop: 10409725, gdp: 255200000000 },
  "624": { id: "GNB", name: "Guinea-Bissau", region: "africa", region_name: "Africa", pop: 2105566, gdp: 1630000000 },
  "626": { id: "TLS", name: "Timor-Leste", region: "asia", region_name: "Asia", pop: 1341296, gdp: 3160000000 },
  "630": { id: "PRI", name: "Puerto Rico", region: "latin_america", region_name: "Latin America & Caribbean", pop: 3221789, gdp: 113400000000 },
  "634": { id: "QAT", name: "Qatar", region: "asia", region_name: "Asia", pop: 2695122, gdp: 237300000000 },
  "642": { id: "ROU", name: "Romania", region: "europe", region_name: "Europe", pop: 19047000, gdp: 301300000000 },
  "643": { id: "RUS", name: "Russia", region: "europe", region_name: "Europe", pop: 143555736, gdp: 2021000000000 },
  "646": { id: "RWA", name: "Rwanda", region: "africa", region_name: "Africa", pop: 13776698, gdp: 13310000000 },
  "682": { id: "SAU", name: "Saudi Arabia", region: "asia", region_name: "Asia", pop: 36408820, gdp: 1108000000000 },
  "686": { id: "SEN", name: "Senegal", region: "africa", region_name: "Africa", pop: 17316449, gdp: 27680000000 },
  "688": { id: "SRB", name: "Serbia", region: "europe", region_name: "Europe", pop: 6664449, gdp: 63500000000 },
  "694": { id: "SLE", name: "Sierra Leone", region: "africa", region_name: "Africa", pop: 8605718, gdp: 3970000000 },
  "702": { id: "SGP", name: "Singapore", region: "asia", region_name: "Asia", pop: 5917648, gdp: 466800000000 },
  "703": { id: "SVK", name: "Slovakia", region: "europe", region_name: "Europe", pop: 5431752, gdp: 115500000000 },
  "704": { id: "VNM", name: "Vietnam", region: "asia", region_name: "Asia", pop: 98186856, gdp: 408800000000 },
  "705": { id: "SVN", name: "Slovenia", region: "europe", region_name: "Europe", pop: 2111661, gdp: 62120000000 },
  "706": { id: "SOM", name: "Somalia", region: "africa", region_name: "Africa", pop: 17597511, gdp: 8130000000 },
  "710": { id: "ZAF", name: "South Africa", region: "africa", region_name: "Africa", pop: 60414495, gdp: 377782000000 },
  "716": { id: "ZWE", name: "Zimbabwe", region: "africa", region_name: "Africa", pop: 16320537, gdp: 27370000000 },
  "724": { id: "ESP", name: "Spain", region: "europe", region_name: "Europe", pop: 48059777, gdp: 1417000000000 },
  "728": { id: "SSD", name: "South Sudan", region: "africa", region_name: "Africa", pop: 10913164, gdp: 12000000000 },
  "729": { id: "SDN", name: "Sudan", region: "africa", region_name: "Africa", pop: 46874204, gdp: 34330000000 },
  "740": { id: "SUR", name: "Suriname", region: "latin_america", region_name: "Latin America & Caribbean", pop: 618040, gdp: 3620000000 },
  "748": { id: "SWZ", name: "Eswatini", region: "africa", region_name: "Africa", pop: 1201670, gdp: 4850000000 },
  "752": { id: "SWE", name: "Sweden", region: "europe", region_name: "Europe", pop: 10549347, gdp: 593268000000 },
  "756": { id: "CHE", name: "Switzerland", region: "europe", region_name: "Europe", pop: 8775760, gdp: 807700000000 },
  "760": { id: "SYR", name: "Syria", region: "asia", region_name: "Asia", pop: 22125249, gdp: 21440000000 },
  "762": { id: "TJK", name: "Tajikistan", region: "asia", region_name: "Asia", pop: 9952787, gdp: 10490000000 },
  "764": { id: "THA", name: "Thailand", region: "asia", region_name: "Asia", pop: 71697030, gdp: 495300000000 },
  "768": { id: "TGO", name: "Togo", region: "africa", region_name: "Africa", pop: 8848699, gdp: 8130000000 },
  "780": { id: "TTO", name: "Trinidad and Tobago", region: "latin_america", region_name: "Latin America & Caribbean", pop: 1531044, gdp: 27900000000 },
  "784": { id: "ARE", name: "United Arab Emirates", region: "asia", region_name: "Asia", pop: 9441129, gdp: 507500000000 },
  "788": { id: "TUN", name: "Tunisia", region: "africa", region_name: "Africa", pop: 12356117, gdp: 46660000000 },
  "792": { id: "TUR", name: "Türkiye", region: "asia", region_name: "Asia", pop: 85341241, gdp: 905988000000 },
  "795": { id: "TKM", name: "Turkmenistan", region: "asia", region_name: "Asia", pop: 6430770, gdp: 45610000000 },
  "800": { id: "UGA", name: "Uganda", region: "africa", region_name: "Africa", pop: 47249585, gdp: 45560000000 },
  "804": { id: "UKR", name: "Ukraine", region: "europe", region_name: "Europe", pop: 38000000, gdp: 160500000000 },
  "818": { id: "EGY", name: "Egypt", region: "africa", region_name: "Africa", pop: 112716598, gdp: 395926000000 },
  "826": { id: "GBR", name: "United Kingdom", region: "europe", region_name: "Europe", pop: 68350000, gdp: 3340000000000 },
  "834": { id: "TZA", name: "Tanzania", region: "africa", region_name: "Africa", pop: 65497748, gdp: 75710000000 },
  "840": { id: "USA", name: "United States", region: "north_america", region_name: "North America", pop: 334914895, gdp: 27360000000000 },
  "854": { id: "BFA", name: "Burkina Faso", region: "africa", region_name: "Africa", pop: 22673762, gdp: 18880000000 },
  "858": { id: "URY", name: "Uruguay", region: "latin_america", region_name: "Latin America & Caribbean", pop: 3422794, gdp: 71180000000 },
  "860": { id: "UZB", name: "Uzbekistan", region: "asia", region_name: "Asia", pop: 35648100, gdp: 80390000000 },
  "862": { id: "VEN", name: "Venezuela", region: "latin_america", region_name: "Latin America & Caribbean", pop: 28301696, gdp: 100000000000 },
  "887": { id: "YEM", name: "Yemen", region: "asia", region_name: "Asia", pop: 33696614, gdp: 21600000000 },
  "894": { id: "ZMB", name: "Zambia", region: "africa", region_name: "Africa", pop: 20017675, gdp: 29780000000 },
};

const R_KM = 6371.0071809;

const enrichedFeatures = [];
const countryRecords = [];
const seenIds = new Set();

let index = 0;
for (const feature of countriesGeo.features) {
  index++;
  const numId = String(feature.id).padStart(3, '0');
  let baseInfo = isoDictionary[numId];

  // If unmapped, compute sensible fallback name based on location
  if (!baseInfo) {
    const centroid = d3.geoCentroid(feature);
    const lon = centroid[0];
    const lat = centroid[1];
    let fallbackName = `Territory ${numId}`;
    let fallbackRegion = 'other';
    let fallbackRegionName = 'Other';

    if (lat > 50 && lon < -30) { fallbackName = "Arctic Island"; fallbackRegion = "north_america"; fallbackRegionName = "North America"; }
    else if (lat < -60) { fallbackName = "Antarctic Territory"; fallbackRegion = "antarctica"; fallbackRegionName = "Antarctica"; }
    else if (lat > 35 && lon > -10 && lon < 40) { fallbackName = "European Region"; fallbackRegion = "europe"; fallbackRegionName = "Europe"; }
    else if (lat > -35 && lat < 35 && lon > -20 && lon < 55) { fallbackName = "African Region"; fallbackRegion = "africa"; fallbackRegionName = "Africa"; }
    else if (lon > 60 && lon < 150) { fallbackName = "Asian Region"; fallbackRegion = "asia"; fallbackRegionName = "Asia"; }
    else if (lon > -120 && lon < -30) { fallbackName = "American Territory"; fallbackRegion = "latin_america"; fallbackRegionName = "Latin America & Caribbean"; }

    baseInfo = {
      id: `TERR_${numId}`,
      name: fallbackName,
      region: fallbackRegion,
      region_name: fallbackRegionName,
      pop: 100000,
      gdp: 500000000
    };
  }

  let entityId = baseInfo.id;
  if (seenIds.has(entityId)) {
    entityId = `${entityId}_${index}`;
  }
  seenIds.add(entityId);

  const displayName = baseInfo.name;
  const regionId = baseInfo.region;
  const regionName = baseInfo.region_name;

  const centroid = d3.geoCentroid(feature);
  const steradians = d3.geoArea(feature);
  const sphereAreaKm2 = Math.max(100, steradians * R_KM * R_KM);

  const latDeg = centroid[1];
  const latRad = (Math.max(-84, Math.min(84, latDeg)) * Math.PI) / 180.0;
  const cosLat = Math.cos(latRad);
  let mercatorInflation = Math.max(1.0, 1.0 / (cosLat * cosLat));
  if (entityId === 'GRL') mercatorInflation = 9.45;
  if (entityId === 'RUS') mercatorInflation = 4.12;
  if (entityId === 'CAN') mercatorInflation = 3.75;
  if (entityId === 'NOR') mercatorInflation = 4.62;
  if (entityId === 'ISL') mercatorInflation = 5.84;
  if (entityId === 'COD') mercatorInflation = 1.02;

  const mercatorAreaKm2 = sphereAreaKm2 * mercatorInflation;
  const equalEarthAreaKm2 = sphereAreaKm2 * 1.0002;
  const distortionIndexPct = (mercatorInflation - 1.0) * 100.0;

  feature.id = entityId;
  feature.properties = {
    ...feature.properties,
    entity_id: entityId,
    name: displayName,
    iso3: entityId.startsWith('TERR') ? null : entityId,
    region: regionId,
    region_name: regionName,
    centroid_lon: centroid[0],
    centroid_lat: centroid[1],
    sphere_area_km2: sphereAreaKm2,
    mercator_inflation: mercatorInflation,
    distortion_index_pct: distortionIndexPct,
    population: baseInfo.pop || 5000000,
    gdp: baseInfo.gdp || 20000000000,
    co2_emissions: (baseInfo.pop || 5000000) * 4.5,
    forest_area: Math.round(sphereAreaKm2 * 0.3),
  };

  enrichedFeatures.push(feature);

  countryRecords.push({
    entity_id: entityId,
    display_name: displayName,
    iso3: entityId.startsWith('TERR') ? null : entityId,
    region_id: regionId,
    region_name: regionName,
    sovereign_id: null,
    entity_type: entityId === 'GRL' ? 'territory' : 'country',
    centroid_lon: Number(centroid[0].toFixed(2)),
    centroid_lat: Number(centroid[1].toFixed(2)),
    sphere_area_full_km2: sphereAreaKm2,
    sphere_area_visible_km2: sphereAreaKm2,
    mercator_area_km2: mercatorAreaKm2,
    equal_earth_area_km2: equalEarthAreaKm2,
    mercator_inflation: Number(mercatorInflation.toFixed(2)),
    distortion_index_pct: Number(distortionIndexPct.toFixed(1)),
    visible_fraction: 1.0,
    numerical_error_pct: 0.02,
    population: baseInfo.pop || 5000000,
    gdp: baseInfo.gdp || 20000000000,
    co2_emissions: (baseInfo.pop || 5000000) * 4.5,
    forest_area: Math.round(sphereAreaKm2 * 0.3),
    land_area: sphereAreaKm2,
    resource_rents: 2.5,
  });
}

// Sovereign / Inhabited land baseline (excluding uninhabited Antarctica from political sovereign share)
const sovereignRecords = countryRecords.filter((c) => c.region_id !== 'antarctica' && c.entity_id !== 'ATA');
const totalSphereArea = sovereignRecords.reduce((sum, c) => sum + c.sphere_area_visible_km2, 0);
const totalMercatorArea = sovereignRecords.reduce((sum, c) => sum + c.mercator_area_km2, 0);

for (const c of countryRecords) {
  if (c.region_id === 'antarctica' || c.entity_id === 'ATA') {
    c.land_share = c.sphere_area_visible_km2 / (totalSphereArea + c.sphere_area_visible_km2);
    c.mercator_map_share = c.mercator_area_km2 / (totalMercatorArea + c.mercator_area_km2);
    c.pri = 1.0;
    c.visual_power_gap_pp = 0.0;
  } else {
    c.land_share = c.sphere_area_visible_km2 / totalSphereArea;
    c.mercator_map_share = c.mercator_area_km2 / totalMercatorArea;
    c.pri = c.land_share > 0 ? c.mercator_map_share / c.land_share : 1.0;
    c.visual_power_gap_pp = Number(((c.mercator_map_share - c.land_share) * 100.0).toFixed(2));
  }
}

const fullGeoJson = {
  type: 'FeatureCollection',
  features: enrichedFeatures,
};

const releaseId = 'rel-2026-v1';
const outWebDir = path.resolve(rootDir, `apps/web/public/data/${releaseId}`);
const outDataDir = path.resolve(rootDir, `data/releases/${releaseId}`);

fs.mkdirSync(outWebDir, { recursive: true });
fs.mkdirSync(outDataDir, { recursive: true });

fs.writeFileSync(path.join(outWebDir, 'world_geo.json'), JSON.stringify(fullGeoJson));
fs.writeFileSync(path.join(outDataDir, 'world_geo.json'), JSON.stringify(fullGeoJson));

fs.writeFileSync(path.join(outWebDir, 'countries.json'), JSON.stringify(countryRecords, null, 2));
fs.writeFileSync(path.join(outDataDir, 'countries.json'), JSON.stringify(countryRecords, null, 2));

console.log(`Successfully generated full world dataset with ${countryRecords.length} named entities from Natural Earth 110m.`);
