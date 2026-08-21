import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useCurrentFrame, useDelayRender, useVideoConfig } from "remotion";
import { createLampada, type LampadaHandle } from "./scene";

/**
 * Fator de amortecimento por segundo, herdado da cena original
 * (`1 − 0.0008^dt` por quadro). Mantido idêntico para o acender ter o mesmo
 * peso no vídeo e na página.
 */
const DAMP = 0.0008;

/** Estado da lâmpada em `t`, resolvido em forma fechada. */
function lampadaEm(t: number, acionamentos: readonly number[]) {
  let valor = 0;
  let alvo = 0;
  let desde = 0;

  for (const quando of acionamentos) {
    if (quando > t) break;
    valor = alvo + (valor - alvo) * Math.pow(DAMP, quando - desde);
    alvo = alvo ? 0 : 1;
    desde = quando;
  }

  return {
    onAmt: alvo + (valor - alvo) * Math.pow(DAMP, t - desde),
    lightOn: alvo === 1,
  };
}

export type LampadaCanvasProps = {
  /**
   * Dimensões em pixel da área onde a cena vive.
   *
   * Vêm por prop, nunca de `useVideoConfig()`: dentro de um painel do
   * `ChatToPreview` o hook devolveria o tamanho da composição inteira, e a
   * cena renderizaria maior que o container. É a armadilha 1 do AGENTS.md.
   */
  width: number;
  height: number;
  /** Segundos, na linha de tempo da cena, em que a lâmpada é acionada. */
  acionamentos?: readonly number[];
  /** Segundos somados a `t` — adianta a órbita da câmera antes do primeiro frame. */
  offset?: number;
  /** Multiplica a distância da câmera. Acima de 1 afasta. */
  distancia?: number;
  /** Soma ao ângulo polar. Negativo inclina a câmera para baixo. */
  polar?: number;
};

/**
 * A cena da lâmpada como um frame de vídeo.
 *
 * O que a versão em página fazia com `requestAnimationFrame` e a tecla Espaço,
 * aqui vira `frame / fps` e uma lista de segundos. É a tradução inteira do
 * problema: relógio vira eixo, interação vira agendamento.
 */
export const LampadaCanvas: React.FC<LampadaCanvasProps> = ({
  width,
  height,
  acionamentos = [],
  offset = 0,
  distancia = 1,
  polar = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { delayRender, continueRender, cancelRender } = useDelayRender();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lampada = useRef<LampadaHandle | null>(null);
  const [pronta, setPronta] = useState(false);

  // Montar a cena custa caro (texturas procedurais, PMREM, compilação do
  // post-processing) e é assíncrono. Sem segurar o render aqui, o Remotion
  // fotografaria um canvas vazio. O teto de 30s do delayRender não cobre isto.
  const [handle] = useState(() =>
    delayRender("montando a cena three.js da lâmpada", {
      timeoutInMilliseconds: 120_000,
    }),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let viva = true;
    const instancia = createLampada(canvas, { width, height, distancia, polar });
    lampada.current = instancia;

    instancia
      .warmup()
      .then(() => {
        if (!viva) {
          return;
        }
        setPronta(true);
        continueRender(handle);
      })
      .catch((erro) => cancelRender(erro));

    return () => {
      viva = false;
      instancia.dispose();
      lampada.current = null;
    };
    // Uma cena por montagem: refazer a cada mudança de tamanho recompilaria
    // tudo no meio do render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useLayoutEffect e não useEffect: o desenho precisa acontecer antes do
  // browser pintar, para o screenshot do frame nunca pegar o quadro anterior.
  useLayoutEffect(() => {
    if (!pronta) {
      return;
    }
    const t = frame / fps + offset;
    lampada.current?.update(t, lampadaEm(t, acionamentos));
  }, [frame, fps, offset, pronta, acionamentos]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height, display: "block" }}
    />
  );
};
