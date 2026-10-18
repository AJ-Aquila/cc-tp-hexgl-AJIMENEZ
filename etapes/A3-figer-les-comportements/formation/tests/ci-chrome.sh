#!/usr/bin/env bash
# HexGL QUnit : 0 = tests reussis, 1 = tests echoues, 2 = tests impossibles.
set -uo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HTML="$DIR/index.html"
REPORT="$DIR/rapport_erreur.html"
LOG=""
# Nettoyer les rapports de l'execution precedente, y compris en cas d'erreur precoce.
rm -f -- "$REPORT" 2>/dev/null || true
TEMP_PROFILE=""
BROWSER_LOG=""
cleanup() { if [[ -n "$TEMP_PROFILE" ]]; then rm -rf -- "$TEMP_PROFILE"; fi; }
trap cleanup EXIT
html_escape() {
  local v="$1"
  v="${v//&/&amp;}"; v="${v//</&lt;}"; v="${v//>/&gt;}"
  printf '%s' "$v"
}
impossible() {
  local reason="$1"
  local safe
  safe="$(html_escape "$reason")"
  cat >"$REPORT" <<EOF
<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>HexGL - Tests impossibles</title></head>
<body><h1>HexGL - Tests impossibles (code 2)</h1><p>$safe</p>
<p>Aucun resultat de test ne doit etre considere comme valide.</p>
<p>Ouvrez index.html manuellement et transmettez les resultats QUnit a Claude.</p></body></html>
EOF
  printf 'STATUT=TESTS_IMPOSSIBLES CODE=2\nRAISON=%s\nRAPPORT=%s\n' "$reason" "$REPORT"
  exit 2
}
[[ -f "$HTML" ]] || impossible 'index.html introuvable'
BROWSER="${1:-${CHROME_BIN:-}}"
if [[ -z "$BROWSER" ]]; then
  for name in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge microsoft-edge-stable chrome; do
    if command -v "$name" >/dev/null 2>&1; then BROWSER="$(command -v "$name")"; break; fi
  done
fi
[[ -n "$BROWSER" && -x "$BROWSER" ]] || impossible 'Chrome/Chromium/Edge introuvable ou non executable'
TEMP_PROFILE="$(mktemp -d "${TMPDIR:-/tmp}/hexgl-qunit-XXXXXXXX" 2>/dev/null)" || impossible 'Impossible de creer un dossier temporaire'
encode_path() {
  local input="$1" c h i out="" LC_ALL=C
  for ((i=0; i<${#input}; i++)); do
    c="${input:i:1}"
    case "$c" in [a-zA-Z0-9/._~-]) out+="$c" ;; *) printf -v h '%%%02X' "'$c"; out+="$h" ;; esac
  done
  printf '%s' "$out"
}
URL="file://$(encode_path "$HTML")?hexgl_poc=ok"
BROWSER_LOG="$TEMP_PROFILE/browser.log"
flags=(--headless=new --no-first-run --no-default-browser-check --disable-gpu --disable-extensions --disable-dev-shm-usage --dump-dom --virtual-time-budget=5000 --user-data-dir="$TEMP_PROFILE/profile" "$URL")
if command -v timeout >/dev/null 2>&1; then
  timeout 45s "$BROWSER" "${flags[@]}" >"$REPORT" 2>"$BROWSER_LOG"
  rc=$?
else
  "$BROWSER" "${flags[@]}" >"$REPORT" 2>"$BROWSER_LOG"
  rc=$?
fi
(( rc == 0 )) || impossible "Le navigateur n'a pas pu executer les tests (code=$rc)"
[[ -s "$REPORT" ]] || impossible 'Le navigateur n a produit aucun resultat HTML'
ROOT="$(grep -o -m 1 '<html[^>]*>' "$REPORT" || true)"
if [[ "$ROOT" == *'data-test-status="pass"'* ]]; then
  rm -f -- "$REPORT"
  echo 'STATUT=TESTS_REUSSIS CODE=0'
  echo 'SUCCES : QUnit termine, toutes les assertions sont reussies.'
  exit 0
fi
if [[ "$ROOT" == *'data-test-status="fail"'* ]]; then
  echo 'STATUT=TESTS_ECHOUES CODE=1'
  echo 'ECHEC : QUnit a detecte une ou plusieurs assertions en echec.'
  echo "RAPPORT=$REPORT"
  exit 1
fi
impossible 'QUnit non termine ou marqueur de resultat absent'
