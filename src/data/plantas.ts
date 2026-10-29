// Plantas por pavimento. As unidades (arquivo, finais) vem de
// unidades.generated.json (scripts/optimize-images.mjs); as metragens vem do
// Book A3 (METRAGENS abaixo). Os pinos (x, y) sao porcentagens sobre a
// implantacao do pavimento (5400x2160); `n` e o numero do final impresso na
// implantacao.
import gerado from './unidades.generated.json';

export interface Metragem {
  final: number;
  /** Area em m², como string (ex.: "34,76"). */
  area: string;
  /** Pavimentos em que a area vale; ausente = todos os do grupo. */
  pav?: string;
}

/** Uma planta (imagem), que pode servir a mais de um final. */
export interface Unidade {
  id: string;
  finais: number[];
  label: string;
  img: string;
  metragens: Metragem[];
}

export interface Pino {
  n: number;
  x: number;
  y: number;
}

export interface TorrePav {
  id: 't1' | 't2';
  nome: string;
  /** Pavimentos da torre quando diferem do titulo do grupo (ex.: Torre 2 comeca no 2º). */
  pavimentos?: string;
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

const M = (final: number, area: string, pav?: string): Metragem => ({ final, area, pav });

/**
 * Metragens do Book A3, por `<grupo>/<id da unidade>`. Finais que dividem a
 * mesma planta tem metragens proprias; um mesmo final pode mudar de area
 * conforme o pavimento.
 */
const METRAGENS: Record<string, Metragem[]> = {
  '1-11/t1-final-1': [M(1, '34,87', '1º pavimento'), M(1, '34,76', '2º ao 11º pavimentos')],
  '1-11/t1-final-2': [M(2, '29,87')],
  '1-11/t1-final-3': [M(3, '35,24')],
  '1-11/t1-final-4': [M(4, '37,47')],
  '1-11/t1-final-5-7': [M(5, '26,75'), M(7, '27,87')],
  '1-11/t1-final-6': [M(6, '28,46')],
  '1-11/t1-final-8-9': [M(8, '38,80'), M(9, '38,80')],
  '1-11/t1-final-10': [M(10, '31,01')],
  '1-11/t2-final-1': [M(1, '27,76', '2º ao 10º pavimentos'), M(1, '27,47', '11º pavimento')],
  '1-11/t2-final-2-3': [
    M(2, '27,45', '2º ao 10º pavimentos'),
    M(2, '27,55', '11º pavimento'),
    M(3, '27,45', '2º ao 7º pavimentos'),
    M(3, '27,55', '8º ao 11º pavimentos'),
  ],
  '1-11/t2-final-4-5-6': [
    M(4, '27,25', '2º ao 7º pavimentos'),
    M(4, '26,62', '8º ao 11º pavimentos'),
    M(5, '27,34', '2º ao 7º pavimentos'),
    M(5, '26,74', '8º ao 11º pavimentos'),
    M(6, '28,37', '2º ao 7º pavimentos'),
    M(6, '27,74', '8º ao 11º pavimentos'),
  ],
  '1-11/t2-final-7': [M(7, '29,45', '2º ao 7º pavimentos'), M(7, '29,23', '8º ao 11º pavimentos')],
  '1-11/t2-final-8': [M(8, '39,47', '2º pavimento'), M(8, '39,53', '3º ao 11º pavimentos')],
  '1-11/t2-final-9': [M(9, '51,29', '2º pavimento · Garden'), M(9, '35,75', '3º ao 11º pavimentos')],
  '12-14/t1-final-1': [M(1, '60,46')],
  '12-14/t1-final-3': [M(3, '35,24')],
  '12-14/t1-final-4': [M(4, '37,47')],
  '12-14/t1-final-5-7': [M(5, '26,75'), M(7, '27,87')],
  '12-14/t1-final-6': [M(6, '28,46')],
  '12-14/t1-final-8': [M(8, '33,97')],
  '12-14/t1-final-9': [M(9, '38,80')],
  '12-14/t1-final-10': [M(10, '31,01')],
  '15/t1-final-3': [M(3, '35,24')],
  '15/t1-final-4': [M(4, '37,47')],
  '15/t1-final-5': [M(5, '38,79')],
  '16-22/t1-final-3': [M(3, '54,55')],
  '16-22/t1-final-5': [M(5, '74,67')],
};

type Gerado = Record<string, Partial<Record<'t1' | 't2', Omit<Unidade, 'metragens'>[]>>>;
const un = (pav: string, t: 't1' | 't2'): Unidade[] =>
  ((gerado as Gerado)[pav]?.[t] ?? []).map((u) => ({ ...u, metragens: METRAGENS[`${pav}/${u.id}`] ?? [] }));
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
        pavimentos: '2º–11º',
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

const numero = (area: string) => parseFloat(area.replace(',', '.'));

/** Area da planta: "38,80 m²" ou, quando varia entre finais/pavimentos, "26,62 a 28,37 m²". */
export const resumoArea = (u: Unidade): string => {
  const areas = [...new Set(u.metragens.map((m) => m.area))].sort((a, b) => numero(a) - numero(b));
  if (areas.length === 0) return '';
  return areas.length === 1 ? formatarArea(areas[0]) : `${areas[0]} a ${formatarArea(areas[areas.length - 1])}`;
};

export interface LinhaMetragem {
  /** "Final 4"; ausente quando a planta serve a um unico final. */
  rotulo?: string;
  itens: { area: string; pav?: string }[];
}

/** Detalhe por final e pavimento; vazio quando todas as metragens sao iguais. */
export const detalheMetragens = (u: Unidade): LinhaMetragem[] => {
  if (new Set(u.metragens.map((m) => m.area)).size <= 1) return [];
  return u.finais.map((f) => ({
    rotulo: u.finais.length > 1 ? `Final ${f}` : undefined,
    itens: u.metragens.filter((m) => m.final === f).map(({ area, pav }) => ({ area, pav })),
  }));
};

/** Texto de uma linha de detalhe, para legendas sem layout proprio. */
export const textoMetragem = (l: LinhaMetragem): string => {
  const itens = l.itens.map((i) => (i.pav ? `${formatarArea(i.area)} (${i.pav})` : formatarArea(i.area))).join(' · ');
  return l.rotulo ? `${l.rotulo}: ${itens}` : itens;
};
