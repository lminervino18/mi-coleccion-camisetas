import type { ShirtColor, ShirtKind, ShirtKit, ShirtSize } from '@camisetas/contracts';

export const KIT_LABELS: Record<ShirtKit, string> = {
  home: 'Titular',
  away: 'Suplente',
  third: 'Alternativa',
  goalkeeper: 'Arquero',
  special: 'Especial',
};

export const KIND_LABELS: Record<ShirtKind, string> = {
  club: 'Club',
  national: 'Selección',
};

export const SIZE_LABELS: Record<ShirtSize, string> = {
  XS: 'XS',
  S: 'S',
  M: 'M',
  L: 'L',
  XL: 'XL',
  XXL: 'XXL',
};

export const COLOR_LABELS: Record<ShirtColor, string> = {
  white: 'Blanco',
  black: 'Negro',
  red: 'Rojo',
  blue: 'Azul',
  lightBlue: 'Celeste',
  navy: 'Azul marino',
  green: 'Verde',
  yellow: 'Amarillo',
  orange: 'Naranja',
  purple: 'Violeta',
  pink: 'Rosa',
  brown: 'Marrón',
  grey: 'Gris',
  gold: 'Dorado',
  silver: 'Plateado',
};

/** Swatch colours for the colour chips; kept close to how a kit actually reads. */
export const COLOR_SWATCHES: Record<ShirtColor, string> = {
  white: '#f5f5f5',
  black: '#1a1a1a',
  red: '#d32f2f',
  blue: '#1976d2',
  lightBlue: '#7cb5e3',
  navy: '#1a237e',
  green: '#2e7d32',
  yellow: '#fbc02d',
  orange: '#ef6c00',
  purple: '#7b1fa2',
  pink: '#e91e63',
  brown: '#6d4c41',
  grey: '#9e9e9e',
  gold: '#c9a227',
  silver: '#c0c0c0',
};
