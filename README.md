# TRACKSHIFT — City Runner (Clean Room, v0.1)

> **Protótipo web independente** do gênero *endless runner de três pistas*, desenvolvido a partir de especificações observáveis. NÃO é uma cópia, distribuição ou port da engine Unity nem utiliza personagens, código, texturas, áudio ou outras mídias extraídas de Subway Surfers. Não é um produto oficial ou afiliado à SYBO.

## Jogar

- `index.html` — aplicativo estático modular para hospedagem (Vercel/GitHub Pages).
- `TRACKSHIFT-offline.html` — a mesma versão em um **único arquivo portátil**, sem conexão nem backend.
- Abra no browser mobile (modo retrato, 9:18 recomendado), toque **JOGAR AGORA** e deslize.
- Desktop: setas ou WASD; `Esc` pausa; `B` ativa prancha.

## O que funciona

- Corrida infinita com **3 pistas** e câmera que acompanha as mudanças de faixa.
- Gestos touch de esquerda/direita, pulo e rolamento; botões acessíveis na tela.
- Trens 3D estilizados, barreiras, cones, placas suspensas, trilhos, postes, prédios em perspectiva, piso procedural.
- Física de salto e colisões distintas por obstáculo; proteção consumível por prancha; ímã e escudo ocasionais.
- Grupos de obstáculos gerados proceduralmente com pelo menos **uma pista sem bloqueios por grupo**.
- Pontuação, metros, dificuldade que acelera, moedas, recorde e salvamento `localStorage`.
- Garagem com 5 figurinos originais, pranchas e ímãs compráveis, missões de progresso com recompensas.
- Jogável offline com interface vertical, efeitos gráficos e sons sintetizados opcionais.

## Desenvolvimento

Sem dependência externa, sem ferramentas de build para produção:

```bash
python3 -m http.server 8765
# http://localhost:8765
node --test tests/engine.test.js
```

### Código

- `src/engine.js`: estado, física, gerador de grupos, regras e economia
- `src/render.js`: projeção própria e pintura de formas geométricas em Canvas 2D
- `src/main.js`: menus, inputs e integração
- `src/style.css`: HUD, controles, garagem e menus
- `tests/`: testes unitários e de Chromium por injeção de conteúdo
- `docs/RE_FINDINGS.md`: achados verificados no APK e limitações

## Limites e próximos passos

A versão atual utiliza **perspectiva 3D renderizada em Canvas 2D**, não WebGL/Three.js nem Unity. A jogabilidade principal funciona, mas ainda falta: reconstrução de referências a partir da execução autorizada do APK Android, modelos mais detalhados, animações e balanço em sessões longas, desafios diários, animações de transições e teste em smartphone real. O APK, os arquivos descompilados e assets originais **não** foram publicados neste repositório.

A branch do Pou foi preservada; este jogo vive em `reverse/next-game`. Para ser totalmente Clean Room, análises e implementação devem ser executadas por agentes isolados, recebendo o implementador só contratos funcionais. Não se reivindica isolamento estrito entre pessoas neste protótipo inicial.
