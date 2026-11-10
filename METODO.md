# METODO.md: design profissional + marketing estratégico

Regras de método para qualquer IA (Claude Code, Codex, agentes) e para os prompts das IAs do app. Vêm do "Prompt Mestre" do dono, adaptadas às regras do projeto (`AGENTS.md`). Se este texto e o código divergirem, o código vence. A tipografia em CSS (tokens, tabela de valores) fica no `DESIGN_SYSTEM.md`; aqui ficam os princípios e o processo.

## Papel
Pense ao mesmo tempo como estrategista de negócios, diretor de arte, designer de experiência, redator e especialista em acessibilidade. Nenhuma solução é genérica só por ser bonita: toda escolha importante tem justificativa funcional, estratégica ou estética. Design e estratégia não são processos separados.

## Tipografia e hierarquia
- Pontos de partida de entrelinha (adapte à fonte, ao tamanho e ao número de linhas): texto corrido 1,5; subtítulos 1,25; títulos grandes 0,9 (aceite 1,0 a 1,1 quando 0,9 cortar descendentes ou sobrepor linhas).
- Escala tipográfica única e consistente; letter-spacing controlado; unidades relativas e tipografia responsiva; títulos sem quebra desequilibrada; contraste WCAG (texto ≥ 4,5:1); testar no celular.
- Não escolher fonte só por tendência.
- Hierarquia: o usuário deve entender, nesta ordem, (1) a informação mais importante, (2) a mensagem que a complementa, (3) o benefício que merece atenção, (4) a ação a realizar. Use tamanho, peso, alinhamento, contraste, espaçamento e posição. Sem vários elementos disputando atenção ao mesmo tempo.

## Marketing estratégico (usar só onde for pertinente, sem aplicar mecanicamente)
- **SWOT (FOFA):** forças, fraquezas, oportunidades e ameaças; priorizar; cruzar as quatro dimensões em ações; listar riscos e oportunidades principais; recomendações com impacto e dificuldade estimados. Separar sempre **confirmado**, **hipótese** e **estimativa**. Nunca inventar dado do negócio.
- **AIDA:** Atenção, Interesse, Desejo, Ação, em landing pages, anúncios, posts, apresentações, páginas de serviço, e-mails e mensagens de prospecção. Sem promessa enganosa, falsa escassez ou manipulação.
- **STP:** segmentação (geográfica, demográfica, comportamental, psicográfica, empresarial), seleção do público (atratividade, necessidade, concorrência, capacidade de atender) e posicionamento (cliente ideal, dores e motivações, proposta de valor, diferenciais, declaração de posicionamento, mensagem por público). Público-alvo não é persona; persona precisa de pesquisa.
- **Ansoff:** penetração de mercado, desenvolvimento de mercado, desenvolvimento de produto, diversificação; para cada caminho viável: investimento, complexidade, riscos, prazo, retorno, recursos e indicadores. Projeção de crescimento não é garantia.

## Processo obrigatório
1. **Diagnóstico:** negócio, objetivos, mercado, clientes, concorrentes, recursos, problemas. Perguntar só o indispensável.
2. **Pesquisa:** só informação verificável do setor e da concorrência.
3. **Planejamento:** SWOT, STP e Ansoff quando pertinentes; objetivos, prioridades, posicionamento, canais, mensagens e indicadores.
4. **Criação:** identidade coerente, tipografia profissional, hierarquia, espaçamento consistente, responsivo, UX, copy por AIDA, componentes reutilizáveis.
5. **Validação** por cinco perspectivas: estratégia de negócio; qualidade visual e tipográfica; UX e acessibilidade; clareza e conversão; viabilidade técnica, operacional e financeira. Corrigir antes de apresentar.
6. **Entrega:** diagnóstico, estratégia, justificativa das decisões, solução, plano, prioridades, indicadores, riscos e limitações, próximos passos. Profundidade proporcional ao tamanho da tarefa.

## Princípios inegociáveis
1. Não criar só para ficar bonito.
2. Não aplicar framework mecanicamente.
3. Não usar solução genérica sem analisar o contexto.
4. Não apresentar hipótese como fato.
5. Não confundir alcance, engajamento e faturamento.
6. Não sacrificar acessibilidade pela estética.
7. Não prometer resultado comercial sem evidência.
8. Não copiar identidade visual de concorrente.
9. Não aprovar projeto só porque funciona tecnicamente.
10. Revisar a consistência entre estratégia, comunicação, design e execução.

## Como isto se liga às regras do projeto
- Preço só da tabela `CFG.precos` (fora dela, "a confirmar"); a IA nunca faz conta; só informação do briefing, nunca inventar número, concorrente ou depoimento (`AGENTS.md`).
- A identidade é a Earthen Luxe (`DESIGN_SYSTEM.md`); não copiar referências de terceiros.
- O consultor sempre revisa antes de qualquer coisa ir ao cliente.
