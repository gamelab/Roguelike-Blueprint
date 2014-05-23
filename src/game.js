//Initialise the Kiwi Game. 
var gameOptions = {
	width: 780,
	height: 640
}

var game = new Kiwi.Game('content', 'RoguelikeGame', null, gameOptions);


//Add all the States we are going to use.
game.states.addState(Preloader);
game.states.addState(LoadingState);
game.states.addState(IntroState);
game.states.addState(PlayState);


//Switch to/use the Preloader state. 
game.states.switchState("Preloader");