# TESTING.md: como testar e o que conta como evidência

Autoridade para **testes, evidências e validação visual**. Regras gerais: `AGENTS.md`. Nada é "pronto" sem evidência de que funciona.

## 1. Comandos
| Comando | O que faz |
|---|---|
| `npm run montar` | junta `src/` em `dist/` |
| `npm run verificar` | monta, confere CSP, segredos, SEO e roda os testes |
| `npm run testar` | só os testes automatizados (`scripts/testar.mjs`, 66 hoje) |
| `npm run abrir` | servidor local em `http://127.0.0.1:5173` (usa as chaves do `.env` só localmente) |
| `node scripts/capturar.mjs <url> <pasta> [--admin]` | capturas reais em tela cheia, com o Chrome do computador |

`verificar` falha por: CSP aberta ou com domínio novo em `connect-src`, chave de API no código, build de teste no `dist`, `eval`, `console.log`, regex com lookbehind, testes quebrados.

## 2. Testes automatizados (`scripts/testar.mjs`)
Cobrem lógica pura: preços e somas, projetos, mescla de backup, análise, extração e limpeza de HTML, proposta, cofre. **Não cobrem DOM** (`ssBlindaExport`, telas): isso se prova com navegador (seção 4). Teste novo: um por comportamento, com nome que diga o que protege, e sempre que corrigir um bug.

## 3. Checklist antes de dizer "pronto"
1. `npm run verificar` passou (cole a saída).
2. Funcionalidade exercitada de verdade no navegador (não só o código): fluxo feliz **e** erro (IA falhando, armazenamento bloqueado, campo vazio, texto hostil).
3. Validação visual (seção 4) em desktop e celular.
4. Acessibilidade (seção 5).
5. Segurança aplicável (seção 6).
6. Revisão cruzada do Codex em mudança crítica (`AGENTS.md`), com o registro em `docs/REVISOES-CRUZADAS.md`.
7. Relato honesto: o que foi testado, o que não foi, pendências. Sem "deve funcionar".

## 4. Validação visual
- Rode `node scripts/capturar.mjs http://127.0.0.1:5173/ capturas-<tarefa> --admin`. Gera PNGs em 1440x900 (desktop) e 390x844 (celular) do topo e das seções principais, e da Minha área. As pastas `capturas*/` são ignoradas pelo git.
- **Olhe as imagens** (não só o log) e compare com a direção de design escolhida. Corrija com base no que viu.
- Em celular real ou emulado: sem rolagem horizontal, botões flutuantes sem cobrir conteúdo, alvos de 44px.
- O painel do app deforma tela cheia: use a ferramenta acima, que tira a captura direto do Chrome.
- Ainda não coberto: Firefox, Safari e tablet. Registrar quando forem testados.

## 5. Acessibilidade (mínimo por tela nova)
Navegar só com teclado (Tab, Enter, Esc) com foco visível; `lang="pt-BR"`; títulos em ordem; `alt` nas imagens; `aria-*` em diálogos e abas; `prefers-reduced-motion` respeitado; contraste AA. Ferramenta disponível: skills `accessibility-scan` e `accessibility-audit`.

## 6. Segurança aplicável
- Texto de usuário ou da IA: teste com `<img src=x onerror=...>` e `<script>` em todos os campos novos; nada pode executar.
- HTML gerado por IA: só em iframe sandbox; ao baixar, por `ssBlindaExport`. Payloads conhecidos (template, noscript, CSS com escape, `tel:`, faixa escondida) estão em `docs/REVISOES-CRUZADAS.md` e em `spec-compliance/`.
- Nunca chave no código, no `dist` ou nos backups; `verificar` confere.

## 7. Testes com IA de verdade
Use **dados fictícios** (nunca de cliente real) e a chave local do `.env`. Registre modelo que respondeu, tempo e qualidade. Teste também a falha (sem chave, resposta cortada, JSON ruim).

## 8. Onde fica a evidência
Capturas em pasta local ignorada; texto das evidências na entrega ao CEO e, se for decisão, em `docs/REVISOES-CRUZADAS.md` ou `spec-compliance/`.
