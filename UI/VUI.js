(function(){

	V = function(){
		var checkConsts = function(t){
			if(typeof t === 'string'){
				var b = false;
				for(var c in VUI.Consts){
					c.toLowerCase();
					if(t == VUI.Consts[c]){
						b = true;
						break;	
					};
				};
				return b;
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
			(function(v){
				if(v.generators === undefined || v.generators === null){
					v.generators = {};
				}
			}(VUI));

			if(checkName(n) && checkConsts(t) && checkFunc(f)){
				VUI.generators[t] = {
						name: n,
						funcGen: f
				};
			}
			else if(checkName(n) && checkConsts(t) && !checkFunc(f)){
				VUI.generators[t] = {
						name: n,
						funcGen: function(){}
				};	
			}
			else if(checkName(n) && !checkConsts(t) && !checkFunc(f)){
				VUI.generators['NON_TYPE'] = {
						name: n,
						funcGen: function(){}
				};
			}
			else if(!checkName(n)){
				console.log("Please give at least the name");
			}
		};
	};

	var VUI = new V();
	VUI.Consts = {
			INTERFACE: 'interface',
			CONTROL: 'control',
			VISU: 'visu',
			SLIDER: 'slider',				
			KNOB: 'knob',
			CONSOLE: 'console',
			MIXER: 'mixer'
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
	
		var o = VUI.generators[t];
		var $interface = $('<div/>').attr('id','VUI_'+t+'_'+o.name).addClass(VUI.Consts.INTERFACE).html(t+'_'+n);
		return $interface;
	};

	var VUIControl = function(n, f){
		VUInterface(n, VUI.Consts.CONTROL, f);
	};

	/*
	 * Many de muitos; muitos controles, muitas visualizacoes;
	 * em suma muitos controles eh um mixer com muitos knobs e sliders;
	 * muitas visualicoes eh um console, com todas as luzinhas subindo
	 */
	VUIMany = function(n, f){
		VUInterface(n, VUI.Consts.MANY, f);
	}

	function VUIVisualizer(){
		VUInterface.call(n, VUI.Consts.VISU, f);
	}

	function VUISlider(){
		VUIControl.call(n, VUI.Consts.SLIDER, f);
	};

	function VUIKnob(){
		VUIControl.call(n, VUI.Consts.KNOB, f);
	}
	function VUIMixer(){
		VUIMany.call(n, VUI.Consts.MIXER, f);
	};

	window.VUI = VUI;
	window.$V = VUIObj;
}());