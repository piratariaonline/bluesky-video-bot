# Bluesky video bot

Projeto para estudo de criação de automações com os serviços AWS dentro do free tier.

## Reprodução
1. `npm i`
2. O código pode ser testado localmente usando um script dev como:
```
    import dotenv from 'dotenv';
    import handler from './index.mjs';
    dotenv.config();
    await handler();
```
1. Zipe todo conteúdo, inclusive modules, sem criar subdiretório
2. Crie uma function no Lambda, configure as ENVs e escolha upload do código por .zip
3. O agendamento da execução é feito usando cronjob no EventBridge
4. Os vídeos vem de um bucket S3 IA
5. Lembrar de conferir as permissões do IAM para os recursos

## Exemplo
Atualmente utilizado com o perfil [Foca da Meia Noite](https://bsky.app/profile/focadameianoite.bsky.social).