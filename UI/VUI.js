(function(){

	/**
	 * Basic use
	 * //TODO make the real use of modules
	 * <code>
	 * \/\/Init VUI webAudiokit AudioContext
	 * VUI.init();
	 * 
	 * \/\/make interface with modules: a player, a simple stereo mixer and 3 band filter
	 * var myModule = VUI.define({name: 'mixer'}, ['modules/mymodule1.json', 'modules/mymodule2.json']);
	 * 
	 * * \/\/load audio src, with loop or no loop
	 * myModule.loadBuffer('audio/myURL', 'loop')
	 *  
	 * \/\/connect module to another audio node or load src
	 * myModule.connect(node);

	 * \/\/enable module
	 * myModule.play();
	 *
	 * \/\/change values
	 * myModule.set('gain', ['L'], 0.25) 	 			\/\/set the gain of channel L of myModule to 0.71 (3 dB);
	 * myModule.set('gain', ['L', 'R'], 0.71) 			\/\/set the gain of both L and R of myModule to 0.71 (3 dB);
	 * myModule.set('gain', ['L', 'R'], [1, 0.25])		\/\/set the gain of both L and R according values 
	 * 
	 * \/\/stop module
	 * myModule.stop();
	 * 
	 * \/\/kill module
	 * VUI.kill('mixer')
	 * </code>
	 */
	var VUI = {};

	/*
	 * Initialize the webkitAudioContext
	 */
	function initwebkitAudioContext(){
		try {
			VUI.webkitaudiocontext= new webkitAudioContext();
			return true;
		}
		catch(e) {
			alert('Web Audio API is not supported in this browser');
			return false;
		}
	};


	/**
	 * @param handler function that will do some things after VUI initialize basic things
	 * 
	 */
	VUI.init = function(){
		if(initwebkitAudioContext()){
			VUI.audiocontextInitialized = true;
			VUI.interfaces = {};
		}
	};

	VUI.make = function(intfc, modules){
		make(intfc, modules);
	};	

	/**
	 * Get all interfaces in VUI.interfaces
	 * @param name
	 * @return VUI.interfaces
	 */
	var getInterfaces = function(){
		return window.VUI.interfaces;
	};


	/**
	 * Get interface by name
	 * @param name
	 * @return object 
	 */
	var getInterface = function(name){
		if(VUI.interfaces.hasOwnProperty(name)){
			return window.VUI.interfaces[name];
		}
		return false;
	};

	/**
	 * Delete interface by name
	 * @param name
	 * @return object 
	 */
	var deleteInterface = function(name){
		if(window.VUI.interfaces.hasOwnProperty(name)){
			delete window.VUI.interfaces[name];
			return true;
		}
		return false;
	};


	//////////////////////////////////////////////
	// VUI (AUDIO CONTEXT)
	//////////////////////////////////////////////

	VUI.Consts= {
			//Group machines
			INTERFACE: 'interface',
			CONTROL: 'control',
			MIXER: 'mixer',
			EQ_31: 'eq_31_bands',
			EQ_10: 'eq_10_bands',
			EQ_3: 'eq_3_bands',

			//Widgets
			SLIDER: 'slider',	
			KNOB: 'knob',
			VISU: 'visu',

			//Special identifier to widgets
			CHANGER: 'changer',

			//Direction of UI css Graphics
			HORIZONTAL: 'horizontal',
			VERTICAL: 'vertical',


			IDENTIFIER: 'ident',
			RESULT: 'result',
			VOLUME: 'volume',
			FILTER: 'filter',
			FX: 'fx'
	};

	VUI.define = function(intfcHandler){
		VUI.interfaces[intfcHandler.name] = {};
		if(intfcHandler.hasOwnProperty('input')){
			VUI.interfaces[intfcHandler.name]['input'] = intfcHandler.input; 
		}
		if(intfcHandler.hasOwnProperty('output')){
			VUI.interfaces[intfcHandler.name]['output'] = parseVUIModule(intfcHandler.output); 
		}
		if(intfcHandler.hasOwnProperty('filter')){
			VUI.interfaces[intfcHandler.name]['filter'] = parseVUIModule(intfcHandler.filter);
		}

	};

	var widget = function(ui, uid){
		var $div = $('<div/>').attr('id', uid);
		var $result = $(ui.result);
		var $control = $(ui.control).append($(ui.changer));
		$div.append($control).append($result);
		return $div;
	};

	VUI.getWidgetUID = function(intfcName){
		return VUI.interfaces[intfcName].UI.uid;
	}

	var widgetObject = function(ui){
		return {
			uid: ui.name + randomString(8),
			widget: widget(ui, uid),
		}
	};

	var parseVUIModule = function(src){
		var module = {};
		$.ajax({
			url: src,
			type: 'GET', 
			async: false,
			contentType: 'application/json',
			dataType: 'json',
			success: function(data){
				//Definir os modulos de saida, filtragem e fx
				if(data.output){
					module['output'] = data.output;
				}
				if(data.filter){
					module['filter'] = data.filter;
				}
			}
		}).success(function(data){
			if(module.output !== null){
				module['UI'] = data.src;
			}
			if(module.filter !== null){
				module['UI'] = data.src;
			}
			console.log(src+' loaded');
		}).error(function(jqXHR, textStatus, errorThrown){
			console.log(src+' not loaded: status '+textStatus);
			console.log(errorThrown);	
		});

		return module;
	};

	/*
	 * @param url the url where audio file is stored
	 * @param VUIbuff the object to store metadata
	 */
	VUI.loadBuffer = function(name, url){
		var audio = VUI.interfaces[name]['audio'] = {};
		if(VUI.audioContext){
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';

			// Decode asynchronously
			request.onload = function() {
				VUI.audioContext.decodeAudioData(request.response, function(buffer) {
					audio['url'] = url;
					audio['src'] = VUI.audioContext.createBufferSource();
					audio.src['buffer'] = buffer;
					audio['gainNode'] = VUI.audioContext.createGainNode();
					audio['loaded'] = true;
				}, onError);
			};

			request.send();
			console.log('audio node '+' created for '+o.name);
		}
		else{
			console.log('webkitAudioContext not initialized yet. Waiting for you...');
		}	
	};

	VUI.play = function(name){
		var audio = VUI.interfaces[name]['audio'];
		audio.src.connect(audio.gainNode);
		audio.gainNode.connect(VUI.audioContext.destination)
		src.noteOn(0);
	}


//	From http://stackoverflow.com/questions/6860853/generate-random-string-for-div-id
	function randomString(length) {
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'.split('');

		if (! length) {
			length = Math.floor(Math.random() * chars.length);
		}

		var str = '';
		for (var i = 0; i < length; i++) {
			str += chars[Math.floor(Math.random() * chars.length)];
		}
		return str;
	}

//	Array Remove - By John Resig (MIT Licensed)
	Array.prototype.remove = function(from, to) {
		var rest = this.slice((to || from) + 1 || this.length);
		this.length = from < 0 ? this.length + from : from;
		return this.push.apply(this, rest);
	};

	window.VUI = VUI;
}());