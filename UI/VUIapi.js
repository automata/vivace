(function(){

	window.VUI.getInterfaces = function(){
		return window.VUI.interfaces;
	};

	/**
	 * Adicione vários parâmetros, mas o primeiro deve ser uma string, que é
	 * o nome da interface; outros podem ser os canais, e o nome da função básica de
	 * áudio que controla os canais
	 */
	window.VUI.addJSONInterface = function(jsonItems){
		window.VUI.interfaces[jsonItems] = {};
		//esta eh uma função que será criada de acordo
		//com o nome passado no json, e para manipular
		//futuramente com o VUI


		//Refaça o json, mas sem o nome
		//reatribua o nome de função de audio (string type) 
		//para uma função (function type)
		$.each(jsonItems, function(i, e){
			if(i !== 'name'){
				if(i === 'audioFunction'){
					window.VUI.interfaces[arguments[0]][i] = function(audioNode){this.name = e}; //Empty function, do nothing yet
				}
				window.VUI.interfaces[arguments[0]][i] = e;
			}
		});

	};

	window.VUI.getInterface = function(n){
		if(VUI.interfaces.hasOwnProperty(n)){
			return window.VUI.interfaces[n];
		}
		return false;
	};

	window.VUI.deleteInterface = function(n){
		if(window.VUI.interfaces.hasOwnProperty(n)){
			delete window.VUI.interfaces[n];
		}
	};
}());
