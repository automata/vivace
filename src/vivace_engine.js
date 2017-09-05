var audioFilesDir = './media/';

var editor = null

// Store all the voices (main symbol table)
var voices = {};

// Instantiate audio context and start transport timeline
var context = new AudioContext();
Tone.setContext(context)
Tone.Transport.start();

var audioNodeNames = [
  'synth',
  'sampler',
  'video',
  'filter',
  'reverb'
]

var scaleDegrees = [ 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi' ]

function degreeToNumber(degree) {
  for (var i=0; i<scaleDegrees.length; i++) {
    if (scaleDegrees[i] === degree)
      return i
  }
  return degree
}

function mapNameToAudioNode(name, parameters) {
  switch (name) {
    case 'synth':
      return {
        instance: new Tone.Synth(),
        notes: [],
        durations: []
      }
    case 'sampler':
      return {
        instance: new Tone.Sampler({"c4": parameters[0]}),
        notes: [],
        durations: []
      }
    case 'video':
      var video = document.createElement("video")
      video.setAttribute("src", parameters[0])
      video.controls = false
      video.autoplay = false
      document.body.appendChild(video)
      return {
        instance: context.createMediaElementSource(video),
        video: video
      }
    case 'filter':
      return {
        instance: new Tone.Filter(),
        signals: [
          'frequency'
        ]
      }
    case 'reverb':
      return {
        instance: new Tone.Freeverb(),
        signals: [
          'roomSize',
          'dampening',
          'wet'
        ]
      }
    default:
      return
  }
}

function exec (input) {
  var tree = vivace.parse(input)
  var definitions = tree.code.definitions.reverse()
  console.log('Definitions', definitions)
  console.log('Voices', voices)

  // Go to all definitions again and update voices details
  var voiceNames=[]
  for (var i=0; i<definitions.length; i=i+1) {
    var voiceName = definitions[i].name.val;
    voiceNames[voiceName]=true;

    if (definitions[i].attr.val === 'notes' || definitions[i].attr.val === 'n') {
      if (definitions[i].is.type === 'values') {
        if (voices[voiceName]) {
          var notes = []
          for (var j=0; j<definitions[i].is.val.length; j++) {
            var note = definitions[i].is.val[j].val
            if (scaleDegrees.includes(note)) {
              // The list includes scale degrees
              if (voices[voiceName].scale) {
                notes.push(voices[voiceName].scale.get(degreeToNumber(note)).scientific())
              }
            } else if (note >= 0 && note < 13) {
              // The list includes some kind of indexes, maybe semitones? maybe
              // still degrees?
              if (voices[voiceName].scale) {
                // If there's an scale already set, use it as degrees
                notes.push(voices[voiceName].scale.get(degreeToNumber(note)).scientific())
              } else {
                // Otherwise, calculate the actual note based on interval semitones
                var semitones = parseInt(note)
                var interval = teoria.Interval().fromSemitones(semitones)
                var root = teoria.note(voices[voiceName].rootNote)
                var transposed = root.transposeNew(interval)
                notes.push(transposed.scientific())
              }
            } else {
              notes.push(definitions[i].is.val[j].val)
            }
          }
          voices[voiceName].notes = notes.reverse()
        }
      } else if (definitions[i].is.type === 'durations') {
        if (voices[voiceName]) {
          var durations = []
          for (var j=0; j<definitions[i].is.val.length; j++) {
            durations.push(definitions[i].is.val[j].val)
          }
          voices[voiceName].durations = durations.reverse()
        }
      }
    }
    if (definitions[i].attr.val === 'p' || definitions[i].attr.val === 'pos') {
      if (definitions[i].is.type === 'values') {
        if (voices[voiceName]) {
          var notes = []
          for (var j=0; j<definitions[i].is.val.length; j++) {
            var note = definitions[i].is.val[j].val
            notes.push(definitions[i].is.val[j].val)
          }
          voices[voiceName].notes = notes.reverse()
        }
      } else if (definitions[i].is.type === 'durations') {
        if (voices[voiceName]) {
          var durations = []
          for (var j=0; j<definitions[i].is.val.length; j++) {
            durations.push(definitions[i].is.val[j].val)
          }
          voices[voiceName].durations = durations.reverse()
        }
      }
    }

    if (definitions[i].attr.val === 'durations') {
      if (definitions[i].is.type === 'values') {
        if (voices[voiceName]) {
          var durations = []
          for (var j=0; j<definitions[i].is.val.length; j++) {
            durations.push(definitions[i].is.val[j].val)
          }
          voices[voiceName].durations = durations.reverse()
        }
      }
    }
    if (definitions[i].attr.val === 'rates') {
      if (definitions[i].is.type === 'values') {
        if (voices[voiceName]) {
          var vals = []
          for (var j=0; j<definitions[i].is.val.length; j++) {
            vals.push(definitions[i].is.val[j].val)
          }
          voices[voiceName].rates = vals.reverse()
        }
      }
    }
    // A kind of a hack to consider scale and root as chains, but only to use
    // the supposed node names as scale and root values ;-)
    if (definitions[i].attr.val === 'scale') {
      if (definitions[i].is.type === 'chains') {
        if (voices[voiceName]) {
          voices[voiceName].scaleName = definitions[i].is.val[0].name.val
          voices[voiceName].scale = teoria.scale(voices[voiceName].rootNote, voices[voiceName].scaleName)
        }
      }
    }
    if (definitions[i].attr.val === 'root') {
      if (definitions[i].is.type === 'chains') {
        if (voices[voiceName]) {
          var vals = []
          for (var j=0; j<definitions[i].is.val.length; j++) {
            vals.push(definitions[i].is.val[j].val)
          }
          voices[voiceName].root = Tone.Frequency(definitions[i].is.val[0].name.val)
          voices[voiceName].rootNote = definitions[i].is.val[0].name.val
        }
      }
    }

    // Signal
    if (definitions[i].attr.val === 'signal' || definitions[i].attr.val === 'sig' || definitions[i].attr.val === 's' || definitions[i].attr.val === 'chain' || definitions[i].attr.val === 'c') {
      if (definitions[i].is.type === 'chains') {
        if (!voices[voiceName]) {
          // voices[voiceName] = new Voice(new Tone.Synth())
          let chain = definitions[i].is.val.map(function (el) {
            return el.name.val
          })
          let parameters = definitions[i].is.val.map(function (el) {
            return el.parameters.map(function (par) {
              return par.val
            })
          })
          voices[voiceName] = new Voice(voiceName, chain.reverse(), [], [], parameters.reverse())
        }
        // TODO: Otherwise, if voice exists, see if chain changed, and update
        // it
        // if (definitions[i].is.val[0].name.val === 'audio') {
        //   voices[voiceName].sig = definitions[i].is.val[0].parameters[0].val;
        //   voices[voiceName].sigType = 'audio';
        // } else if (definitions[i].is.val[0].name.val === 'video') {
        //   voices[voiceName].sig = definitions[i].is.val[0].parameters[0].val;
        //   voices[voiceName].sigType = 'video';
        // }
      }
    // AudioNodes parameters
    } else if (audioNodeNames.includes(definitions[i].attr.val)) {
      if (voices[voiceName]) {
        if (definitions[i].inner_attr) {
          // Command has an inner attribute (e.g. foo.bar.baz = ...)
          if (definitions[i].is.type === 'values') {
            var vals = []
            for (var j=0; j<definitions[i].is.val.length; j++) {
              vals.push(definitions[i].is.val[j].val)
            }
            var attr = definitions[i].attr.val
            var inner_attr = definitions[i].inner_attr.val
            if (voices[voiceName].signals[attr][inner_attr].values.length == 0) {
              voices[voiceName].signals[attr][inner_attr].values = vals.reverse()
              voices[voiceName].playSignal(attr, inner_attr)
            } else {
              voices[voiceName].signals[attr][inner_attr].values = vals.reverse()
            }

          } else if (definitions[i].is.type === 'durations') {
            var vals = []
            for (var j=0; j<definitions[i].is.val.length; j++) {
              vals.push(definitions[i].is.val[j].val)
            }
            var attr = definitions[i].attr.val
            var inner_attr = definitions[i].inner_attr.val
            if (voices[voiceName].signals[attr][inner_attr].durations.length == 0) {
              voices[voiceName].signals[attr][inner_attr].durations = vals.reverse()
              voices[voiceName].playSignal(attr, inner_attr)
            } else {
              voices[voiceName].signals[attr][inner_attr].durations = vals.reverse()
            }
          }
        }
      }
    }
  }
  return [voices, voiceNames]
}

/*
 * Vivace initialization
 */

var initVivace = function() {
  // Just sets the welcoming message
  var textArea = document.getElementById("code")
  textArea.value = welcomeMessage

  // Overwrite default CM keymap to prevent conflict with Vivace's
  CodeMirror.keyMap.default["Cmd-]"] = null

  // Setup Code Mirror on text area
  editor = CodeMirror.fromTextArea(textArea, {
    mode: 'javascript',
    theme: 'abcdef',
    lineNumbers: true,
    scrollbarStyle: null
  })
}

/*
 * Voice
 */

var Voice = function(name, chain, notes, dur, parameters) {
  this.name = name
  this.notes = notes || []
  this.durations = dur || []
  this.countNotes = 0
  this.playing = false
  // Store "constructor" parameters given for chain nodes like sampler or
  // video, e.g. video('foo.mp4')
  this.parameters = parameters
  // Keep track of list of name of elements in the chain
  this.chain = chain
  // Instantiate a Tonejs audio node for each element in chain, create object
  // to hold values/durations/position counter to params and notes/durations
  this.audioNodes = []
  // Store video DOM objets when there are some, so we can control it (audio
  // stream from video nodes are stored just like normal audio nodes and
  // audioNodes
  this.videoNodes = []
  this.signals = {}

  // Add UI to drawer at DOM
  var drawer = document.getElementById("drawer")

  var voiceEl = document.createElement("div")
  voiceEl.setAttribute("id", "voice-" + this.name)
  voiceEl.setAttribute("class", "voice")
  drawer.appendChild(voiceEl)

  var voiceNameEl = document.createElement("h1")
  voiceNameEl.innerHTML = this.name
  voiceEl.appendChild(voiceNameEl)

  for (var i=0; i<chain.length; i++) {
    var node = mapNameToAudioNode(chain[i], this.parameters[i])
    if (node.instance) this.audioNodes.push(node.instance)
    if (node.video) this.videoNodes.push(node.video)
    if (node.signals) {
      var signalsEl = document.createElement("div")
      signalsEl.setAttribute("class", "signal")
      voiceEl.appendChild(signalsEl)

      this.signals[chain[i]] = {}
      for (var j=0; j<node.signals.length; j++) {
        this.signals[chain[i]][node.signals[j]] = {
          values: [],
          durations: [],
          counter: 0
        }
        var signalEl = document.createElement("div")
        signalEl.setAttribute("class", "signal")
        signalsEl.appendChild(signalEl)

        var nameEl = document.createElement("h2")
        nameEl.innerHTML = node.signals[j]
        signalEl.appendChild(nameEl)

        var dialEl = document.createElement("div")
        var dialId = this.name + "-" + chain[i] + "-" + node.signals[j]
        dialEl.setAttribute("id", dialId)
        dialEl.setAttribute("class", "dial")
        signalEl.appendChild(dialEl)

        // TODO: Define right min/max/step values
        var dialUI = new Nexus.Dial(dialId,{
          'size': [50,50],
          'interaction': 'vertical',
          'mode': 'relative', // "absolute" or "relative"
          'min': 0,
          'max': 1,
          'step': 0,
          'value': 0
        })
        dialUI.colorize("accent","#fff")
        dialUI.colorize("fill","#333")
        dialUI.on("change", function (signal, obj, v) {
          // Reset durations/values that are running before setting it manually
          obj.values = []
          obj.durations = []
          obj.counter = 0
          // Set param value
          signal.value = v
        }.bind(this, this.audioNodes[i][node.signals[j]], this.signals[chain[i]][node.signals[j]]))
      }
    }
    if (node.notes) this.notes[chain[i]] = []
    if (node.durations) this.durations[chain[i]] = []
  }
  // Connect each node in chain to its next neighbor
  for (var i=0; i<chain.length-1; i++) {
    this.audioNodes[i].connect(this.audioNodes[i+1])
  }
  // Connect last audio node to master output
  this.audioNodes[this.audioNodes.length-1].toMaster()
}

Voice.prototype.playInstrument = function() {
    this.playing = false
    if (this.notes.length <= 0) return
    if (this.durations.length <= 0) return
    this.playing = true
    var note = this.notes[this.countNotes % this.notes.length]
    var dur = this.durations[this.countNotes % this.durations.length]

    if (this.chain[0] === 'video') {
      this.videoNodes[0].play()
      this.videoNodes[0].currentTime = note
      // this.instrument.playbackRate = rate
    } else {
      this.audioNodes[0].triggerAttackRelease(note, dur, Tone.now())
    }

    Tone.Transport.scheduleOnce(this.playInstrument.bind(this), "+" + this.durations[this.countNotes++ % this.durations.length])
}

Voice.prototype.stopInstrument = function() {
  this.playing = false
  this.notes = []
  this.durations = []
  if (this.chain[0] === 'video') {
      // FIXME: Use DOM id to hide it with CSS operation
     this.videoNodes[0].pause()
  }
}

Voice.prototype.playSignal = function(nodeName, signalName) {
    var signal = this.signals[nodeName][signalName]
    var values = signal.values
    var durations = signal.durations
    var counter = signal.counter
    if (values.length <= 0) return
    if (durations.length <= 0) return
    var value = values[counter % values.length]
    var dur = durations[counter % durations.length]
    for (var i=0; i<this.chain.length; i++) {
      if (this.chain[i] === nodeName)
        this.audioNodes[i][signalName].linearRampToValueAtTime(value, Tone.now());
    }
    Tone.Transport.scheduleOnce(this.playSignal.bind(this, nodeName, signalName), "+" + durations[this.signals[nodeName][signalName].counter++ % durations.length])
}

var previousVoices = []

function run () {
  var code = editor.getValue()
  var texec = exec(code)
  var currentVoices = texec[0]
  var activeVoices = texec[1]

  // Stop removed voices
  for (previousVoice in previousVoices) {
    if (!activeVoices[previousVoice]) {
      // If a previously active voice isn't active anymore, stop it
      voices[previousVoice].stopInstrument()
    }
  }
  // Start new voices
  for (activeVoice in activeVoices) {
    if (!previousVoices[activeVoice]) {
      // If a current active voice wasn't active before, start it again
      voices[activeVoice].playInstrument()
    }
    // Keep playing the active voices
    if (!voices[activeVoice].playing)
      voices[activeVoice].playInstrument()
  }
  // Update voices that remain active
  // Do we need this? It seems to be done on exec()
  // for (activeVoice in activeVoices) {
  //   console.log('->', activeVoice)
  //   if (currentVoices[activeVoice]) {
  //     console.log('-->', currentVoices[activeVoice])
  //   }
  // }

  // Keep track of active voices
  previousVoices = activeVoices
}

/*
 * Drawer handling
 */

var drawerOpen = false

function toggleDrawer() {
  if (drawerOpen)
    document.getElementById("drawer").style.width = "0"
  else
    document.getElementById("drawer").style.width = "250px"
  drawerOpen = !drawerOpen
}

/*
 * Keystrokes handling
 */

keyboardJS.bind('command + enter', function(e) {
  run()
})
keyboardJS.bind('ctrl + enter', function(e) {
  run()
})
keyboardJS.bind('alt + enter', function(e) {
  run()
})

keyboardJS.bind('command + .', function(e) {
  // TODO: Implement stop all
})

keyboardJS.bind('command + ]', function(e) {
  toggleDrawer()
})
keyboardJS.bind('ctrl + ]', function(e) {
  toggleDrawer()
})
keyboardJS.bind('alt + ]', function(e) {
  toggleDrawer()
})
