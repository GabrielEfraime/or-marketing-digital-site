# Integração Claude Code + Codex: estado, limites, custos e ferramentas

**Data:** 2026-11-08. Regras de uso: `AGENTS.md`. Este arquivo é só o relatório da integração.

## 1. Estado verificado
| Item | Situação |
|---|---|
| Claude Code | 2.1.302, com `claude plugin` |
| Codex CLI | 0.167.0, instalado com `npm install -g @openai/codex`, no PATH |
| Login do Codex | ChatGPT do dono (verificado por `codex login status` e pelo setup do plugin); **nenhuma credencial lida ou copiada** |
| Plugin | `codex@openai-codex` 1.0.6 (oficial, OpenAI, Apache-2.0), escopo do usuário |
| Review gate | **desligado** (gera ciclos e gasta crédito) |
| Comunicação testada | duas revisões reais somente leitura (`ssBlindaExport`; diagnóstico do site com capturas), com resultado reproduzido e corrigido |
| Branches | `claude/*` e `codex/*`; `main` sem proteção no GitHub (**recomendado ligar**) |

## 2. Limites conhecidos
- Os comandos `/codex:*` só aparecem depois de recarregar plugins numa sessão **nova**; até lá se usa `codex exec`, equivalente. Não foi confirmado que funcionam dentro do app desktop do Claude.
- Existe um segundo `codex.exe` (alpha) dentro do app do Codex para Windows, fora do PATH. Convivem sem conflito, mas são versões diferentes.
- **Privacidade**: o Codex lê tudo da pasta em que roda (inclusive `.env` e documentos internos ignorados pelo git) e envia ao serviço da OpenAI. Por isso deve rodar em um **worktree limpo**. Nas duas execuções de teste a pasta-base foi `E:\SITE IA` (com `.env`): nos registros que li (comandos executados e menções) **não encontrei leitura de `.env` nem de credenciais**; ele tentou abrir documentos internos que, por um erro meu, já não existiam no disco (ver seção 7). Não há como provar a ausência de qualquer leitura, por isso a regra do worktree limpo.
- Fora do repositório (e portanto fora do Codex): `.claude/agents/`, o `CLAUDE.md` da raiz e a memória do Claude.
- A revisão do Codex é por leitura; ele não abriu o site no navegador (o Claude fornece as capturas).

## 3. Custos
- O uso do Codex entra no **plano ChatGPT do dono**; o plano não foi informado. Revisões curtas: cerca de 5 a 20 minutos cada. Sem custo de API hoje.
- O Claude Code consome o plano próprio do dono.
- Controle: revisão só nos pontos do fluxo, em segundo plano, escopo pequeno, review gate desligado, sem laços automáticos.
- Não há custo novo de infraestrutura nesta etapa.

## 4. Ferramentas adicionais
| Ferramenta | Para quê | Situação |
|---|---|---|
| `scripts/capturar.mjs` | capturas reais em tela cheia (desktop, celular, painel) | criada (sem dependências; usa o Chrome do computador) |
| `scripts/guardar-privados.mjs` (`npm run guardar`) | backup dos documentos ignorados pelo git antes de trocar de branch | criada |
| Proteção da `main` no GitHub | exigir pull request e verificação verde | **só o dono pode ligar** (Settings > Branches) |
| Teste de DOM sem interface | provar `ssBlindaExport` automaticamente (hoje só manual) | recomendada: script com Chrome headless, reaproveitando `capturar.mjs` |
| Skills `accessibility-scan` e `accessibility-audit` | acessibilidade por regra | disponíveis no Claude, ainda não usadas neste projeto |
| Lighthouse ou medição em rede real | peso e desempenho | recomendado |
| Plugin da Trail of Bits (spec-compliance) | auditoria SPEC x código | **não instalado**; decisão do dono (marketplace de terceiros) |

## 5. Ferramentas de desenvolvimento x IA dentro do produto (não confundir)
Instalar o Codex CLI **não** coloca o Codex dentro do site público. O Site Studio comercial (motor de criação de sites com IA) é outra frente e exige, **planejados à parte**:
1. **APIs de modelo** (Groq hoje; OpenAI, Anthropic ou outras) com chaves **no servidor**, nunca na página.
2. **Autenticação e permissões** reais (hoje o PIN é só da tela; a Fase 2 prevê login, 2FA e papéis, ver `docs/PLANO-SUPABASE.md`, histórico).
3. **Execução isolada** de código gerado (sandbox, limite de tempo e de recurso) para qualquer fluxo que rode ou teste o site gerado.
4. **Custos por uso**: tokens por site gerado e por ajuste, cota por cliente, limite e alerta.
5. **Infraestrutura**: servidor, fila, armazenamento das versões e propostas, link público com token, LGPD. A decisão de servidor (Cloudflare, Supabase ou Hostinger) é do CEO e segue pendente.
Essa frente só começa com a decisão do dono; nada disso foi implementado.

## 6. Próximos passos sugeridos
1. O dono liga a proteção da `main` e responde: plano do ChatGPT; aprova `ARCHITECTURE.md` no lugar de `docs/ARQUITETURA.md`.
2. Integrar a branch de endurecimento da exportação (`claude/export-hardening-revisao-codex`) e a de documentação por pull request, com revisão do Codex.
3. Escolher a primeira melhoria do diagnóstico (briefing e estrutura da página) e seguir o fluxo completo: plano, revisão do Codex, desenvolvimento em branch, revisão cruzada, capturas reais, entrega.
4. Só depois: migração para a Hostinger e o OR Workspace privado, em projeto próprio.

## 7. Incidente de 08/11/2026: documentos internos apagados do disco
Ao integrar a branch no `main`, a troca de branch e o avanço (fast-forward) do git **apagaram cinco documentos internos** que só existiam no disco (`docs/DECISOES-E-PREFERENCIAS.md`, `PENDENCIAS.md`, `PLANO-SUPABASE.md`, `REVISAO-DEMANDAS-IA.md`, `REVISAO-SEGURANCA.md`), porque o git deixara de rastreá-los e o `.gitignore` não os protege. Foram **restaurados** de `_arquivo/backup-lote3a-2026-11-06/docs/` (07/11, 00:34); o que foi escrito depois (Lotes 2C a 3C, aprovações de 07/11) foi **perdido** e só parcialmente reconstruído (marcado no próprio arquivo). Correções: `npm run guardar` (backup antes de trocar de branch) e as regras em `AGENTS.md`.
