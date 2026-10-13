# Relatório de validação v0.1

## Automatizado

- **14/14 testes Node** passaram: iniciar, limites de pista, física de salto, configuração de grupos, colisão com trem, salto sobre barreira, rolamento sob placa, proteção com prancha, moedas/ímã, aceleração e limite de delta tempo.
- **Chromium em viewport mobile 390×844**: menu, garagem, início da corrida, movimentação por toque, pulo, pause/resume e captura de frames; sem erros de JavaScript.
- **Chromium extended**: gesto horizontal, colisão forçada, tela de game over, recompensa em moeda, salvamento com localStorage simulado em sandbox, render de trem próximo, cards da garagem; sem erros de JavaScript.

## Limites de teste

O Chromium da sandbox impede navegar URLs locais. Para os testes de browser, a página foi montada diretamente com HTML/CSS/JS injetados, um ambiente equivalente para exercício dos comportamentos do frontend mas não uma navegação HTTP real. O navegador não permitia `localStorage` em `about:blank`; o teste estendido usa um stub que emula a API para verificar as chamadas, não um teste de persistência real através de reload HTTP.

Sem validação em Android real nem comparação com a execução do APK. O sistema ainda é **protótipo**, não reprodução 1:1 ou port do jogo Unity original.
