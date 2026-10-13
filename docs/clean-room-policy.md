# Política de Clean Room assistida

## Isolamento obrigatório

- O **Agente A** pode acessar o APK, saídas de REA, descompiladores e observações em dispositivo autorizado.
- O **Agente B** recebe **somente** contratos funcionais aprovados, exemplos de entradas/saídas e critérios de aceitação; não recebe código original, artefatos derivados, algoritmos descompilados, mapas de símbolos ou assets extraídos.
- O **Agente C** revisa código de B para correção e procedência sem acesso a materiais originais.
- A pode comparar o APK com o **build executável** de B e emitir feedback sobre comportamento observável, sem compartilhar implementação de origem.

## Especificações

Cada contrato inclui: ID, versão, origem das observações, confiança, comportamento verificável, casos normais/limites, métricas aceitáveis e incógnitas. Nenhuma especificação precisa reproduzir algoritmo interno.

## Auditoria

- Cada issue/tarefa referencia uma versão imutável da especificação.
- Cada build registra commit, hash, plataforma, resultado e observação de A.
- Feedback exige cenário reproduzível, esperado e observado.
- Se houver suspeita de material indevido, suspender merge e substituir por implementação independente.

## Limitações

Clean Room não concede licença sobre personagens, nomes, marca, gráficos, áudio, diálogos ou outros elementos protegidos. Confirme direitos e permissões antes de distribuir a reimplementação. Isolamento real depende também de permissões técnicas e práticas operacionais, não somente deste documento.
