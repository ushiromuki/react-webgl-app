import { useState, useEffect } from "react";
import { WeatherData, GraphicsTheme } from "../types";
import { getTokyoWeather } from "../services/weatherApi";
import { generateGraphicsTheme } from "../services/geminiApi";
import { getThemeFromCache, writeCache } from "../services/cacheUtils";

interface UseWeatherThemeResult {
  weather: WeatherData | null;
  theme: GraphicsTheme | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  cacheStatus: string; // キャッシュステータスを追加
}

// 更新間隔（ミリ秒）- デフォルトは6時間
const DEFAULT_UPDATE_INTERVAL = 6 * 60 * 60 * 1000;

// デバッグモード
const DEBUG_MODE = true;

/**
 * 天気データとそれに基づくグラフィックテーマを取得するカスタムフック
 */
export const useWeatherTheme = (
  updateInterval = DEFAULT_UPDATE_INTERVAL
): UseWeatherThemeResult => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [theme, setTheme] = useState<GraphicsTheme | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [cacheStatus, setCacheStatus] = useState<string>("未確認");

  // 天気データとテーマを取得する関数
  const fetchWeatherAndTheme = async () => {
    setLoading(true);
    setError(null);

    try {
      // まずキャッシュをチェック
      const cachedData = getThemeFromCache();
      
      if (cachedData) {
        if (DEBUG_MODE) {
          console.log("🔄 キャッシュからデータを読み込みました", {
            weather: cachedData.weatherData.main,
            timestamp: new Date(cachedData.weatherData.timestamp).toLocaleString(),
          });
        }
        
        setWeather(cachedData.weatherData);
        setTheme(cachedData.themeData);
        setCacheStatus("キャッシュから読み込み");
        setLoading(false);
        return;
      }
      
      if (DEBUG_MODE) {
        console.log("🔄 キャッシュが無効または存在しないため、新しいデータを取得します");
      }
      
      setCacheStatus("API呼び出し中");
      
      // キャッシュが無効な場合は新しいデータを取得
      const weatherData = await getTokyoWeather();
      setWeather(weatherData);

      // 天気データに基づいてテーマを生成
      const themeData = await generateGraphicsTheme(weatherData);
      setTheme(themeData);
      
      // キャッシュに保存
      writeCache(weatherData, themeData);
      setCacheStatus("キャッシュ更新完了");
      
      if (DEBUG_MODE) {
        console.log("✅ 新しいデータをキャッシュに保存しました", {
          weather: weatherData.main,
          timestamp: new Date().toLocaleString(),
        });
      }
    } catch (err) {
      console.error("天気データまたはテーマの取得に失敗しました:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setCacheStatus("エラー発生");
    } finally {
      setLoading(false);
    }
  };

  // 初回レンダリング時にデータを取得
  useEffect(() => {
    fetchWeatherAndTheme();

    // 定期的な更新
    if (updateInterval > 0) {
      if (DEBUG_MODE) {
        console.log(`🕒 ${updateInterval / (60 * 60 * 1000)}時間ごとに更新するようにタイマーを設定しました`);
      }
      
      const intervalId = setInterval(fetchWeatherAndTheme, updateInterval);

      // クリーンアップ
      return () => clearInterval(intervalId);
    }
  }, [updateInterval]);

  return {
    weather,
    theme,
    loading,
    error,
    refetch: fetchWeatherAndTheme,
    cacheStatus,
  };
};
