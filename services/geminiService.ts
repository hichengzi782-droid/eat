import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the Gemini AI client
export const generateFoodIdeas = async (category: string = "午餐/晚餐"): Promise<string[]> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return ["🍕 披萨", "🍔 汉堡", "🍣 寿司", "🥗 轻食沙拉", "🌮 塔可", "🍝 意面", "🍲 火锅", "🍱 便当", "🍛 咖喱", "🥘 麻辣香锅", "🍗 炸鸡", "🥟 水饺"]; // Fallback
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const prompt = `生成 12 个不同的、受欢迎的、好吃的食物选项，供用户决定今天吃什么。
    重点类别: ${category}。
    要求：
    1. 语言必须是简体中文。
    2. 每个名称前面加上一个匹配的 Emoji (例如: "🍜 拉面")。
    3. 名称保持简短 (Emoji + 5个汉字以内)。
    4. 风格要诱人。`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonStr = response.text;
    if (!jsonStr) return [];
    
    const data = JSON.parse(jsonStr);
    if (Array.isArray(data)) {
      return data;
    }
    return [];

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a fallback list on error so the app doesn't break
    return ["🍕 披萨", "🍜 拉面", "🍲 火锅", "🍔 汉堡", "🍛 咖喱", "🥘 麻辣香锅", "🥗 凯撒沙拉", "🍱 鳗鱼饭", "🌮 墨西哥卷", "🥪 三明治", "🍗 炸鸡", "🥟 水饺"];
  }
};

export const getCheekyComment = async (food: string): Promise<string> => {
  if (!apiKey) return `哇！就决定是 ${food} 啦！😋`;

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `用户通过转盘抽到了 "${food}" 作为今天的一餐。
      请给出一个简短的（20字以内）、非常可爱、语气活泼或者带点幽默感的中文评价。
      可以使用颜文字或Emoji。
      例如：“哇！热量炸弹我来啦！🤩” 或者 “听起来很不错哦~ 😋”`,
    });
    return response.text || `哇！就决定是 ${food} 啦！😋`;
  } catch (error) {
    return `哇！就决定是 ${food} 啦！😋`;
  }
};