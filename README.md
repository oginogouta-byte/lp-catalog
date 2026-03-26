# Section Parts Catalog — フォルダ構成

このディレクトリは **「カタログ閲覧サイト（UI）」** と **「セクションパーツの HTML」** を分けて管理する。

**シート連携・チェックサイト・三本柱の位置づけ:** `LP半自動/ワークフロー手引き_索引.md` および `LP半自動/crawl/要件定義書.md`。

```
catalog/
├── README.md                 # 本ファイル
├── _archive/                 # sections から外した作業用バックアップ（UI 非表示）
├── index.html                # → site/index.html へリダイレクト（旧URL互換）
├── site/                     # カタログサイト（Section Parts Catalog のコード）
│   ├── index.html            # エントリ（タブ・カード・モーダル）
│   ├── script.js             # SECTION_TYPES / FALLBACK_META / 読み込み
│   ├── style.css
│   ├── package.json          # npm run dev → 親ディレクトリを serve して sections を読む
│   └── test/                 # テスト用LP（任意）
└── sections/                 # パーツ実体（種別ごとにフォルダ分類）
    ├── fv/
    ├── intro/
    │   ├── meta.json
    │   ├── intro_a.html …
    └── pain/
    └── …
```

## 開き方

- **推奨:** `catalog` をルートにした HTTP サーバーで開き、`/site/index.html` にアクセスする。  
  例: `cd LP半自動/catalog && python3 -m http.server 8082` → `http://localhost:8082/site/index.html`
- **互換:** `catalog/index.html` を開くと `site/index.html` にリダイレクトします。

## トレース・反映の流れ

1. トレース成果物はまず **`crawl/traces/`** に置く（任意）。
2. カタログに載せるときは **`LP半自動/catalog/sections/<種別>/`** に HTML を配置し、同フォルダの **`meta.json`** を更新する。
3. **`catalog/site/script.js`** の **`FALLBACK_META`** にも同じ variant を追加する（`file://` で開いたときのフォールバック用）。

**HTML だけ置いた時点では未反映。** 上記 2 と 3 まで揃えて初めてカタログ UI にカードが出る。

詳細は **`crawl/トレース依頼_指示の型.md`**（**Claude Code 向け：ファイル格納**・**完了条件**）を参照。パーツ HTML は **`sections/`** のみ。**`site/` に置かない。**

## トラブル: `sections/intro/intro_g.html` があるのにカタログに出ない

**原因:** `meta.json` と `site/script.js` の **`FALLBACK_META`** に **`intro_g` の行が無い**（HTML だけ保存して終了した状態）。

**対処:** その `<種別>` の **`meta.json`** の `variants` に 1 件追加し、**同じ内容**を **`site/script.js`** の `FALLBACK_META` の該当セクションにも追加する。あわせて **`site/index.html`** の `script.js?...` のクエリを 1 文字変えてキャッシュ回避してよい。
