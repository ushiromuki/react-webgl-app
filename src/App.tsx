import { useState, useEffect } from "react";
import DateTimeDisplay from "./components/DateTimeDisplay";
import BackgroundGraphics from "./components/BackgroundGraphics";
import { useWeatherTheme } from "./hooks/useWeatherTheme";
import { GraphicsTheme } from "./types";

// デフォルトのテーマ（データ取得前に表示するため）
const defaultTheme: GraphicsTheme = {
  colors: ["#264653", "#2A9D8F", "#E9C46A", "#F4A261", "#E76F51"],
  category: "default",
  intensity: 0.5,
};

// 天気に対応する絵文字のマッピング
const weatherEmojiMap: Record<string, string> = {
  晴れ: "☀️",
  晴: "☀️",
  曇り: "☁️",
  曇: "☁️",
  雨: "🌧️",
  雪: "❄️",
  雷: "⚡",
  霧: "🌫️",
  晴のち曇: "🌤️",
  晴のち雨: "🌦️",
  晴のち雪: "🌨️",
  曇のち晴: "🌥️",
  曇のち雨: "🌧️",
  曇のち雪: "🌨️",
  雨のち晴: "🌦️",
  雨のち曇: "🌧️",
  雪のち晴: "🌨️",
  雪のち曇: "🌨️",
  曇時々晴: "🌥️",
  曇時々雨: "🌧️",
  曇時々雪: "🌨️",
  曇時々雨か雪: "🌧️❄️",
  曇時々雪か雨: "❄️🌧️",
};

// 天気テロップから絵文字を取得する関数
const getWeatherEmoji = (telop: string): string => {
  return weatherEmojiMap[telop] || "🌈"; // デフォルトの絵文字
};

// 改行を含むテキストをHTMLで表示するための関数
const formatTextWithLineBreaks = (text: string): JSX.Element[] => {
  return text.split("\n").map((line, index) => (
    <span key={index}>
      {line}
      {index < text.split("\n").length - 1 && <br />}
    </span>
  ));
};

// キャッシュステータスに対応するアイコン
const cacheStatusIcons: Record<string, string> = {
  未確認: "❓",
  キャッシュから読み込み: "📦",
  API呼び出し中: "🔄",
  キャッシュ更新完了: "✅",
  エラー発生: "❌",
};

function App() {
  const { weather, theme, loading, error, refetch, cacheStatus } =
    useWeatherTheme();
  const [currentTheme, setCurrentTheme] = useState<GraphicsTheme>(defaultTheme);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [showDescription, setShowDescription] = useState<boolean>(false);

  // テーマが更新されたら現在のテーマを更新
  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme);
      setLastUpdated(new Date().toLocaleString());
    }
  }, [theme]);

  // 手動更新ハンドラー
  const handleManualRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* 背景グラフィックス */}
      <BackgroundGraphics theme={currentTheme} />

      {/* メインコンテンツ */}
      <div className="z-10 text-white p-8 rounded-lg bg-black/30 backdrop-blur-md">
        {/* 日付と時刻の表示 */}
        <DateTimeDisplay className="mb-4" />

        {/* キャッシュステータス */}
        <div className="text-xs text-white/70 flex items-center justify-center gap-1 mb-2">
          <span>{cacheStatusIcons[cacheStatus] || "❓"}</span>
          <span>{cacheStatus}</span>
          {lastUpdated && <span>（最終更新: {lastUpdated}）</span>}
        </div>

        {/* 手動更新ボタン */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleManualRefresh}
            className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors flex items-center gap-1"
            disabled={loading}
          >
            <span>🔄</span>
            <span>{loading ? "更新中..." : "手動更新"}</span>
          </button>
        </div>

        {/* 天気情報（オプション） */}
        {weather && (
          <div className="text-center mt-6 opacity-80 hover:opacity-100 transition-opacity">
            <div className="text-xl">
              {weather.city}, {weather.country}
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="text-4xl">{getWeatherEmoji(weather.main)}</div>
              <div className="text-2xl font-semibold font-roboto">
                {Math.round(weather.temp)}°C
              </div>
            </div>

            {/* Gemini APIによる天気の雰囲気表現と詳細説明 */}
            {theme?.atmosphere && (
              <div className="mt-4 relative">
                {/* クリック可能な雰囲気表現 */}
                <div
                  className="p-3 bg-white/10 rounded-lg max-w-md cursor-pointer hover:bg-white/20 transition-all"
                  onClick={() => setShowDescription(!showDescription)}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm italic">"{theme.atmosphere}"</p>
                    <span className="text-xs text-white/60">ℹ️</span>
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {showDescription
                      ? "クリックで閉じる"
                      : "クリックで詳細を表示"}
                  </div>
                </div>

                {/* 詳細説明（表示/非表示の切り替え） */}
                {showDescription && (
                  <div className="mt-2 text-sm max-w-md text-left bg-black/40 p-3 rounded-lg">
                    <h3 className="text-xs uppercase tracking-wider mb-1 text-white/70">
                      天気の詳細
                    </h3>
                    {formatTextWithLineBreaks(weather.description)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="text-red-300 text-center mt-4">
            <p>天気データの取得に失敗しました</p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-white/20 rounded hover:bg-white/30 transition-colors"
            >
              再試行
            </button>
          </div>
        )}

        {/* ローディング表示 */}
        {loading && !weather && (
          <div className="text-center mt-4">データを読み込み中...</div>
        )}
      </div>

      {/* デバッグ情報（開発時のみ表示） */}
      {import.meta.env.DEV && (
        <div className="absolute bottom-2 left-2 text-xs text-white/50 bg-black/30 p-2 rounded">
          <div>キャッシュステータス: {cacheStatus}</div>
          <div>最終更新: {lastUpdated || "なし"}</div>
        </div>
      )}
    </div>
  );
}

export default App;
