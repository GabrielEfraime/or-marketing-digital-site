# Pendências

## Só o dono pode resolver
- [ ] **Revogar a chave antiga da Groq** (foi compartilhada em conversa) e gerar outra em console.groq.com/keys. Colar a nova em *Minha área > IAs*.
- [ ] Preencher `RESPONSAVEL` em `src/js/01-config-precos.js`; `PRIV_EMAIL` e `VAGAS` (quando houver vagas) em `src/js/05-dados-leads.js`.
- [ ] Conferir se o número `MY_WHATS` pode ficar público (ele aparece no botão de WhatsApp do site).
- [ ] Revisar a **tabela de preços** (`PRECOS`) e os rascunhos jurídicos (`docs/termos-de-uso.md`, `politica-de-reembolso.md`, `plano-de-incidente.md`): são rascunhos, precisam de validação.
- [ ] Criptografar o disco (BitLocker) do notebook: os backups guardam dados pessoais em texto puro.
- [ ] Decidir hospedagem, banco, login do painel e domínio (Fase 2).

## Não foi verificado
- Importar a planilha de Google Ads no **Google Ads Editor** de verdade (colunas podem precisar de mapeamento).
- **PageSpeed** a partir de `file://` e de um domínio próprio (CORS).
- Caminhos de menu do Google Ads e da Meta nas mensagens de pedido de acesso.
- Qualidade das respostas dos **9 especialistas** com os modelos reais (só o texto do pedido foi conferido).
- Desempenho dos efeitos (WebGL + vários canvas) em notebook fraco; primeiro corte se pesar: a cena de "Como funciona" e a orbe.
- Telas largas (1360px+) do site público e o hover real em todos os efeitos.

## Dá para programar
- **Testes automáticos** (Playwright): abrir sem erro de JS, briefing digitável, envio cria lead, PIN, geração na ordem Resumo → Orçamento → Estratégia, WhatsApp `wa.me/55…`, backup mescla por `t`, armazenamento bloqueado (lista completa na seção 9 de `ESPECIFICACAO-COMPLETA.md`).
- **Fase 2**: site público estático; API com limite de uso, proxy de IA e chaves só no servidor; painel em endereço separado com login real e 2FA; banco (SQLite/Postgres/Supabase/D1); LGPD (consentimento, canal de exclusão, retenção).
- **Envio de leads** do site público para o painel (hoje o lead fica no navegador de quem preencheu; `LEAD_WEBHOOK` está desligado).
- **WhatsApp Business API** (envio automático com modelos aprovados).
- **Google Ads API / Meta Graph API** com autorização do cliente (hoje: CSV e lançamento manual).
- Rodar o arquivo montado por um **linter** simples no `verificar` (por exemplo, nomes de funções duplicados entre arquivos).
- Self-hospedar uma fonte de marca no HTML (se quiser a tipografia da marca de volta, sem terceiros).

## Reestruturação da Minha Área (roteiro de 2026-10-27)

**Feito, sem servidor:**
- Dashboard principal como tela inicial, com dados reais, filtros (período, status, serviço, plano, cliente), ordenação, funil, leads por dia, tarefas e atividades.
- Aba **Métricas** em cada projeto: período atual x anterior, última atualização, estado vazio e integrações listadas como não conectadas.
- Status **recusado**, **plano escolhido** (registrado pelo consultor, com data e histórico) e **registro de atividades**.
- Indicador de salvamento (confirma que gravou ou avisa que não).

**Falta (próximas etapas, ainda sem servidor):** orçamento estruturado e editável (escopo, entregáveis, validade, histórico de alterações), planos configuráveis na tela, histórico de versões de tudo que a IA gera (buscar, duplicar, arquivar), arquivamento após 90 dias sem resposta, reorganização das ferramentas em módulos e unificação visual completa da Minha Área com o site.

**Exige servidor (Fase 2):** portal do cliente (login, convite, recuperação de senha), funcionários e permissões no backend, auditoria confiável, o cliente escolher o plano e a equipe ser notificada, integrações automáticas (Instagram, YouTube, Google Analytics), backup de um ano e exclusão que respeite a LGPD. Sem servidor, essas partes só poderiam ser telas sem lógica real.

## Dashboard Bento e briefings por módulo (feito)
- Dashboard em grade Bento (4/2/1 colunas por largura do container): leads por dia com leitura por cursor e setas do teclado, pendentes, orçamentos, aprovados, taxa de aprovação, conversão, atenção (alertas acionáveis), funil clicável, projetos, tarefas, serviços, atividade. Fórmulas: aprovação = aprovados ÷ (aprovados + recusados), mínimo 3 decisões; conversão = aprovados ÷ leads recebidos, mínimo 5 leads. Orçamento não é somado como receita.
- Briefing: cada serviço escolhido vira um módulo com perguntas fixas próprias (sem IA no meio, exceto o roteiro "Descobrir"). Negócio, nome e oferta são perguntados uma vez; público, cores, estilo, referências, integrações, região e concorrentes não se repetem. Botão "Não sei responder agora" marca a resposta como "Não informado" (módulo fica "precisa de esclarecimentos"). Rascunho em `brief2` (12 dias, só neste navegador) com botão "Continuar briefing salvo". Painel "Briefing por serviço" no lead.
- Perguntas novas: Google Ads (público, conta, prioridades, concorrentes, quem responde, regras), Meta (região, contas), Redes (aprovação, respostas, temas a evitar), Site (aprovador, acessibilidade/privacidade e bloco de loja condicional), Redesign (acesso, migração, URLs).
- Ainda não: módulos próprios para manutenção de site, textos e imagens e influenciadores/audiovisual; campo "obrigatório x opcional" por pergunta; cadastro de novo serviço com perguntas editáveis; briefing vinculado ao orçamento por versão; histórico de alterações das respostas.
- Vagas e RH com currículo, IA de RH e permissões: precisam de servidor (Fase 2).

## Modais e vagas (feito sem servidor)
- Modal padrão (`dlg` em 07): botão fechar, Esc, foco preso e devolvido, fundo travado (`body.mlock`), rolagem do overlay sem cortar o topo (flex + margin auto), aviso ao descartar (`m.sujo`). `confirma()`/`sim()` substituem os 5 `confirm()` nativos. O modal do WhatsApp usa o mesmo padrão e pergunta antes de perder uma mensagem editada.
- Vagas (`22c-vagas.js`, chave `vagas2`): criar, editar, rascunho, pré-visualizar, publicar, pausar, encerrar, reabrir, duplicar, arquivar, histórico, filtros. Formulário em página própria, com os dados preservados ao trocar de tela. Candidatos por vaga (ligados pelo título) com etapa, nota interna, busca e ordenação.
- Limite: vagas ficam só neste navegador. A página pública só mostra as da constante `VAGAS`; para publicar, "Copiar código das vagas publicadas" e colar em `05-dados-leads.js`.
- Não feito (exige servidor): currículo em arquivo, armazenamento privado, extração de texto, IA de RH, comparação de candidatos, permissões e candidatura pública que chegue de outros dispositivos.

## Glassy e RH local (modo apresentação, sem servidor)
- `src/css/13-glass.css`: tokens (`--gl-solid`, `--gl-blur`, `--gl-r`, `--gl-fx`...), componentes `.glass`, `.glass-s`, `.glass-bar`, `.glass-st`; aplicado ao briefing (painel por serviço com status e progresso, resumo das respostas), dashboard, planos, vagas e modais (fundo desfocado, painel sólido, rodapé fixo). Campos e tabelas ficam sobre superfície sólida. Fallbacks: sem `backdrop-filter`, `prefers-reduced-transparency` e `prefers-reduced-motion`.
- Comparação dos pacotes no lead (`planosCards`, valores da tabela).
- RH local (`22d-rh.js`): currículo (PDF/DOCX/TXT até 3 MB, conferido por conteúdo real) guardado em IndexedDB `vyxa-cv`; leitura de TXT e DOCX (PDF só parcial); análise de IA com critérios da vaga, nome/e-mail/telefone removidos antes de enviar, currículo tratado como dado não confiável, sem decisão automática; perguntas editáveis e exportáveis; comparação por contagem de requisitos (sem nota); evita reanálise igual (hash) e avisa quando a vaga muda.
- ATENÇÃO LGPD: a política de privacidade atual diz que cadastros de vagas NÃO vão para IA. O app pede confirmação antes de enviar, mas o texto da política precisa ser revisado antes de usar com candidatos reais. Em modo local não existe controle de acesso: quem abre o navegador vê tudo.
- Não testado: IndexedDB num Chrome normal (bloqueado no navegador de prévia), análise com IA real, leitura de PDFs reais, visual em tela larga e celular real.

## Celular e tablet (ajuste de layout, sem mudar funcionalidade)
- Cantos arredondados em todo o site e painel (tokens `--r1..--r3` e regras no fim de `13-glass.css`).
- Briefing no celular: serviço e progresso por módulo em cima, a pergunta logo depois, fases/dica/resumo embaixo (CSS `order`, nada removido).
- Minha área ≤900px: menu em pílulas, grupo "Inteligência Artificial" achatado na faixa, rodapé do painel sem botão sobre texto, dashboard com filtros em 2 colunas e indicadores em pares, formulários de modal e painéis de configuração com rótulo acima e campo em linha própria, correção de estouro lateral no tablet (`.adm-g>*{min-width:0}`).
- Verificação: detector de sobreposição e de rolagem horizontal em 375, 768 e 1440 px para 12 telas; capturas só de alguns trechos no celular. Não testado em aparelho real nem em Safari/Firefox.

## Marca OR Marketing Digital (rebrand)
- Feito: logo em SVG (kit oficial em `assets/marca/kit-or/` (monograma, logos, ícone, aplicações), logo principal/negativo/monocromático, ícone de app), favicon, paleta preto/laranja/off-white, abertura e topo só com o símbolo OR, textos da IA e metadados trocados de Vyxa para OR. Camada `src/css/14-marca-or.css`.
- Logo: letras vetoriais do arquivo `file (1).svg` (O e R fiéis ao render; perna laranja desenhada por mim sobre o R), guardadas em `assets/marca/or-monograma-fiel-*.svg`. Usadas no topo, abertura, destaque e favicon. O render 3D colorido (`or-logo-3d-vetor-completo.svg`) ficou só arquivado por ser pesado (1,3 MB). Falta o "MARKETING DIGITAL" vetorizado.
- Sora e Inter: a CSP (`font-src 'none'`) impede carregar da internet; só aparecem se instaladas no aparelho, senão cai na fonte do sistema. Para valer em todos os aparelhos é preciso embutir os arquivos de fonte (precisa dos .woff2).
- Mantidos de propósito: chave `vyxa|` do hash do PIN e banco `vyxa-cv` (mudar quebraria PIN e currículos já salvos).
- Cores dos gráficos do dashboard (JS) ainda usam azul/violeta; fotos/ilustrações não revisadas.
- Do documento novo NÃO feito: backend, login real, RLS, rate limit no servidor, criptografia, deploy/CI (servidor ainda não decidido; tudo local para apresentação).

## Abertura 3D e logo oficiais (pasta "LOGO E ABERTURA")
- A abertura do site agora é a `abertura-3d.html` enviada pelo dono, sem mudar o desenho: Three.js r159 em `src/js/00-three-r159.js`, lógica em `src/js/10b-abertura-or.js`, estilos em `src/css/15-abertura-or.css`. Sem WebGL, mostra o logo parado.
- Logo do topo, destaque e fallback: `logo-negativo.svg` do dono (`assets/marca/logo-negativo-oficial.svg`); favicon: `icone-32.png`.
- Custo: o site passou a ~1,2 MB por causa do Three.js. `verificar.mjs` ignora os `console.log` da biblioteca.
- NÃO testado: a abertura rodando (WebGL) no navegador, celular, desempenho em máquina fraca.

## Revisão geral na identidade OR (Chrome headless 1440x900, sem celular real)
- Corrigido: nomes Básico/Médio/Max na página pública e no acompanhamento (agora Essencial/Crescimento/Completo); faixa laranja chapada de "Opções" virou cinza claro; orbe AI-Driven e pontos do fundo deixaram de ser roxo/ciano/lima; azuis/violetas restantes do CSS e do JS trocados; brilho laranja do painel reduzido.
- Visto: abertura 3D rodando, página inicial (topo, manifesto, opções, AI-Driven, briefing, serviços), PIN, Dashboard, Vagas, IAs.
- NÃO visto: celular real (o Chrome headless não passa de ~500 px de largura), briefing guiado, páginas de serviço, tela de Leads, Base da IA, modais, Safari/Firefox.

## Ajustes de 28/10/2026 (conferidos no Chrome por canal interno, em tempo real, 1100/1440/1600 px)
- Feito: efeito do OR do rodapé, Três opções alinhada, menu sem quebra, Talentos dentro de Vagas, Base da IA migrada, erro de JS no fundo de pontos (raio negativo) corrigido.
- Próximo: novo Acompanhamento (escopo contratado por cliente, produção recorrente, campanhas com exemplos para a IA, dados de Google/Meta Ads, acesso rápido ao código do site). Integrações oficiais com Google Ads, Meta Ads e WhatsApp dependem do servidor (Supabase) e de contas de desenvolvedor.

## Acompanhamento novo (29/10/2026, testado no Chrome com cliente de teste em perfil temporário)
- Testado: escopo carregado da tabela (28 entregas no pacote Crescimento com 5 serviços), abrir ciclo mensal, erro claro quando a IA não responde, campanha com exemplo em texto e imagem PNG, importação de CSV do Meta com decimal brasileiro, pauta de imprensa, versão do site a partir do kit, edição criando a segunda versão, lista de clientes.
- NÃO testado: geração real pela IA (nenhuma IA ligada no teste), DOCX/PDF nos exemplos, celular, Safari/Firefox.
- Falta: os arquivos do IndexedDB (versões do site e exemplos) não entram no backup; com o Supabase, ir para o armazenamento privado.

## Produção por frentes (29/10/2026, Chrome com IA simulada na página de teste)
- Testado: pacote Completo com Instagram e TikTok vindos do briefing, ligar o Facebook, "Gerar tudo" (138 peças em 31 partes), galeria da frente, página da peça, gerar uma peça de novo, celular (500 px), lead de site sem estratégia (antes quebrava a tela; corrigido).
- NÃO testado: geração com IA de verdade (a qualidade e o tempo dependem do modelo), Safari/Firefox, celular real.
- Atenção: Stories "todo dia" geram 30 sequências por mês e redes extras multiplicam as peças; ajuste as quantidades em "O que vamos fazer" se não fizer sentido gerar tudo.

## Captar clientes e SEO (29/10/2026, Chrome com Google e IA simulados)
- Testado: abrir o site e a Minha área não chama IA (0 chamadas em 4 s com lead novo); "Gerar tudo com a IA" chama resumo, orçamentos e estratégia; busca (texto e campos pedidos ao Google), filtro "Sem site", "Carregar mais", fechado permanentemente fica de fora, salvar selecionados, prévia com 2 fotos do Google (reduzidas para JPEG) e terceira foto como espaço desenhado, avaliações reais com XSS escapado e nota baixa fora, mensagem sem asterisco e com a linha de saída, WhatsApp com 55 + número, marcar contatado, fechou → lead de site na lista de Leads, fila de 2 sites, negócio adicionado à mão com nome com HTML (escapado), erro claro sem chave, celular (390 px).
- NÃO testado: a Places API de verdade (falta a chave do dono), qualidade dos sites gerados por IA de verdade, cota e custo reais do Google, Safari/Firefox, celular real.
- Para ligar a busca: no Google Cloud, criar um projeto, ligar o faturamento, ativar a "Places API (New)", criar uma chave restrita só a essa API, pôr limite de gasto e colar em Captar clientes > Chave do Google. Para o build de teste, `GOOGLE_PLACES_KEY=...` no `.env`.
- Termos do Google Maps Platform: o app guarda só o necessário para o contato e usa fotos e avaliações só na prévia, com o autor. Validar com um especialista antes de usar em escala.
- Hospedar as prévias com link próprio (ex.: dominio/previa/nome) depende do servidor; por enquanto o consultor publica o HTML baixado (Netlify Drop, Cloudflare Pages) e cola o link.
- SEO para publicar: preencher `url` (domínio final com https e barra) e `googleVerificacao` em `src/seo.json`, rodar `npm run montar`, publicar `dist/estudio-ia.html` como `index.html` com `robots.txt` e `sitemap.xml` ao lado, e enviar o sitemap no Google Search Console. Sem `url`, não há canonical nem sitemap.
- Antes de publicar continua valendo: a chave da IA não pode ir no site público (servidor intermediário), PIN não é login real, preencher `RESPONSAVEL` e `PRIV_EMAIL`. O arquivo tem ~1,7 MB (Three.js), o que pesa no tempo de carregamento e no SEO em celular.

## Limpeza, correções da auditoria e Cloudflare (29/10/2026)
- Corrigido e testado: armazenamento cheio não perde mais a última gravação; data de "hoje" no fuso do computador; preço com ponto decimal; apagar cliente não volta pelo backup e limpa os arquivos do IndexedDB; histórico do HD só com 30 dias; um só formato de número de WhatsApp; 290 KB de imagens sem uso, Ollama e 8 funções e cerca de 12 KB de CSS sem uso removidos (o site foi de 1,68 MB para 1,41 MB).
- Testes automáticos: `npm run testar` (11 testes: preços, combo, conferência de valores, data, WhatsApp e o servidor com KV e Groq simulados). O `npm run verificar` também roda.
- Testado no Chrome (sem janela, IA e buscas simuladas): site sem chamada de IA ao abrir, tela IAs com o painel do servidor, botão de gerar site no acompanhamento (vira versão), Refazer site (PageSpeed simulado, lista da IA, a análise entra no pedido do site), Captar pelo OpenStreetMap, "Falta um passo" no briefing, armazenamento cheio. A busca real no OpenStreetMap foi feita fora do site: funciona, mas levou de 40 a 90 s e trouxe poucos negócios.
- NÃO testado: o deploy de verdade no Cloudflare (precisa da sua conta), a Groq pelo servidor, a leitura de site pelo servidor em produção, celular real, Safari e Firefox.
- Para publicar o teste (passo a passo no README): repositório privado no GitHub; Cloudflare Pages com build `node scripts/montar.mjs` e saída `dist`; segredos `GROQ_API_KEY` (chave nova) e `ADMIN_TOKEN` (32+ caracteres); KV ligado como `LEADS`.
- Antes do lançamento de verdade: login real no lugar do PIN (o PIN protege só a tela), domínio próprio com `url` em `src/seo.json`, `RESPONSAVEL` e `PRIV_EMAIL`, política de privacidade citando o armazenamento no Cloudflare, revogar as chaves da Groq antigas.
- Os dados que estavam no file:// não aparecem sozinhos no 127.0.0.1: conecte a pasta de backup ou importe um backup na primeira vez.
