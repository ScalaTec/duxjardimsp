// Conteudo editorial do totem. Textos baseados no prototipo aprovado,
// na Ficha Tecnica oficial (PDF) e no texto institucional (Inicio.docx).

export type Tema = 'dark' | 'light';

export interface Secao {
  id: string;
  num: string;
  label: string;
  /** Titulo exibido no cabecalho (padrao: label). */
  titulo?: string;
  path: string;
  tema: Tema;
}

export const SECOES: Secao[] = [
  { id: 'inicio', num: '01', label: 'Início', path: '/', tema: 'dark' },
  { id: 'localizacao', num: '02', label: 'Localização', path: '/localizacao', tema: 'light' },
  { id: 'ficha', num: '03', label: 'Ficha Técnica', path: '/ficha-tecnica', tema: 'light' },
  { id: 'fachada', num: '04', label: 'Fachada', path: '/fachada', tema: 'dark' },
  { id: 'lazer', num: '05', label: 'Lazer', path: '/lazer', tema: 'dark' },
  { id: 'plantas', num: '06', label: 'Plantas', titulo: 'Plantas e Implantações', path: '/plantas', tema: 'light' },
  { id: 'maquete', num: '07', label: 'Maquete', titulo: 'Maquete Virtual', path: '/maquete', tema: 'dark' },
];

export const EMPREENDIMENTO = {
  nome: 'DUX',
  sub: 'Jardim São Paulo',
  endereco: 'Rua Professor Fábio Fanucchi, 325',
  bairro: 'Jardim São Paulo · São Paulo',
  referencia: 'Ao lado da estação Jardim São Paulo do metrô.',
};

export const HOME = {
  titulo: 'Dux, do latim, “líder”.',
  destaque: 'Um projeto que nasce à frente: na localização, no lazer e no acabamento.',
  texto:
    'Ao lado da estação Jardim São Paulo do metrô, projetado para ser uma nova referência da Zona Norte.',
};

export interface Parceiro {
  id: 'nacional-global' | 'massoret';
  nome: string;
  papel: string;
  manchete: string;
  textos: string[];
  destaques?: { valor: string; rotulo: string }[];
  /** Blocos de numeros agrupados, exibidos sob um titulo proprio. */
  experiencia?: {
    titulo: string;
    grupos: { titulo: string; itens: { valor: string; rotulo: string }[] }[];
  };
  logo: string;
  cor?: string;
  /** Resumo exibido no cartao da Home. */
  resumo: string[];
}

export const PARCEIROS: Record<Parceiro['id'], Parceiro> = {
  'nacional-global': {
    id: 'nacional-global',
    nome: 'Nacional Global',
    papel: 'Construção',
    manchete: 'Responsável pela construção do DUX Jardim São Paulo.',
    textos: [
      'A obra é executada pela Nacional Global, que está no mercado desde 1996: são 30 anos de experiência, com mais de 20 obras entregues e 6 em andamento.',
      'As certificações ISO 9001 e PBQP-H atestam padrões de qualidade em todas as etapas, do planejamento à entrega.',
      'Entre os empreendimentos entregues na Zona Norte: Supreme Jardim São Paulo, I9 Hausen, I9 Relíquia e I9 Santo Egídio.',
    ],
    destaques: [
      { valor: '1996', rotulo: 'no mercado desde' },
      { valor: '+20', rotulo: 'obras entregues' },
      { valor: '6', rotulo: 'obras em andamento' },
      { valor: 'ISO 9001', rotulo: 'certificação' },
      { valor: 'PBQP-H', rotulo: 'certificação' },
    ],
    logo: 'brand/nacional-global.webp',
    cor: '#ff4a4a',
    resumo: ['Construção', '30 anos', 'ISO 9001', 'PBQP-H'],
  },
  massoret: {
    id: 'massoret',
    nome: 'Massoret',
    papel: 'Incorporação',
    manchete: 'Incorporação e desenvolvimento imobiliário por trás do projeto.',
    textos: [
      'A Massoret representa a convergência de duas famílias com tradição no mercado imobiliário, unidas pelo propósito de criar empreendimentos marcados pelo sucesso.',
      'Especialista no desenvolvimento completo de incorporações — da aquisição do terreno à entrega das unidades —, seus sócios somam quase 100 anos de atuação, reunindo experiência em construção, incorporação, desenvolvimento imobiliário e vendas.',
      'Massoret significa “tradição” em hebraico: uma bagagem que inspira e orienta cada novo projeto.',
    ],
    experiencia: {
      titulo: 'Experiência dos sócios',
      grupos: [
        {
          titulo: 'Participação em construção e incorporação',
          itens: [
            { valor: '5', rotulo: 'empreendimentos' },
            { valor: 'R$ 260 milhões', rotulo: 'em VGV' },
            { valor: '226', rotulo: 'unidades entregues' },
          ],
        },
        {
          titulo: 'Desenvolvimento imobiliário e vendas',
          itens: [
            { valor: '12', rotulo: 'empreendimentos' },
            { valor: 'R$ 630 milhões', rotulo: 'em VGV' },
            { valor: '1.419', rotulo: 'unidades entregues' },
          ],
        },
      ],
    },
    logo: 'brand/massoret.webp',
    resumo: ['Incorporação', 'Tradição e desenvolvimento imobiliário'],
  },
};

export const LOCALIZACAO = {
  titulo: 'No Jardim São Paulo, conectado à cidade.',
  texto: 'Veja o entorno do DUX em uma foto aérea oficial, com os principais pontos de referência da região.',
  destaques: [
    { valor: '1 min', rotulo: 'a pé da estação Jardim São Paulo' },
    { valor: '100 m', rotulo: 'do metrô' },
  ],
  foto: 'localizacao/aerea.webp',
  /** Rotulos da foto aerea oficial; x/y em % da imagem. */
  pois: [
    { id: 'estacao', nome: 'Estação Jardim São Paulo · 1 min a pé', curto: 'Estação Jardim São Paulo', x: 50.2, y: 59.5 },
    { id: 'parque-domingo-luis', nome: 'Parque Domingo Luís', curto: 'Parque Domingo Luís', x: 52.8, y: 77.3 },
    { id: 'shopping', nome: 'Shopping Center Norte', curto: 'Shopping Center Norte', x: 38.9, y: 17.7 },
    { id: 'expo', nome: 'Expo Center Norte', curto: 'Expo Center Norte', x: 25.3, y: 11.8 },
    { id: 'juventude', nome: 'Parque da Juventude', curto: 'Parque da Juventude', x: 48.8, y: 25.6 },
    { id: 'colegio', nome: 'Colégio Jardim São Paulo', curto: 'Colégio Jd. São Paulo', x: 36.9, y: 8.6 },
    { id: 'hospital', nome: 'Hospital São Camilo', curto: 'Hospital São Camilo', x: 84.6, y: 20.9 },
    { id: 'pao-de-acucar', nome: 'Pão de Açúcar', curto: 'Pão de Açúcar', x: 91.8, y: 12.0 },
    { id: 'oba', nome: 'Oba Hortifruti', curto: 'Oba Hortifruti', x: 43.5, y: 34.9 },
    { id: 'bio-ritmo', nome: 'Academia Bio Ritmo', curto: 'Academia Bio Ritmo', x: 77.4, y: 29.5 },
    { id: 'sesc', nome: 'Sesc Santana', curto: 'Sesc Santana', x: 17.6, y: 28.7 },
    { id: 'centro-esportivo', nome: 'Centro Esportivo Jd. São Paulo', curto: 'Centro Esportivo', x: 20.1, y: 44.2 },
    { id: 'anhembi', nome: 'Distrito Anhembi', curto: 'Distrito Anhembi', x: 61.0, y: 21.0 },
    { id: 'braz-leme', nome: 'Av. Braz Leme', curto: 'Av. Braz Leme', x: 68.1, y: 36.7 },
    { id: 'marginal', nome: 'Marginal Tietê', curto: 'Marginal Tietê', x: 22.6, y: 20.2 },
    { id: 'dumont', nome: 'Av. Luiz Dumont Vilares', curto: 'Av. Luiz D. Vilares', x: 8.0, y: 37.1 },
  ],
  dux: { x: 34.1, y: 57.4 },
};

export const FICHA = {
  titulo: 'Imponência por fora, inteligência por dentro.',
  tipo: 'Empreendimento de uso misto',
  stats: [
    { valor: '1.076 m²', rotulo: 'área do terreno' },
    { valor: '02', rotulo: 'torres' },
    { valor: '246', rotulo: 'unidades totais' },
    { valor: '203', rotulo: 'residenciais' },
    { valor: '41', rotulo: 'flats / NR' },
    { valor: '02', rotulo: 'lojas comerciais' },
  ],
  projeto: [
    { papel: 'Arquitetura', nome: 'Edda + Legal Projetos' },
    { papel: 'Paisagismo', nome: 'Studio Meta + Lares' },
    { papel: 'Interiores', nome: 'Studio Meta + Orlar' },
    { papel: 'Construção', nome: 'Nacional Global' },
  ],
};

export interface Torre {
  id: 'torre-1' | 'torre-2';
  nome: string;
  pavimentos: number;
  img: string;
  grupos: { titulo: string; linhas: string[] }[];
}

export const TORRES: Torre[] = [
  {
    id: 'torre-1',
    nome: 'Torre 01',
    pavimentos: 22,
    img: 'fachada/fachada-01',
    grupos: [
      {
        titulo: '1º–15º pavimentos',
        linhas: [
          '52 apartamentos de 2 dormitórios · entre 34 e 39 m²',
          '85 apartamentos de 1 dormitório · entre 27 e 38 m²',
          'Lazer descoberto e coberto no 15º pavimento',
        ],
      },
      {
        titulo: '12º–14º pavimentos',
        linhas: ['3 apartamentos de 2 dormitórios/suíte · 60 m² · 1 vaga cada'],
      },
      {
        titulo: '16º–22º pavimentos',
        linhas: [
          '7 apartamentos de 2 dormitórios/suíte · 55 m² · 1 vaga cada',
          '7 apartamentos de 2 suítes + lavabo · 75 m² · 1 vaga cada',
        ],
      },
    ],
  },
  {
    id: 'torre-2',
    nome: 'Torre 02',
    pavimentos: 11,
    img: 'fachada/fachada-04',
    grupos: [
      {
        titulo: 'Flats / NR · 2º–7º pavimentos',
        linhas: ['41 flats NR de 1 dormitório · entre 27 e 29 m²'],
      },
      {
        titulo: 'Apartamentos · 2º–11º pavimentos',
        linhas: [
          '29 apartamentos de 1 dormitório · entre 27 e 29 m²',
          '19 apartamentos de 2 dormitórios · entre 36 e 39 m²',
        ],
      },
      {
        titulo: 'Garden',
        linhas: ['1 apartamento garden de 2 dormitórios · 49 m²'],
      },
    ],
  },
];

export const FACHADAS = [1, 2, 3, 4].map((n) => {
  const id = String(n).padStart(2, '0');
  return { id, nome: `Fachada ${id}`, img: `fachada/fachada-${id}` };
});

export const MAQUETE = {
  url: import.meta.env.VITE_MAQUETE_URL || 'https://dux.allustudio.com/',
  titulo: 'Maquete virtual',
  texto: 'Navegue pela maquete interativa do DUX Jardim São Paulo em uma experiência dedicada.',
  indisponivel: {
    titulo: 'Maquete virtual indisponível',
    texto: 'Não foi possível carregar a maquete neste momento. Verifique a conexão com a internet e tente novamente.',
  },
};
