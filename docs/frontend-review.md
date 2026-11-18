---
type: "guide"
description: "利用者が欲しい答えを得られるか、変更が影響する用事だけを試し、再発を防ぐ手順。"
tags:
  - design/frontend
  - design/review
---

# 画面で利用者の用事が済むか確かめる

成果物のURLを渡して、このまま依頼できる。

> 普段の入口から、今回の変更が影響する利用者の用事を一つ試して。誰が何を知り、どう判断または行動できれば完了かを先に決めて。画面とリンクだけで操作し、得られた答えを条件と照合して。用事が済まなければ、最初に止まった箇所、証拠、修正後の合格条件を一件にまとめて。

## 変更に合わせて試す範囲を決める

- 画面が変わるときは、変更が影響する代表的な用事を一つ、普段の入口から試す。影響が異なる用事や、共有部品で複数の画面に波及する挙動は、同じ試行では検出できないものだけ足す。空・エラー・未確認、スマホ、キーボードは、変更がその状態や入力方法に影響するときに試す。
- 既知の不具合を直すときは、記録済みの入口・入力・合格条件をそのまま使う。既存テストが対象の版と条件で同じ結果を確かめていれば、その証拠を再利用する。見つけやすさや説明の分かりやすさが変わる場合は、初見の試行も行う。
- 利用者の目標や必要な情報が分からないときは、問い合わせや利用者の観察記録から用事を選ぶ。想定で選ぶ場合は仮説と記す。利用者の行動傾向を測るときは実利用者に試してもらい、完了数／試行数と必要に応じて所要時間を記録する。

## 答えを照合して、修正と再試行に使う

1. 操作する前に、誰が、どの場面で、何を判断または実行するかを書く。外せない条件と答えの照合先を決める。候補を選ぶ用事なら、満たすべき条件と選ぶ理由に必要な情報を決める。
2. 対象の版、入口、端末と初期状態を控え、操作名や正答を教えずに試す。最初に選んだ操作と迷った箇所を控え、答えとその根拠を画面で得るところまで追う。補助を使ったときは何を教えたかも記す。未到達の詳細や出典は、試行後に原因の切り分けに使う。
3. 条件と照合して「完了」「一部完了」「誤った答え」「未完了」「未確認」を付ける。必要な情報が足りなければ一部完了、条件外の結果が適合として表示された場合は誤った答えとする。画面を操作できないなど、観測できない場合は理由を添えて未確認にする。
4. 結果は既存のIssueまたはPRに記録する。一件の指摘で一つの停止箇所を扱い、情報が作られていないのか、別画面にあるのか、見つけにくいのか、操作が失敗するのかを、確かめられた範囲で書く。修正後は入口・入力・合格条件と比較に効く初期状態をそろえて試す。

```text
用事・合格条件・照合先：
入口・版・環境・試した人：
判定・得られた答え・最初に迷った操作や停止箇所・証拠URL：
利用者への影響・修正する場所と内容・再試行結果：
```

## 同じ不具合を自動で検出する

再発を防ぐ必要があり、画面に表示される値・状態・操作結果で合否が決まる場合は、既存のテストに再現条件と合格条件を加える。固定した入力で、既知の失敗を落とし、成立する結果を通す。失敗時は、期待と実際の差、画面、再現に使った入力を残す。既存テストで検出できる条件はその結果を使う。

データが変わる公開画面では、失敗した操作とそのときの証拠を残す。固定したテストデータでの合格と、現在の公開データでの動作確認は個別に記録する。見つけやすさや説明の理解は、手順を知らない人の操作を観察する。エージェントが再現した停止箇所は修正に使い、実利用者の試行とは区別する。

機械検証が返す指摘には[既存の違反スキーマ](../schemas/violation.schema.json)を使う。観察と測定は [GOV.UKの利用者テスト](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing)・[使いやすさの測定](https://www.gov.uk/service-manual/measuring-success/usability-benchmarking-a-website-or-whole-service)・[初見での操作の観察](https://www.nngroup.com/articles/cognitive-walkthroughs/)を参照。操作結果の自動確認は [Playwrightの実践ガイド](https://playwright.dev/docs/best-practices#test-user-visible-behavior)を参照。

## 公開画面で試した例

- **一部完了**。初参加の人を含む4人で30分以内に遊ぶゲームを選ぶ想定で、[ボドゲのミカタ](https://bodoge-no-mikata.vercel.app/)から絞り込み、2件を比較した。比較画面では人数と時間を読めたが、概要は両方とも「確認中」で、遊び方を比べられなかった。[みんなでぽんこつペイントの詳細](https://bodoge-no-mikata.vercel.app/games/minna-de-ponkotsu-paint)と[Ipsoの詳細](https://bodoge-no-mikata.vercel.app/games/ipso)には遊び方と出版元へのリンクがあった。修正する場所は比較画面。同じ2件の人数・時間・遊び方を見て選ぶ理由を答え、概要の出典を開ければ合格。
- **完了**。[designの公開見本](https://kafka2306.github.io/design/)から「Use shared styles in your project」を開き、設定ファイルと同期・適合確認のコマンドを特定した。用事は導入手順を見つけるところまで。

2026年11月18日にエージェントがデスクトップのブラウザーで各1回試行した。[操作と判定の記録](https://github.com/KAFKA2306/design/issues/104)

## 外部の画面から同じ用途の配置を借りる

現行の[操作パターン](../registry/ui/product/journey.ts)から、利用者がしたい作業に合う順を選ぶ。用途に合う外部事例を開き、どの情報がどの操作を支えるかを確かめる。対象の画面では、[共通の部品とトークン](../README.md#current-design-contract)で同じ役割を実現する。確認日は2026年11月18日。

| 利用者がしたいこと | 取り入れる構成 | 一次資料 |
| --- | --- | --- |
| 何ができるか知り、始める | 見出し、用途の短い説明、最初の操作を入口にそろえる | [USWDSの案内ページ](https://designsystem.digital.gov/templates/landing-page/)、[GOV.UKのサービス開始](https://design-system.service.gov.uk/patterns/start-using-a-service/) |
| 読みたい手順や根拠を探す | 本文を中心に置き、目次や根拠を補助欄から開けるようにする | [USWDSの文書ページ](https://designsystem.digital.gov/templates/documentation-page/)、[Primerのページ構成](https://primer.style/product/components/page-layout/) |
| 候補を絞って比較する | 適用中の条件と、候補を選ぶのに必要な違いを一覧や比較の場で見せる。条件が厳しすぎる場合と取得に失敗した場合で次の操作を変える | [Baymardの一覧表示の観察](https://baymard.com/research-articles/product-listing-information)、[Board Game Finderの絞り込みと適合根拠](https://pickyourboardgame.com/about)、[Carbonの空の状態](https://www.carbondesignsystem.com/building-blocks/core/patterns/empty-states) |
| 根拠を確認して判断を返す | 対象箇所に指摘を残し、全体の判断とその根拠をひと目で見つけられるようにする | [GitHubのPRレビュー](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request) |
| 入力し、確認して完了する | 入力名とエラーを対応させ、確認画面と完了の目印を示す | [デジタル庁のテキスト入力](https://design.digital.go.jp/dads/components/input-text/usage/)、[GOV.UKの確認・完了パターン](https://design-system.service.gov.uk/patterns/) |

評価では、選んだ構成が主要な作業に役立ったかを同じ課題で確かめる。画面幅や入力方法に関する確認は [designの共通条件](../README.md#current-design-contract)を使う。
