const SITE_REF=`DIREÇÃO DE DESIGN. Escolha UMA das cinco, a que combina com o ramo e com o estilo pedido. Não misture, não copie nenhuma marca (use só o jeito de compor) e diga em uma linha qual escolheu e por quê.
1) Cinematográfico escuro (inspirado na experiência da Seacat, da Rossinavi): telas cheias e escuras, uma frase grande por tela com rolagem em capítulos (scroll-snap), título que se revela saindo do desfoque com letras bem espaçadas, navegação lateral por capítulos, luz azulada ou quente só nas bordas. Bom para luxo, náutica, arquitetura e eventos premium.
2) Dados em pontos (inspirado na United Carriers): fundo preto, textura de matriz de pontos desenhada em canvas, pontos pulsantes em uma cor de acento, contadores que sobem ao entrar na tela, tipografia larga em caixa alta, listas que correm. Bom para B2B, logística, tecnologia e consultoria.
3) Editorial texturizado (inspirado na Son Daven): paleta terrosa (grafite quente e areia), título gigante em letras largas, textura de linhas finas feita em CSS (scanlines ou meio-tom), bordas serrilhadas entre as seções, abertura curta com o nome do negócio. Bom para hospitalidade, imóveis, restaurantes e design.
4) Produto em foco (inspirado na Apple): muito espaço em branco, poucos títulos enormes, um destaque por tela, revelações suaves ao rolar, uma só cor de acento. Bom para produto único, clínicas e tecnologia limpa.
5) Esportivo impactante (inspirado na Nike e na Adidas): letras condensadas em caixa alta gigantes, contraste preto e branco com uma cor forte, imagens de tela cheia, grade de produtos com preço e botão grande de compra. Bom para lojas, moda, fitness e esportes.
Relação com o estilo pedido: Elegante e luxuoso = 1 ou 3; Tech/futurista = 2; Moderno e minimalista = 4; Ousado e colorido = 5; Aconchegante e humano = 3.`;
const SITE_REGRAS=`Regras de execução: um único arquivo HTML sem recursos externos (sem Google Fonts, sem CDN e sem imagens de outros sites): use fontes do sistema com uma boa pilha de reserva, CSS, SVG e canvas. Imagens que ainda não existem viram placeholders desenhados com legenda. Efeitos só com transform e opacity, uma cena de destaque feita com canvas ou CSS, tudo desligado com prefers-reduced-motion e leve no celular. Nunca invente depoimentos, números, clientes ou preços: use [DEPOIMENTO], [NÚMERO] e "a confirmar".`;
/* Habilidades de design embutidas na criação de sites (resumo das skills apple-hig-designer, design-taste-frontend e ux-copy). */
const SITE_SKILLS=`HABILIDADES DE DESIGN (valem em todo site; a direção de design escolhida só muda uma regra quando pedir isso de forma explícita):
1) INTERFACE (Apple HIG): clareza (cada elemento tem uma função e a hierarquia vem do tamanho e do peso), o conteúdo é o herói (pouco enfeite), consistência do começo ao fim. Fonte do sistema (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif), texto corrido com 16 a 18 px e altura de linha 1,4 a 1,6, espaçamentos em múltiplos de 8 px, botões e links com área de toque de pelo menos 44x44 px, botão principal em cápsula com resposta ao toque (scale .97, 100 a 200 ms), contraste AA (4,5:1; 3:1 em texto grande), fundos sólidos (vidro e desfoque só se pedido), prefers-reduced-motion desliga o movimento.
2) DIREÇÃO DE ARTE (anti-genérico): a ideia do site sai do próprio negócio (o nome e o que ele quer dizer, a rua e o bairro, os materiais, as cores, os rituais, o que ele produz). Teste do concorrente: se a ideia servir para o vizinho do mesmo ramo, ela é genérica, troque. Primeira tela com um h1 que diz o que é, para quem e onde, uma frase de apoio logo abaixo e um único botão principal. Títulos com no máximo 2 linhas (por volta de 32 caracteres). Cada seção com título próprio e conteúdo completo (seção magra perde). Margens iguais dos dois lados, sem metade da tela vazia. Tipografia com 2 ou 3 tamanhos bem diferentes e no máximo 2 fontes. Proibido: rótulo pequeno acima do título, selos e pílulas, numeração 01/02/03, linhas finas e caixas com contorno de 1 px, gradientes, sombra em elemento parado, brilho, vidro, emoji, fileira de cards iguais com ícone em cima, caixa alta pequena com letras espaçadas, palavra de destaque estilizada no título, fonte monoespaçada fora de código. No lugar disso: escala, cor chapada, a foto real do negócio ou um desenho em SVG feito do próprio negócio. Uma coisa interativa útil feita do conteúdo real (por exemplo, "aberto agora?" pelos horários, ou escolher o serviço e falar no WhatsApp com ele já escrito), que funcione no celular e não atrapalhe a leitura. Movimento: as partes de cada seção entram uma depois da outra (60 a 90 ms), subindo 16 a 32 px com opacidade; só transform e opacity; nada fica escondido se o script falhar.
3) TEXTOS (UX writing): claro, curto, consistente (o mesmo nome para a mesma coisa), útil e humano, em português do Brasil natural. Botões começam com verbo e dizem o resultado ("Agendar pelo WhatsApp", "Ver o cardápio"; nunca "Enviar", "Clique aqui" ou "Saiba mais" soltos). Erro diz o que aconteceu e como resolver. Sem jargão, sem exagero e sem promessa de resultado.`;
const MODS={
ads:{c:'#F5F5F3',name:'Anúncios no Google (Google Ads)',desc:'Aparecer no Google para quem já está procurando o que você vende.',
 sys:'Você é um gestor de tráfego sênior de Google Ads no Brasil, focado em retorno para pequenas e médias empresas. Responda em português do Brasil, em Markdown, com números e ações concretas.',
 foco:'anúncios no Google (pesquisa, rede de display, Performance Max, remarketing)',
 qs:[['negocio','Qual é o seu negócio?','Ex: clínica de estética, loja de tênis, escritório de advocacia',0,'neg|empres|trabalh|vend'],
 ['oferta','O que você vende e qual o valor médio de cada venda?','Produto ou serviço principal e quanto cada venda rende',0,'vend|valor|ticket|produto|servi'],
 ['local','Onde estão os seus clientes?','Cidade, bairros ou "Brasil todo"',0,'onde|cidade|bairro|regi|local|brasil|atend'],
 ['obj','O que você quer que a pessoa faça depois de clicar no anúncio?',['Chamar no WhatsApp','Ligar','Preencher um formulário','Comprar online','Ir até a loja'],1,'faça|clic|anúnc|objetiv|contato|alcan'],
 ['verba','Quanto você pode investir por mês só na verba dos anúncios (sem contar o nosso trabalho)?',FAIXA_VERBA,0,'verba|invest|mês|r\\$|orçament|valor'],
 ['dif','O que faz as pessoas escolherem você e não o concorrente?','Diferenciais, prova social, garantias',0,'difer|concorr|escolh|vantag|melhor'],
 ['hist','Você já anunciou no Google antes? Como foi?',['Nunca anunciei','Já anunciei e funcionou','Já anunciei e não funcionou','Anuncio hoje'],0,'anunc|google|antes|já'],
 ['lp','Para onde o anúncio vai levar a pessoa?',['Meu site','Uma página de vendas','WhatsApp','Instagram','Ainda não tenho'],1,'onde|leva|site|página|whats|instagram|destino|link'],
 ['trk','Você já acompanha os resultados (Google Analytics, conversões, planilha)?',['Sim','Mais ou menos','Não'],0,'acompanh|medi|analytics|convers|resultado|planilha'],
 ['epoca','Existem dias, horários ou épocas em que você vende mais?','Ex: fim de semana, noite, Dia das Mães',0,'dia|hor|época|sazon|pico|vende'],
 ['pub','Qual público você quer alcançar?','Quem compra de você: perfil, idade, necessidade',0,'públic|cliente|quem|perfil'],
 ['conta','Já existe uma conta no Google Ads?',['Sim, com acesso para nós','Sim, mas sem acesso','Não existe ainda'],0,'conta|google ads'],
 ['prior','Quais serviços ou produtos devem ser priorizados nos anúncios?','Os que dão mais lucro ou que você quer vender mais',0,'prior|servi|produto|foco'],
 ['conc','Há concorrentes ou referências que vale observar?','Nomes, sites ou "não sei"',0,'concorr|referên'],
 ['respc','Quem vai responder aos contatos que chegarem?',['Eu mesmo','Uma pessoa da equipe','Ainda não definido'],0,'respond|atend|contato|quem'],
 ['regras','Existe alguma regra comercial ou profissional que limite os anúncios?','Ex: regras do conselho da profissão, promoções proibidas, "nenhuma"',0,'regra|conselho|limit|proib|restri']],
 task:'Monte um plano de Google Ads para este cliente: 1) diagnóstico e estratégia de campanhas (Pesquisa, Performance Max, Remarketing) com divisão da verba informada; 2) grupos de anúncios com palavras-chave, correspondência sugerida e palavras negativas; 3) anúncios responsivos (títulos até 30 e descrições até 90 caracteres); 4) extensões; 5) públicos; 6) metas realistas de CPC/CPL (sem prometer resultado); 7) plano de otimização das 4 primeiras semanas. Fale só de Google Ads.'},
meta:{c:'#7C8CFF',name:'Anúncios no Instagram e Facebook (Meta Ads)',desc:'Colocar sua oferta na frente das pessoas certas nas redes.',
 sys:'Você é um gestor de tráfego sênior de Meta Ads (Instagram e Facebook) no Brasil, focado em retorno para pequenas e médias empresas. Responda em português do Brasil, em Markdown, com ações concretas.',
 foco:'anúncios pagos no Instagram e Facebook (Meta Ads)',
 qs:[['negocio','Qual é o seu negócio?','Ex: loja de roupas, estúdio de tatuagem, curso online',0,'neg|empres|trabalh|vend'],
 ['oferta','O que você vende e quanto custa em média?','Produto ou serviço principal e o valor',0,'vend|valor|ticket|produto|servi|custa'],
 ['obj','O que você quer conseguir com os anúncios?',['Mensagens no WhatsApp','Seguidores','Vendas no site ou loja','Cadastros (leads)','Divulgar um evento ou lançamento'],1,'consegu|objetiv|anúnc|alcan|resultado'],
 ['verba','Quanto você pode investir por mês só na verba dos anúncios (sem contar o nosso trabalho)?',FAIXA_VERBA,0,'verba|invest|mês|r\\$|orçament|valor'],
 ['pub','Quem é o seu cliente ideal?','Idade, cidade, interesses, o que ele procura',0,'cliente|públic|idade|quem|interess'],
 ['criativo','Você tem fotos e vídeos do seu produto ou serviço para usar nos anúncios?',['Tenho, de boa qualidade','Tenho, mas são fracos','Não tenho'],0,'foto|vídeo|criativ|imagem|material'],
 ['perfil','Seu Instagram ou página do Facebook já está ativo e organizado?',['Sim, atualizado','Está parado','Está bagunçado','Ainda não tenho'],0,'instagram|facebook|perfil|página|ativo'],
 ['hist','Você já impulsionou posts ou fez anúncios antes? Como foi?',['Nunca','Já impulsionei posts','Já fiz campanhas e funcionou','Já fiz e não funcionou'],0,'impulsion|anunc|antes|já'],
 ['destino','Para onde a pessoa vai ao clicar?',['WhatsApp','Perfil do Instagram','Meu site','Formulário','Loja física'],1,'clic|onde|leva|destino|whats|site'],
 ['atend','Quem responde as mensagens e em quanto tempo?','Ex: eu mesmo, em até 1 hora no horário comercial',0,'respond|atend|mensag|tempo|quem'],
 ['pixel','Você tem o Pixel da Meta instalado no seu site?',['Sim','Não sei','Não','Não tenho site'],0,'pixel|rastre|convers|site'],
 ['local','Onde estão os clientes que você quer alcançar?','Cidade, bairros ou "Brasil todo"',0,'onde|cidade|região|local'],
 ['ativos','Quais contas você já tem na Meta?',['Instagram','Facebook','Gerenciador de Negócios (Meta Business)','Nenhuma ainda'],1,'conta|instagram|facebook|meta']],
 task:'Monte um plano de Meta Ads (Instagram e Facebook) para este cliente: 1) estratégia e estrutura de campanhas (atração, remarketing, conversão) com divisão da verba informada; 2) públicos sugeridos (interesses, localização, remarketing); 3) 6 ideias de criativos com gancho, formato e chamada; 4) textos de anúncio prontos; 5) rastreamento (Pixel, eventos); 6) como responder e converter os contatos; 7) otimização das 4 primeiras semanas e métricas, sem prometer resultado. Fale só de Meta Ads.'},
social:{c:'#B58CFF',name:'Conteúdo para redes sociais',desc:'Ideias, roteiros e calendário para Instagram, TikTok e outras redes.',
 sys:'Você é estrategista de conteúdo para pequenos negócios e criadores no Brasil, especialista em retenção e engajamento. Responda em português do Brasil, em Markdown, com exemplos prontos para usar.',
 foco:'conteúdo orgânico para redes sociais (posts, Reels, Stories, TikTok)',
 qs:[['nome','Qual é o seu perfil ou negócio e sobre o que ele fala?','Ex: fitness para mulheres 40+, padaria artesanal, humor automotivo',0,'perfil|neg|nicho|fala|assunto|sobre'],
 ['rede','Em quais redes você quer atuar?',['Instagram','TikTok','YouTube Shorts','Kwai','LinkedIn','Facebook'],1,'rede|instagram|tiktok|atuar'],
 ['seg','Qual o tamanho da sua audiência hoje?','Seguidores e média de visualizações por post (se começou agora, escreva "zero")',0,'audiên|seguid|visualiza|tamanho|alcance'],
 ['pub','Quem você quer alcançar?','Idade, cidade, interesses. Se não sabe, descreva quem comenta e curte',0,'quem|públic|alcan|idade|cliente|seguid'],
 ['obj','O que você quer com as redes?',['Mais engajamento','Mais seguidores','Vender mais','Fechar parcerias','Virar referência no assunto'],1,'objetiv|quer|alcan|rede|conseguir'],
 ['bom','Quais conteúdos já deram mais resultado?','Temas ou formatos que mais funcionaram. Se está começando, escreva "ainda não sei"',0,'conteúd|resultado|funcion|post|tema'],
 ['tom','Qual o jeito de falar do perfil?','Ex: divertido, direto, educativo, mais sério',0,'jeito|tom|fala|estilo|comunica'],
 ['rosto','Você aparece nos vídeos ou prefere conteúdo sem aparecer?',['Apareço','Prefiro não aparecer','Depende do conteúdo'],0,'aparec|rosto|câmera|vídeo|gravar'],
 ['freq','Quantas vezes por semana você consegue postar?',['2 a 3','4 a 5','Todo dia'],0,'quantas|frequ|semana|post|vezes'],
 ['prod','Quem grava e edita hoje?',['Eu mesmo','Tenho alguém que edita','Preciso de ajuda com tudo'],0,'grava|edita|produz|quem|equip'],
 ['ref','Quais perfis você admira ou quer parecer?','Cite 2 ou 3, de qualquer área',0,'perfil|admir|referên|inspir|parec'],
 ['ent','O que você quer que a gente entregue?',['Só ideias e roteiros','Roteiros e edição','Gestão completa do perfil'],0,'entreg|quer|fazer|roteir|gest'],
 ['aprova','Quem aprova as publicações antes de irem ao ar?',['Eu mesmo','Outra pessoa do negócio','Podem publicar sem aprovação'],0,'aprov|public'],
 ['resp','Quem responde mensagens e comentários?',['Eu mesmo','Uma pessoa da equipe','Preciso que a OR responda'],0,'respond|mensag|coment|quem'],
 ['evitar','Há temas, imagens ou abordagens que devem ser evitados?','Ex: política, comparações com concorrentes, "nenhum"',0,'evit|tema|abordag|proib']],
 task:'Entregue para este cliente: 1) perfil do público e o que ele mais consome (formatos, temas, horários); 2) 3 a 4 pilares de conteúdo; 3) 15 ideias de posts com formato, gancho dos 3 primeiros segundos e chamada; 4) 3 roteiros completos (gancho, desenvolvimento, fechamento, cenas e legenda); 5) calendário de 2 semanas; 6) dicas de edição e retenção para a rede escolhida; 7) métricas. Fale só de conteúdo para redes sociais.'},
youtube:{c:'#FF6B6B',name:'YouTube (canal, vídeos e crescimento)',desc:'Criar, organizar e fazer o seu canal crescer: da configuração aos vídeos.',
 sys:'Você é estrategista de YouTube para criadores iniciantes e pequenos negócios no Brasil: conhece criação e configuração de canal, SEO de vídeo, roteiro, edição, thumbnails, retenção, Shorts, calendário e monetização. Responda em português do Brasil, em Markdown, com exemplos prontos e sem prometer resultado.',
 foco:'canal do YouTube (criação, configuração, gestão, roteiro, edição, thumbnails, SEO, crescimento, monetização)',
 qs:[['nicho','Qual é o assunto do seu canal (ou do canal que você quer criar)?','Ex: receitas veganas, games de corrida, dicas para MEI',0,'assunto|canal|nicho|sobre|tema'],
 ['situacao','Em que ponto você está?',['Ainda não tenho canal','Tenho um canal parado','Tenho um canal ativo e quero crescer','É canal de uma empresa'],0,'ponto|canal|situa|começ'],
 ['serv','O que você quer que a gente faça pelo canal?',['Criar e configurar o canal','Cuidar do canal no dia a dia','Roteiros','Edição de vídeos','Thumbnails (miniaturas)','Otimizar títulos e descrições (SEO)','Estratégia de crescimento','Preparar para monetizar'],1,'faça|fazer|canal|quer|servi|ajuda'],
 ['num','Quantos inscritos e quantas visualizações por vídeo você tem hoje?','Se está começando, escreva "zero"',0,'inscrit|visualiza|view|seguid'],
 ['obj','Qual é o objetivo do canal?',['Ganhar dinheiro com o YouTube','Atrair clientes para o meu negócio','Virar referência no assunto','Vender um produto ou curso','Criar comunidade'],1,'objetiv|canal|quer|alcan|conseguir'],
 ['pub','Quem você quer que assista?','Idade, interesses, o que a pessoa procura',0,'quem|assist|públic|idade|interess'],
 ['freq','Com que frequência você quer publicar?',['1 vídeo por semana','2 a 3 por semana','1 a cada 15 dias','Só Shorts','Ainda não sei'],0,'frequ|publicar|semana|vídeo|vezes'],
 ['formato','Quais formatos você quer fazer?',['Vídeos longos','Shorts','Lives','Podcast em vídeo'],1,'formato|short|live|vídeo|podcast'],
 ['prod','Quem grava e com qual equipamento?',['Eu mesmo, com celular','Eu mesmo, com câmera','Tenho equipe','Preciso de ajuda com tudo'],0,'grava|equip|câmera|celular|produz|quem'],
 ['ident','Seu canal já tem logo, banner e identidade visual?',['Tenho tudo','Tenho só o básico','Não tenho'],0,'logo|banner|identidade|visual|marca'],
 ['mon','Sobre monetização, em que ponto você está?',['Já sou monetizado','Quero chegar lá','Não é meu foco'],0,'monetiza|parceria|ganhar|dinheiro'],
 ['ref','Quais canais você admira ou considera concorrentes?','Cite 2 ou 3',0,'canal|admir|concorr|referên|inspir']],
 task:'Monte um plano de YouTube para este cliente: 1) diagnóstico da situação do canal (ou plano de criação e configuração: nome, descrição, banner, links, seções, trailer); 2) posicionamento e pilares de conteúdo; 3) 15 ideias de vídeos com título, gancho dos primeiros 15 segundos e ideia de thumbnail; 4) 3 roteiros completos; 5) SEO de vídeo (palavras-chave, títulos, descrições, tags, capítulos); 6) calendário de publicação de 4 semanas; 7) plano de Shorts; 8) métricas (CTR, retenção) e caminho para monetização conforme as regras atuais do YouTube (peça para conferir). Sem prometer resultado. Fale só de YouTube.'},
local:{c:'#F5B83D',name:'Google Meu Negócio e SEO local',desc:'Aparecer no Google Maps e na busca da sua cidade.',
 sys:'Você é especialista em SEO local e Google Meu Negócio (perfil da empresa no Google) para pequenos negócios no Brasil. Responda em português do Brasil, em Markdown, com passos práticos e sem prometer posição no Google.',
 foco:'perfil da empresa no Google (Google Meu Negócio), Google Maps, avaliações e SEO local',
 qs:[['negocio','Qual é o seu negócio?','Ex: clínica odontológica, barbearia, mecânica',0,'neg|empres|trabalh'],
 ['onde','Você atende em endereço fixo, vai até o cliente ou os dois? Em qual cidade e bairro?','Ex: loja na Tijuca, atendo em toda a Zona Norte',0,'endere|cidade|bairro|atend|onde|local'],
 ['perfil','Seu negócio já aparece no Google Maps? Você é o dono verificado do perfil?',['Sim, verificado por mim','Aparece, mas não sou o dono verificado','Não aparece','Não sei'],0,'maps|perfil|verific|aparece|google'],
 ['aval','Quantas avaliações e qual nota você tem hoje?','Ex: 23 avaliações, nota 4,6. Se não tem, escreva "nenhuma"',0,'avalia|nota|estrela'],
 ['busca','Como os clientes costumam procurar você?',['"Perto de mim"','Pelo nome do negócio','Pelo serviço e bairro','Por indicação','Não sei'],1,'procur|busca|achar|encontr|google'],
 ['conc','Quem são os concorrentes que aparecem primeiro quando você pesquisa?','Cite 2 ou 3',0,'concorr|aparece|primeir|pesquis'],
 ['fotos','Você tem boas fotos do local, da equipe e dos serviços?',['Sim','Algumas','Não'],0,'foto|imagem|local|equipe'],
 ['contato','Qual o principal canal de contato dos clientes?',['WhatsApp','Telefone','Site','Instagram','Visita presencial'],1,'contato|whats|telefone|canal|falam'],
 ['hor','O horário de funcionamento é fixo? Tem dias especiais ou atendimento 24 horas?','Ex: de segunda a sexta, das 8h às 18h, e sábado até as 13h',0,'horár|funcion|aberto|atend|dias'],
 ['resp','Quem responde avaliações e perguntas dos clientes no Google?',['Eu mesmo','Alguém da equipe','Ninguém, hoje'],0,'respond|avalia|pergunta|quem'],
 ['site','Você tem site? Qual o endereço?','Se não tem, escreva "sem site"',0,'site|endereço|link']],
 task:'Monte um plano de Google Meu Negócio e SEO local para este cliente: 1) diagnóstico do perfil atual; 2) checklist de configuração (categorias, serviços, produtos, atributos, horários, descrição, fotos, mensagens); 3) 8 ideias de publicações com texto pronto; 4) estratégia para pedir e responder avaliações (com 3 modelos de resposta e 1 de pedido por WhatsApp, sem comprar nem trocar avaliação por benefício); 5) palavras-chave locais; 6) ajustes no site para busca local (se houver); 7) rotina mensal e métricas (ligações, rotas, buscas). Sem prometer posição. Fale só de perfil no Google e SEO local.'},
press:{c:'#9AD1FF',name:'Assessoria de imprensa',desc:'Fazer a sua história chegar a jornalistas, sites e veículos do seu setor.',
 sys:'Você é assessor de imprensa para pequenas e médias empresas e criadores no Brasil: define pautas, escreve releases, monta mailing de jornalistas e prepara porta-vozes. Responda em português do Brasil, em Markdown, sem prometer publicação e sem inventar fatos sobre o cliente.',
 foco:'assessoria de imprensa (releases, pautas, relacionamento com jornalistas, clipping)',
 qs:[['negocio','Qual é o seu negócio ou o seu trabalho?','Ex: restaurante de bairro, escritório de arquitetura, criador de conteúdo',0,'neg|empres|trabalh'],
 ['fatos','O que há de novo ou interessante no seu negócio ou na sua história para contar à imprensa?','Lançamentos, prêmios, números, história de superação, algo inédito na sua região',0,'novo|interess|história|contar|imprensa|notícia'],
 ['obj','O que você quer com a imprensa?',['Ser conhecido na minha cidade','Ser referência no meu setor','Divulgar um lançamento ou evento','Cuidar da reputação','Atrair parceiros ou investidores'],1,'objetiv|imprensa|quer|alcan|conseguir'],
 ['pub','Para quem você quer ser visto?','Clientes, parceiros, o mercado, a sua região',0,'quem|visto|públic|clientes|parceiro'],
 ['veic','Em quais tipos de veículo você gostaria de aparecer?',['Jornais e sites de notícias','TV','Rádio','Revistas e portais do meu setor','Podcasts e canais no YouTube'],1,'veícul|aparecer|jornal|tv|rádio|podcast|site'],
 ['hist','Você já apareceu na mídia? Onde?','Se nunca, escreva "nunca"',0,'apareceu|mídia|imprensa|já|onde'],
 ['porta','Quem vai falar com os jornalistas?',['Eu mesmo','Outra pessoa da empresa','Ainda não sei'],0,'quem|falar|jornalista|porta|entrevist'],
 ['agenda','Tem algo marcado nos próximos 3 meses (lançamento, evento, inauguração, campanha)?','Escreva datas aproximadas',0,'marcado|lançamento|evento|inaugur|próxim|data'],
 ['mat','Você tem fotos e vídeos profissionais e um site ou perfil com informações para jornalistas?',['Tenho tudo','Tenho parte','Não tenho'],0,'foto|vídeo|material|site|perfil|jornalist'],
 ['risco','Existe algum assunto que NÃO deve ser divulgado?','Ex: processos, valores, dados de clientes. Se não, escreva "nada"',0,'assunto|divulg|evit|não|sigilo']],
 task:'Monte um plano de assessoria de imprensa para este cliente: 1) diagnóstico: o que é notícia no negócio (ângulos de pauta reais, baseados só no briefing); 2) mapa de veículos e tipos de jornalista a abordar (sem inventar nomes); 3) um release completo e pronto para revisão, usando apenas fatos do briefing e [DADO A CONFIRMAR] onde faltar; 4) 5 sugestões de pauta; 5) e-mail de abordagem curto; 6) preparo do porta-voz (3 mensagens-chave e perguntas difíceis prováveis); 7) calendário de 3 meses e como medir (clipping, menções, tráfego). Nunca prometa publicação. Fale só de imprensa.'},
brand:{c:'#FF9E6B',name:'Identidade visual (logo e marca)',desc:'Logo, cores e jeito de aparecer, para o seu negócio ter cara própria.',
 sys:'Você é designer de marca e estrategista de identidade visual para pequenos negócios e criadores no Brasil. Responda em português do Brasil, em Markdown, com direção clara e sem copiar marcas existentes.',
 foco:'identidade visual (logo, paleta, tipografia, aplicações, manual de marca)',
 qs:[['negocio','Qual é o seu negócio ou projeto?','Ex: café de bairro, canal de games, consultoria financeira',0,'neg|empres|trabalh|projeto'],
 ['situacao','Você já tem logo ou identidade visual?',['Não tenho nada','Tenho um logo feito às pressas','Quero refazer completamente','Quero só atualizar'],0,'logo|identidade|visual|tem|já'],
 ['pub','Quem é o seu cliente e como você quer ser visto por ele?','Ex: jovens de 20 a 30 anos, quero parecer descontraído e confiável',0,'cliente|visto|públic|quem|parecer'],
 ['palavras','Escolha até 3 palavras que definem a sua marca.',['Confiança','Ousadia','Simplicidade','Elegância','Alegria','Tecnologia','Tradição','Natureza'],1,'palavra|defin|marca|3'],
 ['estilo','Qual estilo visual combina mais com você?',['Moderno e minimalista','Colorido e divertido','Elegante e sofisticado','Artesanal e acolhedor','Ousado e marcante'],1,'estilo|visual|combina|aparênc'],
 ['cores','Tem cores que você gosta ou quer evitar?','Ex: gosto de verde, não quero vermelho',0,'cor|gosta|evitar|paleta'],
 ['refs','Quais marcas você admira, de qualquer área?','Cite 2 ou 3 e diga o que gosta nelas',0,'marca|admir|referên|inspir|gosta'],
 ['uso','Onde a marca vai aparecer?',['Instagram e redes','Site','Embalagem','Cartão de visita','Uniforme','Fachada','Material impresso'],1,'onde|aparecer|usar|aplic|embalagem'],
 ['nome','O nome do negócio já está definido e registrado?',['Sim, definido e registrado','Definido, sem registro','Ainda estou escolhendo'],0,'nome|registr|inpi|definid'],
 ['conc','Quem são os concorrentes e como é a aparência deles?','Cite 2 ou 3',0,'concorr|aparên|visual|cite'],
 ['ent','O que você precisa receber no final?',['Só logo e cores','Logo, cores e manual de marca','Modelos para redes sociais','Cartão e papelaria'],1,'receber|entreg|precisa|final|manual']],
 task:'Monte uma direção de identidade visual para este cliente: 1) leitura da marca (essência, tom de voz, diferenciais, públicos), usando só o briefing; 2) 3 conceitos de logo descritos em palavras (símbolo, tipografia, ideia); 3) paleta de cores com códigos HEX, uso e contraste de acessibilidade; 4) sugestão de tipografias (com opções gratuitas); 5) aplicações prioritárias; 6) o que entra no mini manual de marca; 7) checklist de registro (INPI e domínio) a conferir. Não copie marcas existentes. Fale só de identidade visual.'},
site:{c:'#FF5A00',name:'Site novo',desc:'Um site feito sob medida, rápido e pensado para gerar contatos.',
 sys:'Você é designer e desenvolvedor front-end de elite. Cria sites com identidade visual própria, nunca genéricos. Escreva textos reais em português do Brasil, sem lorem ipsum.',
 foco:'criação de site novo',
 qs:[['nome','Qual o nome do negócio ou da pessoa?','Como aparece no topo do site',0,'nome|neg|pessoa'],
 ['tipo','Que tipo de site você precisa?',['Página de vendas (landing page)','Site institucional','Portfólio','Loja ou catálogo','Link na bio'],0,'tipo|site|precisa'],
 ['oferta','O que você oferece e para quem?','Serviços ou produtos e o cliente ideal',0,'oferec|vend|quem|cliente|servi'],
 ['cta','Qual a ação principal que o visitante deve fazer?',['Chamar no WhatsApp','Preencher um formulário','Comprar','Agendar','Ligar'],1,'ação|visitante|fazer|contato|principal'],
 ['estilo','Qual o estilo visual?',['Moderno e minimalista','Ousado e colorido','Elegante e luxuoso','Tech e futurista','Aconchegante e humano'],1,'estilo|visual|aparên'],
 ['cores','Quais cores ou referências de marca você tem em mente?','Ex: azul e laranja, ou "como o site da Nubank"',0,'cor|referên|marca|paleta'],
 ['secoes','Que seções você quer?',['Sobre','Serviços','Depoimentos','Preços','Perguntas frequentes','Galeria','Mapa','Blog'],1,'seç|página|conteúdo|quer'],
 ['dom','Você já tem domínio e hospedagem?',['Tenho os dois','Só domínio','Não tenho nada'],0,'domínio|hospedagem|endereço'],
 ['cont','Os textos e as imagens já estão prontos?',['Sim, tudo pronto','Tenho parte','Preciso que criem'],0,'texto|imagem|foto|pront|conteúdo'],
 ['int','Precisa de alguma integração?','WhatsApp, formulário, pagamento, agendamento, blog... ou "nenhuma"',0,'integra|whats|pagamento|agenda|formul'],
 ['marca','Você já tem logo e cores definidas?',['Sim','Só o logo','Não'],0,'logo|cores|marca|identidade'],
 ['aprova','Quem fornece e quem aprova o conteúdo do site?','Nome ou função de quem envia textos e fotos e dá o "ok" final',0,'aprov|conteúdo|fornec|quem'],
 ['legal','Há requisitos de acessibilidade, privacidade ou segurança específicos?','Ex: formulário com consentimento, política de privacidade, "nenhum"',0,'acessib|privacid|segur|requisit'],
 ['prods','Quantos produtos e categorias, aproximadamente?','Ex: 40 produtos em 5 categorias',0,'produt|categor',A=>/loja|cat[aá]logo/i.test(A.tipo||'')],
 ['pgmeios','Quais formas de pagamento quer oferecer na loja?',['Pix','Cartão de crédito','Boleto','Link de pagamento'],1,'pagamento',A=>/loja|cat[aá]logo/i.test(A.tipo||'')],
 ['frete','Como será o frete e a entrega?','Frete fixo, tabela dos Correios, retirada, entrega local...',0,'frete|entrega',A=>/loja|cat[aá]logo/i.test(A.tipo||'')],
 ['estq','Há integração com estoque ou sistema de gestão?','Nome do sistema ou "não tenho"',0,'estoque|sistema|gest',A=>/loja|cat[aá]logo/i.test(A.tipo||'')],
 ['polit','Já existem políticas de entrega, troca e privacidade?',['Sim, todas','Algumas','Nenhuma ainda'],0,'polít|troca|entrega',A=>/loja|cat[aá]logo/i.test(A.tipo||'')],
 ['atual','Quem vai atualizar produtos e preços depois?',['Eu mesmo','Alguém da equipe','Preciso que a OR faça'],0,'atualiz|produto|preço',A=>/loja|cat[aá]logo/i.test(A.tipo||'')]],
 task:'Crie o site completo em UM único arquivo HTML (HTML+CSS+JS inline, responsivo, acessível, sem recursos externos). Design marcante e específico para este negócio, hero forte, seções completas com textos reais, botão de WhatsApp/CTA funcional e animações com propósito. Responda com uma frase curta (a direção de design escolhida e por quê) e depois TODO o código dentro de um único bloco ```html.\n\n'+SITE_REF+'\n'+SITE_REGRAS},
resite:{c:'#E6D96B',name:'Refazer meu site',desc:'Seu site atual está fraco ou velho? Refazemos e mantemos o que funciona.',
 sys:'Você é designer e desenvolvedor front-end de elite, especialista em redesenhar sites existentes: diagnostica o que está errado, mantém a identidade que funciona e entrega algo muito melhor. Escreva textos reais em português do Brasil, sem lorem ipsum.',
 foco:'refazer o site atual (redesign)',
 qs:[['nome','Qual o nome do negócio ou da pessoa?','Como aparece no topo do site',0,'nome|neg|pessoa'],
 ['url','Qual o endereço do site atual?','Ex: www.meusite.com.br. Se não tiver, escreva "sem site"',0,'endereço|site|url|link'],
 ['prob','O que não funciona hoje no seu site?',['Está lento','Está feio ou velho','Não funciona bem no celular','Ninguém entra em contato','Não aparece no Google','Difícil de atualizar'],1,'funciona|problema|site|hoje|errado'],
 ['manter','O que você quer manter do site atual?','Logo, cores, textos, fotos, seções, o endereço...',0,'manter|aproveitar|site atual|logo|cores'],
 ['plat','Em que o site atual foi feito?',['WordPress','Wix','Loja virtual (Shopify, Nuvemshop...)','Código próprio','Não sei'],0,'feito|plataforma|wordpress|wix|site atual'],
 ['estilo','Qual o novo estilo visual?',['Moderno e minimalista','Ousado e colorido','Elegante e luxuoso','Tech e futurista','Aconchegante e humano'],1,'estilo|visual|novo'],
 ['cores','Quais cores ou referências você quer para o novo visual?','Ex: manter o azul da marca, ou "como o site da Nubank"',0,'cor|referên|visual'],
 ['secoes','Que seções o novo site precisa ter?',['Sobre','Serviços','Depoimentos','Preços','Perguntas frequentes','Galeria','Mapa','Blog'],1,'seç|página|conteúdo|precisa'],
 ['cta','Qual a ação principal que o visitante deve fazer?',['Chamar no WhatsApp','Preencher um formulário','Comprar','Agendar','Ligar'],1,'ação|visitante|fazer|contato|principal'],
 ['int','Precisa de alguma integração?','WhatsApp, formulário, pagamento, agendamento, blog... ou "nenhuma"',0,'integra|whats|pagamento|agenda|formul'],
 ['acesso','Você tem acesso ao código, ao domínio e à hospedagem atuais?',['Tenho tudo','Só ao domínio','Não tenho acesso','Não sei'],0,'acesso|código|domínio|hospedagem'],
 ['migrar','Há conteúdo que precisa ser migrado para o novo site?','Páginas, produtos, posts, fotos... ou "nenhum"',0,'migr|conteúdo|transfer'],
 ['urls','Quais páginas atuais são importantes no Google e precisam de redirecionamento?','Endereços das páginas que trazem visitas, ou "não sei"',0,'url|págin|google|redirec']],
 task:'Refaça o site do cliente. 1) Comece com um diagnóstico curto: 5 problemas prováveis do site atual (com base no que o cliente contou) e como o novo site resolve cada um. 2) Crie o novo site completo em UM único arquivo HTML (HTML+CSS+JS inline, responsivo, acessível, sem recursos externos), mantendo o que o cliente pediu para manter, com design marcante e específico para este negócio, hero forte, seções completas com textos reais, botão de WhatsApp/CTA funcional e animações com propósito. Depois do diagnóstico, entregue TODO o código dentro de um único bloco ```html.\n\n'+SITE_REF+'\n'+SITE_REGRAS}
};
const TAREFAS={
 meta:[['Pedir acesso ao Gerenciador de Negócios da Meta (parceiro ou administrador), sem senha',1],['Instalar o Pixel e configurar os eventos',3],['Subir os criativos e as campanhas',5],['Primeira análise e ajuste de públicos',12],['Relatório do primeiro mês',30]],
 youtube:[['Pedir acesso ao canal por convite (gerente do canal), sem senha',1],['Configurar o canal: nome, descrição, banner, links e seções',3],['Definir o calendário de publicação das próximas 4 semanas',5],['Entregar os primeiros roteiros e thumbnails',10],['Revisar retenção e CTR dos primeiros vídeos e ajustar',21],['Relatório do primeiro mês',30]],
 local:[['Pedir acesso ao perfil do Google Meu Negócio (como gerente), sem senha',1],['Verificar o perfil e corrigir categorias, horários e contatos',3],['Subir fotos e as primeiras publicações',5],['Montar o link e a mensagem para pedir avaliações',7],['Responder às avaliações pendentes',10],['Relatório do primeiro mês',30]],
 press:[['Definir as pautas e os fatos que podem ser divulgados com o cliente',2],['Escrever o primeiro release e enviar para aprovação do cliente',7],['Enviar o release e acompanhar os retornos',12],['Montar o clipping das menções',30],['Relatório do primeiro mês',30]],
 brand:[['Reunião de briefing visual e aprovação do conceito',3],['Entregar as propostas de logo',12],['Rodada de ajustes',17],['Entregar arquivos finais e manual de marca',25]]
};
const COMUM=[['prazo','Para quando você precisa?',['O quanto antes','Em até 2 semanas','Em até 1 mês','Sem pressa']],
 ['inv','Quanto pretende investir no nosso trabalho?','Pode ser uma faixa. Por exemplo: de R$ 1.000 a R$ 2.000 por mês. A verba de anúncios, se houver, você já informou antes.',0],
 ['pgto','Como prefere contratar?',['Pagamento único','Mensal recorrente','Quero ver as opções']]];
Object.values(MODS).forEach(m=>m.qs.push(...COMUM));
// Direcionamento do "Descobrir o que eu preciso": perguntas fixas que dependem da 1ª resposta (empresa, YouTube ou criador)
const ehEmp=A=>/empresa|negócio/i.test(A.tipo||''),empExiste=A=>ehEmp(A)&&!/ainda vai/i.test(A.fase||''),
  ehYt=A=>/youtube/i.test(A.tipo||''),canalExiste=A=>ehYt(A)&&!/ainda vou/i.test(A.canal||''),ehCri=A=>/criador/i.test(A.tipo||''),
  naoExiste=A=>/ainda vai/i.test(A.fase||'')||/ainda vou/i.test((A.canal||'')+' '+(A.seg||''));
const DIRQ=[
 ['fase','A empresa já existe ou ainda vai ser criada?',['Já existe e funciona','Está abrindo agora','Ainda vai ser criada'],0,'',ehEmp],
 ['site','A empresa tem site?',['Sim, e funciona bem','Sim, mas está fraco ou velho','Não tenho'],0,'',empExiste],
 ['redes','Em quais redes sociais a empresa está?',['Instagram','Facebook','TikTok','LinkedIn','YouTube','Nenhuma'],1,'',empExiste],
 ['gads','A empresa já anuncia ou já anunciou no Google Ads?',['Anuncio hoje','Já anunciei, mas parei','Nunca anunciei'],0,'',empExiste],
 ['maps','A empresa aparece no Google Maps?',['Sim, e eu cuido do perfil','Aparece, mas ninguém cuida','Não aparece','Não sei'],0,'',empExiste],
 ['links','Mande os links que a empresa já tem.','Site, @ do Instagram... Se não tiver, escreva "nenhum"',0,'',empExiste],
 ['canal','O canal já existe?',['Existe e publico com frequência','Existe, mas está parado','Ainda vou criar'],0,'',ehYt],
 ['canalNome','Qual é o nome do canal?','Pode ser o nome ou o link. Ex: youtube.com/@seucanal',0,'',canalExiste],
 ['nicho','Qual é o nicho do canal?',['Games','Educação','Humor','Culinária','Beleza','Tecnologia','Finanças'],1,'',ehYt],
 ['insc','Quantos inscritos o canal tem hoje?',['Menos de 1.000','De 1.000 a 10.000','De 10.000 a 100.000','Mais de 100.000'],0,'',canalExiste],
 ['views','Quantas visualizações um vídeo seu costuma ter?',['Menos de 500','De 500 a 5.000','De 5.000 a 50.000','Mais de 50.000'],0,'',canalExiste],
 ['viewsT','Quantas visualizações o canal tem no total?',['Menos de 10 mil','De 10 mil a 100 mil','De 100 mil a 1 milhão','Mais de 1 milhão'],0,'',canalExiste],
 ['monet','O canal já é monetizado?',['Sim, já monetiza','Ainda não, mas quero chegar lá','Não é o meu foco'],0,'',canalExiste],
 ['rede','Em quais redes você está ou quer atuar?',['Instagram','TikTok','Kwai','Facebook','LinkedIn','YouTube'],1,'',ehCri],
 ['seg','Quantos seguidores você tem hoje (somando as suas redes)?',['Menos de 1.000','De 1.000 a 10.000','De 10.000 a 100.000','Mais de 100.000','Ainda vou começar'],0,'',ehCri]];
MODS.guia={c:'#FF5A00',oculto:true,name:'Descobrir o que eu preciso',desc:'Responda algumas perguntas e indicamos os serviços certos para o seu caso.',
 sys:'Você é estrategista de marketing digital para pequenos negócios e criadores no Brasil. Responda em português do Brasil, em Markdown.',
 foco:'descobrir quais serviços de marketing digital o cliente precisa',
 qs:[['tipo','Para quem é o trabalho?',['Para uma empresa ou negócio','Para um canal no YouTube','Para um perfil de criador de conteúdo (Instagram, TikTok)','Ainda não sei'],0,'quem|trabalho|para'],
 ['negocio','Conte em poucas palavras sobre o seu negócio ou o seu conteúdo.','Ex: barbearia no Méier, canal de culinária, loja de roupas online',0,'neg|conte|conteúdo|trabalh'],
 ['obj','O que você mais quer conseguir agora?',['Ter mais clientes e contatos','Vender online','Ser encontrado na minha cidade','Crescer nas redes sociais','Crescer o meu canal no YouTube','Aparecer na imprensa','Ter uma marca e um logo profissionais','Ter ou melhorar o meu site','Ainda não sei'],1,'conseguir|quer|objetiv|agora'],
 ['dor','Qual é o maior problema que você enfrenta hoje?',['Poucos clientes ou contatos chegando','Chegam contatos, mas poucos viram venda','Pouca gente conhece o meu negócio ou a minha marca','Concorrentes aparecem mais do que eu','Não consigo manter as redes sociais em dia','O meu site ou o meu visual não passam confiança','Não sei por onde começar'],1,'problema|dificuldade|enfrent|maior|hoje'],
 ['tem','O que você já tem hoje?',['Site','Logo e identidade visual','Perfil no Instagram, TikTok ou outra rede','Canal no YouTube','Perfil no Google Meu Negócio','Nada ainda'],1,'já tem|tem hoje|possui|hoje',A=>!ehEmp(A)&&!ehYt(A)],
 ['onde','Como os clientes ou seguidores chegam até você hoje?',['Indicação','Instagram ou TikTok','Google','WhatsApp','YouTube','Ainda não chegam'],1,'chegam|clientes|seguidor|hoje|encontr',A=>!naoExiste(A)],
 ['venda','Como o seu cliente compra de você hoje?',['Vai até a loja, consultório ou local','Chama no WhatsApp ou no Direct','Compra pelo site ou loja virtual','Pede um orçamento de serviço','Fecha parcerias ou publicidade (criadores)'],1,'compra|venda|cliente|fecha|contrat',A=>!ehYt(A)&&!naoExiste(A)],
 ['local','Quem você quer alcançar?',['Só pessoas da minha cidade ou região','O Brasil todo','Pessoas online, de qualquer lugar'],1,'alcançar|quem|cidade|brasil|online'],
 ['conteudo','Você já tem fotos, vídeos e textos do seu negócio?',['Tenho de tudo','Tenho só uma parte','Ainda não tenho'],0,'foto|vídeo|texto|conteúdo|material',A=>/redes|youtube|marca|site|nada/i.test((A.obj||'')+' '+(A.tem||''))],
 ['novidade','Você tem algum lançamento, evento ou novidade para divulgar?',['Sim, em breve','Talvez mais para frente','Não'],0,'lançamento|evento|novidade|divulg',A=>/imprensa/i.test(A.obj||'')||/já tenho|negócio/i.test(A.tipo||'')],
 ['verba','Quanto você consegue investir por mês em anúncios (só a verba, sem o nosso trabalho)?',FAIXA_VERBA,0,'verba|invest|mês|r\\$|orçament|valor']],
 task:'Faça um plano inicial para este cliente que não sabia o que precisava: explique em linguagem simples por que cada serviço sugerido faz sentido, em que ordem começar e o que esperar nas primeiras semanas, sem prometer resultado.'};
MODS.guia.qs.push(...COMUM);
const ansOf=qa=>{const A={};qa.forEach(x=>{if(x.tp)A[x.tp.split(':').pop()]=String(x.a||'')});return A};
function recomendar(qa){
  const A=ansOf(qa);
  const has=(id,t)=>String(A[id]||'').toLowerCase().includes(t.toLowerCase());
  const S={},W={},add=(k,p,why)=>{S[k]=(S[k]||0)+p;if(why)(W[k]=W[k]||[]).push(why)};
  const cidade=has('local','cidade')&&!ehYt(A)&&!ehCri(A),temSite=(has('tem','site')&&!has('tem','nada'))||has('site','sim'),temGmn=has('tem','google meu negócio')||has('maps','eu cuido');
  const comecando=has('fase','abrindo')||has('fase','ainda vai')||has('canal','ainda vou')||has('seg','ainda vou');
  if(has('obj','mais clientes')){add('ads',3,'Você quer mais clientes: os anúncios no Google alcançam quem já está procurando o que você vende.');add('meta',2,'Os anúncios no Instagram e Facebook colocam a sua oferta na frente de mais gente.')}
  if(has('obj','vender online')){add('ads',3,'Para vender online, o Google mostra a sua oferta para quem está pronto para comprar.');add('meta',3,'Instagram e Facebook vendem bem com anúncios e com remarketing.');if(!temSite)add('site',3,'Para vender online você precisa de um lugar seu, como um site ou uma loja.')}
  if(has('obj','encontrado')){add('local',5,'Você quer ser encontrado na sua cidade: o perfil no Google Maps é o caminho mais direto.');add('ads',1)}
  if(has('obj','redes')){add('social',5,'Você quer crescer nas redes: conteúdo planejado e constante é a base.');add('meta',1)}
  if(has('obj','youtube'))add('youtube',6,'Você quer crescer no YouTube: cuidamos do canal, dos vídeos e do crescimento.');
  if(has('obj','imprensa'))add('press',6,'Você quer aparecer na imprensa: preparamos releases, pautas e o contato com jornalistas.');
  if(has('obj','marca'))add('brand',6,'Você quer uma marca profissional: logo, cores e manual de marca.');
  if(has('obj','site'))temSite?add('resite',5,'Você já tem site e quer melhorá-lo: refazemos mantendo o que funciona.'):add('site',5,'Você quer ter um site: uma página própria dá credibilidade e recebe os contatos.');
  if(has('tipo','criador')){add('social',3,'Como criador de conteúdo, as redes sociais são o centro do seu trabalho.');add('youtube',1)}
  if(comecando)A.tem?(!has('tem','logo')&&add('brand',3,'Você está começando e ainda não tem logo e identidade: uma marca clara ajuda em tudo.')):add('brand',2,'Você está começando: uma marca clara desde o início ajuda em tudo.');
  if(comecando&&(has('tem','nada')||has('redes','nenhuma')))add('social',3,'Para começar, uma presença básica e organizada nas redes ajuda as pessoas a te encontrarem e a confiarem em você.');
  if(cidade&&!temGmn)add('local',3,'Você atende pessoas da sua região e ainda não tem perfil no Google Meu Negócio.');
  if(!temSite&&(has('obj','mais clientes')||has('obj','vender online')))add('site',2,'Hoje você ainda não tem site: anúncios e redes funcionam melhor levando a pessoa para um lugar seu.');
  if(ehYt(A)){add('youtube',8,'O trabalho é para o seu canal: cuidamos da estratégia, dos vídeos e do crescimento.');if(has('monet','quero'))add('youtube',1,'Você quer monetizar: o plano inclui o caminho até a monetização, conforme as regras do YouTube.')}
  if(has('site','fraco'))add('resite',4,'A empresa tem site, mas ele está fraco ou velho: refazemos mantendo o que funciona.');
  if(empExiste(A)&&has('site','não tenho'))add('site',2,'A empresa ainda não tem site: uma página própria dá credibilidade e recebe os contatos.');
  if(has('gads','anuncio hoje'))add('ads',2,'Você já anuncia no Google: revisamos as campanhas e ajustamos onde a verba está indo.');
  if(has('gads','parei'))add('ads',2,'Você já anunciou no Google e parou: retomamos com campanhas ajustadas à sua verba.');
  if(has('maps','ninguém cuida')||has('maps','não aparece'))add('local',3,'A empresa não está bem cuidada no Google Maps: o perfil no Google ajuda quem está perto a te encontrar.');
  if(empExiste(A)&&has('redes','nenhuma'))add('social',2,'A empresa ainda não está nas redes: uma presença básica ajuda os clientes a confiarem em você.');
  if(has('verba','Até R$ 500')){add('ads',-3);add('meta',-3);add('social',1,'Com pouca verba para anúncios, vale começar pelo que não depende dela: conteúdo e presença local.');add('local',1)}
  if(has('dor','Poucos clientes')){add('ads',2,'Hoje chegam poucos contatos: anúncios trazem gente que já está procurando o que você faz.');if(cidade)add('local',2);add('social',1)}
  if(has('dor','poucos viram venda')){add(temSite?'resite':'site',2,'Os contatos chegam, mas poucos viram venda: o que a pessoa vê depois do clique precisa convencer.');add('meta',1,'Anúncios de remarketing trazem de volta quem já demonstrou interesse.')}
  if(has('dor','Pouca gente conhece')){add('social',2,'Pouca gente conhece o seu negócio: conteúdo constante faz a marca ser lembrada.');add('brand',1);add('press',1,'A imprensa ajuda a marca a ser conhecida e ganhar credibilidade.');if(cidade)add('local',2)}
  if(has('dor','Concorrentes')){if(cidade)add('local',3,'Os concorrentes aparecem mais: o perfil no Google e as avaliações ajudam você a ser visto primeiro na sua região.');add('ads',2)}
  if(has('dor','manter as redes'))add('social',4,'Manter as redes em dia toma tempo: nós planejamos e produzimos o conteúdo para você.');
  if(has('dor','site ou o meu visual')){add(temSite?'resite':'site',3,'O seu site ou o seu visual não passam confiança: uma cara nova e clara muda a primeira impressão.');add('brand',2,'Uma identidade visual profissional dá confiança em tudo o que você publica.')}
  if(has('venda','site ou loja virtual')){add('ads',1);if(!temSite)add('site',3,'Você vende pelo site, mas ainda não tem um: ele é a base do seu negócio online.')}
  if(has('venda','parcerias')){add('social',2,'Para fechar parcerias, o seu perfil e o seu conteúdo são a sua vitrine.');add('youtube',1)}
  if(has('novidade','Sim'))add('press',4,'Você tem uma novidade para divulgar: um release bem escrito pode virar notícia.');
  let ord=Object.keys(S).filter(k=>MODS[k]&&!MODS[k].oculto).sort((a,b)=>S[b]-S[a]);
  let pick=ord.filter(k=>S[k]>=3).slice(0,3);
  if(!pick.length&&ord.length&&S[ord[0]]>0)pick=[ord[0]];
  if(!pick.length){const k=has('tipo','criador')?'social':(cidade?'local':'site');pick=[k];(W[k]=W[k]||[]).push('Para começar, é a base de uma presença digital organizada. Vamos refinar com você.')}
  if((pick.includes('ads')||pick.includes('meta'))&&!temSite&&!pick.includes('site')&&pick.length<3){pick.push('site');(W.site=W.site||[]).push('Os anúncios funcionam melhor levando a pessoa para um lugar seu, como um site.')}
  return pick.map(k=>({k,why:(W[k]||[]).slice(0,2)}));
}