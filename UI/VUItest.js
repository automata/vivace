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
				createTests(array);

				$.each(_Test.methods, function(k, o){
					$.each(o, function(n, func){
						console.log('\t'+k+'.'+n);
					});
				});	
			},

			/**
			 * A hand on 
			 * @param currentProperty
			 * @returns
			 */
			set: function(currentProperty){
				_Test.current.property = currentProperty;
				return _Test.current.property;
			}

	};

	var createTests = function(array){
		//O usu‡rrio passa uma array de templates
		$.each(array, function(i, templ){
			var currentP = null;
			//se test: crie fun‹o que testa -> Usu‡rio final
			//se id ou result: fun‹o que mostra o resultado em um tag HTML estruturado
			//se list: booleano que lista as propriedades internas do objeto
			$.each(templ, function(k, v){

				if(k === 'test'){
					_Test.results[v] = {};
					currentP = v;

					_Test.methods.testNotNull[v] = function(){ 
						return _Test.objectUnderTest[_Test.current.property] !== null;
					};

					_Test.methods.testTypeof[v] = function(expected){
						return typeof _Test.objectUnderTest[_Test.current.property] === expected;
					};

					_Test.methods.assertThis[v] = function(expected){
						return  _Test.objectUnderTest[_Test.current.property] === expected;
					};

					//And put all in one test
					_Test.methods.assert[v] = function(expected){
						return _Test.methods.testNull[current.property]() && _Test.methods.assertThis(expected);
					};

					_Test.methods.hasOwnProperty[v] = function(expected){ 
						return _Test.objectUnderTest[_Test.current.property].hasOwnProperty(expected);
					};

				}
				else{
					_Test.results[currentP][k] = v;
				}

			});
		});
	};

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
					var notNull = _Test.methods.testNotNull[property];
					console.log(notNull())
					if(notNull()){
						print(method, property,expected, 'OK');
					}
					else{
						print(method, property,expected, 'failed');
					}
					break;
				case 'typeof': 
					var testTypeof = _Test.methods.testTypeof[property];
					console.log(testTypeof(expected))
					if(testTypeof(expected)){
						print(method, property,expected, 'OK');
					}
					else{
						print(method, property, expected, 'failed');
					}
					break;
				case 'assert': 
					var assert = _Test.methods.assert[property];
					console.log(assert(expected))
					if(assert(expected)){
						print(method, property, expected,'OK');
					}
					else{
						print(method, property, expected, 'failed')
					}
					break;
				case 'hasOwnProperty': 
					var hasOwnProperty = _Test.methods.hasOwnProperty[property];
					console.log(hasOwnProperty(expected));
					if(hasOwnProperty(expected)){
						print(method, property, expected, 'OK');
					}
					else{
						print(method, property, expected, 'failed')
					}
					break;
				}
				
			} 
	};

	/**
	 * Print in webpage the given tests
	 * @param method
	 * @param property
	 * @param msg
	 */
	var print =  function(method, property, expected, msg){
		//send ok message
		var result = _Test.results[property];
		var $ul = $(result.id+' > '+result.result);

		var m ='test '+method+'->'+property+'[expected:'+expected+']: '+msg;

		$ul.append($('<li/>').html(m));

		if(msg === 'OK'){
			//make Green signal
			$ul.css({
				'border': '1px solid black',
				'color': '#00FF00'
			});
		}
		else if(msg === 'failed'){
			//make red signal
			$ul.css({
				'border': '1px solid black',
				'color': '#FF1010'
			});
		}

	}

}());