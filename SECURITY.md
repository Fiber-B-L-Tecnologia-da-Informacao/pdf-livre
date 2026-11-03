# Segurança

Não anexe documentos reais, senhas, dados pessoais ou exemplos exploráveis em issues públicas. Para uma suspeita de vulnerabilidade, contate os administradores da organização por um canal privado já conhecido ou use o relato privado do GitHub quando estiver disponível. Não há endereço de segurança específico publicado neste repositório.

O projeto processa PDFs não confiáveis com PDF.js atualizado, mantém `isEvalSupported: false` e não implementa execução de JavaScript de PDF. Isso não garante ausência de vulnerabilidades. Mantenha navegador e dependências atualizados.

A varredura textual do aplicativo é uma heurística de conferência: não certifica PDFs como seguros e não inspeciona integralmente camadas, fontes ou divergências visuais. Confira o original antes de usar a saída em decisões importantes ou como contexto para agentes de IA.
