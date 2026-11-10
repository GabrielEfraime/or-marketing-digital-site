# DESIGN_SYSTEM.md: padrão visual da OR Marketing Digital

Autoridade para **visual, tokens e componentes**. Regras gerais de trabalho: `AGENTS.md`. Os valores abaixo vêm do código (`src/css/23-identidade-earthen.css`, `01-tokens-reset.css`); se divergirem, o código vence e este arquivo deve ser corrigido. Kit da marca (logos, paleta, fontes, manual): `marca/OR_Identidade_Earthen_Luxe/`.

## 1. Identidade: Earthen Luxe
Terrosa, sóbria, premium. Só **tema escuro**. Sem laranja. Interface **sem emoji** (ícones de linha). Estilo clean e minimalista, com um toque 3D controlado (topo do site e a esfera da seção de IA).

| Token | Valor | Uso |
|---|---|---|
| `--or-obsidiana` | `#0A0908` | fundo principal, texto sobre areia |
| `--or-ardosia` | `#22333B` | cartões e blocos de contraste |
| `--or-marfim` | `#EAE0D5` | texto principal, cartões claros |
| `--or-areia` | `#C6AC8E` | destaque, botão principal, foco |
| `--or-terra` | `#5E503F` | fundos quentes, linhas |
| `--ok` `--err` `--warn` `--info` | `#93B59F` `#E8786F` `#D9A95B` `#8FB3C4` | estados |

**Dívida de nomes:** `--pink`, `--blue` e `--vio` (herdados da identidade antiga) hoje guardam cores da paleta terrosa (`#5E503F`, `#C6AC8E`). Novas telas usam os tokens `--or-*`; migrar os antigos aos poucos.

## 2. Tipografia
- Títulos: **Sora** (`--fd`). Texto e interface: **Inter** (`--fb`). Fontes locais (woff2 embutido); nunca Google Fonts.
- Escala: `--t-xs` 12 · `--t-sm` 14 · `--t-md` 16 · `--t-lg` 20 · `--t-xl` 28 · `--t-2xl` 40 px. Altura de linha: título 1,2 · interface 1,5 · texto 1,6.
- Títulos gigantes (acima de `--t-2xl`) só no topo do site. Seções comuns usam a escala acima; variar o peso e a composição, não só o tamanho.

## 3. Espaço, movimento e camadas
- Espaço: `--sp-1..7` = 4, 8, 12, 16, 24, 32, 48 px. Altura do menu `--nav-h` 68px.
- Movimento: `--dur-1` 120ms, `--dur-2` 200ms, `--dur-3` 320ms, curva `--ease`. Animar só `transform` e `opacity`. **`prefers-reduced-motion` desliga o movimento.**
- Camadas: `--z-base` 1, `--z-nav` 50, `--z-modal` 100, `--z-toast` 200, `--z-topo` 300.

## 4. Componentes (onde moram)
Botões (`.btn`, `.btn.hl` principal, `.btn.ghost`), painéis (`.panel`), chips (`.cap-chip`), etiquetas (`.cap-tag`), cartões de serviço e de pacote, diálogos (`dlg`, `confirma`). Vidro (`backdrop-filter`) **só em barras, botões e menus**. Antes de criar um componente, procure um existente (`grep` na classe) e reuse. Componente novo: um dono de CSS por propriedade, sem `!important` novo.

## 5. Regras de acessibilidade visual
Foco visível sempre (anel `--focus`). Contraste AA (4,5:1 texto normal, 3:1 grande). Alvos de toque de pelo menos 44px. Nada que dependa só de cor. Texto em imagem só com equivalente em texto.

## 6. Como evitar o visual genérico de IA
Diagnóstico de 08/11/2026 (Claude e Codex, independentes, `docs/DIAGNOSTICO-SITE-2026-11-08.md`). Checklist para toda tela nova ou revisada:
1. **Um efeito protagonista por tela** (fundo, esfera ou cartões inclinados; não os três juntos).
2. **Destaque em pílula** (palavra do título em caixa): no máximo um por página.
3. **Escala editorial**: título monumental só no topo; seções seguintes menores e com composição que muda conforme a informação.
4. **Conteúdo antes de enfeite**: cada seção responde a uma pergunta do cliente (o que fazem, para quem, como provam). Sem texto que só descreve "como a IA funciona" repetido.
5. **Provas reais**: pessoas, método e exemplos autorizados; nunca depoimento, número ou cliente inventado.
6. **Cartões iguais não valem**: se três cartões diferem só no nome, mostre a diferença concreta ou junte.
7. **Texto inclinado** (transform rotate) borra e cansa: inclinar só decoração, nunca bloco de leitura.
8. **Estado vazio com próxima ação** (painel): nunca uma tela só de zeros.
9. Ícones: de linha e específicos; evitar o "ícone em quadrado cinza" repetido.

## 7. Processo para interface grande
1. Levantar **referências** (iBoost e YDR são benchmarks de qualidade já usados; **não copiar**: extrair padrões como ritmo, tipografia e hierarquia) e anotar o que se aprende de cada uma.
2. Propor **duas ou três direções** (esboço ou protótipo curto) e escolher uma com justificativa, ouvindo a revisão do Codex.
3. Implementar usando os tokens; **uma tela por vez**.
4. **Validação visual real** (`TESTING.md`): capturas em 1440x900 e 390x844, comparadas com a direção escolhida. "O HTML renderiza" não é critério de pronto.
5. Atualizar este arquivo se surgir um padrão novo.

## 8. Minha área, direção C (09/11/2026)
Casca, Dashboard, Configurações e o estilo das demais telas vivem em `src/css/29-minha-area-painel.css` (escopo `html body.adm`, tokens `--pn-*`; vem por último). Cartão: raio 22, gradiente leve sobre `#100E0D`, fio de 1px; gap 16 (12 no celular), margem lateral 32 (16); item de menu e botão de 44px; vidro só no item ativo, na busca, nos botões secundários e na barra inferior. Menu lateral agrupado (Visão geral, Ferramentas, Acompanhamento, Inteligência artificial); Backup e IAs ficam em Configurações (menu do avatar), recolhidos. Abaixo de 860px: barra inferior com 5 atalhos e folha "Mais". Direção de referência: `capturas-referencia/direcoes/prancha-C.html` (pasta ignorada pelo git).
