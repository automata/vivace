//var parser = require("./vivace").parser;

//where are our audio files?
var audioFilesDir = './media/';

//store all the voices (main symbol table)
var voices = {};

//our audio context
var context = new webkitAudioContext();
context.listener.setPosition(0, 0, 0);

function exec (input) {
  var tree = vivace.parse(input);

  var definitions = tree.code.definitions;
  

  // go to all definitions again and update voices details
  var voiceNames=[];
  for (var i=0; i<definitions.length; i=i+1) {
    var voiceName = definitions[i].name.val;
    voiceNames[voiceName]=true;

    // signal
    if (definitions[i].attr.val === 'sig') {
      if (definitions[i].is.type === 'chains') {
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

    //
    // filter parameters
    // 

    // gain
    } else if (definitions[i].attr.val === 'gain') {
      // [ ]
      if (definitions[i].is.type === 'values') {
        var gain = [];
        for (var j=0; j<definitions[i].is.val.length; j=j+1) {
          gain.push(definitions[i].is.val[j].val);
        }
        voices[voiceName].gain = gain.reverse();
      }
    // pan
    } else if (definitions[i].attr.val === 'pan') {
      // [ ]
      if (definitions[i].is.type === 'values') {
        var pan = [];
        for (var j=0; j<definitions[i].is.val.length; j=j+1) {
          pan.push(definitions[i].is.val[j].val);
        }
        voices[voiceName].pan = pan.reverse();
      }
    // pitch
    } else if (definitions[i].attr.val === 'pitch') {
      // [ ]
      if (definitions[i].is.type === 'values') {
        var pit = [];
        for (var j=0; j<definitions[i].is.val.length; j=j+1) {
          pit.push(definitions[i].is.val[j].val);
        }
        voices[voiceName].pitch = pit.reverse();
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
    console.log('Error while loading audio file from ' + url);
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

function playVoice(voiceName, when, offset, duration, 
                   gainValue, frequencyBiquad, panCoords, pitch
                  ) {
  var source = context.createBufferSource();
  source.buffer = voices[voiceName].buffer;
  source.playbackRate.value = pitch;

  var compressor = context.createDynamicsCompressor();
  var reverb = context.createConvolver();
  
  // gain
  var gain = context.createGainNode();
  gain.gain.value = gainValue;

  // biquad
  var filter = context.createBiquadFilter();
  filter.type = 0;
  filter.frequency.value = 480;

  // panner
  var panner = context.createPanner();
  panner.setPosition(panCoords[0], panCoords[1], panCoords[2]);

  // node connections
  source.connect(compressor);
  //source.connect(reverb);
  compressor.connect(filter);
  filter.connect(panner);
  panner.connect(gain);
  gain.connect(context.destination);

  source.noteGrainOn(when || context.currentTime, // at specified time or now
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
        playVoice(
          voiceName, // voiceName
          context.currentTime, // when
          voices[voiceName]
            .pos[voices[voiceName]
                 .posId % voices[voiceName].pos.length], // offset
          voices[voiceName]
            .gdur[voices[voiceName]
                  .gdurId % voices[voiceName].gdur.length], // grain duration
          voices[voiceName]
            .gain[voices[voiceName]
                  .gainId % voices[voiceName].gain.length], // gain value
          0, // biquad filter frequency
          [voices[voiceName]
           .pan[voices[voiceName]
                .panId % voices[voiceName].pan.length], 0, 0], // pan coords
          voices[voiceName]
            .pitch[voices[voiceName]
                   .pitchId % voices[voiceName].pitch.length] // pitch
        );
        // update event
        voices[voiceName].durId += 1;
        voices[voiceName].posId += 1;
        voices[voiceName].gdurId += 1;
        voices[voiceName].gainId += 1;
        voices[voiceName].panId += 1;
        voices[voiceName].pitchId += 1;

        events[event].nextBeat = (voices[voiceName]
                                  .dur[voices[voiceName]
                                       .durId % voices[voiceName].dur.length] *
                                  semiBreve) + beats;
      } else if (voices[voiceName].sigType === 'video') {
        playVideo(voiceName, 
                  voices[voiceName]
                  .pos[voices[voiceName]
                       .posId % voices[voiceName].pos.length]);
        voices[voiceName].durId += 1;
        voices[voiceName].posId += 1;
        events[event].nextBeat = (voices[voiceName]
                                  .dur[voices[voiceName]
                                       .durId % voices[voiceName].dur.length] *
                                  semiBreve) + beats;
        document.getElementById(voiceName).style.zIndex = "900";
      }
    }
  }
}

//note: for now, considering fusa as the min unity.

var events = [];
var beats = 0;
var bpm = 120; // 120 seminimas per minute
var minimalUnity = bpm * 4; // we tick at each 960 seminimas (or, 1 semifusa) 
//change 8:semifusa 4:fusa 2:colcheia 1:seminima as the minor unity
var timeInterval = 60 / minimalUnity * 1000; // so, at each 62.5 ms we tick 
var semiBreve = 32; // one semibreve is equal to 64 semifusas (hemidemisemiquaver) (or 32 fusas)
//change 64:semifusa 32:fusa 16:colcheia 8:seminima
var masterClock = setInterval(tick, timeInterval);

//
// init
//

// load all audio and video files
function init () {
  var files = [{name: 'a', fileName: 'kick.wav', type: 'audio'},
	       {name: 'b', fileName: 'dj.wav', type: 'audio'},
	       {name: 'c', fileName: 'snare.wav', type: 'audio'},
	       {name: 'd', fileName: 'hihat.wav', type: 'audio'},
	       {name: 'i', fileName: 'illuminatti.mp4', type: 'video'}];

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

  setupVivaceMenu('div#banner', {
    team:[
      {name: 'aut0mata', href:'https://github.com/automata'},
      {name: 'gabiThume', href: 'https://github.com/GabiThume'},
      {name: 'jahpd', href: 'https://github.com/jahpd'}, 
      {name: 'hybrid', href: 'http://github.com/'}
    ],
    about:[
      {name: 'src', href: 'https://github.com/automata/vivace'}
    ],
    help:[
      {name: 'using vivace'},
      {name: 'enabled variables'}
    ],
    ui:[
      {name: 'using vivace ui for mixing'}
    ]
  })
  
  setupVivaceEasyMix(files);
}

var lastVoices = null;

function run () {
  var code = document.getElementById('code');
  var texec = exec(code.value);
  var currentVoices = texec[0];
  var activeVoices = texec[1];
  for (voiceName in lastVoices){
    if (!activeVoices[voiceName]){
      for (e in events) {
        if(events[e]['voiceName'] == voiceName) {
          delete events[e];
          voices[voiceName].dur = undefined;
          voices[voiceName].durId = 0;
          if (voices[voiceName].sigType == "video"){
            document.getElementById(voiceName).style.zIndex = "0";
            voices[voiceName].sigPop.pause();
          }
        }
      }
    }
  }

  for (voiceName in currentVoices) {
    if (lastVoices != null) {
      // let's update durations
      if (currentVoices[voiceName].dur != lastVoices[voiceName].dur) {
        if (activeVoices[voiceName]){
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
      // let's update gain values
      if (currentVoices[voiceName].gain != lastVoices[voiceName].gain) {
        voices[voiceName].gain = currentVoices[voiceName].gain;
      }      
      // let's update pan values
      if (currentVoices[voiceName].pan != lastVoices[voiceName].pan) {
        voices[voiceName].pan = currentVoices[voiceName].pan;
      }      
      // let's update pitch values
      if (currentVoices[voiceName].pitch != lastVoices[voiceName].pitch) {
        voices[voiceName].pitch = currentVoices[voiceName].pitch;
      }      

      if (!voices[voiceName].durId && (voices[voiceName].dur!=undefined)) {
        // for every updated voice, put that on event queue
        events.push({'voiceName': voiceName, 
                     'nextBeat': (voices[voiceName].dur[0] * 
                                  semiBreve) + beats});
        voices[voiceName].durId = 0;
        voices[voiceName].posId = 0;
        voices[voiceName].gdurId = 0;
        voices[voiceName].gainId = 0;
        voices[voiceName].panId = 0;
        voices[voiceName].pitchId = 0;
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
      if (!currentVoices[voiceName].gain) {
        voices[voiceName].gain = currentVoices[voiceName].gain;
      }
      if (!currentVoices[voiceName].pan) {
        voices[voiceName].pan = currentVoices[voiceName].pan;
      }
      if (!currentVoices[voiceName].pitch) {
        voices[voiceName].pitch = currentVoices[voiceName].pitch;
      }

      if (voices[voiceName].dur) {
        // for every updated voice, put that on event queue
        events.push({'voiceName': voiceName, 
                     'nextBeat': (voices[voiceName].dur[0] * 
                                  semiBreve) + beats});
        voices[voiceName].durId = 0;
        voices[voiceName].posId = 0;
        voices[voiceName].gdurId = 0;
        voices[voiceName].gainId = 0;
        voices[voiceName].panId = 0;
        voices[voiceName].pitchId = 0;
      }
    }
  }

  // store the last voice to compare at the next one
  lastVoices = voices;
}

//
// key events
//

var isCtrl = false;

document.onkeyup=function(e){
  if(e.which == 17 || e.which == 91) 
    isCtrl=false;
};

document.onkeydown=function(e){
  if (e.which == 17 || e.which == 91) isCtrl=true;

  // 190 => . (run)
  if(e.which == 190 && isCtrl == true) {
    run();
    return false;
  }
  // 191 => / (comment region)
  if(e.which == 191 && isCtrl == true) {
    comment_region();
    return false;
  }
  // 188 => , (insert template)
  if(e.which == 188 && isCtrl == true) {
    insert_template();
    return false;
  }
}

function comment_region() {
  var textArea = document.getElementById('code');

  var selected = textArea.value.substring(textArea.selectionStart,
                                          textArea.selectionEnd);
  var orig = selected.slice(0);

  var proc = selected.replace(/\/\//g, '');

  if (proc === orig) {
    textArea.value = 
      textArea.value.substring(0, textArea.selectionStart) +
      '//' +
      selected.replace(/\n/g, '\n//') +
      textArea.value.substring(textArea.selectionEnd);
  } else {
    textArea.value = 
      textArea.value.substring(0, textArea.selectionStart) +
      selected.replace(/\/\//g, '') +
      textArea.value.substring(textArea.selectionEnd);
  }
}

function insert_template () {
  var textArea = document.getElementById('code');
  var s = textArea.value.substring(textArea.selectionStart,
                                   textArea.selectionEnd);
  var start = textArea.selectionStart;
  var template = 
    s + 
    ".pos = [0]\n" + 
    s +
    ".gdur = [1]\n" +
    s +
    ".pos = {1}\n" +
    s + 
    ".gain = [.5]\n" +
    s + ".pan = [0]\n" +
    s + ".pitch = [0]\n";

  textArea.value = 
    textArea.value.substring(0, textArea.selectionStart) +
    template + 
    textArea.value.substring(textArea.selectionEnd);

  textArea.selectionStart = start;
  textArea.selectionEnd = start;
}

function setupVivaceMenu(css, o) {
  var c = function() {
    var menuVisible = $(this).children().is(':visible');
    if(!menuVisible) {
      $(this).children().show('200');
    } else {
      $(this).children().hide('200');
    }
  };

  $vivacemenu = $(css).click(c).addClass('ban');

  $.each(o, function(k, v) {
    var $div = $('<ul/>').html(k).addClass('ban').click(c);
    $.each(v, function(i, e) {
      var href = e['href'] || '#'
      var $a = $('<a/>').html(e['name']).attr('href', href)
      $('<li/>').append($a).appendTo($div);
    })
      $div.appendTo($vivacemenu).hide();
  });    
};

var FizzyText = function() {
  this.L = 0.71;
  this.R = 0.71;
  this.high = 0.5;
  this.medium = 0.5;
  this.low= 0.5;
  // Define render logic ...
};

function setupVivaceEasyMix(files){
  var FizzyText = function() {
    this.l = 0.8;
    this.r= 0.8;
    this.eq=false;
    this.high=0.8;
    this.medium=0.8;
    this.low=0.8;
    this.reverb = false;
    this.reverbTime=0.8;
    // Define render logic ...
  };

  var fizzy = new FizzyText();
  var gui = new dat.GUI();
  
  $.each(files, function(i, file){
    var v = gui.addFolder(file.name);
    var l = v.add(fizzy, 'l', 0, 1).listen();
    var r = v.add(fizzy, 'r', 0, 1).listen();
    v.add(fizzy, 'eq');
    v.add(fizzy, 'high', 0, 1);
    v.add(fizzy, 'medium', 0, 1);
    v.add(fizzy, 'low', 0, 1);
    v.add(fizzy, 'reverb');
    v.add(fizzy, 'reverbTime', 0.1, 3);
    
    l.onChange(function(value){
      console.log(value);
    });
    r.onChange(function(value){
      console.log(value);
    });
    
  });
}