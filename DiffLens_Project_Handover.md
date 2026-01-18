# DiffLens Project Handover Document

このドキュメントは、視覚的回帰テスト・アクセシビリティ診断ツール「DiffLens」の開発プロジェクトを仮想環境（Dev Container等）で開始するための包括的な仕様書および初期セットアップガイドです。

---

## 1. プロダクト概要 (Product Overview)

* **名称**: DiffLens (仮)
* **コンセプト**: "Visual Regression Testing for Everyone" + "Accessibility as a Service"
* **解決する課題**:
  * 既存の商用ツール（Applitools等）は高額すぎる。
  * 既存のOSS（BackstopJS等）は設定が面倒で、誤検知（Flakiness）が多い。
  * アクセシビリティチェック（a11y）と見た目のチェックは別々に行われがち。
* **コア機能**:
  * 設定ファイル (`difflens.config.ts`) ベースの簡単なセットアップ。
  * Playwrightによる安定したブラウザ自動操作。
  * `pixelmatch` (または `odiff`) による画像差分検知。
  * `axe-core` によるアクセシビリティ自動診断。

---

## 2. 開発ロードマップ (Roadmap)

### Phase 1: CLI & OSS (1-3ヶ月目)

* **ゴール**: `npx difflens test` で動くCLIツールを完成させ、GitHubで公開する。
* **主要タスク**:
    1. プロジェクトセットアップ (TypeScript, Playwright)
    2. `capture` コマンド実装 (スクリーンショット撮影)
    3. `compare` コマンド実装 (画像比較)
    4. `axe-core` 統合
    5. HTMLレポート出力

### Phase 2: SaaS化 (4-8ヶ月目)

* **ゴール**: Webダッシュボードを作成し、履歴管理とチーム共有を可能にする。

---

## 3. 技術仕様書 (Technical Specification)

### 3.1 技術スタック

* **Runtime**: Node.js (v20 LTS)
* **Language**: TypeScript
* **Browser Automation**: Playwright
* **Image Comparison**: pixelmatch
* **Accessibility**: axe-playwright
* **CLI Framework**: cac
* **Bundler**: tsup

### 3.2 ディレクトリ構成案

```
difflens/
├── src/
│   ├── cli.ts           # CLI Entrypoint
│   ├── config.ts        # Configuration Loader
│   ├── core/
│   │   ├── runner.ts    # Test Runner
│   │   ├── capture.ts   # Screenshot Logic
│   │   ├── compare.ts   # Diff Logic
│   │   └── a11y.ts      # Axe Integration
│   └── types.ts
├── test/                # Unit/Integration Tests
├── package.json
├── tsconfig.json
└── Dockerfile           # For consistent rendering
```

---

## 4. 初期セットアップファイル (Initial Setup Files)

仮想環境でプロジェクトを開始する際に、以下のファイルを作成してください。

### 4.1 `package.json`

```json
{
  "name": "difflens",
  "version": "0.0.1",
  "description": "Visual Regression Testing & Accessibility Auditing Tool",
  "main": "dist/index.js",
  "bin": {
    "difflens": "dist/cli.js"
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "start": "node dist/cli.js"
  },
  "keywords": [
    "testing",
    "visual-regression",
    "accessibility",
    "playwright"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "cac": "^6.7.0",
    "pixelmatch": "^5.3.0",
    "playwright": "^1.40.0",
    "pngjs": "^7.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "@axe-core/playwright": "^4.8.0"
  }
}
```

### 4.2 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

### 4.3 `src/types.ts` (設定ファイルの型定義)

```typescript
export interface DiffLensConfig {
  baseUrl?: string;
  viewports?: {
    [key: string]: { width: number; height: number };
  };
  scenarios: Scenario[];
  threshold?: number;
  outDir?: string;
}

export interface Scenario {
  label: string;
  path: string;
  viewports?: string[]; // e.g. ['desktop', 'mobile']
  actions?: (page: any) => Promise<void>; // Playwright Page object
}
```

### 4.4 `Dockerfile` (レンダリング一貫性用)

```dockerfile
# Playwrightの公式イメージを使用（ブラウザと依存関係が含まれている）
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 日本語フォントのインストール（レンダリング差異を防ぐため重要）
RUN apt-get update && apt-get install -y \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    && apt-get clean

# CLIとして実行する場合のエントリーポイント
ENTRYPOINT ["npm", "start", "--"]
```

### 4.5 `.gitignore`

```text
node_modules
dist
.difflens
.env
.DS_Store
coverage
```

---

## 5. 開発開始ステップ

1. **ディレクトリ作成**: `mkdir difflens && cd difflens`
2. **初期化**: `npm init -y`
3. **依存関係インストール**: 上記 `package.json` の `devDependencies` をインストール。

    ```bash
    npm install -D typescript tsup cac pixelmatch playwright pngjs @types/node @axe-core/playwright
    ```

4. **コーディング開始**: `src/cli.ts` を作成し、Hello Worldから始める。

---

## 6. AI指示書 (Prompts for Vibe Coding)

仮想環境でAIアシスタント（Gemini, Copilot等）に指示を出す際に、以下のプロンプトをコピーして使用してください。

### 6.1 システムプロンプト (役割定義)
>
> あなたは、世界最高峰のNode.js/TypeScriptエンジニアであり、OSS開発のスペシャリストです。
> 現在、視覚的回帰テストツール「DiffLens」を開発しています。
> 以下の原則に従ってコードを書いてください：
>
> 1. **Zero Config**: ユーザーが設定ファイルを書かなくても、デフォルト値で動くようにする。
> 2. **Type Safety**: `any` 型の使用を禁止し、厳密な型定義を行う。
> 3. **Modularity**: 各機能（撮影、比較、レポート）を疎結合なモジュールとして設計する。
> 4. **Error Handling**: ユーザーフレンドリーなエラーメッセージを表示する。

### 6.2 実装フェーズごとのプロンプト例

#### Step 1: プロジェクトのスカフォールディング
>
> `package.json` と `tsconfig.json` の内容に基づいて、プロジェクトの基本構造を作成してください。
> 特に、`src/cli.ts` を作成し、`cac` を使って `init`, `test`, `report` コマンドの枠組み（スケルトン）を実装してください。
> まだ中身のロジックは実装せず、`console.log` でコマンドが呼ばれたことだけを確認できるようにしてください。

#### Step 2: 設定ファイルの読み込みロジック
>
> `src/config.ts` を実装してください。
> `difflens.config.ts` (TypeScript) または `difflens.config.js` を動的に読み込む機能が必要です。
> `bundle-require` や `ts-node` などのライブラリを使わずに、Node.jsのネイティブな `import()` を使って読み込む方法を検討してください。
> デフォルト設定とユーザー設定をマージするロジックも含めてください。

#### Step 3: スクリーンショット撮影 (Capture)
>
> `src/core/capture.ts` を実装してください。
> Playwrightを使用して、指定されたURLのスクリーンショットを撮影する関数 `captureScreenshot(url: string, path: string)` を作成してください。
> 以下の要件を満たす必要があります：
>
> 1. ページ全体のスクリーンショット (`fullPage: true`) を撮る。
> 2. 日本語フォントが正しくレンダリングされるまで待機する (`document.fonts.ready`)。
> 3. CSSアニメーションを無効化するスタイルを注入する。

#### Step 4: 画像比較 (Compare)
>
> `src/core/compare.ts` を実装してください。
> `pixelmatch` と `pngjs` を使用して、2つの画像の差分を計算する関数 `compareImages(img1Path: string, img2Path: string, diffPath: string)` を作成してください。
> 差分があった場合は、差分画像を `diffPath` に保存し、差分ピクセル数を返してください。

#### Step 5: アクセシビリティ診断 (Axe)
>
> `src/core/a11y.ts` を実装してください。
> `@axe-core/playwright` を使用して、現在のページに対してアクセシビリティ診断を実行する関数 `runAxeAudit(page: Page)` を作成してください。
> 違反項目（Violations）のリストを返し、コンソールに見やすく表示してください。

Good luck with the development!
