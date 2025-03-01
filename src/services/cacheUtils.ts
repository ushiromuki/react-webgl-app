import { WeatherData, GraphicsTheme } from '../types';

// キャッシュのキー
const WEATHER_THEME_CACHE_KEY = 'weather_theme_cache';

// キャッシュの有効期限（ミリ秒）- 12時間
const CACHE_EXPIRATION = 12 * 60 * 60 * 1000;

// キャッシュデータの型定義
interface CacheData {
  timestamp: number;
  weatherData: WeatherData;
  themeData: GraphicsTheme;
}

/**
 * キャッシュが存在するか確認する
 */
export const cacheExists = (): boolean => {
  return localStorage.getItem(WEATHER_THEME_CACHE_KEY) !== null;
};

/**
 * キャッシュが有効（期限内）かどうか確認する
 */
export const isCacheValid = (): boolean => {
  if (!cacheExists()) {
    return false;
  }

  try {
    const cacheData = readCache();
    const now = Date.now();
    return now - cacheData.timestamp < CACHE_EXPIRATION;
  } catch (error) {
    console.error('キャッシュの検証に失敗しました:', error);
    return false;
  }
};

/**
 * キャッシュからデータを読み込む
 */
export const readCache = (): CacheData => {
  try {
    const cacheContent = localStorage.getItem(WEATHER_THEME_CACHE_KEY);
    if (!cacheContent) {
      throw new Error('キャッシュが存在しません');
    }
    return JSON.parse(cacheContent) as CacheData;
  } catch (error) {
    console.error('キャッシュの読み込みに失敗しました:', error);
    throw error;
  }
};

/**
 * キャッシュにデータを書き込む
 */
export const writeCache = (weatherData: WeatherData, themeData: GraphicsTheme): void => {
  try {
    const cacheData: CacheData = {
      timestamp: Date.now(),
      weatherData,
      themeData
    };
    
    localStorage.setItem(WEATHER_THEME_CACHE_KEY, JSON.stringify(cacheData));
    console.log('キャッシュを更新しました');
  } catch (error) {
    console.error('キャッシュの書き込みに失敗しました:', error);
  }
};

/**
 * キャッシュからテーマデータを取得する
 * キャッシュが無効な場合はnullを返す
 */
export const getThemeFromCache = (): { weatherData: WeatherData; themeData: GraphicsTheme } | null => {
  if (!isCacheValid()) {
    return null;
  }
  
  try {
    const cacheData = readCache();
    return {
      weatherData: cacheData.weatherData,
      themeData: cacheData.themeData
    };
  } catch (error) {
    console.error('キャッシュからのテーマ取得に失敗しました:', error);
    return null;
  }
};
