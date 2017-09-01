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
  'filter',
  'reverb'
]

function mapNameToAudioNode(name) {
  switch (name) {
    case 'synth':
      return {
        instance: new Tone.Synth(),
        notes: [],
        durations: []
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
  var tree = vivace.parse(input);

  var definitions = tree.code.definitions;
  console.log('definitions', definitions)

  // go to all definitions again and update voices details
  var voiceNames=[]
  for (var i=0; i<definitions.length; i=i+1) {
    var voiceName = definitions[i].name.val;
    voiceNames[voiceName]=true;

    if (definitions[i].attr.val === 'notes') {
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

    // signal
    if (definitions[i].attr.val === 'sig') {
      if (definitions[i].is.type === 'chains') {
        if (!voices[voiceName]) {
          // voices[voiceName] = new Voice(new Tone.Synth())
          let chain = definitions[i].is.val.map(function (el) {
            return el.name.val
          })
          voices[voiceName] = new Voice(chain.reverse())
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
  return [voices, voiceNames];
}

/*
 * Vivace initialization
 */

var initVivace = function() {
  // FIXME: Have some UI to load voices
  // voices['a'] = new Voice(new Tone.Synth())
  // voices['b'] = new Voice(new Tone.Synth())

  // FIXME: Better way to load/append videos
  var video = document.createElement("video");
  video.setAttribute("src", "media/eyes.mp4");
  video.controls = false;
  video.autoplay = false;
  document.body.appendChild(video);

  voices['v'] = new VideoVoice(video)
}

/*
 * Voice
 */

var Voice = function(chain, notes, dur) {
  this.notes = notes || []
  this.durations = dur || []
  this.countNotes = 0
  this.fvalues = []
  this.fdur = []
  this.fcount = 0
  this.playing = false
  // Keep track of list of name of elements in the chain
  this.chain = chain
  // Instantiate a Tonejs audio node for each element in chain
  this.audioNodes = []
  this.signals = {}
  for (var i=0; i<chain.length; i++) {
    var node = mapNameToAudioNode(chain[i])
    if (node.instance) this.audioNodes.push(node.instance)
    if (node.signals) {
      this.signals[chain[i]] = {}
      for (var j=0; j<node.signals.length; j++) {
        this.signals[chain[i]][node.signals[j]] = {
          values: [],
          durations: [],
          counter: 0
        }
      }
    }
    if (node.notes) this.notes[chain[i]] = []
    if (node.durations) this.durations[chain[i]] = []
  }
  // this.instrument = new Tone.Synth().toMaster()
  // this.instrument = instrument
  // this.filter = new Tone.Filter({type: 'bandpass', Q: 12})
  // Connect each node in chain to its next neighbor
  for (var i=0; i<chain.length-1; i++) {
    this.audioNodes[i].connect(this.audioNodes[i+1])
  }
  // Connect last audio node to master output
  this.audioNodes[this.audioNodes.length-1].toMaster()
  // this.instrument.connect(this.filter)
  // this.filter.toMaster()
}
Voice.prototype.playInstrument = function() {
    this.playing = false
    if (this.notes.length <= 0) return
    if (this.durations.length <= 0) return
    this.playing = true
    var note = this.notes[this.countNotes % this.notes.length]
    var dur = this.durations[this.countNotes % this.durations.length]

    // this.instrument.triggerAttackRelease(note, dur, Tone.now())
    this.audioNodes[0].triggerAttackRelease(note, dur, Tone.now())

    Tone.Transport.scheduleOnce(this.playInstrument.bind(this), "+" + this.durations[this.countNotes++ % this.durations.length])
}
Voice.prototype.stopInstrument = function() {
  this.playing = false
  this.notes = []
  this.fvalues = []
}
// TODO: Maybe playSignal can receive what signal as argument and just play
// it...
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

