import type { ReactElement, SVGProps } from 'react';

export type IconName =
  | 'arrow-right'
  | 'arrow-left'
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'plus'
  | 'minus'
  | 'expand'
  | 'refresh'
  | 'home'
  | 'wifi-off'
  | 'touch';

const PATHS: Record<IconName, ReactElement> = {
  'arrow-right': <path d="M4 12h16m-6-6 6 6-6 6" />,
  'arrow-left': <path d="M20 12H4m6-6-6 6 6 6" />,
  'chevron-left': <path d="m15 5-7 7 7 7" />,
  'chevron-right': <path d="m9 5 7 7-7 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />,
  home: <path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  'wifi-off': <path d="M2 8.8a15 15 0 0 1 4.2-2.6m5.8-.8A15 15 0 0 1 22 8.8M5 12.9a10 10 0 0 1 3.6-2m4.9-.1a10 10 0 0 1 5.5 3M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M3 3l18 18" />,
  touch: <path d="M9 11V5a2 2 0 1 1 4 0v6m0-1.5a2 2 0 1 1 4 0V12m0-1a2 2 0 1 1 4 0v4a7 7 0 0 1-7 7h-1.5a6 6 0 0 1-4.6-2.1L4 15.3a1.9 1.9 0 0 1 2.9-2.4L9 15" />,
};

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: string;
}

/** Icones de traco (24px), `currentColor`, tamanho em `em` por padrao. */
export default function Icon({ name, size = '1.25em', ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
