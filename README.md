# Introduction

[Live coding](http://toplap.org) is an alternative way to compose and
play music (or other media) in real-time.  The performer/composer
plays on a computer device and shows your screen to the public, making
them part of the performance and at the same time demystifying what
the musician is really doing to generate that weird sounds. Live
coders commonly use general domain languages or create their own
computer music languages.

*Vivace* is a live coding language that runs on Web using the [Web
 Audio
 API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
 for process audio and the HTML5 video tag to play videos. The
 language parser is built using the awesome [Jison](http://jison.org).

For now, just Chrome and Safari implements Web Audio API, so you have
to run vivace on it.

[Try vivace right now clicking
here!](http://vivacelang.herokuapp.com). You can even play together
with others, just share this URL [http://vivacelang.herokuapp.com]()
with them and try typing and evaluating (ctrl+x).

# The language

The language is not complete. We have a [draft specification
here](https://github.com/automata/vivace/wiki/Language-spec). Feel
free to suggest your own commands/syntax/grammar to us!

For now you can basically use vivace as a "sampler language". You can
specify which audio or video file you want to play and hack some of
its parameters on-the-fly.

# Running your own vivace

You can use vivace just loading [this demo
app](http://vivacelang.herokuapp.com). But if you want to run your own
vivace on your computer/server, follow these next steps.

Clone this repos:

    $ git clone git://github.com/automata/vivace.git

Download nodejs and install it:

    $ wget -c http://nodejs.org/dist/v0.8.9/node-v0.8.9.tar.gz
    $ tar -xvzf node-v0.8.9.tar.gz
    $ cd node-v0.8.9/
    $ ./configure
    $ make
    $ sudo make install

Install vivace dependencies:

    $ cd vivace/
    $ npm install
    
Run:

    $ node server.js

Open [http://localhost:5000]() on your Chrome or Safari browser. You
can even share this URL with others and live code together.

# Using your own audio/video files

Copy some audio (wav, mp3, ogg) or video (mp4, webm, ogv) to *media/*:

    $ cp *.wav vivace/media/

And edit file vivace_exec.js, to map variable names to your files:

    var files = [{name: 'a', fileName: 'kick.wav', type: 'audio'},
                 {name: 'b', fileName: 'foo.mp4', type: 'video'}]

