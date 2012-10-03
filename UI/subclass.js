/* http://www.golimojo.com/etc/js-subclass.html */
function subclass(constructor, superConstructor){
    function surrogateConstructor(){}
    surrogateConstructor.prototype = superConstructor.prototype;
    var prototypeObject = new surrogateConstructor();
    prototypeObject.constructor = constructor;
    constructor.prototype = prototypeObject;
};