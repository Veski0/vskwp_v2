
The goal of the program is to use parsing to analyse waves in an effort to
determine whether or not the current wave conditions are safe for the vessel.

The program is capable of taking in Vessel Data and Wave Data and using the
principles of linguistic parsing, as might be found in a programming language,
to determing whether or not the currenct wave conditions are safe for the
vessel by tokenising the Wave Data into a sentence and parsing that sentence
with a Parser that has been generated to fit the needs of a specific vessel.
The program outputs either one or two things. In all cases, the program
outputs a simple boolean result which indicates whether or not the current
wave conditions are safe for the vessel and also, in the event that the
current wave conditions are not safe for the vessel, a human-readable sentence
which aims to express to the user why the wave current wave conditions are not
safe.

- Key to the success of the project is my ability to develop the project
effectively - and therefore the program should consist of independently
operable modules which can be developed, modified, or configured independently
of one another.

- Key to the success of the project is the testability of the program; unless
the program can be evaluated it cannot be said to work with any degree of
certainty. With this in mind it must be possible to programmatically test the
program, both in terms of the validity of the code and in terms of the overall
performance of the algorithms used to perform the various tasks that the
program goes through. Validity testing can be handled by unit testing
the program. In order to test the performance of the program overall I will
write the program such that its algorithmic choices are available on the
command line; allowing me to test the program by means of a script that can
run the program using various algorithmic choices in order to determine the
best output.

- In order to accomplish swapping out various parts of the program to facilitate
testing, we implement four Units. These Units have been chosen in such a way to
allow the program to support swapping of algorithms and to operate in several
different modes. Units are built as shell functions which exist only to call
other functions and feed their output on. This allows the same format to exist
for every iteration of the program.

- As arguments to these four units are passed four moving parts which must agree
with one another. For example, the VesselConstraintGenerator,
