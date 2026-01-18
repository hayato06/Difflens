# Playwrightの公式イメージを使用（ブラウザと依存関係が含まれている）
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# 日本語フォントのインストール（レンダリング差異を防ぐため重要）
RUN apt-get update && apt-get install -y \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    && apt-get clean

# 開発用ツール (git, vim, curl etc) はベースイメージに含まれていることが多いが、
# 必要であればここで追加インストールする
# RUN apt-get install -y git vim curl

# デフォルトのユーザーを node に設定 (Playwrightイメージには node ユーザーが含まれている)
# ただし、権限周りでトラブルが起きないよう、一旦 root で作業するか、
# devcontainer.json で remoteUser を指定する。
# ここでは特に指定せず、devcontainer.json 側で制御する。
