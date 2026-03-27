#!/usr/bin/env python3
"""
sync_catalog.py — カタログ自動同期スクリプト

実行すると以下を自動で行う:
  1. site/sections/*/*.html をスキャン
  2. 各セクションの meta.json を更新
  3. site/script.js の FALLBACK_META を更新
  4. git add → commit → push

HTMLファイル先頭に以下のコメントを入れると description として使われる:
  <!-- description: ここに説明文 -->

使い方:
  python3 sync_catalog.py
  python3 sync_catalog.py --dry-run   # 変更内容を確認するだけ（push しない）
"""

import os
import re
import json
import subprocess
import argparse
from pathlib import Path

# --- 設定 ---
REPO_ROOT = Path(__file__).parent
SECTIONS_DIR = REPO_ROOT / "site" / "sections"
SCRIPT_JS = REPO_ROOT / "site" / "script.js"

SECTION_LABELS = {
    "fv":          "FV（ファーストビュー）",
    "intro":       "イントロダクション",
    "pain":        "課題・悩み提起",
    "benefit":     "ベネフィット",
    "service":     "サービス・商品紹介",
    "testimonial": "実績・事例",
    "voice":       "お客様の声",
    "media":       "メディア・権威性",
    "flow":        "ご利用の流れ",
    "faq":         "よくある質問",
    "cta":         "CTA",
    "footer":      "フッター",
    "price":       "料金",
    "pricing":     "料金（別バリアント）",
    "instructor":  "講師実績",
    "impact":      "インパクト訴求",
}

# SECTION_TYPES の並び順
SECTION_ORDER = [
    "fv", "intro", "pain", "benefit", "service", "testimonial",
    "voice", "media", "flow", "faq", "cta", "footer",
    "price", "pricing", "instructor", "impact",
]


def extract_description(html_path: Path) -> str:
    """HTML の先頭 10 行から <!-- description: ... --> を探す"""
    try:
        with open(html_path, encoding="utf-8") as f:
            for i, line in enumerate(f):
                if i >= 10:
                    break
                m = re.search(r'<!--\s*description:\s*(.+?)\s*-->', line)
                if m:
                    return m.group(1).strip()
    except Exception:
        pass
    return ""


def scan_sections() -> dict:
    """site/sections/ をスキャンしてセクション情報を返す"""
    result = {}
    if not SECTIONS_DIR.exists():
        print(f"[ERROR] {SECTIONS_DIR} が存在しません")
        return result

    for section_dir in sorted(SECTIONS_DIR.iterdir()):
        if not section_dir.is_dir():
            continue
        sid = section_dir.name
        label = SECTION_LABELS.get(sid, sid)
        html_files = sorted(section_dir.glob("*.html"))
        variants = []
        for html in html_files:
            stem = html.stem  # e.g. fv_a
            name = stem.replace("_", "_").upper()  # e.g. FV_A
            desc = extract_description(html)
            variants.append({
                "id": stem,
                "name": name,
                "file": html.name,
                "description": desc,
            })
        result[sid] = {
            "section_type": sid,
            "section_label": label,
            "variants": variants,
        }
    return result


def update_meta_json(section_data: dict, dry_run: bool):
    """各セクションの meta.json を更新"""
    for sid, data in section_data.items():
        meta_path = SECTIONS_DIR / sid / "meta.json"
        content = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
        if dry_run:
            print(f"  [DRY] meta.json 更新: {meta_path.relative_to(REPO_ROOT)}")
        else:
            meta_path.write_text(content, encoding="utf-8")
            print(f"  ✓ meta.json 更新: {meta_path.relative_to(REPO_ROOT)}")


def build_fallback_meta_js(section_data: dict) -> str:
    """FALLBACK_META の JS 文字列を生成"""
    lines = ["const FALLBACK_META = {"]
    ordered_keys = SECTION_ORDER + [k for k in section_data if k not in SECTION_ORDER]

    for i, sid in enumerate(ordered_keys):
        if sid not in section_data:
            continue
        data = section_data[sid]
        is_last = (i == len([k for k in ordered_keys if k in section_data]) - 1)
        comma = "" if is_last else ","

        variant_parts = []
        for v in data["variants"]:
            desc = v["description"].replace('"', '\\"')
            variant_parts.append(
                f'    {{ "id": "{v["id"]}", "name": "{v["name"]}", '
                f'"file": "{v["file"]}", "description": "{desc}" }}'
            )
        variants_str = ",\n".join(variant_parts)

        lines.append(
            f'  "{sid}": {{ "section_type": "{sid}", '
            f'"section_label": "{data["section_label"]}", "variants": [\n'
            f'{variants_str}\n'
            f'  ]}}{comma}'
        )

    lines.append("};")
    return "\n".join(lines)


def update_script_js(section_data: dict, dry_run: bool):
    """script.js の FALLBACK_META ブロックを置き換え"""
    content = SCRIPT_JS.read_text(encoding="utf-8")

    # FALLBACK_META ブロックを検出（const FALLBACK_META = { ... };）
    pattern = re.compile(
        r'(const FALLBACK_META\s*=\s*\{.*?\};)',
        re.DOTALL
    )
    new_block = build_fallback_meta_js(section_data)

    if not pattern.search(content):
        print("[ERROR] script.js に FALLBACK_META が見つかりません")
        return

    new_content = pattern.sub(new_block, content)

    if dry_run:
        print(f"  [DRY] script.js FALLBACK_META 更新: {len(section_data)} セクション")
    else:
        SCRIPT_JS.write_text(new_content, encoding="utf-8")
        print(f"  ✓ script.js FALLBACK_META 更新: {len(section_data)} セクション")


def git_push(dry_run: bool):
    """変更を git add → commit → push"""
    if dry_run:
        print("  [DRY] git push をスキップ")
        return

    try:
        subprocess.run(["git", "add", "site/sections", "site/script.js"],
                       cwd=REPO_ROOT, check=True)

        result = subprocess.run(
            ["git", "diff", "--cached", "--quiet"],
            cwd=REPO_ROOT
        )
        if result.returncode == 0:
            print("  変更なし。push をスキップ。")
            return

        subprocess.run(
            ["git", "commit", "-m", "chore: sync catalog sections via sync_catalog.py"],
            cwd=REPO_ROOT, check=True
        )
        subprocess.run(["git", "push", "origin", "main"],
                       cwd=REPO_ROOT, check=True)
        print("  ✓ git push 完了 → Vercel 再デプロイ開始")
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] git 操作に失敗: {e}")


def main():
    parser = argparse.ArgumentParser(description="カタログ自動同期スクリプト")
    parser.add_argument("--dry-run", action="store_true", help="変更内容を確認するだけ（ファイル・push はしない）")
    args = parser.parse_args()

    print("=== sync_catalog.py ===")
    print(f"  モード: {'DRY RUN' if args.dry_run else '本番実行'}")
    print()

    print("[1] sections/ をスキャン中...")
    section_data = scan_sections()
    total_parts = sum(len(v["variants"]) for v in section_data.values())
    print(f"  {len(section_data)} セクション / {total_parts} パーツ を検出")
    print()

    print("[2] meta.json を更新...")
    update_meta_json(section_data, args.dry_run)
    print()

    print("[3] script.js FALLBACK_META を更新...")
    update_script_js(section_data, args.dry_run)
    print()

    print("[4] git push...")
    git_push(args.dry_run)
    print()

    print("=== 完了 ===")


if __name__ == "__main__":
    main()
