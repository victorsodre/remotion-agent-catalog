import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  Behavior,
  MatrixRain,
  Particles,
  Scene3D,
  Spawner,
  StaggeredMotion,
  Step,
  resolvePoint,
  useViewportRect,
} from "remotion-bits";
import { THEME } from "../shared/theme";

const Escuro: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: THEME.text, fontFamily: THEME.fonte }}>{children}</AbsoluteFill>
);

const Claro: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: THEME.ink, fontFamily: THEME.fonte }}>
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

const DemoMatrixRain: React.FC = () => (
  <Escuro>
    <MatrixRain fontSize={18} color={THEME.zap} speed={1.15} density={1} streamLength={16} />
  </Escuro>
);

const DemoMatrixTexto: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [10, 36], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Escuro>
      <MatrixRain fontSize={16} color={THEME.zap} speed={1} density={1} streamLength={16} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity }}>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: THEME.ink,
            letterSpacing: -1.5,
            textAlign: "center",
            padding: 48,
            textShadow: `0 0 28px ${THEME.zap}`,
          }}
        >
          o fundo continua
        </div>
      </AbsoluteFill>
    </Escuro>
  );
};

const DemoFireflies: React.FC = () => {
  const rect = useViewportRect();
  return (
    <Escuro>
      <Particles startFrame={50}>
        <Spawner
          rate={0.25}
          max={160}
          area={{ width: rect.width, height: rect.height }}
          position={{ x: rect.width / 2, y: rect.height / 2 }}
          lifespan={90}
          velocity={{ x: 0.5, y: 0.5, varianceX: 1, varianceY: 1 }}
        >
          <StaggeredMotion transition={{ opacity: [0, 1, 0] }}>
            <div
              style={{
                width: rect.vmin * 1.1,
                height: rect.vmin * 1.1,
                borderRadius: "50%",
                backgroundColor: THEME.zap,
                boxShadow: `0 0 ${rect.vmin * 2}px ${rect.vmin}px ${THEME.zap}99`,
              }}
            />
          </StaggeredMotion>
        </Spawner>
        <Behavior wiggle={{ magnitude: 2, frequency: 0.1 }} wiggleVariance={1} />
      </Particles>
    </Escuro>
  );
};

const DemoSnow: React.FC = () => {
  const rect = useViewportRect();
  return (
    <Escuro>
      <Particles startFrame={90}>
        <Spawner
          rate={1.2}
          area={{ width: rect.width, height: 0 }}
          position={resolvePoint(rect, { x: "center", y: -200 })}
          lifespan={200}
          transition={{ opacity: [0, 1] }}
        >
          <div
            style={{
              width: rect.vmin * 1,
              height: rect.vmin * 1,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.95), transparent 70%)",
            }}
          />
          <div
            style={{
              width: rect.vmin * 2,
              height: rect.vmin * 2,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(224,231,255,0.9), transparent 70%)",
            }}
          />
          <div
            style={{
              width: rect.vmin * 4,
              height: rect.vmin * 4,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(199,210,254,0.35), transparent 70%)",
            }}
          />
        </Spawner>
        <Behavior gravity={{ y: 0.1 }} />
        <Behavior wiggle={{ magnitude: 1, frequency: 0.5 }} />
        <Behavior
          handler={(p) => {
            p.velocity.x += 0.01;
          }}
        />
      </Particles>
    </Escuro>
  );
};

const DemoFountain: React.FC = () => {
  const rect = useViewportRect();
  return (
    <Escuro>
      <Particles startFrame={24}>
        <Spawner
          rate={10}
          burst={20}
          position={resolvePoint(rect, { x: "center", y: "92%" })}
          area={{ width: rect.width * 0.12, height: 0 }}
          velocity={{
            x: 0,
            y: -rect.height * 0.045,
            varianceX: rect.width * 0.08,
            varianceY: rect.height * 0.012,
          }}
          lifespan={100}
          max={200}
        >
          <div
            style={{
              width: rect.vmin * 3.5,
              height: rect.vmin * 3.5,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${THEME.amber}cc, transparent 55%)`,
            }}
          />
          <div
            style={{
              width: rect.vmin * 5,
              height: rect.vmin * 5,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${THEME.a1}55, transparent 55%)`,
            }}
          />
          <div
            style={{
              width: rect.vmin * 2.4,
              height: rect.vmin * 2.4,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${THEME.ink}aa, transparent 50%)`,
            }}
          />
        </Spawner>
        <Behavior gravity={{ y: 0.2 }} />
      </Particles>
    </Escuro>
  );
};

const DemoCampoPulsante: React.FC = () => {
  const rect = useViewportRect();
  return (
    <Escuro>
      <Particles startFrame={28}>
        <Spawner
          rate={0.7}
          burst={10}
          max={48}
          position={{ x: rect.width / 2, y: rect.height / 2 }}
          area={{ width: 720, height: 520 }}
          velocity={{ x: 0, y: 0, varianceX: 0, varianceY: 0 }}
          lifespan={55}
          transition={{ opacity: [0, 1, 0], scale: [0.35, 1] }}
        >
          <div
            style={{
              width: rect.vmin * 1.6,
              height: rect.vmin * 1.6,
              borderRadius: "50%",
              backgroundColor: THEME.a1,
              boxShadow: `0 0 ${rect.vmin * 2}px ${THEME.a1}66`,
            }}
          />
        </Spawner>
      </Particles>
    </Escuro>
  );
};

const DemoScene3D: React.FC = () => {
  const rect = useViewportRect();
  const fontSize = rect.vmin * 9;
  return (
    <AbsoluteFill style={{ background: THEME.ink, fontFamily: THEME.fonte }}>
      <Scene3D perspective={1000} transitionDuration={36} stepDuration={48} easing="easeInOutCubic">
        <Step id="1" x={0} y={0} z={0} transition={{ opacity: [0, 1] }}>
          <h1 style={{ fontSize, margin: 0, color: THEME.text, fontWeight: 800 }}>cena</h1>
        </Step>
        <Step id="2" x={240} y={30} z={120} rotateY={-16} transition={{ opacity: [0, 1] }}>
          <h1
            style={{
              fontSize,
              margin: 0,
              background: THEME.panel,
              color: THEME.text,
              padding: `${rect.vmin * 1.2}px ${rect.vmin * 4}px`,
              borderRadius: THEME.radius,
              boxShadow: `0 18px 40px ${THEME.shadow}`,
            }}
          >
            câmera
          </h1>
        </Step>
        <Step id="3" x={-40} y={160} z={220} rotateY={12} transition={{ opacity: [0, 1] }}>
          <h1 style={{ fontSize, margin: 0, color: THEME.a1, fontWeight: 800 }}>ação</h1>
        </Step>
      </Scene3D>
    </AbsoluteFill>
  );
};

const DemoCardStack: React.FC = () => {
  const { vmin } = useViewportRect();
  const cardWidth = vmin * 28;
  const cardHeight = cardWidth * 1.45;
  const count = 7;
  const cards = Array.from({ length: count }, (_, i) => i);
  return (
    <Claro>
      <div
        style={{
          position: "relative",
          width: cardWidth,
          height: cardHeight,
          transformStyle: "preserve-3d",
        }}
      >
        <StaggeredMotion
          transition={{ y: [420, 0], frames: [0, 42], stagger: 4, easing: "spring" }}
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
          }}
        >
          {cards.map((i) => {
            const angle = (i - (count - 1) / 2) * 8;
            const xOffset = (i - (count - 1) / 2) * 52;
            const zOffset = i * -10;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  inset: 0,
                  transformStyle: "preserve-3d",
                  zIndex: count - i,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: i % 2 === 0 ? THEME.a1 : THEME.text,
                    color: THEME.ink,
                    borderRadius: 24,
                    boxShadow: `0 22px 48px ${THEME.shadow}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: cardWidth * 0.38,
                    fontWeight: 800,
                    transform: `translateZ(${zOffset}px) translateX(${xOffset}px) rotateZ(${angle}deg)`,
                  }}
                >
                  {i + 1}
                </div>
              </div>
            );
          })}
        </StaggeredMotion>
      </div>
    </Claro>
  );
};

const DemoGrade: React.FC = () => {
  const rect = useViewportRect();
  const cols = 4;
  const rows = 4;
  const gap = 18;
  const padding = 80;
  const availableWidth = rect.width - padding * 2 - gap * (cols - 1);
  const availableHeight = rect.height - padding * 2 - gap * (rows - 1);
  const itemSize = Math.min(availableWidth / cols, availableHeight / rows);
  const items = Array.from({ length: cols * rows }, (_, i) => i);
  return (
    <Claro>
      <StaggeredMotion
        transition={{
          scale: [0, 1],
          opacity: [0, 1],
          frames: [0, 45],
          stagger: 3,
          staggerDirection: "center",
          easing: "spring",
        }}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${itemSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${itemSize}px)`,
          gap,
        }}
      >
        {items.map((i) => (
          <div
            key={i}
            style={{
              backgroundColor: i % 2 === 0 ? THEME.a1 : THEME.text,
              borderRadius: THEME.radius,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: itemSize * 0.28,
              fontWeight: 800,
              color: THEME.ink,
            }}
          >
            {i + 1}
          </div>
        ))}
      </StaggeredMotion>
    </Claro>
  );
};

const DemoLista: React.FC = () => {
  const { width } = useViewportRect();
  const itens = [
    { title: "primeiro", mark: "1" },
    { title: "segundo", mark: "2" },
    { title: "terceiro", mark: "3" },
    { title: "quarto", mark: "4" },
  ];
  const itemWidth = Math.min(width * 0.78, 720);
  return (
    <Claro>
      <StaggeredMotion
        transition={{
          y: [48, 0],
          opacity: [0, 1],
          scale: [0.94, 1],
          frames: [0, 40],
          stagger: 6,
          staggerDirection: "forward",
          easing: "easeOutCubic",
        }}
        style={{ display: "flex", flexDirection: "column", gap: 16, width: itemWidth }}
      >
        {itens.map((item) => (
          <div
            key={item.title}
            style={{
              height: 88,
              backgroundColor: THEME.panel,
              borderRadius: THEME.radius,
              display: "flex",
              alignItems: "center",
              padding: "0 28px",
              gap: 18,
              boxShadow: `0 10px 28px ${THEME.shadow}`,
              fontSize: 28,
              fontWeight: 700,
              color: THEME.text,
            }}
          >
            <span style={{ color: THEME.a1, fontFamily: THEME.fonte }}>{item.mark}</span>
            {item.title}
          </div>
        ))}
      </StaggeredMotion>
    </Claro>
  );
};

export const bitsDemos: Record<string, React.FC> = {
  "FundosAmbiente::MatrixRain": DemoMatrixRain,
  "CenasProntas::MatrixRain + texto": DemoMatrixTexto,
  "Particulas::Fireflies": DemoFireflies,
  "Particulas::Snow": DemoSnow,
  "Particulas::Fountain": DemoFountain,
  "Particulas::Campo pulsante": DemoCampoPulsante,
  "Tridimensional::Scene3D + Step": DemoScene3D,
  "Tridimensional::Card stack": DemoCardStack,
  "MovimentoComposto::StaggeredMotion · grade": DemoGrade,
  "MovimentoComposto::StaggeredMotion · lista": DemoLista,
};
