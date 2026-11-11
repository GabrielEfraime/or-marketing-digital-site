# Relatório do Gerente Geral: governança de IA (fases 1 a 4)

Data: 11/11/2026. **Status real: diagnóstico e documentação concluídos como PROPOSTA. Nada foi implantado, nenhum controle técnico novo foi criado e nada foi enviado ao `main`.** Detalhes de vulnerabilidade ficam em documento interno do dono, não neste repositório público.

## A. Diagnóstico inicial
- **Agentes de desenvolvimento (12):** cada um tem regras próprias boas, mas nenhum tem restrição técnica de ferramentas; todos herdam o acesso da sessão. O "somente leitura" de pesquisador, testador e dev-segurança é só texto. Não há hooks nem regras de permissão. A branch `main` não tem proteção no GitHub.
- **Regras duplicadas** entre `AGENTS.md`, o `CLAUDE.md` da raiz (fora do repositório) e vários agentes; agentes ficam fora do repositório (sem versão, invisíveis ao Codex).
- **Referência quebrada:** seis agentes mandam seguir o `METODO.md` "na raiz", mas ele só existe na branch `claude/metodo-integrado`, ainda não publicada.
- **IAs dentro do app:** boa base técnica (IA só no clique, preço só da tabela por código, HTML da IA em iframe isolado, revisão humana antes de qualquer envio, chaves cifradas, CSP). Lacunas principais: sem níveis de autonomia no código, sem fonte única de políticas, sem registro de cada chamada de IA, neutralização de prompt injection só no Site Studio, retenção de 12 meses sem execução automática, sem teto de gasto em APIs pagas.

## B. Agentes identificados
Desenvolvimento: gerente-geral, pesquisador, desenvolvedor, web-designer, copywriter, gestor-de-trafego, vendedor, contador, analista, testador, dev-seguranca, atendente (+ Codex como revisor independente). No app: IA 1 (criação), IA 2 e IA 3 (estratégia, atendimento, captação), Gemini (reserva e imagem), Pollinations (imagem), além de cerca de 20 pontos de prompt (orçamento, mensagem, estratégia, kits, relatório, posts, captação, RH, Site Studio).
**Sem agente hoje:** assessoria e crises, branding, redes sociais (calendário, comunidade, métricas), SEO e back-end, auditoria de qualidade independente, segurança operacional. TikTok falta no tráfego pago.

## C. Regras implementadas
| Item | Status |
|---|---|
| Manual geral de governança | **desenvolvida** (`GOVERNANCA-IA.md`), não aprovada |
| Manuais de especialidade | **desenvolvida** (`ESPECIALIDADES.md`), não aprovada |
| Biblioteca de conformidade | **desenvolvida**, **sem fonte verificada** (`CONFORMIDADE.md`) |
| POPs | **desenvolvida** (`POPS.md`), não aprovada |
| Plano de testes | **desenvolvida**, **nenhum teste executado** |
| Método de design e marketing nos prompts e agentes | desenvolvida e testada em função pura (branch `claude/metodo-integrado`), não publicada |
| Controles técnicos (permissões, hook, proteção de branch, registro de chamadas, teto de gasto) | **planejada**, nada feito |

## D. Regras pendentes e por quê
Todas as travas técnicas dependem de decisão do CEO (alteram permissões da máquina, do GitHub ou o comportamento do app). Referências legais dependem de consulta às fontes oficiais e de revisão jurídica. Os agentes novos dependem de aprovação do desenho.

## E. Procedimentos criados
POP-GOV-001, MKT-001, ASS-001, TRF-001, WEB-001, BRD-001, SOC-001, QLD-001, SEG-001, IA-001, com fluxo de aprovação em 3 níveis e matriz de permissões (proposta).

## F. Segurança
Verificado por leitura de código e de configuração (inventário). **Não houve teste de invasão nem execução dos testes de comportamento.** Riscos que permanecem: agentes sem restrição técnica, `main` sem proteção, injeção de prompt fora do Site Studio, retenção sem automação, dado de cliente enviado a provedores sem aviso por chamada, mensagem comercial fria sem checagem de consentimento, imagem de cliente enviada ao Google sem constar na política. Detalhes em documento interno.

## G. Testes
`npm run verificar` passa com os testes do projeto (86 na branch integrada). Os 16 cenários do plano de testes de comportamento: **não executados**.

## H. Compatibilidade
Nenhuma funcionalidade foi alterada nesta etapa (só documentos). O app continua como antes.

## I. Aprovações necessárias do CEO
1. Aprovar o desenho de governança (níveis, matriz, agentes novos).
2. Autorizar travas técnicas: regras de permissão e hook nesta máquina; `tools` mínimas por agente; proteção do `main` e CI obrigatório no GitHub; teto de gasto das APIs.
3. Autorizar mudanças no app: registro de cada chamada de IA, neutralização de injeção em todas as chamadas, expiração de leads, aviso ao consultor sobre dado que vai ao provedor.
4. Contratar revisão jurídica dos pontos de `CONFORMIDADE.md`.
5. Decidir sobre o `METODO.md` e as branches pendentes (publicar `claude/metodo-integrado`).

## J. Próximas ações
1. Publicar o método (`claude/metodo-integrado`) para corrigir a referência quebrada.
2. Mover as definições dos agentes para o repositório e remover duplicação (um bloco "regras para todos").
3. Criar os agentes ausentes.
4. Implantar, em ambiente controlado, as travas técnicas aprovadas e rodar os 16 testes.
5. Verificar as referências legais nas fontes oficiais.
6. Relatório final de implantação.

## Atualização de 11/11/2026 (após aprovação do desenho pelo CEO)
| Item | Status |
|---|---|
| Desenho de governança (níveis, matriz, agentes) | **aprovado** pelo CEO |
| Registro central de chamadas de IA (só metadados, 300 entradas, painel na tela IAs) | **desenvolvida e testada** em função e no navegador com `fetch` simulado (commit `0c0eda2`); **não publicada** |
| Neutralização de prompt injection em todas as chamadas de IA | **desenvolvida e testada** em função (`brief`, `ctxCliente`) e por leitura de código; **não publicada** |
| Testes novos | 91 testes passam; nenhuma IA real foi chamada |
| Travas de permissão, ferramentas por agente, hook, proteção do `main` | **planejada** (`TRAVAS-PROPOSTAS.md`), aguardando OK separado do CEO |
| Teto de gasto, expiração de leads, texto da política de privacidade | **pendente** de decisão do CEO |
