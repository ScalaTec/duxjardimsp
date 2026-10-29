# DUX Jardim Sao Paulo - Totem

Aplicacao Windows para o totem interativo do empreendimento DUX Jardim Sao Paulo.

## Requisitos principais

- Funcionar visualmente e operacionalmente igual ao prototipo aprovado no Figma.
- Operar em Windows em modo kiosk/fullscreen.
- Funcionar offline para todo o conteudo principal.
- Preparar a Maquete Virtual em segundo plano quando houver internet, para que esteja pronta ao clicar.
- Nunca travar a aplicacao nem exibir erros tecnicos caso a Maquete falhe ou fique sem conexao.
- Exibir fallback visual DUX com opcoes de tentar novamente e voltar para a apresentacao.
- Ser otimizado para Intel Core i5 de 6a geracao.

Consulte tambem: `docs/REQUISITOS-PRINCIPAIS.md` e `docs/ARQUITETURA.md`.

## Stack

- Electron
- React + React Router (HashRouter, roda via `file://`)
- TypeScript
- Vite
- electron-builder

## Desenvolvimento

```bash
npm install
npm run dev        # Vite + Electron (janela, sem kiosk)
npm run typecheck  # renderer + processo principal
```

Variaveis opcionais (`.env`, veja `.env.example`):

| Variavel | Padrao | Uso |
| --- | --- | --- |
| `VITE_MAQUETE_URL` | `https://dux.allustudio.com/` | URL da Maquete Virtual |
| `VITE_IDLE_TIMEOUT_MS` | `120000` | Inatividade ate voltar ao Inicio (sem aviso na tela) |

## Build e instalador

```bash
npm run build   # bundle web (dist/) + processo principal (dist-electron/)
npm start       # abre o bundle de producao no Electron
npm run dist    # gera o instalador Windows x64 em release/
```

O instalador (`release/DUX-Jardim-Sao-Paulo-Setup-<versao>.exe`) inicia o app
junto com o Windows, em kiosk/fullscreen. Saida administrativa: `Ctrl+Shift+Alt+Q`.
Logs tecnicos em `%APPDATA%/dux-jardim-sao-paulo-totem/logs/totem.log`.

> Gerado em Linux (sem Wine) o `.exe` nao recebe icone/metadados personalizados.
> Para um executavel com icone, gere o instalador no Windows.

## Versao web (Docker)

O mesmo bundle (`npm run build:web`) pode ser publicado como site estatico, servido por
nginx sem root na porta 8080:

```bash
docker build -t dux-jardim-sao-paulo-web .
docker run --rm -p 8080:8080 dux-jardim-sao-paulo-web   # http://localhost:8080
```

As variaveis `VITE_*` valem na compilacao, entao vao como `--build-arg`:

```bash
docker build \
  --build-arg VITE_MAQUETE_URL=https://dux.allustudio.com/ \
  --build-arg VITE_IDLE_TIMEOUT_MS=120000 \
  -t dux-jardim-sao-paulo-web .
```

Endpoint de saude: `/healthz`. Os caminhos sao relativos, entao tambem funciona atras de
um proxy em subcaminho. Na web nao existem os recursos do Electron (kiosk, botao de sair da
tela cheia da janela, preparo da Maquete em segundo plano): a Maquete abre em um `iframe`.

## Estrutura

```text
electron/
  main.ts       janela kiosk, atalhos bloqueados, recuperacao de falhas, IPC
  maquete.ts    servico isolado da Maquete (WebContentsView, timeout, retentativas, tela cheia)
  exit-fullscreen.ts  botao de saida da tela cheia da Maquete (view propria + preload minimo)
  preload.ts    API minima exposta ao renderer (window.totem)
  config.ts     URL, timeouts e intervalos
  logger.ts     log em arquivo
src/
  pages/        Home, Parceiro, Localizacao, FichaTecnica, Torre, Fachada, Lazer, Plantas, Maquete
  components/   Nav, Lightbox (zoom/gestos), Implantacao (pinos), IdleGuard, FullscreenToggle, Icon
  data/         conteudo, lazer (pinos nas implantacoes), plantas (pinos por unidade e metragens do Book A3 por final/pavimento)
  lib/          preload de imagens, hook da Maquete, rotas/secoes
  styles/       tokens, shell/navegacao, componentes e paginas (rem fluido, retrato)
public/img/     imagens otimizadas (WebP) usadas pelo app
scripts/        optimize-images.mjs
docs/
```

## Interface

- Escala fluida em `rem` (1rem = 16px em 1920x1080): funciona em qualquer resolucao,
  de 4:3 a 21:9, e tambem em retrato (ex.: 1080x1920).
- Tudo e tocavel: navegacao inferior fixa, cartoes, abas, pinos nas implantacoes
  (lazer e plantas), lista de ambientes/unidades, pontos de referencia da localizacao,
  e visualizador em tela cheia com anterior/proximo, deslize, pinca, toque duplo e botoes de zoom.
- Retorno automatico ao Inicio por inatividade.

## Maquete Virtual

Preparada em segundo plano pelo processo principal assim que a Home esta pronta.
Falhas (offline, DNS, timeout, HTTP, certificado, crash/travamento do renderer)
viram um estado simples e a interface mostra o fallback DUX com
"Tentar novamente" e "Voltar a apresentacao". Quando a internet volta, a
preparacao e retomada sem reiniciar o app.

A Maquete e um stream (Streampixel): so e dada como pronta quando o `<video>` esta tocando,
com o mesmo prazo e fallback DUX de qualquer falha. Se o stream cair (o servidor encerra a
sessao por inatividade), a Maquete e recarregada sozinha: na hora, se alguem a esta vendo; ao
abri-la, se ninguem estava (nao mantem um stream aberto sem uso). O aviso "No activity
detected" do Streampixel fica oculto.

### Tela cheia

- **Botao de tela cheia da propria Maquete**: a view da Maquete so tem a permissao
  `fullscreen` (as demais continuam negadas). Ao expandir, a view passa a cobrir a
  janela inteira e um botao discreto no canto superior direito (view propria, acima
  da Maquete) volta ao palco. Sair da pagina da Maquete (inclusive
  pelo retorno por inatividade) encerra a tela cheia dela.
- **Botao discreto da interface** (canto superior direito, em todas as telas): sai da tela
  cheia/kiosk do totem para liberar a area de trabalho do Windows e, fora dela, volta.
  O cursor do mouse so fica oculto enquanto o totem esta em tela cheia.

## Imagens

Os originais (renders, plantas, PDFs) nao fazem parte do repositorio. O
`scripts/optimize-images.mjs` converte a pasta `Dux-imagens/` (ImageMagick +
poppler) em `public/img/` e regenera `src/data/unidades.generated.json`:

```bash
npm run images
```

Rode-o apenas ao atualizar os assets; reinicie o servidor do Vite em seguida.

## Requisitos de performance

O hardware-alvo e um Intel Core i5 de 6a geracao. O projeto prioriza estabilidade,
baixo consumo de memoria e carregamento sob demanda: imagens em WebP, miniaturas
nas telas e versoes ampliadas so no visualizador, pre-carga em tempo ocioso, animacoes
apenas de opacidade/transform e sem blur/backdrop-filter.
