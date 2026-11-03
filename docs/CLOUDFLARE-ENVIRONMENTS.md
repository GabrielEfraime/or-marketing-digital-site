# Ambientes Cloudflare da OR

Configuração provisionada em 3 de novembro de 2026.

Projeto Pages: `or-marketing-digital-site`.
Repositório conectado: `GabrielEfraime/or-marketing-digital-site`.
Branch de produção: `main`. Branch de validação: `feat/cloudflare-d1-r2-pages`.
Build: `npm run montar`; saída: `dist`; raiz: `/`.

| Ambiente | Binding | Recurso |
| --- | --- | --- |
| Production | DB | or-marketing-db |
| Production | ASSETS | or-marketing-assets |
| Preview | DB | or-marketing-db-preview |
| Preview | ASSETS | or-marketing-assets-preview |

D1 Production: `82f93adf-63e8-485c-bf53-78acad8ba6a7`.
D1 Preview: `65a0eafb-194a-458e-bf11-a360f7a5b927`.

A migração `migrations/0001_or_cloudflare.sql` foi executada pelo console D1 em ambos os bancos. O console confirmou a execução. Os buckets foram criados sem habilitar acesso público.

## Pendências antes de produção

- Cadastrar os segredos `ADMIN_TOKEN`, `OPENAI_API_KEY`, `GEMINI_API_KEY` e `GROQ_API_KEY` nos ambientes necessários. Nunca registrar seus valores no Git.
- Criar o primeiro administrador e validar login, troca de senha, isolamento entre clientes, persistência, upload/download R2 e IA no Preview.
- Revisar os resultados e obter aprovação para produção e integração da branch de desenvolvimento à `main`.

## Bloqueio temporário de produção

O comando de build configurado no painel Pages é temporariamente:

```sh
if [ "$CF_PAGES_BRANCH" = "main" ]; then echo "Production awaiting approval"; exit 1; fi; npm run montar
```

O primeiro build da `main` foi interrompido intencionalmente por esse bloqueio, sem publicação. Os builds das demais branches podem prosseguir como Preview. Após validação e aprovação, substituir o comando por `npm run montar` para liberar as publicações automáticas da `main`.

A existência dos recursos e bindings não significa que os fluxos completos já foram validados em produção.
