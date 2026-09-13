/**
 * Product photography.
 *
 * Every id below was fetched and visually checked against the name it is filed under —
 * URL reachability alone is not enough, since a live URL can still show the wrong
 * subject. Frames containing legible third-party branding were rejected.
 *
 * `ProductImage` still falls back to an illustrated emoji tile on any load failure, so a
 * slow or offline device never renders an empty grey box.
 */
const CDN = 'https://images.unsplash.com/';

/** Requests a right-sized, format-negotiated crop rather than the full-res original. */
export function img(id: string, size = 400): string {
  return `${CDN}${id}?w=${size}&q=80&auto=format&fit=crop`;
}

export const IMG = {
  // ── Fruit ──────────────────────────────────────────────────────────────────
  banana: 'photo-1571771894821-ce9b6c11b08e',
  bananaSingle: 'photo-1528825871115-3581a5387919',
  apple: 'photo-1568702846914-96b305d2aaeb',
  appleCrate: 'photo-1560806887-1e4cd0b6cbd6',
  orange: 'photo-1587735243615-c03f25aaff15',
  watermelon: 'photo-1587049352846-4a222e784d38',
  strawberry: 'photo-1601004890684-d8cbf643f5f2',
  grapes: 'photo-1596363505729-4190a9506133',
  grapesVine: 'photo-1537640538966-79f369143f8f',
  pomegranate: 'photo-1570913149827-d2ac84ab3f9a',
  mango: 'photo-1605027990121-cbae9e0642df',
  mangoSingle: 'photo-1553279768-865429fa0078',
  avocado: 'photo-1519162808019-7de1683fa2ad',
  lemon: 'photo-1590502593747-42a996133562',
  lemonCut: 'photo-1568569350062-ebfa3cb195df',
  mixedFruit: 'photo-1610832958506-aa56368176cf',

  // ── Vegetables ─────────────────────────────────────────────────────────────
  tomato: 'photo-1592924357228-91a4daadcfea',
  tomatoSingle: 'photo-1607305387299-a3d9611cd469',
  potato: 'photo-1518977676601-b53f82aba655',
  onionRed: 'photo-1618512496248-a07fe83aa8cb',
  onion: 'photo-1508747703725-719777637510',
  carrot: 'photo-1447175008436-054170c2e979',
  carrotBunch: 'photo-1576181256399-834e3b3a49bf',
  spinach: 'photo-1576045057995-568f588f82fb',
  lettuce: 'photo-1622206151226-18ca2c9ab4a1',
  capsicum: 'photo-1563565375-f3fdfdbefa83',
  capsicumMix: 'photo-1601648764658-cf37e8c89b70',
  cucumber: 'photo-1604977042946-1eecc30f269e',
  broccoli: 'photo-1459411621453-7b03977f4bfc',
  cauliflower: 'photo-1510627498534-cf7e9002facc',
  garlic: 'photo-1540148426945-6cf22a6b2383',
  beans: 'photo-1567375698348-5d9d5ae99de0',
  pumpkin: 'photo-1570586437263-ab629fccc818',
  saladBowl: 'photo-1546069901-ba9599a7e63c',
  produceMarket: 'photo-1553546895-531931aa1aa8',

  // ── Dairy & eggs ───────────────────────────────────────────────────────────
  milk: 'photo-1550583724-b2692b85b150',
  eggsCarton: 'photo-1518569656558-1f25e69d93d7',
  eggsTray: 'photo-1506976785307-8732e854ad03',
  eggSingle: 'photo-1607690424560-35d967d6ad7c',
  paneerDish: 'photo-1631452180519-c014fe946bc7',
  butter: 'photo-1589985270826-4b7bb135bc9d',
  cheese: 'photo-1486297678162-eb2a19b0a32d',
  cheeseWedge: 'photo-1618164436241-4473940d1f5c',
  curd: 'photo-1571212515416-fef01fc43637',

  // ── Bakery ─────────────────────────────────────────────────────────────────
  bread: 'photo-1509440159596-0249088772ff',
  breadRolls: 'photo-1608198093002-ad4e005484ec',
  cupcake: 'photo-1486427944299-d1955d23e34d',
  croissant: 'photo-1555507036-ab1f4038808a',
  cake: 'photo-1578985545062-69928b1d9587',
  cookies: 'photo-1499636136210-6f4ee915583e',
  cookiesBag: 'photo-1558961363-fa8fdf82db35',

  // ── Snacks & sweets ────────────────────────────────────────────────────────
  chips: 'photo-1613919113640-25732ec5e61f',
  popcorn: 'photo-1578849278619-e73505e9610f',
  popcornBowl: 'photo-1505686994434-e3cc5abf1330',
  almonds: 'photo-1508061253366-f7da158b6d46',
  noodles: 'photo-1585032226651-759b368d7246',
  noodleBowl: 'photo-1612929633738-8fe44f7ec841',
  chocolateBar: 'photo-1614088685112-0a760b71a3c8',
  chocolateBox: 'photo-1481391319762-47dff72954d9',
  chocolateChunks: 'photo-1511381939415-e44015466834',
  whiteChocolate: 'photo-1548907040-4baa42d10919',

  // ── Beverages ──────────────────────────────────────────────────────────────
  cola: 'photo-1581636625402-29b2a704ef13',
  water: 'photo-1616118132534-381148898bb4',
  juice: 'photo-1613478223719-2ab802602423',
  juiceGlass: 'photo-1600271886742-f049cd451bba',
  coffee: 'photo-1544787219-7f47ccb76574',
  tea: 'photo-1564890369478-c89ca6d9cde9',
  teaCup: 'photo-1597318181409-cf64d0b5d8a2',

  // ── Staples ────────────────────────────────────────────────────────────────
  rice: 'photo-1586201375761-83865001e31c',
  riceCooked: 'photo-1536304993881-ff6e9eefa2a6',
  lentils: 'photo-1589924691995-400dc9ecc119',
  curry: 'photo-1596797038530-2c107229654b',
  atta: 'photo-1627485937980-221c88ac04f9',
  wheat: 'photo-1574323347407-f5e1ad6d020b',
  oil: 'photo-1474979266404-7eaacbcd87c5',
  honey: 'photo-1587049352851-8d4e89133924',
  spices: 'photo-1596040033229-a9821ebd058d',

  // ── Personal & home care ───────────────────────────────────────────────────
  soap: 'photo-1584305574647-0cc949a2bb9f',
  skincare: 'photo-1608248543803-ba4f8c70ae0b',
  perfume: 'photo-1595425970377-c9703cf48b6d',
  toothbrush: 'photo-1607613009820-a29f7bb81c04',
  detergent: 'photo-1626806787461-102c1bfaaea1',
  tissue: 'photo-1584556812952-905ffd0c611a',
  cosmetics: 'photo-1571875257727-256c39da42af',

  // ── Frozen, meat & pet ─────────────────────────────────────────────────────
  iceCream: 'photo-1497034825429-c343d7c6a68f',
  iceCreamTubs: 'photo-1567206563064-6f60f40a2b57',
  iceCreamCones: 'photo-1501443762994-82bd5dace89a',
  chickenBreast: 'photo-1604503468506-a8da13d82791',
  chickenWhole: 'photo-1587593810167-a84920ea0781',
  salmon: 'photo-1519708227418-c8fd9a32b7a2',
  meatPlatter: 'photo-1607623814075-e51df1bdc82f',
  petTreats: 'photo-1568640347023-a616a30bc3bd',
  puppy: 'photo-1601979031925-424e53b6caaa',
} as const;

export type ImageKey = keyof typeof IMG;
