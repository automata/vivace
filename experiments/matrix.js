$(function() {

    //
    // UI
    //

    $( ".tonematrix" ).draggable();
    $( "input:checkbox", ".tonematrix").button().click(function () {
        var id = $(this).attr('id');

        var synthId = id[1].toInt();
        var stepId = id[2].toInt();
        var tmp = patterns[synthId].pattern;

        if ($(this).attr('checked')) {
            var note = majorScale[(Math.abs(synthId - 7))];
            tmp.list[stepId] = note; 
            //socket.send(id[1] + ' ' + id[2] + ' 127');
        } else {
            tmp.list[stepId] = 0;
            //socket.send(id[1] + ' ' + id[2] + ' 0');
        }
        
        patterns[synthId].pattern = tmp;
    });

	    
       
    $("#slider1").slider({
        value:1,
        min: 0,
        max: 3,
        step: 0.25,
        orientation: "horizontal",
        animate: true,
        slide: function (event, ui) {
            var x = ui.value;
            console.log(x);
            duration.pattern = new PSequence([x], Infinity);
        }});
            


    //
    // audio
    //

    var majorScale = [ 261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];

    var audiolet = new Audiolet();

    audiolet.scheduler.setTempo(120);

    // creating an instrument

    // borrowed from @o_amp_o's code
    var HighSynth = new Class({
        Extends: AudioletGroup,
        initialize: function(audiolet) {
            AudioletGroup.prototype.initialize.apply(this, [audiolet, 0, 1]);
           
            // Triangle base oscillator
            this.triangle = new Triangle(audiolet);

            // Note on trigger
            this.trigger = new TriggerControl(audiolet);

            // Gain envelope
            this.gainEnv = new PercussiveEnvelope(audiolet, 0, 0.2, 0.2);
            this.gainEnvMulAdd = new MulAdd(audiolet, 0.3);
            this.gain = new Gain(audiolet);

            // Connect oscillator
            this.triangle.connect(this.gain);
            
            // Connect trigger and envelope
            this.trigger.connect(this.gainEnv);
            this.gainEnv.connect(this.gainEnvMulAdd);
            this.gainEnvMulAdd.connect(this.gain, 0, 1);
            this.gain.connect(this.outputs[0]);
        }
    });

    var synths = [];
    var patterns = [];

    var duration = new PProxy(new PSequence([1], Infinity));

    for (i=0; i<8; i++) {
        synths[i] = new HighSynth(audiolet)
        synths[i].connect(audiolet.output);
        patterns[i] = new PProxy(new PSequence([0, 0, 0, 0, 0, 0, 0, 0], Infinity));
        audiolet.scheduler.play([patterns[i]], duration,
                                function (frequency) {
                                    this.trigger.trigger.setValue(1);
                                    this.triangle.frequency.setValue(frequency);
                                }.bind(synths[i]));
    }

    // ... we are working on this...

    //
    // socket.io
    //
    /***
    // create the socket to the local OSC server
    var socket = new io.Socket("localhost", {port: 4040, rememberTransport: false});

    // NOTE: we can create sockets to remote hosts too!!!

    // connect to the socket
    socket.connect();

    // when a message from server was received...
    socket.on('message', function(obj) { 
        // var status = document.getElementById('status');
        // var el = document.createElement('p');
        if ('connection' in obj) {
            // el.innerHTML = 'user ' + obj.connection + ' connected';
        } else if ('disconnection' in obj) {
            // el.innerHTML = 'user ' + obj.disconnection + ' disconnected';
        } else if ('message' in obj) {
            // el.innerHTML = 'user sends: ' + obj.message;

            var pos = obj.message.toString().split(',');
            // check the checkbox...
            if (pos[2] == '127') {
                $('#c' + pos[0] + pos[1]).attr('checked', true);
            } else {
                $('#c' + pos[0] + pos[1]).attr('checked', false);
            }
            $('#c' + pos[0] + pos[1]).button('refresh');

            // ... and check the lp
            socket.send(pos[0] + ' ' + pos[1] + ' ' + pos[2]);
        }
        // status.appendChild(el);
    });      
    ***/
});

