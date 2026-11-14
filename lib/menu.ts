/**
 * CleanCrave menu — transcribed from the printed menu.
 * Prices in USD. Macros in grams: p = protein, c = carbs, f = fat.
 *
 * Edit freely: change a price or a macro, add a meal, or add `soldOut: true` to switch off its + button.
 * Every meal and category also carries its Arabic text in `ar` — keep the two in step when you edit.
 * To show a photo inside a meal's ring, put `public/menu/<name>.webp` in place and add `img: "<name>"`.
 */

export type Item = {
  id: string;
  name: string;
  desc: string;
  /** Arabic name and ingredients, shown when the site is switched to Arabic. */
  ar: { name: string; desc: string };
  price: number;
  kcal: number;
  /** Protein, grams. */
  p: number;
  /** Carbs, grams. */
  c: number;
  /** Fat, grams. */
  f: number;
  /** /menu/<img>.webp — optional photo shown inside the macro ring. */
  img?: string;
  soldOut?: boolean;
};

export type Category = {
  id: string;
  /** Arabic title and the line under it. */
  ar: { title: string; script: string };
  title: string;
  /** Italic line under the title. */
  script: string;
  items: Item[];
};

export const menu: Category[] = [
  {
    id: "breakfast",
    ar: { title: "الفطور", script: "بداية قوية" },
    title: "Breakfast",
    script: "start strong",
    items: [
      {
        id: "scrambled-eggs-vegetables",
        ar: { name: "بيض مخفوق مع خضار", desc: "بيض كامل، جبنة موزاريلا، خضار مشكّلة، متبّلة بالملح والفلفل الأسود والبابريكا." },
        name: "Scrambled Eggs & Vegetables",
        desc: "Whole eggs, mozzarella cheese, mixed vegetables, seasoned with salt, black pepper, and paprika.",
        price: 7,
        kcal: 300,
        p: 21,
        c: 3,
        f: 23,
      },
      {
        id: "protein-oats-berries",
        ar: { name: "شوفان بروتين مع توت", desc: "شوفان، بروتين باودر بالفانيلا، بذور اليقطين، فريز طازج، جوز هند مبشور، خلاصة الفانيلا، ومُحلٍّ خالٍ من السعرات." },
        name: "Protein Oats & Berries",
        desc: "Rolled oats, vanilla protein powder, pumpkin seeds, fresh strawberries, shredded coconut, vanilla essence, and zero calorie sweetener.",
        price: 9,
        kcal: 350,
        p: 32,
        c: 34,
        f: 11,
      },
      {
        id: "turkey-cream-cheese-sandwich",
        ar: { name: "ساندويش حبش وجبنة كريمية", desc: "خبز تشاباتا، شرائح صدر الحبش، جبنة كريمية، خس مقرمش، وبندورة طازجة." },
        name: "Turkey & Cream Cheese Sandwich",
        desc: "Ciabatta bread, sliced turkey breast, cream cheese, crisp lettuce, and fresh tomato.",
        price: 8,
        kcal: 400,
        p: 37,
        c: 41,
        f: 10,
      },
      {
        id: "protein-pancakes-berries",
        ar: { name: "بان كيك بروتين مع توت", desc: "طحين، حليب، بيضة كاملة، بروتين باودر، لبن يوناني، بيكنغ باودر، وتوت، محلّاة قليلاً." },
        name: "Protein Pancakes & Berries",
        desc: "Flour, milk, whole egg, protein powder, Greek yogurt, baking powder, and berries, lightly sweetened.",
        price: 10,
        kcal: 340,
        p: 52,
        c: 39,
        f: 10,
      },
    ],
  },
  {
    id: "lunch",
    ar: { title: "الغداء", script: "طاقة من جديد" },
    title: "Lunch",
    script: "refuel",
    items: [
      {
        id: "chicken-tawouk-potatoes",
        ar: { name: "شيش طاووق مع بطاطا", desc: "طاووق دجاج مطهو، زبدة، بطاطا بالقلاية الهوائية، وكبيس." },
        name: "Chicken Tawouk & Potatoes",
        desc: "Cooked chicken taouk, butter, air-fried potatoes, and pickles.",
        price: 10,
        kcal: 500,
        p: 65,
        c: 30,
        f: 11,
      },
      {
        id: "chicken-potato-bowl",
        ar: { name: "بول دجاج وبطاطا", desc: "بطاطا مطهوة، فاهيتا دجاج، موزاريلا مبشورة، بصل، فليفلة، ثوم، صويا صوص، عصير برتقال، وتوابل البيت." },
        name: "Chicken & Potato Bowl",
        desc: "Cooked potato, chicken fajita, shredded mozzarella, onion, bell pepper, garlic, soy sauce, orange juice, and house seasonings.",
        price: 10,
        kcal: 460,
        p: 50,
        c: 31,
        f: 14,
      },
      {
        id: "lebanese-chicken-rice",
        ar: { name: "دجاج وأرز لبناني", desc: "دجاج مطهو، أرز، زبدة، بصل، جزر، بندورة، ثوم، ربّ البندورة، وتوابل البابريكا." },
        name: "Lebanese Chicken & Rice",
        desc: "Cooked chicken, rice, butter, onion, carrot, tomato, garlic, tomato paste, and paprika seasonings.",
        price: 10,
        kcal: 500,
        p: 53,
        c: 46,
        f: 9,
      },
      {
        id: "chicken-pesto-pasta",
        ar: { name: "باستا دجاج بالبيستو", desc: "صدر دجاج مطهو، باستا، صلصة بيستو غنيّة، حليب خالي الدسم، ولمسة من الزبدة." },
        name: "Chicken Pesto Pasta",
        desc: "Cooked chicken breast, pasta, rich pesto sauce, skim milk, and a touch of butter.",
        price: 10,
        kcal: 450,
        p: 51,
        c: 40,
        f: 17,
      },
    ],
  },
  {
    id: "dinner",
    ar: { title: "العشاء", script: "ختامها خفيف" },
    title: "Dinner",
    script: "finish clean",
    items: [
      {
        id: "tuna-coleslaw-salad",
        ar: { name: "سلطة تونا كولسلو", desc: "تونا بالماء، ملفوف أحمر، ملفوف أبيض، جزر، مايونيز لايت، عصير الحامض، ملح، وفلفل أسود." },
        name: "Tuna Coleslaw Salad",
        desc: "Tuna in water, purple cabbage, white cabbage, carrot, light mayonnaise, lemon juice, salt, and black pepper.",
        price: 7,
        kcal: 300,
        p: 52,
        c: 17,
        f: 6,
      },
      {
        id: "turkey-avocado-wrap",
        ar: { name: "راب حبش وأفوكادو", desc: "تورتيلا قمح كامل، صدر حبش، أفوكادو طازج، بندورة، بصل، ملح، وفلفل أسود." },
        name: "Turkey & Avocado Wrap",
        desc: "Whole-wheat tortilla wrap, turkey breast, fresh avocado, tomato, onion, salt, and black pepper.",
        price: 7.5,
        kcal: 300,
        p: 34,
        c: 36,
        f: 11,
      },
      {
        id: "honey-mustard-chicken-salad",
        ar: { name: "سلطة دجاج بالعسل والخردل", desc: "صدر دجاج مطهو، خس، جزر، بندورة كرزية، بصل أحمر، لبن يوناني قليل الدسم، خردل، عسل، ثوم، وبابريكا." },
        name: "Honey Mustard Chicken Salad",
        desc: "Cooked chicken breast, lettuce, carrot, cherry tomatoes, red onion, low-fat Greek yogurt, mustard, honey, garlic, and paprika.",
        price: 8,
        kcal: 450,
        p: 70,
        c: 16,
        f: 12,
      },
      {
        id: "teriyaki-chicken-vegetables",
        ar: { name: "دجاج ترياكي مع خضار", desc: "صدر دجاج مطهو، بصل أخضر، بروكولي، صويا صوص، ثوم، عسل، زنجبيل، وتتبيلة السمسم." },
        name: "Teriyaki Chicken & Vegetables",
        desc: "Cooked chicken breast, green onion, broccoli, soy sauce, garlic, honey, ginger, and sesame seasonings.",
        price: 9.5,
        kcal: 450,
        p: 67,
        c: 15,
        f: 11,
      },
    ],
  },
  {
    id: "snacks",
    ar: { title: "سناك", script: "بين الوجبات" },
    title: "Snacks",
    script: "in between",
    items: [
      {
        id: "greek-yogurt-berries",
        ar: { name: "لبن يوناني مع توت", desc: "لبن يوناني سادة، بروتين باودر بالفانيلا، وفريز طازج أو مجلّد." },
        name: "Greek Yogurt & Berries",
        desc: "Plain Greek yogurt, vanilla protein powder, and fresh or frozen strawberries.",
        price: 10,
        kcal: 300,
        p: 37,
        c: 26,
        f: 5,
      },
      {
        id: "chia-yogurt-pudding",
        ar: { name: "بودينغ اللبن بالشيا", desc: "لبن يوناني سادة، بروتين باودر بالفانيلا، بذور شيا غنيّة بالعناصر الغذائية، وفريز." },
        name: "Chia Yogurt Pudding",
        desc: "Plain Greek yogurt, vanilla protein powder, nutrient-dense chia seeds, and strawberries.",
        price: 8,
        kcal: 311,
        p: 38,
        c: 20,
        f: 9,
      },
      {
        id: "chocolate-protein-yogurt",
        ar: { name: "لبن بروتين بالشوكولا", desc: "لبن يوناني سادة، بروتين باودر بالشوكولا، فريز، شوكولا للدهن خالية من السكر، وزبدة البندق." },
        name: "Chocolate Protein Yogurt",
        desc: "Plain Greek yogurt, chocolate protein powder, strawberries, sugar-free chocolate spread, and hazelnut butter.",
        price: 10,
        kcal: 300,
        p: 37,
        c: 17,
        f: 8,
      },
      {
        id: "banana-protein-yogurt",
        ar: { name: "لبن بروتين بالموز", desc: "شرائح موز، بروتين باودر بالفانيلا، لبن يوناني سادة، توت مشكّل، وخلاصة الفانيلا." },
        name: "Banana & Protein Yogurt",
        desc: "Sliced banana, vanilla protein powder, plain Greek yogurt, mixed berries, and vanilla essence.",
        price: 9,
        kcal: 300,
        p: 38,
        c: 36,
        f: 5,
      },
    ],
  },
];

/** $7 · $7.50 · $28 */
export const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

/** Quick filters on the menu — the "what are you eating for" chips. */
export const goals = [
  { id: "all", label: "Everything", ar: "الكل", test: (_: Item) => true },
  { id: "protein", label: "50 g+ protein", ar: "50 غ بروتين وأكثر", test: (i: Item) => i.p >= 50 },
  { id: "light", label: "350 kcal or less", ar: "350 سعرة أو أقل", test: (i: Item) => i.kcal <= 350 },
  { id: "lowcarb", label: "20 g carbs or less", ar: "20 غ كربوهيدرات أو أقل", test: (i: Item) => i.c <= 20 },
] as const;

export type GoalId = (typeof goals)[number]["id"];

/** Facts for the hero and stats band — always computed from the menu, never typed by hand. */
export function menuStats(items: Item[]) {
  return {
    meals: items.length,
    topProtein: items.reduce((a, b) => (b.p > a.p ? b : a)),
    lightest: Math.min(...items.map((i) => i.kcal)),
    from: Math.min(...items.map((i) => i.price)),
  };
}
