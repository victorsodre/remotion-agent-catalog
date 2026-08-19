/**
 * Tema claro — padrão da thread no X (formato quadrado).
 * Fundo claro + texto escuro = legível no feed.
 */
export const THEME = {
	/** Fundo da página / canvas. */
	bg: '#F3F5F9',
	/** Mesmo papel do canvas (compat com nome antigo `ink`). */
	ink: '#F3F5F9',
	/** Cartões e painéis. */
	panel: '#FFFFFF',
	/**
	 * Azul oficial Remotion (#0B84F3) — ver remotion.dev brand.
	 * Usado no wordmark e como acento principal.
	 */
	remotion: '#0B84F3',
	/** Acentos. */
	a1: '#0B84F3',
	a2: '#6D28D9',
	a3: '#0C9B78',
	amber: '#E08A00',
	rose: '#E11D48',
	zap: '#1FBE5A',
	/** Texto principal (quase preto). */
	text: '#0B1220',
	/** Texto secundário. */
	textMute: '#5C667A',
	/** Texto em cima de selo/CTA colorido. */
	onAccent: '#0B1220',
	hairline: 'rgba(11, 18, 32, 0.10)',
	shadow: 'rgba(11, 18, 32, 0.10)',
	fonte: 'ui-monospace, SFMono-Regular, Menlo, monospace',
	radius: 12,
} as const;

export const FPS = 30;
/** Formato 1080×1080 (quadrado / X). Durações por parte: timing.ts */
export const SIZE = 1080;
