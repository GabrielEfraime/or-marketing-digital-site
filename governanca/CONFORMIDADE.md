# Biblioteca de conformidade e políticas

**Status: PROPOSTO (v0.1, 11/11/2026).** Ainda **não houve verificação** de nenhuma versão vigente: a coluna "Última verificação" está **não verificada** porque a consulta às fontes oficiais não foi feita nesta etapa. Antes de qualquer agente usar uma regra daqui como exigência, a fonte oficial deve ser aberta e a data registrada. Nenhuma regra abaixo é parecer jurídico: itens com risco legal precisam de **revisão jurídica**. Não invente norma; se não for possível confirmar, diga.

Registro por referência: nome, fonte oficial, versão ou data, última verificação, área de aplicação, regras relevantes, necessidade de atualização, limites e pontos que exigem revisão jurídica. Os endereços são as fontes oficiais usuais, conferir antes de citar.

## Legislação brasileira
| Referência | Fonte oficial | Aplicação | Versão/data | Última verificação | Observação |
|---|---|---|---|---|---|
| LGPD, Lei 13.709/2018 | planalto.gov.br | Dado pessoal de lead, cliente, candidato, retenção, transferência internacional (provedores de IA) | a confirmar | não verificada | Revisão jurídica: base legal, aviso e direitos do titular |
| Código de Defesa do Consumidor, Lei 8.078/1990 | planalto.gov.br | Oferta, preço, publicidade enganosa ou abusiva | a confirmar | não verificada | |
| Decreto 7.962/2013 (comércio eletrônico) | planalto.gov.br | Informação clara em contratação online | a confirmar | não verificada | |
| CONAR, Código Brasileiro de Autorregulamentação Publicitária | conar.org.br | Publicidade: veracidade, identificação de anúncio, setores sensíveis | a confirmar | não verificada | Autorregulação, não lei; diferenciar |
| Lei de Direitos Autorais, Lei 9.610/1998 | planalto.gov.br | Imagem, texto, música, fonte de terceiros | a confirmar | não verificada | |
| Lei da Propriedade Industrial, Lei 9.279/1996 | planalto.gov.br | Marcas, anterioridade | a confirmar | não verificada | Consulta ao INPI com revisão especializada |
| Marco Civil da Internet, Lei 12.965/2014 | planalto.gov.br | Registro de acesso, responsabilidade de provedores | a confirmar | não verificada | |
| ECA, Lei 8.069/1990 e regras sobre publicidade dirigida a crianças | planalto.gov.br e órgãos competentes | Conteúdo e anúncio com público infantil | a confirmar | não verificada | Setor sensível: revisão jurídica |
| Normas de setor regulado (saúde, jurídico, financeiro etc.) | Conselho ou agência do setor | Anúncios de profissão regulamentada | a confirmar | não verificada | O app já tem checklist (`rgpAntesDeAprovar`); regras ficam em revisão humana |

## Políticas de plataformas (obrigatórias para anunciar ou publicar)
| Referência | Fonte oficial | Aplicação | Última verificação |
|---|---|---|---|
| Políticas do Google Ads | Central de Ajuda do Google Ads | Anúncios de pesquisa, display, vídeo | não verificada |
| Políticas de anúncios da Meta (Facebook e Instagram) | Central de Transparência da Meta | Anúncios, segmentação, conteúdo | não verificada |
| Políticas de anúncios do TikTok | Central de Ajuda do TikTok Ads | Anúncios | não verificada |
| Documentação oficial do Google Search (diretrizes para webmasters) | developers.google.com/search | SEO técnico | não verificada |

## Padrões técnicos (recomendados, não são lei)
| Referência | Fonte | Observação | Última verificação |
|---|---|---|---|
| WCAG 2.2 | w3.org/TR/WCAG22 | Acessibilidade; o CEO adota 2.2 como referência | não verificada |
| OWASP Top 10 (o CEO indicou a edição 2025) | owasp.org | **Confirmar que a edição 2025 existe e está vigente antes de citar** | não verificada |
| OWASP ASVS (o CEO indicou a versão 5.0) | owasp.org | **Confirmar versão antes de citar** | não verificada |
| Core Web Vitals (LCP 2,5 s, INP 200 ms, CLS 0,1) | web.dev | Metas de desempenho; padrão profissional | não verificada |

## Rotina de atualização
Revisar a biblioteca a cada 6 meses e sempre que mudar uma lei, uma política de plataforma ou o serviço oferecido. Quem atualiza registra a data, a fonte aberta e o que mudou, em branch própria, com aprovação do CEO. Regra que não puder ser verificada fica marcada como **incerta**.

## Limites
Avaliação feita por IA não substitui parecer jurídico, auditoria independente nem certificação de segurança quando exigidos. Pontos para advogado: base legal e transferência internacional de dados (Groq, Google), mensagem comercial a quem não consentiu, publicidade de profissão regulamentada, propriedade de marca.
