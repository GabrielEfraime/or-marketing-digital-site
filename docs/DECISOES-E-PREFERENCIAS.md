# Decisões de design e preferências do dono

Registro do que foi decidido e do que o Gabriel gostou ou não, para quem continuar o projeto (pessoa ou IA) não desfazer nem repetir.

## Identidade e tema
- Marca: **Vyxa Marketing Digital** (a especificação antiga dizia VYRA). Cores: lima `#C6F432` (acento), azul-marinho `#0B1030`, violeta `#5B3DF5`, ciano `#22D3EE`.
- **Só tema escuro.** O modo claro foi removido em 2026-10-27 (sem botão de tema).
- Sem Google Fonts: fontes do sistema (privacidade do visitante e desempenho).

## Referências visuais (em ordem de importância)
1. **United Carriers** (unitedcarriers.com): o site público inteiro segue esse estilo: preto quase total com faixas brancas, pontos como textura, títulos em caixa alta e dois tons, rótulos monoespaçados com índice `(01)`, linhas finas, faixa de avisos lima, marca do rodapé em matriz de pontos com anel de cursor, cena fixa na rolagem em "Como funciona", números grandes (só os reais do produto).
2. **Seacat / Rossinavi**: abertura com o nome se revelando do desfoque, barra de carregamento e botão "Entrar no site"; capítulos laterais.
3. **Son Daven**: borda serrilhada na faixa lima.
4. **onmarketing.digital**, **noblinddz**: referências anteriores (vidro, cartões, ritmo de seções).

## O que o dono pediu e deve ficar
- **AI-Driven** na home, com a **orbe estilo JARVIS** (anéis orbitais ciano e violeta em 3D, malha, núcleo magenta). Ele se irritou quando esse bloco sumiu: nunca remover.
- **Esfera de água** no topo das **páginas de serviço** (não na home).
- **V 3D** da marca (WebGL) no topo da home e de vagas: gira sozinho, sem reagir ao mouse.
- **Orbe do AI-Driven** gira sozinha (sem reagir ao mouse).
- **Rodapé em pontos** reage ao cursor (essa interação ele pediu).
- **Vidro (glass)** no site e na Minha área, com fallback sólido (`prefers-reduced-transparency`).
- A **abertura** (uma vez por visita; Esc ou "Pular" entram direto).
- "Como funciona" como **cena fixa** em canvas com contador de 0 a 100%.

## O que o dono NÃO gostou (não repetir)
- Fundo vivo com **linhas de contorno** animadas + **grão de filme** + **seções empilhadas** com cantos arredondados (desfeito).
- Efeito de **hover com preenchimento lima inteiro** nas linhas de serviço (pesado): agora é só um clareado leve, nome e seta em lima.
- Visual "de IA": gradientes em texto, brilhos, partículas soltas, ondas, faixa de serviços correndo (removidos da home).
- Acordeão para os serviços (rejeitado cedo): serviços são **linhas** que abrem uma página própria.

## Conteúdo e honestidade
- Nada de preço, número, depoimento ou resultado inventado. Os números grandes da home são fatos do produto (3 opções, nº de serviços, 4–7 perguntas).
- A IA nunca faz conta: o app calcula os orçamentos a partir da tabela `PRECOS`.
- Mensagens e orçamentos sempre passam pela revisão do consultor.

## Minha área
- Glass em painéis, menu lateral, cartões de estatística e janelas.
- O link "Minha área" aparece só no arquivo local (`file://`) ou em `#/admin`; some no site publicado.

## Sites gerados para clientes
- Guia HTML de apresentação **só na Minha área** (o cliente só vê quando o consultor baixa e envia).
- Prompt para ferramentas externas (Lovable, v0...) com direção de design sugerida: cinematográfico, dados em pontos, editorial, produto em foco ou esportivo (inspirados em Seacat, United Carriers, Son Daven, Apple, Nike/Adidas).
- Sites gerados são **sem recursos externos** (a prévia roda sob a mesma política de segurança).
- Os 9 **prompts de especialista** (`ESP`) foram escritos pelo dono e adaptados ao briefing: sem intake, "a confirmar" para o que faltar.

## Pacotes e mensagem (decisão do documento de 27/10/2026)
- Nomes dos pacotes: Essencial, Crescimento, Completo (as chaves internas continuam basico/medio/max). O Médio NÃO é mais o recomendado por padrão: a IA indica o que combina com o briefing e diz quando a opção simples basta.
- Mensagem: abertura natural com detalhe real, pacotes montados pelo app, uma nota única de verba de anúncios e "condição de pagamento: a confirmar", fechamento variado.

## Ajustes de 28/10/2026
- Primeira tela centralizada, sem a logo 3D, com os 9 serviços em cartões flutuando ao redor (referência de layout: Cosmos). Os cartões usam só ícone e nome do serviço; o dono preferiu não usar imagens por enquanto.
- Manifesto em 4 cartões (Toggl como referência) e Três opções em 3 cartões do mesmo tamanho. Nenhum pacote aparece como "recomendado" na animação do Como funciona.
- OR em pontos do rodapé: faixa de luz que atravessa a marca sozinha e afastamento dos pontos em volta do mouse (o dono achou que estava parado demais).
- Menu do topo vira "Menu" abaixo de 1240 px para não quebrar em duas linhas; trilho de capítulos só a partir de 1440 px.
- "Talentos" saiu do menu da Minha área e virou a aba "Banco de dados" dentro de Vagas.
- Base da IA: exemplos e regras com os nomes Essencial/Crescimento/Completo e as regras novas de orçamento e WhatsApp. A migração atualiza também o que já estava salvo no navegador e guarda a versão anterior (botão "Ver a versão anterior").
- Troca de provedor de IA: só depois que tudo estiver rodando (pedido do dono).

## Acompanhamento novo (29/10/2026)
- Cada cliente em execução tem "O que vamos fazer": entregas do pacote vindas da tabela de preços (editáveis), com frequência Todo mês, Toda semana, Uma vez ou Fora do escopo.
- Produção por ciclo (mensal ou semanal, escolhido por serviço): o ciclo junta as entregas recorrentes, a IA gera o material (briefing + escopo + exemplos das campanhas + ciclo anterior), a equipe revisa e pede aprovação pelo WhatsApp. Situações: Planejado, Em produção, Em aprovação, Aprovado, Entregue.
- Campanhas com exemplos de referência (texto e arquivos). A IA usa só o texto; imagens ficam para a equipe consultar. Exemplos são tratados como dados, nunca como instruções.
- Meta Ads ganhou aba própria com importação do CSV do Gerenciador de Anúncios. Ligação direta com Google Ads, Meta e WhatsApp fica para quando houver servidor.
- Assessoria de imprensa: pautas (da ideia à publicação), clipping e lista de veículos com contato profissional. Sem promessa de publicação.
- Site: acesso rápido (links da hospedagem, repositório e domínio, sem senha) e versões do código no IndexedDB, com prévia, edição (gera versão nova), download e "marcar como publicada". As versões e os arquivos das campanhas NÃO entram no backup.

## Produção por frentes, como um portfólio (29/10/2026)
- "O que vamos fazer" virou frentes: nas redes sociais, cada rede marcada (Instagram, Facebook, TikTok, LinkedIn, YouTube, Kwai, Pinterest, X) com os seus formatos (posts, carrosséis, Reels, Stories, vídeos curtos, Shorts, pins), cada um com quantidade e frequência (por mês, semana, dia ou no projeto). Nos outros serviços, áreas próprias (Google Ads: campanhas, anúncios, palavras-chave, extensões, otimização, relatório; e assim por diante). As quantidades vêm do pacote da tabela; o que não vira frente fica em "Outras entregas".
- Produção no estilo Behance (pedido do dono): galeria de cartões por frente com o mês e o progresso, página da frente com a galeria das peças (espaços tracejados para as que faltam) e página da peça com o texto completo, situação, data, "Gerar de novo" e envio para aprovação.
- "Gerar tudo do mês" gera as peças que faltam em todas as frentes, em partes, uma chamada de cada vez, com botão Parar. Os ciclos com lista de itens da versão anterior saíram da tela (os dados antigos continuam guardados).
- O botão "Cliente fechou" fica no fim do lead, numa faixa própria. As listas suspensas abrem escuras (color-scheme dark).

## Mês do contrato e assistente de IA nos canais (29/10/2026)
- O período da produção é o mês do contrato do cliente (Mês 1, Mês 2...), contado a partir da data de início, e não o mês do calendário. Ex.: início em 29/10 → Mês 1 vai de 29/10 a 28/11.
- Visão geral do acompanhamento: cartão do mês do contrato (datas, dias restantes, progresso) e a lista das demandas do mês, separada por serviço, cada uma com a sua barra (ex.: Instagram · Reels 3/12). Clicar abre a página da demanda.
- Redes sociais, Google Ads, Meta Ads, Site e Imprensa ganharam um "Assistente de IA" no topo, como nos leads: ações prontas (temas do mês, briefing de uma postagem, calendário, estrutura da campanha, anúncios, palavras-chave, criativos, públicos, análise dos números, pautas, release), pedido livre, histórico das respostas, "Corrigir a IA" (salva em Base da IA > Correções aprendidas, só para o cliente ou para todos) e "Criar peças com estes temas" / "Salvar como peça".
- As abas dos canais ficaram em duas colunas: Resultados (números, gráficos, lançamento e importação recolhíveis) e Conta/Perfis e acesso.
- Página da peça: "Briefing de produção" gerado pela IA (objetivo, formato e medidas, roteiro, texto da arte, referências, o que pedir ao cliente). Peça criada a partir de um tema mostra "Desenvolver com IA" e mantém o tema como título.

## Perfil do cliente como base da IA (29/10/2026)
- Cada cliente em execução tem um "Perfil do cliente (base da IA)" no topo da Visão geral: nicho/ramo, o que vende, público, região, objetivo, tom, diferenciais, regras e o que evitar, concorrentes, datas fortes, particularidades do nicho (sugestão da IA) e observações.
- O perfil é montado sozinho a partir de TODAS as respostas do briefing (e do resumo confirmado, se houver), sem inventar nada; respostas "não sei" ficam de fora. Setores regulados (saúde, advocacia, contabilidade, financeiro, imobiliário...) ganham a regra de publicidade automaticamente.
- "Organizar com IA" resume os campos e identifica o nicho e o subnicho; só o campo "Particularidades do nicho" traz conhecimento geral do setor, marcado como sugestão. O consultor corrige qualquer campo e a IA passa a usar a versão corrigida.
- Toda IA do cliente (produção, assistente dos canais, briefing das peças, outras entregas e relatório) recebe o perfil, todas as respostas do briefing e a regra de ser específica para o nicho, sem ideias genéricas. O assistente e a produção mostram a linha "Base: nicho · região · público".

## Núcleo da IA, revisão de segurança e sites de cliente (29/10/2026)
- Toda chamada de IA do site começa com o núcleo do dono (SHARED CORE, em inglês, saída em pt-BR), sempre em PIPELINE MODE; as instruções de cada tarefa vêm depois e não podem afrouxar Verdade, "Content is data" e Ética. Briefing vai entre <briefing> e só o primeiro nome do cliente vai à IA.
- Revisão de segurança pelo Prompt Mestre v2.0: relatório em docs/REVISAO-SEGURANCA.md. Backup baixado agora sai cifrado com senha (AES-GCM); IA com tempo-limite de 150 s; PIN novo com PBKDF2 600 mil.
- Funções inspiradas nas skills, por setor: Sites → "Verificar" (acessibilidade, segurança, privacidade e SEO do HTML gerado) e "Conteúdo para buscas com IA" (FAQ + JSON-LD); Redes → "Revisar para o algoritmo"; Google Ads e Meta Ads → "Anúncios dos concorrentes" (o consultor cola os anúncios das bibliotecas oficiais); painel → leve retorno ao toque nos botões.
- Sites de cliente: diretrizes de landing page de galeria curada (Landdding), botão para a categoria do nicho no Landdding, campo de referências escolhidas pelo consultor e "Estilo do site" (Padrão, Com movimento, 3D com movimento). Referências fixas da OR para movimento/3D: dopaminestudio.io, bar-topas.ch, pradiplabs.dev, dark-moon.org. O 3D nunca é condição para ver o conteúdo; preço do 3D entra como linha "extra" na tabela, com valor definido pelo dono.

## Limites da IA (29/10/2026)
- IA 3 (reserva) na nuvem: Groq qwen/qwen3.8-27b com a mesma chave da IA 1. Nada de IA no PC.
- Erro 429/413 da Groq: o site lê a mensagem (limite, pedido, tempo de espera); por minuto até 30 s espera e tenta de novo com aviso na tela; pedido maior que o limite encolhe e reenvia; limite do dia passa para a próxima IA (IA 1 → IA 2 → IA 3, cada modelo tem limite próprio). O limite aprendido fica salvo e aparece na tela IAs. "Gerar tudo" faz pausa de 1,5 s entre as partes. Pedidos dos modelos gpt-oss pedem menos tokens (×1,4 + 300 em vez de ×2,5 + 600).
- A Groq não expõe os cabeçalhos de limite ao navegador; só a mensagem de erro informa o limite.

## IA só no clique, Captar clientes e SEO (29/10/2026)
- A IA não roda sozinha: abrir o site ou a Minha área não gera nada (acabou o "Orçamento automático" e o aquecimento do Ollama ao abrir). Cada lead tem o botão "Gerar tudo com a IA" (resumo, orçamentos, estratégia e kits), e cada parte continua com o seu botão.
- Desde 29/10/2026 o site roda no **Gemini** (pedido do dono), pela API compatível com OpenAI do Google: IA 1 `gemini-3.5-flash`, IA 2 `gemini-3.5-flash-lite`, IA 3 `gemini-flash-lite-latest`, todas com a mesma chave. O `gemini-flash-latest` ficou fora porque vivia sobrecarregado (erro 503 ou sem resposta). Configurações antigas da Groq migram sozinhas uma vez; o botão "Usar a Groq nas duas IAs" continua na tela IAs. Modelos Gemini usam `reasoning_effort:"low"` e o mesmo aumento de tokens do gpt-oss.
- Chave Gemini: `GEMINI_API_KEY` no `.env` (local) e como segredo no Cloudflare (publicado). `npm run abrir` coloca a chave do `.env` na página servida em 127.0.0.1 quando o navegador ainda não tem uma salva; o `dist/` nunca recebe chave. Os avisos de limite por minuto (429) só entendem a mensagem da Groq.
- Nova área "Captar clientes", no estilo do vídeo de referência: nicho + cidade + bairro → busca no Google (Places API, com a chave do dono) → cards com "Sem site: oportunidade", "Só Instagram", celular, nota e avaliações → salvar → prévia do site com IA → mensagem de abordagem → WhatsApp → marcar contatado → "Fechou: criar lead" (vai para Leads e segue o fluxo normal). Painel com buscas, prospects, sites, contatados, responderam, fechados e valor fechado.
- Sem automação escondida: a busca só roda no clique; "Gerar sites dos selecionados" gera um por vez depois do clique, com "Parar".
- Honestidade nas prévias: a IA não escreve depoimentos; as avaliações mostradas são as reais do Google (nota 4+, nome curto do autor, "avaliação no Google"), colocadas pelo app. Links de WhatsApp, mapa e Instagram, e as fotos, também são colocados pelo app. Toda prévia tem a faixa "Prévia feita pela OR Marketing Digital para X. Não é o site oficial", crédito das fotos do Google e noindex.
- Mensagem de abordagem: até 600 caracteres, sem preço, sem promessa, cita 1 ou 2 fatos reais, assina "Equipe OR Marketing Digital" e termina com "Se não quiser receber mensagens nossas, é só avisar." Envio sempre manual pelo consultor (wa.me), nunca em massa.
- SEO: só o que é legítimo e invisível ao visitante (meta tags, JSON-LD, robots, sitemap, verificação do Search Console). Texto escondido só para o Google (o que foi pedido) não foi feito porque o Google pune (cloaking).

## Limpeza, Cloudflare e GitHub (29/10/2026)
- Hospedagem de teste: repositório no GitHub (privado) ligado ao Cloudflare Pages. O servidor são funções do próprio Pages em `functions/api/`: a chave da Groq fica só no Cloudflare (segredo `GROQ_API_KEY`), e a Minha área usa a IA com o código do servidor (`ADMIN_TOKEN`, colado em IAs > Servidor).
- Visitante não usa IA no site publicado: o briefing segue só com as perguntas fixas. Assim não existe endpoint público que gaste a cota.
- Briefing do visitante vai para o servidor (KV `LEADS`, até 30 dias) e chega na Minha área por "Buscar briefings do site" (e sozinho ao abrir Leads). Depois de salvo no navegador, sai do servidor. Se o envio falhar, o visitante vê "Falta um passo" e um botão que manda as respostas pelo WhatsApp.
- A plataforma abre por `npm run abrir` (servidor local em 127.0.0.1), e não por duplo clique: no file://, qualquer HTML aberto no mesmo Chrome lê as chaves e os dados.
- IA no PC (Ollama) saiu de vez: opção, código e a liberação de localhost na CSP.
- Captar clientes funciona sem chave do Google: a busca usa o OpenStreetMap (grátis, mais lento, até 1 min e meio, e com menos negócios). "Sem site no mapa" quer dizer só que o site não está cadastrado no mapa. Com chave do Google, a busca usa o Google.
- Refazer site: área "Site atual do cliente" na Execução do lead (abrir o site, medir no PageSpeed, ler o código pelo servidor no site publicado, lista de melhorias com IA). A lista entra no pedido do site novo e na estratégia.
- Acompanhamento > Site: o botão "Gerar o site com IA" fica no topo, junto com o estilo, as referências e o campo "O que mudar nesta versão". Cada geração vira uma versão.
- Criação de sites com as habilidades apple-hig-designer, design-taste-frontend e ux-copy resumidas em `SITE_SKILLS` (02-modulos-servicos.js), em todos os pedidos de site (lead, kit, captação e o prompt para outras IAs). A direção de design escolhida só muda uma regra quando pede isso de forma explícita.
- Apagar cliente ou prospect guarda o id em `CFG.apagados`: o backup não traz de volta, e a pasta do HD é limpa quando reconectar.
- Pasta enxugada: o que não é do site foi movido (não apagado) para `E:\SITE IA\_arquivo\` (zips, PDFs, prévias, marca, LOGO E ABERTURA, kit, pasta SKILL com as skills baixadas, assets, backend Supabase, skills-claude, documentos antigos).

## Três IAs com função fixa e chaves cifradas (30/10/2026)
- IA 1 = OpenAI (plano, roteiros, sites, análise de site e todo o acompanhamento). IA 2 = Gemini (perguntas do briefing, resumo, orçamento, mensagem ao cliente, vagas). IA 3 = Groq (captação de clientes: site de prévia e mensagem de abordagem). A IA "reserva" saiu: se uma IA falha ou bate no limite, o site tenta as outras duas.
- As chaves ficam cifradas (AES-GCM) no navegador: a chave de cifra é gerada ali e fica no IndexedDB como não exportável. Só o texto cifrado vai para o localStorage e para o IndexedDB. Não entram em backup nem em exportação. Chaves antigas em texto puro são cifradas na primeira abertura. A cifra não protege contra um script malicioso dentro da própria página (por isso a CSP fechada); no site publicado, o caminho seguro continua sendo as chaves nos segredos do Cloudflare.
- Modelo padrão da IA 1: `gpt-5-mini` (confirme em "Ver modelos disponíveis"). Modelos gpt-5 e série o usam `max_completion_tokens` e não aceitam temperatura.
