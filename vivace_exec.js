//var parser = require("./vivace").parser;

// where are our audio files?
var audioFilesDir = './media/';

// store all the voices (main symbol table)
var voices = {};

// our audio context
var context = new webkitAudioContext();

function exec (input) {
  var tree = vivace.parse(input);

  var definitions = tree.code.definitions;
  

  // go to all definitions again and update voices details
  var voiceNames=[]
  for (var i=0; i<definitions.length; i=i+1) {
    var voiceName = definitions[i].name.val;
    voiceNames[voiceName]=true;

    // signal
    if (definitions[i].attr.val === 'sig') {
      if (definitions[i].is.type === 'chains') {
        // for now, just dealing with audio('id') and video('id')
        if (definitions[i].is.val[0].name.val === 'audio') {
          voices[voiceName].sig = definitions[i].is.val[0].parameters[0].val;
          voices[voiceName].sigType = 'audio';
        } else if (definitions[i].is.val[0].name.val === 'video') {
          voices[voiceName].sig = definitions[i].is.val[0].parameters[0].val;
          voices[voiceName].sigType = 'video';
        }
      }
    // amp
    } else if (definitions[i].attr.val === 'amp') {
      // [ ]
      if (definitions[i].is.type === 'values') {
        var amp = [];
        for (var j=0; j<definitions[i].is.val.length; j=j+1) {
          amp.push(definitions[i].is.val[j].val);
        }
        voices[voiceName].amp = amp.reverse();
      // { }
      } else if (definitions[i].is.type === 'durations') {
        var dur = [];
        for (var j=0; j<definitions[i].is.val.length; j=j+1) {
          dur.push(definitions[i].is.val[j].val);
        }
        voices[voiceName].dur = dur.reverse();
      }
    // pos
    } else if (definitions[i].attr.val === 'pos') {
      // [ ]
      if (definitions[i].is.type === 'values') {
        var pos = [];
        for (var j=0; j<definitions[i].is.val.length; j=j+1) {
          pos.push(definitions[i].is.val[j].val);
        }
        voices[voiceName].pos = pos.reverse();
      // { }
      } else if (definitions[i].is.type === 'durations') {
        var dur = [];
        for (var j=0; j<definitions[i].is.val.length; j=j+1) {
          dur.push(definitions[i].is.val[j].val);
        }
        voices[voiceName].dur = dur.reverse();
      }
    // gdur
    } else if (definitions[i].attr.val === 'gdur') {
      // [ ]
      if (definitions[i].is.type === 'values') {
        var gdur = [];
        for (var j=0; j<definitions[i].is.val.length; j=j+1) {
          gdur.push(definitions[i].is.val[j].val);
        }
        voices[voiceName].gdur = gdur.reverse();
      // { }
      } else if (definitions[i].is.type === 'durations') {
        var dur = [];
        for (var j=0; j<definitions[i].is.val.length; j=j+1) {
          dur.push(definitions[i].is.val[j].val);
        }
        voices[voiceName].dur = dur.reverse();
      }
    }
  }
  return [voices,voiceNames];
}

function loadAudioFile(voiceName) {
  var request = new XMLHttpRequest();
  var url = audioFilesDir + voices[voiceName].sig;
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  request.onload = function() {
    context.decodeAudioData(request.response, function(buffer) {
      voices[voiceName].buffer = buffer;
    });
  }

  request.onerror = function() {
    console.log('error while loading audio file from ' + url);
  }

  request.send();
}

function loadVideoFile(voiceName) {
  vid = document.createElement('video');
  vid.src = audioFilesDir + voices[voiceName].sig;
  vid.id = voiceName;
  //vid.setAttribute('controls', true);
  //vid.setAttribute('autoplay',true);
  document.getElementsByTagName('body')[0].appendChild(vid);
  voices[voiceName].sigPop = Popcorn('#'+voiceName);
  voices[voiceName].sigPop.preload('auto');
}

function playVoice(voiceName, when, offset, duration) {
  var source = context.createBufferSource();
  source.buffer = voices[voiceName].buffer;

  source.connect(context.destination);

  // // TODO: here we will use the voices[voiceName].sig dsp graph!!!
  // var gain = context.createGainNode();
  // source.connect(gain);

  // var filter = context.createBiquadFilter();
  // gain.connect(filter);

  // filter.connect(context.destination);
  // gain.gain.value = 0.2;
  // filter.type = 0;
  // filter.frequency.value = 880;

  //source.noteOn(when || context.currentTime);
  source.start(when || context.currentTime, // at specified time or now
                     offset || 0, // starting at offset or from start
                     duration || source.buffer.duration); // during duration or the whole buffer
}

function playVideo(voiceName, offset) {
  voices[voiceName].sigPop.play(offset);
}

function tick () {
  beats += 1;
  
  for (event in events) {
    if (events[event].nextBeat == beats) {
      var voiceName = events[event].voiceName;
      if (voices[voiceName].sigType === 'audio') {
        playVoice(voiceName, // voiceName
                  context.currentTime, // when
                  voices[voiceName].pos[voices[voiceName].posId % voices[voiceName].pos.length], // offset
                  voices[voiceName].gdur[voices[voiceName].gdurId % voices[voiceName].gdur.length] // grain duration
                 );
        // update event
        voices[voiceName].durId += 1;
        voices[voiceName].posId += 1;
        voices[voiceName].gdurId += 1;

        events[event].nextBeat = (voices[voiceName].dur[voices[voiceName].durId % voices[voiceName].dur.length] * semiBreve) + beats;
      } else if (voices[voiceName].sigType === 'video') {
        playVideo(voiceName, voices[voiceName].pos[voices[voiceName].posId % voices[voiceName].pos.length]);
        voices[voiceName].durId += 1;
        voices[voiceName].posId += 1;
        events[event].nextBeat = (voices[voiceName].dur[voices[voiceName].durId % voices[voiceName].dur.length] * semiBreve) + beats;
        document.getElementById(voiceName).style.zIndex="900";
      }
    }
  }
}

// note: for now, considering fusa as the min unity.

var events = [];
var beats = 0;
var bpm = 120; // 120 seminimas per minute
var minimalUnity = bpm * 4; // we tick at each 960 seminimas (or, 1 semifusa) 
                            // change 8:semifusa 4:fusa 2:colcheia 1:seminima as the minor unity
var timeInterval = 60 / minimalUnity * 1000; // so, at each 62.5 ms we tick 
var semiBreve = 32; // one semibreve is equal to 64 semifusas (hemidemisemiquaver) (or 32 fusas)
                    // change 64:semifusa 32:fusa 16:colcheia 8:seminima
var masterClock = setInterval(tick, timeInterval);

// init ///////////////////////////////

// load all audio and video files
function init () {
  var files = [{name: 'a', fileName: 'hihat.wav', type: 'audio'},
               {name: 'b', fileName: 'kick.wav', type: 'audio'},
               {name: 'c', fileName: 'dj.wav', type: 'audio'},
               {name: 'd', fileName: 'snare.wav', type: 'audio'},
               {name: 'eyes', fileName: 'eyes.mp4', type: 'video'}];
  
  for (file in files) {
    // create a dict to each voice
    voices[files[file].name] = {sig: files[file].fileName, 
                                sigType: files[file].type};
    if (files[file].type === 'audio') {
      loadAudioFile(files[file].name);
    } else if (files[file].type === 'video') {
      loadVideoFile(files[file].name);
    }
  }
}

var lastVoices = null;

function run () {
  var code = document.getElementById('code');
  var texec=exec(code.value);
  var currentVoices = texec[0];
  var activeVoices = texec[1];
  for (voiceName in lastVoices){
      if (!activeVoices[voiceName]){
          for (e in events) {
              if(events[e]['voiceName']==voiceName) {
                  delete events[e];
                  voices[voiceName].dur=undefined;
                  voices[voiceName].durId=0;
                  if (voices[voiceName].sigType=="video"){
                        document.getElementById(voiceName).style.zIndex="0";
                        voices[voiceName].sigPop.pause();
                  }
              }
          }
      }
  }

  for (voiceName in currentVoices) {
    if (lastVoices != null) {
      // let's update durations
                  console.log(voiceName, currentVoices, lastVoices);
      if (currentVoices[voiceName].dur != lastVoices[voiceName].dur) {
                  console.log(voiceName + "dd");
          if (activeVoices[voiceName]){
                  console.log(voiceName + "ee");
                voices[voiceName].dur = currentVoices[voiceName].dur;
          }
      }
      // let's update buffer positions
      if (currentVoices[voiceName].pos != lastVoices[voiceName].pos) {
        voices[voiceName].pos = currentVoices[voiceName].pos;
      }
      // let's update grain durations
      if (currentVoices[voiceName].gdur != lastVoices[voiceName].gdur) {
        voices[voiceName].gdur = currentVoices[voiceName].gdur;
      }      
console.log(voices[voiceName].dur);
      if (!voices[voiceName].durId && (voices[voiceName].dur!=undefined)) {
        // for every updated voice, put that on event queue
        events.push({'voiceName': voiceName, 'nextBeat': (voices[voiceName].dur[0] * semiBreve) + beats});
        voices[voiceName].durId = 0;
        voices[voiceName].posId = 0;
        voices[voiceName].gdurId = 0;
      }

    } else {
      // so it is the first time we are executing...
      if (!currentVoices[voiceName].dur) {
        voices[voiceName].dur = currentVoices[voiceName].dur;
      }
      if (!currentVoices[voiceName].pos) {
        voices[voiceName].pos = currentVoices[voiceName].pos;
      }
      if (!currentVoices[voiceName].dur) {
        voices[voiceName].gdur = currentVoices[voiceName].gdur;
      }

      if (voices[voiceName].dur) {
        // for every updated voice, put that on event queue
        events.push({'voiceName': voiceName, 'nextBeat': (voices[voiceName].dur[0] * semiBreve) + beats});
        voices[voiceName].durId = 0;
        voices[voiceName].posId = 0;
        voices[voiceName].gdurId = 0;
      }
    }
  }

  // store the last voice to compare at the next one
  lastVoices = voices;
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

