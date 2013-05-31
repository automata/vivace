# How to hack Vivace?

## Hacking the DSL

Vivace main objective is to be a good DSL to livecoding. Good in livecoding is
about getting more with less.  Get more music expression with few typing, but
without losing the power/flexibility of a synthesis engine.

To hack on the DSL you will need JISON:

npm install jison

You will hack on vivace.jison, the file that contains all the syntax-rules that
guides the parser of Vivace. You will also hack on vivace.jisonlex, that defines
the tokens of the language.

To compile:

jison vivace.jison vivace.jisonlex

## How the DSL is glued together with JavaScript?

tree (as dict) to JS code and some tricks to create GIBBER objects.

## Hacking the Audio Engine

Vivace is based in GIBBER (and its gibberish audio engine which uses Web Audio
API).

## Hacking the Graphical Engine

## Hacking the MIDI/OSC Engine