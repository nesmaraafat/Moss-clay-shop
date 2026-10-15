/* =========================================================
   Product data. Edit this file to change what the shop shows.
   - image:    the photo shown on cards and on the product page (img/p01.jpg ...)
   - fallback: the illustration shown when that photo is not in /img yet
   To use real photos, save them in /img with the names above (p01.jpg, p02.jpg ...)
   or change the "image" paths here.
   ========================================================= */

window.MC_CATEGORIES = [
  { id: 'all',    label: 'All' },
  { id: 'cups',   label: 'Cups' },
  { id: 'bowls',  label: 'Bowls' },
  { id: 'vases',  label: 'Vases' },
  { id: 'plates', label: 'Plates' },
];

window.MC_PRODUCTS = [
  {
    id: 1, name: 'Textured Cup Moss', category: 'cups', size: '9 × 8 cm, 0.3 L', price: 22,
    image: 'img/p01.jpg', fallback: 'img/p01.svg',
    description: 'A generous cup with a speckled olive glaze that catches the light. The rim is thin, the base is weighted, and the handle fits two fingers. Each cup is made by hand in a small batch, so no two are exactly alike.',
  },
  {
    id: 2, name: 'Coffee Pair Moss', category: 'cups', size: 'Cup 0.2 L, saucer Ø 14 cm', price: 34,
    image: 'img/p02.jpg', fallback: 'img/p02.svg',
    description: 'A cup and saucer for slow mornings. The saucer has a shallow well that keeps the cup steady, and the moss glaze pools softly along the edges. Sold as a pair.',
  },
  {
    id: 3, name: 'Plate Without Rim Moss', category: 'plates', size: 'Ø 26 cm', price: 26,
    image: 'img/p03.jpg', fallback: 'img/p03.svg',
    description: 'A flat, rimless plate for bread, fruit, or a simple dinner. The olive glaze is matte on the surface and glossy at the edge, and the flecks in the clay show through.',
  },
  {
    id: 4, name: 'Salad Bowl Moss', category: 'bowls', size: 'Ø 24 × 9 cm, 1.2 L', price: 38,
    image: 'img/p04.jpg', fallback: 'img/p04.svg',
    description: 'A wide bowl that goes from the table to the fridge and back. The inside is smooth for easy cleaning, and the outside keeps a light, hand-turned texture.',
  },
  {
    id: 13, name: 'Bud Vase Moss', category: 'vases', size: 'Ø 9 × 14 cm', price: 24,
    image: 'img/p13.jpg', fallback: 'img/p13.svg',
    description: 'Small enough for a single stem from the garden, sturdy enough for every day. The olive glaze is speckled and the neck is narrow, so even one flower looks full.',
  },
  {
    id: 5, name: 'Deep Plate Ash', category: 'plates', size: 'Ø 21 × 5 cm', price: 27,
    image: 'img/p05.jpg', fallback: 'img/p05.svg',
    description: 'A deep plate for pasta, soup, or grains. The ash glaze looks like river stone and feels cool to the touch. Stacks neatly in a cupboard.',
  },
  {
    id: 6, name: 'Oval Dish Ash', category: 'plates', size: '26 × 15 cm', price: 32,
    image: 'img/p06.jpg', fallback: 'img/p06.svg',
    description: 'An oval dish for shared plates, roasted vegetables, or a small cheese board. It sits low on the table and is easy to pass around.',
  },
  {
    id: 7, name: 'Textured Cup Ash', category: 'cups', size: '9 × 8 cm, 0.3 L', price: 22,
    image: 'img/p07.jpg', fallback: 'img/p07.svg',
    description: 'The same shape as our moss cup, in a soft gray glaze with a speckled finish. It holds a full mug of tea and stays comfortable to hold.',
  },
  {
    id: 8, name: 'Cup Terra', category: 'cups', size: '8 × 7 cm, 0.2 L', price: 20,
    image: 'img/p08.jpg', fallback: 'img/p08.svg',
    description: 'A small terracotta cup for espresso or tea. The clay is left warm and raw on the outside, so you can feel the marks of the hand-thrown lines.',
  },
  {
    id: 9, name: 'Salad Bowl Terra', category: 'bowls', size: 'Ø 24 × 9 cm, 1.2 L', price: 38,
    image: 'img/p09.jpg', fallback: 'img/p09.svg',
    description: 'A wide terracotta bowl for salads, fruit, or noodles. The warm glaze looks good with green food, and the thick walls keep the bowl steady in your hands.',
  },
  {
    id: 14, name: 'Bottle Vase Ash', category: 'vases', size: 'Ø 10 × 24 cm', price: 36,
    image: 'img/p14.jpg', fallback: 'img/p14.svg',
    description: 'A slim bottle vase with a soft gray glaze. It holds a few dried stems or a branch from the park, and it is heavy enough at the base to stay steady.',
  },
  {
    id: 10, name: 'Earthy Clay Mug', category: 'cups', size: '9 × 9 cm, 0.35 L', price: 32,
    image: 'img/mug1.png', fallback: 'img/p10.svg',
    description: 'Crafted slowly by hand with natural terracotta clay for your quiet coffee moments. The moss green glaze varies from mug to mug, so yours will be one of a kind.',
  },
  {
    id: 11, name: 'Coffee Pair Terra', category: 'cups', size: 'Cup 0.2 L, saucer Ø 14 cm', price: 34,
    image: 'img/p11.jpg', fallback: 'img/p11.svg',
    description: 'A terracotta cup and saucer with a warm, glossy glaze. The saucer is deep enough to catch drips, and the cup fits a double espresso or a small cappuccino.',
  },
  {
    id: 12, name: 'Dinner Plate Dune', category: 'plates', size: 'Ø 27 cm', price: 28,
    image: 'img/p12.jpg', fallback: 'img/p12.svg',
    description: 'A dinner plate in a warm cream glaze the color of sand. The wide well is easy to eat from, and the soft edge feels good in the hand.',
  },
  {
    id: 15, name: 'Tall Vase Terra', category: 'vases', size: 'Ø 15 × 30 cm', price: 54,
    image: 'img/p15.jpg', fallback: 'img/p15.svg',
    description: 'A tall terracotta vase with a flared lip and a wide belly. The warm glaze looks good empty or with a few long branches, and every one is thrown by hand.',
  },
  {
    id: 16, name: 'Breakfast Bowl Dune', category: 'bowls', size: 'Ø 15 × 7 cm, 0.5 L', price: 26,
    image: 'img/p16.jpg', fallback: 'img/p16.svg',
    description: 'A small bowl in a warm cream glaze, made for oats, yogurt, or fruit. It fits comfortably in one hand, and the rim is smooth for easy eating.',
  },
];
