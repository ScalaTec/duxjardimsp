import { SECOES, type Secao } from '../data/conteudo';

export interface SecaoAtual {
  secao: Secao;
  /** Titulo do cabecalho (ex.: "Parceiros do DUX" para /parceiro/...). */
  titulo: string;
  home: boolean;
}

/** Secao da navegacao correspondente a rota atual. */
export function secaoAtual(pathname: string): SecaoAtual {
  const inicio = SECOES[0];
  if (pathname.startsWith('/parceiro')) {
    return { secao: inicio, titulo: 'Parceiros do DUX', home: false };
  }
  const secao = SECOES.slice(1).find((s) => pathname.startsWith(s.path)) ?? inicio;
  return { secao, titulo: secao.titulo ?? secao.label, home: secao === inicio };
}
