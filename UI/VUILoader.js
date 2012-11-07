(function(){

	var theArgs = arguments;

	//funções de auxílio
	window.makeScript = function(url){
		var scrpt = document.createElement('script'); 
		scrpt.async = false;
		scrpt.src = url;
		scrpt.typ = "text/javascript";
		return scrpt;
	};

	window.add2body = function(script){
		var oldNodeList = document.getElementsByTagName('script');
		var body = document.getElementsByTagName('body')[0];
		body.insertBefore(script, document.body.firstChild);
	};

	var loadScripts = function(){
		//carregue os scripts mais básicos
		return $.Deferred(function(){
			console.log('loading scripts');
			var s = $.map(theArgs, function(e, i){
				var rJS = /\.js(?!on)/;
				if(rJS.test(e)){
					return e;
				};
			});

			$.each(s, function(i, e){
				$.ajax({
					url: e, 
					type: 'GET',
					dataType: 'script'
				}).error(function(){
					console.log('error on get script '+e);
				}).success(function(data){
					add2body(makeScript(e));
				}).then(function(){
					//Get the url, and add a table to check library
					var $a = $('<a/>').attr('href', e).html(e).click(goToRef);
					$('#thLib').append($('<li/>').append($a));
				});
			});	
		}).promise();

	};
	
	var goToRef = function(event){
		// http://www.codebelt.com/jquery/open-new-browser-window-with-jquery-custom-size/
		var url = $(this).attr("href");
        var windowName = "popUp";//$(this).attr("name");
        var windowSize = windowSizeArray[$(this).attr("rel")];
        window.open(url, windowName, windowSize);
        event.preventDefault();
	}

	var loadModules = function(){
		//carregue os modulos de audio
		return $.Deferred(function(){
			console.log('loading modules');

			var m = $.map(theArgs, function(e, i){
				var rJSON = /\.js(?=on)/;
				if(rJSON.test(e)){
					return e;
				}
			});

			//Cheque e adicione modulos
			$.each(m, function(i, e){
				$.ajax({
					url: e,
					type: 'GET',
					dataType: 'json',
					data: {}
				}).error(function(){
					console.log('error on append json '+e);
				}).success(function(data){
					console.log(data);
					//Get the url, and add a table to check library
					window.VUI.interfaces[data.name] = {};
					$.each(data, function(i, e){
						if(i!=='name'){
							window.VUI.interfaces[data.name][i] = e ;
						}
					});
					
				}).then(function(){
					var $a = $('<a/>').attr('href', e).html(e).click(goToRef);
					$('#thMod').append($('<li/>').append($a));
				});
			});
		}).promise();
	};

	$.when(loadScripts(), loadModules()).then(function(){
		console.log('all VUI scripts and modules loaded');
	});

}('VUI.js', 'VUIapi.js', 'simple2channels.json', 'LRLsRsC.json'));

