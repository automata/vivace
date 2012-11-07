(function(){

	//////////////////////////////////////////////
	// V
	//////////////////////////////////////////////

	/**
	 * V é a função que cuida das operações mais básicas do Vivace UI
	 * @see VUI
	 * @see VUIObj
	 * @returns {V}
	 */
	V = function(){

		this.init = function(){
			initAudioContext();
		};
		
		/**
		 * Adicione uma função geradora de áudio ao VUI (ou $V);
		 * <ul>
		 * uma função geradora é identificada pelo:
		 * <li>nome (como por exemplo, 'mixer', 'equalizador', 'panner', etc)</li>
		 * <li>tipo (slider, knob, visualizador)</li>
		 * <li>função de áudio (a função customizada de áudio)
		 * </ul>
		 * -
		 * <pre>
		 * 	VUI.add('name', 'type', function(){
		 * 		//A função que gera o algoritmo de áudio;
		 *  });
		 * </pre>
		 * 
		 * @param n the name of object of type t
		 * @param t the type of object of name n
		 * @param f the audio function 
		 */
		this.initUI = function(name, f, jqEl){
			setInterface(name, f, jqEl);
		};
	};

	//////////////////////////////////////////////
	// VUI
	//////////////////////////////////////////////

	/*
	 * Create a new VUI
	 */
	var VUI = new V();

	VUI.interfaces = {};

	/**
	 * Consts for some UI types
	 * @see {V.checkConsts}
	 */
	VUI.Consts = {
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
			BANDPASS: 'bandpass',
			FX: 'fx'
	};
	
	/**
	 * Set properly the object's audio nodes by interface name
	 * @param name the key of interface in VUI.interfaces
	 * @param func the function handler that will control the audio
	 */
	var setInterface = function(name, func, jqEl){
		if(VUI.audioContext){
			
			var intfc = getInterface(name);
			if(intfc){
				var makeAudioNodes = function(){
					return $.Defferred(function(){
						intfc.audionodes = $.map(chnl, function(e, i){
							return VUI.audioContext.createGainNode();
						});
						console.log('audionodes created');
					}).promise();
				};
				
				var makeNodeValueSetters = function(){
					return $.Defferred(function(){
						intfc.nodeValueSetters = $.map(VUI.interfaces[name].audionodes, function(e, i){
							return function(v){
								e.gain.value = v;
							};	
						});
						console.log('setters created');
					}).promise();
				};
				
				var setJqueryInteface = function(){
					return $.Deferred(function(){
						intfc.jqElement = jqEl;
					}).promisse();
				}; 

				$.when(makeAudioNodes(), makeNodeValueSetters(), setJqueryInteface()).sucess(function(){
					console.log('interface '+name+' created ');
					console.log(getInterface(name));
				}).error(function(){
					console.log('error on set interface '+name);
				});
			}
		}
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

	/*
	 * Initialize the webkitAudioContext
	 */
	var initAudioContext = function(){
		try {
			VUI.audioContext = new webkitAudioContext();
		}
		catch(e) {
			var msg = 'Web Audio API is not supported in this browser; try in Chrome or Safari';
			$('<p/>').html(msg).appendTo('body').css({
				'background':'#700',
				'border-radius': '2% 2% 2% 2%'
			});
			console.log(msg);
		}
	};

	VUI.loadSrcExample = function(url){
		VUI.audioSourceExample = {
				url: url,
				buffer: null,
				loaded: false,
				meta:['example', 'VUI', 'webkitAudioAPI']
		};

		VUI.loadSrc(url, VUI.audioSrcExample);
	};

	/*
	 * @param url the url where audio file is stored
	 * @param VUIbuff the object to store metadata
	 */
	VUI.loadSrc = function(url, VUIbuff){
		if(VUI.audioContext){
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';

			// Decode asynchronously
			request.onload = function() {
				VUI.audioContext.decodeAudioData(request.response, function(buffer) {
					VUIbuff.url = url;
					VUIbuff.buffer = buffer;
					VUIbuff.loaded = true;
				}, onError);
			};

			request.send();
			console.log('audio node '+' created for '+o.name);
		}
		else{
			console.log('webkitAudioContext not initialized yet. Waiting for you...');
		}	
	};

	VUI.playSrc = function(VUIbuff, outNode){
		if(VUI.audioContext){
			var src = VUI.audioContext.createBufferSource();
			src.buffer = VUIbuff.buffer;
			src.connect(outNode);
			src.noteOn(0);
		}
		else{
			console.log('webkitAudioContext not initialized yet. Waiting for you...');
		}	
	};


	/*
	 * Create an input<=>output audioNode
	 * @param n the VUI name to be the intermediate audio node
	 * @param srcNode the audio node source
	 * @param destNode the audio node source
	 */
	VUI.connectAudioNode = function(n, inNode, outNode){
		if(VUI.audioContext){
			//Catch the UI by name
			var o = VUI.generators[n];
			if(o.audioNode){
				inNode.connect(o.audioNode);
				o.audioNode.connect(outNode);
			}
			else{
				console.log('audioNode not setted yet for '+o.name);	
			}

		}
		else{
			console.log('webkitAudioContext not initialized yet. Waiting for you...');
		}
	};

	VUI.addControl2Interface = function(n, iName){
		if(VUI.interfaces.hasOwnProperty(iName)){
			VUI.interfaces[iName][n] = {};
		}
		else{
			console.log('Control '+n+' not found in interface '+iName);
		}
	};

	VUI.getControl= function(n, iName){
		if(VUI.interfaces[iName].hasOwnProperty(n)){
			return VUI.interfaces[iName][n];
		}
		return false;
	};

	VUI.deleteControl = function(n, iName){
		if(VUI.interfaces[iName].hasOwnProperty(n)){
			delete VUI.interfaces[iName][n];
		}
	};

	VUI.addWidget2Control = function(n, cName, iName){
		if(VUI.interfaces[iName].hasOwnProperty(cName)){
			VUI.interfaces[iName][cName][n] = {};
		}
		else{
			console.log('Interface '+iName+' not found');
		}
	};

	VUI.getWidget= function(n, cName, iName){
		if(VUI.interfaces[iName][cName].hasOwnProperty(n)){
			return VUI.interfaces[iName][cName][n];
		}
		return false;
	};

	VUI.deleteWidget = function(n, cName, iName){
		if(VUI.interfaces[iName][cName].hasOwnProperty(n)){
			delete VUI.interfaces[iName][cName][n];
		}
	};

	window.VUI = VUI;
}());