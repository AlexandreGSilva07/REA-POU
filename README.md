# REA-POU — reconstrução web mobile (Clean Room)

Projeto de reimplementação independente de um jogo Android para o navegador mobile, baseado em **especificações funcionais e observações verificáveis**, sem reutilização de código, gráficos, áudio ou recursos proprietários do APK.

> **Estado:** infraestrutura inicial. O APK ainda não foi fornecido; nenhuma mecânica específica do jogo original foi analisada ou reproduzida.

## Objetivo

- Jogo web mobile-first, orientação retrato por padrão e controles touch.
- Desenvolvimento incremental por especificações pequenas, builds jogáveis e validações contínuas.
- Separação de acesso: **Agente A** investiga o original e publica apenas especificações comportamentais; **Agente B** implementa código independente; **revisor C** verifica código próprio. A valida o comportamento dos builds, não o código descompilado.
- GitHub armazena versões e discussões; Supabase coordena filas e resultados. **Não há execução contínua de agentes somente com GitHub + Supabase**: ela exige workers externos.

## Início rápido

Abra `index.html` por um servidor HTTP estático (por exemplo: `python -m http.server 8000`) e acesse `http://localhost:8000`. O app inicial é apenas uma **cena de teste original** para validar Canvas, layout 9:16 e controles por toque.

```sh
npm test
```

## Estrutura

- `src/` — runtime web independente, sem dependências de terceiros
- `tests/` — testes do motor de movimento de demonstração
- `docs/architecture.md` — desenho da solução
- `docs/clean-room-policy.md` — isolamento entre investigação e desenvolvimento
- `docs/spec-template.md` — modelo de especificação verificável
- `supabase/migrations/` — banco de coordenação; não armazena APK

## Segurança e direitos

**Não publique o APK original, dumps, decompilações, chaves, recursos extraídos nem dados pessoais neste repositório público.** Verifique as permissões e os direitos aplicáveis ao jogo antes de distribuir qualquer reconstrução. Os exemplos de interface são genéricos e não representam o jogo alvo.

## Próximo marco

Receber o APK, inventariar seus componentes e emitir a primeira especificação sobre um fluxo observável, então implementá-la e compará-la com o original.