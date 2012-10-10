(function(){


	V = function(){

		var checkConsts = function(t, alreadyChecked){

			var regExprString = function(string){
				var b = false;
				for(var c in VUI.Consts){
					//TODO improvement to check many names, 
					//and slice them by regexpr with
					//strings contained in VUI.Consts
					var r = new RegExp(VUI.Consts[c]);
					if(r.test(t)){
						// return itself only if have other valid constant
						var newString = alreadyChecked?t.split(VUI.Consts[c]):t.split(VUI.Consts[c]+' ');
						b = checkConsts(newString[1], true);
						break;
					}
				}
				return b;

			};

			var checkt = function(string){
				if(string === ''){
					return alreadyChecked;
				}
				else{
					var bbb = regExprString(string);

					return bbb;
				}
			};

			if(typeof t === 'string'){
				return checkt(t);
			}
			else{
				return false;
			}
		};

		var checkName = function(n){
			if(typeof n == 'string'){
				return true;
			}
			else{
				return false;
			}
		};

		var checkFunc = function(f){
			if(typeof f === 'function'){
				return true;
			}
			else{
				return false;
			}
		};

		var checkObj = function(n){
			//Se for um objeto, verifique as chaves corretas
			if(n.hasOwnProperty('name') && n.hasOwnProperty('channels')){
				return true;
			}
			else{
				return false;
			}
		};

		/*
		 * Adicione uma função geradora ao VUI (ou $V);
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
		this.add = function(n, t, f){
			if(VUI.generators === undefined || VUI.generators === null){
				VUI.generators = {};
			};

			if(t === undefined) t=null;
			if(f === undefined) f=null;

			var adderS = function(n, t, b, f){
				if(checkName(n) && checkConsts(t, b) && checkFunc(f)){
					VUI.generators[n] = {
							type: t,
							handler: f, 			// must call a function(audioNode, handler)
							audioNode: null
					};
				}
				else if(checkName(n) && checkConsts(t, b) && !checkFunc(f)){
					VUI.generators[n] = {
							type: t,
							handler: function(){},	// must call a function(audioNode, handler)
							audioNode: null
					};	
				}
				else if(checkName(n) && !checkConsts(t, b) && !checkFunc(f)){
					VUI.generators[n] = {
							type: 'NON_TYPE',
							handler: function(){},	// must call a function(audioNode, handler)
							audioNode: null
					};
				}
				else if(!checkName(n)){
					console.log("Please give at least the name");
				}
			};

			var adderO = function(n, t, b, f){
				if(checkObj(n) && checkConsts(t, b) && checkFunc(f)){
					VUI.generators[n.name] = {
							type: t,
							audioArray: n.channels,
							handler: f,
							audioNode: null							// must call a function(audioNode, handler)
					};
				}
				else if(checkObj(n) && checkConsts(t, b) && !checkFunc(f)){
					VUI.generators[n.name] = {
							type: t,
							audioArray: n.channels,
							handler: function(node){return node},	// must call a function(audioNode, handler)
							audioNode: null
					};	
				}
				else if(checkObj(n) && !checkConsts(t, b) && !checkFunc(f)){
					VUI.generators[n.name] = {
							type: 'NON_TYPE',
							audioArray:n.channels,
							handler: function(){return false},		// must call a function(audioNode, handler)
							audioNode: null
					};
				}
				else if(!checkObj(n)){
					console.log("Please give at least the object");
				}


			};

			if(typeof n === 'string'){
				adderS(n, t, false, f);
			}
			else if(typeof n === 'object'){
				adderO(n, t, false, f);
			}

		};
	};

	/*
	 * Create a new VUI
	 */
	var VUI = new V();

	/*
	 * Initialize the webkitAudioContext
	 */
	VUI.initAudio = function(c){
		if(c === undefined || c === null){
			try {
				VUI.audioContext = new webkitAudioContext();
			}
			catch(e) {
				var msg = 'Web Audio API is not supported in this browser; try in Chrome or Safari';
				$('<p/>').html(msg)
				.appendTo('body');
				console.log(msg);
			}
		}
	};

	VUI.initUI = function(c, srcNode){
		initAudio(c);
		if(VUI.audioContext){
			//For each existent UI, create a new audio node
			$.each(VUI.generators, function(name, object){
				VUI.setAudioNode(name);
				VUI.connectAudioNode(n, srcNode, destNode);
			});
		}
		else{
			console.log('ERROR');
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
			source.noteOn(0);
		}
		else{
			console.log('webkitAudioContext not initialized yet. Waiting for you...');
		}	
	};


	VUI.setAudioNode = function(n, valType){
		if(VUI.audioContext){
			//Catch the UI by name
			if(valType === 'gain'){
				VUI.generators[n].audioNode = VUI.audioContext.createGainNode();
			}

			console.log('audio node '+' created for '+o.name);
		}
		else{
			console.log('webkitAudioContext not initialized yet. Waiting for you...');
		}	
	}

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

	VUI.setAudioNodeValue = function(n, v){
		if(VUI.audioContext){
			//Catch the UI by name
			var node = VUI.generators[n].audioNode;
			if(node){
				node.gain.value = v;
			}
			else{
				console.log('audioNode not setted yet for '+o.name);	
			}

		}
		else{
			console.log('webkitAudioContext not initialized yet. Waiting for you...');
		}
	} ;



	//Consts for some UI types
	VUI.Consts = {
			INTERFACE: 'interface',
			CONTROL: 'control',
			VISU: 'visu',
			SLIDER: 'slider',	
			HORIZONTAL: 'horizontal',
			VERTICAL: 'vertical',
			KNOB: 'knob',
			CONSOLE: 'console',
			CHANGER: 'changer',
			MIXER: 'mixer',
			IDENTIFIER: 'ident',
			RESULT: 'result'
	};

	/*
	 * create an new Vivace User Interface
	 * 
	 * @param n o nome da interface
	 * @param t o tipo (controle, visual, etc...)
	 * @see VUI.Consts para verificar os tipos
	 * @param f a função geradora de áudio
	 * 
	 * <pre> 
	 *  var controlType = VUI.Consts.CONSTANTE
	 * 	var vui = new VUIInterface('myName', controlType, function(){
	 *  	//A função que gera o algoritmo de áudio;
	 *  })
	 * </pre>
	 */

	var VUIObj = function(n, t, f){
		VUI.add(n, t, f);

		var makeUIByString = function(ns, ts, f){
			if(ts === VUI.Consts.INTERFACE){	
				this.element = VUInterface(ns)
				return this.element;
			}
			else if(ts === VUI.Consts.CONTROL){
				this.element = VUIControl(ns).draggable();
				return this.element;
			}
			else if(ts === VUI.Consts.SLIDER+' '+VUI.Consts.VERTICAL){
				this.element = VUISliderV(ns,ts,f);
				return this.element;
			}
		}

		var makeUIByObj = function(n){
			var o = VUI.generators[n.name];
			var a = $.map(n.channels, function(e, i){
				return makeUIByString(e, o.type, o.handler);
			});

			var $a = VUIMixer(n.name);
			$.each(a, function(i, e){
				$a.append(e);
			});
			return $a;

		};

		if(typeof n === 'string'){
			return makeUIByString(n, t, f);
		}
		else{
			return makeUIByObj(n);
		}
	};	


	var VUInterface = function(n){
		var $interface = $('<div/>').attr('id','VUInterface_'+n).addClass(VUI.Consts.INTERFACE);
		$('<p/>').html('interface_'+n).appendTo($interface);

		return $interface;
	};

	var VUIControl = function(n){
		this.$control = $('<div/>').attr('id','VUIControl_'+n)
		.addClass(VUI.Consts.INTERFACE)
		.addClass(VUI.Consts.CONTROL);

		$('<p/>').html('control_'+n).appendTo($control);


		return $control;
	};

	jQuery.fn.connect = function(){ 
		var $this = $(this);
		if(arguments !== undefined || arguments !== null){
			$.each(arguments, function(i, e){
				e.appendTo($this);
			});
		}
	};
	var VUISliderV = function(n, t, f){

		var $sl = {
				struct: {body: $('<div/>'), changer: $('<div/>')},


				addClasses:function(){
					$.each(this.struct, function(i, e){
						if(i!=='result'){
							e
							.addClass(VUI.Consts.INTERFACE)
							.addClass(VUI.Consts.CONTROL)
							.addClass(VUI.Consts.SLIDER)
							.addClass(VUI.Consts.VERTICAL);
						}
						if(i==='changer'){
							e.addClass(VUI.Consts.CHANGER);
						}
					});

				},

				addAttrs: function(name, type){
					$.each(this.struct, function(i, e){
						if(e.hasClass(VUI.Consts.CHANGER)){
							e.attr('id','VUISliderV_'+name+'_'+VUI.Consts.CHANGER);
						}
						else{
							e.attr('id','VUISliderV_'+name+'_'+type);
						}
					});	
				},

				update: function(){
					this.get$().append(this.struct.changer);
				},

				get$: function(){
					return this.struct.body;
				},

				addLetters: function(){
					$('<p/>').html(n).appendTo(this.struct.body).addClass(VUI.Consts.IDENTIFIER);
					var id1 = '#VUISliderV_'+n+'_'+VUI.Consts.CHANGER;
					var id2 = 'VUISliderV_'+n+'_'+VUI.Consts.RESULT;
					var r = $(id1).css('top');
					//$('<p/>').html(r).appendTo(this.struct.body).attr('id', id2).addClass(VUI.Consts.RESULT);
				},


				upAndDown: function(){
					this.struct.changer.draggable({
						axis:"y",
						containment: "parent",
						drag:function(){
							var y = $('#VUISliderV_'+n+'_'+VUI.Consts.CHANGER).css('top');
							console.log('in:'+y);

							// Some func to get correct params in css
							var norm = function(input, r, a, b){			
								input = input.split("px")[0];
								input = parseInt(input);

								range = r(a, b);
								r = range[1] - range[0];
								input /= r;
								return 1-input;
							};

							//adjust each value
							var adjust = function(a, b){
								return $.map(a, function(e, i){
									return e - b[i];
								});
							};


							var css = [3, 107];
							var factor = [1.9719363891487371, -1.009163883108025406];


							y = norm(y, adjust, css, factor);
							$('#VUISliderV_'+n+'_'+VUI.Consts.RESULT).html(y);
							console.log('out: '+y);
						},
					});
				}

		};

		$sl.addClasses();
		$sl.addAttrs(n, t);
		$sl.addLetters();
		$sl.upAndDown();
		$sl.update();
		return $sl.get$();
	};

	function VUIKnob(){
		VUIControl.call(n, VUI.Consts.KNOB, f);
	}

	var VUIMixer = function(n){
		return VUIControl(n);

	};

	window.VUI = VUI;
	window.$V = VUIObj;
}());