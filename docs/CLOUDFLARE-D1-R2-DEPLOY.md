# OR Marketing Digital: Cloudflare D1, R2 e Pages

## Implementado na branch de desenvolvimento
- Migração SQL para clientes, briefings, posts, calendário, identidade visual, usuários, sessões, arquivos e auditoria.
- Pages Functions com armazenamento D1, arquivos R2 e proxy para IA.
- Portal de cliente com sessão HttpOnly e controle de leitura por cliente.
- Sincronização do painel atual com banco e arquivos da nuvem, preservando os dados locais.

## Ativar na sua conta Cloudflare

1. Em Storage & databases > D1, crie o banco or-marketing-db.
2. Em Storage & databases > R2, habilite o serviço e crie o bucket privado or-marketing-assets. A ativação de faturamento, se solicitada, deve ser autorizada pelo titular da conta.
3. Em Workers & Pages > Create > Pages > Connect to Git, autorize o repositório GabrielEfraime/or-marketing-digital-site, com branch de produção main.
4. Build command: npm run montar. Output directory: dist. Root directory: /.
5. No projeto Pages > Settings > Bindings, associe D1 com o nome DB e o bucket R2 com o nome ASSETS. Use bindings separados para ambientes de Preview e Production.
6. Em Variables and Secrets, cadastre OPENAI_API_KEY, GEMINI_API_KEY, GROQ_API_KEY e ADMIN_TOKEN (aleatório, 32+ caracteres) como Secrets. Não envie nem grave essas chaves em Git.
7. Rode a migração em banco vazio com o comando abaixo no seu computador autenticado com Wrangler:

    npx wrangler d1 execute or-marketing-db --remote --file=migrations/0001_or_cloudflare.sql

8. Teste no Preview antes de enviar para main. Ao conectar Pages ao GitHub, commits em main geram deploys automaticamente.

## Primeiro administrador

O painel atual conserva o token legado como transição. Não compartilhe ADMIN_TOKEN com clientes. Para cadastrar o primeiro administrador, faça POST /api/cloud/auth/bootstrap autenticado com X-OR-Token e um JSON com email e password (senha com 12+ caracteres). Exemplo de corpo:

    {"email":"seu-email@exemplo.com","password":"SENHA_TEMPORARIA_FORTE"}

O portal de clientes será publicado em /portal.html. A primeira autenticação exige trocar a senha. Administradores podem criar acessos para clientes, staff ou outro administrador pelo portal. Para clientes, informe o ID do projeto.

## Rotas de dados

- POST /api/lead: briefing público com consentimento e limite por IP.
- GET /api/cloud/clients: projetos do administrador/equipe, ou somente o projeto do cliente.
- PUT /api/cloud/clients: atualização do projeto, posts, calendário e identidade visual (admin/equipe).
- GET /api/cloud/clients/:id/briefings: briefings associados.
- GET /api/cloud/clients/:id/posts: peças do cliente.
- GET /api/cloud/clients/:id/calendar?month=AAAA-MM: calendário.
- GET /api/cloud/clients/:id/identity: identidade visual.
- GET/PUT/DELETE /api/cloud/assets/:id/marca ou arte:POST_ID: arquivos no R2; clientes só podem ler.
- POST /api/ia: geração de IA pelo servidor (não expõe chave ao visitante).
- POST /api/cloud/auth/login, GET /api/cloud/auth/me, PUT /api/cloud/auth/password, POST /api/cloud/auth/logout e POST /api/cloud/auth/users.

## Restrições e testes obrigatórios

- Nenhum deploy ou recurso Cloudflare está confirmado como criado por este commit. A conexão GitHub/Cloudflare e o faturamento do R2 exigem autorização na Cloudflare.
- O PIN local do painel antigo não substitui autenticação de servidor. Administrador continua usando token legado durante a transição.
- Dados locais são preservados e sincronizados gradualmente. Sincronização não é colaboração em tempo real, e conflitos devem ser revisados.
- Posts, calendário e identidade ainda são editados pelo fluxo atual do site e enviados como parte do projeto. A API também os indexa em tabelas D1.
- Fotos e logos do editor têm suporte R2. Outros anexos/HTML no IndexedDB não foram migrados.
- Não há publicação automática no Instagram. A aprovação e publicação continuam manuais.
- Retenção de 90 dias, backup anual, exportação/exclusão LGPD, autenticação de equipe no painel antigo e testes completos de segurança são etapas pendentes.
- Validar no Preview com D1/R2 de verdade: submissão do briefing, recuperação em outro navegador, login, troca de senha, bloqueio entre clientes, upload e download R2, IA streaming, calendário, recuperação de falhas e testes de segurança antes de lançar.
