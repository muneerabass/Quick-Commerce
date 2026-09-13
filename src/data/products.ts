import { Product, ProductTag } from '../types';
import { IMG, ImageKey, img } from './images';

/**
 * Mock catalogue.
 *
 * Products are declared as terse seeds and expanded by `buildProduct`, which derives
 * the fields a backend would normally compute (discount %, delivery ETA, ids). When the
 * real API lands in Phase 2 only this file changes — `Product` stays identical.
 */
interface ProductSeed {
  /** name */ n: string;
  /** pack size */ q: string;
  /** price */ p: number;
  /** original price, when discounted */ o?: number;
  /** image key */ i: ImageKey;
  /** emoji fallback */ e: string;
  /** category id */ c: string;
  /** description */ d: string;
  /** tags */ t?: ProductTag[];
  /** rating */ r?: number;
  /** rating count */ rc?: number;
  /** out of stock */ oos?: boolean;
}

const seeds: ProductSeed[] = [
  // ── Fruits & Vegetables ────────────────────────────────────────────────────
  { n: 'Robusta Banana', q: '6 pcs', p: 45, o: 60, i: 'banana', e: '🍌', c: 'fruits-vegetables', d: 'Naturally ripened, hand-picked bananas with a firm bite and a clean, sweet finish.', t: ['bestseller', 'fresh'], r: 4.5, rc: 2140 },
  { n: 'Shimla Apple', q: '4 pcs · 500 g', p: 132, o: 165, i: 'apple', e: '🍎', c: 'fruits-vegetables', d: 'Crisp, juicy apples straight from the Himalayan belt. Great for lunchboxes.', t: ['fresh'], r: 4.4, rc: 1876 },
  { n: 'Nagpur Orange', q: '1 kg', p: 98, o: 120, i: 'orange', e: '🍊', c: 'fruits-vegetables', d: 'Thin-skinned, seedless and packed with juice. Peak season pick.', t: ['fresh'], r: 4.3, rc: 942 },
  { n: 'Fresh Strawberry', q: '200 g box', p: 149, o: 199, i: 'strawberry', e: '🍓', c: 'fruits-vegetables', d: 'Sorted, cold-chained berries. Best eaten within two days of delivery.', t: ['new'], r: 4.2, rc: 421 },
  { n: 'Seedless Green Grapes', q: '500 g', p: 76, o: 90, i: 'grapes', e: '🍇', c: 'fruits-vegetables', d: 'Firm, seedless grapes washed and packed the same morning.', r: 4.3, rc: 688 },
  { n: 'Watermelon', q: '1 pc · 2 kg', p: 79, i: 'watermelon', e: '🍉', c: 'fruits-vegetables', d: 'Deep red, low-seed watermelon. Chilled before dispatch.', t: ['fresh'], r: 4.1, rc: 305 },
  { n: 'Pomegranate', q: '2 pcs', p: 118, o: 140, i: 'pomegranate', e: '🌺', c: 'fruits-vegetables', d: 'Ruby-red arils, heavy for their size — a sign of a properly ripened fruit.', r: 4.4, rc: 512 },
  { n: 'Alphonso Mango', q: '1 kg', p: 349, o: 420, i: 'mango', e: '🥭', c: 'fruits-vegetables', d: 'Ratnagiri Alphonso, naturally ripened without carbide.', t: ['bestseller'], r: 4.7, rc: 3320 },
  { n: 'Hass Avocado', q: '2 pcs', p: 219, o: 260, i: 'avocado', e: '🥑', c: 'fruits-vegetables', d: 'Ready-to-eat avocados with a buttery, nutty flesh.', t: ['organic'], r: 4.0, rc: 233 },
  { n: 'Lemon', q: '250 g', p: 28, o: 36, i: 'lemon', e: '🍋', c: 'fruits-vegetables', d: 'Thin-skinned lemons with a high juice yield.', r: 4.2, rc: 761 },
  { n: 'Hybrid Tomato', q: '1 kg', p: 42, o: 58, i: 'tomato', e: '🍅', c: 'fruits-vegetables', d: 'Firm, deep-red tomatoes suited to both curries and salads.', t: ['bestseller'], r: 4.1, rc: 1990 },
  { n: 'Desi Tomato', q: '500 g', p: 26, i: 'tomatoSingle', e: '🍅', c: 'fruits-vegetables', d: 'Tangier local variety — the one you want for a proper rasam.', r: 4.0, rc: 430 },
  { n: 'Potato', q: '1 kg', p: 34, o: 45, i: 'potato', e: '🥔', c: 'fruits-vegetables', d: 'Clean, dry-brushed potatoes with a low moisture content.', t: ['bestseller'], r: 4.3, rc: 2610 },
  { n: 'Onion', q: '1 kg', p: 38, o: 52, i: 'onionRed', e: '🧅', c: 'fruits-vegetables', d: 'Medium-sized, tight-skinned onions that keep well for a week.', t: ['bestseller'], r: 4.2, rc: 2405 },
  { n: 'Carrot', q: '500 g', p: 39, o: 48, i: 'carrot', e: '🥕', c: 'fruits-vegetables', d: 'Sweet, snappy Ooty carrots. Topped and washed.', r: 4.3, rc: 877 },
  { n: 'Baby Spinach', q: '250 g', p: 32, i: 'spinach', e: '🥬', c: 'fruits-vegetables', d: 'Tender leaves, triple-washed and ready to cook.', t: ['organic', 'fresh'], r: 4.1, rc: 344 },
  { n: 'Capsicum — Green', q: '250 g', p: 29, o: 38, i: 'capsicum', e: '🫑', c: 'fruits-vegetables', d: 'Thick-walled, glossy capsicum with a mild crunch.', r: 4.0, rc: 519 },
  { n: 'Cucumber', q: '500 g', p: 27, i: 'cucumber', e: '🥒', c: 'fruits-vegetables', d: 'Cool, low-seed salad cucumbers.', r: 4.1, rc: 602 },
  { n: 'Broccoli', q: '250 g', p: 58, o: 72, i: 'broccoli', e: '🥦', c: 'fruits-vegetables', d: 'Tight, dark-green florets. Steam for four minutes, no longer.', t: ['organic'], r: 4.2, rc: 288 },
  { n: 'Ginger', q: '200 g', p: 34, i: 'garlic', e: '🫚', c: 'fruits-vegetables', d: 'Fat, low-fibre ginger that grates cleanly.', r: 4.2, rc: 415 },
  { n: 'Garlic', q: '200 g', p: 46, o: 55, i: 'garlic', e: '🧄', c: 'fruits-vegetables', d: 'Plump cloves with tight, papery skin.', r: 4.1, rc: 522 },
  { n: 'Cauliflower', q: '1 pc', p: 44, i: 'cauliflower', e: '🥬', c: 'fruits-vegetables', d: 'Compact, blemish-free heads with the leaves left on.', r: 4.0, rc: 271 },
  { n: 'Green Peas', q: '250 g', p: 48, o: 60, i: 'beans', e: '🫛', c: 'fruits-vegetables', d: 'Shelled and sorted sweet peas.', r: 4.2, rc: 198 },
  { n: 'French Beans', q: '250 g', p: 35, i: 'beans', e: '🫘', c: 'fruits-vegetables', d: 'Young, stringless beans that snap cleanly.', r: 4.0, rc: 166 },

  // ── Dairy & Eggs ───────────────────────────────────────────────────────────
  { n: 'Toned Milk', q: '500 ml', p: 27, i: 'milk', e: '🥛', c: 'dairy-eggs', d: 'Pasteurised toned milk, 3% fat. Delivered cold.', t: ['bestseller'], r: 4.6, rc: 8412 },
  { n: 'Full Cream Milk', q: '1 L', p: 68, o: 72, i: 'milk', e: '🥛', c: 'dairy-eggs', d: 'Rich 6% fat milk — the right choice for chai and kheer.', t: ['bestseller'], r: 4.6, rc: 6108 },
  { n: 'Farm Eggs', q: '6 pcs', p: 62, o: 78, i: 'eggsCarton', e: '🥚', c: 'dairy-eggs', d: 'Antibiotic-free eggs from free-range hens. Individually candled.', t: ['bestseller'], r: 4.5, rc: 4230 },
  { n: 'Malai Paneer', q: '200 g', p: 89, o: 99, i: 'paneerDish', e: '🧀', c: 'dairy-eggs', d: 'Soft, non-crumbly paneer set the same day.', t: ['fresh'], r: 4.4, rc: 1520 },
  { n: 'Table Butter', q: '100 g', p: 58, i: 'butter', e: '🧈', c: 'dairy-eggs', d: 'Lightly salted butter that spreads straight from the fridge.', r: 4.5, rc: 2903 },
  { n: 'Cheese Slices', q: '10 slices', p: 125, o: 145, i: 'cheeseWedge', e: '🧀', c: 'dairy-eggs', d: 'Processed cheese slices that melt evenly. Ideal for sandwiches.', r: 4.3, rc: 1180 },
  { n: 'Fresh Curd', q: '400 g', p: 44, o: 50, i: 'curd', e: '🥣', c: 'dairy-eggs', d: 'Thick-set curd with a mild, clean sourness.', t: ['fresh'], r: 4.4, rc: 2044 },

  // ── Bakery & Biscuits ──────────────────────────────────────────────────────
  { n: 'Whole Wheat Bread', q: '400 g', p: 45, o: 55, i: 'bread', e: '🍞', c: 'bakery', d: 'Baked this morning with 100% atta and no added maida.', t: ['bestseller', 'fresh'], r: 4.4, rc: 3311 },
  { n: 'Sourdough Loaf', q: '450 g', p: 189, o: 220, i: 'breadRolls', e: '🥖', c: 'bakery', d: 'A 24-hour ferment with a chewy crumb and a proper crust.', t: ['new'], r: 4.6, rc: 402 },
  { n: 'Butter Croissant', q: '2 pcs', p: 110, i: 'croissant', e: '🥐', c: 'bakery', d: 'All-butter, laminated overnight. Warm for 3 minutes before eating.', t: ['new'], r: 4.5, rc: 288 },
  { n: 'Chocolate Chip Cookies', q: '200 g', p: 99, o: 130, i: 'cookies', e: '🍪', c: 'bakery', d: 'Chunky, slow-baked cookies with real chocolate chips.', t: ['bestseller'], r: 4.4, rc: 1602 },
  { n: 'Chocolate Truffle Cake', q: '500 g', p: 449, o: 549, i: 'cake', e: '🎂', c: 'bakery', d: 'Layered truffle cake, kept refrigerated end to end.', r: 4.7, rc: 611 },

  // ── Snacks & Munchies ──────────────────────────────────────────────────────
  { n: 'Classic Salted Chips', q: '52 g', p: 20, i: 'chips', e: '🥔', c: 'snacks', d: 'Thin-cut, evenly salted potato chips in a nitrogen-flushed pack.', t: ['bestseller'], r: 4.3, rc: 5210 },
  { n: 'Butter Popcorn', q: '120 g', p: 65, o: 80, i: 'popcorn', e: '🍿', c: 'snacks', d: 'Ready-to-eat popcorn with real butter and no palm oil.', r: 4.2, rc: 940 },
  { n: 'Roasted Almonds', q: '200 g', p: 289, o: 349, i: 'almonds', e: '🥜', c: 'snacks', d: 'California almonds, dry-roasted and lightly salted.', t: ['bestseller'], r: 4.6, rc: 2211 },
  { n: 'Instant Noodles — Masala', q: 'Pack of 4', p: 56, o: 62, i: 'noodleBowl', e: '🍜', c: 'snacks', d: 'Two-minute noodles with the classic masala tastemaker.', t: ['bestseller'], r: 4.4, rc: 7803 },
  { n: 'Hakka Noodles', q: '280 g', p: 68, i: 'noodles', e: '🍝', c: 'snacks', d: 'Firm, non-sticky noodles for a quick stir-fry.', r: 4.1, rc: 512 },

  // ── Cold Drinks & Juices ───────────────────────────────────────────────────
  { n: 'Cola — Chilled', q: '750 ml', p: 42, o: 45, i: 'cola', e: '🥤', c: 'beverages', d: 'Delivered cold from the store fridge, not the shelf.', t: ['bestseller'], r: 4.4, rc: 6120 },
  { n: 'Mineral Water', q: '1 L', p: 20, i: 'water', e: '💧', c: 'beverages', d: 'Packaged drinking water. Buy 5, save more.', r: 4.2, rc: 3402 },
  { n: 'Mixed Fruit Juice', q: '1 L', p: 109, o: 130, i: 'juice', e: '🧃', c: 'beverages', d: 'No added sugar, no concentrate. Refrigerate after opening.', t: ['fresh'], r: 4.3, rc: 1102 },
  { n: 'Cold Brew Coffee', q: '200 ml', p: 149, o: 179, i: 'coffee', e: '☕', c: 'beverages', d: 'Steeped for 18 hours, low acidity, unsweetened.', t: ['new'], r: 4.5, rc: 388 },
  { n: 'Masala Chai Blend', q: '250 g', p: 175, o: 210, i: 'teaCup', e: '🍵', c: 'beverages', d: 'Assam CTC blended with cardamom, ginger and clove.', r: 4.5, rc: 1420 },

  // ── Atta, Rice & Dal ───────────────────────────────────────────────────────
  { n: 'Basmati Rice — Aged', q: '1 kg', p: 189, o: 235, i: 'rice', e: '🍚', c: 'staples', d: 'Two-year aged grains that stay separate after cooking.', t: ['bestseller'], r: 4.5, rc: 2810 },
  { n: 'Toor Dal', q: '1 kg', p: 168, o: 195, i: 'lentils', e: '🫘', c: 'staples', d: 'Unpolished toor dal, cleaned and machine-sorted.', r: 4.4, rc: 1633 },
  { n: 'Sunflower Oil', q: '1 L', p: 145, o: 168, i: 'oil', e: '🫗', c: 'staples', d: 'Refined, light and neutral — good for everyday cooking.', t: ['bestseller'], r: 4.3, rc: 2205 },
  { n: 'Chakki Fresh Atta', q: '5 kg', p: 265, o: 310, i: 'atta', e: '🌾', c: 'staples', d: 'Stone-ground whole wheat flour with the bran left in.', t: ['bestseller'], r: 4.5, rc: 3140 },
  { n: 'Sharbati Wheat', q: '5 kg', p: 320, i: 'wheat', e: '🌾', c: 'staples', d: 'Premium Sharbati grain, cleaned and ready for the chakki.', r: 4.4, rc: 610 },
  { n: 'Everyday Masala Box', q: '9 spices', p: 449, o: 520, i: 'spices', e: '🧂', c: 'staples', d: 'Nine everyday spices in a single airtight box.', r: 4.4, rc: 508 },
  { n: 'Steam Rice — Everyday', q: '5 kg', p: 289, i: 'riceCooked', e: '🍚', c: 'staples', d: 'Soft, everyday short-grain rice for daily meals.', r: 4.2, rc: 942 },
  { n: 'Raw Forest Honey', q: '500 g', p: 399, o: 470, i: 'honey', e: '🍯', c: 'staples', d: 'Unprocessed, unpasteurised honey. Natural crystallisation is expected.', t: ['organic'], r: 4.6, rc: 744 },

  // ── Sweet Tooth ────────────────────────────────────────────────────────────
  { n: 'Dark Chocolate 70%', q: '100 g', p: 199, o: 250, i: 'chocolateBar', e: '🍫', c: 'chocolates', d: 'Single-origin cacao, low sugar, slow-conched.', t: ['bestseller'], r: 4.6, rc: 1320 },

  // ── Ice Cream & Frozen ─────────────────────────────────────────────────────
  { n: 'Vanilla Bean Ice Cream', q: '500 ml', p: 265, o: 320, i: 'iceCreamTubs', e: '🍨', c: 'ice-cream', d: 'Real vanilla bean, no vegetable fat. Delivered in an insulated bag.', t: ['bestseller'], r: 4.5, rc: 1811 },
  { n: 'Chocolate Cone', q: 'Pack of 4', p: 180, o: 220, i: 'iceCream', e: '🍦', c: 'ice-cream', d: 'Crisp wafer cones with a chocolate-coated tip.', r: 4.4, rc: 903 },

  // ── Personal Care ──────────────────────────────────────────────────────────
  { n: 'Moisturising Soap', q: 'Pack of 3', p: 135, o: 165, i: 'soap', e: '🧼', c: 'personal-care', d: 'Glycerine-rich bars that do not strip the skin.', t: ['bestseller'], r: 4.3, rc: 2604 },
  { n: 'Anti-Hairfall Shampoo', q: '340 ml', p: 349, o: 425, i: 'skincare', e: '🧴', c: 'personal-care', d: 'Sulphate-free formula, safe for colour-treated hair.', r: 4.2, rc: 1408 },
  { n: 'Soft-Bristle Toothbrush', q: 'Pack of 4', p: 118, o: 140, i: 'toothbrush', e: '🪥', c: 'personal-care', d: 'Gentle bristles with a slim head that reaches the back molars.', r: 4.4, rc: 3120 },
  { n: 'Body Mist — Fresh Citrus', q: '150 ml', p: 399, o: 499, i: 'perfume', e: '🌸', c: 'personal-care', d: 'Light citrus mist that lasts through the afternoon.', t: ['new'], r: 4.3, rc: 486 },
  { n: 'Daily Makeup Essentials', q: '5 pcs', p: 899, o: 1150, i: 'cosmetics', e: '💄', c: 'personal-care', d: 'A compact everyday kit — tint, balm, liner and two brushes.', r: 4.1, rc: 274 },

  // ── Home & Cleaning ────────────────────────────────────────────────────────
  { n: 'Liquid Detergent', q: '1 L', p: 285, o: 340, i: 'detergent', e: '🧺', c: 'household', d: 'Concentrated liquid detergent for machine and hand wash.', t: ['bestseller'], r: 4.4, rc: 1922 },
  { n: 'Assorted Chocolate Box', q: '16 pcs', p: 649, o: 799, i: 'chocolateBox', e: '🍫', c: 'chocolates', d: 'Sixteen filled chocolates — praline, caramel, hazelnut and orange.', t: ['new'], r: 4.7, rc: 512 },
  { n: 'Belgian Chocolate Chunks', q: '250 g', p: 349, o: 399, i: 'chocolateChunks', e: '🍫', c: 'chocolates', d: 'Couverture chunks for baking, or for eating straight from the bag.', r: 4.5, rc: 388 },
  { n: 'White Chocolate & Almond', q: '120 g', p: 229, i: 'whiteChocolate', e: '🍫', c: 'chocolates', d: 'Creamy white chocolate studded with whole roasted almonds.', r: 4.3, rc: 241 },
  { n: 'Facial Tissue Box', q: '100 pulls', p: 95, i: 'tissue', e: '🧻', c: 'household', d: 'Two-ply, soft and lint-free.', r: 4.2, rc: 806 },

  // ── Meat & Fish ────────────────────────────────────────────────────────────
  { n: 'Chicken Breast — Boneless', q: '500 g', p: 285, o: 330, i: 'chickenBreast', e: '🍗', c: 'meat', d: 'Antibiotic-residue-free chicken, cut and vacuum-sealed to order.', t: ['fresh'], r: 4.4, rc: 1044 },
  { n: 'Rohu Fish — Cleaned', q: '500 g', p: 249, i: 'salmon', e: '🐟', c: 'meat', d: 'Descaled, gutted and cut into curry pieces.', t: ['low-stock'], r: 4.1, rc: 388, oos: true },

  // ── Pet Care ───────────────────────────────────────────────────────────────
  { n: 'Adult Dog Food — Chicken', q: '1.2 kg', p: 549, o: 649, i: 'petTreats', e: '🐶', c: 'pet-care', d: 'Complete dry food for adult dogs, with added omega-3.', r: 4.5, rc: 620 },
  // ── Additional stock ───────────────────────────────────────────────────────
  { n: 'Country Eggs', q: '12 pcs', p: 118, o: 138, i: 'eggsTray', e: '🥚', c: 'dairy-eggs', d: 'Larger, thicker-shelled country eggs from free-range hens.', r: 4.4, rc: 1382 },
  { n: 'Processed Cheese Block', q: '400 g', p: 245, o: 290, i: 'cheese', e: '🧀', c: 'dairy-eggs', d: 'Firm block cheese that grates cleanly and melts evenly.', r: 4.3, rc: 866 },
  { n: 'Vanilla Cupcakes', q: '4 pcs', p: 199, o: 240, i: 'cupcake', e: '🧁', c: 'bakery', d: 'Buttercream-topped cupcakes baked the same morning.', r: 4.4, rc: 402 },
  { n: 'Assorted Cookie Jar', q: '400 g', p: 249, o: 299, i: 'cookiesBag', e: '🍪', c: 'bakery', d: 'Four kinds of cookie in one refillable jar.', r: 4.3, rc: 618 },
  { n: 'Caramel Popcorn Tub', q: '250 g', p: 149, o: 180, i: 'popcornBowl', e: '🍿', c: 'snacks', d: 'Crunchy caramel-coated popcorn in a resealable tub.', r: 4.2, rc: 511 },
  { n: 'Fresh Orange Juice', q: '750 ml', p: 139, o: 165, i: 'juiceGlass', e: '🍊', c: 'beverages', d: 'Cold-pressed the same morning. No sugar, no water added.', t: ['fresh'], r: 4.5, rc: 908 },
  { n: 'Darjeeling Green Tea', q: '100 g', p: 289, o: 340, i: 'tea', e: '🍵', c: 'beverages', d: 'First-flush leaves with a light, floral cup.', r: 4.4, rc: 366 },
  { n: 'Whole Chicken — Curry Cut', q: '1 kg', p: 269, o: 320, i: 'chickenWhole', e: '🍗', c: 'meat', d: 'Cleaned and cut into curry pieces, skin removed on request.', r: 4.3, rc: 722 },
  { n: 'Cold Cuts Platter', q: '400 g', p: 549, i: 'meatPlatter', e: '🥩', c: 'meat', d: 'Assorted cold cuts, vacuum-sealed and chilled end to end.', r: 4.2, rc: 188 },
  { n: 'Kulfi Cones', q: 'Pack of 6', p: 249, o: 299, i: 'iceCreamCones', e: '🍦', c: 'ice-cream', d: 'Cardamom and pistachio kulfi in a crisp cone.', t: ['new'], r: 4.6, rc: 431 },
  { n: 'Dog Biscuit Treats', q: '500 g', p: 299, o: 349, i: 'puppy', e: '🦴', c: 'pet-care', d: 'Crunchy biscuit treats for training and everyday rewards.', r: 4.4, rc: 288 },
  { n: 'Red Onion — Premium', q: '2 kg', p: 72, o: 95, i: 'onion', e: '🧅', c: 'fruits-vegetables', d: 'Larger, sweeter onions sorted for uniform size.', r: 4.2, rc: 640 },
  { n: 'Iceberg Lettuce', q: '1 pc', p: 69, i: 'lettuce', e: '🥬', c: 'fruits-vegetables', d: 'Crisp, tightly packed heads for salads and wraps.', t: ['fresh'], r: 4.1, rc: 214 },
  { n: 'Coloured Capsicum Mix', q: '500 g', p: 129, o: 155, i: 'capsicumMix', e: '🫑', c: 'fruits-vegetables', d: 'Red, yellow and green capsicum in one pack.', r: 4.3, rc: 377 },
  { n: 'Seedless Black Grapes', q: '500 g', p: 89, o: 110, i: 'grapesVine', e: '🍇', c: 'fruits-vegetables', d: 'Deep-purple grapes picked at full sugar.', r: 4.4, rc: 455 },
];

/** ETAs are deterministic per product so the UI never flickers between renders. */
const ETAS = ['8 mins', '10 mins', '12 mins', '14 mins'];

function buildProduct(seed: ProductSeed, index: number): Product {
  const discount =
    seed.o && seed.o > seed.p ? Math.round(((seed.o - seed.p) / seed.o) * 100) : undefined;

  return {
    id: `p${String(index + 1).padStart(3, '0')}`,
    name: seed.n,
    quantity: seed.q,
    price: seed.p,
    originalPrice: seed.o,
    discount,
    image: img(IMG[seed.i]),
    emoji: seed.e,
    categoryId: seed.c,
    deliveryEta: ETAS[index % ETAS.length],
    rating: seed.r ?? 4.2,
    ratingCount: seed.rc ?? 120,
    inStock: !seed.oos,
    description: seed.d,
    tags: seed.t ?? [],
  };
}

export const products: Product[] = seeds.map(buildProduct);

const productIndex = new Map(products.map((p) => [p.id, p]));

export function getProductById(id: string): Product | undefined {
  return productIndex.get(id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

/**
 * Local stand-in for a search endpoint. Matches on name, category and pack size so
 * "1 kg", "dairy" and "milk" all behave the way a shopper expects.
 */
export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/);
  return products
    .map((product) => {
      const name = product.name.toLowerCase();
      const haystack = `${name} ${product.categoryId} ${product.quantity} ${product.tags.join(' ')}`.toLowerCase();
      const matchesAll = terms.every((t) => haystack.includes(t));
      if (!matchesAll) return null;

      // Rank exact prefix matches on the name above incidental matches.
      const score = name.startsWith(q) ? 0 : name.includes(q) ? 1 : 2;
      return { product, score };
    })
    .filter((r): r is { product: Product; score: number } => r !== null)
    .sort((a, b) => a.score - b.score || b.product.ratingCount - a.product.ratingCount)
    .map((r) => r.product);
}
