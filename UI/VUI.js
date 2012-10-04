(function(){
	
     
	var VUI = {
			Consts: {
				CONTROL: 'control',
				VISU: 'visu',
				SLIDER: 'control slider',				
				KNOB: 'control knob',
				CONSOLE: 'graphs console',
				MIXER: 'control many _mixer'
			}, 

			check: function(n, t, f){
				var checkConsts = function(k){
					var b = false;
					for(c in VUI.Consts){
						if(k == c){
							b = true;
							break;	
						};

						return b;
					};

					if(typeof n !== 'String' || typeof t !== 'String' || typeof t !== 'Function'){
						throw new Error('invalid argument');
					}
					else{
						if(checkConsts(t)){
							return true;
						}
						else{
							return false;
						}
					}	
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
				if(VUI.generators === undefined || VUI.generators === null){
					VUI.generators = {};
				}

				VUI.generators[n] = {
						type: t,
						funcGen: f
				};

				return VUI.generators[n]
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
	function VUInterface(n, t, f){
		try{
			this.machine = VUI.add(n, t, f);
		}
		catch(e){
			console.log(e);
		};

		this.makeControlUI = function(cssContainer){

			var $identifier = $('<p/>').html(t+': '+n);
			var $control = $('<div/>').attr('id', n);

			dbug.log('searching in consts: ');
			$.each(VUI.Consts, function(i, e){
				dbug.log(e);
				if(t.search(e)){
					dbug.log('FOUND: '+e);
					dbug.log('Adding class '+e+' to '+$control.attr('id'));
					$control.addClass(e);
				}
			});

			$identifier.appendTo($(cssContainer));
			$control.appendTo($(cssContainer));
			return $control;

		};
	}

	subClass(VUIControl, VUInterface);
	function VUIControl(){
		VUIControl.call(n, VUI.Consts.CONTROL, f);
	}

	/*
	 * Many de muitos; muitos controles, muitas visualizacoes;
	 * em suma muitos controles eh um mixer com muitos knobs e sliders;
	 * muitas visualicoes eh um console, com todas as luzinhas subindo
	 */
	subClass(VUIMany, VUInterface);
	function VUIMany(n, f){
		VUInterface.call(n, VUI.Consts.MANY, f);
	}

	subClass(VUIVisu, VUInterface);
	function VUIVisualizer(){
		VUInterface.call(n, VUI.Consts.VISU, f);
	}

	subClass(VUISlider, VUIControl);
	function VUISlider(){
		VUIControl.call(n, VUI.Consts.SLIDER, f);
	};

	subClass(VUIKnob, VUIControl);
	function VUIKnob(){
		VUIControl.call(n, VUI.Consts.KNOB, f);
	}

	subClass(VUIMixer, VUIMany);
	function VUIMixer(){
		VUIMany.call(n, VUI.Consts.MIXER, f);
	};

}());