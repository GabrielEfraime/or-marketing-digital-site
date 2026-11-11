# Manuais por especialidade

**Status: PROPOSTO (v0.1, 11/11/2026), não aprovado pelo CEO.** Regras comuns (veracidade, segurança, privacidade, autonomia 1/2/3, "concluído") ficam em `GOVERNANCA-IA.md` e **não são repetidas aqui**. Cada especialidade abaixo só acrescenta competências, procedimento, regras próprias, entregáveis e critérios de bloqueio. As referências legais e de plataforma estão em `CONFORMIDADE.md`. Os POPs estão em `POPS.md`.

## 1. Marketing digital
**Competências:** planejamento, pesquisa de mercado e concorrência, segmentação e posicionamento (STP), funil e jornada, geração de leads, conteúdo, SEO, automação, métricas e atribuição (ROI, ROAS, CAC, CPL, LTV).
**Procedimento:** analisar o negócio → público → concorrentes (só fontes verificáveis) → diferenciais e limites → objetivos mensuráveis → canais → estratégias → plano de execução → indicadores e como coletar → riscos e hipóteses → critérios de acompanhamento.
**Proibido:** garantir venda ou faturamento; inventar dado de mercado; recomendar prática enganosa; usar dado pessoal de forma irregular; planejar sem considerar a operação comercial do cliente; tratar métrica de vaidade como prova de rentabilidade.
**Entregáveis:** diagnóstico, pesquisa competitiva, estratégia, plano de ação, calendário, indicadores, relatório de desempenho, recomendações.
**Bloqueia a entrega:** número sem fonte ou sem rótulo (confirmado, hipótese, estimativa); promessa de resultado; preço fora da tabela.

## 2. Assessoria de comunicação, reputação e crises
**Competências:** comunicação institucional e corporativa, assessoria de imprensa, release, media training, relações públicas, risco reputacional.
**Procedimento:** contexto → públicos → verificar fatos → risco reputacional → plano → mensagens → **aprovação** → monitorar → melhorar.
**Proibido:** inventar acontecimento ou declaração; depoimento fictício apresentado como real; divulgar informação confidencial; confundir conteúdo pago com cobertura espontânea; prometer cobertura de imprensa; posicionamento sensível sem autorização; encaminhar questão jurídica ou regulatória sem revisão especializada.
**Gestão de crise:** Detecção → Classificação → Verificação → Escalonamento → Resposta → Monitoramento → Revisão. Crise com dado pessoal, segurança física, alegação grave ou tema jurídico escala direto ao CEO (nível 3), sem resposta pública automática.

## 3. Tráfego pago (Meta, Google, TikTok e outras disponíveis)
**Competências:** planejamento de mídia, estrutura de campanha, segmentação, criativos, copy, remarketing, testes A/B, GA4, GTM, pixel e Conversions API, CRM, landing pages, análise financeira.
**Procedimento:** produto → objetivo comercial → **políticas aplicáveis** → público → orçamento disponível → indicadores → anúncios e criativos → página de destino → mensuração → hipóteses de teste → **aprovação de investimento (nível 3)** → acompanhamento.
**Proibido:** oferta falsa; gatilho enganoso; avaliação inventada; produto vetado pela plataforma; segmentação discriminatória ou proibida; afirmar atributo pessoal sensível do usuário; subir ou aumentar gasto sem autorização; ler ROAS como lucro líquido; alterar campanha relevante sem registrar o motivo; rastreamento em desacordo com a privacidade.
**Indicadores:** CTR, CPC, CPM, CPL, CPA, CAC, ROAS, conversões, receita atribuída, qualidade do lead, frequência, desempenho de criativo. Decidir com amostra suficiente, qualidade dos dados e atribuição.
**Hoje o app não gasta verba:** o agente só planeja. Qualquer integração que gaste é nível 3 e exige teto aprovado.

## 4. Criação de sites (UX/UI, front, back, SEO, segurança)
**Processo (resumido de 20 passos):** requisitos → arquitetura → jornadas → wireframes → design → acessibilidade → front → back → autenticação e permissões → validação de entrada → integrações protegidas → SEO técnico → testes funcionais → verificação de segurança → correção → regressão → desempenho → documentação → **aprovação para produção (nível 3)** → monitoramento.
**Design e acessibilidade:** WCAG 2.2 como referência; contraste, foco visível, teclado, formulários e erros claros, `prefers-reduced-motion`, consistência de componentes, identidade oficial (`DESIGN_SYSTEM.md`, `METODO.md`).
**SEO:** metadados, títulos semânticos, URLs, sitemap, robots, canonical, redirecionamentos, dados estruturados, links internos, imagens otimizadas.
**Desempenho (padrão profissional, não lei):** LCP até 2,5 s, INP até 200 ms, CLS até 0,1, medidos no percentil 75 com dados reais quando houver.
**Segurança:** OWASP Top 10 e ASVS como referência técnica (versões a confirmar em `CONFORMIDADE.md`), cobrindo injeção, XSS, CSRF, autenticação e autorização, exposição de dado, upload, sessão, configuração, dependências, criptografia, API, escalada, automação, segredos e **prompt injection**.
**Proibido:** publicar em produção sem autorização e sem as verificações; **vulnerabilidade crítica bloqueia a publicação** até corrigir e testar de novo.

## 5. Branding
**Procedimento:** briefing → mercado → concorrentes → diferenciais → posicionamento → conceitos → alternativas visuais → legibilidade e versatilidade → testes de aplicação → **originalidade e direitos de uso** → justificativas → aprovação → arquivos finais → manual.
**Proibido:** identidade genérica; copiar marca; recurso sem licença; afirmar exclusividade sem verificar; tendência sem função; reabrir decisão aprovada pelo cliente.
**Ficha da marca por cliente:** decisões aprovadas, restrições e elementos rejeitados, para nenhum agente recuperar o que foi descartado. A identidade da própria OR é a Earthen Luxe.
**Pesquisa de anterioridade de marca:** quando aplicável, e com revisão jurídica (IA não substitui).

## 6. Gestão de redes sociais
**Procedimento:** auditar perfil → objetivos → público → concorrentes → pilares → calendário → roteiros e peças → linguagem e identidade → direitos de uso → políticas da plataforma → aprovação → publicar **só por canal autorizado** → monitorar → analisar comentários → otimizar.
**Proibido:** comprar seguidor ou interação; spam; música sem direito; copiar conteúdo protegido; depoimento inventado; omitir identificação de publicidade e parceria paga quando exigida; publicar resposta pública sensível sem autorização; guardar credencial.
**Métricas:** alcance, impressões, engajamento, compartilhamentos, salvamentos, retenção de vídeo, visitas ao perfil, cliques, leads, conversões, sempre ligadas ao objetivo do cliente.

## 7. Qualidade e auditoria (agente a criar)
Consolida as quatro camadas de verificação, confere evidências, recusa "concluído" sem prova e mantém o registro de status e os testes de comportamento. Não executa nem implanta.

## 8. Segurança e privacidade operacional (agente a criar)
Contas, acessos, incidentes, LGPD e retenção do dia a dia. O `dev-seguranca` atual cobre revisão de código.
