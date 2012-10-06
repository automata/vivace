(function(){

	/*http://stackoverflow.com/questions/1789945/javascript-string-contains*/
	String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

	V = function(){

		var checkConsts = function(t, alreadyChecked){

			regExprString = function(string){
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

			checkt = function(string){
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

			if(checkName(n) && checkConsts(t, false) && checkFunc(f)){
				VUI.generators[n] = {
						type: t,
						funcGen: f
				};
			}
			else if(checkName(n) && checkConsts(t, false) && !checkFunc(f)){
				VUI.generators[n] = {
						type: t,
						funcGen: function(){}
				};	
			}
			else if(checkName(n) && !checkConsts(t, false) && !checkFunc(f)){
				VUI.generators[n] = {
						type: 'NON_TYPE',
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
		else if(t === VUI.Consts.SLIDER+' '+VUI.Consts.VERTICAL){
			this.element = VUISliderV(n, f);
			return this.element;
		}
	};


	var VUInterface = function(n){
		var $interface = $('<div/>').attr('id','VUInterface_'+n).addClass(VUI.Consts.INTERFACE).html('interface_'+n);
		return $interface;
	};

	var VUIControl = function(n){
		var $control = $('<div/>').attr('id','VUIControl_'+n)
		.addClass(VUI.Consts.INTERFACE)
		.addClass(VUI.Consts.CONTROL)
		.html('control_'+n);
		return $control;
	};

	var VUISliderV = function(n, f){
		var o = VUI.generators[n];
		var $slider = $('<div/>').attr('id','VUISliderV_'+n+'_'+o.type)
		.addClass(VUI.Consts.INTERFACE)
		.addClass(VUI.Consts.CONTROL)
		.addClass(VUI.Consts.SLIDER)
		.addClass(VUI.Consts.VERTICAL)
		.html(n);
		var $sliderControl = $('<div/>').attr('id','VUISlider_'+n+'_'+o.type+'_'+VUI.Consts.CHANGER)
		.addClass(VUI.Consts.INTERFACE)
		.addClass(VUI.Consts.CONTROL)
		.addClass(VUI.Consts.SLIDER)
		.addClass(VUI.Consts.VERTICAL)
		.addClass(VUI.Consts.CHANGER)
		.html(function(){
			return $(this).css('top');	
		});

		$sliderControl.click(function(){
			var y = $(this).css('top');
			console.log('changer_'+n+'(y): '+y);
		});

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