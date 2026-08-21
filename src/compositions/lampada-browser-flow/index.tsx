import { AbsoluteFill } from "remotion";
import { TransitionSeries } from "@remotion/transitions";
import { transitionFade } from "@/remotion/primitives/transition-fade";
import { DURATION } from "@/remotion/lib/motion-tokens";
import { ChatToPreview } from "@/remotion/scenes/chat-to-preview";
import { TitleCard } from "@/remotion/scenes/title-card";
import { LampadaCanvas } from "@/remotion/three/lampada";

/**
 * A lâmpada three.js dentro do fluxo de browser — cena 3D de verdade rodando
 * no viewport, em vez do card de resultado.
 *
 * A peça é sobre a tradução, não sobre a lâmpada: o que a página avulsa fazia
 * com `requestAnimationFrame` e a tecla Espaço vira `frame / fps` e um
 * agendamento. Por isso o texto cita o frame em que a luz acende — e ela acende
 * naquele frame em toda renderização, que é o ponto inteiro.
 */

/**
 * 48 + 270 − 12 = 306 frames = 10,2 s a 30 fps.
 *
 * O passar de 10 s é deliberado: a head VQV (video quality view) do For You só
 * dispara em vídeo de 10 s ou mais. O peso é pequeno (0.05) e o `foryou-composer`
 * mostrou que não move a pontuação — mas custa 10 frames e fecha o checklist.
 */
const SCENE_DURATIONS = {
  title: 48,
  preview: 270,
} as const;

export const LAMPADA_BROWSER_FLOW_DURATION =
  SCENE_DURATIONS.title + SCENE_DURATIONS.preview - DURATION.fast;

const FADE = transitionFade({ durationInFrames: DURATION.fast });

/**
 * Frame local (dentro da cena do browser) em que a lâmpada acende.
 *
 * Escolhido para cair depois de a última resposta terminar de escrever
 * (~frame 166): duas coisas se movendo ao mesmo tempo viram ruído.
 * O texto abaixo cita este número — se mudar aqui, mude lá.
 */
const ACENDE_NO_FRAME = 186;
const FPS_DA_PECA = 30;

/**
 * Estável no módulo, e não uma arrow inline: o slot é um componente, e
 * recriá-lo a cada render remontaria a cena three.js — que custa PMREM mais
 * compilação de shader — em todo frame.
 */
const CenaLampada: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => (
  <LampadaCanvas
    width={width}
    height={height}
    acionamentos={[ACENDE_NO_FRAME / FPS_DA_PECA]}
    // O viewport do browser é alto e estreito; a cena foi calibrada numa janela
    // larga. Afastar um pouco e inclinar para baixo mantém o piso preenchendo
    // o quadro, sem faixa de fundo no topo.
    distancia={1.18}
    polar={-0.2}
  />
);

export const LampadaBrowserFlow: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#080810" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.title}>
          <TitleCard
            title="A cena entra no vídeo"
            subtitle="three.js · lâmpada · render determinístico"
            speed={1.4}
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition {...FADE} />
        <TransitionSeries.Sequence durationInFrames={SCENE_DURATIONS.preview}>
          {/* O endereço é o servidor local de verdade em que a cena roda —
              `python3 -m http.server 8765` na pasta da lâmpada. */}
          <ChatToPreview
            speed={1.4}
            messages={[
              { role: "user", text: "Põe a lâmpada 3D aqui dentro" },
              {
                role: "assistant",
                text: "Entra como canvas. Troquei o relógio por frame ÷ fps — cada quadro sai idêntico, sempre.",
              },
              { role: "user", text: "E o atalho de acender?" },
              {
                role: "assistant",
                text: "Vira agendamento. Acende no frame 186 — e vai acender no 186 toda vez.",
              },
            ]}
            previewUrl="localhost:8765/lampada"
            previewLabel="Lâmpada · three.js"
            previewTitle="Sem relógio, sem sorte"
            previewCaption="Órbita e filamento saem do número do frame"
            placeholder="Descreva a cena…"
            previewSlot={CenaLampada}
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
