---
type: "guide"
description: "初見の利用者が欲しい答えを得られるかを試し、判断が止まった箇所を修正と再検証につなげる手順。"
tags:
  - design/frontend
  - design/review
---

# 初めて使う人の視点で画面を評価する

普段の入口から、初めて来た人が用途を理解し、自分の用事を済ませられるか確かめる。候補一覧や比較画面を開けても、選ぶ理由が得られなければ判断は途中です。

成果物のURLと分かっている利用場面を添え、エージェントに次のように頼めます。

> このURLを初めて使う人として開いて。依頼や利用者の記録から、その人がどんな場面で何を知りたいかを一つ選んで。推定した部分は明記して。画面だけで用事を試し、得られた答えと根拠、足りなかった情報、最初に迷った箇所を返して。実装者が使えるように、どこにどの情報が必要かと、同じ用事で確かめる合格条件を一件にまとめて。修正も依頼されていれば、直して同じ入口から試し直して。

## 欲しい答えを確かめる

1. 依頼、問い合わせ、観察記録などから、誰がどんな場面で何を知り、何を決めるかを一文にする。根拠が仕様や担当者の想定だけなら仮説と記す。対象の版と入口を控え、必要な答えと照合先を決める。選択に正解が一つに定まらない場合は、候補が満たす条件と、選ぶ理由に必要な情報を決める。
2. 初見の人に入口だけを渡し、何ができそうか、どこから始めるかを聞く。次に日常の目標を伝える。操作名、経路、正答は伏せ、利用者が見える画面とリンクから試す。最初に選んだ操作、迷った箇所、得られた答え、根拠となる表示やURLを記録する。静止画や操作できない画面では、確かめられなかった結果を「未確認」とする。
3. 必要な答えと照合して「完了」「一部完了」「誤った答え」「未完了」「未確認」を記録する。必要な値や理由が一部だけ得られたら一部完了。条件外の候補を適合と判断したら誤った答え。補助があればその内容も記す。
4. 答えが得られなかった箇所は、試行後に詳細画面や出典も照合する。情報自体がない、情報はあるが判断する画面に出ない、入口が見つからない、意味を読み取れない、操作が失敗する、のどれを確認できたかを書く。原因を確かめられなければ、観察と仮説を分けて記す。
5. 修正後は同じ入口・目標・完了条件で試す。比較する場合は端末と初期状態もそろえる。完了件数と試行数、補助の有無、必要に応じて所要時間を記録する。同じ人の再試行は習熟の影響を受けるため、初見の測定と区別する。

実利用者、担当者、エージェントのどれによる観察かを記す。エージェントの操作で再現した停止は修正に使える。利用者の行動傾向は、実利用者の試行から判断する。

手順の出典は [GOV.UKの利用者ニーズの特定](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/identify-user-needs/)、[利用者テスト](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing)、[使いやすさの測定](https://www.gov.uk/service-manual/measuring-success/usability-benchmarking-a-website-or-whole-service)、[NN/gの認知的ウォークスルー](https://www.nngroup.com/articles/cognitive-walkthroughs/)。

## 直せる指摘を返す

一件の指摘で一つの停止箇所を扱う。実際に見聞きした事実、使う人への影響、修正後の合格条件を残す。画面やログの証拠を添え、実行可能であれば再現手順も書く。修正案が仮説なら、その旨を記す。

```text
対象・版・入口：
誰がどんな場面で何を知り、何を決めたいか：
利用者を想定した根拠・答えの照合先：
観察した人・端末・初期状態：
初見で読み取った用途と最初に選んだ操作：
得られた答え・判定・根拠（画面・要素・URL）：
足りない情報・止まった箇所・作業への影響：
修正指示（場所・必要な情報または操作・同じ用事での合格条件）：
同じ入口からの再試行結果：
```

### 公開画面で試した例

- **一部完了**。初参加の人を含む4人で30分以内に遊ぶゲームを選ぶ想定で、[ボドゲのミカタ](https://bodoge-no-mikata.vercel.app/)から絞り込み、2件を比較した。比較画面では人数と時間を読めたが、概要は両方とも「確認中」で、遊び方を比べられなかった。詳細には、[みんなでぽんこつペイント](https://bodoge-no-mikata.vercel.app/games/minna-de-ponkotsu-paint)はお絵かき、[Ipso](https://bodoge-no-mikata.vercel.app/games/ipso)は数字カードの交換だと分かる説明と出版元へのリンクがあった。修正案は、比較画面から同じ概要と出典を確認できるようにすること。再試行では、同じ2件のうちどちらを選ぶかを、人数・時間・遊び方を根拠に比較画面で説明できれば合格とする。
- **完了**。既存プロジェクトに共有スタイルを入れたい開発者の想定で、[designの公開見本](https://kafka2306.github.io/design/)から「Use shared styles in your project」を開いた。リンク先で作成する `design.config.json`、実行する同期と適合確認のコマンドを特定できた。この課題で確認した範囲は手順の取得まで。

2026年11月18日にエージェントがデスクトップのブラウザーで各1回試行した。[操作と判定の記録](https://github.com/KAFKA2306/design/issues/104)

機械検証が返す指摘は [既存の違反スキーマ](../schemas/violation.schema.json) を使う。`observed` に実際の表示や挙動、`expected` に合格条件、`affected_surface` と `affected_state` に場所と状態、`verification_method` と `evidence` に確かめ方と証拠を入れる。

箇所を指して報告する方法は [Vercelのプレビューコメント](https://vercel.com/docs/comments)、変更全体の判断と個々の指摘の出し方は [GitHubのPRレビュー](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request)、操作と状態の再現は [Storybookの操作テスト](https://storybook.js.org/docs/writing-tests/interaction-testing) を参照する。

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
