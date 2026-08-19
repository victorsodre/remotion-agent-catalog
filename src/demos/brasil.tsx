import React from "react";
import { AvaliacaoNota } from "@/remotion/brasil/avaliacao-nota";
import { BoletoPix } from "@/remotion/brasil/boleto-pix";
import { CarrinhoResumo } from "@/remotion/brasil/carrinho-resumo";
import { Cupom } from "@/remotion/brasil/cupom";
import { EstoqueRestante } from "@/remotion/brasil/estoque-restante";
import { FreteGratis } from "@/remotion/brasil/frete-gratis";
import { Parcelamento } from "@/remotion/brasil/parcelamento";
import { PixQr } from "@/remotion/brasil/pix-qr";
import { PrazoEntrega } from "@/remotion/brasil/prazo-entrega";
import { SeloEmpresa } from "@/remotion/brasil/selo-empresa";
import { SeloGarantia } from "@/remotion/brasil/selo-garantia";
import { WhatsappConversa } from "@/remotion/brasil/whatsapp-conversa";
import { Stage } from "./stage";

export const brasilDemos: Record<string, React.FC> = {
  "BrasilPagamento::PixQr": () => (
    <Stage>
      <PixQr valor="R$ 297,00" escala={1.12} />
    </Stage>
  ),
  "BrasilPagamento::BoletoPix": () => (
    <Stage>
      <BoletoPix escala={1.2} />
    </Stage>
  ),
  "BrasilPagamento::Parcelamento": () => (
    <Stage>
      <Parcelamento escala={1.15} />
    </Stage>
  ),
  "BrasilPagamento::CarrinhoResumo": () => (
    <Stage>
      <CarrinhoResumo escala={1.2} />
    </Stage>
  ),
  "BrasilConversao::FreteGratis": () => (
    <Stage>
      <FreteGratis escala={1.2} />
    </Stage>
  ),
  "BrasilConversao::Cupom": () => (
    <Stage>
      <Cupom escala={1.2} />
    </Stage>
  ),
  "BrasilConversao::EstoqueRestante": () => (
    <Stage>
      <EstoqueRestante escala={1.25} />
    </Stage>
  ),
  "BrasilConversao::PrazoEntrega": () => (
    <Stage>
      <PrazoEntrega escala={1.15} />
    </Stage>
  ),
  "BrasilConfianca::AvaliacaoNota": () => (
    <Stage>
      <AvaliacaoNota escala={1.15} />
    </Stage>
  ),
  "BrasilConfianca::SeloGarantia": () => (
    <Stage>
      <SeloGarantia escala={1.2} />
    </Stage>
  ),
  "BrasilConfianca::SeloEmpresa": () => (
    <Stage>
      <SeloEmpresa escala={1.2} />
    </Stage>
  ),
  "BrasilConfianca::WhatsappConversa": () => (
    <Stage>
      <WhatsappConversa escala={1.2} />
    </Stage>
  ),
};
