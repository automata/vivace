(function(){
	
	VUI = null;
	window.VUI = VUI;
	window.VUInterface = null;

	VUI = {
			Consts: {
				CONTROL: 'control',
				VISU: 'visu',
				SLIDER: 'control slider',				
				KNOB: 'control knob',
				CONSOLE: 'graphs console',
				MIXER: 'control mixer'
			}, 

			checkConsts: function(t){
				if(typeof t === 'String'){
					var b = false;
					for(c in this.Consts){
						if(k == c){
							b = true;
							break;	
						};
					};
					return b;
				}
				else{
					return false;
				}
			},

			checkName: function(n){
				if(typeof n === 'String'){
					return true;
				}
				else{
					return false;
				}
			},

			checkFunc: function(f){
				if(typeof f === 'Function'){
					return true;
				}
				else{
					return false;
				}
			},

			/*
			 * Adicione uma função geradora ao VUI
			 * <pre>
			 * 	VUI.add('name', 'type', function(){
			 * 		//A função que gera o algoritmo de áudio;
			 *  });
			 * </pre>
			 * 
			 * @return an uglyObject
			 * @see VUI.uglyObject
			 */
			add: function(n, t, f){
				(function(v){
					if(this.generators === undefined || this.generators === null){
						v.generators = {};
					}
				}(this));

				if(this.checkName(n) && this.checkConsts(t) && this.checkFunc(f)){
					this.generators[n] = {
							type: t,
							funcGen: f
					};
					return this.generators[n];	
				}
				else if(this.checkName(n) && this.checkConsts(t) && !this.checkFunc(f)){
					this.generators[n] = {
							type: t,
							funcGen: function(){}
					};
					return this.generators[n];	
				}
				else if(this.checkName(n) && !this.checkConsts(t) && !this.checkFunc(f)){
					this.generators[n] = {
							type: 'erroronset',
							funcGen: function(){}
					};
					return this.generators[n];	
				}
				else{
					throw new Error("You setted a"+(typeof this)+" with invalid arguments" );
				}
			}
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
	window.VUInterface = VUInterface;
	VUInterface = function(n, t, f){
		try{
			this.machine = VUI.add(n, t, f);
		}
		catch(e){
			console.log(e);
		};


		this.makeControlUI = function(cssContainer){

			var $identifier = $('<p/>').html(this.machine[n].type);
			var $control = $('<div/>').attr('id',n+'_'+this.machine[n].type);

			console.log('searching in consts: ');
			$.each(VUI.Consts, function(i, e){
				console.log(e);
				if(t.search(e)){
					console.log('FOUND: '+e);
					console.log('Adding class '+e+' to '+$control.attr('id'));
					$control.addClass(e);
				}
			});

			$identifier.appendTo($(cssContainer));
			$control.appendTo($(cssContainer));
			return $control;

		};
	};

	function VUIControl(){
		VUIControl.call(n, VUI.Consts.CONTROL, f);
	}

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

}());