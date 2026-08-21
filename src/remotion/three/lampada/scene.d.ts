/**
 * Tipos da API pública de `scene.js`, escritos à mão.
 *
 * O módulo é JavaScript de propósito (ver o cabeçalho de `scene.js`): é a cena
 * do autor, preservada. Só o contrato de fora precisa de tipo.
 */

export type LampadaState = {
  /**
   * Quanto a lâmpada está acesa, de 0 a 1. Contínuo, não booleano — é o
   * amortecimento entre apagada e acesa.
   *
   * Chega pronto de fora porque a forma original era um acumulador
   * (`x += (alvo − x) · k`), e acumulador não sobrevive a frames renderizados
   * fora de ordem. O lado React resolve isso em forma fechada.
   */
  onAmt: number;
  /** Se o alvo atual é aceso. Governa só a cintilação do filamento. */
  lightOn: boolean;
};

export type LampadaHandle = {
  /** Desenha UM frame. `t` em segundos, derivado de `frame / fps`. */
  update: (t: number, state: LampadaState) => void;
  /** Compila os shaders e desenha o frame zero. Aguarde antes de liberar o render. */
  warmup: () => Promise<void>;
  /** Libera composer e renderer. */
  dispose: () => void;
};

export function createLampada(
  canvas: HTMLCanvasElement,
  size: {
    width: number;
    height: number;
    /** Multiplica a distancia da camera. >1 afasta. */
    distancia?: number;
    /** Soma ao angulo polar. Negativo inclina a camera para baixo. */
    polar?: number;
  },
): LampadaHandle;
