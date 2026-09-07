import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/remotion/lib/caption-utils.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;

function parse(body) {
  // O parser não usa os helpers de animação importados pelo mesmo módulo.
  const context = vm.createContext({ exports: {}, require: () => ({}) });
  vm.runInContext(code, context, { timeout: 1000 });
  context.input = `1\n00:00:00,000 --> 00:00:01,000\n${body}`;
  return JSON.parse(vm.runInContext('JSON.stringify(exports.parseSubtitles(input))', context, { timeout: 250 }));
}

test('preserva voz, texto e tempos de uma legenda com classes', () => {
  assert.deepEqual(parse('<v.narrator.editor Victor><b>Olá</b> mundo</v>'), [
    { text: 'Olá mundo', startMs: 0, endMs: 1000, speaker: 'Victor' },
  ]);
});

test('mantém texto com um marcador sem fechamento', () => {
  assert.equal(parse('Texto <incompleto')[0].text, 'Texto <incompleto');
});

test('processa marcador malformado sem retrocesso exponencial', () => {
  const malformed = '<v.' + 'a.'.repeat(32) + '!';
  assert.equal(parse(malformed)[0].text, malformed);
});
