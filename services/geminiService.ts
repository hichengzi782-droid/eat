import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the Gemini AI client
export const generateFoodIdeas = async (category: string = "下午茶"): Promise<string[]> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return ["🧋 珍珠奶茶", "🍰 草莓蛋糕", "🧁 纸杯蛋糕", "🧇 现烤华夫", "🥐 牛角面包", "🍮 焦糖布丁", "🍦 冰淇淋", "🍪 曲奇饼干", "🍡 糯米糍", "🥯 贝果", "🥤 冰柠檬茶", "🍟 薯条炸鸡"]; // Fallback
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const prompt = `生成 12 个不同的、受欢迎的、好吃的食物选项，供用户决定今天吃什么。
    重点类别: ${category}。
    要求：
    1. 语言必须是简体中文。
    2. 每个名称前面加上一个匹配的 Emoji (例如: "🍰 蛋糕")。
    3. 名称保持简短 (Emoji + 5个汉字以内)。
    4. 风格要诱人，适合下午茶或零食时间。`;

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
    return ["🍩 甜甜圈", "☕ 热拿铁", "🍰 提拉米苏", "🧉 抹茶拿铁", "🥧 蛋挞", "🥞 松饼", "🍧 绵绵冰", "🍢 关东煮", "🍪 巧克力曲奇", "🥭 杨枝甘露", "🥪 三明治", "🥐 可颂"];
  }
};

export const getCheekyComment = async (food: string): Promise<string> => {
  if (!apiKey) return `哇！享受美味的 ${food} 时光吧！😋`;

  const ai = new GoogleGenAI({ apiKey: apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `用户通过转盘抽到了 "${food}" 作为今天的下午茶。
      请给出一个简短的（20字以内）、非常可爱、语气活泼或者带点幽默感的中文评价。
      可以使用颜文字或Emoji。
      例如：“糖分快乐我来啦！🤩” 或者 “这个超赞的！😋”`,
    });
    return response.text || `哇！享受美味的 ${food} 时光吧！😋`;
  } catch (error) {
    return `哇！享受美味的 ${food} 时光吧！😋`;
  }
};