(function(){
	var VUI = {
			Consts: {
					CONTROL: 'control',
					VISU: 'graphs',
					SLIDER: Consts.CONTROL+' slider',
					KNOB: Consts.CONTROL+' knob',
					CONSOLE: Consts.GRAPHS+' console',
					MANY:Consts.CONTROL+' many',
					MIXER: Consts.MANY+': control'

			}, 

			uglyObject: function(){
				var a = c(arguments);
				
				$.each(a, function(i, e){
					if(e.ok){
						VUI.generators['_nAn_'] = //Retorne um nome generico
						{
								type: o.raw,	//Mesmo que o argumento inicial
								f: null			//retorne uma função nula, vc pode adicionar depois
						}
					};
				});
				

				var c = function(){
					return $.map(arguments, function(e, i){
						if(isNan(e)){
							if(i=== 0){
								throw Error("Empty arguments; you need add at least not null one");
							}
							dbug.log(typeof e+' argument found: '+e);
						}
						else if(typeof e === 'String'){
							return checkConsts(e);
						}
						else if (typeof e === 'Function'){
							return {primitive: 'Function', ok: true, raw: e};
						}
						
					});
				}

				
				var checkConsts = function(k){
					var b = false;
					var t = null;
					for(c in VUI.Consts){
						if(k === c){
							t = 'String';
								b = true;
							break;	
						};
					}
					return {primitive: t, ok: b, raw: k};
				};
				
				return o;
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
			add: function(){
				if(VUI.generators === undefined || VUI.generators === null){
					VUI.generators = {};
				}

				var o = null;
				switch(arguments.lenght){
				case 0: throw Error("Empty arguments; you need add at least one"); break;
					case 1: o = uglyObject(arguments[0]);
					case 2: o = uglyObject(arguments[0], arguments[1]);
					case 3: o = uglyObject(arguments[0], arguments[1], arguments[2]);
				}
				return o;
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

});