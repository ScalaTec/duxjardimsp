// Converte os assets originais (Dux-imagens/) em WebP leve para o totem.
// Uso: node scripts/optimize-images.mjs
// Requer ImageMagick (magick) e poppler (pdftoppm) no PATH.
// Saida: public/img/** + src/data/unidades.generated.json
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, readdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const run = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'Dux-imagens');
const OUT = path.join(ROOT, 'public', 'img');
const TMP = path.join(ROOT, '.tmp-preview');

const dir = (...p) => path.join(SRC, ...p);
const find = (d, re) => {
  const hit = readdirSync(d).find((f) => re.test(f));
  if (!hit) throw new Error(`Arquivo nao encontrado em ${d}: ${re}`);
  return path.join(d, hit);
};

const jobs = [];
const produced = new Set();
/** Redimensiona para caber em maxDim (lado maior) e grava em WebP. */
function img(src, dest, { max = 1920, q = 80, extra = [] } = {}) {
  jobs.push(async () => {
    const out = path.join(OUT, dest);
    produced.add(out);
    mkdirSync(path.dirname(out), { recursive: true });
    await run('magick', [
      src, '-auto-orient', ...extra,
      '-resize', `${max}x${max}>`,
      '-strip', '-quality', String(q), '-define', 'webp:method=5', out,
    ]);
  });
}
/** Versao grande + miniatura. */
function imgWithThumb(src, dest, opts = {}) {
  img(src, `${dest}.webp`, opts);
  img(src, `${dest}-t.webp`, { max: opts.thumb ?? 720, q: 76, extra: opts.extra });
}

// ---------- Marca (logos 100% brancos para fundos escuros) ----------
const BRANCO = ['-fill', 'white', '-colorize', '100'];
img(find(dir('1 - Início'), /^Logomarca DUX\.png$/), 'brand/dux.webp', {
  max: 700, q: 92, extra: ['-trim', '+repage', ...BRANCO],
});
// O logo da Nacional Global vem sobre fundo branco: a luminancia vira a transparencia
// (traco escuro -> opaco) e a cor final e branca.
img(find(dir('1 - Início'), /^logo nacional\.png$/), 'brand/nacional-global.webp', {
  max: 700, q: 92,
  extra: [
    '-colorspace', 'Gray', '-negate', '-level', '0,55%',
    '-background', 'white', '-alpha', 'shape', '-trim', '+repage',
  ],
});
img(find(dir('1 - Início'), /^Logo Positivo Massoret\.png$/), 'brand/massoret.webp', {
  max: 700, q: 92, extra: ['-trim', '+repage', ...BRANCO],
});

// ---------- Fachada ----------
for (let i = 1; i <= 4; i++) {
  const n = String(i).padStart(2, '0');
  imgWithThumb(find(dir('4 - Fachada'), new RegExp(`CENA ${n} `)), `fachada/fachada-${n}`, {
    max: 2000, q: 80, thumb: 900,
  });
}

// ---------- Lazer ----------
const L = dir('5 - Lazer');
const lazer = [
  // [pasta, regex, slug]
  ['Lazer Térreo', /^2 - CLAUSURA/, 'clausura'],
  ['Lazer Térreo', /^3 - HALL/, 'hall'],
  ['Lazer Térreo', /^4 - DELIVERY/, 'delivery'],
  ['Lazer Térreo', /^5 - MINI MARKET/, 'mini-market'],
  ['Lazer Térreo', /^6 - LAVANDERIA/, 'lavanderia'],
  ['Lazer Térreo', /^8 - JOGOS/, 'jogos'],
  ['Lazer Térreo', /^9 ?-COWORKING/, 'coworking'],
  ['Lazer Térreo', /^10 - BRINQUEDOTECA/, 'brinquedoteca'],
  ['Lazer Térreo', /^11 - FESTAS/, 'festas'],
  ['Lazer Térreo', /^12 - CHURRASQUEIRA/, 'churrasqueira'],
  ['Lazer Térreo', /^13 - COLIVING/, 'coliving'],
  ['Lazer Térreo', /^14 - MASSAGEM/, 'massagem'],
  ['Lazer Térreo', /^15 - BELEZA/, 'beleza'],
  ['Lazer Térreo', /^16 - ACADEMIA/, 'academia'],
  ['Lazer Térreo', /^17 e 18 - PLAYGROUND/, 'playground-redario'],
  ['Lazer Térreo', /^19 - PET PLACE/, 'pet-place'],
  ['Lazer Rooftop', /^1 e 2 - PISCINA/, 'piscina-solarium'],
  ['Lazer Rooftop', /^3 - SAUNA/, 'sauna'],
  ['Lazer Rooftop', /^4 - +MIRANTE/, 'mirante'],
  ['Subsolo', /^01 BICICLETARIO/, 'bicicletario'],
];
for (const [pasta, re, slug] of lazer) {
  imgWithThumb(find(path.join(L, pasta), re), `lazer/${slug}`, { max: 1920, q: 80, thumb: 800 });
}
img(find(path.join(L, 'Lazer Térreo'), /^IMPLANTA/), 'lazer/impl-terreo.webp', { max: 2800, q: 82 });
img(find(path.join(L, 'Lazer Rooftop'), /^IMPLANTA/), 'lazer/impl-rooftop.webp', { max: 2800, q: 82 });
img(find(path.join(L, 'Subsolo'), /IMPLANTA/), 'lazer/impl-subsolo.webp', { max: 2800, q: 82 });

// ---------- Plantas ----------
const P = dir('6 - Plantas e Implantações');
const grupos = [
  { id: '1-11', dir: '1o ao 11o andar', pav: /IMPLANTA.+04/, torres: { t1: 'TORRE 1', t2: 'TORRE 2' } },
  { id: '12-14', dir: '12o ao 14o andar', pav: /IMPLANTA.+05/, torres: { t1: 'Torre 1' } },
  { id: '15', dir: '15o andar', pav: /IMPLANTA.+06/, torres: { t1: 'Torre 1' } },
  { id: '16-22', dir: '16o ao 22o andar', pav: /IMPLANTA.+07/, torres: { t1: 'Torre 1' } },
];
const unidades = {};
for (const g of grupos) {
  img(find(path.join(P, g.dir), g.pav), `plantas/pav-${g.id}.webp`, { max: 2800, q: 82 });
  unidades[g.id] = {};
  for (const [tk, tdir] of Object.entries(g.torres)) {
    const d = path.join(P, g.dir, tdir);
    const lista = [];
    for (const f of readdirSync(d).filter((x) => /\.jpe?g$/i.test(x))) {
      const m = f.match(/FINAL\s+([\d, e]+?)\s*-/i);
      if (!m) throw new Error(`Nome de planta inesperado: ${f}`);
      const nums = m[1].split(/\s*(?:,|\se\s)\s*/).map((n) => String(parseInt(n, 10)));
      const slug = `final-${nums.join('-')}`;
      const dest = `plantas/${g.id}-${tk}-${slug}`;
      // Apara a margem branca da planta (o JPG original tem ~70% de area vazia).
      imgWithThumb(path.join(d, f), dest, {
        max: 1800,
        q: 84,
        thumb: 640,
        extra: ['-fuzz', '7%', '-trim', '+repage', '-bordercolor', 'white', '-border', '48'],
      });
      lista.push({
        id: `${tk}-${slug}`,
        finais: nums.map(Number),
        label: `${nums.length > 1 ? 'Finais' : 'Final'} ${nums.join('/')}`,
        img: dest,
      });
    }
    lista.sort((a, b) => a.finais[0] - b.finais[0]);
    unidades[g.id][tk] = lista;
  }
}

// ---------- PDFs (localizacao) ----------
jobs.push(async () => {
  mkdirSync(TMP, { recursive: true });
  const pdf = find(dir('2 -Localização'), /\.pdf$/);
  await run('pdftoppm', ['-r', '40', '-png', '-singlefile', pdf, path.join(TMP, 'aerea')]);
  const out = path.join(OUT, 'localizacao/aerea.webp');
  produced.add(out);
  mkdirSync(path.dirname(out), { recursive: true });
  await run('magick', [path.join(TMP, 'aerea.png'), '-strip', '-quality', '82', '-define', 'webp:method=5', out]);
  rmSync(path.join(TMP, 'aerea.png'), { force: true });
});

// ---------- Execucao (4 em paralelo) ----------
let next = 0;
let done = 0;
async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++];
    await job();
    process.stdout.write(`\r${++done}/${jobs.length}`);
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
// Remove somente arquivos orfaos (nao apaga a pasta: o servidor do Vite em dev nao gosta).
const sweep = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) sweep(f);
    else if (!produced.has(f)) rmSync(f);
  }
};
if (existsSync(OUT)) sweep(OUT);
writeFileSync(
  path.join(ROOT, 'src', 'data', 'unidades.generated.json'),
  JSON.stringify(unidades, null, 2) + '\n',
);
console.log('\nOK');
