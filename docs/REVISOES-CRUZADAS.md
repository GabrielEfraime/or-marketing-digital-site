# Registro de revisões cruzadas (Claude Code x Codex)

Cada entrada guarda: quem revisou o quê, o que achou, **o que o outro concordou ou discordou, com argumento**, e o que foi feito. Não vale "concordo" sem evidência.

## 2026-11-08 · Teste inicial da integração: `ssBlindaExport` (Site Studio)

- **Quem escreveu:** Claude Code. **Quem revisou:** Codex CLI 0.167.0 via `codex exec -s read-only` (somente leitura), pedido em `scratchpad`, sem alterar arquivos.
- **Contexto:** a função já tinha passado por três revisões independentes de segurança (agente `dev-seguranca` do Claude) e dado "pode publicar, com ressalvas".

| Achado do Codex | Veredito do Claude | Evidência | Ação |
|---|---|---|---|
| **Alto:** a faixa "Não é o site oficial" pode ser escondida por CSS da IA (`filter:opacity(0)`; mesma família: deslocar, zerar largura, cobrir) | **Concordo.** As revisões anteriores não acharam. | Reproduzido no navegador: `filter` ficava `opacity(0)` com `opacity` calculada 1; "deslocar" e "cobrir" deixavam a faixa fora de vista | Site baixado agora vai num iframe isolado; a faixa, o `noindex` e a CSP ficam no documento de fora (`ssEmbrulhaDemo`). Testado com o payload do Codex mais `html::after` cobrindo a tela: faixa visível e por cima |
| **Médio:** `tel:` sem aspas e `https://wa&#46;me/...` escapam do filtro de contato (SS-017) | **Concordo.** | Reproduzido: os dois links, e um `https://pagina-falsa.example/login`, passavam no export | Fim da lista de bloqueio por texto: no site baixado só valem `#` e os contatos aprovados pelo app (`op.ok`, `ssContatosOk`, só o que o consultor marcou). Tudo o mais vira `#` |
| **Médio:** a barreira é lista de bloqueio, não "lista de permissões" como o comentário dizia | **Concordo em parte.** O comentário estava errado e foi corrigido. Trocar tudo por uma lista de permissões de tags e de CSS é trabalho maior e não eliminaria a necessidade da CSP | O CSS arbitrário continua permitido (há cssN), só com `url(`, `@import` e `image-set(` neutralizados | Comentário corrigido. **Pendente (decisão):** avaliar uma lista de permissões de tags, atributos e propriedades CSS, ou um sanitizador local consolidado |
| **Baixo:** o download ignora `sanitizaHtml` e isso diverge do texto do SS-016 | **Concordo; já estava registrado** como desvio proposto na auditoria de conformidade | `spec-compliance/REPORT.md`, seção 3 | Aguarda o CEO aprovar a revisão do texto do SPEC |
| **Bem feito:** as remoções explícitas e o iframe da prévia sem `allow-same-origin` | Concordo | Testes e revisões anteriores | Preservar |

**Divergências de método entre as duas IAs:** nenhuma sobre o que corrigir. O Codex propôs "separar a demonstração em iframe isolado", e foi a solução adotada, por ser a única que não depende de enumerar propriedades CSS.
**Custo observado:** uma chamada de revisão curta (cerca de 5 minutos), somente leitura, contada no plano ChatGPT do usuário.

## 2026-11-08 · Modo Apresentar e revisão por outra IA (SS-044 e SS-045)

- **Quem escreveu:** Claude Code. **Quem revisou:** Codex CLI 0.167.0, `codex exec -s read-only`, em **worktree limpo** (sem `.env` nem documentos internos), sobre o commit `ef96317`.

| Achado do Codex | Veredito do Claude | Evidência | Ação |
|---|---|---|---|
| **Alto:** o iframe da apresentação não tinha CSP própria, então o JavaScript do site (quando ligado) herdava o `connect-src` da página | **Concordo.** "Sem rede" não estava garantido | o conteúdo era `srcdoc` sem meta de CSP | CSP no conteúdo (`default-src 'none'`, sem `connect-src` nem `frame-src`); popups para contatos continuam (WhatsApp), aceito |
| **Alto:** a faixa "Não é o site oficial" ficava dentro do documento não confiável (CSS ou JS a escondem) | **Concordo; eu devia ter pegado**, é a mesma falha já achada na exportação | `ssMonta` inseria a faixa no HTML do site | Faixa agora no overlay, fora do iframe; o site é montado com `semFaixa` |
| **Médio:** Esc não chega ao overlay se o foco está dentro do iframe; o fundo não era inerte | **Concordo em parte.** Evento de teclado dentro de iframe sem same-origin não atravessa: não há como interceptar | — | Fundo da página fica `inert` enquanto aberto; botão "Sair" com `aria-keyshortcuts` e dica (Shift+Tab ou o botão); limite documentado |
| **Médio:** clique duplo em "Revisar" faz duas chamadas (`busy` marcado depois de um `await`) | **Concordo, e o mesmo defeito existia em `ssRodaIA`** (ajuste de site) | reproduzido no navegador: antes, 2 chamadas; depois, 1 | Marca "ocupado" antes de qualquer `await` nas duas funções |
| **Médio:** a IA 2 pode ser o mesmo modelo que gerou, ou cair nele pelo fallback | **Concordo** | o app já mostra quem respondeu | Aviso na tela quando o revisor é o modelo que gerou a versão |
| **Médio:** "tentar de novo" depois de falha na revisão ia para o fluxo de ajuste | **Concordo** | reproduzido | Roteado para `ssRevisarSite` |
| **Médio:** JSON válido sem a lista `itens` virava "sem pontos a corrigir" | **Concordo** | `{"erro":"..."}` | Sem `itens`, cai no texto bruto (teste novo) |
| **Baixo:** ouvinte de teclado não é removido se o overlay for removido por fora | Concordo | — | O ouvinte se remove sozinho (e tira o `inert`) |
| **Bem feito:** `esc()` em todos os textos da revisão, HTML e fatos tratados como dado, revisão antiga avisada | Concordo | — | Preservar |

**Resultado:** 70 testes; correções comprovadas no navegador (faixa fora do iframe, CSP sem rede, fundo inerte, clique duplo = 1 chamada, retry da revisão, aviso de mesma IA). Divergências de método: nenhuma sobre o que corrigir.

## 2026-11-18 · Modo prompt e aba "Prompt para Claude/GPT"

- **Quem escreveu:** Claude Code. **Quem revisou:** Codex CLI 0.167.0, `codex exec -s read-only`, em **pasta limpa** (só arquivos rastreados pelo git mais as mudanças; sem `.env` nem documentos internos). Mudanças ainda sem commit na branch `claude/prompt-mestre`.

| Achado do Codex | Veredito do Claude | Evidência | Ação |
|---|---|---|---|
| **Bloqueante:** o modo prompt ainda deixava passar chamadas de rede de IA (`ask` com `cfg:`, testes e lista de modelos na tela IAs, `rvLerUma`) | **Concordo.** | `ask()` só travava sem `cfg`; os testes de `49` e `rvLerUma` usam `fetch` direto | Trava única `pmTrava()` em `ask`, `askF`, `iaImagem`, `rvLerUma` e nos testes da tela IAs; verificado no navegador: 0 requisições de rede |
| **Bloqueante:** HTML colado salvo e exibido sem `ssBlindaExport` | **Concordo em parte.** O caminho é o mesmo do HTML gerado pela IA do site (`29-execucao-kits-site.js`, prévia em `sandbox="allow-scripts"` e `dlHtml`), que já existia antes | linhas 194 e 197 do arquivo não foram tocadas | Limite de 400 mil caracteres antes de salvar. **Pendente, tarefa à parte:** rotear o download do kit de site por `ssBlindaExport` (afeta a IA e a colagem) |
| **Bloqueante:** orçamento ou mensagem com aviso de valor ainda pode ser salvo e enviado | **Discordo como bloqueante.** | O fluxo da IA do site já funcionava assim: aviso vermelho "Confira antes de enviar", e o consultor revisa (AGENTS.md). A colagem usa a mesma conferência `checarValores` | Mantido; decisão do CEO se quiser bloquear o envio com aviso pendente |
| **Regressão:** `[data-sa]` escondia "Medir no Google (PageSpeed)", que não usa IA; faltavam seletores de IA | **Concordo.** | `data-sa="psi"` e `"ia"` | Seletor trocado para `[data-sa="ia"]`; incluídos `data-ss="gerar/revisar"`, `data-cap="msg/site/filasite"`, `data-rea-post-generate`, `data-rea-art-action="imagem"` |
| **Alto:** o filtro de dados pessoais perde telefone com espaços duplicados e deixa o nome completo | **Concordo em parte.** | reproduzido no navegador | Separadores flexíveis no telefone; o nome completo do cliente volta a ser só o primeiro nome. `@` de redes, URLs e endereços ficam: decisão do CEO |
| **Médio:** posts gravados no ciclo errado (`perSel` usa `T.cic` global); mínimo de 1 peça mesmo com escopo cheio | **Concordo em parte.** | `perSel=t=>'c'+(T.cic\|\|cicAtual(t))`; reproduzido com `T.cic='c9'` | Usa o ciclo atual do próprio cliente. O mínimo de 1 peça fica, igual ao botão por frente do Acompanhamento |
| **Baixo:** etapa escolhida vaza de um lead para o outro | **Concordo.** | `A.pmEt` global | Guardada por lead (`A.pmEtLead`); verificado |
| **Baixo:** mudança de modo em outra aba não atualiza a classe CSS | **Concordo em parte.** | evento `storage` | Reaplica a classe; não repinta a tela |
| **Bem feito:** refatoração dos pedidos sem mudança de comportamento, `esc()`/`md()`, sem lookbehind, 80 testes | Concordo | Revisão do Codex | Preservar |

**Resultado:** 80 testes passando; correções comprovadas no navegador. **Divergência de método:** uma (orçamento com aviso). **Custo observado:** uma chamada de revisão, somente leitura, contada no plano ChatGPT do usuário.
