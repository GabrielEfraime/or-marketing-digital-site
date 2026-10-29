# PROMPT PARA O CLAUDE CODE: Plataforma VYRA Marketing Digital (com IA)

> **Como usar:** salve este arquivo como `CLAUDE.md` na pasta do projeto (ou cole na primeira mensagem) e peça: *"Leia o CLAUDE.md e o estudio-ia.html e execute a Fase 0."*
> **Acompanham este pacote:** `estudio-ia.html` (app funcional de referência, **fonte da verdade**), `vyra-logo-v.png` (logo, fundo transparente), `referencias-visuais/` (prints do visual final) e `ponte-claude-code.js` (opcional, hoje desligado).

---

## 0. Instruções de trabalho (para o Claude Code)

1. Leia este documento inteiro e depois o `estudio-ia.html` (é grande: leia por seções). **Se este documento e o arquivo divergirem, o arquivo vence.**
2. Antes de escrever código, devolva um **plano curto** (fases, estrutura de pastas, riscos, perguntas). Espere o OK do Gabriel nas decisões em aberto (seção 13).
3. Trabalhe por **fases** (seção 12). Ao fim de cada fase, rode os testes de aceitação (seção 11) e mostre prints reais (Playwright ou Puppeteer).
4. **Não invente** funcionalidade, texto de marca, preço, número ou depoimento. Se faltar informação, pergunte.
5. Interface, mensagens de erro e textos em **português do Brasil**. Código e nomes técnicos em inglês são aceitos, mas os textos do usuário são sempre em PT-BR.
6. **Segredos:** nunca coloque chave de API no código nem no repositório. Use `.env` + `.env.example`. A chave da Groq que existiu no protótipo foi compartilhada em conversa: **trate como vazada e gere uma nova**.
7. Código simples, legível e sem dependências desnecessárias. Toda entrada de usuário exibida na tela deve ser escapada (XSS).
8. Acessibilidade: foco visível, contraste suficiente nos dois temas, `aria-*` em abas, botões de alternância e diálogos, respeitar `prefers-reduced-motion`.

---

## 1. Contexto e objetivo

**Quem usa:** Gabriel Efraime, Rio de Janeiro, autônomo, presta serviços de marketing digital sob a marca **VYRA Marketing Digital** a pequenos negócios e criadores de conteúdo.

**O que a plataforma faz (ciclo completo):**
1. **Captação:** o cliente (sozinho, ou junto com o Gabriel, presencialmente) responde um **briefing inteligente**: poucas perguntas fixas + perguntas **geradas por IA** a partir das respostas anteriores.
2. **Geração automática** na área do Gabriel ("Minha área"): resumo do cliente, estratégia, **kit de execução** (Google Ads, redes sociais, site) e **3 orçamentos (Básico, Médio, Max) + mensagem de WhatsApp personalizada** para o ramo do cliente.
3. **Revisão:** o Gabriel confere, **corrige a IA** quando ela erra (e a correção vira memória), aprova e **envia o orçamento pelo WhatsApp**.
4. **Acompanhamento:** depois da aprovação, o cliente entra em execução: tarefas, acesso à conta do cliente, métricas (Google Ads, redes, site), diário e relatórios semanais gerados por IA.

**Serviços oferecidos (4):** Tráfego pago (Google Ads), Conteúdo para redes sociais, Site novo, Refazer meu site. O cliente pode contratar **mais de um (combo)**.

**Princípios do produto:**
- O consultor **sempre revisa** antes de qualquer coisa ir ao cliente.
- A IA **nunca inventa preço**: usa só a tabela de preços; o que faltar vira "a confirmar".
- Honestidade: sem promessa de resultado garantido.
- Rápido e "bonito": visual premium coerente com a marca (seção 2).
- IA **open source ou grátis**: Groq (modelos abertos `gpt-oss`) como principal, Ollama local como reserva.
- Privacidade: dados de cliente passam por serviços de terceiros (IA); isso deve ser dito ao cliente (LGPD, seção 13).

**Restrições do ambiente do Gabriel:** notebook 16 GB de RAM, GTX 1650 (4 GB VRAM), i7 de 10ª geração. Modelos locais devem ser pequenos (ex.: `qwen3.5:4b`, `qwen3.5:9b`). Windows. Chrome ou Edge.

---

## 2. Identidade visual VYRA (design system)

Fonte: imagem `Identidade_VYRA_em_Gradiente_Futurista.png` (usar os prints em `referencias-visuais/` como referência de resultado).

**Cores da marca:** violeta `#7B3DFF`, azul `#5B6CFF`, ciano `#00C6FF`, fundo `#0B0D14`, texto claro `#F5F7FF`.

**Tokens CSS (copiar do app):**

```css
/* marca (as variáveis --pink/--vio guardam o violeta da marca; nome histórico) */
:root{
  --pink:#7B3DFF;
  --blue:#5B6CFF;
  --vio:#7B3DFF;
  --cy:#00C6FF;
  --ylw:#ffd166;
  --ok:#12805c;
  --ink:#0B0D14
}
:root[data-theme=dark]{
  color-scheme:dark;
  --bg:#0B0D14;
  --fg:#F5F7FF;
  --fg2:#F5F7FFb8;
  --surf:#ffffff12;
  --surf2:#ffffff0a;
  --bd:#ffffff22;
  --inp:#ffffff44;
  --navbg:#0B0D14cc;
  --g1:#7B3DFF55;
  --g2:#5B6CFF30;
  --g3:#00C6FF1c;
  --panel:#12152a;
  --pane:#0e1120;
  --paper:#F5F7FF;
  --tab:#ffffff12;
  --inpbg:#ffffff0d;
  --btn:#F5F7FF;
  --btnfg:#0B0D14;
  --side:#070911;
  --link:#8EA0FF;
  --okc:#5be3b0
}
:root[data-theme=light]{
  color-scheme:light;
  --bg:#F5F7FF;
  --fg:#0B0D14;
  --fg2:#0B0D14b3;
  --surf:#ffffffd9;
  --surf2:#ffffff80;
  --bd:#dfe3f5;
  --inp:#0B0D1466;
  --navbg:#F5F7FFe6;
  --g1:#7B3DFF26;
  --g2:#5B6CFF22;
  --g3:#00C6FF1f;
  --panel:#ffffff;
  --pane:#f8f9ff;
  --paper:#ffffff;
  --tab:#e9ecfb;
  --inpbg:#f8f9ff;
  --btn:#0B0D14;
  --btnfg:#ffffff;
  --side:#0B0D14;
  --link:#4D5FEA;
  --okc:#12805c
}
```

**Tipografia:** títulos e wordmark em **Sora** (300–800); texto em **DM Sans** (400/500/700), via Google Fonts. O wordmark é "VYRA" em maiúsculas com `letter-spacing:.34em`, peso 500, e abaixo "MARKETING DIGITAL" bem pequeno (≈7,5px) com `letter-spacing:.45em`. Tagline oficial: **"Inteligência que transforma ideias em resultados."** Pilares: *Estratégia com dados*, *Criatividade sem limites*, *Resultados reais*. Serviços da marca: Planejamento, Criação, Tráfego, Conteúdo, Automação, Resultados. Parágrafo oficial: *"A VYRA une estratégia, criatividade e tecnologia para ajudar marcas a crescerem de forma mais inteligente, rápida e eficiente."*

**Logo:** o "V" em gradiente violeta→azul (arquivo `vyra-logo-v.png`, 228×150, fundo transparente, extraído da imagem de identidade). Use também como favicon. Se o Gabriel fornecer o SVG original, **troque** (o PNG é pequeno para telas grandes).

**Temas:** escuro (padrão) e claro, com troca persistida (`localStorage "tema"`), aplicada **antes** do primeiro render para não piscar (`<script>` no `<head>` define `data-theme` em `<html>`). Todas as cores via variáveis; texto sempre legível nos dois.

**Linguagem visual:**
- Fundo do site público: `--bg` com **três brilhos radiais** (`--g1`,`--g2`,`--g3`) em `background-attachment:fixed`. *Cuidado:* em `background` com várias camadas, a **cor sólida deve ser a última camada**.
- **Cartões de vidro**: gradiente sutil, borda de 1px em **gradiente** (técnica `::before` com `mask-composite:exclude`), brilho radial no canto, hover que sobe 4px.
- **Ícones de linha** (stroke 1.7, cantos arredondados), no estilo da prancha de marca: tráfego = gráfico em alta, conteúdo = play em círculo, site = monitor, refazer = setas circulares. Nunca emoji na interface.
- Botões em pílula com gradiente `#7B3DFF → #5B6CFF` e texto branco; botão "ghost" com borda; botão **WhatsApp** verde `#25D366` com texto escuro.
- Rótulos pequenos em caixa alta com `letter-spacing` largo (estilo da marca).
- Painel (Minha área): barra lateral escura fixa; conteúdo com cartões de estatística com borda superior colorida.
- Mockup ilustrativo no hero (orçamento em 3 pacotes + bolha de WhatsApp) **sempre com a legenda "Exemplo ilustrativo"**. Não usar números de resultado inventados (o "+325%" da prancha é só mockup).

---

## 3. Arquitetura da Fase 1 (o que já existe e deve ser recriado)

- **Um único arquivo HTML**, JavaScript puro (sem build), CSS inline, abre com duplo clique no Chrome/Edge (`file://`). A mesma página serve o **site público** e a **Minha área**.
- **Navegação por estado**, não por hash (variável de visão + `history.replaceState` opcional). Um `#/admin` na URL é só conveniência.
- **Persistência:** `localStorage` (`leads2`, `cfg2`, `tema`) com **fallback em memória** quando o navegador bloqueia armazenamento (iframes restritos, modo privado) e aviso amarelo na tela. Em Chrome, `file://` compartilha o `localStorage` entre abas do mesmo arquivo: é assim que o site público (uma aba) e a Minha área (outra aba) conversam. O painel detecta lead novo por evento `storage` + polling a cada 3 s.
- **Backup no HD:** File System Access API (`showDirectoryPicker`), handle guardado em IndexedDB (`estudio-ia`/`kv`/`dir`). Estrutura gravada: `leads.json`, `config.json`, `historico/leads_AAAA-MM-DD.json` (um por dia), `clientes/<nome>_<id>.md` (briefing, resumo, estratégia, orçamentos, mensagem, acompanhamento) e `.html` do site gerado. Na abertura, **mescla** por `id` ganhando o maior `t` (timestamp de atualização); `config.json` ganha pelo `t` maior. Pedir reconexão com 1 clique quando o navegador pedir permissão. Fallback manual: "Baixar backup" e "Importar backup" (JSON).
- **Chamadas de IA** direto do navegador para: Groq (API compatível com OpenAI), Ollama local (`http://localhost:11434`, exige `OLLAMA_ORIGINS="*"`), ou Anthropic (opcional). Streaming (SSE/NDJSON).
- **Fase 2 (produção)** está na seção 13 e muda onde ficam as chaves, os leads e o painel.

---

## 4. Jornadas

**A) Cliente no site público**
Home → escolhe 1 serviço (ou aba "combo" e marca 2–3) → tela de contato (nome, WhatsApp com DDD, e-mail opcional) → 2 perguntas fixas → 4 a 7 perguntas da IA (até 10 no combo) → 3 perguntas fixas de investimento → envia → tela "Recebi, {nome}. Já estou analisando." (sem expor nada do painel).

**B) Gabriel na Minha área**
PIN → Leads → lead novo aparece (status **novo**) → o app gera sozinho, nesta ordem: **Resumo** → **Orçamentos+Mensagem** → **Estratégia** → **Execução** (Google Ads e redes; o **site em HTML** só sob clique) → status **pronto** → Gabriel revisa cada aba, usa **Corrigir a IA** se precisar → **Aprovar** → **Enviar orçamento no WhatsApp** → cliente fecha → **Iniciar acompanhamento** (status "em execução").

**C) Acompanhamento**
Lista de clientes em execução → abre um cliente → abas por canal contratado, tarefas, diário, relatórios.

---

## 5. Funcionalidades detalhadas

### 5.1 Site público
- **Topo fixo** com logo + wordmark, botão de tema (sol/lua) e link discreto "Minha área".
- **Hero** com a tagline como H1 (a palavra "ideias" com sublinhado violeta translúcido), texto de apoio, botões "Começar meu briefing" e "Como funciona" (rolagem suave via `scrollIntoView`, **sem âncoras de hash**), 3 pílulas dos pilares com ícones ciano, mockup do orçamento.
- Seções: *Estratégia, criatividade e tecnologia* (parágrafo + 6 serviços em pílulas), *Escolha por onde começar*, *Como funciona* (3 passos), chamada final em gradiente, rodapé.
- **Escolha por onde começar:** abas **"Um serviço"** e **"Mais de um serviço (combo)"**. No combo, os cartões viram marcáveis (✓ Selecionado, contorno na cor do serviço) e uma barra mostra "N selecionado(s): ..." com botão **Continuar com o combo** (desabilitado com menos de 2).
- **Briefing (wizard)** em duas colunas: trilho à esquerda (chip do serviço com ícone, 4 fases: *Seu contato, Seu negócio, Perguntas sob medida, Investimento* com ✓/ativo, cartão de dica por fase) e painel de vidro à direita (barra de progresso segmentada, "Pergunta n", pergunta em fonte grande, resposta).
  - **Fases:** `seed` (2 fixas; no combo usar `COMBO_SEED`), `ai` (mín. 4, máx. 7; combo máx. 10), `comum` (3 fixas: prazo, investimento, forma de contratar).
  - **Texto livre:** `textarea` que cresce; **Enter avança**, Shift+Enter quebra linha.
  - **Opções:** botões em pílula. Se a pergunta aceita várias respostas (`multi`), os botões **ligam/desligam** com ✓, aparece "Você pode marcar mais de uma opção" e o botão **Continuar**; senão o clique **avança direto**. Nas geradas por IA existe **"Outra resposta"**, que abre um campo de texto **sem apagar** as opções marcadas; a resposta final é `"opção A, opção B, texto livre"`. **Voltar** restaura seleção e texto.
  - **Perguntas da IA:** gerar uma por vez em JSON `{pergunta, opcoes[], multipla, dica, fim}` (prompt no Anexo B). Enquanto gera: esqueleto animado "Montando a próxima pergunta para o seu caso…". Após **6 s** aparece "Está demorando? Usar pergunta padrão". Timeout de **30 s**. Em qualquer falha, **cai nas perguntas fixas do módulo** (pool) sem quebrar o fluxo. A IA decide `fim:true` só após o mínimo.
  - **Multi por padrão** nas perguntas da IA, exceto quando `multipla:false` (sim/não, prazo, faixa de valor). Pedir à IA opções **simples e independentes** ("Google Ads", "Meta (Instagram e Facebook)", "TikTok", e nunca "Google e Meta").
  - Perguntas fixas que aceitam várias respostas: objetivo dos anúncios, plataformas onde anunciar, redes onde atuar, o que quer alcançar nas redes (ver Anexo A, 4º item `1`).
- Ao enviar: grava o lead (seção 6), dispara webhook opcional (`LEAD_WEBHOOK`, POST JSON `text/plain`) e mostra a tela de agradecimento.

### 5.2 Minha área: estrutura
- **Entrada por PIN** (padrão `1234`, constante no topo; trocar). Aviso: o PIN **não é segurança real** na Fase 1.
- **Barra lateral:** logo VYRA + "PAINEL"; itens **Leads, Acompanhamento, Base da IA, IAs (Groq e reserva), Ver site público, ◐ Tema**; interruptor **Orçamento automático**; resumo das IAs (IA 1, IA 2, Reserva); bloco do **backup no HD**; ferramentas (Exportar CSV, Baixar backup, Importar backup).
- **Leads:** cartões de estatística (novos, prontos para revisar, aprovados, em execução), filtro por status, lista à esquerda, detalhe à direita.
- **Status:** `novo` → `pronto` → `aprovado` → `aplicado` (**rótulo exibido: "em execução"**). A chave `aplicado` permanece por compatibilidade.

### 5.3 Detalhe do lead: abas
Cabeçalho: nome, status, serviços (ícones), WhatsApp, botões **Enviar orçamento no WhatsApp**, **Aprovar** (e, depois, **Iniciar acompanhamento** / **Abrir acompanhamento**). Linha de status ao vivo ("Gerando… 12 s · 3.400 caracteres"). Área de leitura com **altura fixa, rolagem própria, letra grande**, que **acompanha o texto enquanto a IA escreve** (só rola sozinha se o leitor está perto do fim) e botão **Ler em tela cheia** (Esc fecha).

1. **Briefing:** pergunta e resposta, como o cliente respondeu.
2. **Resumo:** o que a IA entendeu (8 linhas: Negócio, O que vende, Público e região, Objetivo, Investimento, Prazo, Situação atual, Observações). **Editável**; ao editar vira a **"fonte da verdade"** injetada em todos os pedidos seguintes. Botão "Refazer orçamentos e plano com este resumo".
3. **Estratégia** (antes "Plano"): proposta por serviço (prompt `task` de cada módulo). Para site, mostra prévia em `iframe sandbox` + baixar. Editar, copiar.
4. **Execução:** o que o Gabriel **vai usar** (seção 5.4).
5. **Orçamentos:** 3 cartões lado a lado (Básico, **Médio · recomendado**, Max). Formato interno com marcadores `---BASICO---`, `---MEDIO---`, `---MAX---`, `---MENSAGEM---`.
6. **Mensagem:** texto do WhatsApp editável; botões **Enviar no WhatsApp** (abre a janela de revisão, seção 5.8), copiar, gerar de novo.

**Corrigir a IA** (caixa embaixo de Resumo, Estratégia, Execução, Orçamentos, Mensagem): o Gabriel escreve o que ela errou; a IA refaz recebendo a **resposta anterior errada + a correção obrigatória**. **Toda correção é salva sozinha** em "Correções aprendidas" (Base da IA) com a aba de origem e, por padrão, **só para aquele cliente** (`@NomeDoCliente`); a caixa **"Vale para todos os próximos clientes"** salva como regra geral. Na Execução há um seletor (Google Ads, Redes sociais, Site).
**Alerta de fuga:** se a resposta quase não contém palavras do negócio do cliente (extraídas das 2 primeiras respostas), mostrar aviso vermelho.

### 5.4 Execução (kit de trabalho)
Seções conforme os serviços contratados; cada uma com "Gerar / Gerar de novo", e "Gerar tudo da execução".
- **Google Ads (JSON, IA 1):** campanhas (nome, tipo, objetivo, orçamento diário, lances, local, horários, observações) → grupos de anúncios → palavras-chave com correspondência (exata/frase/ampla, exibidas como `[exata]`, `"frase"`, ampla) → anúncio responsivo (15 títulos ≤30 caracteres, 4 descrições ≤90, URL final, caminhos ≤15) → palavras negativas → extensões (sitelinks, frases de destaque, snippets, chamada) → públicos → rastreamento/conversões → checklist de lançamento → otimização das 4 primeiras semanas. **Contador de caracteres** com destaque vermelho acima do limite. Botões: **Copiar** palavras-chave/títulos/descrições/negativas/tudo e **Baixar planilha para o Google Ads Editor** (CSV UTF-8 com BOM; colunas: `Campaign, Campaign Type, Campaign Status, Budget, Budget type, Bid Strategy Type, Ad Group, Ad Group Status, Keyword, Criterion Type, Ad type, Final URL, Path 1, Path 2, Headline 1..15, Description 1..4, Status`; tudo **Paused**; títulos/descrições cortados nos limites; orçamento convertido de "R$ 33,00" para `33.00`). **Ainda não foi validado importando num Editor real**: o Editor pode pedir mapeamento de colunas.
- **Redes sociais (JSON, IA 1):** rede principal, pilares, **calendário de 14 dias** (formato, tema, gancho, legenda, CTA, hashtags), 3 roteiros (cenas visual/fala), ideias, melhores horários, métricas, checklist de produção. Copiar e baixar calendário em CSV.
- **Site:** (a) **prompt pronto** para colar em Lovable, v0, Bolt, Framer, ChatGPT ou Claude, montado **sem IA** a partir do briefing/resumo (função no Anexo D); (b) botão **"Gerar site pronto (HTML)"** (um arquivo, CSS/JS inline) com prévia e download. Para "Refazer site", incluir o endereço atual e instruir a manter o que o cliente pediu.
- Resposta fora do formato JSON: guardar o texto bruto, avisar e oferecer "Gerar de novo" ou "Corrigir a IA".

### 5.5 Acompanhamento
- **Entrada:** botão "Iniciar acompanhamento" no lead aprovado cria `track` e muda o status para `aplicado`.
- **Lista:** cartões por cliente (serviços, barra de progresso, próxima tarefa ou "atrasada", pacote e valor) + estatísticas (clientes em execução, tarefas pendentes, prazos em 7 dias).
- **Cliente:** abas **Visão geral, [Google Ads], [Redes sociais], [Site], Tarefas, Diário, Relatórios** (canais só se contratados).
  - **Visão geral:** KPIs (concluído %, pendentes, próxima tarefa, início), barra de progresso, **Contrato** (pacote, valor, dia da cobrança, pagamento em dia/pendente/atrasado, início), texto explicando as conexões.
  - **Tarefas:** geradas na criação por canal, com prazos relativos ao início (ex.: Ads: pedir acesso D+1, conversões D+2, importar planilha D+3, ligar D+4, revisar termos D+11, 1ª otimização D+18, relatório D+32), mais itens do checklist da Execução. Marcar concluída, prazo vencido em vermelho, adicionar/apagar.
  - **Google Ads:** situação; ID da conta; início; bloco **"Acesso à conta do cliente"** (convite ao seu e-mail **ou** vínculo ao seu gerente MCC; seu e-mail/ID; situação do acesso) + botão **Copiar mensagem pedindo acesso** (texto passo a passo, **nunca pedir senha**); KPIs (impressões, cliques, custo, conversões, CTR, CPC médio, custo por conversão); gráficos de barras (SVG) de cliques e conversões por dia; lançar números à mão; **Importar relatório CSV do Google Ads** (detectar linha de cabeçalho com colunas de cliques e custo, separador `, ; tab`, números pt-BR `1.234,56`, ignorar linha Total, agregar por dia, mesclar por data).
  - **Redes sociais:** situação; acesso aos perfis (+ mensagem de pedido de acesso via Meta Business Suite/parceiros, sem senha); perfis (rede + @/link com botão Abrir); KPIs (seguidores, variação, posts, alcance, interações); gráficos; lançar números; **calendário de postagens** do kit com caixas "publicado".
  - **Site:** situação; endereço; publicado em; GA4 (G-XXXX); acesso ao domínio/hospedagem (+ mensagem); botão **Medir velocidade e SEO (PageSpeed Insights)**: `GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&category=accessibility&category=seo&category=best-practices&url=...` e mostra 4 medidores (verde ≥90, amarelo ≥50, vermelho abaixo); visitas e contatos com taxa de conversão e gráficos.
  - **Diário:** anotações datadas.
  - **Relatórios:** "Gerar relatório da semana com IA" (Anexo B) usando números, tarefas concluídas nos últimos 7 dias, próximos passos e diário; resultado = mensagem de WhatsApp (≤1200 caracteres) + `---INTERNO---` com notas para o consultor; editar, copiar, **Enviar no WhatsApp**, apagar.
- **Limite honesto:** ligação **automática** com Google Ads/Meta (OAuth do cliente) **não existe** na Fase 1; exige servidor, developer token, app Meta e autorização do cliente. Hoje entra por **importação de CSV e lançamento manual**. O acesso do Gabriel é **à conta do próprio cliente**.

### 5.6 Base da IA (memória do consultor)
Tela com 5 campos, todos injetados nos pedidos (limitar tamanho):
1. **Quem é você e como é o seu negócio** (≤1200 caracteres enviados).
2. **Regras de ouro** (≤1200).
3. **Exemplos de mensagens e orçamentos** (≤3200 enviados): blocos iniciados por `### Ramo: palavra, palavra, ...`. A função `pickEx` (Anexo B) escolhe **o exemplo do ramo do cliente** (pontuação por palavras-chave do cabeçalho no texto das respostas + resumo + nomes dos serviços; bônus para "refazer site" e "influenciador" conforme o serviço) **mais o bloco `### Ramo: geral`**. Valores nos exemplos aparecem como `R$ [valor]` **de propósito**, para a IA não copiar preços.
4. **Tabela de preços** (única fonte de valores).
5. **Correções aprendidas:** uma por linha no formato `[aba]` ou `[aba @Cliente]` onde aba ∈ `ficha|plano|exec|orc|msg|geral`; sem `@` = regra geral. Editável e apagável; guarda até 100.
`kb(kinds, lead)` monta o bloco (Anexo B). Correções com `@Cliente` só entram para aquele cliente.

### 5.7 IAs
- **Dois "slots" + reserva:** **IA 1 (Criação)** = estratégia, kits de execução e site; **IA 2 (Atendimento)** = perguntas ao vivo, resumo, orçamentos, mensagem, relatórios; **Reserva** = modelo do Ollama usado se a principal falhar (padrão `qwen3.5:4b`, pode ficar vazio = desligada).
- **Provedores:** `ollama` (`/api/chat`, NDJSON), `openai` (compatível: Groq, OpenAI, OpenRouter, Cerebras, Gemini; `/chat/completions`, SSE) e `anthropic` (`/v1/messages`, SSE, cabeçalho `anthropic-dangerous-direct-browser-access`).
- **Padrão atual:** ambas no **Groq** (`https://api.groq.com/openai/v1`): IA 1 `openai/gpt-oss-120b`, IA 2 `openai/gpt-oss-20b`. (Os `llama-3.x` do Groq passaram a ser só Enterprise e retornam 404.)
- **Detalhes obrigatórios da função `ask`:** `think:false` e `keep_alive` no Ollama (`60m`; a IA 1 `10m`) e `num_predict`; modelos `gpt-oss` recebem `reasoning_effort:"low"` e **`max_tokens` ×2,5 + 600** (o raciocínio consome tokens); `temperature` por tarefa (resumo 0,1; orçamento 0,2; perguntas 0,4; estratégia 0,6; social 0,7); modo JSON (`format:'json'` no Ollama, `response_format` no openai) e, **em HTTP 400, repetir sem `reasoning_effort`/`response_format`**; erros amigáveis (429 = limite grátis acabou; 401/403 = chave recusada; 404 de modelo = "modelo não existe ou sem acesso, use Ver modelos disponíveis"); cancelamento por `AbortController`; processar fluxo por linhas (`data: {...}` / NDJSON) e entregar texto acumulado a cada ~150 ms.
- **`askF` (fallback):** se a IA do slot falhar, tentar a **outra IA** e depois a **reserva**; só então mostrar o erro original.
- **Execução em paralelo × sequência:** se as duas IAs forem o **mesmo servidor** (`kind`+`url`), rodar uma de cada vez (orçamento primeiro); se forem servidores diferentes, em paralelo.
- **Pré-aquecer** o modelo local da IA 2 na abertura (`POST /api/generate` com `keep_alive`).
- **Tela "IAs":** para cada IA: plataforma, URL, modelo (com lista via `/api/tags` ou `/models`), chave, **Testar**; botão "Usar a Groq nas duas IAs"; campo da reserva + Testar reserva; Salvar.

### 5.8 WhatsApp
Não há envio automático (exige WhatsApp Business API + servidor + modelos aprovados). A integração é **clique-para-conversar**:
- Botão verde **"Enviar orçamento no WhatsApp"** no topo do lead (e na aba Mensagem) abre uma **janela de revisão** com número do cliente (editável), mensagem editável, contador de caracteres, avisos (número com menos de 10 dígitos; texto codificado com mais de ~1800 caracteres: sugerir "Copiar mensagem"), caixa "Marcar como enviado".
- Ações: **Abrir no WhatsApp** (`https://wa.me/<55+DDD+número>?text=...`), **WhatsApp Web** (`https://web.whatsapp.com/send?phone=...&text=...`), **Copiar**, **Fechar** (Esc e clique fora também fecham).
- Normalizar número: só dígitos; se tiver ≤11 dígitos, prefixar `55`.
- Ao abrir, salvar a mensagem editada e registrar `envios[]` (`{em, quando, via}`); mostrar "✓ enviado" na lista e "orçamento enviado em dd/mm hh:mm" no cabeçalho.
- Pedidos de acesso e relatórios também abrem o WhatsApp com texto pronto.

### 5.9 Opcionais já prototipados (desligados por padrão)
- **Aba "Claude Code"** (flag `CLAUDE_CODE=false`): preparar pasta do projeto do cliente (`CLAUDE.md`, `BRIEFING.md`, `TAREFA.md`) e rodar o Claude Code via **ponte local** (`ponte-claude-code.js`, Node, escuta só em `127.0.0.1`, exige chave, permite só Read/Write/Edit/Glob/Grep). Não recomendado em PC fraco (precisa de contexto ≥64k).

---

## 6. Modelo de dados (JSON)

```jsonc
// localStorage "leads2": array, mais novo primeiro
Lead = {
  id: "base36-timestamp", mod: "ads", mods: ["ads","site"],   // mod = primeiro de mods
  nome, whats, email,
  qa: [{ q: "pergunta", a: "resposta (opções unidas por ', ')" }],
  status: "novo|pronto|aprovado|aplicado", data: "dd/mm/aaaa, hh:mm", t: 1700000000000, // t = última atualização
  ficha: "resumo do cliente (texto)", fichaOk: true,
  entrega: "estratégia em markdown (para site, contém bloco ```html)",
  orc: "texto com marcadores ---BASICO--- ---MEDIO--- ---MAX---", msg: "mensagem de WhatsApp",
  xads: { /* JSON do kit Google Ads ou {raw} */ }, xsoc: { /* kit social ou {raw} */ }, xsite: { html, at },
  envios: [{ em: "ISO", quando: "pt-BR", via: "app|web" }],
  track: { start: "AAAA-MM-DD", pacote, valor, cobranca, pgto,
    canais: { ads: { conta, situacao, inicio, tipoacesso, meuacesso, acesso, rows: [{data,imp,cliques,custo,conv}] },
              social: { perfis:[{rede,handle}], situacao, acesso, meuacesso, rows:[{data,rede,seguidores,alcance,interacoes,posts}], postados:{ "1":"AAAA-MM-DD" } },
              site: { url, situacao, publicado, ga4, acesso, psi:[{data,perf,acc,seo,bp}], rows:[{data,visitas,contatos}] } },
    tarefas: [{ id, canal, txt, due, done, at }], diario: [{ id, data, txt }],
    relatorios: [{ id, data, txt, interno }] }
}
// localStorage "cfg2"
CFG = { brand, precos, pin, whats, t,
  ia1: {kind,url,model,key}, ia2: {kind,url,model,key}, reserva: {model},
  kb: { sobre, regras, exemplos, licoes: [{ k:"orc|msg|plano|ficha|exec|geral", txt, cli?: "NomeDoCliente" }] },
  seeded* /* flags de sementes aplicadas uma vez */ }
```

IDs são `Date.now().toString(36)`; ordenar leads por `parseInt(id,36)` decrescente. Toda gravação de lead atualiza `t`.

---

## 7. Regras de negócio e qualidade das respostas da IA

- **Preços:** só da tabela (`CFG.precos`); fora dela escrever "a confirmar"; conferir somas; o Básico deve caber na verba que o cliente informou quando possível; o Médio é o recomendado; o Max é o completo. Combo: cada pacote combina todos os serviços; **só aplicar desconto de combo se estiver na tabela**.
- **Mensagem de WhatsApp personalizada ao ramo:** identificar o ramo, usar vocabulário e dores típicas (horário de pico no delivery, confiança na saúde, agenda vazia no salão), citar o nome do negócio e 1–2 detalhes **reais** do briefing, mostrar os 3 pacotes com total, indicar o Médio e terminar com uma pergunta. **Nunca genérica.** Sem markdown, ≤1200 caracteres, ≤2 emojis. Apresentar-se como **"Gabriel, da VYRA"**.
- **Fidelidade ao briefing:** todos os pedidos mandam usar só informações do briefing, "nunca trocar o assunto nem o negócio do cliente" e marcar o que faltar como "a confirmar". O **Resumo confirmado** entra no topo de todo pedido como fonte da verdade.
- **Não prometer resultado.** Respeitar regras de publicidade de saúde/advocacia (citar no exemplo, sem inventar normas).
- **Sem senhas:** o app nunca pede nem guarda senha de cliente; acesso é por convite/vínculo.
- **Ordem da geração automática e tolerância a falhas:** erro de IA não pode travar a fila; cada lead é tentado uma vez por sessão.

---

## 8. Lições aprendidas (armadilhas que já custaram tempo)

1. `elemento.onkeydown = e => e.key==='Enter' && fazer()` **cancela a digitação** (retorna `false`). Use bloco `{ if(...) ... }`.
2. Em `background` com várias camadas, a **cor sólida tem de ser a última**; senão a declaração inteira é inválida.
3. `localStorage` pode estar bloqueado (preview em iframe, privacidade): implementar fallback em memória + aviso. Abrir o arquivo direto no navegador.
4. Não depender de `#hash` para navegar; âncoras de hash reabriam a tela e perdiam estado.
5. **Groq:** `llama-3.3-70b-versatile` e `llama-3.1-8b-instant` deram 404 em chave comum; usar `openai/gpt-oss-120b`/`20b`, com `reasoning_effort` baixo e mais `max_tokens`. Nomes de modelo mudam: sempre oferecer "Ver modelos disponíveis" (`GET /models`).
6. Modelos de raciocínio locais (`deepseek-r1:8b`) são lentos: usar `think:false`, `keep_alive`, modelos pequenos (`qwen3.5:4b/9b`) e limites de tamanho de resposta.
7. Respostas JSON de modelos pequenos falham: extrair `{...}` por regex, remover vírgulas finais, e ter fallback para texto bruto.
8. File System Access API: só Chrome/Edge, exige gesto do usuário e pode pedir reconexão a cada sessão; manter backup/restauração por arquivo.
9. Evitar `innerHTML` com texto de usuário sem escapar (`esc()`); `textarea` dentro de modelos de string precisa de `esc`.
10. Re-renderizar a tela inteira durante o streaming faz o texto "sumir"/pular: atualizar só o painel de leitura e re-renderizar no fim.
11. Não incluir a chave da IA em página pública. Nunca.

---

## 9. Testes de aceitação (rodar e mostrar evidências)

**Método sugerido:** jsdom para lógica (com `fetch` simulado devolvendo NDJSON/SSE) e **Playwright** para prints reais, nos dois temas, em 1360×900 e em celular (390×844). Incluir fontes Sora/DM Sans localmente nos prints se estiver offline.

1. Abrir sem erro de JS; tema escuro por padrão; alternar para claro e persistir.
2. Home: hero, pilares, serviços (4 cartões com ícones de linha), combo (exige ≥2), como funciona, rodapé.
3. Briefing: digitar em todos os campos (regressão do bug do `onkeydown`); Enter avança; Voltar restaura; progresso.
4. Perguntas da IA: JSON válido; opções múltiplas; "Outra resposta" junto das opções; fallback para perguntas fixas se a IA falhar ou passar de 30 s; botão "Usar pergunta padrão" após 6 s.
5. Envio cria lead com `qa` correto e a tela de agradecimento.
6. Painel: PIN errado/certo; lead novo detectado em outra aba em ≤3 s; geração automática na ordem Resumo → Orçamento → Estratégia → Execução.
7. Orçamento: 3 cartões; mensagem separada por `---MENSAGEM---`; valores só da tabela; Médio recomendado.
8. Corrigir a IA: refaz com a resposta anterior + correção; salva em "Correções aprendidas" com `@Cliente`; marcar "regra geral" tira o `@`; outro cliente **não** recebe correção de cliente.
9. Exemplos por ramo: pizzaria → bloco de restaurante + geral; advocacia → bloco de advocacia; "Refazer site" → bloco de redesign.
10. Alerta de fuga aparece quando a estratégia fala de outro assunto.
11. Execução: Ads com contador de caracteres e vermelho acima do limite; CSV com cabeçalho correto, tudo "Paused", títulos cortados em 30; calendário social e CSV; prompt do site com briefing; HTML do site com prévia.
12. IAs: Groq padrão; modelo inexistente mostra mensagem clara; 400 refaz sem parâmetros opcionais; 429 cai na outra IA/reserva; Testar mede o tempo.
13. WhatsApp: botão no lead com mensagem; janela com número/texto; URL `wa.me/55...` correta; número inválido e mensagem vazia bloqueiam; marca "enviado"; Esc fecha.
14. Acompanhamento: criar a partir do lead aprovado; tarefas por canal; importar CSV de Ads (com linha Total e datas ISO); lançar números e ver KPIs/gráficos; PageSpeed (simulado) com 4 medidores; diário; relatório IA com números no prompt; mensagens de acesso (convite e MCC); lista com progresso e atrasos.
15. Backup no HD (com handle simulado): grava `leads.json`, `config.json`, `historico/`, `clientes/*.md|html`; reabrir mescla corretamente; importar JSON mescla por `t`.
16. Armazenamento bloqueado: continua funcionando em memória com aviso.

---

## 10. Entrega esperada
Código organizado e documentado (README curto em PT-BR: como rodar, configurar `.env`, trocar PIN, conectar backup, escolher modelo), testes automatizados (jsdom + Playwright), e um relatório final com prints e a lista de pendências conhecidas.

---

## 11. Estilo de código
- Fase 1: manter o **arquivo único** funcional; se modularizar, manter `index.html` abrindo por duplo clique (sem exigir servidor) ou documentar `npm run dev`.
- Funções pequenas e nomeadas (`ask`, `askF`, `ficha`, `orc`, `msgGen`, `gen`, `execGen`, `trk*`, `wa*`); estado em objetos simples (`A` admin, `P` público, `J` jobs, `T` acompanhamento, `CFG`).
- Sem frameworks na Fase 1. Na Fase 2 pode usar TypeScript e componentes, desde que o visual e o comportamento sejam idênticos.

---

## 12. Plano por fases

- **Fase 0 (obrigatória):** ler tudo, rodar o `estudio-ia.html`, tirar prints de referência, devolver plano + perguntas.
- **Fase 1 (fiel):** recriar o app como está (seções 2 a 9), na ordem: design system e site público → briefing com IA → Minha área e leads → IAs e Base da IA → Execução → Orçamento/Mensagem/WhatsApp → Acompanhamento → Backup → testes e polimento.
- **Fase 2 (opcional, produção):** seção 13.

---

## 13. Fase 2: colocar no ar (propor e confirmar antes de implementar)

**Por que o arquivo atual não vai direto para a internet:** a chave de IA fica visível; leads ficam no navegador de quem preencheu; o PIN é contornável; Ollama e backup em HD só existem no PC dele.

**Arquitetura sugerida (confirmar com o Gabriel):**
- **Site público** (estático, rápido, SEO): página, briefing e agradecimento. **Sem** painel, sem chave, sem link "Minha área". Perguntas da IA via **API própria** (proxy) com limite de uso; se a API falhar, cai nas perguntas fixas.
- **API** pequena: recebe leads (validação, rate limit, captcha como Cloudflare Turnstile), proxy de IA (chaves só no servidor), autenticação real do painel (login com senha forte/2FA ou link mágico), armazenamento (SQLite/Postgres/Supabase/D1).
- **Painel** em endereço separado e protegido (autenticação), com o mesmo visual. Pode continuar rodando **local** puxando os leads da API, para manter chaves em casa.
- **Hospedagem:** (A) serviços gerenciados com plano grátis (Cloudflare Pages/Workers/D1, Netlify ou Vercel + Supabase); (B) servidor próprio (Docker Compose + túnel) se o Gabriel já tiver um. Priorizar pouca manutenção.
- **Domínio:** registrar `.com.br` (conferir disponibilidade e marca no INPI); HTTPS automático.
- **LGPD:** política de privacidade, consentimento explícito antes de coletar nome/WhatsApp, aviso de uso de IA de terceiros, canal para apagar dados, retenção definida.
- **SEO/Marketing:** `title`, `meta description`, Open Graph, `sitemap.xml`, `robots.txt`, dados estruturados básicos, Google Analytics 4 e Search Console; a landing deve ter conteúdo útil renderizado em HTML (não só por JavaScript).
- **Integrações futuras:** WhatsApp Business API oficial (envio automático, com modelos aprovados), Google Ads API e Meta Graph API com OAuth do cliente (exige servidor, developer token e revisão de apps).

**Decisões em aberto (perguntar ao Gabriel):** hospedagem (A ou B); banco de dados; login do painel; manter perguntas da IA no site público ou só fixas; nome/CNPJ para política de privacidade e notas; domínio escolhido; e quais limites de uso aceitar no plano grátis da Groq.

**Pendências conhecidas e não validadas:** importação real da planilha no Google Ads Editor; CORS do PageSpeed a partir de `file://`/domínio próprio; caminhos de menu do Google Ads e da Meta usados nas mensagens de pedido de acesso (conferir numa conta real); qualidade das respostas dos modelos pequenos em português.

---

# ANEXOS (extraídos do app funcional; usar como especificação)

## Anexo A. Serviços, perguntas e tarefas (módulos)
O 4º item `1` em uma pergunta de opções significa **aceita várias respostas**. `qs` = perguntas do módulo; `COMUM` é adicionada ao fim de cada módulo.

```js
const MODS={
ads:{c:'#5B6CFF',ic:'📈',name:'Tráfego pago (Google Ads)',desc:'Plano de campanhas pronto: palavras-chave, anúncios, públicos e verba.',
 sys:'Você é um gestor de tráfego sênior de Google Ads no Brasil, focado em ROI. Responda em português do Brasil, em Markdown, com números e ações concretas.',
 qs:[['negocio','Qual é o seu negócio?','Ex: clínica de estética, loja de tênis, escritório de advocacia'],
 ['oferta','O que você vende e qual o ticket médio?','Produto ou serviço principal e quanto cada venda rende'],
 ['local','Onde estão seus clientes?','Cidade, bairro ou "Brasil todo"'],
 ['obj','O que você quer alcançar com os anúncios?',['Gerar leads/contatos','Vender online','Ligações','Visitas na loja','Cadastros/downloads'],1],
 ['verba','Qual a verba mensal para anúncios?','Ex: R$ 1.500'],
 ['dif','Por que escolher você e não o concorrente?','Diferenciais, prova social, garantias'],
 ['hist','Já anunciou antes? O que funcionou ou não?','Se nunca anunciou, escreva "nunca"'],
 ['plat','Em quais plataformas você quer anunciar?',['Google Ads','Meta (Instagram/Facebook)','TikTok','YouTube','Ainda não sei'],1],
 ['lp','Você já tem site ou página de vendas que converte?',['Sim, tenho','Tenho, mas é fraco','Não tenho']],
 ['trk','Já tem Google Analytics, pixel ou conversões configuradas?',['Sim','Não sei','Não']]],
 task:'Monte um plano completo de Google Ads: 1) Diagnóstico e estratégia de campanhas (Pesquisa, Performance Max, Remarketing) com divisão da verba. 2) Grupos de anúncios com 15 palavras-chave cada, correspondência sugerida e palavras negativas. 3) 3 anúncios responsivos completos (15 títulos até 30 caracteres, 4 descrições até 90). 4) Extensões recomendadas. 5) Públicos e segmentações. 6) Metas realistas de CPC/CPL/ROAS. 7) Plano de otimização das primeiras 4 semanas.'},
social:{c:'#7B3DFF',ic:'🎬',name:'Conteúdo para redes sociais',desc:'Ideias de posts, roteiros e análise do que o seu público mais assiste.',
 sys:'Você é estrategista de conteúdo para criadores e influenciadores no Brasil, especialista em retenção e engajamento. Responda em português do Brasil, em Markdown, com exemplos prontos para usar.',
 qs:[['nome','Qual o perfil ou nicho?','Ex: fitness para mulheres 40+, humor automotivo'],
 ['rede','Em quais redes você quer atuar?',['Instagram','TikTok','YouTube','Kwai','LinkedIn'],1],
 ['seg','Tamanho da audiência hoje','Seguidores e média de views por post'],
 ['pub','Quem é o seu público?','Idade, gênero, cidade, interesses. Se não sabe, descreva quem comenta e curte'],
 ['obj','O que quer alcançar?',['Mais engajamento','Mais seguidores','Vender/parcerias','Autoridade no nicho'],1],
 ['bom','Quais conteúdos já deram mais resultado?','Temas ou formatos que performaram'],
 ['tom','Qual o tom da comunicação?','Ex: divertido, direto, educativo'],
 ['freq','Quantos posts por semana você quer?',['2 a 3','4 a 5','Todo dia']],
 ['prod','Quem grava e edita os vídeos hoje?',['Eu mesmo','Tenho editor','Preciso de ajuda com tudo']],
 ['ent','O que você quer que eu entregue?',['Só ideias e roteiros','Roteiros + edição','Gestão completa do perfil']]],
 task:'Entregue: 1) Perfil do público-alvo e o que ele mais consome hoje (formatos, temas, horários, creators que ele segue). 2) 15 ideias de posts com formato, gancho dos 3 primeiros segundos e CTA. 3) 3 roteiros completos (gancho, desenvolvimento, fechamento, cenas e legenda). 4) Calendário de 2 semanas. 5) Dicas de edição e retenção para a rede escolhida. 6) Métricas para acompanhar.'},
site:{c:'#00C6FF',ic:'🌐',name:'Site novo',desc:'Site completo, bonito e responsivo, feito sob medida para o seu negócio.',
 sys:'Você é designer e desenvolvedor front-end de elite. Cria sites com identidade visual própria, nunca genéricos. Escreva textos reais em português do Brasil, sem lorem ipsum.',
 qs:[['nome','Nome do negócio ou pessoa','Como aparece no topo do site'],
 ['tipo','Que tipo de site?',['Landing page de vendas','Site institucional','Portfólio','Loja/catálogo','Link na bio']],
 ['oferta','O que você oferece e para quem?','Serviços/produtos e cliente ideal'],
 ['estilo','Qual o estilo visual?',['Moderno e minimalista','Ousado e colorido','Elegante e luxuoso','Tech/futurista','Aconchegante e humano']],
 ['cores','Cores ou referências de marca','Ex: azul e laranja, ou "como o site da Nubank"'],
 ['secoes','Seções desejadas','Ex: depoimentos, preços, FAQ, galeria, mapa'],
 ['cta','Qual a ação principal do visitante?','Ex: chamar no WhatsApp (número), preencher formulário'],
 ['pag','Quantas páginas ou seções, mais ou menos?','Ex: 1 página, 5 páginas, 10 ou mais'],
 ['dom','Já tem domínio e hospedagem?',['Tenho os dois','Só domínio','Não tenho nada']],
 ['cont','Os textos e imagens já estão prontos?',['Sim, tudo pronto','Tenho parte','Preciso que criem']],
 ['int','Precisa de alguma integração?','WhatsApp, formulário, pagamento, agendamento, blog... ou "nenhuma"']],
 task:'Crie o site completo em UM único arquivo HTML (HTML+CSS+JS inline, responsivo, acessível, Google Fonts permitido). Design marcante e específico para este negócio, hero forte, seções completas com textos reais, botão de WhatsApp/CTA funcional, animação discreta. Responda com uma frase curta e depois TODO o código dentro de um único bloco ```html.'}
,resite:{c:'#A78BFF',ic:'🔄',name:'Refazer meu site',desc:'Site atual fraco ou desatualizado? Eu refaço com design novo e mantenho o que funciona.',
 sys:'Você é designer e desenvolvedor front-end de elite, especialista em redesenhar sites existentes: diagnostica o que está errado, mantém a identidade que funciona e entrega algo muito melhor. Escreva textos reais em português do Brasil, sem lorem ipsum.',
 qs:[['nome','Nome do negócio ou pessoa','Como aparece no topo do site'],
 ['url','Qual o endereço do site atual?','Ex: www.meusite.com.br. Se não tiver, escreva "sem site"'],
 ['prob','O que não funciona hoje no seu site?','Ex: é lento, está feio, não funciona bem no celular, ninguém entra em contato'],
 ['manter','O que você quer manter do site atual?','Logo, cores, textos, fotos, seções, o endereço...'],
 ['plat','Em que o site atual foi feito?',['WordPress','Wix','Loja virtual (Shopify, Nuvemshop...)','Código próprio','Não sei']],
 ['estilo','Qual o novo estilo visual?',['Moderno e minimalista','Ousado e colorido','Elegante e luxuoso','Tech/futurista','Aconchegante e humano']],
 ['cores','Cores ou referências para o novo visual','Ex: manter o azul da marca, ou "como o site da Nubank"'],
 ['secoes','Seções que o novo site precisa ter','Ex: depoimentos, preços, FAQ, galeria, mapa'],
 ['cta','Qual a ação principal que o visitante deve fazer?','Ex: chamar no WhatsApp (número), preencher formulário'],
 ['int','Precisa de alguma integração?','WhatsApp, formulário, pagamento, agendamento, blog... ou "nenhuma"']],
 task:'Refaça o site do cliente. 1) Comece com um diagnóstico curto: 5 problemas prováveis do site atual (com base no que o cliente contou) e como o novo site resolve cada um. 2) Crie o novo site completo em UM único arquivo HTML (HTML+CSS+JS inline, responsivo, acessível, Google Fonts permitido), mantendo o que o cliente pediu para manter, com design marcante e específico para este negócio, hero forte, seções completas com textos reais, botão de WhatsApp/CTA funcional e animação discreta. Depois do diagnóstico, entregue TODO o código dentro de um único bloco ```html.'}
};
const COMUM=[['prazo','Para quando você precisa?',['O quanto antes','Em até 2 semanas','Em até 1 mês','Sem pressa']],
 ['inv','Quanto pretende investir no serviço?','Pode ser uma faixa, ex: R$ 1.000 a 2.000. Ajuda a montar a melhor proposta'],
 ['pgto','Como prefere contratar?',['Pagamento único','Mensal recorrente','Quero ver as opções']]];
```

O campo `ic` (emoji) dos módulos é **legado**: a interface usa os **ícones de linha** abaixo (`ICON`), um por serviço.

```js
const ICON={ads:'<svg viewBox="0 0 24 24"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>',
 social:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4z"/></svg>',
 site:'<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
 resite:'<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5"/></svg>'};
```

## Anexo B. Prompts e lógica de IA (código de referência)

### B1. Perguntas geradas pela IA
```js
function parseQ(t){const m=clean(t).match(/\{[\s\S]*\}/);if(!m)return null;try{const o=JSON.parse(m[0]);return(o.pergunta||o.fim)?o:null}catch(e){return null}}
async function aiQ(){
  const n=cnt('ai'),names=P.mods.map(k=>MODS[k].name).join(' + '),topics=P.mods.flatMap(k=>MODS[k].qs.slice(0,-COMUM.length)).map(x=>x[1]).join('; ');
  const hist=P.qa.map(x=>`P: ${x.q}\nR: ${x.a}`).join('\n');
  const msgs=[{role:'system',content:'Você é um consultor sênior de marketing entrevistando um possível cliente, em português do Brasil, com linguagem simples e simpática. Faça UMA pergunta curta por vez, sempre específica para o negócio dele (use o que ele já contou). Nunca repita algo já respondido. Responda SOMENTE com JSON válido.'},
   {role:'user',content:`Serviço(s): ${names}\nTemas que ajudam a montar o plano e o orçamento: ${topics}\n\nConversa até agora:\n${hist}\n\nPerguntas geradas até aqui: ${n} (mínimo ${MINAI}, máximo ${maxAI()}).${P.mods.length>1?' O cliente quer mais de um serviço: distribua as perguntas entre todos eles.':''}\nGere a PRÓXIMA melhor pergunta. Se fizer sentido ser de escolha, dê de 3 a 6 opções curtas, simples e independentes em "opcoes" (nunca junte duas coisas numa opção: use "Google Ads", "Meta (Instagram e Facebook)", "TikTok" em vez de "Google e Meta"). Use "multipla": true quando o cliente puder marcar mais de uma (plataformas, objetivos, canais, serviços) e "multipla": false quando só uma resposta fizer sentido (sim ou não, prazo, faixa de valor). Se não for de escolha, deixe "opcoes" vazio e escreva em "dica" um exemplo curto. Use "fim": true só se já tiver o suficiente e já tiver feito pelo menos ${MINAI}. Formato: {"pergunta":"...","opcoes":[],"multipla":true,"dica":"...","fim":false}`}];
  P.ctl=new AbortController();const to=setTimeout(()=>P.ctl.abort(),30000);
  try{return parseQ(await ask(msgs,()=>{},{slot:'ia2',json:true,max:220,temp:0.4,signal:P.ctl.signal}))}catch(e){return null}finally{clearTimeout(to)}
}
```

### B2. Resumo do cliente (ficha)
```js
async function ficha(id,corr){
  const l=getL().find(x=>x.id===id);if(!l)return;
  const msgs=[{role:'system',content:'Você resume briefings de clientes com fidelidade total, em português do Brasil. Use SÓ o que o cliente disse. Não invente nem interprete além do texto.'+(kb('ficha',l)?'\n\n'+kb('ficha',l):'')},
   {role:'user',content:`Serviço(s): ${svcName(l)}\nCliente: ${l.nome}\n\nRespostas do cliente:\n${qaOf(l).map(x=>`- ${x.q} ${x.a}`).join('\n')}\n\nResuma em no máximo 8 linhas curtas, texto simples, neste formato exato:\nNegócio: ...\nO que vende/oferece: ...\nPúblico e região: ...\nObjetivo com o serviço: ...\nInvestimento disponível: ...\nPrazo: ...\nSituação atual: ...\nObservações importantes: ...\nSe algo não foi informado, escreva "não informado".${corr&&l.ficha?`\n\nRESUMO ANTERIOR (tinha erro):\n${l.ficha}\n\nCORREÇÃO DO CONSULTOR (obrigatória, siga à risca): ${corr}\nRefaça o resumo corrigindo isso.`:''}`}];
  Object.assign(J.orc,{on:true,id,live:'',t0:Date.now(),what:'ficha'});A.err='';A.sel=id;paintList();paintDet();
  try{const out=await askF(msgs,t=>live('orc',clean(t)),{slot:'ia2',max:500,temp:0.1});upd(id,{ficha:out})}catch(e){A.err=e.message}
  J.orc.on=false;paintList();paintDet();
}
```

### B3. Orçamentos e mensagem
```js
async function orc(id,corr){
  const l=getL().find(x=>x.id===id);if(!l)return;
  const first=l.nome.split(' ')[0],nm=svcName(l);
  const msgs=[{role:'system',content:'Você é o Gabriel Efraime, da VYRA Marketing Digital (Rio de Janeiro), e monta orçamentos claros e honestos em português do Brasil. Use SOMENTE os valores da tabela de preços fornecida. Se algo não estiver na tabela, escreva "a confirmar" em vez de inventar um valor. Confira as somas. Use SOMENTE as informações do briefing; nunca troque o assunto nem o negócio do cliente.'+(kb(['orc','msg'],l)?'\n\n'+kb(['orc','msg'],l):'')},
  {role:'user',content:`TABELA DE PREÇOS:\n${CFG.precos}\n\nBRIEFING DO CLIENTE:\n${brief(l).split('\n\nTarefa:')[0]}\nSERVIÇOS ESCOLHIDOS: ${nm}\n\nMonte 3 PACOTES usando só a tabela de preços:\n- BASICO: o essencial para começar, menor investimento (se o cliente disse quanto quer investir, procure caber nisso).\n- MEDIO: o mais indicado para este cliente, melhor custo-benefício (será o recomendado).\n- MAX: o completo, para o máximo de resultado.\n${svcs(l).length>1?'Como são vários serviços, cada pacote deve combinar todos eles em níveis diferentes e somar tudo. Só aplique desconto de combo se ele estiver na tabela de preços.\n':''}Para cada pacote: o que está incluso, valor de cada item, total (único e/ou mensal), prazo e condições de pagamento. Adapte o que está incluso ao ramo e ao objetivo do cliente. Seja curto e direto, em Markdown.\n\nUse EXATAMENTE este formato, com as linhas de marcação sozinhas:\n---BASICO---\n(pacote)\n---MEDIO---\n(pacote)\n---MAX---\n(pacote)\n---MENSAGEM---\n(mensagem de WhatsApp pronta para ${first}, PERSONALIZADA para o ramo do cliente: identifique o ramo e use o vocabulário e as dores típicas dele (ex.: horário de pico no delivery, confiança na saúde, agenda vazia no salão), cite o nome do negócio e 1 ou 2 detalhes reais do briefing, apresente os 3 pacotes com o valor total de cada um, indique o Médio como recomendado e termine com uma pergunta para fechar. Nunca escreva uma mensagem genérica que serviria para qualquer empresa. Sem markdown, no máximo 2 emojis, até 1200 caracteres.)`+(corr&&l.orc?`\n\nRESPOSTA ANTERIOR (tinha erro):\n${l.orc}\n\n${l.msg||''}\n\nCORREÇÃO DO CONSULTOR (obrigatória, siga à risca): ${corr}\nRefaça tudo corrigindo isso.`:'')}];
  Object.assign(J.orc,{on:true,id,live:'',t0:Date.now(),what:'orc'});A.err='';A.sel=id;paintList();paintDet();
  try{
    const out=await askF(msgs,t=>live('orc',clean(t)),{slot:'ia2',max:1600,temp:0.2});
    const i=out.indexOf('---MENSAGEM---'),body=i<0?out:out.slice(0,i).trim(),msg=i<0?'':out.slice(i+14).trim();
    upd(id,{orc:body,msg:msg||`Oi ${first}, tudo bem? Aqui é o Gabriel. Preparei opções de ${nm.toLowerCase()} para você. Posso te enviar os detalhes?`,...(getL().find(x=>x.id===id).status==='novo'?{status:'pronto'}:{})});
  }catch(e){A.err=e.message}
  J.orc.on=false;paintList();paintDet();
}
// gera sozinho: orçamento (IA 2) e plano (IA 1). Se as duas IAs forem iguais, uma de cada vez; se forem diferentes, ao mesmo tempo.
```

### B4. Reescrever a mensagem (correção)
```js
async function msgGen(id,corr){
  const l=getL().find(x=>x.id===id);if(!l)return;
  const first=l.nome.split(' ')[0];
  const msgs=[{role:'system',content:'Você é o Gabriel Efraime, da VYRA Marketing Digital (Rio de Janeiro), e escreve mensagens de WhatsApp simpáticas e claras em português do Brasil. Use só os valores e fatos informados.'+(kb('msg',l)?'\n\n'+kb('msg',l):'')},
   {role:'user',content:`CLIENTE: ${l.nome}\nRESUMO DO CLIENTE:\n${l.ficha||qaOf(l).map(x=>`- ${x.q} ${x.a}`).join('\n')}\n\nORÇAMENTOS:\n${(l.orc||'(ainda não gerados)').replace(/---(BASICO|MEDIO|MAX)---/g,(x,k)=>'\n## '+LBL[k])}\n\nMENSAGEM ATUAL (tinha erro):\n${l.msg||''}\n\nCORREÇÃO DO CONSULTOR (obrigatória, siga à risca): ${corr}\nEscreva a mensagem de WhatsApp para ${first} corrigindo isso, mantendo a mensagem personalizada para o ramo e o negócio dele. Sem markdown, no máximo 2 emojis, até 1200 caracteres. Responda só com a mensagem.`}];
  Object.assign(J.orc,{on:true,id,live:'',t0:Date.now(),what:'msg'});A.err='';A.sel=id;paintList();paintDet();
  try{const out=await askF(msgs,t=>live('orc',clean(t)),{slot:'ia2',max:700,temp:0.3});upd(id,{msg:out})}catch(e){A.err=e.message}
  J.orc.on=false;paintList();paintDet();
}
```

### B5. Estratégia
```js
async function gen(id,extra){
  const l=getL().find(x=>x.id===id);if(!l)return;
  const msgs=[{role:'system',content:svcs(l).map(k=>MODS[k].sys).join(' ')+' Use SOMENTE informações do briefing; nunca troque o assunto nem o negócio do cliente; se faltar algo, escreva "a confirmar".'+(kb('plano',l)?'\n\n'+kb('plano',l):'')},{role:'user',content:brief(l)+'\n\nIMPORTANTE: o trabalho é para o negócio e o objetivo descritos acima. Use só informações do briefing e não mude de assunto.'}];
  if(extra&&l.entrega)msgs.push({role:'assistant',content:l.entrega},{role:'user',content:'CORREÇÃO DO CONSULTOR (obrigatória, siga à risca; a resposta anterior errou neste ponto): '+extra+'. Refaça corrigindo isso e mantendo o que estava certo.'+(isSite(l)?'. Devolva o HTML completo atualizado em um único bloco ```html.':'')});
  Object.assign(J.plano,{on:true,id,live:'',t0:Date.now()});A.err='';A.edit=false;A.sel=id;paintList();paintDet();
  try{const out=await askF(msgs,t=>live('plano',clean(t)),{slot:'ia1',max:isSite(l)?7000:svcs(l).length>1?4500:3000,temp:0.6});upd(id,{entrega:out,...(l.status==='novo'?{status:'pronto'}:{})})}
  catch(e){A.err=e.message}
  J.plano.on=false;paintList();paintDet();
}
```

### B6. Memória do consultor: escolha do exemplo e montagem do bloco
```js
function pickEx(txt,l){
  const bl=String(txt).split(/^### /m).map(b=>b.trim()).filter(Boolean);
  if(bl.length<2||!l)return String(txt).slice(0,2400);
  const hay=norm(qaOf(l).map(x=>x.a).join(' ')+' '+(l.ficha||'')+' '+svcName(l));
  const ps=bl.map(b=>{const i=b.indexOf('\n'),h=b.slice(0,i),body=b.slice(i+1);return {h:h.replace(/^ramo:\s*/i,''),body,geral:/geral/i.test(h),sc:h.replace(/^ramo:\s*/i,'').split(',').map(x=>norm(x.trim())).filter(Boolean).filter(k=>hay.includes(k)).length+(svcs(l).includes('resite')&&/refazer/i.test(h)?3:0)+(svcs(l).includes('social')&&/influenciador/i.test(h)?2:0)}});
  const best=ps.filter(x=>!x.geral).sort((a,b)=>b.sc-a.sc)[0],ch=[best&&best.sc>0?best:null,ps.find(x=>x.geral)].filter(Boolean);
  return (ch.length?ch:ps.slice(0,1)).map(x=>'Exemplo (ramo: '+x.h+'):\n'+x.body).join('\n\n').slice(0,3200);
}
function kb(kinds,l){
  const ks=[].concat(kinds),k=CFG.kb||{},L=(k.licoes||[]).filter(x=>(ks.includes(x.k)||x.k==='geral')&&(!x.cli||(l&&norm(l.nome)===norm(x.cli)))).slice(-12).map(x=>'- '+x.txt);
  return [k.sobre&&'SOBRE O CONSULTOR E O NEGÓCIO DELE:\n'+k.sobre.slice(0,1200),
    k.regras&&'REGRAS DE OURO (sempre siga):\n'+k.regras.slice(0,1200),
    (ks.includes('orc')||ks.includes('msg'))&&k.exemplos&&'EXEMPLOS DE COMO O CONSULTOR ESCREVE (imite o estilo e a estrutura; nunca copie valores nem dados dos exemplos):\n'+pickEx(k.exemplos,l),
    L.length&&'CORREÇÕES APRENDIDAS (obrigatórias):\n'+L.join('\n')].filter(Boolean).join('\n\n');
}
// alerta quando a resposta quase não fala do negócio do cliente
function covWarn(l){
  const txt={plano:l.entrega,orc:l.orc,msg:l.msg}[A.tab];if(!txt||txt.length<80)return '';
  const q=qaOf(l).slice(0,2).map(x=>x.a).join(' ');
  const ws=[...new Set(norm(q).match(/[a-z]{5,}/g)||[])].filter(w=>!STOP.has(w)).slice(0,14);
  if(ws.length<3)return '';
  const t=norm(txt),hit=ws.filter(w=>t.includes(w.slice(0,Math.max(4,w.length-2)))).length;
  return hit/ws.length<0.2?`<div class="err" style="margin-top:12px"><b>Atenção:</b> esta resposta quase não fala do negócio do cliente. Confira a aba "Resumo" e use "Corrigir a IA" se ela errou.</div>`:'';
}
```

### B7. Relatório semanal e pedidos de acesso
```js
async function trkRel(id){
  const l=trkL(id),t=l.track,first=l.nome.split(' ')[0];
  const feitas=t.tarefas.filter(x=>x.done&&x.at>=addDays(today(),-7)).map(x=>'- '+x.txt),prox=t.tarefas.filter(x=>!x.done).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,5).map(x=>'- '+x.txt+' (até '+fdate(x.due)+')'),notas=t.diario.slice().sort((a,b)=>b.data.localeCompare(a.data)).slice(0,5).map(x=>'- '+fdate(x.data)+': '+x.txt);
  const msgs=[{role:'system',content:'Você é o Gabriel Efraime, da VYRA Marketing Digital (Rio de Janeiro), e escreve relatórios curtos, claros e honestos para clientes, em português do Brasil, por WhatsApp. Use SOMENTE os números e fatos fornecidos. Nunca invente resultado nem prometa; se faltar dado, diga que ainda está coletando.'+(kb('msg',l)?'\n\n'+kb('msg',l):'')},
   {role:'user',content:`CLIENTE: ${l.nome}\nSERVIÇOS: ${svcName(l)}\nRESUMO DO CLIENTE:\n${l.ficha||qaOf(l).slice(0,4).map(x=>x.a).join(' · ')}\nHOJE: ${fdate(today())} (acompanhamento iniciado em ${fdate(t.start)})\n\nNÚMEROS REGISTRADOS:\n${trkSummary(l)||'(nenhum número lançado ainda)'}\n\nFEITO NOS ÚLTIMOS 7 DIAS:\n${feitas.join('\n')||'(nada marcado)'}\n\nPRÓXIMOS PASSOS PLANEJADOS:\n${prox.join('\n')||'(nenhum)'}\n\nANOTAÇÕES RECENTES:\n${notas.join('\n')}\n\nEscreva: 1) a mensagem de WhatsApp para ${first} com o relatório da semana (até 1200 caracteres, sem markdown, no máximo 2 emojis): o que foi feito, os números em linguagem simples e o que significam, e os próximos passos. 2) Depois uma linha contendo apenas ---INTERNO--- e, em seguida, notas internas curtas para o consultor (riscos e o que ajustar).`}];
  T.busy='rel';T.msg='';T.relLive=0;trkPaint();
  try{
    const out=await askF(msgs,x=>{T.relLive=x.length;const b=document.querySelector('[data-act=rel]');if(b)b.textContent='Gerando… '+x.length+' caracteres'},{slot:'ia2',max:1200,temp:0.3});
    const i=out.indexOf('---INTERNO---');
    trkSet(id,tt=>tt.relatorios.unshift({id:uid(),data:today(),txt:(i<0?out:out.slice(0,i)).trim(),interno:i<0?'':out.slice(i+13).trim()}));
  }catch(e){T.msg=e.message}
  T.busy='';trkPaint();
}
function accMsg(l,canal){
  const c=l.track.canais[canal]||{},n=l.nome.split(' ')[0];
  if(canal==='ads'){
    const mail=c.meuacesso||'[SEU E-MAIL DO GOOGLE]';
    if(c.tipoacesso==='Vinculada ao meu gerente (MCC)')return `Oi, ${n}! Para eu cuidar das suas campanhas no Google Ads, preciso de acesso à sua conta. Você não precisa me passar senha.\n\nO caminho mais simples:\n1) Me envie o ID da sua conta (fica no canto superior da tela, no formato 123-456-7890).\n2) Eu mando um pedido de vínculo pelo meu gerente (${c.meuacesso||'ID do meu gerente'}).\n3) Você entra em ads.google.com > Admin > Acesso e segurança > Gerentes e aceita o pedido.\n\nSe ficar com dúvida, me chama que eu te guio por chamada.`;
    return `Oi, ${n}! Para eu cuidar das suas campanhas no Google Ads, preciso de acesso à sua conta. Você não precisa me passar senha, é só me convidar:\n\n1) Entre em ads.google.com com a sua conta.\n2) Clique em Admin (ou Ferramentas) > Acesso e segurança.\n3) Clique no botão "+" e informe este e-mail: ${mail}\n4) Escolha o nível "Administrador" (ou "Padrão") e envie o convite.\n\nDepois me avise e me mande o ID da conta (fica no canto superior, no formato 123-456-7890). Se ficar com dúvida, me chama que eu te guio por chamada.`}
  if(canal==='social')return `Oi, ${n}! Para eu cuidar das suas redes sociais, preciso de acesso sem você me passar senha.\n\nNo Instagram e no Facebook, o jeito certo é pelo Meta Business Suite: em Configurações, procure Pessoas ou Parceiros e me adicione pelo e-mail ${(c.meuacesso)||'[SEU E-MAIL]'}, com permissão para gerenciar conteúdo (e anúncios, se formos anunciar). Nas outras redes (TikTok, YouTube, Kwai), me diga quais são e eu te explico como convidar. O caminho pode variar um pouco conforme a versão do aplicativo, então me chama se não achar.`;
  return `Oi, ${n}! Para eu publicar o seu site, preciso falar com o lugar onde o seu domínio está registrado (Registro.br, GoDaddy, Hostinger etc.). O ideal é você me convidar como usuário no painel de lá, sem passar senha. Se preferir, me diga onde está o domínio e eu te oriento a apontar para o site novo.`;
}
```

## Anexo C. Kit de execução (esquemas e prompts)
```js
const ADS_SCHEMA='{"resumo":"2 a 3 linhas","campanhas":[{"nome":"","tipo":"Pesquisa","objetivo":"","orcamento_diario":"R$ 0,00","lance":"","local":"","horarios":"","observacoes":"","grupos":[{"nome":"","palavras":[{"texto":"","correspondencia":"exata|frase|ampla"}],"anuncios":[{"titulos":["até 30 caracteres cada"],"descricoes":["até 90 caracteres cada"],"url_final":"","caminho1":"","caminho2":""}]}]}],"negativas":[""],"extensoes":{"sitelinks":[{"titulo":"","descricao1":"","descricao2":""}],"frases_destaque":[""],"snippets":"","chamada":""},"publicos":[""],"rastreamento":[""],"checklist_lancamento":[""],"otimizacao_4_semanas":[{"semana":1,"acoes":[""]}]}';
const SOC_SCHEMA='{"resumo":"2 a 3 linhas","rede_principal":"","pilares":[{"nome":"","descricao":""}],"calendario":[{"dia":1,"formato":"","tema":"","gancho":"","legenda":"","cta":"","hashtags":["#"]}],"roteiros":[{"titulo":"","formato":"","duracao":"","gancho":"","cenas":[{"visual":"","fala":""}],"cta":"","legenda":""}],"ideias":[""],"melhores_horarios":"","metricas":[""],"checklist_producao":[""]}';
async function execGen(id,which,corr){
  const l=getL().find(x=>x.id===id);if(!l)return;
  const lab={ads:'o kit de Google Ads',social:'o kit de redes sociais',site:'o site'}[which],base=brief(l).split('\n\nTarefa:')[0];
  const prev=which==='ads'?l.xads:which==='social'?l.xsoc:l.xsite&&l.xsite.html;
  const fix=corr&&prev?`\n\nRESPOSTA ANTERIOR (tinha erro):\n${typeof prev==='string'?prev:JSON.stringify(prev)}\n\nCORREÇÃO DO CONSULTOR (obrigatória, siga à risca): ${corr}\nRefaça tudo corrigindo isso e mantendo o que estava certo.`:'';
  let msgs,opt;
  if(which==='ads'){
    msgs=[{role:'system',content:'Você é um gestor de tráfego sênior de Google Ads no Brasil. Responda SOMENTE com JSON válido, sem nenhum texto fora do JSON. Respeite os limites: títulos até 30 caracteres, descrições até 90, caminhos até 15. Use só informações do briefing e nunca invente dados do cliente; o que faltar, marque como "a confirmar".'+(kb('exec',l)?'\n\n'+kb('exec',l):'')},
      {role:'user',content:base+'\n\nMonte o kit completo para executar no Google Ads Editor. Preencha o JSON abaixo, com os mesmos nomes de campos. Regras: 2 a 3 campanhas e 2 a 3 grupos de anúncios por campanha, de acordo com a verba; 8 a 12 palavras-chave por grupo (misture exata, frase e ampla), pensadas para o ramo e a região do cliente; 1 anúncio responsivo por grupo com 15 títulos (máx. 30 caracteres cada) e 4 descrições (máx. 90); no mínimo 20 palavras negativas; orçamento diário em reais (verba mensal dividida por 30); rastreamento com conversões, GA4 e WhatsApp.\n\nJSON:\n'+ADS_SCHEMA+fix}];
    opt={slot:'ia1',json:true,max:5200,temp:0.3};
  }else if(which==='social'){
    msgs=[{role:'system',content:'Você é estrategista de conteúdo para redes sociais no Brasil, especialista em retenção e engajamento. Responda SOMENTE com JSON válido, sem nenhum texto fora do JSON. Use só informações do briefing.'+(kb('exec',l)?'\n\n'+kb('exec',l):'')},
      {role:'user',content:base+'\n\nMonte o kit de execução de conteúdo. Preencha o JSON abaixo, com os mesmos nomes de campos. Regras: 3 a 4 pilares; calendário de 14 dias com formato, tema, gancho dos 3 primeiros segundos, legenda pronta, CTA e hashtags (pode haver dias de descanso, mas liste os dias de postagem); 3 roteiros completos com cenas (visual e fala); 10 ideias extras; melhores horários para a rede escolhida; métricas. Tudo específico para o ramo e o público do cliente.\n\nJSON:\n'+SOC_SCHEMA+fix}];
    opt={slot:'ia1',json:true,max:4200,temp:0.7};
  }else{
    const key=svcs(l).includes('resite')?'resite':'site';
    msgs=[{role:'system',content:MODS[key].sys+' Use SOMENTE informações do briefing; nunca troque o assunto nem o negócio do cliente.'+(kb('exec',l)?'\n\n'+kb('exec',l):'')},
      {role:'user',content:base+'\n\nTarefa: '+MODS[key].task+fix}];
    opt={slot:'ia1',max:7000,temp:0.6};
  }
  Object.assign(J.ex,{on:true,id,live:'',t0:Date.now(),what:lab});A.err='';A.sel=id;paintList();paintDet();
  try{
    const out=await askF(msgs,t=>live('ex',clean(t)),opt);
    if(which==='site'){const h=htmlOf(out)||(/<html|<!doctype/i.test(out)?out:'');if(!h)throw new Error('A IA não devolveu o código do site. Tente de novo.');upd(id,{xsite:{html:h,at:new Date().toLocaleString('pt-BR')}})}
    else upd(id,{[which==='ads'?'xads':'xsoc']:xj(out)||{raw:out}});
  }catch(e){A.err=e.message}
  J.ex.on=false;paintList();paintDet();
}
```

## Anexo D. Prompt do site (montado sem IA)
```js
function sitePrompt(l){
  const re=svcs(l).includes('resite'),qa=qaOf(l);
  return `Você é um designer e desenvolvedor front-end sênior. ${re?'Refaça':'Crie'} o site completo do negócio abaixo, em português do Brasil, pronto para publicar.

## Sobre o negócio
${l.ficha||qa.slice(0,3).map(x=>x.a).join(' · ')}

## Respostas do cliente no briefing
${qa.map(x=>'- '+x.q+' '+x.a).join('\n')}
${re?'\n## Site atual\n'+(ccUrl(l)||'não informado')+'. Mantenha o que o cliente pediu para manter e corrija os problemas citados.\n':''}
## O que construir
- Site responsivo (celular primeiro), com as seções que o cliente pediu e uma estrutura clara: topo com a chamada principal, benefícios, serviços ou produtos, prova social (use [DEPOIMENTO] como espaço reservado se não houver), perguntas frequentes e contato.
- Textos reais e persuasivos, sem lorem ipsum, com título forte e chamada para ação visível em toda a página.
- Botão de WhatsApp fixo e formulário simples de contato (número: [WHATSAPP DO CLIENTE]).
- Visual marcante e específico para este negócio, seguindo o estilo, as cores e as referências do briefing. Nada genérico.

## Requisitos técnicos
- HTML, CSS e JavaScript limpos, rápido, acessível (contraste, texto alternativo, foco visível) e com SEO básico (title, meta description, títulos hierárquicos, Open Graph).
- Sem dependências pesadas. Use placeholders descritivos nas imagens que ainda não existem.

## Entrega
Entregue o código completo e, no final, uma lista curta do que o cliente precisa enviar (logo, fotos, textos, depoimentos).`;
}
```

## Anexo E. Tabela de preços (exemplo; o Gabriel deve substituir)
```
EXEMPLOS: troque pelos seus valores reais (a IA só usa o que estiver aqui)
- Gestão de tráfego Google Ads: R$ 1.500/mês para verba de até R$ 5.000; R$ 2.500/mês acima disso; setup inicial R$ 800
- Conteúdo para redes: pacote de 12 posts/mês R$ 1.800; roteiro avulso R$ 120; edição de vídeo R$ 150 por vídeo; gestão completa do perfil R$ 3.000/mês
- Site: landing page R$ 1.500; site institucional até 5 páginas R$ 3.500; loja/catálogo a partir de R$ 6.000; criação de textos e imagens +R$ 600; domínio e hospedagem por conta do cliente
- Manutenção mensal de site: R$ 250
- Refazer site (redesign): landing page R$ 1.200; institucional até 5 páginas R$ 2.800; loja a partir de R$ 5.000; migração de conteúdo +R$ 400
- Prazo padrão: tráfego começa em 5 dias úteis; conteúdo em 7 dias; landing page em 7 dias; site institucional em 15 dias
- Pagamento: 50% na aprovação e 50% na entrega (serviços únicos); mensal recorrente no cartão ou Pix
```

## Anexo F. Base da IA inicial (sementes)
### F1. Sobre / regras
```js
const KB_SEED={
sobre:`Marca: VYRA Marketing Digital. A VYRA une estratégia, criatividade e tecnologia para ajudar marcas a crescerem de forma mais inteligente, rápida e eficiente. Nas mensagens, Gabriel se apresenta como "Gabriel, da VYRA".
Gabriel Efraime, de Rio de Janeiro. Trabalha como autônomo desde 2019 (Técnico de Suporte e Projetos Digitais): montagem e manutenção de computadores, instalação e formatação de sistemas, servidor próprio com Ubuntu Server, e redesign de sites para pequenos negócios.
Especialidade em audiovisual: já trabalhou como operador de câmera, roteirista, editor de vídeo e operador de podcast (FIERJ), além de produção audiovisual em outros estúdios e eventos.
Experiência em TI na Michelin como Jovem Aprendiz: criou aplicativos internos com Power Apps e bases de dados no SharePoint, e domina o Office 365.
Cursa graduação em Redes de Computadores (Estácio).
Serviços oferecidos aos clientes: tráfego pago (Google Ads), conteúdo e roteiros para redes sociais, criação de sites e redesign de sites existentes.
Atende pequenos negócios e criadores de conteúdo, com conversa simples e próxima.`,
regras:`- Nunca prometer resultado garantido (vendas, seguidores, posição no Google).
- Usar só os valores da tabela de preços; se faltar valor, escrever "a confirmar".
- Falar em reais (R$) e prazos em dias úteis.
- Linguagem simples e simpática, sem jargão técnico sem explicar. Tom próximo e profissional.
- Mensagem de WhatsApp curta: cumprimentar pelo primeiro nome, citar um detalhe do negócio do cliente, mostrar os valores e convidar para fechar.
- Não falar de estudos nem de empregos anteriores, a menos que o cliente pergunte.
- Se o briefing estiver confuso ou contraditório, apontar a dúvida em vez de supor.`
};
```
### F2. Exemplos por ramo (texto exato)
```
### Ramo: restaurante, pizzaria, lanchonete, hamburgueria, delivery, bar, padaria, confeitaria, açaí, cardápio
Oi, Marcos! Aqui é o Gabriel. Li o briefing da pizzaria e montei 3 opções para você vender mais no delivery sem depender só dos aplicativos. Como o movimento aperta à noite e no fim de semana, a ideia é aparecer no Google para quem busca "pizza perto de mim" justamente nesses horários.
Básico: 1 campanha no Google para o seu bairro, com o cardápio principal e botão de WhatsApp. R$ [valor]
Médio (o que eu recomendo): Básico + anúncios nos horários de pico, extensão de ligação e relatório semanal simples. R$ [valor]
Max: Médio + remarketing para quem já visitou seu site e página de pedidos otimizada. R$ [valor]
Qual dessas combina mais com o seu momento? Se quiser, começo já nesta semana.

### Ramo: clínica, estética, dentista, odontologia, saúde, consultório, psicólogo, nutricionista, fisioterapia, médico, procedimento
Oi, Dra. Paula! Aqui é o Gabriel. Vi no briefing que o seu objetivo é encher a agenda de procedimentos de estética com pacientes da região, e que a confiança pesa muito na decisão. Montei 3 caminhos que trabalham o Google e a sua credibilidade, sem promessas exageradas e respeitando as regras de publicidade da sua área.
Básico: página de captação com botão de agendar pelo WhatsApp. R$ [valor]
Médio (recomendado): Básico + anúncios para quem procura o procedimento perto de você e textos que passam segurança. R$ [valor]
Max: Médio + conteúdo para as redes e acompanhamento mensal dos agendamentos. R$ [valor]
Posso te explicar o Médio rapidinho por chamada?

### Ramo: advocacia, advogado, contabilidade, contador, consultoria, escritório, engenharia, arquitetura, imobiliária, corretor, seguros
Oi, Dr. Ricardo! Aqui é o Gabriel. Pelo briefing, o escritório vive de indicação e quer começar a receber contatos qualificados pela internet, com um tom sóbrio e discreto. Montei 3 opções focadas em quem já está procurando ajuda na sua cidade.
Básico: site de uma página com áreas de atuação e contato por WhatsApp. R$ [valor]
Médio (recomendado): Básico + anúncios no Google para as buscas da sua área de atuação. R$ [valor]
Max: Médio + artigos para ganhar autoridade e relatório mensal de contatos. R$ [valor]
Respeito as regras de publicidade da sua profissão em tudo. Quer ver como ficaria a página inicial?

### Ramo: loja, varejo, moda, e-commerce, loja virtual, calçados, acessórios, cosméticos, produtos, atacado
Oi, Camila! Aqui é o Gabriel. Li o briefing da sua loja e entendi que o objetivo é vender mais online, alcançando quem já está procurando o produto. Montei 3 opções:
Básico: anúncios de pesquisa para os seus produtos mais vendidos. R$ [valor]
Médio (recomendado): Básico + anúncios de produto e remarketing para quem viu e não comprou. R$ [valor]
Max: Médio + roteiros de conteúdo para as redes e otimização contínua. R$ [valor]
Qual faz mais sentido para a verba que você tem hoje? Eu ajusto.

### Ramo: influenciador, criador de conteúdo, youtube, instagram, tiktok, canal, perfil, podcast, creator, seguidores
Oi, Léo! Aqui é o Gabriel. Vi que o seu canal já tem uma comunidade fiel e que o objetivo é crescer o engajamento sem perder o seu jeito. Como eu venho do audiovisual, pensei os roteiros já nos primeiros segundos de cada vídeo, que é onde a pessoa decide ficar ou sair.
Básico: ideias de posts e alguns roteiros completos. R$ [valor]
Médio (recomendado): Básico + calendário de duas semanas e análise do que o seu público mais assiste. R$ [valor]
Max: Médio + edição de vídeos e acompanhamento das métricas. R$ [valor]
Quer que eu te mande um roteiro de amostra para você sentir o estilo?

### Ramo: refazer site, redesign, site antigo, site lento, site desatualizado, refazer, site atual
Oi, Sandra! Aqui é o Gabriel. Olhei o que você contou sobre o site atual: está desatualizado, demora a abrir no celular e quase ninguém entra em contato. Dá para manter a sua identidade e o que funciona e refazer o resto. Montei 3 opções:
Básico: nova página inicial responsiva, com seu logo e suas cores, e botão de WhatsApp. R$ [valor]
Médio (recomendado): site com várias páginas, textos revisados, carregamento rápido e formulário de contato. R$ [valor]
Max: Médio + migração do conteúdo, blog e acompanhamento no primeiro mês. R$ [valor]
Posso te mostrar como ficaria a página inicial?

### Ramo: salão, barbearia, academia, personal, pet shop, estúdio, loja de bairro, mecânica, oficina, lavanderia, manicure
Oi, Bruno! Aqui é o Gabriel. Pelo briefing, a barbearia já tem clientes fiéis e o objetivo é encher os horários vazios da semana. Montei 3 opções pensando em quem mora e trabalha perto de você:
Básico: perfil no Google bem ajustado e anúncios locais. R$ [valor]
Médio (recomendado): Básico + página com agendamento pelo WhatsApp e conteúdo curto para as redes. R$ [valor]
Max: Médio + vídeos curtos e campanha para trazer de volta clientes antigos. R$ [valor]
Qual horário costuma ficar mais vazio? Eu foco a campanha nele.

### Ramo: eventos, fotografia, filmagem, audiovisual, produtora, casamento, buffet, cerimonial, festa, banda, dj, fotógrafo
Oi, Aline! Aqui é o Gabriel. Vi que o seu trabalho depende da confiança de quem vai contratar para um dia importante. Como eu venho do audiovisual e de eventos, sei que a vitrine precisa mostrar o seu trabalho logo de cara. Montei 3 opções:
Básico: página com portfólio e pedido de orçamento pelo WhatsApp. R$ [valor]
Médio (recomendado): Básico + anúncios para quem busca o seu serviço na sua cidade, nas épocas de maior procura. R$ [valor]
Max: Médio + roteiros e vídeos curtos de bastidores para as redes. R$ [valor]
Quer que eu comece olhando o seu portfólio atual?

### Ramo: geral
Oi, [nome]! Aqui é o Gabriel. Li o seu briefing e entendi que [objetivo do cliente em uma frase]. Pensando no ramo de [ramo do cliente] e na sua realidade, montei 3 opções:
Básico: [o essencial para começar]. R$ [valor]
Médio (recomendado): [o mais indicado para este cliente]. R$ [valor]
Max: [o mais completo]. R$ [valor]
Qual combina mais com o seu momento? Posso ajustar o que precisar.
Formato do orçamento: cada pacote lista o que está incluso, o total em R$ [valor da tabela], o prazo em dias úteis e a condição de pagamento. Os valores entre colchetes vêm sempre da tabela de preços, nunca copie valores dos exemplos.
```

## Anexo G. Como o logo foi extraído (se precisar refazer)
Recorte do "V" grande da imagem (caixa aproximada x 120–375, y 165–345 em 1536×1024), estimar o fundo por interpolação bilinear dos 4 cantos, `alpha = clip((distância_ao_fundo − 26)/40, 0, 1)`, zerar alpha < 0,06, desfazer a pré-multiplicação (`cor = (pixel − (1−α)·fundo)/α`) e cortar pelo `bbox`. Preferir o SVG original quando existir.
