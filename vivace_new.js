//var parser = require("./vivace").parser;

// where are our audio files?
var audioFilesDir = './media/';

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
        instance: new Tone.Sampler({"c4": parameters[0]}, function () { console.log('hey!!')}),
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
  var definitions = tree.code.definitions
  console.log('Definitions', definitions)
  console.log('Voices', voices)

  // Go to all definitions again and update voices details
  var voiceNames=[]
  for (var i=0; i<definitions.length; i=i+1) {
    var voiceName = definitions[i].name.val;
    voiceNames[voiceName]=true;

    if (definitions[i].attr.val === 'notes' || definitions[i].attr.val === 'n' || definitions[i].attr.val === 'p' || definitions[i].attr.val === 'pos') {
      if (definitions[i].is.type === 'values') {
        if (voices[voiceName]) {
          var notes = []
          for (var j=0; j<definitions[i].is.val.length; j++) {
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

    // Signal
    if (definitions[i].attr.val === 'signal') {
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
          voices[voiceName] = new Voice(chain.reverse(), [], [], parameters.reverse())
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
  // FIXME: Have some UI to load voices
  // voices['a'] = new Voice(new Tone.Synth())
  // voices['b'] = new Voice(new Tone.Synth())

  // FIXME: Better way to load/append videos
  // var video = document.createElement("video");
  // video.setAttribute("src", "media/eyes.mp4");
  // video.controls = false;
  // video.autoplay = false;
  // document.body.appendChild(video);

  // voices['v'] = new VideoVoice(video)
}

/*
 * Voice
 */

var Voice = function(chain, notes, dur, parameters) {
  this.notes = notes || []
  this.durations = dur || []
  this.countNotes = 0
  this.playing = false
  this.parameters = parameters
  // Keep track of list of name of elements in the chain
  this.chain = chain
  // Instantiate a Tonejs audio node for each element in chain, create object
  // to hold values/durations/position counter to params and notes/durations
  this.audioNodes = []
  this.videoNodes = []
  this.signals = {}
  for (var i=0; i<chain.length; i++) {
    var node = mapNameToAudioNode(chain[i], this.parameters[i])
    if (node.instance) this.audioNodes.push(node.instance)
    if (node.video) this.videoNodes.push(node.video)
    if (node.signals) {
      this.signals[chain[i]] = {}
      for (var j=0; j<node.signals.length; j++) {
        this.signals[chain[i]][node.signals[j]] = {
          values: [],
          durations: [],
          counter: 0
        }
        // Add UI to drawer at DOM
        var drawer = document.getElementById("drawer")
        var voiceEl = document.createElement("div")
        voiceEl.setAttribute("id", "voice-a")
        var nameEl = document.createElement("h2")
        nameEl.innerHTML = node.signals[j]
        voiceEl.appendChild(nameEl)
        drawer.appendChild(voiceEl)

        var dialEl = document.createElement("div")
        // TODO: Create high level element for voice, stop hardcoding voice
        // name
        var dialId = "a-" + chain[i] + "-" + node.signals[j]
        dialEl.setAttribute("id", dialId)
        voiceEl.appendChild(dialEl)
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

/*
 * VideoVoice
 */
var VideoVoice = function(video, notes, dur) {
  this.notes = notes || []
  this.rates = [1]
  this.durations = dur || []
  this.countNotes = 0
  this.fvalues = []
  this.fdur = []
  this.fcount = 0
  // Signal chain nodes
  this.instrument = video
  this.source = context.createMediaElementSource(video)
  //this.instrument = new Tone.Synth().toMaster()
  //this.instrument = instrument
  this.filter = new Tone.Filter({type: 'bandpass', Q: 12})
  // Signal chain onnections
  this.source.connect(this.filter)
  this.filter.toMaster()
}
VideoVoice.prototype.playInstrument = function() {
    if (this.notes.length <= 0) return
    if (this.durations.length <= 0) return
    var note = this.notes[this.countNotes % this.notes.length]
    var dur = this.durations[this.countNotes % this.durations.length]
    var rate = this.rates[this.countNotes % this.rates.length]

    this.instrument.play()
    this.instrument.currentTime = note
    this.instrument.playbackRate = rate

    Tone.Transport.scheduleOnce(this.playInstrument.bind(this), "+" + this.durations[this.countNotes++ % this.durations.length])
}
VideoVoice.prototype.stopInstrument = function() {
  this.notes = []
  this.fvalues = []
  this.instrument.pause()
  // FIXME: Use DOM id to hide it with CSS operation
}
VideoVoice.prototype.playFilter = function() {
    if (this.fvalues.length <= 0) return
    if (this.fdur.length <= 0) return
    var value = this.fvalues[this.fcount % this.fvalues.length]
    var dur = this.fdur[this.fcount % this.fdur.length]

    this.filter.frequency.linearRampToValueAtTime(value, Tone.now());
    Tone.Transport.scheduleOnce(this.playFilter.bind(this), "+" + this.fdur[this.fcount++ % this.fdur.length])
}

var previousVoices = []

function run () {
  var code = document.getElementById('code')
  var texec = exec(code.value)
  var currentVoices = texec[0]
  var activeVoices = texec[1]

  //console.log('TEXEC', texec);
  //console.log('active voices', activeVoices)
  //console.log('previous voices', previousVoices)

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

// key events: CTRL + x
var isCtrl = false;
document.onkeyup=function(e){
  if(e.which == 17) isCtrl=false;
}
document.onkeydown=function(e){
  if(e.which == 17) isCtrl=true;
  if(e.which == 88 && isCtrl == true) {
    run();
    return false;
  }
}

