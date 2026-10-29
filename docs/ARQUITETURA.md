# Arquitetura

## Visão geral

Um **único escopo global de JavaScript**, sem módulos e sem build de verdade: `scripts/montar.mjs` só concatena os arquivos de `src/` na ordem de `src/ordem.json` e os encaixa em `src/index.molde.html`. Por isso:

- uma função ou constante de um arquivo vale em todos os outros que vêm **depois** dela na ordem (e, dentro de funções, também as que vêm antes, porque só são chamadas quando a página já carregou);
- **não repita nomes** entre arquivos: o último vence e o erro some em silêncio;
- o resultado final é um HTML único; abra com `npm run abrir` (servidor local) e publique no Cloudflare Pages (com as funções de `functions/`).

## Mapa dos arquivos JavaScript (na ordem em que são montados)

| # | Arquivo | Responsabilidade |
|---|---|---|
| 01 | `config-precos` | Constantes do dono (`BRAND`, `ADMIN_PIN`, `MY_WHATS`, `RESPONSAVEL`, `FOTO`), tabela de preços `PRECOS`, `FAIXA_VERBA` |
| 02 | `modulos-servicos` | `MODS`: os serviços (nome, cor, perguntas do briefing, tarefa, escopo), `SITE_REF`/`SITE_REGRAS`, roteiro "Descobrir o que eu preciso" |
| 03 | `armazenamento-config` | `$`, `sget/sset` (localStorage com fallback em memória), `CFG`, `saveCfg`, `loadKeys` |
| 04 | `sementes-base-ia` | Exemplos por ramo (`EX_NOVOS`, `EX_SEED`) e base inicial da IA (`KB_SEED`) |
| 05 | `dados-leads` | `esc()`, validação (`cleanLead`, `cleanTrack`), `getL/setL/upd`, `PRIV_EMAIL`, `VAGAS`, `RETENCAO_MESES`, versão da política |
| 06 | `seguranca-pin` | SHA, PBKDF2, `pinOk()` com bloqueio de tentativas |
| 07 | `ui-base` | Diálogos, privacidade, trocar PIN, `qaOf`, `brief()`, `setApp()` |
| 08 | `ia-chamadas` | `ask()` (streaming), `askF()` (cai na outra IA e na reserva), `warm()` |
| 09 | `app-navegacao-icones` | Estado `P`, `nav()`, `render()`, ícones, logo |
| 10 | `visual-3d-efeitos` | Canvas/WebGL: `vMarkStart`, `orbStart`, `dotsStart`, `capitulos`, `introStart`, `cenaStart`, `megaStart`, `rotulos` |
| 11 | `esfera-agua` | `aifStart()`: esfera de água (shader) |
| 12 | `conteudo-servicos` | `SOBRE`: textos de cada página de serviço |
| 13 | `site-publico-base` | `vida()`, `tick()`, `nav2()` (menu), constantes do briefing |
| 14 | `site-publico-paginas` | `pub()` (home), `svcPage()`, `vagasPage()` |
| 15 | `briefing-assistente` | `gate()`, perguntas da IA (`aiQ`, `nextQ`), `wizard()`, `submit()`, `thanks()` |
| 16 | `backup-disco` | Pasta de backup (File System Access API), `merge()` por data |
| 17 | `minha-area` | Estado `A`/`J`, `admin()`, lista de leads, abas, ações |
| 18 | `especialistas-estrategia` | `ESP` (um especialista por serviço), `PM_CORE`, `PM_MOD`, `gen()` |
| 19 | `orcamento-mensagem` | `calcOrc` (o app faz as contas), `orc()`, `msgGen()`, `gerarTudo()` (só no clique) |
| 20 | `resumo-base-ia` | `kb()` (base da IA), `pickEx()`, `ficha()` (Resumo), esquemas de Ads e redes |
| 21 | `execucao-kits-site` | `siteGuide()`, `sitePrompt()`, kits (`execGen`), CSV do Google Ads, calendário |
| 22 | `acompanhamento` | Tarefas, métricas, PageSpeed, relatório semanal, pedidos de acesso |
| 22b | `dashboards` | Dashboard principal (dados reais, filtros, funil, tarefas, atividades), aba Métricas por projeto, registro de atividades (`ativ2`), indicador de salvamento |
| 22e | `acompanhamento-producao` | Acompanhamento: o que vamos fazer (escopo do pacote), produção por ciclo semanal/mensal com IA, campanhas com exemplos (arquivos no IndexedDB `or-arquivos`), Meta Ads (CSV), imprensa (pautas e clipping), acesso rápido e versões do código do site, mensagens prontas de WhatsApp |
| 22f | `captacao` | (também busca grátis no OpenStreetMap, `capBuscarOSM`, quando não há chave do Google)  Captar clientes: busca no Google (Places API, chave do consultor em `gplaces`), sinais de oportunidade (sem site, só Instagram, celular), prévia do site (IA 1) com fotos e avaliações reais montadas pelo app, mensagem de abordagem (IA 2), etapas até virar lead. Lista em `prosp1` (entra no backup); prévias e fotos no IndexedDB `or-arquivos` (`cap:<id>`, `capf:<id>`) |
| 23 | `whatsapp-ias-final` | Janela de WhatsApp, tela IAs, banco de talentos, inicialização (`render()`) |

## Fluxo de um lead

```
Cliente (site público)             Consultor (Minha área)
  pub() → gate() → wizard()          admin() → lista de leads
  perguntas fixas + da IA (aiQ)      "Gerar tudo com a IA" (gerarTudo, só no clique):
  submit() → getL/setL (lead)          ficha()   Resumo        (IA 2)
                                       orc()     3 orçamentos  (IA 2, valores só da tabela)
                                       gen()     Estratégia    (IA 1, especialista do serviço)
                                       execGen() Kits          (sob clique)
                                     status: novo → pronto → aprovado → aplicado
                                     Corrigir a IA → salva em "Correções aprendidas"
                                     waOpen(): abre o WhatsApp com a mensagem revisada
```

O modelo de dados (`Lead`, `CFG`) está em `docs/ESPECIFICACAO-COMPLETA.md`, seção 6. Toda gravação de lead atualiza `t` (usado para mesclar backups).

## IA

- Dois "slots": **IA 1** (criação: Estratégia, kits, site) e **IA 2** (atendimento: perguntas, Resumo, orçamento, mensagem), mais a **IA 3** (reserva, Groq qwen). Tudo só no clique.
- `askF()` tenta o slot, depois o outro, depois a reserva; só então mostra o erro.
- Os prompts de especialista (`ESP`) entram só na Estratégia e nos kits. O orçamento usa o protocolo curto (`PM_MOD`).
- A IA **nunca faz conta nem inventa preço**: `calcOrc`/`checarValores` conferem os valores contra a tabela.

## Armazenamento

| Chave | O que guarda |
|---|---|
| `leads2` | Leads (mais novo primeiro) |
| `cfg2` | Configuração, base da IA, PIN (hash) — **sem** chaves de IA |
| `ikeys` | Chaves de IA (sessionStorage ou localStorage, conforme "lembrar") |
| `talentos2` | Banco de talentos (vagas) |
| `ativ2` | Registro de atividades (status, orçamentos, mensagens, envios, planos), até 400 |
| `pinlock` | Bloqueio de tentativas do PIN |

Backup em pasta no HD e exportar/importar JSON mesclam por `id`, vencendo o maior `t`. Tudo que entra por importação passa por `cleanLead`/`cleanTrack`.

## Segurança (resumo)

- CSP no `<head>` (`default-src 'none'`), sem recursos de terceiros.
- Todo texto de usuário na tela passa por `esc()`; sites gerados pela IA rodam em `iframe sandbox`.
- PIN com PBKDF2 e sal; PIN padrão não é aceito além do primeiro acesso.
- O painel continua sendo um PIN no navegador: **não é segurança de servidor**.

## CSS

Cascata em camadas: o que vem depois vence. `01-base-e-minha-area.css` tem os tokens (`:root`) e o painel; `04` a `11` formam o visual atual do site público (blocos de cor chapada, vidro, estilo United). Quando um arquivo antigo e um novo definem a mesma regra, o novo vence pela ordem, e vários usam `!important`. Antes de apagar uma regra antiga, procure se alguma classe dela ainda é usada.

## Como acrescentar…

**Um novo serviço:** `MODS` (02), `SOBRE` (12), `ICON` (09), `PM_MOD` e `ESP` (18), linhas em `PRECOS` (01).
**Uma nova página pública:** uma função como `vagasPage()` em 14, o roteamento em `pub()` (`P.page`), um botão com `data-...` ligado em `setApp()` (07).
**Um novo efeito visual:** função `xxxStart()` em 10, chamada no fim da página em que aparece (ex.: no fim da home em `pub()`), e o CSS em um arquivo `src/css/` novo registrado em `ordem.json`. Respeite `prefers-reduced-motion` e pare o `requestAnimationFrame` quando o elemento sair do DOM.

## SEO do site público

- `src/seo.json`: título, descrição, cidade, `url` (domínio final) e `googleVerificacao` (Search Console). O `montar.mjs` coloca no `<head>` (no lugar de `{{SEO}}`): title, description, robots `index,follow`, canonical e og:url (só com `url`), Open Graph, verificação do Google e JSON-LD (`ProfessionalService` com os serviços de `MODS` + `WebSite`). No `<body>` (`{{NOSCRIPT}}`) entra o mesmo conteúdo da página para quem abre sem JavaScript.
- `dist/robots.txt` sempre; `dist/sitemap.xml` só com `url`. Publicar o site como `index.html` na raiz, com os dois arquivos ao lado.
- O build de teste (`montar:teste`) troca o robots para `noindex,nofollow`. As prévias de site da Captação também saem com `noindex`.
- Nada de texto escondido só para o Google (cloaking): é proibido pelas regras do Google e derruba o site da busca.

## Servidor (Cloudflare Pages Functions) e testes

- `functions/api/[[rota]].js`: `/api/ping`, `/api/ia` (repassa para a Groq com `GROQ_API_KEY`; só modelos permitidos; `max_tokens` até 16000), `/api/lead` (público, até 64 KB, 5 por minuto e 30 por dia por IP, guarda 30 dias no KV `LEADS`), `/api/leads` (GET e DELETE), `/api/site` (baixa o HTML de um site público para a análise). Tudo, menos `/api/lead`, exige o cabeçalho `X-OR-Token` igual ao `ADMIN_TOKEN`.
- No navegador: `srvOn()`/`srvTok()` (08) decidem quando a IA vai pelo servidor (site em https, código salvo e IA na Groq sem chave local). `puxarLeads()` (17) traz os briefings. `submit()` (15) manda o lead para `/api/lead`.
- `scripts/montar.mjs` também grava `dist/index.html` e `dist/_headers` (CSP com `frame-ancestors 'none'`, HSTS, nosniff, Referrer-Policy, Permissions-Policy).
- `scripts/abrir.mjs`: servidor local só da página, em 127.0.0.1:5173 (`--teste` serve o build de teste).
- `scripts/testar.mjs`: roda as funções do site num contexto isolado do Node e o servidor com KV e Groq simulados.
- Refazer site: `siteAtualHtml`, `saAct`, `saBloco` (21). Habilidades de design: `SITE_SKILLS` (02). Apagados: `CFG.apagados`, `marcaApagado`, `purgaPendentes` (07).
