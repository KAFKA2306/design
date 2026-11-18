---
type: "guide"
description: "初見で用途が伝わるかを試し、操作が止まった箇所を修正と再検証につなげる手順。"
tags:
  - design/frontend
  - design/review
---

# 初めて使う人の視点で画面を評価する

成果物のURLを受け取ったら、まず普段の入口を開く。「誰の何に使えるか」「次にどこを操作するか」を画面だけで説明できるか確かめる。次に、想定する利用者が実際に行う作業を一つ試す。

## 用途と操作を確かめる

1. 対象の版、入口、想定利用者、使う場面、完了の目印を記録する。用途を確認できる仕様や依頼が見つからなければ「用途未確定」と記し、画面から読み取れた用途と、確認したい問いを返す。
2. 初見の人に成果物だけを渡し、何ができそうか、どこから始めるかを聞く。想定用途と照合し、判断に使った見出しや最初に選んだ操作を記録する。
3. 日常の目標だけを伝え、操作名や手順を伏せて試す。必要な操作に気づくか、名前から押した結果を予想できるか、画面が成功や失敗を伝えるかを観察する。補助なしで完了したか、補助後に完了したか、停止したかを記録する。静止画で確認できるのは最初に選びそうな箇所までとし、操作結果は「未確認」とする。
4. 修正後は同じ入口・目標・完了条件で試す。比較する場合は対象の利用者、端末、初期状態もそろえる。完了件数と試行数、補助の有無、必要に応じて所要時間を記録する。同じ人が再試行した場合は、初見の測定と区別する。

実利用者、担当者、エージェントのどれによる観察かを記す。エージェントの操作で再現した停止は修正に使える。利用者の行動傾向は、実利用者の試行から判断する。

手順の出典は [GOV.UKの利用者テスト](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing)、[NN/gの認知的ウォークスルー](https://www.nngroup.com/articles/cognitive-walkthroughs/)、[GOV.UKの使いやすさの測定](https://www.gov.uk/service-manual/measuring-success/usability-benchmarking-a-website-or-whole-service)。

## 直せる指摘を返す

一件の指摘で一つの停止箇所を扱う。実際に見聞きした事実、使う人への影響、修正後の合格条件を残す。画面やログの証拠を添え、実行可能であれば再現手順も書く。修正案が仮説なら、その旨を記す。

```text
対象・版・入口：
誰が何を終えたいか：
観察した人・端末・初期状態：
初見で読み取った用途と最初に選んだ操作：
実際の操作と結果（画面・要素・証拠）：
作業への影響：
修正後に満たす条件：
同じ入口からの再試行結果：
```

架空の例。イベント一覧で「今週日曜に参加できる催しの開始時刻を調べる」。検索が0件で、画面に「対象なし」とだけ表示された。前回の絞り込み条件が残っており、一覧から解除できなかった。修正後は、適用中の条件を0件画面から解除し、同じ検索語で該当する催しの開始時刻を確認できれば合格とする。

機械検証が返す指摘は [既存の違反スキーマ](../schemas/violation.schema.json) を使う。`observed` に実際の表示や挙動、`expected` に合格条件、`affected_surface` と `affected_state` に場所と状態、`verification_method` と `evidence` に確かめ方と証拠を入れる。

箇所を指して報告する方法は [Vercelのプレビューコメント](https://vercel.com/docs/comments)、変更全体の判断と個々の指摘の出し方は [GitHubのPRレビュー](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request)、操作と状態の再現は [Storybookの操作テスト](https://storybook.js.org/docs/writing-tests/interaction-testing) を参照する。

## 外部の画面から同じ用途の配置を借りる

現行の[操作パターン](../registry/ui/product/journey.ts)から、利用者がしたい作業に合う順を選ぶ。用途に合う外部事例を開き、どの情報がどの操作を支えるかを確かめる。対象の画面では、[共通の部品とトークン](../README.md#current-design-contract)で同じ役割を実現する。確認日は2026年11月18日。

| 利用者がしたいこと | 取り入れる構成 | 一次資料 |
| --- | --- | --- |
| 何ができるか知り、始める | 見出し、用途の短い説明、最初の操作を入口にそろえる | [USWDSの案内ページ](https://designsystem.digital.gov/templates/landing-page/)、[GOV.UKのサービス開始](https://design-system.service.gov.uk/patterns/start-using-a-service/) |
| 読みたい手順や根拠を探す | 本文を中心に置き、目次や根拠を補助欄から開けるようにする | [USWDSの文書ページ](https://designsystem.digital.gov/templates/documentation-page/)、[Primerのページ構成](https://primer.style/product/components/page-layout/) |
| 候補を絞って比較する | 絞り込みの条件を見せ、初回・0件・取得失敗で次の操作を変える | [Carbonのデータ表](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines)、[Carbonの空の状態](https://www.carbondesignsystem.com/building-blocks/core/patterns/empty-states) |
| 根拠を確認して判断を返す | 対象箇所に指摘を残し、全体の判断とその根拠をひと目で見つけられるようにする | [GitHubのPRレビュー](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request) |
| 入力し、確認して完了する | 入力名とエラーを対応させ、確認画面と完了の目印を示す | [デジタル庁のテキスト入力](https://design.digital.go.jp/dads/components/input-text/usage/)、[GOV.UKの確認・完了パターン](https://design-system.service.gov.uk/patterns/) |

評価では、選んだ構成が主要な作業に役立ったかを同じ課題で確かめる。画面幅や入力方法に関する確認は [designの共通条件](../README.md#current-design-contract)を使う。
