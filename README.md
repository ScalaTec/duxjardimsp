# DUX Jardim Sao Paulo - Totem

Aplicacao Windows para o totem interativo do empreendimento DUX Jardim Sao Paulo.

## Objetivos

- Operar em Windows em modo kiosk/fullscreen.
- Funcionar offline para todo o conteudo principal.
- Usar internet apenas para a Maquete Virtual.
- Ser otimizado para Intel Core i5 de 6a geracao.
- Reproduzir o layout e a navegacao aprovados no Figma.

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

O prototipo aprovado do DUX Jardim Sao Paulo e a referencia visual principal para a implementacao.
