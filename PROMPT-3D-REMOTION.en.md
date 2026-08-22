# Prompt: a Three.js scene inside Remotion

Paste this into your coding agent (Claude Code, Cursor, Codex — whichever).

It exists because everything listed here **fails silently**. The Studio shows
the right scene and the MP4 comes out black.

---

```
I need to run a Three.js scene inside a Remotion video, rendered frame by frame.

CONTEXT
I have a Three.js scene that already works in a standalone HTML file.
(If you don't: build a simple one first and get it working in the browser.)
I want to port it into a Remotion composition, preserving the scene's code.

THE RULE THAT GOVERNS EVERYTHING
Remotion renders frames OUT OF ORDER and IN PARALLEL, across several Chromium
tabs that share no state. So every frame must be a pure function of the frame
number.

In practice:
- Animate with Remotion's useCurrentFrame(). NEVER with R3F's useFrame(), and
  never with requestAnimationFrame.
- Derive time as `frame / fps` (seconds), not raw `frame` — that way speed
  doesn't change if I change the composition's fps.
- Any state that is currently an accumulator (`x += (target - x) * k`) has to
  become closed form. Exponential damping becomes:
  `x(t) = target + (x0 - target) * ratio^(t - t0)`
- Interaction (click, keypress) does not exist in video. Convert it to
  scheduling: a list of seconds on the timeline.

PORTING THE SCENE
- Do not retype the scene. Extract the script and apply targeted edits.
- Replace the importmap/CDN with `npm i three`.
- The renderer takes React's <canvas> and REQUIRES
  `preserveDrawingBuffer: true`, otherwise the screenshot comes out black.
- Pin `renderer.setPixelRatio(1)` — devicePixelRatio makes the output depend
  on the machine.
- Size comes in as a prop, never from useVideoConfig(): inside a panel that
  hook returns the size of the COMPOSITION, not of the container.
- Drop OrbitControls, the HUD, and resize/keyboard listeners.

ASYNC LOADING
GLB files, textures and shader compilation are async, and Remotion waits for
nothing it doesn't know about — it screenshots the loading state.
- Gate it with useDelayRender(). The default ceiling is 30 SECONDS; a heavy
  scene blows past it. Pass a larger timeoutInMilliseconds and label the call.
- Call renderer.compileAsync() before releasing the render.
- Build the scene ONCE per tab, not per frame.

FIVE THINGS THAT FAIL SILENTLY
None of them throws. None shows up in the Studio. All of them only appear in
the MP4.

1. useFrame() instead of useCurrentFrame().
   Symptom: wrong or jittery motion, different on every render.

2. UnrealBloomPass that is NOT the last pass in the chain.
   It has needsSwap = false and composites back into the same buffer whose
   texture it just sampled — a framebuffer<->texture feedback loop. Chrome
   with a GPU tolerates it; headless Chromium drops the draw and EVERY pass
   after it reads black.
   Symptom: entirely empty frame, zero errors.
   Fix: bloom last. If you need passes after it, don't use it.

3. Bloom last TOGETHER WITH OutputPass.
   Drawing to the screen makes three re-apply tone mapping and sRGB, so the
   conversion happens twice.
   Symptom: a washed-out image that reads as an aesthetic choice.
   Fix: drop OutputPass and let the renderer convert once, on the final draw.
   Bonus: bloom goes back to operating in linear HDR, which is where it was
   calibrated.

4. SMAAPass on three r168+.
   It ignores its constructor arguments and loads lookup textures through an
   async <img>.
   Fix: MSAA on the composer's target —
   new WebGLRenderTarget(w, h, { samples: 4 }) passed to EffectComposer.

5. Config.setChromiumOpenGlRenderer() in server-side rendering.
   It ONLY applies to the CLI. In renderMedia(), Lambda and Vercel it is
   silently ignored and the render falls back to software rendering.
   Fix: pass chromiumOptions: { gl: "angle" } explicitly.

DETAILS THAT SAVE AN HOUR
- <Sequence> renders a <div>, which is illegal inside a Three.js canvas. Use
  layout="none".
- Each tab holds its own WebGL context. High concurrency with a heavy scene
  becomes GPU memory pressure. Start low (--concurrency=2) and climb.
- In a Three.js scene the bottleneck is rarely the download; it is usually
  shader compilation on the first render. Measure before optimizing.

ACCEPTANCE TEST — do not skip this
Render the SAME frame twice, in separate processes, and compare the hashes:

  npx remotion still MyComp out/a.png --frame=90 --gl=angle
  npx remotion still MyComp out/b.png --frame=90 --gl=angle
  shasum -a 256 out/a.png out/b.png

The two hashes must be IDENTICAL. If they differ, a clock survived somewhere
— look for useFrame, Date.now, Math.random, or an accumulator.

While debugging, render STILLS and look at the image. Half the defects here
show up no other way. And if it goes black with no error, bisect: remove one
pass at a time until the image comes back.
```

---

## Why this prompt exists

Every item on that list cost a black render. Pitfalls 2, 3 and 4 were isolated
by bisection — one `remotion still` at a time until the image came back — and
appear in no documentation, because each one in isolation is correct behaviour
of a different library.

The acceptance test is what closes the loop. Without it you don't know whether
the video worked or whether you got lucky.

Portuguese version: [`PROMPT-3D-REMOTION.md`](./PROMPT-3D-REMOTION.md)
