# Observações estáticas do APK fornecido

**Arquivo recebido:** `subway-surfers-3-70-2.apk` (mantido PRIVADO; nunca publicar)

- Tamanho: **269.309.250 bytes** (aprox. 257 MiB)
- MD5 para identificar o exemplar analisado: `a5e05ddb6ec73e110b260fc62f5528c6`
- Entradas no ZIP: **5.439**; diretório `assets/`: **3.772 entradas**
- Binários nativos: `lib/arm64-v8a/libunity.so`, `lib/arm64-v8a/libil2cpp.so` e suas versões ARM 32-bit
- Metadados IL2CPP: `assets/bin/Data/Managed/Metadata/global-metadata.dat`
- Recursos Unity Addressables: `assets/aa/catalog.json` e vários pacotes da árvore `assets/aa/Android/3.70.2/`
- O APK contém oito arquivos DEX da camada Android Java/Kotlin, além da implementação IL2CPP nativa.

## Inferência fundamentada

A combinação Unity runtime + `libil2cpp.so` + metadata e bundle Addressables caracteriza uma aplicação **Unity com backend de scripting IL2CPP**. Recursos adicionais dos diferentes eventos ou conteúdos dependem dos catálogos e pacotes. O inventário não implica extração de lógica do runtime.

## Lacunas

- Sem execução instrumentada do APK em Android nesta fase.
- Sem medições confiáveis das velocidades reais, das probabilidades do gerador de obstáculos, da hitbox, do desenho da câmera e das animações específicas.
- Os valores numéricos e fluxos em `src/engine.js` foram desenvolvidos independentemente e **não** foram extraídos dos arquivos Unity.
- Nenhum sprite, textura, som ou outra mídia proprietária foi copiada para o protótipo.

## Regras para validação futura

Agente A pode executar a versão original em Android autorizado e observar sua saída; deve transmitir a B apenas requisitos funcionais testáveis, sem cópias de código ou assets; B deve fazer implementação independente. Comparar eventos de pista, duração do pulo, rolamento, frequência de trem/barreira, score e coleta; registrar incertezas e screenshots privados sem publicá-los.
