# OR Marketing Digital: site e Minha área

Plataforma em **um único arquivo HTML**, montado a partir de `src/`:

1. **Site público:** abertura, home, páginas de serviço, vagas e o briefing guiado.
2. **Minha área** (painel do consultor): leads, Captar clientes, resumo, estratégia, kits de Ads, redes e site, orçamentos, mensagem de WhatsApp, acompanhamento, Base da IA e IAs.
3. **IAs (OpenAI na criação, Gemini no atendimento, Groq na captação):** só roda quando o consultor clica. No site publicado, a chave fica no servidor do Cloudflare, e nunca no navegador. A Groq continua disponível na tela IAs.

Sem dependências npm. Precisa só de [Node.js 18+](https://nodejs.org).

## Comandos

```bash
npm run montar        # gera dist/ (index.html, estudio-ia.html, _headers, robots.txt)
npm run verificar     # segurança, SEO e testes automáticos
npm run testar        # só os testes (preços, data, WhatsApp, servidor)
npm run abrir         # abre a plataforma em http://127.0.0.1:5173 (com a chave Gemini do .env, só local)
npm run montar:teste  # build local com a chave do .env (OpenAI, Gemini e Groq; NUNCA publicar)
npm run abrir:teste   # abre o build de teste em http://127.0.0.1:5173
```

Use `npm run abrir` em vez de dar duplo clique no HTML. Pelo `file://`, qualquer HTML aberto no mesmo Chrome consegue ler as chaves e os dados da plataforma. Na primeira vez no endereço novo, clique em **Conectar pasta de backup no HD** para trazer os leads, ou importe um backup.

## Publicar para teste (GitHub + Cloudflare Pages)

O projeto no Cloudflare se chama `or-marketing-digital-site` e publica sozinho a cada envio para o `main` do GitHub. O `wrangler.toml` deixa no código a pasta publicada (`dist`, que vai junto para o GitHub) e a ligação com o Workers AI (imagens das artes). O painel do Cloudflare mostra esses campos, mas não deixa editá-los.

1. **Build:** em *Workers & Pages > or-marketing-digital-site > Settings > Build*, o comando de build é `npm run build`.
2. **Segredos:** em *Settings > Variables and Secrets*, crie (tipo **Secret**, não texto simples):
   - `GEMINI_API_KEY` (obrigatória): aistudio.google.com/apikey. As três IAs rodam no Gemini. No plano gratuito do Google o texto funciona e a imagem não; no site publicado a imagem cai para o Workers AI do Cloudflare (grátis até o limite do dia).
   - `ADMIN_TOKEN`: o código do servidor (32 caracteres ou mais). Há um pronto no seu `.env` local, na linha `ADMIN_TOKEN=`. É o mesmo que você cola em Minha área > IAs > Servidor.
   - Opcionais, só se trocar a plataforma na tela IAs: `OPENAI_API_KEY` e `GROQ_API_KEY`. Gere chaves **novas** antes de publicar.
3. **Briefings dos visitantes (opcional):** crie um KV namespace em *Storage & Databases > KV* e coloque o ID dele no `wrangler.toml` (instruções no próprio arquivo).
4. Rode o deploy de novo (*Deployments > Retry deployment*). Abra `https://or-marketing-digital-site.pages.dev`, entre na Minha área, troque o PIN, cole o `ADMIN_TOKEN` em **IAs > Servidor (Cloudflare)** e clique em **Testar o servidor**.

O GitHub Pages também publica o site, mas lá não existe servidor (`/api/*`): a IA publicada só funciona pelo endereço do Cloudflare.

O que o servidor faz (`functions/api/[[rota]].js`):
- `/api/ia`: chama a OpenAI, o Gemini ou a Groq (conforme o modelo) com a chave guardada no Cloudflare. Só aceita quem tem o código e só os modelos permitidos.
- `/api/lead`: recebe o briefing do visitante, com limite por IP, e guarda por até 30 dias. Na Minha área, os briefings chegam pelo botão "Buscar briefings do site" (e sozinhos ao abrir Leads) e saem do servidor depois de salvos.
- `/api/imagem`: cria a imagem de fundo de uma arte (sem texto; os textos ficam editáveis no editor). Tenta o Gemini com a `GEMINI_API_KEY` e, sem cota de imagem, usa o Workers AI do Cloudflare (binding `AI`).
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
