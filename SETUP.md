# DiffLens 開発環境セットアップガイド

このフォルダは、Docker Dev Container を使用して、一貫した開発環境を構築できるように設定されています。

## 前提条件

以下のツールがインストールされている必要があります。

1. **Docker Desktop**: [公式サイト](https://www.docker.com/products/docker-desktop/)からインストールし、起動しておいてください。
2. **Visual Studio Code (VS Code)**: [公式サイト](https://code.visualstudio.com/)からインストールしてください。
3. **Dev Containers 拡張機能**: VS Code の拡張機能マーケットプレイスから「Dev Containers」 (Microsoft製) をインストールしてください。

## 環境の起動方法 (Reopen in Container)

このフォルダを VS Code で開いた状態で、以下の手順を実行してください。

1. **コマンドパレットを開く**
    * ショートカットキー: `F1` または `Ctrl + Shift + P` (Macの場合は `Cmd + Shift + P`) を押します。

2. **コマンドを実行する**
    * 入力欄に `Dev Containers: Reopen in Container` と入力し、表示された候補を選択します。
    * ※ 初回は Docker イメージのビルドが行われるため、数分かかる場合があります。

3. **起動確認**
    * 左下のステータスバーに緑色のマークが表示され、「Dev Container: ...」と表示されていれば成功です。
    * ターミナルを開き (`Ctrl + @`)、以下のコマンドで環境を確認できます。

    ```bash
    node -v
    # v20.x.x と表示されるはずです

    npx playwright --version
    # Version 1.40.0 などが表示されるはずです
    ```

## 開発の開始

コンテナが起動すると、自動的に `npm install` が実行されます。
完了後、以下のコマンドで開発を開始できます。

```bash
# ビルド
npm run build

# 開発モード (watch)
npm run dev
```

## トラブルシューティング

* **Dockerが起動していない**: Docker Desktop が起動しているか確認してください。
* **ビルドエラー**: インターネット接続を確認し、再度 `Reopen in Container` を試してください。
