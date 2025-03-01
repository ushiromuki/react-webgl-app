# 天気連動型 WebGL 壁紙アプリケーション

React と WebGL を活用し、現在の天気予報に応じて動的に変化する視覚的に魅力的な壁紙のようなウェブサイトです。

## 機能

- **動的な背景グラフィック**: WebGL を使用して、現在の天気に基づいて変化する美しい背景を表示
- **天気連動**: OpenWeatherMap API を使用して現在地の天気情報を取得
- **AI 生成テーマ**: Google Gemini API を使用して、天気データに基づいた最適な配色とグラフィックカテゴリを生成
- **日付と時刻表示**: 現在の日付と時刻をリアルタイムで表示
- **レスポンシブデザイン**: あらゆるデバイスで最適な表示を実現

## 技術スタック

- **フロントエンド**: React, TypeScript, Tailwind CSS
- **WebGL**: Three.js, React Three Fiber
- **API**: OpenWeatherMap API, Google Gemini API
- **デプロイ**: Cloudflare Pages

## 始め方

### 前提条件

- Node.js 18.0.0 以上
- pnpm 8.0.0 以上

### インストール

1. リポジトリをクローン

   ```
   git clone <repository-url>
   cd react-webgl-app
   ```

2. 依存関係をインストール

   ```
   pnpm install
   ```

3. 環境変数を設定
   `.env.example`ファイルを`.env`にコピーし、必要な API キーを設定します。

   ```
   cp .env.example .env
   ```

   以下の API キーを取得して設定する必要があります。

   - Google Gemini API: [https://ai.google.dev/](https://ai.google.dev/)

4. 開発サーバーを起動

   ```
   pnpm dev
   ```

5. ブラウザで [http://localhost:5173](http://localhost:5173) を開く

### ビルドと本番デプロイ

1. 本番用ビルドを作成

   ```
   pnpm build
   ```

2. ビルド結果をプレビュー

   ```
   pnpm preview
   ```

3. Cloudflare Pages にデプロイ
   Cloudflare Pages の指示に従ってデプロイしてください。環境変数も設定することを忘れないでください。

## 使用方法

アプリケーションにアクセスすると、現在地の天気情報に基づいた背景グラフィックが表示されます。位置情報へのアクセスを許可することで、より正確な天気情報が取得できます。

背景グラフィックは、天気の状態（晴れ、雨、曇りなど）に応じて自動的に変化します。また、日付と時刻は常に最新の情報に更新されます。

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。
