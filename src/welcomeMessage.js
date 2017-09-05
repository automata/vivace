var welcomeMessage = "\
// Welcome to Vivace!\
\n// \
\n// Press Ctrl + Enter (or Cmd + Enter, or Alt + Enter) to evaluate \
\n// the following code. Change values into lists and keep pressing Ctrl + Enter\
\n// to change audio/video on-the-fly. \
\n\n// Each voice has a name, a signal/chain that defines its timbre and a \
\n// list of values/notes/durations to automate audio/video node parameters. \
\n// Press Ctrl + ] (or Cmd + ], or Alt + ]) to toggle the drawer on the right.\
\n// There you can control voice parameters by hand.\
\n\n// The following source code defines a simple monophonic synthesizer and \
\n// plugs it to a reverb filter: \
\n\
\na.signal = synth => reverb \
\n\
\n// Then we specify which notes to play and their duration (4n = quarter note,\
\n// 8n = eighty note, etc):\
\n\
\na.notes = [g4, d4, f4, a3]\
\na.notes = {4n, 8t}\
\n\
\n// Use the name of the audio node and its parameter to change its value\
\n// during some time:\
\n\
\na.reverb.roomSize = [10, 20]\
\na.reverb.roomSize = {4n}\
\n\
\n// You can also sample audio files:\
\n\
\nb.signal = sampler('media/kick.wav') => filter\
\nb.n = [g4]\
\nb.n = {1m}\
\n\
\n// And even video files:\
\n\
\nc.signal = video('media/eyes.mp4') => reverb\
\nc.pos = [10, 20]\
\nc.pos = {4n}\
"
