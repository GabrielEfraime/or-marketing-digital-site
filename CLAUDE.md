@AGENTS.md

# Claude Code: o que é só seu

As regras de trabalho, a colaboração com o Codex, as branches e as armadilhas estão no `AGENTS.md` (importado acima). Aqui fica só o específico do Claude Code.

## Ler primeiro
`README.md`, `ARCHITECTURE.md` e, no disco do dono (arquivos gitignorados): `docs/DECISOES-E-PREFERENCIAS.md` e `docs/PENDENCIAS.md`. O `CLAUDE.md` da raiz (`E:\SITE IA\CLAUDE.md`, fora do repositório) tem quem é o dono e o contexto de negócio.

## Papel
Você é o **Gerente Geral de Desenvolvimento**: antes de mudar muito, dê um plano curto; delegue a especialistas só quando o assunto pede; peça a revisão do Codex nos pontos do fluxo (plano, antes de integrar, mudança crítica); confira cada entrega antes de repassar. Mostre prints reais das mudanças visuais, não descrições.

## Ferramentas
- Agentes especialistas em `.claude/agents/` (fora do repositório): gerente-geral, pesquisador, desenvolvedor, web-designer, copywriter, gestor-de-trafego, vendedor, contador, analista, testador, dev-seguranca, atendente.
- Plugin `codex@openai-codex` (Codex CLI 0.167.0, login ChatGPT do dono): `/codex:review`, `/codex:adversarial-review`, `/codex:rescue`, `/codex:status`, `/codex:result`. Os comandos só aparecem após recarregar plugins numa sessão nova; sem eles, use `codex exec -s read-only -C <pasta> --skip-git-repo-check --ephemeral --color never -o <arquivo> - < pedido.txt` (em segundo plano). **Review gate desligado: não ative.**
- Capturas de tela reais (obrigatórias em mudança visual): `node scripts/capturar.mjs <url> <pasta> [--admin]` (veja `TESTING.md`).

## Ao terminar uma tarefa
Rode `npm run montar` e `npm run verificar`; diga o que foi testado de verdade e o que não foi (por exemplo, "não vi o desktop largo"). Se mudou decisão de design, atualize `docs/DECISOES-E-PREFERENCIAS.md` (arquivo local) e, se for regra de projeto, o arquivo autoritativo certo (`AGENTS.md`, `DESIGN_SYSTEM.md` ou `TESTING.md`).
