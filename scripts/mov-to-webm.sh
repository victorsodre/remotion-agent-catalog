#!/usr/bin/env bash
# Converte exports do Remotion Studio (.mov / .mp4) para .webm em web/previews/
# e liga no catalog.json.
#
# Uso (no repo do catálogo):
#   ./scripts/mov-to-webm.sh ~/Downloads/MktCtaBrasil.mov
#   ./scripts/mov-to-webm.sh ~/Downloads/Mkt*.mov
#
# Nomes conhecidos do Studio deste repo:
#   MktPrecoAncorado.mov  →  PrecoAncorado-Autoral.webm
#   MktSeloRegressiva.mov →  SeloDesconto-Regressiva-Autoral.webm
#   MktProvaSocial.mov    →  ProvaSocial-Autoral.webm
#   MktCtaBrasil.mov      →  CtaBrasil-Autoral.webm
# Qualquer outro arquivo vira <stem>-Autoral.webm (ajuste o nome se precisar).

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/web/previews"
mkdir -p "$OUT"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "precisa do ffmpeg (brew install ffmpeg)" >&2
  exit 1
fi
if [ $# -lt 1 ]; then
  echo "uso: $0 arquivo.mov [arquivo.mov ...]" >&2
  exit 2
fi

map_name() {
  case "$1" in
    MktPrecoAncorado) echo "PrecoAncorado-Autoral" ;;
    MktSeloRegressiva) echo "SeloDesconto-Regressiva-Autoral" ;;
    MktProvaSocial) echo "ProvaSocial-Autoral" ;;
    MktCtaBrasil) echo "CtaBrasil-Autoral" ;;
    *) echo "${1}-Autoral" ;;
  esac
}

for src in "$@"; do
  [ -f "$src" ] || { echo "não achei: $src" >&2; exit 1; }
  stem="$(basename "$src")"; stem="${stem%.*}"
  dest="$(map_name "$stem")"
  echo "→ $dest.webm  ($src)"
  ffmpeg -y -i "$src" -an -c:v libvpx -b:v 600k -crf 32 -deadline good "$OUT/$dest.webm" </dev/null
done

node "$ROOT/scripts/link-previews.mjs"
echo "pronto. arquivos em $OUT"
