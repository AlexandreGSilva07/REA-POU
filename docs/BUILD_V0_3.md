# Build 0.3 — escopo, testes e limitações

Data: 2026-10-13. Trabalho exclusivamente na sandbox, sem acesso ao PC do usuário.

## Mudanças

- Refatoração da aparência do personagem para silhueta equilibrada, olhos simétricos, highlights, expressões e acessórios 2D, tudo desenhado por código.
- Boutique com navegação de 7 categorias e pré-visualização; amplia catálogo de cores, chapéus, óculos, roupas e cenário. Equipamento visual aparece no personagem.
- Arcade com 23 jogos novos em Canvas e 3 jogos anteriores, total de 26 entradas, cada uma com controle de entrada, renderização e pontuação; três dificuldades; moedas por desempenho, records, vitórias e bônus diário.
- Oito testes legados atualizados e 26 testes adicionais (incluindo os 23 modos); execução de Playwright em tela 390x844, percorrendo 26 modos; jornada de compra e uma partida de pênaltis concluída com premiação; 0 exceções JS no fluxo examinado.

## O que foi verificado

34/34 testes Node. 26/26 entradas de arcade abertas e desenhadas em Chromium. No teste de integração uma partida de pênaltis completou 10 chutes, atualizou moedas e registrou high score; shop seleciona e compra itens de cor; navegação e persistência de estado.

## Limites

- Testes automáticos breves não equivalem a dezenas de horas de jogo ou aprovação em celular Android real.
- Minijogos são independentes, alguns compartilham motor, e têm profundidade heterogênea: por exemplo, os de esportes e precisão ainda usam regras simplificadas.
- Não reivindica equivalência com APK, nem que original foi reproduzido exatamente, especialmente áudio, multiplayer, fases e assets.
- A coordenação no Supabase não significa que dois agentes persistentes estejam rodando.
- Economia local sem controle antitrapaça; adequada a experiência offline single-player.
