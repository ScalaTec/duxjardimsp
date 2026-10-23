// Plantas por pavimento. As unidades (area, arquivo) vem de
// unidades.generated.json (scripts/optimize-images.mjs). Os pinos (x, y) sao
// porcentagens sobre a implantacao do pavimento (5400x2160); `n` e o numero do
// final impresso na implantacao.
import gerado from './unidades.generated.json';

export interface Unidade {
  id: string;
  finais: number[];
  label: string;
  /** Area em m², como string (ex.: "34,76"). */
  area: string;
  img: string;
}

export interface Pino {
  n: number;
  x: number;
  y: number;
}

export interface TorrePav {
  id: 't1' | 't2';
  nome: string;
  unidades: Unidade[];
  pinos: Pino[];
}

export interface Pavimento {
  id: '1-11' | '12-14' | '15' | '16-22';
  titulo: string;
  resumo: string;
  plano: string;
  torres: TorrePav[];
}

type Gerado = Record<string, Partial<Record<'t1' | 't2', Unidade[]>>>;
const un = (pav: string, t: 't1' | 't2'): Unidade[] => (gerado as Gerado)[pav]?.[t] ?? [];
const pinos = (lista: [number, number, number][]): Pino[] => lista.map(([n, x, y]) => ({ n, x, y }));

export const PAVIMENTOS: Pavimento[] = [
  {
    id: '1-11',
    titulo: '1º–11º',
    resumo: 'Torre 1 + Torre 2',
    plano: 'plantas/pav-1-11.webp',
    torres: [
      {
        id: 't1',
        nome: 'Torre 1',
        unidades: un('1-11', 't1'),
        pinos: pinos([
          [1, 75.8, 34.1], [2, 80.2, 34.1], [3, 83.0, 47.0], [4, 83.0, 57.5], [5, 76.4, 64.5],
          [6, 69.9, 64.5], [7, 66.8, 64.5], [8, 59.9, 62.2], [9, 59.9, 46.6], [10, 64.3, 46.6],
        ]),
      },
      {
        id: 't2',
        nome: 'Torre 2',
        unidades: un('1-11', 't2'),
        pinos: pinos([
          [1, 37.8, 47.2], [2, 41.1, 47.2], [3, 41.1, 64.7], [4, 37.8, 64.7], [5, 27.8, 64.7],
          [6, 21.3, 64.7], [7, 18.0, 64.7], [8, 15.1, 53.6], [9, 20.6, 48.8],
        ]),
      },
    ],
  },
  {
    id: '12-14',
    titulo: '12º–14º',
    resumo: 'Torre 1',
    plano: 'plantas/pav-12-14.webp',
    torres: [
      {
        id: 't1',
        nome: 'Torre 1',
        unidades: un('12-14', 't1'),
        pinos: pinos([
          [1, 80.1, 34.3], [3, 83.0, 47.0], [4, 83.0, 57.5], [5, 76.4, 64.6], [6, 69.9, 64.6],
          [7, 66.8, 64.6], [8, 59.7, 62.0], [9, 59.7, 46.4], [10, 64.3, 46.4],
        ]),
      },
    ],
  },
  {
    id: '15',
    titulo: '15º',
    resumo: 'Torre 1 + lazer',
    plano: 'plantas/pav-15.webp',
    torres: [
      {
        id: 't1',
        nome: 'Torre 1',
        unidades: un('15', 't1'),
        pinos: pinos([[3, 83.0, 47.1], [4, 83.0, 57.7], [5, 76.4, 64.6]]),
      },
    ],
  },
  {
    id: '16-22',
    titulo: '16º–22º',
    resumo: 'Torre 1',
    plano: 'plantas/pav-16-22.webp',
    torres: [
      {
        id: 't1',
        nome: 'Torre 1',
        unidades: un('16-22', 't1'),
        pinos: pinos([[3, 83.0, 53.9], [5, 79.8, 64.5]]),
      },
    ],
  },
];

/** Unidade cujo final inclui o numero impresso no pino. */
export const unidadeDoPino = (torre: TorrePav, n: number): Unidade | undefined =>
  torre.unidades.find((u) => u.finais.includes(n));

export const formatarArea = (area: string) => `${area} m²`;
