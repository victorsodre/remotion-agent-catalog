/**
 * Marketing BR — vocabulário de venda brasileiro, animado.
 * Autoral (@ovictor), MIT. Cópia canônica neste repo (também em catalog-agent-thread).
 * Tema claro (padrão X): contraste alto, sombra leve, sem fundo dark.
 */

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../shared/theme';

const clamp = {
	extrapolateLeft: 'clamp' as const,
	extrapolateRight: 'clamp' as const,
};

const soft = { damping: 14, mass: 0.55, stiffness: 140 };
const pop = { damping: 9, mass: 0.5, stiffness: 160 };

function useEnter(delay = 0, config = soft) {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	return spring({ frame: frame - delay, fps, config });
}

// ─── Selo de desconto ───────────────────────────────────────────────

export const SeloDesconto: React.FC<{
	readonly texto: string;
	readonly cor?: string;
	readonly tamanho?: number;
}> = ({ texto, cor = THEME.amber, tamanho = 240 }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const entrada = spring({ frame, fps, config: pop });
	const balanco = Math.sin(frame / 16) * 3.5;
	const floatY = Math.sin(frame / 22) * 5;
	const brilho = interpolate(frame % 90, [0, 35, 55, 90], [-30, -30, 130, 130], clamp);
	const anel = 0.55 + (Math.sin(frame / 12) + 1) * 0.12;

	return (
		<div style={{ position: 'relative', width: tamanho, height: tamanho }}>
			<div
				style={{
					position: 'absolute',
					inset: -10,
					borderRadius: '50%',
					border: `2px solid ${cor}`,
					opacity: anel * 0.4,
					transform: `scale(${0.92 + anel * 0.12})`,
				}}
			/>
			<div
				style={{
					width: tamanho,
					height: tamanho,
					borderRadius: '50%',
					background: `radial-gradient(circle at 32% 28%, #fff9, transparent 42%), ${cor}`,
					color: THEME.onAccent,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: THEME.fonte,
					fontSize: tamanho * 0.2,
					fontWeight: 800,
					textAlign: 'center',
					lineHeight: 1.05,
					letterSpacing: -0.5,
					transform: `translateY(${floatY}px) scale(${entrada}) rotate(${-10 + balanco}deg)`,
					boxShadow: `0 18px 50px ${cor}55, 0 4px 0 ${cor}88`,
					overflow: 'hidden',
					position: 'relative',
				}}
			>
				<div
					style={{
						position: 'absolute',
						top: 0,
						bottom: 0,
						width: '38%',
						left: `${brilho}%`,
						background:
							'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
						transform: 'skewX(-18deg)',
						pointerEvents: 'none',
					}}
				/>
				<span style={{ position: 'relative', zIndex: 1, padding: 12 }}>{texto}</span>
			</div>
		</div>
	);
};

// ─── Preço ancorado ─────────────────────────────────────────────────

export const PrecoAncorado: React.FC<{
	readonly de: string;
	readonly por: string;
	readonly parcelas: string;
	readonly cor?: string;
	readonly escala?: number;
}> = ({ de, por, parcelas, cor = THEME.a3, escala = 1 }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const deIn = spring({ frame: frame - 2, fps, config: soft });
	const risco = interpolate(frame, [14, 40], [0, 1], clamp);
	const porIn = spring({ frame: frame - 28, fps, config: pop });
	const parcIn = spring({ frame: frame - 48, fps, config: soft });
	const glow = interpolate(frame, [28, 55, 100], [0, 0.45, 0.2], clamp);

	return (
		<div style={{ textAlign: 'center', fontFamily: THEME.fonte }}>
			<div
				style={{
					position: 'relative',
					display: 'inline-block',
					opacity: deIn,
					transform: `translateY(${(1 - deIn) * 16}px)`,
				}}
			>
				<span style={{ fontSize: 44 * escala, color: THEME.textMute, fontWeight: 500 }}>
					{de}
				</span>
				<div
					style={{
						position: 'absolute',
						left: -4,
						top: '52%',
						height: 3.5 * escala,
						width: `calc(${risco * 100}% + 8px)`,
						background: `linear-gradient(90deg, ${THEME.rose}, ${THEME.rose}cc)`,
						borderRadius: 2,
						boxShadow: `0 0 10px ${THEME.rose}66`,
					}}
				/>
			</div>

			<div style={{ position: 'relative', marginTop: 6 * escala }}>
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						width: 280 * escala,
						height: 100 * escala,
						transform: 'translate(-50%, -50%)',
						background: `radial-gradient(ellipse, ${cor}44, transparent 70%)`,
						opacity: glow,
						filter: 'blur(10px)',
						pointerEvents: 'none',
					}}
				/>
				<div
					style={{
						fontSize: 120 * escala,
						color: cor,
						fontWeight: 800,
						letterSpacing: -2,
						lineHeight: 1,
						transform: `scale(${0.72 + porIn * 0.28})`,
						opacity: Math.min(1, porIn * 1.2),
					}}
				>
					{por}
				</div>
			</div>

			<div
				style={{
					fontSize: 30 * escala,
					color: THEME.textMute,
					marginTop: 10 * escala,
					opacity: parcIn,
					transform: `translateY(${(1 - parcIn) * 12}px)`,
				}}
			>
				{parcelas}
			</div>
		</div>
	);
};

// ─── Contagem regressiva ────────────────────────────────────────────

export const Regressiva: React.FC<{
	readonly segundos: number;
	readonly cor?: string;
	readonly escala?: number;
	readonly rotulo?: string;
}> = ({ segundos, cor = THEME.text, escala = 1, rotulo }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const entrada = useEnter(0, soft);
	const restante = Math.max(0, segundos - Math.floor(frame / fps));
	const mm = String(Math.floor(restante / 60)).padStart(2, '0');
	const ss = String(restante % 60).padStart(2, '0');
	const piscando = frame % fps < fps * 0.55;
	const tick = spring({
		frame: frame % fps,
		fps,
		config: { damping: 18, stiffness: 220, mass: 0.4 },
	});

	return (
		<div
			style={{
				textAlign: 'center',
				fontFamily: THEME.fonte,
				opacity: entrada,
				transform: `scale(${0.9 + entrada * 0.1})`,
			}}
		>
			{rotulo ? (
				<div
					style={{
						fontSize: 22 * escala,
						color: THEME.amber,
						letterSpacing: 2,
						marginBottom: 14 * escala,
						fontWeight: 700,
						textTransform: 'uppercase',
					}}
				>
					{rotulo}
				</div>
			) : null}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 12 * escala,
					fontSize: 72 * escala,
					fontWeight: 800,
					color: cor,
					fontVariantNumeric: 'tabular-nums',
					transform: `scale(${0.98 + tick * 0.02})`,
				}}
			>
				<Bloco valor={mm} escala={escala} />
				<span style={{ opacity: piscando ? 1 : 0.25, transform: 'translateY(-2px)' }}>:</span>
				<Bloco valor={ss} escala={escala} accent />
			</div>
		</div>
	);
};

const Bloco: React.FC<{
	readonly valor: string;
	readonly escala: number;
	readonly accent?: boolean;
}> = ({ valor, escala, accent }) => (
	<span
		style={{
			background: accent
				? `linear-gradient(180deg, ${THEME.a1}18, ${THEME.panel})`
				: THEME.panel,
			border: `1px solid ${THEME.hairline}`,
			borderRadius: THEME.radius,
			padding: `${12 * escala}px ${20 * escala}px`,
			minWidth: 1.4 * 72 * escala,
			textAlign: 'center',
			boxShadow: `0 8px 24px ${THEME.shadow}, inset 0 1px 0 rgba(255,255,255,0.9)`,
		}}
	>
		{valor}
	</span>
);

// ─── Prova social ───────────────────────────────────────────────────

export type ProvaProps = {
	readonly depoimento: string;
	readonly autor: string;
	readonly papel: string;
	readonly cidade: string;
	readonly estrelas: number;
	readonly corDestaque?: string;
};

export const ProvaSocial: React.FC<ProvaProps & { readonly escala?: number }> = ({
	depoimento,
	autor,
	papel,
	cidade,
	estrelas,
	corDestaque = THEME.amber,
	escala = 1,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const card = spring({ frame: frame - 2, fps, config: soft });
	const textoIn = interpolate(frame, [18, 40], [0, 1], clamp);
	const metaIn = spring({ frame: frame - 42, fps, config: soft });

	return (
		<div
			style={{
				maxWidth: 860 * escala,
				padding: `${40 * escala}px ${44 * escala}px`,
				borderRadius: THEME.radius * 1.4,
				background: THEME.panel,
				border: `1px solid ${THEME.hairline}`,
				fontFamily: THEME.fonte,
				boxShadow: `0 24px 60px ${THEME.shadow}, 0 0 0 1px ${corDestaque}14`,
				opacity: card,
				transform: `translateY(${(1 - card) * 36}px) scale(${0.96 + card * 0.04})`,
			}}
		>
			<div style={{ display: 'flex', gap: 6 * escala, marginBottom: 18 * escala }}>
				{Array.from({ length: 5 }, (_, i) => {
					const s = spring({
						frame: frame - 10 - i * 6,
						fps,
						config: pop,
					});
					const ativa = i < estrelas;
					return (
						<span
							key={i}
							style={{
								fontSize: 36 * escala,
								color: ativa ? corDestaque : 'rgba(11,18,32,0.12)',
								transform: `scale(${ativa ? s : 0.6}) rotate(${ativa ? (1 - s) * -20 : 0}deg)`,
								display: 'inline-block',
								filter: ativa ? `drop-shadow(0 2px 4px ${corDestaque}55)` : undefined,
							}}
						>
							★
						</span>
					);
				})}
			</div>

			<p
				style={{
					fontSize: 34 * escala,
					color: THEME.text,
					lineHeight: 1.45,
					margin: 0,
					opacity: textoIn,
					transform: `translateY(${(1 - textoIn) * 10}px)`,
				}}
			>
				<span style={{ color: corDestaque, fontSize: 48 * escala, lineHeight: 0 }}>“</span>
				{depoimento}
				<span style={{ color: corDestaque }}>”</span>
			</p>

			<div
				style={{
					marginTop: 24 * escala,
					opacity: metaIn,
					transform: `translateY(${(1 - metaIn) * 12}px)`,
				}}
			>
				<div style={{ fontSize: 24 * escala, color: THEME.text, fontWeight: 700 }}>
					{autor}
				</div>
				<div style={{ fontSize: 20 * escala, color: THEME.textMute, marginTop: 4 * escala }}>
					{papel} · {cidade}
				</div>
			</div>
		</div>
	);
};

// ─── CTA Brasil ─────────────────────────────────────────────────────

export const CtaBrasil: React.FC<{
	readonly rotulo?: string;
	readonly cor?: string;
	readonly escala?: number;
	readonly chips?: readonly string[];
}> = ({
	rotulo = 'chamar no WhatsApp',
	cor = THEME.zap,
	escala = 1,
	chips = ['Pix à vista', '12x sem juros', 'nota fiscal'],
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const entrada = spring({ frame: frame - 4, fps, config: pop });
	const pulsa = 1 + Math.sin(frame / 10) * 0.025;
	const anel = interpolate(frame % 50, [0, 50], [1, 1.35], clamp);
	const anelOp = interpolate(frame % 50, [0, 50], [0.4, 0], clamp);
	const iconWiggle = Math.sin(frame / 7) * 4;

	return (
		<div style={{ textAlign: 'center', fontFamily: THEME.fonte }}>
			<div style={{ position: 'relative', display: 'inline-block' }}>
				<div
					style={{
						position: 'absolute',
						inset: -8,
						borderRadius: 999,
						border: `2px solid ${cor}`,
						transform: `scale(${anel})`,
						opacity: anelOp * entrada,
						pointerEvents: 'none',
					}}
				/>
				<div
					style={{
						display: 'inline-flex',
						alignItems: 'center',
						gap: 14 * escala,
						padding: `${22 * escala}px ${48 * escala}px`,
						borderRadius: 999,
						background: `linear-gradient(180deg, #3ee87a, ${cor})`,
						color: THEME.onAccent,
						fontSize: 34 * escala,
						fontWeight: 800,
						transform: `scale(${entrada * pulsa})`,
						boxShadow: `0 14px 40px ${cor}55, inset 0 1px 0 rgba(255,255,255,0.45)`,
					}}
				>
					<span
						style={{
							fontSize: 36 * escala,
							transform: `rotate(${iconWiggle}deg)`,
							display: 'inline-block',
						}}
					>
						✆
					</span>
					{rotulo}
				</div>
			</div>

			<div
				style={{
					marginTop: 22 * escala,
					display: 'flex',
					gap: 10 * escala,
					justifyContent: 'center',
					flexWrap: 'wrap',
				}}
			>
				{chips.map((t, i) => {
					const chip = spring({
						frame: frame - 22 - i * 7,
						fps,
						config: soft,
					});
					return (
						<span
							key={t}
							style={{
								fontSize: 20 * escala,
								color: THEME.textMute,
								border: `1px solid ${THEME.hairline}`,
								borderRadius: 999,
								padding: `${8 * escala}px ${16 * escala}px`,
								background: THEME.panel,
								boxShadow: `0 4px 14px ${THEME.shadow}`,
								opacity: chip,
								transform: `translateY(${(1 - chip) * 14}px)`,
							}}
						>
							{t}
						</span>
					);
				})}
			</div>
		</div>
	);
};

/** Defaults de demo — a thread usa PART3.prova em `src/content/thread.ts`. */
export const provaDefaults: ProvaProps = {
	depoimento: 'Fechei três contratos com o vídeo que eles fizeram.',
	autor: 'Maria Silva',
	papel: 'Sócia · Imobiliária da Maria',
	cidade: 'Caxias do Sul, RS',
	estrelas: 5,
	corDestaque: THEME.amber,
};
