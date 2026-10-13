# Arquitetura inicial

## Objetivo

Jogo web mobile-first independente do APK original. A interface de demonstração possui proporção de referência **9:16**; ajustes devem seguir a orientação real do jogo quando o APK for analisado.

## Fluxo dos agentes

1. **A (investigação):** observa o comportamento do APK em ambiente isolado e escreve especificações testáveis, sem código ou recursos extraídos.
2. **B (implementação):** recebe apenas especificações aprovadas e mantém o código web e testes; não pode consultar o APK ou dumps.
3. **C (revisão independente):** examina implementação e testes, sem acesso ao APK original.
4. **A (validação):** executa o jogo original e builds compilados do B, compara comportamento externo e envia feedback descritivo; não entrega trechos descompilados nem revisa o código-fonte com acesso à implementação interna original.

## Ciclo assíncrono

- A publica versão de especificação -> cria tarefa de B.
- Worker B faz checkout, implementa em branch de tarefa, testa e abre PR.
- Um worker C valida independência, qualidade e testes.
- A valida o build publicado (sem código) e registra divergência.
- B corrige conforme feedback, repetindo até a aceitação.
- O status e as tentativas são persistidos em `rea_control` no Supabase.

**Limite operacional:** GitHub e Supabase fornecem estado persistente, mas NÃO executam agentes sozinhos. Workers externos precisam ser provisionados, autenticados e executados em infraestrutura separada. Nada neste repositório indica que estejam funcionando agora.

## Limites de segurança

- APKs, dumps, screenshots restritos e evidência bruta nunca vão para o repositório público.
- Nenhuma chave Supabase secreta no browser ou git.
- O banco de orquestração fica no schema privado `rea_control`, sem exposição padrão na Data API.
- Nenhum PR de B deve conter código copiado ou assets extraídos.
- Não misture fontes de verdade: GitHub para código e specs aprovadas; Supabase para fila e resultados.
