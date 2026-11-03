# Revisão e produção a partir do briefing — 03/11/2026

## Escopo implementado nesta branch
- Quadro de demandas dentro da Minha área, vazio na primeira abertura. Não importa dados de Trello ou Canva.
- Novas demandas de cliente vinculadas ao briefing inicial; proposta de até seis demandas pela IA respeita os serviços selecionados.
- Etapas, arrastar e soltar, alternativa por select para teclado/toque, responsável, prazo, checklist, arquivamento e histórico.
- Editor interno ligado à demanda: textos, cores, fontes, composição, posição/tamanho do título, até dez slides e PNG. Corrigidos índice do slide e texto das prévias.
- Assistente por setor com contexto explícito, streaming e cancelamento. Entregas de cliente exigem briefing; gestão, base, captação e RH também oferecem orientação interna sem dados pessoais.
- Perguntas de materiais autorizados, tempo de aprovação e datas confirmadas no briefing; deduplicadas entre módulos. Social pergunta formatos e identidade.
- Adaptação de perguntas com IA no clique de “Começar”, quando houver credencial local ou sessão de servidor disponível, com opção explícita e fallback padrão.
- Backup do quadro no download geral, exportação própria e pasta de backup. Imagens continuam no IndexedDB, como já ocorria no editor; não estão incluídas no JSON.
- Servidor limita bytes durante a leitura e valida cada redirecionamento ao ler sites.

## Canva opcional
A integração só cria imagens novas em /api/canva/gerar, consulta a mesma tarefa e recebe o arquivo pelo servidor. Não há listagem de designs nem importação da conta. A imagem é um bitmap; textos dentro dela não viram camadas editáveis. O editor interno mantém seus próprios textos editáveis.

Para ativar, a implantação precisa de uma autorização Canva própria com asset:write e capacidade image_generation. O adaptador espera CANVA_ACCESS_TOKEN como segredo do Cloudflare. Ele é um token temporário: OAuth e renovação automática não estão implementados nesta etapa. O acesso do Canva no chat não fornece essas credenciais ao site. Não cole tokens em GitHub ou em conversas.

A API de geração está em preview e pode não estar disponível à integração/conta. Sem autorização, o botão apresenta indisponibilidade; não anuncia conexão ativa. Créditos são consumidos apenas no pedido explícito de geração. A chave de idempotência é mantida na demanda para não criar outra tarefa ao consultar novamente.

Referências oficiais:
- https://www.canva.dev/docs/apps/rest-apis/reference/generations/create-image-generation-job/
- https://www.canva.dev/docs/apps/rest-apis/authentication/

## Validação e limites
O ambiente local não inicia shell nem Node: “MXC launcher: enumerate MXC volume I: ... os error 1”. A validação usa os checks reais do GitHub (npm run verificar, que monta e testa), em Node 20 e 22. O teste adicionado compila o JavaScript concatenado.

Ainda é necessário revisar visualmente no navegador (desktop e celular), testar IA real e Canva autorizado. Não é uma auditoria de segurança independente completa. A autenticação existente por token compartilhado/PIN continua com os limites documentados no projeto. A validação de URL recusa IPs e nomes locais, mas não implementa resolução DNS própria contra rebinding.

O quadro e os arquivos usam o armazenamento do navegador; não há sincronização multiusuário. Não houve importação de dados externos. Um quadro privado foi criado no Trello durante a interpretação inicial e não está ligado ao site: https://trello.com/b/KQaMVKAM/or-marketing-digital-demandas .
