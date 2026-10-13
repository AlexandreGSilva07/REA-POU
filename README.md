# REA-POU — Build 0.2

Protótipo funcional **Clean Room inspirado no ciclo de cuidados de Pou**, criado com código e desenhos independentes. Não contém recursos extraídos nem código descompilado do APK original.

**Jogo online (GitHub Pages):** quando GitHub Pages estiver ativado, abra o endereço de Pages deste repositório. Ou baixe `REA-POU-mobile.html` e abra diretamente no navegador.

O arquivo `index.html` já é o jogo completo, sem bibliotecas ou dependências de servidor. Mesmo conteúdo disponível em `REA-POU-mobile.html` como versão portátil.

## O que está implementado

- 7 salas: Hall, Cozinha, Laboratório, Sala de Jogos, Quarto, Banheiro e Jardim.
- Personagem vetorial original, animação de piscar, sono, sujeira, carícias, personalização de pele e chapéus.
- Alimentação e geladeira, cuidados de higiene, poções e loja.
- Minijogos jogáveis: Memória, Caça Estrelas e Cor Certa.
- Progresso, moedas, XP, energia, sono e salvamento local.

## Estado de validação

O pacote integral da sandbox passou 8/8 testes Node e um teste de interações Playwright em viewport móvel, sem erros de página. Ainda não foram feitas comparações dinâmicas contra o APK em dispositivo Android, portanto isso não representa paridade funcional completa.

O projeto está na etapa de **protótipo 0.2**, não produto final. Próximo marco: análise comportamental do APK em execução, specs de sistemas e reconstrução gradual dos muitos minijogos e customizações restantes.
