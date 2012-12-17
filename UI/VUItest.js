(function(){

	_Test = {

			//The object itself
			objectUnderTest: null,

			//the test methods of objectUnderTest
			methods: {
				testNotNull: {},
				testTypeof: {},
				assertThis: {},
				assert: {},
			},
			
			current: {
				method: null,
				property:  null,
			},

			//The results of all possible tests
			results: {},

			/**
			 * Create template test:
			 * each template will be the properties of object under test, 
			 * and where the results will be print in window
			 */
			templates: function(array){
				console.log('loading functions:');
			
				$.each(_Test.methods, function(k, o){
					$.each(o, function(n, func){
						console.log('\t'+k+'.'+n);
					});
				});
				
				$.each(_Test.results, function(k, o){
					$.each(o, function(n, func){
						console.log('\t'+k+'.'+n);
					});
				});
			},
					
			set: function(currentProperty){
				_Test.current.property = currentProperty;
				return _Test.current.property;
			}

	};
	
	var createTests = function(array){
		//O usu‡rrio passa uma array de templates
		$.each(array, function(i, templ){

			//se test: crie fun‹o que testa -> Usu‡rio final
			//se id ou result: fun‹o que mostra o resultado em um tag HTML estruturado
			//se list: booleano que lista as propriedades internas do objeto
			$.each(templ, function(k, property){
				_Test.results[property] = {};
				if(k === 'test'){
					_Test.methods.testNotNull[property] = function(){ 
						return _Test.objectUnderTest[_Test.current.property] !== null;
					};

					_Test.methods.testTypeof[property] = function(expected){
						return typeof _Test.objectUnderTest[_Test.current.property] === expected;
					};
					
					_Test.methods.assertThis[property] = function(expected){
						return  _Test.objectUnderTest[_Test.current.property] === expected;
					};

					//And put all in one test
					_Test.methods.assert[property] = function(expected){
						return _Test.methods.testNull[current.property]() && _Test.methods.assertThis(expected);
					};

				}
				if(k === 'id'){
					_Test.results[property]['id'] = k;
				}
				if(k === 'result'){
					_Test.results[property]['ul'] = _Test.results[property]['id']+' > '+k;
				}
			});
		});
	}

	window.Test = {
			
			init: function(o){
				_Test.objectUnderTest = o;
			},
			
			templates: function(a){
				_Test.templates(a);
			},
			
			/**
			 * Give at least 2 arguments
			 * 
			 * @param method the method to be executed
			 * @param property the property of object under test (can be a single parameter or a big string separeted by =>"
			 * @param expected the expected result  of property under test
			 * @returns
			 */
			test: function(){
				var method = arguments[0];
				var property = _Test.set(arguments[1]);
				var expected = arguments[2];

				switch(method){
				case 'notNull': 
					if(_Test.methods.testNotNull[property]()){
						printOK(method, property);
					}
					else{
						printError(method, property, 'failed');
					}
					break;
				case 'typeof': 
					if(_Test.methods.testTypeof[property](expected)){
						print(method, property, 'OK');
					}
					else{
						print(method, property, 'failed');
					}
					break;
				case 'assert': 
					if(_Test.methods.assert[property](expected)){
						print(method, property, 'OK');
					}
					else{
						print(method, property, 'failed')
					}
				}
			},

			print: function(method, property, msg){
				//send ok message
				$.each(objectUnderTest[property], function(k, v){
					$(results[property]['ul']).append($('<li/>').html('test '+method+'=>'+property+': '+msg));
				});
				if(msg === 'OK'){
					//make Green signal
					$(results[property]['id']).append().css({
						'border': '1px solid black',
						'color': '#00FF00'
					});
				}
				else if(msg === 'failed'){
					//make red signal
					$(result[property]['id']).css({
						'border': '1px solid black',
						'color': '#FF1010'
					});
				}
				
			}, 
	}

}());