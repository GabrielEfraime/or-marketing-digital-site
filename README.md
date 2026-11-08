# OR Marketing Digital: site e Minha área

Plataforma em **um único arquivo HTML**, montado a partir de `src/`:

1. **Site público:** abertura, home, páginas de serviço, vagas e o briefing guiado.
2. **Minha área** (painel do consultor): leads, Captar clientes, resumo, estratégia, kits de Ads, redes e site, orçamentos, mensagem de WhatsApp, acompanhamento, Base da IA e IAs.
3. **IAs (todas na Groq):** a IA 1 (Qwen 3.8 27B) cria; a IA 2 e a IA 3 (GPT-OSS 120B) cuidam de estratégia, atendimento e captação. As imagens das artes saem pelo Pollinations, e o Gemini é a reserva de emergência (texto e imagem), sempre com aviso na tela. Só roda quando o consultor clica. Sem servidor: as chaves ficam cifradas no navegador de quem usa a Minha área (tela IAs). O tema é só o escuro.

Sem dependências npm. Precisa só de [Node.js 18+](https://nodejs.org).

## Comandos

```bash
npm run montar        # gera dist/ (index.html, estudio-ia.html, robots.txt)
npm run verificar     # segurança, SEO e testes automáticos
npm run testar        # só os testes (preços, data, WhatsApp, imagem da IA, chamadas à IA, demandas, editor)
npm run abrir         # abre a plataforma em http://127.0.0.1:5173 (injeta no navegador as chaves do .env, só local; recusa qualquer cabeçalho Host que não seja 127.0.0.1 ou localhost)
npm run montar:teste  # build local com a chave Gemini do .env (gera ../estudio-ia-TESTE.html; NUNCA publicar)
npm run abrir:teste   # abre o build de teste em http://127.0.0.1:5173
```

Use `npm run abrir` em vez de dar duplo clique no HTML. Pelo `file://`, qualquer HTML aberto no mesmo Chrome consegue ler as chaves e os dados da plataforma. Na primeira vez no endereço novo, clique em **Conectar pasta de backup no HD** para trazer os leads, ou importe um backup.

## Publicar (GitHub Pages)

O site publica sozinho a cada envio para o `main`: o GitHub Actions (`.github/workflows/pages.yml`) roda `npm run montar` e `npm run verificar` e publica só a pasta `dist` (não existe mais `index.html` na raiz do projeto: o build só grava em `dist/`) em https://gabrielefraime.github.io/or-marketing-digital-site/ .

O GitHub Pages não tem servidor. Por isso a IA usa chaves guardadas no navegador de quem usa a Minha área:
1. Abra o site publicado, entre na Minha área e vá em **IAs**.
2. Cole a chave da Groq (console.groq.com/keys) em uma das três IAs; as outras usam a mesma. IA 1 = Qwen 3.8 27B (criação), IA 2 e IA 3 = GPT-OSS 120B (estratégia, atendimento e captação).
3. Para "Criar imagem com IA", crie uma conta em enter.pollinations.ai (entra com o GitHub), gere uma chave secreta (`sk_...`) e cole no cartão **Imagens das artes · Pollinations**. Cada imagem custa frações de centavo em Pollen, e a conta nova ganha créditos.
4. Opcional, mas recomendado: cole a chave do Gemini (aistudio.google.com/apikey) no cartão **Reserva de emergência · Gemini**. Se a Groq falhar ou estiver sem chave, o texto sai pelo Gemini, com aviso na tela; se o Pollinations falhar, o site tenta a imagem pelo Gemini (imagem só com faturamento ativo).
5. Clique em **Salvar** e em **Testar** em cada IA. As chaves ficam cifradas só naquele navegador e nunca vão para o GitHub. Em outro computador, cole de novo.

Nunca coloque chave no código, no `.env.example` ou no GitHub: a página é pública.

Quando tiver o domínio, preencha `url` e `googleVerificacao` em `src/seo.json` para gerar o canonical e o `sitemap.xml`.

## Como editar

1. Edite `src/` (nunca o `dist/`). A ordem dos arquivos está em `src/ordem.json`. O JavaScript tem um único escopo global, e no CSS o que vem depois vence. Os arquivos de `src/js` são numerados pela ordem real de carga (00 a 49, um por responsabilidade); o mapa de cada um e a tabela de renomeações do Lote 3A estão em `ARCHITECTURE.md`. Arquivo novo ou dividido: registre em `ordem.json`, renumere os seguintes e atualize a tabela.
2. Rode `npm run montar` e depois `npm run verificar`.
3. Para saber onde mexer em cada coisa, veja `ARCHITECTURE.md`. As decisões do dono estão em `docs/DECISOES-E-PREFERENCIAS.md` e o que falta está em `docs/PENDENCIAS.md`.

## Segurança

- Nenhuma chave no código. O `npm run verificar` falha se achar uma.
- Chaves coladas em conversas precisam ser **revogadas**: Groq em console.groq.com/keys, Gemini em aistudio.google.com/apikey.
- O PIN da Minha área protege só a tela. Não há servidor: os dados dos leads ficam no navegador de quem usa a Minha área, e as chaves de IA ficam cifradas ali (protege contra leitura casual; não protege de quem usa o computador).
- Relatório completo: `docs/REVISAO-SEGURANCA.md`.
