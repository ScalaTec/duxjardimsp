// Ambientes de lazer por pavimento. Os pinos (x, y) sao porcentagens sobre a
// imagem de implantacao (todas com proporcao 5400x2160).

export interface Pino {
  label: string;
  x: number;
  y: number;
}

export interface Ambiente {
  id: string;
  /** Numero(s) exibidos na lista, como na implantacao (ex.: "17/18"). */
  num: string;
  nome: string;
  desc: string;
  /** Caminho base da imagem (sem extensao): `${img}.webp` e `${img}-t.webp`. */
  img: string;
  pinos: Pino[];
}

export interface Nivel {
  id: 'terreo' | 'rooftop' | 'subsolo';
  nome: string;
  plano: string;
  ambientes: Ambiente[];
}

const a = (
  id: string,
  num: string,
  nome: string,
  desc: string,
  pinos: [string, number, number][],
): Ambiente => ({
  id,
  num,
  nome,
  desc,
  img: `lazer/${id}`,
  pinos: pinos.map(([label, x, y]) => ({ label, x, y })),
});

export const NIVEIS: Nivel[] = [
  {
    id: 'terreo',
    nome: 'Térreo',
    plano: 'lazer/impl-terreo.webp',
    ambientes: [
      a('clausura', '02', 'Clausura', 'Acesso seguro e controlado ao condomínio.', [['02', 50.0, 69.4]]),
      a('hall', '03', 'Hall', 'Recepção acolhedora na chegada ao DUX.', [['03', 47.5, 59.0]]),
      a('delivery', '04', 'Delivery', 'Ponto de recebimento de encomendas e entregas.', [['04', 43.2, 69.4]]),
      a('mini-market', '05', 'Mini Market', 'Conveniência a poucos passos de casa.', [['05', 36.9, 69.4]]),
      a('lavanderia', '06', 'Lavanderia', 'Praticidade para o dia a dia, sem sair do condomínio.', [['06', 29.9, 69.4]]),
      a('jogos', '08', 'Jogos', 'Espaço para jogos e encontros entre amigos.', [['08', 20.6, 42.8]]),
      a('coworking', '09', 'Coworking', 'Um ambiente para trabalhar e estudar sem sair de casa.', [['09', 38.3, 47.5]]),
      a('brinquedoteca', '10', 'Brinquedoteca', 'Espaço de brincar pensado para as crianças.', [['10', 44.8, 47.5]]),
      a('festas', '11', 'Festas', 'Salão para celebrar com conforto e estilo.', [['11', 62.8, 45.6]]),
      a('churrasqueira', '12', 'Churrasqueira', 'Espaço gourmet para receber família e amigos.', [['12', 63.4, 28.9]]),
      a('coliving', '13', 'Coliving', 'Ambiente de convivência para os moradores.', [['13', 64.6, 62.2]]),
      a('massagem', '14', 'Massagem', 'Sala dedicada ao bem-estar e ao relaxamento.', [['14', 70.7, 65.7]]),
      a('beleza', '15', 'Beleza', 'Cuidados pessoais no próprio condomínio.', [['15', 74.8, 65.7]]),
      a('academia', '16', 'Academia', 'Um espaço completo para cuidar da rotina com conforto e praticidade.', [['16', 73.7, 30.3]]),
      a('playground-redario', '17/18', 'Playground + Redário', 'Área verde para brincar e descansar ao ar livre.', [
        ['17', 62.1, 19.9],
        ['18', 54.7, 22.4],
      ]),
      a('pet-place', '19', 'Pet Place', 'Um espaço pensado para os pets do condomínio.', [['19', 39.8, 32.4]]),
    ],
  },
  {
    id: 'rooftop',
    nome: 'Rooftop',
    plano: 'lazer/impl-rooftop.webp',
    ambientes: [
      a('piscina-solarium', '01/02', 'Piscina e Solarium', 'Piscina e solarium com vista para a cidade.', [
        ['01', 67.6, 68.1],
        ['02', 63.2, 52.5],
      ]),
      a('sauna', '03', 'Sauna', 'Sauna para relaxar ao fim do dia.', [['03', 73.6, 29.7]]),
      a('mirante', '04', 'Mirante', 'Um ponto de contemplação no alto do DUX.', [['04', 84.5, 27.9]]),
    ],
  },
  {
    id: 'subsolo',
    nome: 'Subsolo',
    plano: 'lazer/impl-subsolo.webp',
    ambientes: [
      a('bicicletario', '01', 'Bicicletário', 'Bicicletário para quem se move com leveza pela cidade.', [['01', 42.7, 45.0]]),
    ],
  },
];
