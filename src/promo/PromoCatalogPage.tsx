import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { StaggeredMotion } from "remotion-bits";
import { TrackingIn } from "@/remotion/primitives/tracking-in";
import { StaggeredFadeUp } from "@/remotion/primitives/staggered-fade-up";
import { Typewriter } from "@/remotion/primitives/typewriter";
import { SimulatedCursor } from "@/remotion/primitives/simulated-cursor";
import { Counter } from "@/remotion/primitives/counter";
import { MeshGradientBg } from "@/remotion/primitives/mesh-gradient-bg";
import { ConfettiBurst } from "@/remotion/primitives/confetti-burst";
import { InfiniteMarquee } from "@/remotion/primitives/infinite-marquee";
import { transitionDirectionalWipe } from "@/remotion/primitives/directional-wipe";
import { transitionFrostedGlassWipe } from "@/remotion/primitives/frosted-glass-wipe";
import { PixQr } from "@/remotion/brasil/pix-qr";
import { BoletoPix } from "@/remotion/brasil/boleto-pix";
import { FreteGratis } from "@/remotion/brasil/frete-gratis";
import { WhatsappConversa } from "@/remotion/brasil/whatsapp-conversa";
import { Parcelamento } from "@/remotion/brasil/parcelamento";
import { CtaBrasil } from "@/marketing/components";
import { THEME } from "@/shared/theme";

/** 21s @ 30fps. Quadrado para o feed. */
export const PROMO_DURATION = 630;

const FONT = THEME.fonte;
const INK = THEME.text;

const LIBS: { n: number; nome: string }[] = [
  { n: 68, nome: "RemotionUI" },
  { n: 20, nome: "Autoral" },
  { n: 10, nome: "Bits" },
  { n: 4, nome: "remocn" },
];

const URL = "victorsodre.github.io/remotion-agent-catalog";

const wipeAB = transitionDirectionalWipe({
  durationInFrames: 20,
  direction: "from-right",
  edgeSoftness: 0.1,
});

const wipeCD = transitionFrostedGlassWipe({
  durationInFrames: 24,
  direction: "from-left",
  blur: 16,
  panelWidth: 0.16,
  frostColor: "rgba(11, 18, 32, 0.08)",
});

const fill: React.CSSProperties = {
  fontFamily: FONT,
  color: INK,
};

/**
 * A 90 + B 130 − wipe 20 = 200.
 * C 160 + D 164 + E 130 − frost 24 = 430, a partir do frame 200.
 */
export const PromoCatalogPage: React.FC = () => (
  <AbsoluteFill style={{ background: THEME.ink, ...fill }}>
    <Sequence durationInFrames={PROMO_DURATION}>
      <MeshGradientBg
        backgroundColor={THEME.ink}
        colors={["#5BA8F5", "#B18AE8", "#F0B84A"]}
        intensity={0.85}
      />
      {/* O shader do MeshGradientBg escurece o piso (~50%). No papel claro isso
          vira um morro — um wash devolve o THEME.ink sem apagar os blobs. */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(180deg, transparent 48%, rgba(243,245,249,0.72) 100%)",
          pointerEvents: "none",
        }}
      />
    </Sequence>

    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={90}>
        <BeatA />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition {...wipeAB} />
      <TransitionSeries.Sequence durationInFrames={130}>
        <BeatB />
      </TransitionSeries.Sequence>
    </TransitionSeries>

    <Sequence from={200} durationInFrames={430}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={160}>
          <BeatC />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...wipeCD} />
        <TransitionSeries.Sequence durationInFrames={164}>
          <BeatD />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence durationInFrames={130}>
          <BeatE />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </Sequence>
  </AbsoluteFill>
);

const BeatA: React.FC = () => (
  <AbsoluteFill
    style={{
      ...fill,
      alignItems: "center",
      justifyContent: "center",
      padding: 72,
      textAlign: "center",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "center" }}>
      <TrackingIn
        text="o quê já existe"
        fontSize={64}
        color={INK}
        fontFamily={FONT}
        fontWeight={800}
        durationInFrames={28}
        delayInFrames={20}
        fromTracking={0.18}
      />
      <StaggeredFadeUp
        text="antes da primeira linha"
        fontSize={36}
        color={THEME.textMute}
        fontFamily={FONT}
        fontWeight={600}
        staggerInFrames={4}
        durationInFrames={16}
        delayInFrames={55}
      />
    </div>
  </AbsoluteFill>
);

const BeatB: React.FC = () => (
  <AbsoluteFill style={{ ...fill, padding: 48 }}>
    <div
      style={{
        position: "absolute",
        top: 40,
        left: 64,
        right: 64,
        textAlign: "center",
      }}
    >
      <StaggeredFadeUp
        text="busca por intenção"
        fontSize={34}
        color={INK}
        fontFamily={FONT}
        fontWeight={800}
        staggerInFrames={3}
        durationInFrames={14}
        delayInFrames={4}
      />
      <div style={{ marginTop: 10 }}>
        <StaggeredFadeUp
          text="recebe a peça, a lib, o import"
          fontSize={24}
          color={THEME.textMute}
          fontFamily={FONT}
          fontWeight={600}
          staggerInFrames={3}
          durationInFrames={14}
          delayInFrames={8}
        />
      </div>
    </div>

    <div
      style={{
        position: "absolute",
        top: 168,
        left: 56,
        right: 56,
        bottom: 48,
        background: THEME.panel,
        border: `1px solid ${THEME.hairline}`,
        borderRadius: 18,
        boxShadow: `0 22px 48px ${THEME.shadow}`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 72,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 20px",
          borderBottom: `1px solid ${THEME.hairline}`,
          background: THEME.bg,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {[THEME.rose, THEME.amber, THEME.zap].map((c) => (
            <span
              key={c}
              style={{
                width: 12,
                height: 12,
                borderRadius: 99,
                background: c,
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            height: 40,
            borderRadius: 10,
            background: THEME.panel,
            border: `1px solid ${THEME.hairline}`,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            overflow: "hidden",
          }}
        >
          <Typewriter
            text="pix"
            fontSize={22}
            color={INK}
            fontFamily={FONT}
            fontWeight={600}
            durationInFrames={18}
            delayInFrames={10}
            cursorColor={THEME.remotion}
            reserveSpace={false}
          />
        </div>
      </div>

      <StaggeredMotion
        transition={{
          y: [28, 0],
          opacity: [0, 1],
          scale: [0.96, 1],
          frames: [0, 36],
          delay: 28,
          stagger: 7,
          easing: "easeOutCubic",
        }}
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 12,
          padding: 16,
          minHeight: 0,
        }}
      >
        <GridCell>
          <PixQr valor="R$ 297,00" escala={0.38} />
        </GridCell>
        <GridCell>
          <BoletoPix escala={0.42} />
        </GridCell>
        <GridCell>
          <FreteGratis escala={0.42} />
        </GridCell>
        <GridCell>
          <WhatsappConversa escala={0.42} />
        </GridCell>
      </StaggeredMotion>
    </div>

    {/* x/y são % do canvas 1080² — overlay no quadro inteiro, não na célula. */}
    <SimulatedCursor
      color={INK}
      accent={THEME.remotion}
      size={28}
      clickFrames={[36, 78]}
      points={[
        { x: 28, y: 22, frame: 0, label: "intenção" },
        { x: 42, y: 21.6, frame: 28, target: 64 },
        { x: 30, y: 48, frame: 58, label: "PixQr · Autoral" },
        { x: 30, y: 48, frame: 88, target: 72 },
      ]}
    />
  </AbsoluteFill>
);

const GridCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      background: THEME.bg,
      borderRadius: 14,
      border: `1px solid ${THEME.hairline}`,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
      minHeight: 0,
    }}
  >
    {children}
  </div>
);

const BeatC: React.FC = () => (
  <AbsoluteFill
    style={{
      ...fill,
      alignItems: "center",
      justifyContent: "center",
      padding: 72,
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, width: 820 }}>
      <Counter
        from={0}
        to={102}
        durationInFrames={72}
        delayInFrames={6}
        grouping={false}
        fontSize={148}
        fontWeight={800}
        color={INK}
        fontFamily={FONT}
        settle
      />
      <div style={{ fontSize: 22, color: THEME.textMute, fontWeight: 700, letterSpacing: 2 }}>
        PEÇAS NO CATÁLOGO
      </div>
      <StaggeredMotion
        transition={{
          y: [36, 0],
          opacity: [0, 1],
          frames: [0, 32],
          delay: 78,
          stagger: 8,
          easing: "easeOutCubic",
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
        }}
      >
        {LIBS.map((lib) => (
          <div
            key={lib.nome}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 22px",
              background: THEME.panel,
              border: `1px solid ${THEME.hairline}`,
              borderRadius: 12,
              boxShadow: `0 8px 22px ${THEME.shadow}`,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <span>{lib.nome}</span>
            <span style={{ fontVariantNumeric: "tabular-nums", color: THEME.remotion }}>{lib.n}</span>
          </div>
        ))}
      </StaggeredMotion>
      <div style={{ marginTop: 8, textAlign: "center" }}>
        <StaggeredFadeUp
          text="o lib é a fonte da verdade."
          fontSize={26}
          color={THEME.textMute}
          fontFamily={FONT}
          fontWeight={600}
          staggerInFrames={3}
          durationInFrames={14}
          delayInFrames={96}
        />
      </div>
    </div>
  </AbsoluteFill>
);

const BeatD: React.FC = () => (
  <AbsoluteFill style={{ ...fill, padding: 56 }}>
    <div style={{ position: "absolute", top: 56, left: 64, right: 64, textAlign: "center" }}>
      <StaggeredFadeUp
        text="as libs são do mercado americano."
        fontSize={32}
        color={INK}
        fontFamily={FONT}
        fontWeight={800}
        staggerInFrames={3}
        durationInFrames={14}
        delayInFrames={4}
      />
      <div style={{ marginTop: 12 }}>
        <StaggeredFadeUp
          text="a venda brasileira não."
          fontSize={32}
          color={THEME.remotion}
          fontFamily={FONT}
          fontWeight={800}
          staggerInFrames={3}
          durationInFrames={14}
          delayInFrames={28}
        />
      </div>
    </div>

    <Sequence from={0} durationInFrames={58} layout="none">
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <PixQr valor="R$ 297,00" escala={0.72} />
      </div>
    </Sequence>
    <Sequence from={52} durationInFrames={58} layout="none">
      <div
        style={{
          position: "absolute",
          top: 250,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Parcelamento principal={2990} n={12} jurosMes={0.0199} escala={0.72} />
      </div>
    </Sequence>
    <Sequence from={104} durationInFrames={60} layout="none">
      <div
        style={{
          position: "absolute",
          top: 320,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CtaBrasil escala={1.05} chips={["Pix à vista", "12x sem juros", "nota fiscal"]} />
      </div>
    </Sequence>
  </AbsoluteFill>
);

const BeatE: React.FC = () => (
  <AbsoluteFill
    style={{
      ...fill,
      alignItems: "center",
      justifyContent: "center",
      padding: 48,
    }}
  >
    <ConfettiBurst
      count={64}
      originX={50}
      originY={38}
      colors={[THEME.a1, THEME.a2, THEME.a3, THEME.amber, THEME.rose]}
      gravity={240}
      durationInFrames={100}
    />
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 48,
        width: "100%",
      }}
    >
      <CtaBrasil escala={1.2} chips={["102 peças", "lib honesto", "import pronto"]} />
      <div style={{ width: "100%", marginTop: 12 }}>
        <InfiniteMarquee
          text={URL}
          fontSize={28}
          color={INK}
          fontFamily={FONT}
          fontWeight={700}
          speed={1.6}
          gap={64}
        />
      </div>
    </div>
  </AbsoluteFill>
);
