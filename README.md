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

## Publicar (GitHub Pages)

O site publica sozinho a cada envio para o `main`: o GitHub Actions (`.github/workflows/pages.yml`) roda `npm run montar` e `npm run verificar` e publica a pasta `dist` em https://gabrielefraime.github.io/or-marketing-digital-site/ .

O GitHub Pages não tem servidor. Por isso a IA usa chaves guardadas no navegador de quem usa a Minha área:
1. Abra o site publicado, entre na Minha área e vá em **IAs**.
2. Cole a chave da Groq (console.groq.com/keys) em uma das três IAs; as outras usam a mesma. IA 1 = Qwen 3.8 27B (criação), IA 2 e IA 3 = GPT-OSS 120B (estratégia, atendimento e captação).
3. Para "Criar imagem com IA", crie uma conta em enter.pollinations.ai (entra com o GitHub), gere uma chave secreta (`sk_...`) e cole no cartão **Imagens das artes · Pollinations**. Cada imagem custa frações de centavo em Pollen, e a conta nova ganha créditos.
4. Opcional, mas recomendado: cole a chave do Gemini (aistudio.google.com/apikey) no cartão **Reserva de emergência · Gemini**. Se a Groq falhar ou estiver sem chave, o texto sai pelo Gemini, com aviso na tela; se o Pollinations falhar, o site tenta a imagem pelo Gemini (imagem só com faturamento ativo).
5. Clique em **Salvar** e em **Testar** em cada IA. As chaves ficam cifradas só naquele navegador e nunca vão para o GitHub. Em outro computador, cole de novo.

Nunca coloque chave no código, no `.env.example` ou no GitHub: a página é pública.

### Servidor no Cloudflare (opcional, desligado)
`functions/` e `wrangler.toml` continuam no repositório para quando houver servidor (chaves no servidor, briefings dos visitantes, imagens grátis pelo Workers AI). Hoje o site não usa: o projeto `or-marketing-digital-site` no Cloudflare não publicou nenhuma versão (o build falha) e pode ser desligado no painel.

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
