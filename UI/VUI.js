(function(){

	/* http://stackoverflow.com/questions/561844/how-to-move-div-with-the-mouse-using-jquery
	 * PlugTrade.com - jQuery draggit Function */
	/* Drag A Div with jQuery */
	jQuery.fn.draggit = function (el) {
	    var thisdiv = this;
	    var thistarget = $(el);
	    var relX;
	    var relY;
	    var targetw = thistarget.width();
	    var targeth = thistarget.height();
	    var docw;
	    var doch;

	    thistarget.css('position','absolute');


	    thisdiv.bind('mousedown', function(e){
	        var pos = $(el).offset();
	        var srcX = pos.left;
	        var srcY = pos.top;

	        docw = $('body').width();
	        doch = $('body').height();

	        relX = e.pageX - srcX;
	        relY = e.pageY - srcY;

	        ismousedown = true;
	    });

	    $(document).bind('mousemove',function(e){ 
	        if(ismousedown)
	        {
	            targetw = thistarget.width();
	            targeth = thistarget.height();

	            var maxX = docw - targetw - 10;
	            var maxY = doch - targeth - 10;

	            var mouseX = e.pageX;
	            var mouseY = e.pageY;

	            var diffX = mouseX - relX;
	            var diffY = mouseY - relY;

	            // check if we are beyond document bounds ...
	            if(diffX < 0)   diffX = 0;
	            if(diffY < 0)   diffY = 0;
	            if(diffX > maxX) diffX = maxX;
	            if(diffY > maxY) diffY = maxY;

	            $(el).css('top', (diffY)+'px');
	            $(el).css('left', (diffX)+'px');
	        }
	    });

	    $(window).bind('mouseup', function(e){
	        ismousedown = false;
	    });

	    return this;
	}; // end jQuery draggit function //

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
							handler: f
					};
				}
				else if(checkName(n) && checkConsts(t, b) && !checkFunc(f)){
					VUI.generators[n] = {
							type: t,
							handler: function(){}
					};	
				}
				else if(checkName(n) && !checkConsts(t, b) && !checkFunc(f)){
					VUI.generators[n] = {
							type: 'NON_TYPE',
							handler: function(){}
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
							handler: f
					};
				}
				else if(checkObj(n) && checkConsts(t, b) && !checkFunc(f)){
					VUI.generators[n.name] = {
							type: t,
							audioArray: n.channels,
							handler: function(){return false}
					};	
				}
				else if(checkObj(n) && !checkConsts(t, b) && !checkFunc(f)){
					VUI.generators[n.name] = {
							type: 'NON_TYPE',
							audioArray:n.channels,
							handler: function(){return false}
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
			MIXER: 'mixer',
			VALUE: 'value'
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
				this.element = VUInterface(ns);
				return this.element;
			}
			else if(ts === VUI.Consts.CONTROL){
				this.element = VUIControl(ns);
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
		var $control = $('<div/>').attr('id','VUIControl_'+n)
		.addClass(VUI.Consts.INTERFACE)
		.addClass(VUI.Consts.CONTROL)
		
		var $p = $('<p/>').html('control_'+n).appendTo($control)
		return $control;
	};

	var VUISliderV = function(n, t, f){

		var $sl = {
				struct: {body: $('<div/>'), changer: $('<div/>')},
				
				addClasses:function(){
					$.each(this.struct, function(i, e){
						e
						.addClass(VUI.Consts.INTERFACE)
						.addClass(VUI.Consts.CONTROL)
						.addClass(VUI.Consts.SLIDER)
						.addClass(VUI.Consts.VERTICAL);
						if(i==='changer'){
							e.addClass(VUI.Consts.CHANGER);
						};
					});
				},
				
				addAttrs: function(name, type){
					$.each(this.struct, function(i, e){
						if(e.hasClass(VUI.Consts.CHANGER)){
							e.attr('id','VUISliderV_'+name+'_'+type+'_'+VUI.Consts.CHANGER);
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
					$('<p/>').html(n).appendTo(this.struct.body).addClass(VUI.Consts.VALUE);
				},
				
				clicked: false,
				
				upAndDown: function(){
					this.struct.changer.draggable({
						axis:"y",
						containment: "parent",
					// TODO ...then update the numbers
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
		return VUIControl(n)
	};

	window.VUI = VUI;
	window.$V = VUIObj;
}());