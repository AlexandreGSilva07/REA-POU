# REA-POU · Build 0.3

**Jogo web mobile original, baseado no ciclo de cuidados de um bichinho virtual.** Reconstrução independente sem arquivos extraídos, áudio, sprites ou código do APK original.

## Jogue

- **Online:** https://rea-pou.vercel.app/
- **Offline:** abra o arquivo portátil `REA-POU-mobile-v0.3.html` diretamente no navegador.
- **Desenvolvimento:** `python3 -m http.server 8000`, depois http://localhost:8000
- **Testes unitários:** `npm test` (Node.js 22+).
- **Teste Chromium:** `python3 tests/browser_v03.py` (requer Python, Playwright e Chromium instalados).

## Novidades

- Mascote redesenhado com silhueta simétrica, olhos ajustados, expressões e bochechas.
- Boutique com 7 departamentos, 50+ produtos, pré-visualização, estado de compra/equipamento e saldo.
- 26 minijogos (23 novos), de corrida, skate, espaço, esportes, reflexos, memória, puzzles, culinária, pesca e ritmo.
- Dificuldade Calmo, Normal, Insano, 26 recordes separados, moedas por partida e bônus na primeira vitória diária.
- Acessórios de óculos e roupas, mais chapéus, cores e decorações.
- Progresso compatível com saves anteriores (`rea-pou-v2`) e persistência local no navegador.

## Clean Room

Os gráficos são feitos por Canvas/CSS (e alguns emojis do sistema), sem imagens extraídas do APK. A comparação de comportamento e fidelidade ao original **não foi concluída** e os minijogos novos são criações originais, não recursos do jogo comercial. O uso de personagens, marcas e semelhanças visuais exige atenção aos direitos aplicáveis antes de distribuição comercial.

## Próximo marco

Testes prolongados em dispositivos Android reais, balanceamento das regras, desempenho em celulares de diferentes faixas, acessibilidade e maior profundidade nos minijogos esportivos e de ação.
