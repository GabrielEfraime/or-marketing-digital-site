# Plano: Supabase como banco, login e armazenamento (Fase 2)

Projeto Supabase: `uuxpnrmajxduoufcnwpg`. Situação em 02/11/2026: plano aprovado com as decisões abaixo; nada foi implementado.

## Decisões dos donos (02/11/2026)

- Supabase vai ser o banco, o login e o armazenamento de arquivos.
- Quem entra na Minha área: os **dois donos**, ambos com acesso a tudo. Não há papéis com acesso limitado por enquanto. A tabela `equipe` já guarda o papel de cada pessoa, para criar papéis de funcionário no futuro sem refazer o banco. O portal do cliente fica para depois.
- Login: e-mail, senha e 2FA (código de 6 dígitos de um app autenticador).
- O PIN sai: o login substitui.
- O Supabase é a fonte principal dos dados. O navegador guarda uma cópia para abrir rápido e funcionar sem internet, e o backup no HD continua opcional.
- **Tudo continua no site, como é hoje** (pedido dos donos):
  - a Minha área fica no mesmo site e no mesmo endereço, com as mesmas seções separadas (Leads, Captar clientes, Dashboard, Acompanhamento, Vagas, Base da IA e IAs) e as mesmas telas;
  - não existe outro painel nem outro acesso para ver os dados, e os donos não precisam abrir o painel do Supabase no dia a dia;
  - o Supabase fica só por trás, guardando;
  - a divisão do lead em tabelas é interna: na tela, o lead aparece inteiro, como hoje.

## Arquitetura

- **Site público:** continua estático no Cloudflare Pages.
- **Visitantes** (briefing e cadastro de vagas):
  - os dados vão para uma função do Cloudflare, que mantém o limite de envios por IP;
  - a função grava no Supabase com a chave secreta, guardada só como segredo no Cloudflare;
  - o visitante nunca fala direto com o banco.
- **Minha área:**
  - fala direto com o Supabase (Auth, banco e Storage) por `fetch`, sem biblioteca e sem CDN;
  - a CSP ganha só o endereço `https://uuxpnrmajxduoufcnwpg.supabase.co`;
  - a chave publicável do Supabase vai no HTML: ela é pública por natureza e a proteção vem do RLS;
  - a chave secreta nunca entra no código.
- **RLS em todas as tabelas:** só quem está na equipe, logado e com o 2FA conferido (`aal2`) lê e grava, e cada papel vê só o que pode.
- **Função da IA:** passa a conferir o login do Supabase e o papel da pessoa, em vez do `ADMIN_TOKEN`.
- **Convidar e remover pessoas da equipe:** por uma função do Cloudflare que só os donos usam.

## Banco

Cada parte guarda o objeto do app em JSON (`dados`), com `id` e `t`. Algumas colunas ficam separadas para filtrar: status, nome e datas. A mesclagem continua pelo maior `t`.

Antes de gravar, o app divide o lead em três partes e, ao ler, junta de novo. Na memória o lead continua sendo o mesmo objeto de hoje, então o resto do código muda pouco.

| Tabela | O que guarda | Seção da permissão |
|---|---|---|
| `leads` | contato, briefing, status, resumo e estratégia | `leads` |
| `orcamentos` | pacotes e valores, mensagens, envios e plano escolhido (1 por lead) | `orcamentos` |
| `acompanhamento` | tarefas, produção, métricas e relatórios (1 por lead) | `acompanhamento` |
| `prospects` | captação de clientes | `captacao` |
| `vagas` / `candidatos` | vagas e banco de talentos | `vagas` |
| `atividades` | registro de atividades (quem fez o quê) | conforme a seção do registro |
| `config` | configuração, preços e base da IA, **sem** chaves de IA | `config` |
| `equipe` | `user_id`, nome, papel e se está ativo | `equipe` |
| `permissoes` | papel × seção × nível (`nenhum`, `ver`, `editar`, `tudo`) | `equipe` |

## Base de acessos futuros (decidido em 02/11/2026: fazer na fase 1)

- **Permissões numa tabela** (`permissoes`), e não escritas em cada regra:
  - toda regra de acesso (RLS) chama a mesma função, `pode(secao, nivel)`;
  - a função confere se a pessoa está ativa na `equipe`, passou pelo 2FA (`aal2`) e tem o nível pedido para aquela seção;
  - criar um papel novo é só cadastrar linhas em `permissoes`, sem reescrever as regras.
- **Partes sensíveis separadas:**
  - orçamento e acompanhamento ficam fora do lead, então um papel futuro pode ver o briefing sem ver os valores;
  - os currículos têm balde próprio.
- **No login, a Minha área lê as permissões** da pessoa e mostra só as seções liberadas.
- **Hoje** só existe `dono = tudo`, em todas as seções.
- **Depois**, quando houver contratação: a tela "Equipe", com a tabela de permissões e o convite por e-mail. Não precisa mexer no banco.
- **Portal do cliente** (cliente vendo o próprio acompanhamento): fica numa fase separada. O banco já comporta, porque o acompanhamento tem tabela própria.

## Armazenamento (baldes privados, abertos só por link temporário)

- **`curriculos`:** currículos do cadastro de vagas, que hoje ficam só no IndexedDB deste navegador.
- **`arquivos`:** versões dos sites gerados e exemplos, que hoje ficam no IndexedDB `or-arquivos`.
- As regras dos baldes usam a mesma função `pode()`: `curriculos` exige a seção `vagas`, e `arquivos` exige a seção `acompanhamento`.

## Papéis (confirmado em 02/11/2026)

- Só existe o papel `dono`, e os dois donos têm acesso a tudo: leads, orçamentos, captação, dashboard, acompanhamento, vagas e currículos, Base da IA, IAs, preços, equipe e apagar dados.
- O RLS confere tudo pela função `pode()` (ver "Base de acessos futuros"): pessoa ativa na `equipe`, logada, com o 2FA conferido (`aal2`) e com o nível da seção. O papel `dono` tem `tudo` em todas as seções.
- Papéis de funcionário (atendimento, produção, RH etc.) serão definidos pelos donos quando houver equipe. Até lá, ninguém além dos dois entra.

## Fases

Em cada fase: prints, testes e aprovação antes da próxima.

1. **Login e banco.**
   - Tabelas (com o lead dividido em três), tabela de permissões e função `pode()`, RLS, login com 2FA e saída do PIN.
   - A Minha área mostra só as seções liberadas; para os donos, tudo.
   - Convite dos dois donos por e-mail.
   - A Minha área passa a ler e gravar os leads no Supabase, com cópia local.
2. **Visitantes.**
   - Briefings e cadastros de vagas vão direto para o Supabase.
   - Saem o KV e o botão "Buscar briefings do site".
   - A função da IA passa a conferir o login.
3. **Arquivos.** Currículos e arquivos vão para o Storage.
4. **Migração e LGPD.**
   - Os dados deste navegador sobem para o Supabase, uma vez.
   - A política de privacidade passa a citar o Supabase e a região dos dados. O texto vai para aprovação do dono.
   - Os dados passam a ser apagados automaticamente depois de 12 meses.

## Antes da fase 1 (donos)

- Fazer o login do MCP do Supabase (`claude` → `/mcp` → supabase → Authenticate) com a conta dona do projeto.
- Passar os e-mails dos dois donos, para o convite.
- Conferir a região do projeto: São Paulo é a preferida, para os dados ficarem no Brasil.
- Pôr a chave secreta do Supabase como segredo no Cloudflare (`SUPABASE_SECRET_KEY`). Ela não passa pelo chat.

## Riscos conhecidos

- Duas pessoas editando o mesmo lead ao mesmo tempo: vence a última gravação (pelo `t`). Mais tarde dá para avisar em tempo real quem está editando.
- Sem internet, a Minha área abre a cópia local, e as mudanças sobem quando a conexão voltar.
