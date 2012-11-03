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
				}).then(function(data){
					add2body(makeScript(e));
				}).then(function(){
					var $tr = $('<tr/>').append($('<td/>').html(e));
					var $td2 = $('<td/>').html('<source>').click(function(event){
						// http://www.codebelt.com/jquery/open-new-browser-window-with-jquery-custom-size/
						var url = $(this).attr("href");
	                    var windowName = "popUp";//$(this).attr("name");
	                    var windowSize = windowSizeArray[$(this).attr("rel")];
	                    window.open(url, windowName, windowSize);
	                    event.preventDefault();
					});
					$tr.append($td2);
					$('#library tbody').append($tr);
				});
			});	
		}).promise();

	};

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
				$.getJSON(e, function(data){
					window.VUI.addJSONInterface(data.items);
					console.log('appended audio module: '+window.VUI.audioModules[data.items.name]);
				}).then(function(data){
					var $tr = $('<tr/>');
					var $td1 = $('<td/>').append($('<a/>').html(e).attr('href', e));
					var $td2 = $('<td/>').html('<source>').click(function(event){
						// http://www.codebelt.com/jquery/open-new-browser-window-with-jquery-custom-size/
						var url = $(this).attr("href");
	                    var windowName = "popUp";//$(this).attr("name");
	                    var windowSize = windowSizeArray[$(this).attr("rel")];
	                    window.open(url, windowName, windowSize);
	                    event.preventDefault();
					});
					
					$tr.append($td1).append($td2);
					$('#library tbody').append($tr);
				});
			});
		}).promise();
	};

	$.when(loadScripts(), loadModules()).then(function(){
		console.log('all scripts and modules loaded');
	});

}('VUI.js', 'VUIapi.js', 'simple2channels.json'));

