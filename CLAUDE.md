# Vyxa Marketing Digital (plataforma com IA)

Leia primeiro: `README.md` (como rodar e editar), `docs/ARQUITETURA.md` (mapa dos arquivos), `docs/DECISOES-E-PREFERENCIAS.md` (o que o dono quer e não quer) e `docs/PENDENCIAS.md`. Especificação completa: `docs/ESPECIFICACAO-COMPLETA.md` (leia só a seção da tarefa).

## Como trabalhar
- **Edite `src/`, nunca `dist/`.** Depois: `npm run montar` e `npm run verificar` (inclui `npm run testar`). O resultado é um arquivo único, `dist/estudio-ia.html` (e `dist/index.html` para a hospedagem). Abra com `npm run abrir` (servidor local em 127.0.0.1), não por duplo clique.
- Servidor: `functions/api/[[rota]].js` (Cloudflare Pages Functions): `/api/ia` (Groq com a chave no servidor), `/api/lead`, `/api/leads`, `/api/site`. Sem dependências; testado em `scripts/testar.mjs`.
- Sem dependências npm. Node 18+.
- JavaScript em **um único escopo global**, concatenado na ordem de `src/ordem.json`. Não repita nomes entre arquivos. Arquivo novo: inclua em `ordem.json`.
- No CSS, o que vem depois vence. Há muitos `!important` herdados; procure o uso de uma classe antes de apagar regra.
- **Antes de mudar muito: dê um plano curto.** Mostre prints reais (Playwright ou navegador) das mudanças visuais. Em tela cheia o preview às vezes deforma: confira em 800x520 e em tela larga.
- Peça confirmação para o que só o dono decide (preços, textos de marca, domínio, hospedagem). Não invente.

## Regras fixas
- Interface, erros e textos: **português do Brasil**.
- Não inventar funcionalidade, preço, número, depoimento ou resultado. O que faltar: perguntar, ou "a confirmar" nos textos gerados.
- **Segredos**: nunca chave de API no código nem no repositório. No Cloudflare: `GROQ_API_KEY` e `ADMIN_TOKEN` como segredos. A chave Groq antiga vazou: tratar como revogada.
- **IA só no clique**: nada chama IA ao abrir o site ou a Minha área.
- Texto de usuário na tela sempre por `esc()`. Sem `innerHTML` com texto cru.
- Acessibilidade: foco visível, contraste, `aria-*` em diálogos e abas, `prefers-reduced-motion` desliga animações, alvos de toque ≥ 44px.
- Sem recursos de terceiros carregados sozinhos (nada de Google Fonts, CDN, imagens externas). A CSP do `<head>` precisa continuar fechada.
- Só tema escuro.
- A IA nunca faz conta nem inventa preço: valores só da tabela `PRECOS`; o app calcula.
- O consultor sempre revisa antes de qualquer coisa ir ao cliente.

## Armadilhas
1. `el.onkeydown = e => e.key==='Enter' && fn()` cancela a digitação: use bloco `{ if(...) ... }`.
2. Em `background` com várias camadas, a cor sólida vai por último.
3. `localStorage` pode estar bloqueado (iframe, modo privado): há fallback em memória.
4. Navegação por estado (`P.page`, `A.view`), não por `#hash` (exceto `#/admin`).
5. Durante o streaming da IA, atualize só o painel de leitura.
6. Modelos Groq mudam de nome: oferecer "Ver modelos disponíveis". `gpt-oss`: `reasoning_effort:"low"` e `max_tokens` ×2,5+600; em HTTP 400, repetir sem parâmetros opcionais.
7. JSON de modelo pequeno falha: extrair `{...}`, tirar vírgulas finais, ter fallback para texto bruto.

## Ao terminar uma tarefa
Rode `npm run montar` e `npm run verificar`; diga o que foi testado de verdade e o que não foi (por exemplo, "não vi o desktop largo"). Se mudou decisão de design, atualize `docs/DECISOES-E-PREFERENCIAS.md`.
