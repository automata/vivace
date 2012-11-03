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

		/**
		 * checkConsts verifica se o tipo de UI requerida é válida
		 * @see VUI.Consts
		 * @param t o tipo de UI
		 * @param alreadyChecked é um valor auxiliar booleano para verificação recursiva
		 */
		var checkConsts = function(t, alreadyChecked){

			/*
			 * verifica as constantes por expressão regular
			 * é fornecido uma simples string, com várias constantes
			 * válidas em VUI.Consts separadas por espaço
			 * Não utilizar dentro 
			 */
			var regExprString = function(string){
				var b = false;
				for(var c in VUI.Consts){
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

			//
			if(typeof string !== 'string' || string === undefined || string === null){
				console.log('V: value not valid');
				return false;
			}
			if(string === ''){
				return alreadyChecked;
			}
			else{
				return regExprString(string);
			}
		};

		/**
		 * Checa o nome da UI, que deve ser uma simples string
		 * @param n o nome da UI
		 */
		var checkName = function(n){
			if(typeof n == 'string'){
				return true;
			}
			else{
				return false;
			}
		};

		/**
		 * Checa a função anônima da UI, 
		 * @param f a função de áudio da UI
		 */
		var checkFunc = function(f){
			if(typeof f === 'function'){
				return true;
			}
			else{
				return false;
			}
		};

		/**
		 * Ao invés de fornecermos um simples nome, podemos fornecer
		 * um objeto com dados, onde é necessário propriedades como nome
		 * e a quantidade de canais
		 * @param n o objeto com propriedades 'name' e 'channels'
		 */
		var checkObj = function(n){
			//Se for um objeto, verifique as chaves corretas
			if(n.hasOwnProperty('name') && n.hasOwnProperty('channels')){
				return true;
			}
			else{
				if(!n.hasOwnProperty('name')){
					console.log('V: object do not have property name');
				}
				if(!n.hasOwnProperty('channels')){
					console.log('V: object do not have property channels');
				}
				return false;
			}
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
		this.make = function(n, t, f){

			/*
			 * se n passado acima for uma string; cria um objeto a partir disso
			 */
			var s = function(n, t, b, f){
				var _o = {};

				if(checkName(n) && checkConsts(t, b) && checkFunc(f)){
					_o[n] = {
							type: t,
							handler: f	// must call a function(audioNode)
					};			
				}
				else if(checkName(n) && checkConsts(t, b) && !checkFunc(f)){
					_o[n] = {
							type: t,
							handler: function(audioNode){}	// must call a function(audioNode)
					};		
				}
				else if(checkName(n) && !checkConsts(t, b) && !checkFunc(f)){
					_o[n] = {
							type: VUI.Consts.INTERFACE,
							handler: function(audioNode){}	// must call a function(audioNode)
					};	
				}
				else if(!checkName(n)){
					console.log("Please give at least the name");
					return null;
				}

				o[n].audioNode =  null;
				return o;
			};

			/*
			 * se n passado acima for um objeto; transcreve um objeto a partir disso
			 */
			var o = function(n, t, b, f){
				var _o = {};

				if(checkObj(n) && checkConsts(t, b) && checkFunc(f)){
					_o[n]= {
							type: t,
							childs: {},
							handler: f
					};
				}
				else if(checkObj(n) && checkConsts(t, b) && !checkFunc(f)){
					_o[n]= {
							type: t,
							childs: {},
							handler: function(audioNode){}
					};
				}
				else if(checkObj(n) && !checkConsts(t, b) && !checkFunc(f)){
					_o[n]= {
							type: VUI.Consts.INTERFACE,
							childs: {},
							handler: function(audioNode){}
					};
				}
				else if(!checkObj(n)){
					console.log("Please give at least the object");
					return null;
				}

				_o[n].audioNode =  null;
				return _o;
			};

			if(typeof n === 'string'){
				return s(n, t, false, f);
			}
			else if(typeof n === 'object'){
				return o(n, t, false, f);
			}

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
		this.initAudio(c);
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
			src.noteOn(0);
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
	};

	/**
	 * Consts for some UI types
	 * @see {V.checkConsts}
	 */
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
			RESULT: 'result',
			VOLUME: 'volume',
			BANDPASS: 'bandpass',
			FX: 'fx'
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
	//////////////////////////////////////////////
	// VUIObj
	//////////////////////////////////////////////

	/**
	 * Cria uma nova UI de áudio
	 * 
	 * <pre> 
	 *  var controlType = VUI.Consts.CONSTANTE
	 * 	var vui = new VUIInterface('myName', controlType, function(){
	 *  	//A função que gera o algoritmo de áudio;
	 *  })
	 * </pre>
	 * 
	 * @param n o nome da interface
	 * @param t o tipo (controle, visual, etc...)
	 * @see VUI.Consts para verificar os tipos
	 * @param f a função geradora de áudio
	 */

	var VUIObj = function(n, t, f){

		var makeUIByString = function(ns, ts, fs, g){
			var o = VUI.make(ns, ts, fs);
			if(ts === VUI.Consts.INTERFACE){	
				this.element = VUInterface(ns);
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
		};

		var makeUIByObj = function(n){
			var o = VUI.make(n.name);
			o.generators = {};

			var a = $.map(n.channels, function(e, i){
				return makeUIByString(e, o.type, o.handler, o.generators);
			});

			var $a = VUIMixer(n.name);
			$.each(a, function(i, e){
				$a.append(e);
			});

			VUI.add(n, o);
			return $a;

		};

		if(typeof n === 'string'){
			var regexp = {
					'mainmodules': [/interfaces/], 
					'submodules': [/mixer/, /eq(?!aualizer)/,  /eq(?=aualizer)/, /pan/]
			};

			var doIt = false;
			$.each(regexp, function(k, v){
				$.each(v, function(i, e){
					if(e.test(n)){
						if(k==='mainmodules'){
							doIt = window.VUI.getInterfaces;
						}
						if(k==='submodules'){
							doIt = makeUIByString;
						}
					}
				});
			});

			if(doIt){
				return doIt(n, t, f);
			}
			else{
				return makeUIByObj(n);
			}
		};	
	}

	var VUInterface = function(n){
		var $interface = $('<div/>').attr('id','VUInterface_'+n).addClass(VUI.Consts.INTERFACE);
		$('<p/>').html('interface_'+n).appendTo($interface);
		VUI.addInterface(n, {}, $interface);

		return $interface;
	};

	var VUIControl = function(n){
		this.$control = $('<div/>').attr('id','VUIControl_'+n)
		.addClass(VUI.Consts.INTERFACE)
		.addClass(VUI.Consts.CONTROL);

		$('<p/>').html('control_'+n).appendTo($control);


		return $control;
	};

	/**
	 * Conecta widgets jQuery (VUI) apenas visualvente
	 * A ORDEM DOS ARGUMENTOS importa:
	 * <pre>
	 * //tree:
	 * //$a:
	 * // -$b:
	 * //  -$c:
	 * //   -$d
	 * //$e:
	 * // -$f:
	 * //  -$g:
	 * //   -$h
	 * $a.connect($b, $c, $d);
	 * $e.connect($f, $g, $h);
	 * </pre>
	 */
	jQuery.fn.connectUI = function(){ 
		var $this = $(this);
		if(arguments !== undefined || arguments !== null){
			$.each(arguments, function(i, e){
				e.appendTo($this);
			});
		}
	};

	/*
	 * Uma Widget generalizada; uma Widget é uma UI manipulável s(slider, knob, etc.)
	 */
	var VUIControlWidget = function(n, t, f){
		this.name = n;
		this.type = t;
		this.func = f;

		var widget = function(){
			this.struct = {body: $('<div/>'), changer: $('<div/>')};
			this.addClasses = function(){
				$.each(this.struct, function(i, e){
					e.addClass(VUI.Consts.INTERFACE).addClass(VUI.Consts.CONTROL);
					if((/slider/).test(this.type)){
						e.addClass(VUI.Consts.SLIDER).addClass(VUI.Consts.VERTICAL);
					}
					if((/knob/).test(this.type)){
						e.addClass(VUI.Consts.KNOB);
					}
					if(i==='changer'){
						e.addClass(VUI.Consts.CHANGER);
					}
				});

			};
			this.addAttrs = function(){
				$.each(this.struct, function(i, e){
					var id = '';
					if(e.hasClass('slider')){
						id = 'VUISliderV_'+this.name+'_';
					}
					else if(e.hasClass('knob')){
						id = 'VUIKnob_'+this.name+'_';
					}

					if(e.hasClass(VUI.Consts.CHANGER)){
						id+=VUI.Consts.CHANGER;
					}
					else{
						id+=this.type;
					}
					e.attr('id', id);
				});	
			};

			this.build = function(){
				this.struct.body.append(this.struct.changer);
			};

			this.get$ = function(){
				return this.struct.body;
			};

			this.addLetters = function(){
				$('<p/>').html(this.name).appendTo(this.struct.body).addClass(VUI.Consts.IDENTIFIER);
				var id1 = '#VUISliderV_'+this.name+'_'+VUI.Consts.CHANGER;
				//var id2 = 'VUISliderV_'+this.name+'_'+VUI.Consts.RESULT;
				var r = $(id1).css('top');
				//$('<p/>').html(r).appendTo(this.struct.body).attr('id', id2).addClass(VUI.Consts.RESULT);
			};
		};

		if((/slider/).test(this.type)){
			widget.upAndDown = function(draggerHandler){
				widget.struct.changer.draggable({
					axis:"y",
					containment: "parent",
					drag:draggerHandler
				});
			};
		}
		if((/knob/).test(this.type)){
			widget.rotation = function(rotationHandler, widget){
				//this.struct
			};
		}

		return widget;
	};

///////////////////////////////////
//	Widgets
///////////////////////////////////

	var VUISliderV = function(n, t, f){

		var widget = VUIControlWidget(n, t, f);

		//Create a handler to do things like up and down the slider (changing volume, frequency, what'ever)
		var handler = function(){
			var y = $('#VUISliderV_'+w.name +'_'+VUI.Consts.CHANGER).css('top');
			console.log('in:'+y);
			y = this.normSlider(y,{offset: [3, 107], toBe: [0, 1]});
			$('#VUISliderV_'+n+'_'+VUI.Consts.RESULT).html(y);
			console.log('out: '+y);
		};

		widget.addClasses();
		widget.addAttrs(n, t);
		widget.addLetters();
		widget.rotation(handler);
		widget.build();
		return widget.get$();
	};

	var VUIKnob = function(n, t, f){
		var widget = VUIControlWidget(n, t, f);

		//TODO Create a handler to do things like up and down the slider (changing volume, frequency, what'ever)
		//Create a handler to do things like up and down the slider (changing volume, frequency, what'ever)
		var handler = function(){
			var $r = $('#VUISliderV_'+widget.name +'_'+VUI.Consts.CHANGER);
			if($r.css('transform')){

			}
			if($r.css('-moz-transform')){

			}
			if($r.css('-webkit-transform')){

			}	
		};

		widget.addClasses();
		widget.addAttrs(n, t);
		widget.addLetters();
		widget.addRotate(handler);
		widget.build();
		return $sl.get$();
	};

	//Some func to get correct params in css
	VUISliderV.normSlider = function(input, o){			
		input = input.split("px")[0];

		//to diminish decimal places
		input = Math.round(parseInt(input));
		//the range offset
		rangeRaw = r(o.offset);
		r = range[1] - range[0];

		input /= r;
		input = 1-input;

		if(input<o.toBe[0]){
			return 0;
		}
		if(input>o.toBe[1]){
			return 1;
		}
		else{
			return input;
		}
	};

	VUIKnob.applyRotation = function($knob, deg){
		$knob.css({
			'-webkit-transform': 'rotate('+deg+'deg)',
			'-moz-transform': 'rotate('+deg+'deg)',
			'-ms-transform': 'rotate('+deg+'deg)',
			'-o-transform': 'rotate('+deg+'deg)',
			'transform': 'rotate('+deg+'deg)'
		});
	};

	var VUIMixer = function(n, t, f){
		return VUIControl(n);

	};

	window.VUI = VUI;
	window.$V = VUIObj;
}());