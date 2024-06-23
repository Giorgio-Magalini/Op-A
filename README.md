# Op-A

Op-A is a web application designed to provide an immersive and interactive experience with sound and visuals. 
It exploit the randomness of the unpredictable movements of physical bodies to generate MIDI signals.
Op-A in simple words can be considered an arpeggiator, inspired by the "tombola" function of the OP-1 synthesizer, which, just like the OP-1 makes it possible for the user to create unpredictable and evolving musical sequences adding an element of surprise and creativity to its musical explorations. 

## Getting Started

To get started with Op-A, clone the repository and open the index.html file in your preferred web browser (or simply click this [LINK](https://giorgio-magalini.github.io/Op-A/)). Connect an external MIDI controller for optimal functionality, or use the mouse controls provided within the application to begin exploring the different features.

## Overview


<p align="center">
<img src="https://github.com/Giorgio-Magalini/Op-A/blob/main/img/signalFLow.jpg" width="550" heigth="auto">
</p>
Op-A is structured into three distinct sections:

### MIDI Transformer
It's the section which is responsible for bringing input MIDI messages generated thorugh an external keyboard (or playing the virtual keyboard with the mouse) to the arpeggiator. Thanks to the features developed in this section, playing Op-A beacomes enjoyable to play also for users without deep musical-theory knowledge. In fact swiching on the button near the text "Midi transform" it will become possible for the user to set the key and the mode (of that key) that he wants to follow during its performance. Setting a specific key (or a mode) makes some notes on the keyboard "right" and others "wrong". Let's make an example to make things clearer. When you choose to play in the key of G major, every time you want to play an F you will actually have to play an F#. Thanks to this feature even if the user want to play in G major, whenever he will play an F this will be automatically transposed to an F#. Obviously the same is valide for the modes. To say it in simpler words, enabling the MIDI transformer it's impossible to play together notes that sound bad! Notice that it's also possible to change key and mode even if some balls have already been generated. All the balls will be in fact analyzed transposing the ones associated to notes that have become "wrong" during the key (or mode) change.

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
