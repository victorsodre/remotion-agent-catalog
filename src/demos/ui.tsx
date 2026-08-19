import React from "react";
import type { Caption, TikTokPage } from "@remotion/captions";
import { TransitionSeries } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { linearTiming } from "@remotion/transitions";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { BlurFocusIn } from "@/remotion/primitives/blur-focus-in";
import { TrackingIn } from "@/remotion/primitives/tracking-in";
import { StaggeredFadeUp } from "@/remotion/primitives/staggered-fade-up";
import { MaskedSlideReveal } from "@/remotion/primitives/masked-slide-reveal";
import { LightSweepText } from "@/remotion/primitives/light-sweep-text";
import { RgbGlitchText } from "@/remotion/primitives/rgb-glitch-text";
import { MatrixDecode } from "@/remotion/primitives/matrix-decode";
import { Typewriter } from "@/remotion/primitives/typewriter";
import { InfiniteMarquee } from "@/remotion/primitives/infinite-marquee";
import { Counter } from "@/remotion/primitives/counter";
import { SlotRoll } from "@/remotion/primitives/slot-roll";
import { ProgressBar } from "@/remotion/primitives/progress-bar";
import { MeshGradientBg } from "@/remotion/primitives/mesh-gradient-bg";
import { DynamicGrid } from "@/remotion/primitives/dynamic-grid";
import { ConfettiBurst } from "@/remotion/primitives/confetti-burst";
import { LineChartDraw } from "@/remotion/primitives/line-chart-draw";
import { SimulatedCursor } from "@/remotion/primitives/simulated-cursor";
import { KaraokeCaptions } from "@/remotion/primitives/karaoke-captions";
import { AudiogramBars } from "@/remotion/primitives/audiogram-bars";
import { WaveformLine } from "@/remotion/primitives/waveform-line";
import { AudioPulse } from "@/remotion/primitives/audio-pulse";
import { transitionDirectionalWipe } from "@/remotion/primitives/directional-wipe";
import { transitionZoomThrough } from "@/remotion/primitives/zoom-through";
import { transitionFrostedGlassWipe } from "@/remotion/primitives/frosted-glass-wipe";
import { transitionGridPixelateWipe } from "@/remotion/primitives/grid-pixelate-wipe";
import { LowerThird } from "@/remotion/scenes/lower-third";
import { MetricTicker } from "@/remotion/scenes/metric-ticker";
import { AnimatedBarChart } from "@/remotion/scenes/animated-bar-chart";
import { TimelineSteps } from "@/remotion/scenes/timeline-steps";
import { CalloutSpotlight } from "@/remotion/scenes/callout-spotlight";
import { CodeReveal } from "@/remotion/scenes/code-reveal";
import { TerminalSimulator } from "@/remotion/scenes/terminal-simulator";
import { DeviceMockupZoom } from "@/remotion/scenes/device-mockup-zoom";
import { MediaFrame } from "@/remotion/scenes/media-frame";
import { ZoomPanFrame } from "@/remotion/scenes/zoom-pan-frame";
import { SplitScreen } from "@/remotion/scenes/split-screen";
import { ClaudeChat } from "@/remotion/scenes/claude-chat";
import { ClaudeCode } from "@/remotion/scenes/claude-code";
import { ChatGpt } from "@/remotion/scenes/chat-gpt";
import { V0Composer } from "@/remotion/scenes/v0";
import { DataFlowPipes } from "@/remotion/scenes/data-flow-pipes";
import { DragDropFlow } from "@/remotion/scenes/drag-drop-flow";
import { ChatToPreview } from "@/remotion/scenes/chat-to-preview";
import { CodeAccordion } from "@/remotion/scenes/code-accordion";
import { HookCard } from "@/remotion/scenes/hook-card";
import { AutoFitTitle } from "@/remotion/scenes/auto-fit-title";
import { TalkingHeadLayout } from "@/remotion/scenes/talking-head-layout";
import { CaptionScene } from "@/remotion/scenes/caption-scene";
import { BRollStack } from "@/remotion/scenes/b-roll-stack";
import { CommentCallout } from "@/remotion/scenes/comment-callout";
import { AudiogramScene } from "@/remotion/scenes/audiogram-scene";
import { EndCard } from "@/remotion/scenes/end-card";
import { StatCard } from "@/remotion/scenes/stat-card";
import { BrowserFlow } from "@/compositions/browser-flow";
import { DashboardPopulate } from "@/compositions/dashboard-populate";
import { BentoPan } from "@/compositions/bento-pan";
import { ImageExpand } from "@/compositions/image-expand";
import { ToolMenuSlide } from "@/compositions/tool-menu-slide";
import { HeroDeviceAssemble } from "@/compositions/hero-device-assemble";
import { EcosystemOrbit } from "@/compositions/ecosystem-orbit";
import { PricingFocus } from "@/compositions/pricing-focus";
import { DeployReveal } from "@/compositions/deploy-reveal";
import { LandingCodeShowcase } from "@/compositions/landing-code-showcase";
import { THEME } from "../shared/theme";
import { Plate, Stage, STILL, TONE } from "./stage";

const INK = THEME.text;
const still = () => staticFile(STILL);
const tone = () => staticFile(TONE);

const karaokePage: TikTokPage = {
  text: "catálogo ao vivo",
  startMs: 0,
  durationMs: 2800,
  tokens: [
    { text: "catálogo", fromMs: 0, toMs: 900 },
    { text: " ao", fromMs: 900, toMs: 1400 },
    { text: " vivo", fromMs: 1400, toMs: 2800 },
  ],
};

const captions: Caption[] = [
  { text: "primeira", startMs: 0, endMs: 900, timestampMs: 0, confidence: 1 },
  { text: "linha", startMs: 900, endMs: 1600, timestampMs: 900, confidence: 1 },
  { text: "do gancho", startMs: 1600, endMs: 2800, timestampMs: 1600, confidence: 1 },
];

const bars = [
  { label: "PIX", value: 62 },
  { label: "Cartão", value: 28 },
  { label: "Boleto", value: 10 },
];

const DemoClockWipe: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <Cut
      transition={{
        presentation: clockWipe({ width, height }),
        timing: linearTiming({ durationInFrames: 24 }),
      }}
    />
  );
};

function Cut({
  transition,
}: {
  transition: { presentation: unknown; timing: unknown };
}) {
  return (
    <AbsoluteFill>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={48}>
          <Plate label="A" color={THEME.a1} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={transition.presentation as never}
          timing={transition.timing as never}
        />
        <TransitionSeries.Sequence durationInFrames={48}>
          <Plate label="B" color={THEME.a3} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
}

export const uiDemos: Record<string, React.FC> = {
  "TextoEntrada::BlurFocusIn": () => (
    <Stage>
      <BlurFocusIn text="foco" fontSize={96} color={INK} durationInFrames={84} delayInFrames={8} maxBlur={22} />
    </Stage>
  ),
  "TextoEntrada::TrackingIn": () => (
    <Stage>
      <TrackingIn text="título" fontSize={96} color={INK} durationInFrames={78} delayInFrames={8} />
    </Stage>
  ),
  "TextoEntrada::StaggeredFadeUp": () => (
    <Stage>
      <StaggeredFadeUp
        text="palavra a palavra"
        fontSize={64}
        color={INK}
        durationInFrames={42}
        staggerInFrames={14}
        delayInFrames={6}
      />
    </Stage>
  ),
  "TextoEntrada::MaskedSlideReveal": () => (
    <Stage>
      <MaskedSlideReveal
        text={"várias linhas\ncom máscara"}
        fontSize={72}
        color={INK}
        durationInFrames={48}
        staggerInFrames={18}
        delayInFrames={6}
      />
    </Stage>
  ),
  "TextoEfeito::LightSweepText": () => (
    <Stage>
      <LightSweepText text="brilho" fontSize={96} baseColor={INK} />
    </Stage>
  ),
  "TextoEfeito::RgbGlitchText": () => (
    <Stage>
      <RgbGlitchText text="glitch" fontSize={96} />
    </Stage>
  ),
  "TextoEfeito::MatrixDecode": () => (
    <Stage>
      <MatrixDecode text="decode" fontSize={84} color={INK} />
    </Stage>
  ),
  "TextoDigitado::Typewriter": () => (
    <Stage>
      <Typewriter text="digitando agora" fontSize={64} color={INK} />
    </Stage>
  ),
  "TextoDigitado::InfiniteMarquee": () => (
    <Stage pad={0}>
      <InfiniteMarquee text="faixa contínua · catálogo · " fontSize={72} color={INK} />
    </Stage>
  ),
  "NumerosDados::Counter": () => (
    <Stage>
      <Counter to={1280} fontSize={120} color={INK} />
    </Stage>
  ),
  "NumerosDados::SlotRoll": () => (
    <Stage>
      <SlotRoll from="000" to="249" fontSize={120} />
    </Stage>
  ),
  "NumerosDados::ProgressBar": () => (
    <Stage>
      <div style={{ width: "80%" }}>
        <ProgressBar progress={0.72} label="meta" />
      </div>
    </Stage>
  ),
  "NumerosDados::StatCard": () => <StatCard value={1280} label="assinantes" suffix="" theme="light" />,
  "FundosAmbiente::MeshGradientBg": () => <MeshGradientBg />,
  "FundosAmbiente::DynamicGrid": () => <DynamicGrid />,
  "FundosAmbiente::ConfettiBurst": () => (
    <Stage>
      <ConfettiBurst />
    </Stage>
  ),
  "CenasProntas::LowerThird": () => (
    <LowerThird title="Victor Sodre" subtitle="catálogo de peças" badge="AO VIVO" theme="light" />
  ),
  "CenasProntas::MetricTicker": () => (
    <MetricTicker
      title="números"
      metrics={[
        { label: "views", value: 12400, delta: "+18%" },
        { label: "CTR", value: 4.2, suffix: "%", delta: "+0.6" },
        { label: "conversão", value: 9.1, suffix: "%", delta: "+1.2" },
      ]}
    />
  ),
  "GraficosDados::AnimatedBarChart": () => (
    <AnimatedBarChart data={bars} title="meios" highlightLabel="PIX" />
  ),
  "AudioReativo::AnimatedBarChart": () => (
    <AnimatedBarChart data={bars} title="espectro" highlightLabel="PIX" />
  ),
  "GraficosDados::LineChartDraw": () => (
    <Stage>
      <LineChartDraw
        points={[
          { x: 0, y: 12, label: "s1" },
          { x: 1, y: 28, label: "s2" },
          { x: 2, y: 22, label: "s3" },
          { x: 3, y: 41, label: "s4" },
          { x: 4, y: 38, label: "s5" },
        ]}
        color={THEME.a1}
        showArea
        showDots
      />
    </Stage>
  ),
  "GraficosDados::TimelineSteps": () => (
    <TimelineSteps
      title="trilho"
      steps={[
        { title: "pedido", description: "aprovado" },
        { title: "separação", description: "hoje" },
        { title: "entrega", description: "amanhã" },
      ]}
      theme="light"
    />
  ),
  "GraficosDados::CalloutSpotlight": () => (
    <CalloutSpotlight
      title="aqui"
      subtitle="o detalhe que importa"
      target={{ x: 280, y: 280, width: 420, height: 280 }}
      backgroundSrc={still()}
      theme="light"
    />
  ),
  "CodigoTerminal::CodeReveal": () => (
    <CodeReveal
      title="Root.tsx"
      language="tsx"
      code={`export const RemotionRoot = () => (\n  <Composition id="Catalog" />\n);`}
      theme="light"
    />
  ),
  "CodigoTerminal::TerminalSimulator": () => (
    <TerminalSimulator command="npx remotion-ui add blur-focus-in" theme="light" />
  ),
  "CodigoTerminal::DeviceMockupZoom": () => (
    <DeviceMockupZoom src={still()} title="produto" subtitle="tela cheia" />
  ),
  "CodigoTerminal::SimulatedCursor": () => (
    <Stage>
      <div style={{ width: 640, height: 420, background: "#fff", borderRadius: 16, position: "relative" }} />
      <SimulatedCursor />
    </Stage>
  ),
  "MidiaEnquadramento::MediaFrame": () => (
    <MediaFrame src={still()} title="enquadramento" caption="fit cover" theme="light" />
  ),
  "MidiaEnquadramento::ZoomPanFrame": () => (
    <ZoomPanFrame src={still()} label="ken burns" from={{ scale: 1 }} to={{ scale: 1.35, x: 0.62, y: 0.4 }} />
  ),
  "MidiaEnquadramento::SplitScreen": () => (
    <SplitScreen left={{ src: still(), label: "antes" }} right={{ src: still(), label: "depois" }} title="lado a lado" theme="light" />
  ),
  "MidiaEnquadramento::KaraokeCaptions": () => (
    <Stage>
      <KaraokeCaptions page={karaokePage} />
    </Stage>
  ),
  "AudioReativo::AudiogramBars": () => (
    <Stage>
      <div style={{ width: "80%", height: 280 }}>
        <AudiogramBars src={tone()} barColor={THEME.a1} />
      </div>
    </Stage>
  ),
  "AudioReativo::WaveformLine": () => (
    <Stage>
      <WaveformLine src={tone()} height={220} strokeColor={THEME.a1} />
    </Stage>
  ),
  "AudioReativo::AudioPulse": () => (
    <Stage>
      <AudioPulse src={tone()} color={THEME.a1} />
    </Stage>
  ),
  "Transicoes::directionalWipe": () => <Cut transition={transitionDirectionalWipe({ direction: "from-left" })} />,
  "Transicoes::zoomThrough": () => <Cut transition={transitionZoomThrough({ direction: "in" })} />,
  "Transicoes::directionalWipe ↓": () => <Cut transition={transitionDirectionalWipe({ direction: "from-top" })} />,
  "Transicoes::zoomThrough suave": () => (
    <Cut transition={transitionZoomThrough({ direction: "out", maxScale: 1.6, blurPeak: 4, durationInFrames: 28 })} />
  ),
  "Transicoes2::frostedGlassWipe": () => <Cut transition={transitionFrostedGlassWipe()} />,
  "Transicoes2::gridPixelateWipe": () => <Cut transition={transitionGridPixelateWipe()} />,
  "Transicoes2::clockWipe": DemoClockWipe,
  "Transicoes2::frostedGlass largo": () => (
    <Cut transition={transitionFrostedGlassWipe({ panelWidth: 0.32, durationInFrames: 32 })} />
  ),
  "InterfacesIA::ClaudeChat": () => <ClaudeChat />,
  "InterfacesIA::ClaudeCode": () => <ClaudeCode />,
  "InterfacesIA::ChatGpt": () => <ChatGpt />,
  "InterfacesIA::V0Composer": () => <V0Composer />,
  "ProdutoInterface::BrowserFlow": () => <BrowserFlow />,
  "ProdutoInterface::DashboardPopulate": () => <DashboardPopulate />,
  "ProdutoInterface::BentoPan": () => <BentoPan />,
  "ProdutoInterface::ImageExpand": () => (
    <ImageExpand src={still()} title="abre" subtitle="o quadro" eyebrow="produto" />
  ),
  "ProdutoFluxo::DataFlowPipes": () => <DataFlowPipes theme="light" />,
  "ProdutoFluxo::DragDropFlow": () => <DragDropFlow theme="light" />,
  "ProdutoFluxo::ChatToPreview": () => <ChatToPreview previewUrl="remotionui.com/docs" theme="light" />,
  "ProdutoFluxo::ToolMenuSlide": () => <ToolMenuSlide />,
  "ProdutoLancamento::HeroDeviceAssemble": () => <HeroDeviceAssemble />,
  "ProdutoLancamento::EcosystemOrbit": () => <EcosystemOrbit />,
  "ProdutoLancamento::PricingFocus": () => <PricingFocus />,
  "ProdutoLancamento::DeployReveal": () => <DeployReveal />,
  "ProdutoCodigo::LandingCodeShowcase": () => <LandingCodeShowcase />,
  "ProdutoCodigo::CodeAccordion": () => <CodeAccordion theme="light" />,
  "ProdutoCodigo::CodeAccordion · curto": () => <CodeAccordion theme="light" activeIndex={0} />,
  "ProdutoCodigo::BrowserFlow · docs": () => <BrowserFlow url="remotionui.com/docs" title="documentação" />,
  "Verticais::HookCard": () => (
    <HookCard headline="o gancho na primeira tela" kicker="REEL" subtitle="antes de qualquer corte" theme="light" />
  ),
  "Verticais::AutoFitTitle": () => (
    <AutoFitTitle title="título que cabe sozinho" subtitle="sem medir no olho" theme="light" />
  ),
  "Verticais::TalkingHeadLayout": () => (
    <TalkingHeadLayout
      mediaSrc={still()}
      title="quem fala"
      subtitle="formato creator"
      captions={["primeira frase", "segunda frase"]}
      theme="light"
    />
  ),
  "Verticais::CaptionScene": () => (
    <CaptionScene captions={captions} durationInFrames={110} />
  ),
  "Verticais::BRollStack": () => (
    <BRollStack
      title="b-roll"
      items={[
        { src: still(), title: "take 1" },
        { src: still(), title: "take 2" },
        { src: still(), title: "take 3" },
      ]}
      theme="light"
    />
  ),
  "Verticais::CommentCallout": () => (
    <CommentCallout body="isso funciona no Studio?" author="Victor" handle="@ovictor" reply="sim — peça por peça" theme="light" />
  ),
  "Verticais::AudiogramScene": () => (
    <AudiogramScene src={tone()} title="corte de podcast" subtitle="áudio virando vídeo" />
  ),
  "Verticais::EndCard": () => (
    <EndCard title="segue o fio" subtitle="catálogo de peças" cta="ver o índice" url="victorsodre.github.io" theme="light" />
  ),
};
