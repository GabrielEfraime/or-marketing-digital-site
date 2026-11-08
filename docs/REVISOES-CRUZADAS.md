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
