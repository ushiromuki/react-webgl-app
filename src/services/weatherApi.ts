import axios from "axios";
import { WeatherData } from "../types";

// 天気予報 API（livedoor 天気互換）のベースURL
const API_BASE_URL = "https://weather.tsukumijima.net/api/forecast";

// 東京の都市コード
const TOKYO_CITY_CODE = "130010";

/**
 * 東京の天気データを取得
 */
export const getTokyoWeather = async (): Promise<WeatherData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {
        city: TOKYO_CITY_CODE,
      },
    });

    const data = response.data;

    // 天気概況文を取得
    const weatherDescription = data.description.text;

    // 現在の天気情報（forecasts[0]が今日の天気）
    const todayWeather = data.forecasts[0];

    return {
      main: todayWeather.telop,
      description: weatherDescription, // 天気概況文を使用
      temp: todayWeather.temperature.max?.celsius
        ? Number(todayWeather.temperature.max.celsius)
        : 0,
      humidity: 0, // この API では湿度情報が提供されていない
      windSpeed: 0, // 風速の数値情報は提供されていない（文字列の風向きのみ）
      icon: todayWeather.image.url, // 天気アイコンの URL
      city: data.location.city,
      country: "JP",
      time: new Date().getTime() / 1000, // 現在時刻のタイムスタンプ
    };
  } catch (error) {
    console.error("天気データの取得に失敗しました:", error);
    throw error;
  }
};

/**
 * デフォルトの天気データを取得
 * 常に東京の天気を取得
 */
export const getDefaultWeather = async (): Promise<WeatherData> => {
  return getTokyoWeather();
};

/**
 * 現在地の天気を取得（このアプリでは常に東京の天気を返す）
 */
export const getCurrentLocationWeather = async (): Promise<WeatherData> => {
  return getTokyoWeather();
};
