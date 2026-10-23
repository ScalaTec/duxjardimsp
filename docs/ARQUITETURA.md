# Arquitetura

## Principios

1. Conteudo principal local/offline.
2. Maquete virtual carregada apenas quando acessada.
3. Uma unica BrowserWindow do Electron.
4. Lazy loading para imagens pesadas.
5. Sem dependencias desnecessarias em runtime.
6. Retorno automatico a Home apos inatividade.
7. Aplicacao preparada para atualizacao futura de assets.

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
