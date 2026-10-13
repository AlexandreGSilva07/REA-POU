# Inventário técnico do APK fornecido

**Arquivo privado:** `subway-surfers-3-70-2.apk` — não incluído no repositório.

- Versão indicada no arquivo e caminhos de Addressables: **3.70.2**.
- Tamanho: **269.309.250 bytes** (aproximadamente 257 MiB).
- SHA-256 do APK: `c644822201c5c4590d8793803d3263dd339b5307a3bf0f6bae803fa8b2318ca3`.
- Total de entradas ZIP: **5.439**.
- Engine: **Unity**, com `libunity.so` e `libil2cpp.so` em `arm64-v8a` e `armeabi-v7a`.
- Metadados: `assets/bin/Data/Managed/Metadata/global-metadata.dat`.
- Resource catalog: `assets/aa/catalog.json`, bundles `.bundle` e demais arquivos Unity.

### Limites da investigação

Esta etapa fez inventário de arquivos e identificou ferramentas/formatos, **não realizou observação dinâmica em emulador** nem tentou importar os recursos proprietários. Os controles de três pistas, obstáculos e moedas do protótipo foram projetados independentemente, a partir de conceitos observáveis do gênero. A arte, física e monetização do jogo web não devem ser entendidas como reprodução fiel da implementação Unity.

### Clean Room

O artefato público contém apenas código, recursos e testes independentes. O APK, dados descompilados e recursos protegidos não serão commitados. Como análise e desenvolvimento foram conduzidos na mesma sessão, isto **não configura isolamento estrito de equipes**; para rigor adicional seria necessário separar analistas e implementadores e seus acessos.
