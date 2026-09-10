// Built-in food nutrition database
// Values are per 100g unless specified
const foodDatabase = {
  // Pakistani / South Asian Foods
  "chicken biryani": { calories: 150, protein: 8, carbs: 18, fats: 5, serving: "per 100g" },
  "biryani": { calories: 150, protein: 8, carbs: 18, fats: 5, serving: "per 100g" },
  "beef biryani": { calories: 170, protein: 10, carbs: 18, fats: 6, serving: "per 100g" },
  "mutton biryani": { calories: 180, protein: 9, carbs: 17, fats: 8, serving: "per 100g" },
  "pulao": { calories: 130, protein: 4, carbs: 22, fats: 3, serving: "per 100g" },
  "chapati": { calories: 240, protein: 7, carbs: 50, fats: 1.5, serving: "per 100g" },
  "roti": { calories: 240, protein: 7, carbs: 50, fats: 1.5, serving: "per 100g" },
  "naan": { calories: 290, protein: 8, carbs: 50, fats: 5, serving: "per 100g" },
  "paratha": { calories: 300, protein: 6, carbs: 40, fats: 13, serving: "per 100g" },
  "daal": { calories: 116, protein: 9, carbs: 20, fats: 0.4, serving: "per 100g" },
  "dal": { calories: 116, protein: 9, carbs: 20, fats: 0.4, serving: "per 100g" },
  "chana dal": { calories: 120, protein: 8, carbs: 22, fats: 1, serving: "per 100g" },
  "masoor dal": { calories: 108, protein: 9, carbs: 18, fats: 0.3, serving: "per 100g" },
  "moong dal": { calories: 105, protein: 7, carbs: 19, fats: 0.4, serving: "per 100g" },
  "haleem": { calories: 150, protein: 10, carbs: 15, fats: 5, serving: "per 100g" },
  "nihari": { calories: 180, protein: 12, carbs: 8, fats: 11, serving: "per 100g" },
  "karahi chicken": { calories: 170, protein: 15, carbs: 4, fats: 10, serving: "per 100g" },
  "karahi gosht": { calories: 200, protein: 14, carbs: 4, fats: 14, serving: "per 100g" },
  "chicken karahi": { calories: 170, protein: 15, carbs: 4, fats: 10, serving: "per 100g" },
  "butter chicken": { calories: 175, protein: 14, carbs: 6, fats: 10, serving: "per 100g" },
  "chicken tikka": { calories: 148, protein: 22, carbs: 3, fats: 5, serving: "per 100g" },
  "seekh kebab": { calories: 200, protein: 16, carbs: 5, fats: 13, serving: "per 100g" },
  "chapli kebab": { calories: 250, protein: 14, carbs: 8, fats: 18, serving: "per 100g" },
  "samosa": { calories: 260, protein: 5, carbs: 30, fats: 14, serving: "per 100g" },
  "pakora": { calories: 280, protein: 6, carbs: 25, fats: 18, serving: "per 100g" },
  "aloo gosht": { calories: 140, protein: 10, carbs: 10, fats: 7, serving: "per 100g" },
  "qorma": { calories: 165, protein: 12, carbs: 6, fats: 10, serving: "per 100g" },
  "korma": { calories: 165, protein: 12, carbs: 6, fats: 10, serving: "per 100g" },
  "saag": { calories: 80, protein: 4, carbs: 8, fats: 4, serving: "per 100g" },
  "palak paneer": { calories: 130, protein: 8, carbs: 6, fats: 9, serving: "per 100g" },
  "chana masala": { calories: 120, protein: 7, carbs: 18, fats: 3, serving: "per 100g" },
  "aloo keema": { calories: 150, protein: 10, carbs: 12, fats: 7, serving: "per 100g" },
  "keema": { calories: 170, protein: 14, carbs: 4, fats: 11, serving: "per 100g" },
  "raita": { calories: 50, protein: 3, carbs: 4, fats: 2, serving: "per 100g" },
  "lassi": { calories: 72, protein: 3, carbs: 10, fats: 2, serving: "per 100g" },
  "kheer": { calories: 140, protein: 4, carbs: 22, fats: 4, serving: "per 100g" },
  "gulab jamun": { calories: 320, protein: 5, carbs: 50, fats: 12, serving: "per 100g" },
  "jalebi": { calories: 370, protein: 2, carbs: 65, fats: 12, serving: "per 100g" },

  // Proteins
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: "per 100g" },
  "chicken breast grilled": { calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: "per 100g" },
  "grilled chicken": { calories: 165, protein: 31, carbs: 0, fats: 3.6, serving: "per 100g" },
  "chicken thigh": { calories: 209, protein: 26, carbs: 0, fats: 11, serving: "per 100g" },
  "chicken leg": { calories: 184, protein: 26, carbs: 0, fats: 8, serving: "per 100g" },
  "chicken wings": { calories: 203, protein: 30, carbs: 0, fats: 8, serving: "per 100g" },
  "beef steak": { calories: 271, protein: 26, carbs: 0, fats: 18, serving: "per 100g" },
  "beef mince": { calories: 250, protein: 17, carbs: 0, fats: 20, serving: "per 100g" },
  "mutton": { calories: 258, protein: 25, carbs: 0, fats: 17, serving: "per 100g" },
  "lamb": { calories: 258, protein: 25, carbs: 0, fats: 17, serving: "per 100g" },
  "fish fillet": { calories: 105, protein: 22, carbs: 0, fats: 1.7, serving: "per 100g" },
  "salmon": { calories: 208, protein: 20, carbs: 0, fats: 13, serving: "per 100g" },
  "tuna": { calories: 130, protein: 28, carbs: 0, fats: 1, serving: "per 100g" },
  "shrimp": { calories: 99, protein: 24, carbs: 0.2, fats: 0.3, serving: "per 100g" },
  "prawns": { calories: 99, protein: 24, carbs: 0.2, fats: 0.3, serving: "per 100g" },
  "egg boiled": { calories: 155, protein: 13, carbs: 1.1, fats: 11, serving: "per 100g" },
  "egg": { calories: 155, protein: 13, carbs: 1.1, fats: 11, serving: "per 100g" },
  "egg fried": { calories: 196, protein: 14, carbs: 1, fats: 15, serving: "per 100g" },
  "omelette": { calories: 154, protein: 11, carbs: 1.6, fats: 12, serving: "per 100g" },
  "paneer": { calories: 265, protein: 18, carbs: 1.2, fats: 21, serving: "per 100g" },
  "tofu": { calories: 76, protein: 8, carbs: 1.9, fats: 4.8, serving: "per 100g" },
  "whey protein": { calories: 400, protein: 80, carbs: 10, fats: 5, serving: "per 100g" },
  "protein shake": { calories: 120, protein: 24, carbs: 3, fats: 1.5, serving: "per 100g" },

  // Carbs / Grains
  "rice": { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: "per 100g" },
  "white rice": { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: "per 100g" },
  "brown rice": { calories: 112, protein: 2.6, carbs: 24, fats: 0.9, serving: "per 100g" },
  "jasmine rice": { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, serving: "per 100g" },
  "oats": { calories: 389, protein: 17, carbs: 66, fats: 7, serving: "per 100g" },
  "oatmeal": { calories: 68, protein: 2.5, carbs: 12, fats: 1.4, serving: "per 100g" },
  "bread": { calories: 265, protein: 9, carbs: 49, fats: 3.2, serving: "per 100g" },
  "white bread": { calories: 265, protein: 9, carbs: 49, fats: 3.2, serving: "per 100g" },
  "whole wheat bread": { calories: 247, protein: 13, carbs: 41, fats: 3.4, serving: "per 100g" },
  "pasta": { calories: 131, protein: 5, carbs: 25, fats: 1.1, serving: "per 100g" },
  "noodles": { calories: 138, protein: 4.5, carbs: 25, fats: 2, serving: "per 100g" },
  "sweet potato": { calories: 86, protein: 1.6, carbs: 20, fats: 0.1, serving: "per 100g" },
  "potato": { calories: 77, protein: 2, carbs: 17, fats: 0.1, serving: "per 100g" },
  "french fries": { calories: 312, protein: 3.4, carbs: 41, fats: 15, serving: "per 100g" },
  "corn": { calories: 86, protein: 3.2, carbs: 19, fats: 1.2, serving: "per 100g" },

  // Vegetables
  "broccoli": { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, serving: "per 100g" },
  "spinach": { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, serving: "per 100g" },
  "cucumber": { calories: 15, protein: 0.7, carbs: 3.6, fats: 0.1, serving: "per 100g" },
  "tomato": { calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, serving: "per 100g" },
  "onion": { calories: 40, protein: 1.1, carbs: 9.3, fats: 0.1, serving: "per 100g" },
  "carrot": { calories: 41, protein: 0.9, carbs: 10, fats: 0.2, serving: "per 100g" },
  "bell pepper": { calories: 31, protein: 1, carbs: 6, fats: 0.3, serving: "per 100g" },
  "lettuce": { calories: 15, protein: 1.4, carbs: 2.9, fats: 0.2, serving: "per 100g" },
  "mushroom": { calories: 22, protein: 3.1, carbs: 3.3, fats: 0.3, serving: "per 100g" },
  "cabbage": { calories: 25, protein: 1.3, carbs: 6, fats: 0.1, serving: "per 100g" },
  "cauliflower": { calories: 25, protein: 2, carbs: 5, fats: 0.3, serving: "per 100g" },
  "salad": { calories: 20, protein: 1.5, carbs: 3, fats: 0.3, serving: "per 100g" },

  // Fruits
  "banana": { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, serving: "per 100g" },
  "apple": { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, serving: "per 100g" },
  "mango": { calories: 60, protein: 0.8, carbs: 15, fats: 0.4, serving: "per 100g" },
  "orange": { calories: 47, protein: 0.9, carbs: 12, fats: 0.1, serving: "per 100g" },
  "grapes": { calories: 69, protein: 0.7, carbs: 18, fats: 0.2, serving: "per 100g" },
  "watermelon": { calories: 30, protein: 0.6, carbs: 8, fats: 0.2, serving: "per 100g" },
  "strawberry": { calories: 32, protein: 0.7, carbs: 8, fats: 0.3, serving: "per 100g" },
  "dates": { calories: 277, protein: 1.8, carbs: 75, fats: 0.2, serving: "per 100g" },

  // Dairy
  "milk": { calories: 42, protein: 3.4, carbs: 5, fats: 1, serving: "per 100g" },
  "whole milk": { calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, serving: "per 100g" },
  "yogurt": { calories: 59, protein: 10, carbs: 3.6, fats: 0.4, serving: "per 100g" },
  "greek yogurt": { calories: 59, protein: 10, carbs: 3.6, fats: 0.4, serving: "per 100g" },
  "cheese": { calories: 402, protein: 25, carbs: 1.3, fats: 33, serving: "per 100g" },
  "butter": { calories: 717, protein: 0.9, carbs: 0.1, fats: 81, serving: "per 100g" },
  "cream": { calories: 340, protein: 2, carbs: 3, fats: 36, serving: "per 100g" },

  // Nuts & Seeds
  "almonds": { calories: 579, protein: 21, carbs: 22, fats: 50, serving: "per 100g" },
  "peanuts": { calories: 567, protein: 26, carbs: 16, fats: 49, serving: "per 100g" },
  "peanut butter": { calories: 588, protein: 25, carbs: 20, fats: 50, serving: "per 100g" },
  "walnuts": { calories: 654, protein: 15, carbs: 14, fats: 65, serving: "per 100g" },
  "cashews": { calories: 553, protein: 18, carbs: 30, fats: 44, serving: "per 100g" },
  "chia seeds": { calories: 486, protein: 17, carbs: 42, fats: 31, serving: "per 100g" },

  // Fast Food / Snacks
  "burger": { calories: 295, protein: 17, carbs: 24, fats: 14, serving: "per 100g" },
  "pizza": { calories: 266, protein: 11, carbs: 33, fats: 10, serving: "per 100g" },
  "shawarma": { calories: 190, protein: 14, carbs: 15, fats: 8, serving: "per 100g" },
  "sandwich": { calories: 250, protein: 10, carbs: 28, fats: 11, serving: "per 100g" },
  "fried chicken": { calories: 246, protein: 19, carbs: 10, fats: 15, serving: "per 100g" },
  "chicken nuggets": { calories: 296, protein: 15, carbs: 18, fats: 18, serving: "per 100g" },
  "hot dog": { calories: 290, protein: 10, carbs: 24, fats: 17, serving: "per 100g" },
  "chips": { calories: 536, protein: 7, carbs: 53, fats: 35, serving: "per 100g" },
  "popcorn": { calories: 375, protein: 11, carbs: 74, fats: 4.5, serving: "per 100g" },

  // Drinks
  "chai": { calories: 45, protein: 1, carbs: 8, fats: 1, serving: "per 100g" },
  "tea": { calories: 45, protein: 1, carbs: 8, fats: 1, serving: "per 100g" },
  "coffee": { calories: 2, protein: 0.3, carbs: 0, fats: 0, serving: "per 100g" },
  "cola": { calories: 42, protein: 0, carbs: 11, fats: 0, serving: "per 100g" },
  "juice": { calories: 45, protein: 0.5, carbs: 11, fats: 0.1, serving: "per 100g" },
  "orange juice": { calories: 45, protein: 0.7, carbs: 10, fats: 0.2, serving: "per 100g" },
  "mango shake": { calories: 90, protein: 2, carbs: 18, fats: 1.5, serving: "per 100g" },
  "banana shake": { calories: 85, protein: 3, carbs: 16, fats: 1, serving: "per 100g" },
  "protein smoothie": { calories: 100, protein: 15, carbs: 10, fats: 2, serving: "per 100g" },

  // Oils & Condiments
  "olive oil": { calories: 884, protein: 0, carbs: 0, fats: 100, serving: "per 100g" },
  "honey": { calories: 304, protein: 0.3, carbs: 82, fats: 0, serving: "per 100g" },
  "ketchup": { calories: 112, protein: 1.7, carbs: 26, fats: 0.1, serving: "per 100g" },
  "mayonnaise": { calories: 680, protein: 1, carbs: 0.6, fats: 75, serving: "per 100g" },
};

// Fuzzy search function
export function findFood(query) {
  const normalizedQuery = query.toLowerCase().trim();

  // Direct match
  if (foodDatabase[normalizedQuery]) {
    return { name: normalizedQuery, ...foodDatabase[normalizedQuery] };
  }

  // Partial match
  const matches = [];
  for (const [key, value] of Object.entries(foodDatabase)) {
    if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
      matches.push({ name: key, ...value, score: key === normalizedQuery ? 1 : 0.8 });
    }
  }

  // Word-level fuzzy match
  if (matches.length === 0) {
    const queryWords = normalizedQuery.split(/\s+/);
    for (const [key, value] of Object.entries(foodDatabase)) {
      const keyWords = key.split(/\s+/);
      const matchCount = queryWords.filter(qw => keyWords.some(kw => kw.includes(qw) || qw.includes(kw))).length;
      if (matchCount > 0) {
        matches.push({ name: key, ...value, score: matchCount / Math.max(queryWords.length, keyWords.length) });
      }
    }
  }

  // Sort by score and return best match
  matches.sort((a, b) => b.score - a.score);
  return matches.length > 0 ? matches[0] : null;
}

// Calculate nutrition based on amount
export function calculateNutrition(foodName, amountInGrams) {
  const food = findFood(foodName);
  if (!food) {
    return null;
  }

  const multiplier = amountInGrams / 100;
  return {
    dishName: food.name,
    amount: amountInGrams,
    unit: 'g',
    calories: Math.round(food.calories * multiplier),
    protein: Math.round(food.protein * multiplier * 10) / 10,
    carbs: Math.round(food.carbs * multiplier * 10) / 10,
    fats: Math.round(food.fats * multiplier * 10) / 10,
  };
}

export default foodDatabase;
