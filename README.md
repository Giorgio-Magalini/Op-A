# Op-A

Op-A is a web application designed to provide an immersive and interactive experience with sound and visuals. 
It exploit the randomness of the unpredictable movements of physical bodies to generate MIDI signals.
Op-A in simple words can be considered an arpeggiator, inspired by the "tombola" function of the OP-1 synthesizer, which, just like the OP-1 makes it possible for the user to create unpredictable and evolving musical sequences adding an element of surprise and creativity to its musical explorations. 

## Getting Started

To get started with Op-A, clone the repository and open the index.html file in your preferred web browser (or simply click this [LINK](https://giorgio-magalini.github.io/Op-A/)). Connect an external MIDI controller for optimal functionality, or use the mouse controls provided within the application to begin exploring the different features.

## Video Tutorial
https://github.com/Giorgio-Magalini/Op-A/assets/83732019/2f7b3579-4951-4553-9de2-bbef2bedea3d


## Overview


<p align="center">
<img src="https://github.com/Giorgio-Magalini/Op-A/blob/main/img/signalFLow.jpg" width="550" heigth="auto">
</p>
Op-A is structured into three distinct sections:

### MIDI Transformer
It's the section which is responsible for bringing input MIDI messages generated thorugh an external keyboard (or playing the virtual keyboard with the mouse) to the arpeggiator. Thanks to the features developed in this section, playing Op-A beacomes enjoyable to play also for users without deep musical-theory knowledge. In fact swiching on the button near the text "Midi transform" it will become possible for the user to set the key and the mode (of that key) that he wants to follow during its performance. Setting a specific key (or a mode) makes some notes on the keyboard "right" and others "wrong". All of this is basically just achieved applying shifts on a circular buffer. Let’s see how this works analysing the scenario of the setting of a major key.


As you can see in the figure all major scales are characterized by a precise pattern of tones semitones (look at C maj).
If we associate 1 to C and we make steps of one semitone, the C maj scale can be represented by this array of integer (containing 7 numbers with a value from 1 to 12) → D is 3 because from C to D we have 2 steps (C C# D) etc…
Looking at the D major scale we can observe that to obtain any other major scale is enough to apply the same tones/semitones pattern but starting from a different fundamental note.
And how does it change its associated array? We can simply take the array associated to C maj and add 2 to all its elements (because from C to D we have 2 semitones) applying a mod 12 on the results. The modulo operation is because of the periodicity of musical notes.
In fact, C# is 14 but going an octave lower is also 2, and so we decided to keep 12 as the maximum value and move C# at the beginning (applying a circular shift). 

Let’s see now how to use these array in order to build a quantized keyboard.
If we consider that the user can play all the notes from C to B with including the accidentals, the array of all the possible inputs is an array going from 1 to 12. But we have seen that C maj, it’s characterized by only 7 notes. Let’s extend the array associated to C major in order to have 12 values (replicating the neighbor value where we don’t have half steps in the scale). If we put the array of inputs on X-axis and the extended array of C major on Y – axis we finally obtain a quantized keyboard (for C maj).
Now for example if I play C# the midi note sent to the next bolck of the program flow will be actually a C and so on for the others notes.

This working principle can also be combined with the theory of modes of a scale, to impose not only a key but one of its modes too. To conclude, the user, even if he doesn’t know anything about musical theory, will be able to play the third mode of G# major or any other key-mode pair!

### Arpeggiator 
The Arpeggiator is the central feature of Op-A. It takes as input the MIDI messages generated and processed in the MIDI Transformer section. To be more precise, when an input MIDI message arrives to the arpeggiator, a ball associated to the frequency of that MIDI signal is generated inside a rotating exagon. The whole scene is built in a physical environment (implemented using the library Matter.js) which try to model the physic of the real world. Each ball will be therefore subjected to gravity, friction etc. The user can interfere with the balls movement only using the 3 knobs placed alongside the screen where the exagon is contained:

   - **Knob Controls:**
     - Gravity: to change the value of the gravity which affects the balls
     - Speed: to spin the exagon in one verse or the other at different velocities
     - Aperture: to open the walls of the exagons at different angles, allowing the balls inside to come out.
   
Whenever a ball touch a wall of the rotating exagon, it will be generated an output MIDI message containing some informations of that ball, like its frequency (and so the note associated to that ball) and its speed (used as veolcity of the note to be played). Basically the arpeggiator tells to an hypothetic instrument to play that note every time the ball hit the wall. Selecting (in the bottom-left corner of the screnn) a specific "MIDI Output Device", these MIDI messages can be captured for example by a DAW which can use them to generate sound through whatever VST instrument. However this is a stand-alone application and can be used also without any DAW. In fact it's been implemented a sound generator module which will play the MIDI messages previously generated.
 
### Sound Generator
The Sound Generator section (implemented with Tone.js), takes as input the MIDI messages sent by the arpeggiator and makes them perceivable by the user. This section will allow to the user to make a little of sound design until the output sound will reflect its taste. In fact, in Op-A there is the possibility to select the type of the oscillator and also which effects putting on top of it. The oscillator type can be chosen between 6 different options:
   - **Oscillator types:**
     - 1: Sinusoidal oscillator characterized by short attack and decay (adapt to reproduce percussive sounds)
     - 2: Triangular oscillator characterized by short attack and decay (adapt to reproduce percussive sounds)
     - 3: Sinusoidal oscillator characterized by longer attack and decay
     - 4: Triangular oscillator characterized by longer attack and decay
     - rnd: An oscillator (triangular or sinusoidal) whose envelope parameters (attack and decay) are randomly set everytime the option "rnd" is clicked by the user 
     - rnd 2: Sinusoidal oscillator whose envelope parameters (attack and decay) are randomly set everytime a ball generated into the rotating exagon hit the wall

Instead, the effects stack include reverb, distortion, chorus, and flanger and by default are all deactivated, but clicking on the name of one of them this will be applied to the oscillator proportionally to the quantity set by the slider nearby.

## Features

- Seamless integration with external MIDI controllers for a more immersive experience.
- Mouse controls are available for users who do not have access to external MIDI devices.
- Intuitive user interface designed for ease of use and exploration.
- Dynamic visual elements complement the audio experience, enhancing engagement and creativity.

## Compatibility

Op-A has been tested on Chrome version 123.0.6312.106 (Official Build) (64-bit) for CSS compatibility.



## Credits

Op-A was developed by Alessandro Manattini, Giorgio Magalini, Mattia Montanari as a project for Advanced Coding Tools And Methodologies at Politecnico di Milano (academic year 2023/2024).
