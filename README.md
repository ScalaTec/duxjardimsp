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

Consulte tambem: `docs/REQUISITOS-PRINCIPAIS.md`.

## Stack

- Electron
- React
- TypeScript
- Vite
- electron-builder

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run dist
```

## Estrutura

```text
src/
  components/
  pages/
  services/
  data/
  assets/
electron/
docs/
```

## Requisitos de performance

O hardware-alvo e um Intel Core i5 de 6a geracao. O projeto deve priorizar estabilidade, baixo consumo de memoria e carregamento sob demanda de imagens e da maquete virtual.

## Figma

O prototipo aprovado do DUX Jardim Sao Paulo e a referencia visual principal e criterio de aceite para a implementacao.
