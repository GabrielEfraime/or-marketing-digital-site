# OR Marketing Digital: site e Minha área

Plataforma em **um único arquivo HTML**, montado a partir de `src/`:

1. **Site público:** abertura, home, páginas de serviço, vagas e o briefing guiado.
2. **Minha área** (painel do consultor): leads, Captar clientes, resumo, estratégia, kits de Ads, redes e site, orçamentos, mensagem de WhatsApp, acompanhamento, Base da IA e IAs.
3. **IA (Gemini, do Google):** só roda quando o consultor clica. No site publicado, a chave fica no servidor do Cloudflare, e nunca no navegador. A Groq continua disponível na tela IAs.

Sem dependências npm. Precisa só de [Node.js 18+](https://nodejs.org).

## Comandos

```bash
npm run montar        # gera dist/ (index.html, estudio-ia.html, _headers, robots.txt)
npm run verificar     # segurança, SEO e testes automáticos
npm run testar        # só os testes (preços, data, WhatsApp, servidor)
npm run abrir         # abre a plataforma em http://127.0.0.1:5173 (com a chave Gemini do .env, só local)
npm run montar:teste  # build local com a chave do .env (Gemini ou Groq; NUNCA publicar)
npm run abrir:teste   # abre o build de teste em http://127.0.0.1:5173
```

Use `npm run abrir` em vez de dar duplo clique no HTML. Pelo `file://`, qualquer HTML aberto no mesmo Chrome consegue ler as chaves e os dados da plataforma. Na primeira vez no endereço novo, clique em **Conectar pasta de backup no HD** para trazer os leads, ou importe um backup.

## Publicar para teste (GitHub + Cloudflare Pages)

1. **GitHub:** crie um repositório **privado** e suba esta pasta. O `.gitignore` já deixa de fora o `.env`, o `dist/` e o build de teste.
2. **Cloudflare:** em *Workers & Pages > Create > Pages > Connect to Git*, escolha o repositório e preencha:
   - Build command: `node scripts/montar.mjs`
   - Build output directory: `dist`
3. Em *Settings > Variables and Secrets*, crie os segredos (tipo **Secret**, não texto simples):
   - `GEMINI_API_KEY`: a chave do Google AI Studio (aistudio.google.com/apikey). Gere uma **nova** antes de publicar.
   - `GROQ_API_KEY` (opcional): só se for usar a Groq.
   - `ADMIN_TOKEN`: um código aleatório com 32 caracteres ou mais. É ele que você cola em Minha área > IAs > Servidor.
4. Em *Storage & Databases > KV*, crie um namespace (ex.: `or-leads`). No projeto Pages, em *Settings > Bindings*, ligue esse namespace com o nome **`LEADS`**.
5. Rode o deploy de novo. Abra o endereço `*.pages.dev`, entre na Minha área, troque o PIN, cole o `ADMIN_TOKEN` em **IAs > Servidor (Cloudflare)** e clique em **Testar o servidor**.

O que o servidor faz (`functions/api/[[rota]].js`):
- `/api/ia`: chama o Gemini (ou a Groq) com a chave guardada no Cloudflare. Só aceita quem tem o código e só os modelos permitidos.
- `/api/lead`: recebe o briefing do visitante, com limite por IP, e guarda por até 30 dias. Na Minha área, os briefings chegam pelo botão "Buscar briefings do site" (e sozinhos ao abrir Leads) e saem do servidor depois de salvos.
- `/api/site`: baixa o HTML do site atual do cliente para a análise do "Refazer site".
- `dist/_headers`: cabeçalhos de segurança (CSP com `frame-ancestors 'none'`, HSTS, nosniff, Referrer-Policy e Permissions-Policy).

Quando tiver o domínio, preencha `url` e `googleVerificacao` em `src/seo.json` para gerar o canonical e o `sitemap.xml`.

## Como editar

1. Edite `src/` (nunca o `dist/`). A ordem dos arquivos está em `src/ordem.json`. O JavaScript tem um único escopo global, e no CSS o que vem depois vence.
2. Rode `npm run montar` e depois `npm run verificar`.
3. Para saber onde mexer em cada coisa, veja `docs/ARQUITETURA.md`. As decisões do dono estão em `docs/DECISOES-E-PREFERENCIAS.md` e o que falta está em `docs/PENDENCIAS.md`.

## Segurança

- Nenhuma chave no código. O `npm run verificar` falha se achar uma.
- Chaves coladas em conversas precisam ser **revogadas**: Groq em console.groq.com/keys, Gemini em aistudio.google.com/apikey.
- O PIN da Minha área protege só a tela. No site publicado, os dados do servidor exigem o `ADMIN_TOKEN`.
- Relatório completo: `docs/REVISAO-SEGURANCA.md`.
