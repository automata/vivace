# Introduction

[http://toplap.org/](Live coding) is an alternative way to compose and
interpret music (or other media) in real-time.  The performer/composer
plays on a computer device and shows your screen to the public, making
them part of the performance and even understanding what the musician
is really doing to generate that weird sounds. Live coders commonly
use general domain languages or creates their own computer music
languages.

*Vivace* is a live coding language that runs on Web using the [[https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html][Web
 Audio API]].

For now, just Chrome and Safari implements Web Audio API, so you have
to run vivace on it.

[./vivace_off.html](Try vivace right now clicking here!)

# The language

...

# Running your own vivace

You can use vivace just loading this demo page. But if you want to
run your own vivace on your computer/server, follow these next steps.

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

Open http://localhost:8080 on your Chrome or Safari browser.

# Using your own audio/video files

Copy some audio (wav, mp3, ogg) or video (mp4, webm, ogv) to *media/*:

    $ cp *.wav vivace/media/

And edit file vivace_exec.js, to map variable names to your files:

    var files = [{name: 'a', fileName: 'kick.wav', type: 'audio'},
                 {name: 'b', fileName: 'foo.mp4', type: 'video'}]


