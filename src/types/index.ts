export interface WeatherData {
  main: string;        // 天気の主な状態 (e.g., "Clear", "Rain", "Clouds")
  description: string; // 天気の詳細説明
  temp: number;        // 気温（摂氏）
  humidity: number;    // 湿度（%）
  windSpeed: number;   // 風速（m/s）
  icon: string;        // 天気アイコンコード
  city: string;        // 都市名
  country: string;     // 国コード
  time: number;        // タイムスタンプ
}

export interface GraphicsTheme {
  colors: string[];    // カラーパレット（HEX形式）
  category: string;    // グラフィックカテゴリ（例: "sunny", "rainy", "cloudy", "night"）
  intensity: number;   // 効果の強度（0.0〜1.0）
  atmosphere?: string; // 天気の雰囲気を表現した文章
}
