import type { ReactNode } from 'react';

interface Props {
  src: string;
  alt: string;
  /** Proporcao largura/altura da imagem (implantacoes: 5400x2160 = 2.5). */
  ratio?: number;
  children?: ReactNode;
  className?: string;
  /** `box`: cabe na area disponivel (padrao). `width`: ocupa a largura e define a altura. */
  fit?: 'box' | 'width';
  /** Pinos menores, para plantas com numeros proximos. */
  denso?: boolean;
}

/**
 * Imagem que preserva a proporcao dentro da area disponivel (container query)
 * e serve de base para pinos posicionados em porcentagem.
 */
export default function Implantacao({
  src,
  alt,
  ratio = 2.5,
  children,
  className = '',
  fit = 'box',
  denso = false,
}: Props) {
  return (
    <div className={`plan-box${fit === 'width' ? ' fit-width' : ''}${denso ? ' is-dense' : ''} ${className}`}>
      <div className="plan" style={{ ['--ratio' as string]: ratio }}>
        <img src={src} alt={alt} draggable={false} decoding="async" />
        {children}
      </div>
    </div>
  );
}

interface PinoProps {
  label: string;
  x: number;
  y: number;
  ativo: boolean;
  nome: string;
  onSelect: () => void;
}

/** Pino de toque (alvo >= 2.5rem) sobre a implantacao. */
export function PinoMapa({ label, x, y, ativo, nome, onSelect }: PinoProps) {
  return (
    <button
      type="button"
      className={`pin${ativo ? ' is-active' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-pressed={ativo}
      aria-label={`${label} · ${nome}`}
      onClick={onSelect}
    >
      <span>{label}</span>
    </button>
  );
}
