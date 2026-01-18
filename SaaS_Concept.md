# DiffLens SaaS Concept & Strategy

## 1. ビジョン (Vision)
**"Visual Regression Testing for Everyone" + "Accessibility as a Service"**
開発者がデザイン崩れやアクセシビリティ違反を気にせず、自信を持ってリリースできる世界を作る。

## 2. ターゲットユーザー (Target Audience)
- **Primary**: **AI Coding Agents & AI Service Providers** (v0, Lovable, Bolt.new, etc.)
- **Secondary**: フロントエンドエンジニア、QAエンジニア
- **Organization**: スタートアップ 〜 中規模開発チーム

## 3. 解決する課題 (Pain Points)
1.  **「AIが作ったサイトの品質保証」**: AIはコードを書けるが、見た目の崩れやアクセシビリティまでは完璧に検証できない。
2.  **「AIの自己修復ループの欠如」**: AIが「自分の出力が正しいか」を判断するためのフィードバック（視覚的・構造的評価）が足りない。
3.  **「ローカルでの画像比較は限界」**: チーム開発だとOS間のフォント差異などで差分が出やすい。

## 4. SaaS版のコア価値 (Value Proposition)
- **API First for AI**: AIエージェントが叩きやすいシンプルなJSONレスポンス。
- **Automated QA Feedback**: 「ボタンが重なっている」「コントラスト比が低い」といった情報を構造化データで返し、AIの自己修正を促す。
- **Cloud Rendering**: クラウド上の統一環境でレンダリングし、OS差異を排除。

## 5. 収益化モデル案 (Monetization Strategy)
- **API Pay-per-use**: AIエージェントからの利用を想定した従量課金。
    - 例: $0.01 / check (スクリーンショット + a11y診断)
    - AIサービスプロバイダー向けのボリュームディスカウント。
- **Developer Plan**: 人間が使うための月額プラン（既存案）。
    - Free Tier: 個人向け。
    - Pro Tier: チーム向け。

## 6. 機能ロードマップ案 (Feature Roadmap)

### Phase 1: MVP (Minimum Viable Product)
- [ ] GitHub App連携 (PRにコメント通知)
- [ ] S3への画像アップロード機能
- [ ] シンプルなWebダッシュボード (差分確認とApproveボタンのみ)

### Phase 2: Collaboration
- [ ] 画像へのコメント機能
- [ ] Slack/Teams通知
- [ ] 複数ブラウザ対応 (Safari/Firefox/Mobile)

### Phase 3: Advanced
- [ ] Figma連携 (デザインカンプとの比較)
- [ ] AIによる「無視すべき差分」の自動判定
- [ ] アクセシビリティレポートの時系列推移グラフ

## 7. AI利用最適化戦略 (AI Optimization Strategy)
AIエージェントが「自律的に」修正を行えるようにするための機能群。

1.  **Semantic Diff Description (意味論的差分記述)**
    *   単なる「ピクセル差分」ではなく、「ヘッダーの高さが10px増えた」「ボタンが右にずれた」といった**自然言語または構造化データ**で差分を説明する。
    *   これにより、AIは「どこを直せばいいか」をコードレベルで推論しやすくなる。

2.  **Prompt-Ready Output**
    *   AIへのプロンプトにそのまま貼り付けられる形式でエラーを出力する。
    *   例: `Context: The login button is misaligned. Fix: Update .login-btn margin-top.`

3.  **MCP (Model Context Protocol) Support**
    *   AnthropicのMCPに対応し、ClaudeやCursorなどのAIエージェントが、追加の実装なしでDiffLensを「ツール」として呼び出せるようにする。
    *   `difflens.check_visual_regression(url)` のような関数呼び出しを可能にする。

---

## 議論ポイント (Discussion Points)
1.  **競合との差別化**: 既存のPercyやChromaticとどう戦うか？（価格？使いやすさ？a11y統合？）
2.  **技術的難易度**: クラウドレンダリング基盤（Playwrightの並列実行環境）の構築コスト。
3.  **初期ターゲット**: どの層を最初のファンにするか？
