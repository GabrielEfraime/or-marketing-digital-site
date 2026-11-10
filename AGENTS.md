# AGENTS.md: regras de trabalho para qualquer IA (Claude Code, Codex e outros)

Fonte **única** das regras do projeto. `CLAUDE.md` importa este arquivo e só acrescenta o que é específico do Claude Code. Se este texto e o código divergirem, **o código vence**; conserte o texto.
Este repositório é **público**: nunca escreva aqui segredo, chave, token, dado de cliente ou número de negócio.

## O projeto
OR Marketing Digital: agência do Rio de Janeiro (foco em empresas e pequenos negócios B2B). Site público e painel "Minha área" (leads, captação, Site Studio, posts, acompanhamento) na mesma página, em JavaScript puro, sem servidor, publicado no GitHub Pages. O dono (CEO, Gabriel Efraime) decide preço, texto de marca, publicação e qualquer coisa de Fase 2 (servidor, login real, domínio).

## Fontes autoritativas (uma por assunto)
| Assunto | Arquivo |
|---|---|
| Regras de trabalho e qualidade | este arquivo |
| Arquitetura e mapa dos arquivos | `ARCHITECTURE.md` |
| Visual, tokens e componentes | `DESIGN_SYSTEM.md` |
| Método de design e marketing (tipografia, SWOT, AIDA, STP, Ansoff, processo) | `METODO.md` |
| Testes, evidências e validação visual | `TESTING.md` |
| Requisitos do Site Studio (SS-001 a SS-043) | `SPEC.md` |
| Auditoria de conformidade do SPEC | `spec-compliance/REPORT.md` e `MATRIZ-ALINHAMENTO.md` |
| Revisões entre IAs e divergências | `docs/REVISOES-CRUZADAS.md` |
| Como rodar | `README.md` |
Documentos históricos (`docs/ESPECIFICACAO-COMPLETA.md`, `docs/PLANO-SUPABASE.md`): só consulta. Novo assunto relevante: crie o arquivo e registre aqui; não duplique texto entre arquivos.

## Regras fixas
- Interface, erros e textos em **português do Brasil**. Sem emoji na interface (ícones de linha).
- **Não inventar** funcionalidade, texto de marca, preço, número, depoimento ou resultado. Faltou informação: perguntar, ou "a confirmar".
- **Segredos**: nunca chave de API no código ou repositório. Teste local: `.env` (gitignorado; modelo em `.env.example`). Site publicado: chaves cifradas no navegador (tela IAs) ou no cofre do site (`COFRE_SENHA`).
- **IA só no clique**: nada chama IA ao abrir o site ou a Minha área.
- Texto de usuário ou da IA exibido na tela passa por `esc()`. Sem `innerHTML` com texto cru.
- **A IA nunca faz conta nem inventa preço**: valores só da tabela de preços; o app calcula.
- CSP do `<head>` fechada. Sem recursos de terceiros carregados sozinhos (nada de CDN, Google Fonts, imagem externa). Domínio novo em `connect-src` quebra o `npm run verificar` de propósito.
- Acessibilidade: foco visível, contraste nos dois temas em uso, `aria-*` em diálogos e abas, `prefers-reduced-motion` desliga animação, alvos de toque de pelo menos 44px.
- O consultor sempre revisa antes de qualquer coisa ir ao cliente. Nunca pedir nem guardar senha de cliente.

## Como editar
- Edite `src/`, **nunca `dist/`**. Depois: `npm run montar` e `npm run verificar` (inclui os testes).
- JavaScript em **um único escopo global**, na ordem de `src/ordem.json`. Não repita nomes entre arquivos. Arquivo novo entra no `ordem.json`.
- CSS: o que vem depois vence; muitos `!important` herdados. Procure o uso de uma classe antes de apagar regra.
- Sem dependências npm no produto. Ferramentas de desenvolvimento ficam em `scripts/` e também sem dependências.
- Armadilhas já pagas (valem para qualquer IA):
  1. `el.onkeydown = e => e.key==='Enter' && fn()` cancela a digitação: use bloco `{ if(...) ... }`.
  2. Em `background` com várias camadas, a cor sólida vai por último.
  3. `localStorage` pode estar bloqueado (iframe, modo privado): há fallback em memória; não dependa dele.
  4. Navegação por estado (`P.page`, `A.view`), não por `#hash` (exceto `#/admin`).
  5. Durante o streaming da IA, atualize só o painel de leitura; refaça a tela no fim.
  6. Modelos Groq mudam de nome: oferecer "Ver modelos disponíveis". `gpt-oss`: `reasoning_effort:"low"` e `max_tokens` ×2,5+600; em HTTP 400, repetir sem parâmetros opcionais.
  7. JSON de modelo pequeno falha: extrair `{...}`, tirar vírgulas finais, ter fallback para texto bruto.
  8. HTML gerado por IA não é confiável: exibir em iframe sandbox; ao baixar, passar por `ssBlindaExport` (nunca `dlHtml` com CSP própria, porque o `sanitizaHtml` apaga a CSP).

## Colaboração entre IAs
**Claude Code = gerente geral**: entende o pedido, escreve requisitos e critérios de aceite, coordena, integra, mantém a documentação. **Codex = engenheiro e revisor independente**: avalia planos, revisa o trabalho do Claude, implementa tarefas isoladas e investiga bugs difíceis.
1. **Plano**: Claude escreve a especificação; Codex avalia (arquitetura, falhas, alternativas) **antes** de codar.
2. **Desenvolvimento**: tarefas divididas por arquivos; cada IA na sua branch. Nunca duas IAs nos mesmos arquivos ao mesmo tempo.
3. **Revisão cruzada**: o que uma IA fez, a outra revisa em **somente leitura**.
4. **Divergência**: nenhuma IA concorda por padrão. Cada ponto aceito ou rejeitado leva argumento e **evidência reproduzida** (teste, captura de tela, código). Registro em `docs/REVISOES-CRUZADAS.md`.
5. **Testes e validação visual** (`TESTING.md`) antes de declarar pronto. Sem evidência, não está pronto.
6. **Entrega** ao CEO: o que mudou, o que foi testado de verdade, o que não foi, pendências.

### Branches e git
- `claude/<tarefa>` e `codex/<tarefa>`. Worktree separado quando houver risco de colisão. **Nunca commitar direto no `main`**: o push no `main` publica o site (GitHub Pages por Actions).
- **Arquivos ignorados pelo git não têm proteção** (documentos internos em `docs/`, `.env`): `git checkout`, `merge`, `rebase`, `reset` e `pull` podem apagá-los ou sobrescrevê-los sem aviso (aconteceu em 08/11/2026). **Antes** de trocar de branch ou mesclar, rode `npm run guardar` e confira `git status --ignored`. Integrar em worktree separado, não no diretório de trabalho do dono.
- **O Codex nunca roda no diretório do dono**: ele lê tudo o que está na pasta (inclusive `.env` e documentos internos) e envia à OpenAI. Rode em um worktree limpo (`git worktree add ../codex-revisao <branch>`), que só tem arquivos rastreados.
- Reunir só depois da revisão cruzada, rodar os testes depois de integrar, e **pedir o OK do CEO** antes de qualquer merge no `main`.
- Não sobrescrever o trabalho da outra IA, não descartar código nem histórico sem autorização, não reescrever histórico publicado.
- Cada commit termina com a linha de coautoria da IA que o escreveu.

### Uso do Codex (custo e limites)
- Revisão **somente leitura** por padrão (`codex exec -s read-only`, `/codex:review`, `/codex:adversarial-review`). `adversarial-review` para mudança crítica (segurança, autenticação, dados, arquitetura).
- **Review gate desligado** (gera ciclos e gasta o plano ChatGPT do CEO). Nada de revisão automática em loop.
- Cada chamada envia o código lido à OpenAI e conta no plano do CEO: peça revisão nos pontos certos (plano, antes de integrar, mudança crítica), em segundo plano, com escopo pequeno.

### Especialistas
Use só quando o assunto pede: arquitetura, frontend, backend, UX/UI e design visual, segurança, banco de dados, SEO, performance, testes, integração com IA. Um especialista por tarefa; sem agentes redundantes para tarefa simples. Os agentes do Claude estão em `.claude/agents/` (fora do repositório).

## Qualidade visual (prioridade máxima)
Siga o processo e os princípios de `METODO.md` (diagnóstico, pesquisa, planejamento, criação, validação, entrega).
Página "pronta" não é página que renderiza. Antes de interface grande: duas ou três direções de design, escolha justificada. Evite o visual genérico de IA (veja `DESIGN_SYSTEM.md`). Toda mudança visual precisa de captura de tela real (desktop e celular) comparada com o planejado.

## Fora de escopo sem decisão do CEO
Servidor, login real, banco de dados, domínio, DNS, migração de hospedagem (Hostinger), publicação em produção, preços e textos de marca.
