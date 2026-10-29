# Plano de resposta a incidentes de segurança com dados pessoais — [NOME DA MARCA]

> **RASCUNHO interno** para revisão jurídica. Uso: consultor/controlador. Não é para publicar.
> Versão: [AAAA-MM] · Responsável: [NOME] · Contato de emergência: [TELEFONE/E-MAIL]

**Incidente** = qualquer evento que exponha, perca, altere, destrua ou permita acesso indevido a dados pessoais de clientes ou leads.
Dados que temos: nome, WhatsApp, e-mail (opcional), respostas do briefing, orçamentos, métricas e acessos de clientes, registros do painel.

## 1. Onde ficam os dados (o que pode vazar)
| Local | Risco típico |
|---|---|
| Navegador do notebook (`localStorage`, leads e configurações) | Notebook perdido/roubado, malware, uso por terceiros |
| Pasta de backup no HD (`leads.json`, `historico/`, `clientes/`) | Pasta copiada, nuvem sincronizada sem proteção, HD perdido |
| Chaves das IAs (Groq e outras) | Chave vazada ou compartilhada, uso indevido |
| Serviços de IA e Google Fonts | Incidente no fornecedor |
| WhatsApp / e-mail | Mensagem enviada para a pessoa errada, conta invadida |
| Contas dos clientes (Google Ads, redes) | Acesso concedido sem revogação, conta do consultor invadida |

## 2. Sinais de alerta
Notebook perdido; alerta de login estranho; mensagem enviada ao número errado; chave de IA com uso que você não fez; pasta de backup em local público; cliente diz que recebeu contato indevido; fornecedor avisa de vazamento; PIN do painel alterado sem você.

## 3. Primeiras 24 horas (checklist)
1. **Anote a hora** em que percebeu e **quem** avisou. Não apague nada que possa servir de prova.
2. **Contenha:** 
   - Notebook perdido: bloquear/rastrear pelo sistema, trocar senhas do e-mail, do Google e do WhatsApp Web, encerrar sessões abertas.
   - Chave de IA vazada: **revogar e criar outra** no painel do provedor (apagar do código não basta), conferir o uso.
   - Conta invadida: trocar a senha, ativar verificação em duas etapas, encerrar sessões.
   - Backup exposto: tirar do ar/remover o compartilhamento e anotar quem teve acesso.
   - Mensagem enviada à pessoa errada: pedir exclusão e registrar quem recebeu e o que continha.
   - Acesso a conta de cliente: **revogar o acesso** (convite ou vínculo) enquanto investiga.
3. **Troque o PIN** do painel (botão "Trocar PIN") se houver suspeita de acesso.
4. **Preserve evidências:** prints, e-mails dos fornecedores, datas e horários.
5. **Preencha o registro** (seção 6).

## 4. Avaliação (em até [___] horas)
Responda e anote:
- Quais dados e de quantas pessoas? Há dado sensível (saúde, biometria, dados de crianças)? Há dados financeiros ou acessos de contas?
- O dado estava protegido (senha, criptografia)? Quem pode ter tido acesso?
- Qual o risco real para as pessoas (golpe, discriminação, dano financeiro, exposição)?
- O incidente já foi contido? Quanto tempo durou?

**Classifique:** Baixo (sem risco ou dado já público) · Médio · Alto (risco relevante a direitos e liberdades dos titulares). Em dúvida, trate como Alto e peça orientação jurídica.

## 5. Comunicação
Quando o incidente **puder acarretar risco ou dano relevante aos titulares**, a LGPD (art. 48) exige comunicar à **ANPD** e aos **titulares**. **Prazo e formulário: conferir a regulamentação vigente da ANPD (Resolução CD/ANPD nº 15/2024, que fixa prazo curto, a verificar) no momento do incidente.**
- Fazer a comunicação **mesmo sem ter todas as informações**, complementando depois.
- Se o risco for baixo, **registrar internamente** e guardar a justificativa.
- Fornecedores (IA, hospedagem) afetados: avisar por e-mail e pedir relatório.

**Modelo de aviso ao titular** (adaptar):
> Olá, [NOME]. Aqui é [SEU NOME], da [MARCA]. No dia [DATA], identificamos [O QUE ACONTECEU, em linguagem simples]. Isso pode ter exposto [DADOS AFETADOS]. Já tomamos estas medidas: [MEDIDAS]. Recomendamos que você [ORIENTAÇÃO, ex.: desconfie de mensagens com o nosso nome pedindo dinheiro ou códigos]. Você pode falar comigo em [CANAL] para tirar dúvidas ou pedir a exclusão dos seus dados. Pedimos desculpas pelo ocorrido.

**Conteúdo mínimo da comunicação à ANPD** (conferir o formulário atual): descrição do incidente e dados afetados; número de titulares; medidas técnicas de proteção; riscos; motivos de eventual demora; medidas adotadas e a adotar; contato do encarregado: [NOME/E-MAIL].

## 6. Registro do incidente
| Campo | Preencher |
|---|---|
| Nº / data e hora de início / de detecção | |
| Quem detectou e como | |
| Descrição do que ocorreu | |
| Dados e titulares afetados (quantidade) | |
| Dado sensível ou de menores? | |
| Causa provável | |
| Medidas de contenção e hora de cada uma | |
| Classificação (baixo / médio / alto) e justificativa | |
| ANPD comunicada? Data / protocolo | |
| Titulares comunicados? Data / canal | |
| Fornecedores acionados | |
| Ações corretivas e prazos | |

Guardar o registro por [PRAZO, definir com o jurídico].

## 7. Depois do incidente (em até [___] dias)
1. Corrigir a causa (ex.: PIN novo, chave nova, backup protegido, laptop com senha e disco criptografado).
2. Atualizar este plano e a Política de Privacidade, se algo mudou.
3. Rever acessos: quem tem acesso a quê, e o que pode ser removido.
4. Reavaliar o que é guardado: apagar o que não é mais necessário (botões "Apagar cliente" e "Limpar leads antigos" do painel).

## 8. Medidas preventivas (rotina)
- Disco do notebook criptografado (BitLocker) e senha do Windows forte; bloqueio automático de tela.
- PIN do painel trocado e diferente de `1234`; chaves de IA só no arquivo local, **nunca** em e-mail, chat ou repositório.
- Backup do HD em pasta privada, sem sincronização pública; cópia extra em local seguro.
- Verificação em duas etapas em Google, WhatsApp e e-mail.
- Revisão trimestral: acessos de clientes ainda ativos, leads antigos, chaves de IA não usadas.
- Nunca pedir senhas de clientes: acesso só por convite ou vínculo.

---

### Pontos para validação jurídica
1. Prazo e forma da comunicação à ANPD e aos titulares na regulamentação vigente (Resolução CD/ANPD nº 15/2024 e atualizações).
2. Critério de "risco ou dano relevante" para decidir quando comunicar; incluir exemplos aprovados pelo jurídico.
3. Papel de **controlador x operador** quando atuamos sobre contas de clientes (acessos a Google Ads e redes): definir contratos e responsabilidade.
4. Designação do encarregado (ou canal) e eventual dispensa para agentes de pequeno porte, conforme regulamento.
5. Prazo de guarda do registro de incidentes.
6. Possível necessidade de comunicar também fornecedores, seguradora ou autoridades de outros setores.

### Placeholders a preencher
[NOME DA MARCA] · [RESPONSÁVEL] · [TELEFONE/E-MAIL DE EMERGÊNCIA] · [ENCARREGADO E E-MAIL] · [PRAZOS EM HORAS/DIAS] · [PRAZO DE GUARDA DO REGISTRO] · [CANAL DE ATENDIMENTO AO TITULAR]
