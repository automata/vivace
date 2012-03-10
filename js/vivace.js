var audiolet = new Audiolet();

audiolet.scheduler.setTempo(138);

amen = new AudioletBuffer(1, 0);
amen.load('audio/amen.wav', false);

player = new BufferPlayer(audiolet, amen, 1, 0, 1);
restartTrigger = new TriggerControl(audiolet);

restartTrigger.connect(player, 0, 1);
player.connect(audiolet.output);

var barStartPosition = new PSequence([0],
                                     Infinity);

var positionInBar = new PProxy( new PSequence([0], Infinity));
                                
audiolet.scheduler.play([barStartPosition, positionInBar], 1,
                        function(barStartPosition, positionInBar) {
                            // Scale position 0->1
                            var position = barStartPosition / 4 + positionInBar / 16;
                            // Scale position 0->length
                            position *= amen.length;
                            player.startPosition.setValue(position);
                            restartTrigger.trigger.setValue(1);
                        }
                       );

var vivaceEval = function (expr) {
    positionInBar.pattern = new PSequence(eval(expr), Infinity);
};