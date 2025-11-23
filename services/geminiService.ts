
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DessertConcept } from "../types";

// Schema for the structured JSON response
const dessertSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The creative and elegant name of the dessert.",
    },
    description: {
      type: Type.STRING,
      description: "A mouth-watering, detailed description of the dessert concept in Japanese.",
    },
    imagePromptEn: {
      type: Type.STRING,
      description: "A highly detailed, photorealistic prompt in English to generate an image of this dessert. Focus on lighting, texture, and plating. Do not include text in the image.",
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Ingredient name in Japanese" },
          amount: { type: Type.STRING, description: "Quantity (e.g., 200g, 1 tsp)" },
        },
        required: ["name", "amount"],
      },
    },
    roadmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER },
          title: { type: Type.STRING, description: "Short title of the step" },
          instruction: { type: Type.STRING, description: "Detailed instruction for this step" },
        },
        required: ["step", "title", "instruction"],
      },
    },
    estimatedCost: {
      type: Type.STRING,
      description: "Estimated production cost per serving in Japanese Yen (e.g. '約350円').",
    },
    recommendedPrice: {
      type: Type.STRING,
      description: "Recommended selling price per serving in Japanese Yen (e.g. '800円 - 900円').",
    },
  },
  required: ["title", "description", "imagePromptEn", "ingredients", "roadmap", "estimatedCost", "recommendedPrice"],
};

export const generateDessertConcept = async (
  keyword: string, 
  options?: { targetCost?: string, targetPrice?: string }
): Promise<DessertConcept> => {
  // Always create a new instance to ensure we pick up the latest selected key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const costInstruction = options?.targetCost ? `目標原価: ${options.targetCost}程度になるように構成してください。` : "";
  const priceInstruction = options?.targetPrice ? `目標売値: ${options.targetPrice}程度で販売できるようにしてください。` : "";

  const prompt = `
    キーワード「${keyword}」に基づいた、斬新で美しいスイーツのアイデアを考案してください。
    既存のレシピの単なるコピーではなく、味の組み合わせ、食感、見た目において創造的である必要があります。
    また、実際に作成可能なレシピ（ロードマップ）と材料リストを提供してください。
    
    ${costInstruction}
    ${priceInstruction}
    
    ロードマップは、プロのパティシエが教えるように、コツや注意点を含めて詳しく記述してください。
    また、材料費に基づいた概算の「想定原価」と、利益率や市場価値を考慮した「推奨売価」も算出してください。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: dessertSchema,
      systemInstruction: "You are a world-renowned pastry chef known for avant-garde and photogenic creations. Provide detailed, expert-level instructions.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No concept generated");
  
  return JSON.parse(text) as DessertConcept;
};

export const refineDessertConcept = async (currentConcept: DessertConcept, feedback: string): Promise<DessertConcept> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    以下の現在のスイーツのアイデアに対して、ユーザーからの要望（フィードバック）を反映させて、レシピと情報を修正・再生成してください。
    
    【現在のアイデア】
    ${JSON.stringify(currentConcept)}

    【ユーザーからの要望】
    ${feedback}

    要望を反映し、タイトル、説明、材料、ロードマップ、原価・売価、そして画像生成プロンプト(imagePromptEn)の全てを整合性が取れるように更新してください。
    特にimagePromptEnは、見た目の変更が確実に反映されるように詳細に書き直してください。
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: dessertSchema,
      systemInstruction: "You are a world-renowned pastry chef. Modify the existing recipe based on the customer's feedback while maintaining culinary excellence and feasibility.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No concept generated");

  return JSON.parse(text) as DessertConcept;
};

export const generateDessertImage = async (imagePrompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Switch to gemini-2.5-flash-image for faster, efficient generation without Pro requirements
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Generate a high-quality, photorealistic image of the following dessert: ${imagePrompt}. 
                 Style: Professional food photography, macro details, appetizing plating, soft natural lighting.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "4:3",
        // imageSize is only supported in Pro models, removed for Flash Image
      }
    },
  });

  const candidates = response.candidates;
  if (candidates && candidates.length > 0) {
     const parts = candidates[0].content?.parts;
     if (parts) {
         for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${part.inlineData.data}`;
            }
         }
     }
     
     if (candidates[0].finishReason && candidates[0].finishReason !== 'STOP') {
         throw new Error(`Generation stopped: ${candidates[0].finishReason}`);
     }
  }
  
  console.warn("Full response debug:", response);
  throw new Error("No image data found in response");
};
