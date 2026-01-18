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
