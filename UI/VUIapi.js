(function(){

	try{
		window.VUI.interfaces = {};
		
		window.VUI.getInterfaces = function(){
			return window.VUI.interfaces;
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
	}
	catch(e){
		console.log(e);
	}
}());
