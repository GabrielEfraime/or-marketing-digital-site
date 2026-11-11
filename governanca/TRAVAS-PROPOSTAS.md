# Travas técnicas propostas (ainda NÃO aplicadas)

**Status: PROPOSTA, nada foi alterado na máquina nem no GitHub.** Estas travas mudam permissões do Claude Code nesta máquina e as regras do repositório. Cada uma é nível 3: só entra com o OK explícito do CEO. Regra de prompt não substitui trava técnica (`GOVERNANCA-IA.md` §3).

## 1. Regras de permissão do Claude Code (nesta máquina)
Arquivo: `E:\SITE IA\.claude\settings.local.json` (hoje vazio, sem regras). Proposta, para revisar antes de aplicar:
```json
{
  "permissions": {
    "deny": [
      "Read(./**/.env)",
      "Read(./**/.env.*)",
      "Bash(git push origin main:*)",
      "Bash(git push --force:*)",
      "Bash(git reset --hard:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(git merge:*)",
      "Bash(git checkout:*)"
    ]
  }
}
```
Efeito: o `.env` deixa de ser lido por qualquer agente (hoje a regra "não leia o `.env`" é só texto); push em `main` e reset destrutivo ficam bloqueados; push, merge e checkout pedem confirmação. Observação: `.env.example` seria bloqueado pelo segundo padrão; ajustar se for preciso lê-lo. Limites: as regras valem para o Claude Code desta máquina, não para o Codex nem para outra pessoa.

## 2. Ferramentas mínimas por agente
Cada arquivo em `E:\SITE IA\.claude\agents\*.md` ganharia `tools:` explícito. Proposta: pesquisador, analista, contador, testador e dev-seguranca só com leitura e busca (Read, Grep, Glob; Bash apenas onde o agente precisa rodar testes); copywriter, vendedor, atendente e gestor-de-trafego sem Bash nem edição de código; desenvolvedor e web-designer com edição, mas sem as ferramentas de e-mail, Drive, Shopify, banco e Cloudflare. Hoje todos herdam tudo.

## 3. Hook de segurança
Um hook de pré-execução que recuse comando com `.env`, `git push` na `main` e envio por conector (e-mail, mensagem). Só deve ser criado depois de aprovado o conteúdo exato, porque hook executa código na máquina.

## 4. Proteção do `main` no GitHub (só o dono pode)
Repositório `GabrielEfraime/or-marketing-digital-site`, Settings, Branches: exigir pull request, exigir o status do CI (`npm run montar` e `verificar`) e bloquear push direto na `main`. Hoje o push na `main` publica o site sem gate. O CI atual só roda depois do push; precisa de um workflow que rode também em pull request.

## 5. Teto de gasto
Definir um limite por sessão para chamadas pagas (Pollinations, Gemini). **Precisa de um número escolhido pelo CEO**; não vou inventar. Até lá, o gasto depende só do plano de cada provedor.

## 6. Retenção de dados
A política promete 12 meses. Para aplicar (excluir leads vencidos) é preciso decisão do CEO sobre o comportamento (avisar, pedir confirmação, anonimizar ou apagar) e sobre o backup, porque excluir dado é nível 3 e o app não tem mais backup em arquivo.
