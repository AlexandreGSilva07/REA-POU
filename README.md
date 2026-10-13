# TRACKSHIFT — City Runner

**Jogo de corrida infinita mobile para navegador, implementado de forma independente.** Inspirado no gênero popularizado por jogos como Subway Surfers. Não é uma distribuição do Subway Surfers, nem uma execução/port do APK oficial: é um jogo **original** com mecânicas semelhantes e recursos próprios.

## Jogar

Abra `TRACKSHIFT-mobile.html` no navegador ou hospede a pasta em servidor estático (`python3 -m http.server 8765`). **Não é necessária conta, biblioteca externa ou Supabase para jogar**. O progresso fica armazenado no navegador em `localStorage` quando disponível.

## Funcionalidades da versão 0.1

- Cenário urbano renderizado em Canvas 2D com projeção de perspectiva e trilhos em três faixas (2,5D).
- Controles por gesto (esquerda/direita/cima/baixo), botões de tela, setas do teclado e WASD.
- Trens, barricadas, cones e arcos; salto, rolamento e colisões.
- Pistas e moedas geradas proceduralmente, aumento gradual de velocidade e pontuação.
- Pranchas protetoras, escudo e imãs; cinco trajes originais.
- Garagem/loja, missões, recorde, resumo de partida e salvamento local.
- Áudio sintetizado localmente via Web Audio; pausa e retomada.

## Testes

```bash
npm test
python3 tests/browser_deep.py
```

A rotina Chromium usa `playwright` e `/usr/bin/chromium` quando presentes. Por restrição da navegação local no navegador de teste, ela injeta os arquivos no contexto de página e utiliza um armazenamento simulado para validar a persistência da lógica. A hospedagem pública precisa de sua própria verificação externa.

## Estrutura

- `index.html` — ponto de entrada web
- `src/engine.js` — simulação de pistas, saltos, obstáculos, moedas e pontuação
- `src/render.js` — renderer original em perspectiva no Canvas
- `src/main.js` — interface, gestos, loja, salvamento e audio
- `src/style.css` — interface mobile e layouts
- `tests/` — testes Node e Playwright
- `docs/APK_INSPECTION.md` — inventário privado e limites da análise
- `TRACKSHIFT-mobile.html` — arquivo único portátil

## Compromisso de independência

Os arquivos compilados originais, músicas, texturas, personagens e marcas do APK não foram colocados no projeto. Não execute este arquivo como APK Android; a implementação é feita inteiramente para a Web. O trabalho ainda não foi validado por comparação dinâmica completa com o jogo Android original.
