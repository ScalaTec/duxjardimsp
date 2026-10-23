# Arquitetura

## Principios

1. O Figma aprovado e a referencia visual e funcional oficial.
2. Conteudo principal local/offline.
3. Depois que a Home estiver pronta, a Maquete Virtual deve ser preparada em segundo plano quando houver internet.
4. A Maquete deve ser isolada do restante da aplicacao: falhas de conexao ou do conteudo remoto nunca podem travar o totem.
5. Nunca mostrar erro tecnico do Chromium ou tela branca ao usuario; usar fallback visual DUX.
6. Uma unica BrowserWindow principal do Electron.
7. Lazy loading para imagens pesadas.
8. Sem dependencias desnecessarias em runtime.
9. Retorno automatico a Home apos inatividade.
10. Aplicacao preparada para atualizacao futura de assets.

## Modulos previstos

- Home
- Localizacao
- Ficha Tecnica
- Fachada
- Lazer
- Plantas
- Maquete Virtual
- IdleManager
- ConnectionService
- ImageViewer

## Hardware-alvo

Intel Core i5 de 6a geracao, sem pressupor GPU dedicada.


## Maquete Virtual - comportamento obrigatorio

- Preparar em segundo plano apos a Home estar disponivel.
- Exibir imediatamente se ja estiver pronta.
- Exibir loader DUX se ainda estiver carregando.
- Exibir mensagem amigavel se estiver offline.
- Capturar timeout, DNS, falha HTTP, certificado, crash do renderer e indisponibilidade do site.
- Permitir sempre Tentar novamente e Voltar a apresentacao.
- A falha da Maquete nunca pode afetar Inicio, Localizacao, Ficha Tecnica, Fachada, Lazer ou Plantas.
