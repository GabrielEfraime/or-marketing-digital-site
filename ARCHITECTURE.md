# Arquitetura

## Visão geral

Um **único escopo global de JavaScript**, sem módulos e sem build de verdade: `scripts/montar.mjs` só concatena os arquivos de `src/` na ordem de `src/ordem.json` e os encaixa em `src/index.molde.html`. Por isso:

- uma função ou constante de um arquivo vale em todos os outros que vêm **depois** dela na ordem (e, dentro de funções, também as que vêm antes, porque só são chamadas quando a página já carregou);
- **não repita nomes** entre arquivos: o último vence e o erro some em silêncio;
- o resultado final é um HTML único (`dist/estudio-ia.html` e `dist/index.html`); abra com `npm run abrir` (servidor local) e publique no GitHub Pages: o GitHub Actions (`.github/workflows/pages.yml`) roda `npm run montar` e `npm run verificar` e publica só a pasta `dist/`. Sem servidor: as chaves da IA ficam cifradas no navegador e não existe nenhuma rota `/api/*`. O Cloudflare (`functions/`, `wrangler.toml`, `dist/_headers`) foi aposentado no Lote 3A; o `index.html` da raiz do projeto também saiu do git e do build.

## Mapa dos arquivos JavaScript (na ordem em que são montados)

Os números seguem a ordem real de carga em `src/ordem.json` (sem letras e sem buracos). Quem cria ou divide um arquivo renumera os seguintes e atualiza a tabela de renomeações mais abaixo.

| # | Arquivo | Responsabilidade |
|---|---|---|
| 00 | `util` | Helpers genéricos (`uid`, `today`, `brl`, `arr`, `hexLum`), IndexedDB (`idbAbre`/`idbTx`), `copiar(txt,msg)` e `sanitizaHtml()`/`dlHtml()` (HTML gerado pela IA que sai do app: sem script, sem `on*`, com CSP `script-src 'none'`) |
| 01 | `config-precos` | Constantes do dono (`BRAND`, `ADMIN_PIN`, `MY_WHATS`, `RESPONSAVEL`, `FOTO`, `LEAD_WEBHOOK`), o monograma OR (`VMARK`), tabela de preços `PRECOS`, `FAIXA_VERBA` |
| 02 | `marca-or` | Identidade Earthen Luxe: `SLOGAN` e o desenho da abertura (`ABERTURA_SVG`, a assinatura animada do kit) |
| 03 | `modulos-servicos` | `MODS`: os serviços (nome, cor, perguntas do briefing, tarefa, escopo), `SITE_REF`/`SITE_REGRAS`, `SITE_SKILLS`, roteiro "Descobrir o que eu preciso" (`recomendar()`) |
| 04 | `armazenamento-config` | `$`, `sget/sset` (localStorage com fallback em memória), `CFG`, `saveCfg`, cofre cifrado das chaves (`keysSave`/`keysLoad`), migrações de `cfg2`; apaga o `ortoken` antigo |
| 05 | `sementes-base-ia` | Exemplos por ramo (`EX_NOVOS`, `EX_SEED`) e base inicial da IA (`KB_SEED`) |
| 06 | `dados-leads` | `esc()`, validação (`cleanLead`, `cleanTrack`), `getL/setL/upd`, `PRIV_EMAIL`, `VAGAS`, `RETENCAO_MESES`, versão da política |
| 07 | `seguranca-pin` | SHA, PBKDF2, `pinOk()` com bloqueio de tentativas |
| 08 | `ui-base` | Diálogos, privacidade, trocar PIN, `qaOf`, `brief()`, `setApp()`, `marcaApagado`, `purgaPendentes` |
| 09 | `ia-chamadas` | `ask()` (streaming; API compatível com OpenAI: Groq e Gemini, sempre com a chave do navegador), `askF()` (cai nas outras IAs e na reserva Gemini, avisando quem respondeu), limites da Groq (`IA_LIM`), `IAKIND`/`IADEF` |
| 10 | `app-navegacao-icones` | Estado `P`, `nav()`, `render()`, ícones (`ICON`, `IC`), logo |
| 11 | `visual-3d-efeitos` | Canvas/WebGL: `vMarkStart`, `orbStart`, `dotsStart` (só no topo de Vagas), `capitulos`, `introStart`, `cenaStart`, `megaStart`, `rotulos`, `pilhaStart` (serviços em pilha), `marcaFundo` (símbolo OR nas dúvidas) |
| 12 | `abertura-or` | `orAberturaRodar()`: abertura com a assinatura animada (CSS em `15-abertura-or.css`), sem bibliotecas |
| 13 | `esfera-agua` | `aifStart()`: esfera de água (shader) |
| 14 | `topo-3d` | `heroCenaStart()`: cena 3D de tela cheia no topo da home (WebGL puro; areia e seda em ondas, câmera avançando; meia resolução, ~30 qps, para fora da tela) |
| 15 | `conteudo-servicos` | `SOBRE`: textos de cada página de serviço; `VITRINE`: os 6 serviços do site público (lista, cartões da primeira tela, SEO), cada um ligado a um ou mais módulos de `MODS` |
| 16 | `site-publico-base` | `vida()`, `tick()`, `nav2()` (menu), constantes do briefing |
| 17 | `site-publico-paginas` | `pub()` (home), `svcPage()`, `vagasPage()` |
| 18 | `briefing-assistente` | `gate()`, perguntas da IA (`aiQ`, `nextQ`), `wizard()`, `submit()` (sem servidor: o lead fica no navegador e segue pelo WhatsApp), `thanks()` |
| 19 | `backup-disco` | Pasta de backup já conectada (File System Access API: `diskInit`/`diskSave`/`diskLoad`; não há mais tela para conectar nem baixar/importar backup), `merge()` por data, `bkpDecifra` (usada pelo cofre) |
| 20 | `minha-area-estado` | Minha área, estado e utilitários: `A`, `J`, `svcs`, `svcName`, `parseOrc`, `statLine` |
| 21 | `assistente-setor` | Assistente interno por setor (`orAssist*`, `OR_SETORES`) |
| 22 | `minha-area` | Casca da Minha área (direção C): `admShell` (menu agrupado, barra de topo com breadcrumb, busca, avisos, ajuda e avatar, barra inferior no celular), `pnIr()` (troca de tela por estado), menu da conta/folha "Mais", `admin()` (PIN), lista de leads, abas, ações e detalhe do lead |
| 22 | `paleta-comando` | Paleta Ctrl+K (`pnPaletaAbre`): telas e leads, só dados locais, foco preso, Esc fecha |
| 23 | `demandas-quadro` | Quadro de demandas (`orQuadro*`, `OR_QUADRO`, `OR_COLUNAS`): dados, normalização, importação, lista e eventos |
| 24 | `demandas-quadro-ia` | Demandas com IA: arte da demanda (`orQuadroArteIA`), imagem (`orQuadroImagemIA`) e planejamento (`orQuadroPlanejar`) |
| 25 | `especialistas-estrategia` | `ESP` (um especialista por serviço), `PM_CORE`, `PM_MOD`, `gen()` |
| 26 | `regras-profissao` | Regras de publicidade por profissão (advocacia, medicina, odontologia; contabilidade e engenharia em levantamento): `rgpDetectar`, `rgpBloco` (entra nos prompts via `kb` e nas artes/legendas), painel "Conferir regras da profissão" (`rgpPainel`, guardado em `lead.rgp`) |
| 27 | `orcamento-mensagem` | `calcOrc` (o app faz as contas), `CURTO`, `orc()`, `msgGen()`, `gerarTudo()` (só no clique) |
| 28 | `resumo-base-ia` | `kb()` (base da IA), `pickEx()`, `ficha()` (Resumo), esquemas de Ads e redes |
| 29 | `execucao-kits-site` | `siteGuide()`, `sitePrompt()`, kits (`execGen`), CSV do Google Ads, calendário, "Refazer site" (`siteAtualHtml`, `saAct`, `saBloco`; mede no PageSpeed) |
| 30 | `acompanhamento` | Tarefas, métricas, PageSpeed, relatório semanal, pedidos de acesso |
| 31 | `dashboards` | Dashboard principal (dados reais, filtros, funil, tarefas, atividades), aba Métricas por projeto, registro de atividades (`ativ2`), indicador de salvamento |
| 32 | `acompanhamento-anexos` | Acesso ao IndexedDB `or-arquivos` (`arqPut`, `arqGet`, `arqDel`, `arqDelPref`): exemplos de campanha, versões do site e artes; fora do backup |
| 33 | `acompanhamento-escopo` | O que vamos fazer: frentes de cada serviço (`frentesDe`), pacote contratado, aba Escopo (`tabEscopo`) |
| 34 | `acompanhamento-producao` | Produção por ciclo: galeria de frentes e de peças, página da peça, entregas e geração com IA (`frenteGerar`, `geraFila`, `kitGerar`) |
| 35 | `acompanhamento-campanhas-site` | Campanhas com exemplos, Meta Ads (CSV), imprensa (pautas e clipping), acesso rápido e versões do código do site |
| 36 | `acompanhamento-landing-referencias` | Referências de landing page (`LP_CAT`, `LP_ESTILO`, `LP_REFS`, `lpBloco`, `lpRefsHtml`) que entram no pedido do site |
| 37 | `acompanhamento-verificacao-site` | `siteVerifica` e `verificaDlg`: verificação automática do HTML gerado (acessibilidade, segurança, privacidade e SEO) |
| 38 | `acompanhamento-mensagens-ciclos-perfil` | Mensagens prontas de WhatsApp (`waMsg`), mês do contrato (`cicIni`, `cicAtual`) e perfil do cliente (`perfilDe`, `ctxIA`, `perfilIA`) |
| 39 | `acompanhamento-ia-canal` | Assistente de IA de cada canal (`iaPainel`, `iaCanal`), briefing de produção de uma peça (`pecaBriefing`) e aba Meta |
| 40 | `acompanhamento-acoes-eventos` | `prodAct`, `prodBind` (ações e eventos das partes novas) e confirmação da contratação (`fecharDlg`) |
| 41 | `editor-arte` | Editor de arte em canvas (`reaArte*`: texto, cores, fontes, slides, foto, PNG, "Criar imagem com IA" e "Abrir no Canva" sem API) |
| 42 | `posts-painel` | Posts por briefing, painel (`postsInner`, `REA_POSTS_STATE`): calendário, galeria, cartões, identidade visual e prompts para o Canva |
| 43 | `posts-acoes` | Posts por briefing, ações: vincular, gerar post/plano/legenda com IA, duplicar, baixar, miniaturas e eventos (`reaPostsBind`) |
| 44 | `ia-imagem` | Imagem com IA (`iaImagem`, `iaImgPrompt`): o fundo da arte (sem texto) sai pelo Pollinations, com a chave do cartão de imagens; se falhar, tenta o Gemini (reserva). Sem nenhuma das duas chaves, avisa onde colar. Botão "Criar imagem com IA" no editor e nas Demandas |
| 45 | `referencias-visuais` | Referências de identidade visual no lead: upload, conferência por IA (só material de marca) e leitura de cores, estilo e demanda |
| 46 | `vagas` | Vagas na Minha área: criar, editar, publicar, pausar, encerrar, arquivar, duplicar; candidatos por vaga |
| 47 | `rh` | RH local: currículo em IndexedDB, análise de IA com critérios da vaga, perguntas de entrevista, comparação |
| 48 | `captacao` | Captar clientes: busca no Google (Places API, chave do consultor em `gplaces`; também busca grátis no OpenStreetMap, `capBuscarOSM`), sinais de oportunidade (sem site, só Instagram, celular), prévia do site (IA 1) com fotos e avaliações reais montadas pelo app, mensagem de abordagem (IA 2), etapas até virar lead. Lista em `prosp1` (entra no backup); prévias e fotos no IndexedDB `or-arquivos` (`cap:<id>`, `capf:<id>`) |
| 49 | `whatsapp-ias-inicializacao` | Janela de WhatsApp (`waOpen`), tela IAs (só chaves digitadas, sem servidor), banco de talentos e a inicialização (`render()`). Tem de ser o último |

### Renomeações do Lote 3A (06/11/2026)

Só nomes e numeração mudaram: a ordem de carga, as funções, os bancos e as chaves de armazenamento são os mesmos. Os arquivos novos vieram da divisão de três arquivos grandes em blocos inteiros, na mesma sequência.

| Nome antigo | Nome novo |
|---|---|
| `01b-marca-or.js` | `02-marca-or.js` |
| `02-modulos-servicos.js` | `03-modulos-servicos.js` |
| `03-armazenamento-config.js` | `04-armazenamento-config.js` |
| `04-sementes-base-ia.js` | `05-sementes-base-ia.js` |
| `05-dados-leads.js` | `06-dados-leads.js` |
| `06-seguranca-pin.js` | `07-seguranca-pin.js` |
| `07-ui-base.js` | `08-ui-base.js` |
| `08-ia-chamadas.js` | `09-ia-chamadas.js` |
| `09-app-navegacao-icones.js` | `10-app-navegacao-icones.js` |
| `10-visual-3d-efeitos.js` | `11-visual-3d-efeitos.js` |
| `10b-abertura-or.js` | `12-abertura-or.js` |
| `11-esfera-agua.js` | `13-esfera-agua.js` |
| `11b-topo-3d.js` | `14-topo-3d.js` |
| `12-conteudo-servicos.js` | `15-conteudo-servicos.js` |
| `13-site-publico-base.js` | `16-site-publico-base.js` |
| `14-site-publico-paginas.js` | `17-site-publico-paginas.js` |
| `15-briefing-assistente.js` | `18-briefing-assistente.js` |
| `16-backup-disco.js` | `19-backup-disco.js` |
| `17-minha-area.js` (dividido) | `20-minha-area-estado.js`, `21-assistente-setor.js`, `22-minha-area.js`, `23-demandas-quadro.js`, `24-demandas-quadro-ia.js` |
| `18-especialistas-estrategia.js` | `25-especialistas-estrategia.js` |
| `18b-regras-profissao.js` | `26-regras-profissao.js` |
| `19-orcamento-mensagem.js` | `27-orcamento-mensagem.js` |
| `20-resumo-base-ia.js` | `28-resumo-base-ia.js` |
| `21-execucao-kits-site.js` | `29-execucao-kits-site.js` |
| `22-acompanhamento.js` | `30-acompanhamento.js` |
| `22b-dashboards.js` | `31-dashboards.js` |
| `22e-acompanhamento-producao.js` (dividido) | `32-acompanhamento-anexos.js` a `40-acompanhamento-acoes-eventos.js` (9 arquivos) |
| `22g-editor-posts.js` (dividido) | `41-editor-arte.js`, `42-posts-painel.js`, `43-posts-acoes.js` |
| `22h-ia-imagem.js` | `44-ia-imagem.js` |
| `22i-referencias-visuais.js` | `45-referencias-visuais.js` |
| `22c-vagas.js` | `46-vagas.js` |
| `22d-rh.js` | `47-rh.js` |
| `22f-captacao.js` | `48-captacao.js` |
| (novo, Site Studio Etapa 1) | `48-site-studio-projetos.js` (projetos ligados a prospect e lead; só dados; chave `proj1`; ver `SPEC.md`) |
| (novo, Site Studio Etapa 2) | `48-site-studio-analise.js` (fatos, prompt e leitura da análise da IA), `48-site-studio-tela.js` (tela `A.view==='studio'`), `css/28-site-studio.css` |
| (novo, Site Studio Etapa 3) | `48-site-studio-site.js` (geração do site, pedidos de mudança e versões; limite e histórico em `48-site-studio-versoes.js`; proposta comercial em `48-site-studio-proposta.js`; HTML no IndexedDB `or-arquivos`, chave `ssv:<projeto>:<n>`) |
| `23-whatsapp-ias-final.js` | `49-whatsapp-ias-inicializacao.js` |

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

- Três "slots", todos na Groq (padrão em `IA_DEF`, `04-armazenamento-config.js`): **IA 1** = `qwen/qwen3.8-27b` (criação: posts, legendas, roteiros, textos das artes, kits, mensagens), **IA 2** = `openai/gpt-oss-120b` (estratégia e atendimento: calendário, briefing, Resumo, orçamento, relatórios), **IA 3** = `openai/gpt-oss-120b` (captação). As três usam a mesma chave da Groq. Há ainda o cartão `pol` (Pollinations, imagens das artes) e o cartão `img` (Gemini, reserva de emergência do texto e das imagens). Tudo só no clique.
- `askF()` tenta o slot, depois os outros, depois o Gemini (sempre com aviso na tela); só então mostra o erro.
- Anthropic, OpenRouter, Cerebras e OpenAI saíram da CSP e da tela IAs em 06/11/2026. Um `cfg2` antigo que ainda aponte para eles volta, só nessa IA, ao padrão da Groq (migração `seededProv`, `04-armazenamento-config.js`), sem perder as outras configurações.
- Os prompts de especialista (`ESP`) entram só na Estratégia e nos kits. O orçamento usa o protocolo curto (`PM_MOD`).
- **Frameworks do Prompt Mestre** (`25-frameworks-marketing.js`: `FW`, `FW_POR_MOD`, `fwBloco(mods, modo)`, `fwMaxExtra`): FOFA com prioridade e cruzamento, AIDA, STP e Matriz de Ansoff, mais regras de tipografia. Blocos curtos, só onde servem ao serviço: Estratégia (`gen`, modo `plano`; Marketing = FOFA+STP+Ansoff, Assessoria = FOFA+Ansoff, Google Ads/Meta = AIDA, Site = AIDA+STP+tipografia), propostas e mensagem de WhatsApp (`orc`/`msgGen`, AIDA), kits (`execGen`), peças (`34`), legenda (`43`), captação (`48-captacao`), Site Studio (análise = FOFA dentro do JSON; `ssBaseSys` = AIDA+STP+tipografia; revisão confere tipografia). A proposta do Site Studio e o assistente do briefing não usam IA com framework. Em análise, a IA marca [confirmado], [hipótese] e [estimativa], sem valor em reais nem dado inventado. Para mudar onde entra cada framework, edite `FW_POR_MOD`.
- A IA **nunca faz conta nem inventa preço**: `calcOrc`/`checarValores` conferem os valores contra a tabela.

## Armazenamento

| Chave | O que guarda |
|---|---|
| `leads2` | Leads (mais novo primeiro) |
| `cfg2` | Configuração, base da IA, PIN (hash) — **sem** chaves de IA |
| `ikeys2` | Chaves de IA cifradas com AES-GCM (também no IndexedDB; a chave de cifra fica no IndexedDB como não exportável). `ikeys` é o formato antigo, sem cifra: se existir, o site cifra e apaga |
| `talentos2` | Banco de talentos (vagas) |
| `ativ2` | Registro de atividades (status, orçamentos, mensagens, envios, planos), até 400 |
| `pinlock` | Bloqueio de tentativas do PIN |

A pasta no HD (só para quem já a conectou) mescla por `id`, vencendo o maior `t`. Tudo que entra por importação passa por `cleanLead`/`cleanTrack`.

## Segurança (resumo)

- CSP no `<head>` (`default-src 'none'`), sem recursos de terceiros.
- Todo texto de usuário na tela passa por `esc()`; sites gerados pela IA rodam em `iframe sandbox`.
- PIN com PBKDF2 e sal; PIN padrão não é aceito além do primeiro acesso.
- O painel continua sendo um PIN no navegador: **não é segurança de servidor**.

## CSS

O site é só no tema escuro (o `<head>` do molde fixa `data-theme=dark`, que o CSS ainda usa; não há ramo de tema claro no JS nem regra `[data-theme=light]` no CSS). Cascata em camadas: o que vem depois vence. Desde o Lote 3B (06/11/2026) são 26 arquivos em `src/css/`, na ordem de `src/ordem.json`:

| Arquivo | Dono de |
|---|---|
| `00-fontes.css` | Sora e Inter (embutidas pelo build) |
| `01-tokens-reset.css` | `:root`, reset, tipografia base, botão, foco, movimento reduzido global |
| `01-site-publico.css` | Site público: briefing (`.wzl`), navegação, rodapé, cartões, páginas de serviço |
| `01-minha-area.css` | Minha área: menu lateral, lista de leads, abas, painéis, acompanhamento, janelas |
| `02` a `12` | Camadas do site público e do dashboard (HIG, soluções, home v2, AI-driven, serviço e vagas, toques, abertura, United, dashboard) |
| `13-vidro.css` | **Dono único do vidro** (fundido de 05, 13 e 21): tokens glass, vidro só em barras, botões e menus, briefing, planos, modais, ajustes de celular e fallbacks de transparência reduzida |
| `15`, `17` a `20`, `22` | Abertura OR, manifesto em cartões, alinhamento, acompanhamento, captação, pilha de serviços |
| `23-identidade-earthen.css` | **Dono da marca e dos tokens** (fundido de 14 e 23): estados `--ok/--err/--warn/--info`, `--sp-*`, `--t-*`, `--dur-*`, `--z-*`, ícones, utilitários `.u-*`, paleta Earthen Luxe, assinatura OR, slogan, seções claras |
| `24` a `27` | Topo 3D, títulos e dúvidas, Minha área limpa, editor de posts |

Regras do vidro (desde o Lote 3B): `backdrop-filter` só em barra do topo (`.nav`), capítulos laterais (`.v-cap`), barra de filtros (`.dsh-f`), abas (`.tabs`), botões e flutuantes (`.totop`, `.wafab`). Cartões, painéis e janelas não têm blur; o fundo atrás da janela (`.modal`) só escurece. Para criar um componente novo, use fundo sólido (`--panel`, `--pane`, `--side`). O bloco "sem suporte / reduzir transparência" fica no fim de `13-vidro.css`.

Ao editar: quando um arquivo antigo e um novo definem a mesma regra, o novo vence pela ordem. Resta `!important` só onde é preciso (movimento reduzido global, utilitários `.u-*`, menu do topo, botões da Minha área e o que vence estilo inline do JS). Antes de apagar uma regra, procure se a classe ainda é usada no JS e no molde (`et-*` é montada dinamicamente).

**Identidade (Earthen Luxe, 02/11/2026):**
- `00-fontes.css` declara Sora e Inter. Os arquivos ficam em `src/fontes/`, com a licença OFL, e o `montar.mjs` os embute como `data:`. A CSP tem `font-src data:`.
- `23-identidade-earthen.css` (marca e identidade, junto com os antigos tokens do 14) tem as cores da marca (`--or-obsidiana`, `--or-ardosia`, `--or-marfim`, `--or-areia`, `--or-terra`), a assinatura OR | MARKETING DIGITAL, o slogan e as seções claras em marfim.
- Para trocar de logo, mude `VMARK` (01) e `ABERTURA_SVG` (02).
- `24-topo-3d.css` vem depois dela: o topo limpo da home (classe `v-t3`, que não é a `v-h3` dos títulos), com a cena 3D, o título em dois tamanhos e a seta de rolar, e o fundo suave do Como funciona. Os cartões flutuantes (antigo `16-hero-flutuante.css`) e as texturas de pontos saíram.

## Como acrescentar…

**Um novo serviço:** `MODS` (03), `SOBRE` e `VITRINE` (15), `ICON` (10), `PM_MOD` e `ESP` (25), `CURTO` (27), linhas em `PRECOS` (01) e, se o "Descobrir o que eu preciso" deve indicá-lo, uma regra em `recomendar()` (03).
**Uma nova página pública:** uma função como `vagasPage()` em 17, o roteamento em `pub()` (`P.page`), um botão com `data-...` ligado em `setApp()` (08).
**Um novo efeito visual:** função `xxxStart()` em 11, chamada no fim da página em que aparece (ex.: no fim da home em `pub()`), e o CSS em um arquivo `src/css/` novo registrado em `ordem.json`. Respeite `prefers-reduced-motion` e pare o `requestAnimationFrame` quando o elemento sair do DOM.

## SEO do site público

- `src/seo.json`: título, descrição, cidade, `url` (domínio final) e `googleVerificacao` (Search Console). O `montar.mjs` coloca no `<head>` (no lugar de `{{SEO}}`): title, description, robots `index,follow`, canonical e og:url (só com `url`), Open Graph, verificação do Google e JSON-LD (`ProfessionalService` com os serviços de `MODS` + `WebSite`). No `<body>` (`{{NOSCRIPT}}`) entra o mesmo conteúdo da página para quem abre sem JavaScript.
- `dist/robots.txt` sempre; `dist/sitemap.xml` só com `url`. Publicar o site como `index.html` na raiz, com os dois arquivos ao lado.
- O build de teste (`montar:teste`) troca o robots para `noindex,nofollow`. As prévias de site da Captação também saem com `noindex`.
- Nada de texto escondido só para o Google (cloaking): é proibido pelas regras do Google e derruba o site da busca.

## Scripts e testes

- `scripts/montar.mjs`: concatena `src/` e grava `dist/estudio-ia.html`, `dist/index.html`, `dist/robots.txt` (e `dist/sitemap.xml` se houver `url`). Não grava nada na raiz do projeto nem cabeçalhos de servidor: o GitHub Pages não os aceita (a CSP vale pela meta tag do `<head>`).
- `scripts/abrir.mjs`: servidor local só da página, em 127.0.0.1:5173 (`--teste` serve o build de teste); responde 421 a qualquer cabeçalho `Host` que não seja `127.0.0.1:PORTA` ou `localhost:PORTA`. Lê `GROQ_API_KEY`, `GEMINI_API_KEY` e `POLLINATIONS_API_KEY` do `.env` (só local).
- `scripts/montar-teste.mjs`: build de teste com as chaves do `.env` (NUNCA publicar).
- `scripts/verificar.mjs`: segurança, SEO e roda `scripts/testar.mjs`.
- `scripts/testar.mjs`: roda as funções do site num contexto isolado do Node (preços, combo, data, WhatsApp, imagem da IA, chamadas à IA, demandas, editor, briefing, links). Para os arquivos divididos usa `lerJs(...)`, que junta, na ordem de `ordem.json`, os arquivos pelo nome sem o número.
- Refazer site: `siteAtualHtml`, `saAct`, `saBloco` (29). Apagados: `CFG.apagados`, `marcaApagado`, `purgaPendentes` (08).
