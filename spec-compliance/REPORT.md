# Relatório de conformidade: OR Site Studio (SPEC.md, Fase A)

**Data:** 2026-11-08 · **Estado do código:** com mudanças ainda não commitadas (último commit do repositório: `90a49dc`) · **Testes:** `npm run verificar` = 64 testes passando, "Tudo certo".
**Escopo:** os 43 requisitos SS-001 a SS-043 do `SPEC.md`.
**Matriz de alinhamento (requisito x código x teste x situação):** [`MATRIZ-ALINHAMENTO.md`](MATRIZ-ALINHAMENTO.md).

## 1. Como a auditoria foi feita

1. **Leitura do código contra o SPEC, somente leitura**, por dois agentes independentes (SS-001 a SS-022 e SS-023 a SS-043). Eles não podiam alterar arquivos e deviam citar evidência (arquivo, função) e o teste que cobre. Os agentes devolveram vereditos; este relatório consolida e **reconcilia** com as correções feitas depois.
2. **Três revisões de segurança independentes** (agente `dev-seguranca`, a última rodando o código real em Chrome headless com cerca de 70 payloads). Resultado final: "pode publicar, com ressalvas"; os cinco pontos restantes foram corrigidos.
3. **Homologação ponta a ponta** em navegador novo (armazenamento vazio), com a Groq real: prospect → projeto → análise → site → pedido de mudança → desfazer, refazer e comparar → proposta → "Fechou: criar lead" → links entre lead, prospect e projeto.
4. **Testes automatizados** (`scripts/testar.mjs`) e verificação do build (`scripts/verificar.mjs`).

**Limite desta auditoria:** o plugin Spec-to-Code Compliance da Trail of Bits **não foi usado**. Ele não está instalado neste ambiente e não consegui confirmar o nome nem a origem dele; instalar marketplace de terceiros é decisão do CEO. Esta é uma auditoria equivalente em método (leitura contra a especificação, evidência por requisito), mas **não é** a da Trail of Bits. A auditoria foi somente leitura em relação ao código; o único arquivo escrito por ela é este relatório.

## 2. Resultado

| Situação | Quantidade |
|---|---|
| ATENDIDO | 35 |
| ATENDIDO COM RESSALVA (ver seção 3) | 3 (SS-016, SS-033, SS-037) |
| PARCIAL | 5 (SS-010, SS-014, SS-017, SS-019, SS-041) |
| NÃO ATENDIDO | 0 |

Antes das correções da Etapa 7 o primeiro levantamento achou **11 atendidos, 10 parciais e 1 não verificável** na faixa SS-001 a SS-022 e **mais 10 parciais e 1 não atendido** (SS-041, o próprio relatório) na faixa SS-023 a SS-043. O que mudou desde então está na seção 4.

## 3. O que NÃO está 100% e por quê

**Decisões do CEO (mudam o texto do SPEC, por isso não alterei o SPEC sozinho):**
- **SS-016:** o SPEC cita `sanitizaHtml`. O código usa `ssBlindaExport` (lista de permissões por DOM, duas passadas, CSP fechada no arquivo), que é **mais estrita**, e o `sanitizaHtml` ainda existe no app. É um desvio de redação, não de intenção. **Proposta de revisão:** trocar "passar por `sanitizaHtml`" por "passar por uma barreira de saída equivalente ou mais estrita".
- **SS-019:** o SPEC diz que o site gerado DEVE atender acessibilidade (foco, contraste, alvos de 44px). O app **confere** `lang`, viewport, `alt`, `:focus` e `prefers-reduced-motion` e mostra avisos, mas **não garante** nem mede contraste e alvo de toque, porque quem escreve o site é a IA. **Proposta de revisão:** "o app DEVE conferir e avisar; contraste e alvos de toque ficam a cargo da revisão do consultor".
- **SS-033 (cofre):** o cofre põe as chaves **cifradas** numa página pública. A senha precisa ser longa (mínimo 12 caracteres), pois o bloco pode ser copiado e atacado offline. O SPEC não diz se isso conta como "chave no `dist/`". Precisa de uma frase do CEO aceitando o risco ou vetando o cofre. `verificar` não bloqueia `COFRE_SITE` preenchido.

**Parciais que dependem do modelo de IA (o código só pede, conferir é manual):**
- **SS-010:** o app marca número fora dos fatos e afirmações com palavras como prêmio, depoimento, "há N anos", "desde AAAA". Depoimento ou endereço escrito sem essas palavras e sem número pode passar. A defesa final é a revisão do consultor.
- **SS-014:** "1 a 5 seções e menu por âncoras" está no prompt, e o app **avisa** se houver mais de 5 `<section>` ou se faltar `<nav>` com âncoras. Não impede nem corrige.
- **SS-017:** links de WhatsApp, telefone, e-mail e Instagram escritos pela IA são descartados (só valem os marcadores); mas depoimentos e números dentro do HTML do site dependem do prompt.
- **SS-041:** este relatório existe agora e houve três revisões do `dev-seguranca`. Falta a passagem do agente `testador` (a homologação foi feita por mim) e o OK do CEO para publicar. **Não há publicação sem esse OK.**

**Atendidos com ressalva:**
- **SS-037:** WhatsApp e mapa só entram no site com a caixa marcada; o telefone nunca entra na análise nem na proposta. O endereço do prospect entra nos fatos da análise (uso interno) e não vai ao cliente.

## 4. Correções feitas por causa da auditoria (Etapa 7)

| Achado | Correção |
|---|---|
| SS-003: do lead não havia caminho ao projeto | Link "Abrir o projeto no Site Studio" no detalhe do lead e na ficha do prospect |
| SS-006: analisar e gerar o site mudavam a etapa sozinhos | Etapa só muda pela mão do consultor |
| SS-012: "Tentar de novo" sempre refazia a análise; repintar a tela apagava o que estava digitado | Botão repete a última ação; pedido de mudança e campos da proposta são preservados |
| SS-001/004: cidade não era copiada; prospect já fechado gerava projeto sem vínculo | Cidade copiada; o projeto nasce já ligado ao lead |
| SS-005: salvar a proposta não gerava evento | Eventos "texto salvo" e "marcada como revisada"; histórico mostra 30 |
| SS-028: o app só avisava de promessa | Frase de promessa no texto bloqueia a exportação; pontos da IA que prometem ficam fora da proposta |
| SS-030: a análise na proposta não era editável | O consultor marca e desmarca cada ponto da análise que vai ao cliente |
| SS-014/017/010: só no prompt | Checagem de estrutura, descarte de contato escrito pela IA, marcação de afirmações suspeitas |
| SS-035/036/037 | Aviso de armazenamento bloqueado no Studio; aviso no backup de que as versões não entram; mapa só com a caixa marcada |
| SS-034: o `verificar` só avisava de domínio novo | `verificar` **falha** se a CSP ganhar domínio em `connect-src` |

## 5. O que esta auditoria NÃO verificou

- Firefox e Safari (todos os testes manuais foram em Chrome).
- O app no tablet e o visual em 375px da tela completa do Studio com a proposta aberta.
- O **PDF de verdade**: a janela de impressão do navegador não foi exercitada; o registro da exportação (data, versão do site, total) foi coberto só por código e testes de lógica.
- O arquivo baixado aberto em outro aparelho.
- A prévia com **JavaScript ligado** (só leitura de código e testes de HTML).
- Obediência real do modelo a "ignore as regras" (SS-011) e a "não inventar" (SS-009): conferido só em amostras com a Groq real.
- `ssBlindaExport` não tem teste automatizado (precisa de DOM). Foi verificada no navegador com os payloads das três revisões; **recomendo** um teste em navegador sem interface antes de mudanças futuras nessa função.

## 6. Conclusão

**Não há requisito NÃO ATENDIDO.** Ficam 5 parciais e 3 ressalvas, todos explicados acima, nenhum deles uma falha de segurança conhecida.
**Posso recomendar publicar?** Em termos de código e segurança, sim, com as ressalvas da seção 3, **mas a decisão é do CEO** e depende de: (1) aprovar ou rejeitar a revisão do texto do SPEC em SS-016 e SS-019; (2) decidir sobre o cofre (SS-033); (3) cadastrar os segredos no GitHub e publicar; (4) uma passagem do `testador` e um teste real em tablet, Firefox e Safari.
