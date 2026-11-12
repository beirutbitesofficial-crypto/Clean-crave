/**
 * CleanCrave menu — transcribed from the printed menu.
 * Prices in USD. Macros in grams: p = protein, c = carbs, f = fat.
 *
 * Edit freely: change a price or a macro, add a meal, or add `soldOut: true` to switch off its + button.
 * To show a photo inside a meal's ring, put `public/menu/<name>.webp` in place and add `img: "<name>"`.
 */

export type Item = {
  id: string;
  name: string;
  desc: string;
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
  title: string;
  /** Italic line under the title. */
  script: string;
  items: Item[];
};

export const menu: Category[] = [
  {
    id: "breakfast",
    title: "Breakfast",
    script: "start strong",
    items: [
      {
        id: "scrambled-eggs-vegetables",
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
    title: "Lunch",
    script: "refuel",
    items: [
      {
        id: "chicken-tawouk-potatoes",
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
    title: "Dinner",
    script: "finish clean",
    items: [
      {
        id: "tuna-coleslaw-salad",
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
        name: "Teriyaki Chicken & Vegetables",
        desc: "Cooked chicken breast, green onion, broccoli, soy sauce, garlic, honey, ginger, and sesame seasonings.",
        price: 9.5,
        kcal: 450,
        p: 67,
        c: 15,
        f: 11,
      },
      {
        id: "chicken-caesar-salad",
        name: "Chicken Caesar Salad",
        // As printed on the menu (the name says chicken, the ingredients say steak) — confirm with the kitchen.
        desc: "Cooked lean steak, crisp lettuce, Greek yogurt, light mayonnaise, mustard, rice vinegar, and black pepper.",
        price: 10,
        kcal: 500,
        p: 60,
        c: 6,
        f: 25,
      },
    ],
  },
  {
    id: "snacks",
    title: "Snacks",
    script: "in between",
    items: [
      {
        id: "greek-yogurt-berries",
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

export const allItems: Item[] = menu.flatMap((c) => c.items);

const byId = new Map(allItems.map((i) => [i.id, i]));
export const findItem = (id: string) => byId.get(id);

/** $7 · $7.50 · $28 */
export const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

/** Quick filters on the menu — the "what are you eating for" chips. */
export const goals = [
  { id: "all", label: "Everything", test: (_: Item) => true },
  { id: "protein", label: "50 g+ protein", test: (i: Item) => i.p >= 50 },
  { id: "light", label: "350 kcal or less", test: (i: Item) => i.kcal <= 350 },
  { id: "lowcarb", label: "20 g carbs or less", test: (i: Item) => i.c <= 20 },
] as const;

export type GoalId = (typeof goals)[number]["id"];

/** Facts for the hero and stats band — always computed from the menu above, never typed by hand. */
export const stats = {
  meals: allItems.length,
  topProtein: allItems.reduce((a, b) => (b.p > a.p ? b : a)),
  lightest: Math.min(...allItems.map((i) => i.kcal)),
  from: Math.min(...allItems.map((i) => i.price)),
};
