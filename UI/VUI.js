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
			HORIZONTAL: 'horizontal',
			VERTICAL: 'vertical',
			KNOB: 'knob',
			CONSOLE: 'console',
			CHANGER: 'changer',
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
		
		if(t === VUI.Consts.INTERFACE){	
			this.element = VUInterface(n);
			return this.element;
		}
		else if(t === VUI.Consts.CONTROL){
			this.element = VUIControl(n);
			return this.element;
		}
		else if(t === VUI.Consts.SLIDER){
			this.element = VUISlider(n, f);
			return this.element;
		}
	};


	var VUInterface = function(n){
		var $interface = $('<div/>').attr('id','VUInterface_'+n).addClass(VUI.Consts.INTERFACE).html('interface_'+n);
		return $interface;
	};
	
	var VUIControl = function(n){
		var o = VUI.generators['control'];
		var $control = $('<div/>').attr('id','VUIControl_'+o.name)
			.addClass(VUI.Consts.INTERFACE)
			.addClass(VUI.Consts.CONTROL)
			.html('control_'+n);
		return $control;
	};

	var VUISlider = function(n, f){
		var o = VUI.generators['slider'];
		var $slider = $('<div/>').attr('id','VUISlider_'+o.name)
			.addClass(VUI.Consts.INTERFACE)
			.addClass(VUI.Consts.SLIDER)
			.addClass(VUI.Consts.VERTICAL)
			.html('slider_'+n);
		var $sliderControl = $('<div/>').attr('id','VUISlider_'+o.name+'_'+VUI.Consts.CHANGER)
			.addClass(VUI.Consts.INTERFACE)
			.addClass(VUI.Consts.SLIDER)
			.addClass(VUI.Consts.VERTICAL)
			.addClass(VUI.Consts.CHANGER)
			.html('changer_'+n);
		
		$slider.append($sliderControl);
		return $slider;
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