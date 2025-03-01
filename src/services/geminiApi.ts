import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeatherData, GraphicsTheme } from "../types";

// APIキーはCloudflare Pagesの環境変数から取得する想定
// ローカル開発時は.envファイルなどで管理
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Gemini APIのモデル名
const MODEL_NAME = "gemini-2.0-flash";

// デバッグモード（APIコール回数を確認するため）
const DEBUG_MODE = true;

// Gemini APIクライアントの初期化
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

/**
 * 天気データに基づいてグラフィックテーマを生成
 */
export const generateGraphicsTheme = async (
  weatherData: WeatherData
): Promise<GraphicsTheme> => {
  try {
    if (DEBUG_MODE) {
      console.log("🔄 Gemini API呼び出し: 天気データからテーマを生成します", {
        weather: weatherData.main,
        description: weatherData.description
      });
    }
    
    // 天気データに基づいたプロンプトを作成
    const prompt = `
    あなたは、WebGLグラフィックスのためのテーマを生成するAIアシスタントです。
    以下の天気データと天気概況文に基づいて、美しいビジュアル表現のためのカラーパレットとカテゴリを提案してください。
    
    天気データ:
    - 主な天気: ${weatherData.main}
    - 詳細説明: ${weatherData.description}
    - 気温: ${weatherData.temp}℃
    
    天気概況文の内容から、現在の天気の雰囲気を表現するカラーパレットを生成してください。
    例えば、晴れの日は明るく暖かい色、雨の日は青や灰色の落ち着いた色、曇りの日は柔らかい中間色などを選んでください。
    
    以下の形式で回答してください:
    {
      "colors": ["#HEXCOLOR1", "#HEXCOLOR2", "#HEXCOLOR3", "#HEXCOLOR4", "#HEXCOLOR5"],
      "category": "sunny/rainy/cloudy/night/etc",
      "intensity": 0.X (0.0〜1.0の範囲で、天気の強度を表す数値),
      "atmosphere": "天気概況文から感じられる雰囲気を短く表現した文章"
    }
    
    カラーパレットは、天気の雰囲気を表現する5つの色を含めてください。
    カテゴリは、天気の種類を表す単語を選んでください（例: sunny, rainy, cloudy, foggy, snowy, night, stormy など）。
    強度は、天気の強さや印象を0.0〜1.0の範囲で表してください（例: 激しい雨なら0.8、小雨なら0.3など）。
    雰囲気は、天気概況文から感じられる雰囲気を短く表現した短歌を日本語で記述してください。
    `;

    // Gemini APIにリクエストを送信
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSONを抽出して解析
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("APIレスポンスからJSONが見つかりませんでした");
    }

    const jsonResponse = JSON.parse(jsonMatch[0]);

    // 型チェック
    if (
      !Array.isArray(jsonResponse.colors) ||
      typeof jsonResponse.category !== "string" ||
      typeof jsonResponse.intensity !== "number" ||
      typeof jsonResponse.atmosphere !== "string"
    ) {
      throw new Error("APIレスポンスの形式が不正です");
    }

    if (DEBUG_MODE) {
      console.log("✅ Gemini APIからテーマを正常に取得しました", jsonResponse);
    }

    return {
      colors: jsonResponse.colors,
      category: jsonResponse.category,
      intensity: jsonResponse.intensity,
      atmosphere: jsonResponse.atmosphere, // 新しく追加した雰囲気の説明
    };
  } catch (error) {
    console.error("グラフィックテーマの生成に失敗しました:", error);

    // エラー時のフォールバックテーマ
    // 天気の main 属性に基づいて基本的なテーマを提供
    return getFallbackTheme(weatherData.main);
  }
};

/**
 * Gemini APIが失敗した場合のフォールバックテーマ
 */
const getFallbackTheme = (weatherMain: string): GraphicsTheme => {
  if (DEBUG_MODE) {
    console.warn("⚠️ フォールバックテーマを使用します", { weather: weatherMain });
  }
  
  // 天気タイプに基づいたテーマの選択
  switch (weatherMain) {
    case "晴れ":
    case "晴":
      return {
        colors: ["#E8F1F2", "#B3DEF6", "#4EA5D9", "#2A628F", "#13293D"],
        category: "sunny",
        intensity: 0.8,
        atmosphere:
          "明るく爽やかな晴れの日。太陽の光が降り注ぎ、心地よい風が吹いています。",
      };

    case "曇り":
    case "曇":
    case "曇時々晴":
    case "晴のち曇":
      return {
        colors: ["#CCD5AE", "#E9EDC9", "#FEFAE0", "#FAEDCD", "#D4A373"],
        category: "cloudy",
        intensity: 0.4,
        atmosphere: "穏やかな曇り空。柔らかな光が雲を通して降り注いでいます。",
      };

    case "雨":
    case "曇時々雨":
    case "晴のち雨":
    case "曇のち雨":
      return {
        colors: ["#1A1A2E", "#16213E", "#0F3460", "#5A7D7C", "#A0C1D1"],
        category: "rainy",
        intensity: 0.6,
        atmosphere:
          "静かに降る雨。地面に落ちる雨粒の音が心地よいリズムを刻んでいます。",
      };

    case "雪":
    case "曇時々雪":
    case "雨か雪":
    case "曇時々雨か雪":
      return {
        colors: ["#F1FAEE", "#A8DADC", "#457B9D", "#1D3557", "#E63946"],
        category: "snowy",
        intensity: 0.5,
        atmosphere:
          "静かに舞い降りる雪。世界が白く染まり、音が吸い込まれていくような静けさがあります。",
      };

    default:
      // デフォルトテーマ
      return {
        colors: ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
        category: "default",
        intensity: 0.5,
        atmosphere: "穏やかな一日。空気は清々しく、心地よい風が吹いています。",
      };
  }
};
