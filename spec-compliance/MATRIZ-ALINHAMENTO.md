# Matriz de alinhamento: requisito x código x teste x situação

Data: 2026-11-08 · 64 testes passando. Arquivos em `src/js/` com o prefixo `48-site-studio-` (projetos, analise, site, versoes, proposta, tela), mais `48-cofre-site.js` e as integrações citadas. Linhas não são citadas porque mudam a cada edição: use o nome da função.
**Situação:** A = atendido · A* = atendido com ressalva · P = parcial. Detalhes das ressalvas e parciais em `REPORT.md`, seção 3.
**Manual** = verificado à mão no navegador (Chrome), com ou sem a Groq real.

| ID | Onde no código | Teste automatizado | Manual | Sit. |
|---|---|---|---|---|
| SS-001 | tela `doprosp` → `ssCriar` (projetos) com nome, cidade, site, Instagram, prospect | `ssNovo` e cidade: "o projeto guarda a cidade…" | Criado do prospect na homologação | A |
| SS-002 | tela `criar`, `ssEntrada` (analise) | "campo site ou Instagram entende…", "projeto novo nasce…" | Criado à mão | A |
| SS-003 | `ssPorLead`/`ssPorProsp` (projetos); link em `paintDet` (22) e na ficha do prospect (48-captacao); botão "Abrir o lead" na tela | "ao virar lead… navega nos dois sentidos" | Os dois links abrem o projeto | A |
| SS-004 | `capVirarLead` → `ssAoVirarLead`; `doprosp` passa o lead já existente | "prospect com projeto não duplica", "ao virar lead…" | "Fechou" ligou sem duplicar | A |
| SS-005 | `ssEvento`, `ssRegistra`; eventos criado, etapa, lead, análise, versão, proposta | "mudar etapa e ligar o lead entram no histórico" | Histórico exibido (30 últimos; teto 200) | A |
| SS-006 | `ssAplica`; seletor de etapa na tela; nenhuma mudança automática | "conformidade: … etapas só mudam pela mão" | Etapa não mudou ao analisar | A |
| SS-007 | `ssFatos`, `ssDadosFato`; sem `fetch` no Studio | "fatos não levam telefone…" | Aba de rede vazia ao abrir | A |
| SS-008 | `ssParseAnalise` (fato com fonte válida ou inferência), `ssAnaliseHtml` | "análise separa fato de inferência" | Real com a Groq | A |
| SS-009 | `ssPromptAnalise` (lista `faltando`, "não informado") | "resposta fora do JSON…" | Real: 8 itens "não informado" | A |
| SS-010 | `ssParseAnalise` (números e palavras como prêmio, depoimento, "há N anos" fora dos fatos); `ssPropostaHtml` exclui | "número que não está nos fatos…", "afirmação de prêmio…" | Amostras | P |
| SS-011 | `ssNeutraliza` (tags, largura total, invisíveis) | "texto colado não consegue fechar…", "separadores disfarçados…" | Amostra com "ignore as regras" | A |
| SS-012 | `ssAnalisar`, `ssRodaIA`, botão `retry`, rascunhos em `ssPaint`; `askF` com reserva | — (UI) | Falha simulada: retry repete a ação certa e o rascunho fica | A |
| SS-013 | chips de modo; `ssPedidoSite` | "pedidos à IA… redesenhe" | Sim | A |
| SS-014 | `ssPedidoSite` (1 a 5 seções, âncoras); `ssChecaEstrutura` avisa | "estrutura do site…" | Real: 5 seções e menu | P |
| SS-015 | `ssSemExternos`; iframe `sandbox` sem `allow-same-origin` | "perde tudo que vem de fora…", "src externo escondido…" | Prévia sem JS por padrão | A |
| SS-016 | `ssBlindaExport`, `ssBaixaHtml` (em vez de `sanitizaHtml`) | — (precisa de DOM) | 3 revisões, ~70 payloads | A* |
| SS-017 | `ssMonta` (marcadores), `ssExtraiHtml` descarta contato da IA; `mostraWa` | "contato escrito pela IA…", "o app põe links…", "WhatsApp só com marca" | Sim | P |
| SS-018 | `ssMonta` e `ssBlindaUma(faixa)`: faixa e `noindex` por DOM | "o app põe links, fotos, faixa…", "a IA não consegue assinar a faixa" | Faixa 1º elemento, 4 truques testados | A |
| SS-019 | `ssChecaAcess` (avisa; não mede contraste nem 44px) | "checagem de acessibilidade aponta…" | Real: sem avisos | P |
| SS-020 | `ssRodaIA`, `ssGuardaVersao` | "limite de versões…" | Real: v1 e v2 | A |
| SS-021 | `ssProg` atualiza só o texto durante o streaming | — | Sim | A |
| SS-022 | `ssVizinha`, `ssIrVersao`, versões com data, pedido, IA (`IA_QUEM`) | "desfazer e refazer…", "abrir versão…" | Real: IA registrada (inclusive a reserva) | A |
| SS-023 | `ssDiff`, `ssComparaVersoes` | "comparar versões mostra só as linhas…" | Real: 142 a mais, 61 a menos | A |
| SS-024 | `ssExtraiHtml` (cortado, curto, sem estrutura ou > 60 mil recusado) | "resposta cortada, curta ou sem estrutura…" | Falha simulada mantém a versão | A |
| SS-025 | `ssParaDescartar`, `ssConfereLimite`, `SS_VERS_LIM=30` (valor provisório) | "limite: sai a mais antiga…", "ao chegar no limite…" | Cancelar e confirmar | A |
| SS-026 | `ssPropostaHtml` | "o documento traz a identidade…" | Prévia vista | A |
| SS-027 | `ssValores`, `ssConfereSoma`, `calcOrc`, "a confirmar" | "valores dos pacotes…", "item avulso sem valor…", "total do recomendado…" | Sim | A |
| SS-028 | `ssPromessas`; bloqueio de exportar; pontos da IA que prometem saem | "aviso de promessa pega…", "pontos… ficam fora da proposta" | Exportar bloqueou | A |
| SS-029 | `ssPropostaHtml` (tokens Earthen Luxe, VMARK) | "o documento traz a identidade…" | Logo e cores vistos | A |
| SS-030 | `ssAcaoProposta`, marca "revisei", `ssPontosHtml` (editar a análise) | — (UI) | Marca cai ao editar | A |
| SS-031 | `ssExportaProposta` registra em `exportadas` e no histórico (ao clicar) | "dados da proposta e das exportações…" | Impressão não exercitada | A |
| SS-032 | `esc()` em tudo; sem `innerHTML` com texto cru nos arquivos do Studio | "o documento… escapa texto" | `<img onerror>` nos campos: nada executou | A |
| SS-033 | `cofre()` em `scripts/montar.mjs`; `verificar` (regex de chaves) | "cofre: o bloco… não contém chave em texto…" | Sem chave em texto no `dist` | A* |
| SS-034 | CSP inalterada; `verificar` falha se `connect-src` ganhar domínio | `verificar` ("connect-src… só com os domínios esperados") | — | A |
| SS-035 | `ssLoad`/`ssSave` (`sget`/`sset`); versões no IndexedDB; aviso quando `STORE_OK` é falso | "armazenamento com texto quebrado…" | Aviso não exibido (não bloqueei o armazenamento) | A |
| SS-036 | `ssMescla`, `projetos.json`, `proj` no backup; avisos na ficha e no diálogo de backup | "mesclagem por id…", "backup exportado e importado…" | Outro navegador não testado | A |
| SS-037 | `ssFatos` sem telefone; WhatsApp e mapa só com `mostraWa`; proposta usa só `MY_WHATS` | "fatos não levam telefone…", "WhatsApp só entra se marcar" | Sim | A* |
| SS-038 | `28-site-studio.css` (`overflow-wrap`, 375px, alvos de 44px); só tema escuro | `verificar` | Console limpo; sem rolagem horizontal a 375px | A |
| SS-039 | `askF` cai na outra IA e avisa quem respondeu | — | Reserva Gemini respondeu de verdade | A |
| SS-040 | `scripts/testar.mjs` | 64 testes | — | A |
| SS-041 | este relatório e a matriz; 3 revisões `dev-seguranca`; homologação | — | Falta passagem do `testador` e OK do CEO | P |
| SS-042 | Só `ssAnalisar` e `ssRodaIA`, ambas por clique; `cofreAbre` não usa IA | — | Sem requisição ao abrir | A |
| SS-043 | `src/ordem.json` com todos os arquivos novos; nomes únicos | "JavaScript concatenado compila" | `npm run montar` limpo | A |

Contagem: A = 35, A* = 3 (SS-016, SS-033, SS-037), P = 5 (SS-010, SS-014, SS-017, SS-019, SS-041), NÃO ATENDIDO = 0.
