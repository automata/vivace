- [x] investigate tone.js https://tonejs.github.io/docs/#Sequence
- [x] redo video playback/control without popcorn
- [x] make it possible to route video audio through audio chains
- [x] make audio chains work again
- [x] use some music theory lib to define notes/durations easily (tune.js!)
- [x] redo the scheduler (tale of two clocks article)
- [x] smooth insertion/deletion of voices
- [x] improve grammar
  - [x] use tempo notation for durations
  - [x] define audio chain
  - [x] play params (automation)
- [x] implement chain manipulation
- [x] add UI to each param, on chain creation/manipulation https://nexus-js.github.io/ui/api/#intro
- [x] make it smooth to insert/delete a video and sampler
- [ ] add all tonejs nodes and make it possible to automate every param
- [ ] implement operators on sequences
- [ ] make it work again with client/server (sharejs)
- [ ] use a better lib to catch keystrokes and use ctrl/meta + enter to evaluate
- [ ] add some sintax to allow scales [i, iii, v] and foo.scale = minor_5 and foo.root = c4 params
- [ ] use more compact notation like [g4, e4, f4] @ [4n, 8n] ... [values/notes] @ [durations]
- [ ] add global start/stop UI
- [ ] fix UI and style it better
- [ ] collapse drawer
- [ ] add test units

extra (maybe for 1.1.0):
- show notes as a plot
- show node chain as a plot
- make it possible to drag and drop audio files
- show ui to audio files
- make it possible to filter videos (threejs/glsl shaders)
- make it possible to user more than one video
- make it possible to create larger arcs (e.g. group voices horizontally along time/repeat)

expected syntax:
    a.signal = synth => reverb => panner
    a.notes = [g4, d4, f4, a3] @ [4n, 8t]
    a.reverb.roomSize = [10, 20] @ [4n]

    b.signal = audio('foo.wav') => lowpass
    b.notes = [100, 200] @ [4n]

    c.signal = fmsynth => filter
    c.scale = 'minor_5'
    c.root = a2
    c.notes = [II, III, V] @ [8t]
