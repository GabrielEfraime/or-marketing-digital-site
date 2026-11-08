# SPEC: OR Site Studio (Fase A, sem servidor)

**Status:** APROVADA pelo CEO em 2026-11-08 (decisões pendentes da seção 5 seguem abertas). Nada deste documento foi implementado.
**Autoridade:** depois de aprovado, este arquivo é a fonte da verdade do Site Studio. Código que contradiz a SPEC é defeito do código; mudança de requisito só por revisão desta SPEC, com data e aprovação do CEO.
**Auditoria:** cada requisito tem ID, regra e forma de verificação. A auditoria de conformidade (somente leitura) cita o ID no `spec-compliance/REPORT.md`.
**Linguagem:** interface, erros e mensagens em português do Brasil. Palavras: DEVE (obrigatório), NÃO DEVE (proibido), PODE (opcional).

## 1. Objetivo e escopo

O Site Studio, dentro da Minha área, parte de uma empresa (vinda da Captação ou digitada) e entrega: análise do negócio, site demonstrativo em HTML/CSS/JS navegável na plataforma, ajustes por conversa com histórico de versões, e proposta comercial com a identidade OR, exportável em PDF.

**Dentro da Fase A:** tudo que roda no navegador, com as chaves de IA já existentes (Groq, Gemini de reserva, Pollinations), `localStorage` e IndexedDB.

**Fora da Fase A (Fase B, só com confirmação do CEO):** servidor, link público da proposta, dados compartilhados entre navegadores/usuários, leitura automática de site ou Instagram de terceiros, login real.

## 2. Definições

- **Projeto:** um trabalho do Studio para uma empresa. Tem 1 estabelecimento, 0 ou 1 lead, 0 ou mais orçamentos, N versões do site e 0 ou mais propostas.
- **Versão:** estado imutável do código do site, criado a cada geração ou ajuste.
- **Fato informado:** dado vindo do briefing, do Places, do PageSpeed ou colado pelo consultor. **Inferência:** conclusão da IA sem fonte direta.
- **Tabela de preços:** `CFG.precos` (valores em uso, editáveis), cujo padrão vem de `PRECOS` (`01-config-precos.js`). A IA nunca faz conta nem inventa preço: o app calcula.

## 3. Requisitos

### 3.1 Projeto e CRM

| ID | Requisito | Verificação |
|---|---|---|
| SS-001 | O consultor DEVE poder criar um projeto a partir de um prospect da Captação, com nome, cidade, site e Instagram preenchidos do cadastro. | Teste manual: criar a partir de prospect; conferir campos. |
| SS-002 | O consultor DEVE poder criar um projeto manualmente informando URL do site e/ou Instagram, ou só o nome do negócio. Nenhum campo é obrigatório além do nome do negócio ou de uma URL. | Teste manual; campos vazios aceitos. |
| SS-003 | Cada projeto DEVE guardar o vínculo ao estabelecimento (prospect) e, quando existir, ao lead e aos orçamentos. O vínculo DEVE ser navegável nos dois sentidos (do lead ao projeto e do projeto ao lead). | Revisão de código e teste manual. |
| SS-004 | Quando o prospect virar lead ("Fechou: criar lead"), o projeto DEVE continuar ligado ao novo lead sem duplicar o projeto. | Teste manual do fluxo completo. |
| SS-005 | O histórico de negociação do projeto (análise gerada, versões, propostas geradas, propostas exportadas, mudança de etapa) DEVE ser registrado em ordem cronológica com data e hora. | Teste manual; leitura do registro. |
| SS-006 | O projeto DEVE ter etapa própria (rascunho, em análise, site pronto, proposta pronta, proposta enviada, fechado, perdido). A mudança de etapa DEVE ser sempre manual pelo consultor. | Revisão de código; teste manual. |

### 3.2 Análise do negócio

| ID | Requisito | Verificação |
|---|---|---|
| SS-007 | A análise DEVE usar só: dados do cadastro, resultado do PageSpeed (quando medido), e texto/HTML/imagens colados pelo consultor. NÃO DEVE buscar páginas de terceiros por conta própria na Fase A. | Revisão de código: nenhuma requisição ao domínio do cliente; CSP sem novo `connect-src` para domínios arbitrários. |
| SS-008 | A análise DEVE separar, na tela e nos dados, "fatos informados" (com a origem) e "inferências". Toda inferência DEVE ser rotulada como tal. | Teste manual; inspeção do formato salvo. |
| SS-009 | A análise DEVE listar pontos fortes, problemas e oportunidades. Quando faltar informação para um item, DEVE escrever "não informado", sem inventar. | Teste com briefing mínimo: nenhum dado inventado. |
| SS-010 | A análise NÃO DEVE conter depoimentos, avaliações, números de resultado, prêmios, anos de atuação ou endereços que não estejam nos fatos informados. Avaliações do Google só como vieram, com a nota e a contagem reais. | Teste com briefing sem esses dados; revisão do prompt. |
| SS-011 | Texto externo colado (site, Instagram, avaliações) DEVE entrar no prompt marcado como dado, nunca como instrução. Instruções dentro dele NÃO DEVEM alterar o comportamento da IA. | Teste com texto colado contendo "ignore as regras anteriores"; resposta segue as regras. |
| SS-012 | Se a IA falhar, a análise DEVE mostrar erro em português com a opção de tentar de novo ou usar a outra IA, sem travar a tela nem perder o que o consultor digitou. | Teste desligando a rede e com chave inválida. |

### 3.3 Geração e visualização do site

| ID | Requisito | Verificação |
|---|---|---|
| SS-013 | O consultor DEVE poder escolher "Redesenhar" (existe site) ou "Criar do zero". O modo DEVE ser registrado no projeto. | Teste manual. |
| SS-014 | A IA DEVE gerar HTML, CSS e JavaScript de um site responsivo, navegável por menu entre 1 e 5 seções ou páginas na primeira versão. | Teste manual em 375px e desktop; navegação funciona. |
| SS-015 | O site gerado DEVE ser exibido dentro da plataforma em `iframe` com `sandbox` sem `allow-same-origin`, sob a CSP vigente, sem recursos externos (imagens, fontes, scripts, CDN). | Revisão de código; teste de que um script externo no HTML gerado não carrega. |
| SS-016 | Todo HTML gerado que sair do app (download, cópia, proposta, PDF) DEVE passar por `sanitizaHtml`. O que é exibido no iframe DEVE continuar isolado pelo `sandbox`. | Revisão de código e teste com HTML gerado contendo `<script src>` externo e `onerror`. |
| SS-017 | O site DEVE usar só informações do projeto: nome, contatos, endereço, serviços e fotos informados. Links de WhatsApp, mapa e Instagram DEVEM ser colocados pelo app, nunca pela IA. NÃO DEVE conter depoimentos nem números inventados. | Teste com projeto sem esses dados: nenhum aparece. |
| SS-018 | Toda demonstração DEVE exibir a faixa "Prévia feita pela OR Marketing Digital para [negócio]. Não é o site oficial" e a marca `noindex`, e creditar fotos de terceiros quando houver. | Teste manual; inspeção do HTML. |
| SS-019 | O site gerado DEVE atender: foco visível, contraste suficiente, `alt` nas imagens, `lang="pt-BR"`, alvos de toque de pelo menos 44px, `prefers-reduced-motion` respeitado. | Checklist manual e verificação automática simples do HTML. |

### 3.4 Chat de modificações e versões

| ID | Requisito | Verificação |
|---|---|---|
| SS-020 | O consultor DEVE poder pedir mudanças em linguagem natural (layout, cores, seções, páginas, textos). Cada pedido bem-sucedido DEVE criar uma versão nova sem alterar as anteriores. | Teste manual: 3 pedidos geram 3 versões novas; as antigas permanecem. |
| SS-021 | A prévia DEVE atualizar após cada versão. Durante o streaming, DEVE atualizar só o painel de leitura e re-renderizar a prévia ao final. | Teste manual com resposta longa. |
| SS-022 | O consultor DEVE poder desfazer (voltar para a versão anterior) e refazer, e abrir qualquer versão antiga. Voltar NÃO DEVE apagar versões. Cada versão DEVE ter data, o pedido que a originou e a IA que respondeu. | Teste manual; inspeção do armazenamento. |
| SS-023 | O app DEVE permitir comparar duas versões (lado a lado ou lista de diferenças). | Teste manual. |
| SS-024 | Se a IA devolver HTML inválido, vazio ou sem estrutura mínima, DEVE manter a versão atual, avisar em português e permitir tentar de novo. NÃO DEVE criar versão quebrada. | Teste com resposta simulada inválida. |
| SS-025 | O app DEVE limitar o número de versões guardadas por projeto (valor definido na implementação) e avisar antes de descartar a mais antiga. Versão marcada como "enviada ao cliente" NÃO DEVE ser descartada automaticamente. | Teste manual com o limite baixado. |

### 3.5 Proposta comercial

| ID | Requisito | Verificação |
|---|---|---|
| SS-026 | A proposta DEVE conter: análise do negócio, melhorias sugeridas, demonstração do novo site (captura estática ou resumo com link para o arquivo HTML), serviços oferecidos e valores. | Teste manual; conferência das seções. |
| SS-027 | Os valores DEVEM vir só de `CFG.precos` ou serem digitados pelo consultor no projeto. Item fora da tabela e sem valor digitado DEVE mostrar "a confirmar". Somas DEVEM ser conferidas, com Médio como recomendado, e desconto de combo só se estiver na tabela. | Teste com itens dentro e fora da tabela; conferência aritmética; teste unitário da soma. |
| SS-028 | A proposta NÃO DEVE prometer resultado (vendas, ranking, número de leads, prazo de retorno). Linguagem de entregáveis e processo. | Revisão do prompt e do texto gerado em 3 casos. |
| SS-029 | A proposta DEVE usar a identidade Earthen Luxe (tokens do `:root`, logo oficial do kit) e abrir no navegador sem recurso externo. | Teste manual; inspeção do HTML. |
| SS-030 | O consultor DEVE revisar e poder editar o texto antes de exportar. Nada DEVE ser enviado ao cliente pelo app. A exportação em PDF DEVE ser feita pela impressão do navegador e ser acionada só por clique do consultor. | Revisão de código: nenhum envio automático. |
| SS-031 | Cada proposta exportada DEVE ficar registrada no histórico do projeto com data, versão do site usada e total. | Teste manual. |

### 3.6 Segurança, privacidade e infraestrutura

| ID | Requisito | Verificação |
|---|---|---|
| SS-032 | Toda entrada de usuário ou da IA exibida na tela DEVE passar por `esc()`. NÃO DEVE existir `innerHTML` com texto cru. | Revisão de código (busca por `innerHTML`); teste com `<img onerror>` nos campos. |
| SS-033 | Nenhuma chave de API DEVE estar no código, no `dist/`, nos backups nem no histórico do projeto. | `npm run verificar`; busca por padrões de chave. |
| SS-034 | A Fase A NÃO DEVE adicionar nenhum domínio novo ao `connect-src` da CSP, nem relaxar `default-src`, `script-src` ou `frame-src`. | Diff da CSP; `npm run verificar`. |
| SS-035 | Dados do projeto DEVEM ser guardados no navegador com fallback em memória e aviso quando o `localStorage` estiver bloqueado. Arquivos pesados (versões, capturas) DEVEM ir para o IndexedDB. | Teste com `localStorage` bloqueado. |
| SS-036 | O backup do app DEVE incluir os projetos, versões e propostas, mesclando por `id` e vencendo o maior `t`. Se algo não entrar no backup, a tela DEVE avisar. | Teste de exportar e importar em outro navegador. |
| SS-037 | Dados pessoais do lead (telefone, e-mail, endereço pessoal) NÃO DEVEM entrar na proposta nem no site demonstrativo além do que o consultor marcar para aparecer. NÃO DEVE existir pedido de senha de cliente. | Teste manual; revisão de campos. |
| SS-038 | O app DEVE continuar funcionando sem erro de JS no console, só em tema escuro, em 375px e desktop, sem rolagem horizontal. | Teste manual; console limpo; `npm run verificar` e testes existentes passando. |

### 3.7 Qualidade e processo

| ID | Requisito | Verificação |
|---|---|---|
| SS-039 | Erro de uma IA NÃO DEVE travar a fila nem apagar trabalho. A outra IA DEVE ser tentada e o app DEVE avisar quem respondeu, conforme o comportamento atual do `askF`. | Teste com a primeira IA indisponível. |
| SS-040 | Toda funcionalidade nova DEVE ter teste automatizado quando for lógica pura (somas, versões, mesclagem de backup, validação do HTML gerado). Os 14 testes atuais DEVEM continuar passando. | `npm run verificar`. |
| SS-041 | Nenhuma publicação em produção DEVE ocorrer antes de: testes passando, revisão do dev-seguranca, passagem do testador e auditoria de conformidade desta SPEC sem item crítico em aberto. | Registro em `spec-compliance/REPORT.md`. |
| SS-042 | Nenhuma chamada de IA DEVE ocorrer ao abrir o site, a Minha área ou um projeto. Toda chamada DEVE partir de um clique do consultor. | Revisão de código; teste com a aba de rede aberta ao abrir um projeto. |
| SS-043 | O código novo DEVE ficar em arquivos novos de `src/js/`, incluídos em `src/ordem.json`, sem repetir nomes do escopo global. A mudança DEVE ser feita em `src/`, nunca em `dist/`. | Revisão de código; `npm run montar` sem conflito. |

### 3.8 Dentro do site (acrescentado em 2026-11-08, pedido do CEO; aguarda aprovação)

| ID | Requisito | Verificação |
|---|---|---|
| SS-044 | O consultor DEVE poder apresentar o site demonstrativo e a proposta em tela cheia dentro do próprio site, sem baixar arquivo nem abrir outro programa, com tamanhos de celular, tablet e computador. O modo Apresentar DEVE fechar com Esc e com um botão visível, prender o foco enquanto aberto, devolver o foco ao fechar, e mostrar o site sempre com a faixa de prévia. O JavaScript do site só liga por escolha do consultor. A proposta só pode ser impressa pelo modo Apresentar depois da marca "revisei" e sem promessa no texto. | Teste manual em desktop e 375px; revisão de código (iframe sandbox sem allow-same-origin, sem rede). |
| SS-045 | O consultor DEVE poder pedir, no Studio, uma revisão do site por um segundo modelo de IA diferente do que gerou, como segunda opinião. A chamada DEVE partir de um clique, tratar o HTML revisado como dado (nunca instrução, sem deixar fechar o bloco de dados), enviar no máximo 60 mil caracteres, limitar a resposta a 8 itens por gravidade e mostrar quem respondeu. Cada sugestão DEVE poder virar um pedido de mudança com um clique, que o consultor revisa antes de aplicar. A revisão NÃO DEVE alterar o site sozinha. | Testes automatizados do prompt e da leitura da resposta; teste manual com a Groq real. |

## 4. Auditoria de conformidade

- A auditoria compara o código com esta SPEC, é somente leitura e não altera código.
- Saídas: `spec-compliance/REPORT.md` (resultado por requisito, com evidência `arquivo:linha`) e a matriz de alinhamento (requisito x código x teste x situação: atendido, parcial, não atendido, não verificável).
- Todo requisito não verificável sem rodar o app DEVE ser marcado "não verificável estaticamente", e não "atendido".

## 5. Decisões pendentes do CEO (bloqueiam partes da SPEC)

1. Valores e pacotes do site e da proposta (SS-027). Hoje só existe a tabela de orçamentos.
2. Papel do Felipe (sócio ou colaborador). Na Fase A, cada um usa seu navegador e troca dados por backup.
3. Ambiente de homologação: `npm run abrir` local, ou branch/Pages de teste. Hoje a pasta não é repositório git.
4. Servidor da Fase B (Cloudflare ou Supabase). Não afeta a Fase A.
5. Limite de versões por projeto (SS-025).

## 6. Fora de escopo explícito da Fase A

Leitura automática de site e Instagram de terceiros; link público da proposta; compartilhamento entre navegadores; login real; envio automático de mensagem ou proposta; publicação do site do cliente; cobrança.

## 7. Histórico

- 2026-11-08: acrescentados SS-044 e SS-045 (modo Apresentar e revisão por segundo modelo), a pedido do CEO; aguardam aprovação.
- 2026-11-08: aprovada pelo CEO.
- 2026-11-08: rascunho criado (43 requisitos, SS-001 a SS-043).
