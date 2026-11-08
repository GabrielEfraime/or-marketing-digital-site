// Copia os arquivos que o git IGNORA mas que importam (documentos internos em docs/) para uma pasta de backup datada FORA do repositório.
// Por quê: o git não protege arquivo ignorado. Trocar de branch ou mesclar pode apagá-lo sem aviso (aconteceu em 08/11/2026).
// Rode ANTES de git checkout, merge, rebase, reset ou pull em branch que muda o que está rastreado:  npm run guardar
// Não copia o .env (segredos). Sem dependências.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sai = execFileSync('git', ['ls-files', '--others', '--ignored', '--exclude-standard', '--', 'docs'], { cwd: RAIZ, encoding: 'utf8' });
const arquivos = sai.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
if (!arquivos.length) { console.log('Nada ignorado em docs/ para guardar.'); process.exit(0); }
const d = new Date(), p = (n) => String(n).padStart(2, '0');
const carimbo = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
const destino = path.resolve(RAIZ, '..', '_arquivo', 'backup-privados-' + carimbo);
for (const rel of arquivos) {
  const origem = path.join(RAIZ, rel), alvo = path.join(destino, rel);
  fs.mkdirSync(path.dirname(alvo), { recursive: true });
  fs.copyFileSync(origem, alvo);
  console.log('ok  ' + rel + '  (' + fs.statSync(origem).size + ' bytes)');
}
console.log('Guardado em ' + destino);
