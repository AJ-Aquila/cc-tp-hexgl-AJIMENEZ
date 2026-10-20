// Usage: node driver.mjs <url> <menu.png> <race.png> [chrome.exe]  - loads HexGL headless, screenshots the menu, clicks START, screenshots the race.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [url, menuOut, out, chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'] = process.argv.slice(2);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=9333', '--enable-unsafe-swiftshader', '--use-angle=swiftshader',
  '--window-size=1280,720', '--no-first-run', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'hexgl-'))}`, url], { stdio: 'ignore' });
try {
  let tab;
  for (let i = 0; i < 40 && !tab; i++) {
    await sleep(500);
    try { tab = (await (await fetch('http://127.0.0.1:9333/json')).json()).find(t => t.type === 'page' && t.url.startsWith('http')); } catch {}
  }
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 0; const pending = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); pending[m.id]?.(m.result); };
  const send = (method, params = {}) => new Promise(r => { pending[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  const ev = async expression => (await send('Runtime.evaluate', { expression })).result.value;
  // DOM clicks, not mouse coords: the menu layout shifts while assets load and coords hit the wrong row.
  while (!(await ev("document.readyState==='complete' && !!document.getElementById('start')"))) await sleep(500);
  await sleep(3000); // menu background image
  writeFileSync(menuOut, Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  await ev("document.getElementById('start').click()"); // START -> help screen
  await ev("document.getElementById('step-2').click()"); // help screen -> loads race
  for (let i = 0; i < 240 && (await ev("document.getElementById('step-4').style.display")) !== 'block'; i++) await sleep(1000); // swiftshader load is slow
  await sleep(5000); // countdown
  for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38 });
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log('saved', out);
} finally { proc.kill(); }
