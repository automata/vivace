(function(){

	//////////////////////////////////////////////
	// VUIObj (USER AND GUI CONTEXT)
	//////////////////////////////////////////////

	/**
	 * VUIObj
	 * 
	 * //TODO Basic usage:
	 * 
	 * Using VUIObj is another way of use of V variable:
	 * 
	 * You can call VUIObj or in your scripts $V:
	 * <code>
	 * 	\/\/ Same as VUI.init();
	 * 	$V('init')
	 * 
	 *  \/\/ Same as VUI.make(obj, array) followed by connect and play
	 *  var node = //MyAudiowebkitNODE
	 *  $V({name: 'mixer'}, ['myModule.json', 'myModule2.json']).connect(node);
	 *  
	 *  \/\/load src
	 *  \/\/var url = 'audio/example.mp3'
	 *  \/\/$V({name: 'mixer'}, ['myModule.json', 'myModule2.json']).load(url);
	 *  
	 *  \/\/ Play node
	 *  $V('mixer').play();
	 * 
	 * 	\/\/ Show GUI
	 *  $V('mixer').show('GUI', true);
	 *  
	 *  \/\/ Close GUI
	 *  $V('mixer').show('GUI', false);
	 *  
	 *  \/\/ Stop node
	 *  $V('mixer').stop();
	 *
	 * </code>
	 */
	//Forneca dados e crie uma UI mais complexa
	var VUIObj = function(){
		
		//Quando passar um simples argumento string, crie um simples VUIObj
		if(typeof arguments[0] === 'string' && arguments[1] === undefined){
			if(arguments[0] === 'init'){
				return VUI.init();
			}
		}
		else if (typeof arguments[0] === 'object' && typeof arguments[1] === 'Array'){
			if(arguments[0].hasOwnProperty('name')){
				VUI.in
				$.each(arguments[1], function(k, v){
					
				});
			}
		}
		else if(typeof arguments[0] === 'string' && typeof arguments[1] === 'function'){
			
			var n = arguments[0];
			var f = arguments[1];
			var ui = null;
			
			if(n === VUI.Consts.Control){
				ui = VUInterface(n);
			}
			if(n === VUI.Consts.Slider){
				ui = VUIControlWidget(n, 'slider vertical');
			}
			if(n === VUI.Consts.Knob){
				ui = VUIControlWidget(n, 'knob');
			}
			return VUI.initUI(n, f, ui);
		}
		else if(typeof arguments[0] === 'object' && typeof arguments[1] === 'function'){
			VUI.createInterface(arguments[0]);
			var n = arguments[0].name;
			var f = arguments[1];
			return VUIObj(n, f);
		}
	};
	
	var VUInterface = function(n){
		var $interface = $('<div/>').attr('id','VUInterface_'+n).addClass(VUI.Consts.INTERFACE);
		$('<p/>').html('interface_'+n).appendTo($interface);
		return $interface;
	};
	
	var VUIMixer = function(n){
		var $mix = $('<div/>').attr('id','VUIMixer_'+n)
		.addClass(VUI.Consts.INTERFACE)
		.addClass(VUI.Consts.CONTROL)
		.addClass(VUI.Consts.MIXER);
		
		//Para cada canal previamente fornecido, crie um widget de acordo com os typeUI
		var widgets = $.map(VUI.interfaces[n].channels, function(wName, i){
			//O tipo Ž um slider ou knob
			var typeUI = VUI.interfaces[n].typeUI;
			
			return VUIControlWidget(wName, typeUI);
		});
		
		$.each(widgets, function(i, e){
			$mix.append(e);
		});
		
		return $mix;
	}
	
	var VUIEq = function(n){
		//TODO
	}

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
	 * Uma Widget generalizada; uma Widget Ž uma UI manipul‡vel s(slider, knob, etc.)
	 */
	var VUIControlWidget = function(n){
		this.wName = n;
		this.typeUI = VUI.getInterface(n).typeUI;

		var widget = {
			//A estrutura tem um lugar para manter o controlador,
			//e aquele objeto que movimenta dentro do controlador
			struct:{
				body: $('<div/>'),
				changer: $('<div/>'),
			},
			
			//Adicione as classes apropriadamente conforme for um slider ou knob
			addClasses: function(){
				$.each(this.struct, function(i, e){
					e.addClass(VUI.Consts.INTERFACE).addClass(VUI.Consts.CONTROL);
					if((/slider/).test(this.typeUI)){
						e.addClass(VUI.Consts.SLIDER);
					}
					if((/vertical/).test(this.typeUI)){
						e.addClass(VUI.Consts.VERTICAL);
					}
					if((/knob/).test(this.typeUI)){
						e.addClass(VUI.Consts.KNOB);
					}
					if(i==='changer'){
						e.addClass(VUI.Consts.CHANGER);
					}
				});

			},
			
			addAttrs: function(){
				$.each(this.struct, function(i, e){
					var id = '';
					if(e.hasClass('slider')){
						id = 'VUISliderV_'+this.wName+'_';
					}
					else if(e.hasClass('knob')){
						id = 'VUIKnob_'+this.wName+'_';
					}

					if(e.hasClass(VUI.Consts.CHANGER)){
						id+=VUI.Consts.CHANGER;
					}
					else{
						id+=this.typeUI;
					}
					e.attr('id', id);
				});	
			},

			build: function(){
				this.body.append(this.changer);
			},

			get$: function(){
				return this.body;
			},

			addLetters: function(){
				$('<p/>').html(this.wName).appendTo(this.struct.body).addClass(VUI.Consts.IDENTIFIER);
				var id1 = '#VUISliderV_'+this.wName+'_'+VUI.Consts.CHANGER;
				//var id2 = 'VUISliderV_'+this.name+'_'+VUI.Consts.RESULT;
				var r = $(id1).css('top');
				//$('<p/>').html(r).appendTo(this.struct.body).attr('id', id2).addClass(VUI.Consts.RESULT);
			}
		};

		
		if((/knob/).test(this.type)){
			widget.rotation = function(rotationHandler, widget){
				//this.struct
			};
		}
		
		widget.addClasses();
		widget.addAttrs(n, t);
		widget.addLetters();
		widget.build();
		
		if((/slider/).test(this.typeUI)){
			if((/vertical/).test(this.typeUI)){
				widget.upAndDown = function(draggerHandler){
					widget.struct.changer.draggable({
						axis:"y",
						containment: "parent",
						drag:function(){
							var y = $('#VUISlider_'+this.wName+'_'+VUI.Consts.CHANGER).css('top');
							console.log('in:'+y);
							y = normSlider(y,{offset: [3, 107], toBe: [0, 1]});
							$('#VUISlider_'+this.wName+'_'+VUI.Consts.RESULT).html(y);
							console.log('out: '+y);
						}
					});
				};
				widget.upAndDown(handler);
			}
			
			if((/horizontal/).test(this.typeUI)){
				widget.rightAndLeft = function(draggerHandler){
					//TODO
				};
			}	
		}
		else if((/knob/).test(this.typeUI)){
			var handler = function(){
				var $r = $('#VUISliderV_'+widget.name +'_'+VUI.Consts.CHANGER);
				if($r.css('transform')){

				}
				if($r.css('-moz-transform')){

				}
				if($r.css('-webkit-transform')){

				}	
			};
			widget.rotation = function(draggerHandler){
				//TODO
			};
			widget.rotation(handler);
		}

		return widget.get$();
	};

	//Some func to get correct params in css
	var normSlider = function(input, o){			
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

	var applyRotation = function($knob, deg){
		$knob.css({
			'-webkit-transform': 'rotate('+deg+'deg)',
			'-moz-transform': 'rotate('+deg+'deg)',
			'-ms-transform': 'rotate('+deg+'deg)',
			'-o-transform': 'rotate('+deg+'deg)',
			'transform': 'rotate('+deg+'deg)'
		});
	};

	VUIObj.load = function(){
		var dfd = $.Deferred();
		window.$V = VUIObj;
		dfd.resolve({
			sucess:true,
		});
		return dfd.promisse();
	};
}());
