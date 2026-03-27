# Section Parts Catalog — フォルダ構成

このディレクトリは **「カタログ閲覧サイト（UI）」** と **「セクションパーツの HTML」** を管理する。

**シート連携・チェックサイト・三本柱の位置づけ:** `LP半自動/ワークフロー手引き_索引.md` および `LP半自動/crawl/要件定義書.md`。

```
catalog/
├── README.md                 # 本ファイル
├── sync_catalog.py           # ★ 自動同期スクリプト（パーツ追加後に実行）
├── _archive/                 # 作業用バックアップ（UI 非表示）
├── index.html                # → site/index.html へリダイレクト（旧URL互換）
└── site/                     # カタログサイト（Vercel 配信 & ローカル確認）
    ├── index.html            # エントリ（タブ・カード・モーダル）
    ├── script.js             # SECTION_TYPES / FALLBACK_META / 読み込み
    ├── style.css
    ├── package.json
    ├── test/                 # テスト用LP（任意）
    └── sections/             # ★ パーツ実体（Vercel から直接配信）
        ├── fv/
        │   ├── meta.json
        │   └── fv_a.html …
        ├── intro/
        └── …
```

## パーツ追加の流れ（自動）

1. **HTML を作成** → `site/sections/<種別>/<variant>.html` に保存
   先頭に説明コメントを入れる（省略可、空欄になる）:
   ```html
   <!-- description: ここに説明文 -->
   ```

2. **同期スクリプトを実行**:
   ```bash
   python3 sync_catalog.py
   ```
   → meta.json 更新 → FALLBACK_META 更新 → git push → Vercel 自動再デプロイ

確認だけしたい場合:
```bash
python3 sync_catalog.py --dry-run
```

## 開き方（ローカル確認）

```bash
cd LP半自動/catalog && python3 -m http.server 8082
```
→ `http://localhost:8082/site/index.html`

## 本番 URL

https://lp-catalog.vercel.app/
