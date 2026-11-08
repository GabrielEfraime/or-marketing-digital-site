# Diagnóstico do site atual da OR (Claude Code e Codex, avaliações independentes)

**Data:** 2026-11-08 · **Versão avaliada:** commit `1ad1f12` (site público e Minha área) · **Método:** o Codex recebeu 11 capturas reais (desktop 1440, celular 390, Minha área) e o código, em **somente leitura**, **sem** os achados do Claude. O Claude fez a sua avaliação antes de ler a do Codex, com as mesmas capturas, medidas do código e leitura dos arquivos. As capturas foram feitas por `scripts/capturar.mjs` (ficam em pasta local ignorada pelo git).
**Escopo:** só diagnóstico. Nada foi reconstruído, publicado ou alterado no site.

## 1. Resposta curta: por que o visual não parece profissional?
O site **não é fraco no acabamento**: a marca é reconhecível, o título do topo tem presença, a esfera da seção de IA é bonita, a paleta é consistente e há cuidado de acessibilidade. O que o faz parecer "feito por IA" é **a combinação previsível de recursos** (título gigante, esfera luminosa, cartões inclinados, palavra do título em pílula) **sem uma narrativa própria** e sem edição do conjunto: o site explica várias vezes *como* o orçamento é feito e mostra pouco *por que contratar a OR* (pessoas, método, trabalhos). A causa de fundo é de **processo e de código**: não havia um design system com autoridade, nem validação visual real (captura de tela comparada ao planejado), e o CSS foi acumulado por intervenções históricas.

## 2. O que as duas avaliações concordam
| # | Problema | Evidência | Quem achou |
|---|---|---|---|
| 1 | **Efeitos competem em vez de compor**: fundo do topo, esfera orbital e cartões inclinados na mesma página | `desktop-01`, `-04`, `-05`; `11-visual-3d-efeitos.js` aplica rotação aos cartões | Os dois |
| 2 | **Destaque em pílula repetido** em quase todo título ("ESCOLHER", "NEGÓCIO") e escala monumental em seções comuns: o ritmo fica uniforme | `desktop-03`, `-05` | Os dois |
| 3 | **Pacotes sem diferença concreta**: três cartões quase vazios (Essencial, Crescimento, Completo), sem destaque de recomendação | `desktop-03-y2721`, `celular-03` | Os dois |
| 4 | **Hierarquia comercial invertida**: os serviços só aparecem tarde na página; o processo se repete (topo, manifesto, pacotes) | página de 17 mil px; serviços a ~5,5 mil px | Os dois |
| 5 | **"Quem somos" fala de tecnologia, não da agência**: "AI-Driven" domina; sem pessoas, método ou trabalhos | `desktop-04`; `17-site-publico-paginas.js` | Os dois |
| 6 | **CSS acumulado**: 27 arquivos, 77 `!important`, nenhum `@layer`; arquivo "clean" que declara vir por último para vencer os antigos | `26-minha-area-clean.css`, `06-ai-driven.css` | Os dois |
| 7 | **Painel**: estados vazios só com zeros e sem próxima ação; nomes de modelos de IA no menu lateral | `admin-leads`, `admin-dashboard` | Os dois |
| 8 | **Celular**: jornada longa e botões flutuantes (voltar ao topo, WhatsApp) sobre o conteúdo | `celular-02`, `-03` | Os dois |
| 9 | **HTML único de 1,16 MB**: o visitante baixa também o código do painel (76% do arquivo é JavaScript); com gzip, 423 KB | medido no `dist/index.html` | Os dois (o Codex pede medir em rede real antes de culpar o peso) |

## 3. O que só um achou
**Só o Codex** (o Claude conferiu no código e **confirma**):
- **Entrega do briefing é frágil.** Sem servidor, o lead fica no navegador do visitante e só chega pelo WhatsApp; a mensagem é **cortada em 1800 caracteres** (`18-briefing-assistente.js`, `.slice(0,1800)`), podendo perder respostas. O painel diz "Quando um briefing chega, ele aparece aqui", o que o fluxo não garante. O Codex classificou como crítico; o Claude concorda que é o **maior risco de negócio** (perder lead), embora seja uma limitação de arquitetura já registrada (Fase 2), não um problema visual.
- A URL do site está vazia em `src/seo.json` (sem canonical nem sitemap) e o PIN é verificado só no navegador (já documentado, não é autenticação de servidor).

**Só o Claude** (o Codex não citou):
- **Texto inclinado borra**: o cartão de serviços inclinado tem o bloco de leitura rotacionado, e subpixel borra o texto. Decoração pode inclinar; texto de leitura não.
- **Dívida de tokens**: `--pink`, `--blue` e `--vio` (nomes da identidade antiga) guardam cores terrosas e ainda são usados no CSS.
- Faixa de aviso (ticker) no topo repete o que o texto já diz; navegação em caixa alta pequena de fonte monoespaçada tem leitura difícil.
- Ícone em quadrado cinza repetido nos serviços parece espaço reservado.

## 4. Onde as avaliações divergem
- **Qual efeito manter.** O Codex sugere manter só o fundo discreto do topo e achar a esfera "intercambiável". O Claude discorda: a esfera é o ativo visual mais forte do site e **foi pedida pelo CEO** (AI-Driven com orbe); o que sobra é cortar os **cartões inclinados** e a repetição de pílulas. **Decisão do CEO.**
- **Peso.** O Codex pede medir antes de atribuir lentidão. Concordo. Medidas locais: carregamento em ~105 ms, 423 KB com gzip. Falta medir em rede móvel real.
- **Gravidade do briefing:** crítico (Codex) x risco de arquitetura já conhecido (Claude). Concordam na ação: dizer ao visitante o passo do WhatsApp **antes** de começar, e não perder resposta por corte.

## 5. O que preservar
Marca OR e monograma; paleta Earthen Luxe; fontes locais (Sora e Inter); CTA principal legível; a esfera da seção de IA; foco, diálogos e `prefers-reduced-motion`; CSP fechada; os 66 testes e a verificação do build.

## 6. Primeiras ações recomendadas (em ordem de impacto e risco)
1. **Briefing**: avisar o passo do WhatsApp antes de começar; não cortar a mensagem em 1800 (dividir em partes ou oferecer cópia); texto do painel honesto sobre quando o lead chega.
2. **Estrutura da página**: antecipar os serviços; condensar as explicações repetidas do processo.
3. **"Quem somos" real**: responsável, método e exemplos autorizados. **Depende de conteúdo do CEO** (não inventar).
4. **Menos efeito, mais composição**: sem cartões inclinados; um destaque em pílula por página; títulos secundários menores.
5. **Celular**: topo mais curto; reservar espaço para os botões flutuantes.
6. **Painel**: estados vazios com próxima ação; modelos de IA e backup para "Configurações".
7. **CSS**: consolidar por componente (títulos, botões, cartões), documentar o dono de cada propriedade, `@layer`, e migrar `--pink/--blue/--vio`.
8. **Peso**: medir em rede real e, se confirmar, carregar o painel separado do site público.
9. **SEO**: preencher a URL em `src/seo.json` (canonical e sitemap) quando houver o endereço.

## 7. Limites desta avaliação
Capturas de Captar clientes e Posts não foram analisadas pelo Codex; o Claude as tirou mas não as avaliou. Sem teste de teclado completo, Firefox, Safari ou tablet. Visual julgado sobre imagens estáticas (animações e rolagem não foram avaliadas em movimento). Não houve medição de rede real nem Lighthouse.
