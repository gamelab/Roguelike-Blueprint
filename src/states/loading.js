/**
* The Loading State is going to be used to load in all of the in-game assets that we need in game.
*/

/**
* Since we want to use the custom Kiwi.JS loader with the bobing kiwi/html5 logo and everything. We need to extend the KiwiLoadingScreen State.
* The KiwiLoadingScreen State is an extentsion of a normal State but it has some custom code to handle the loading/bobbing/fading of all the items, so if you override a method (like the preload) for example just make sure you call the super method.
*
* The parameters we are passing into this method are as ordered.
* 1 - name {String} Name of this state.
* 2 - stateToSwitch {String} Name of the state to switch to AFTER all the assets have loaded. Note: The state you want to switch to should already have been added to the game.
* 3 - subfolder {String} The folder that the loading graphics are located at.
*/
var LoadingState = new KiwiLoadingScreen('LoadingState', 'IntroState', 'assets/img/loading/');
/**
* This preload method is responsible for preloading all your in game assets.
* @method preload
* @private
*/
LoadingState.preload = function () {
	 KiwiLoadingScreen.prototype.preload.call(this);

    this.addAudio( 'loop', 'assets/sound/105197__cormi__monks-04.mp3' );
    this.addAudio('swordStrike', 'assets/sound/77611__joelaudio__sfx-attack-sword-001.wav');
    this.addAudio('boltStrike', 'assets/sound/65734__erdie__bow02.wav');

    this.addSpriteSheet('toggleBtn', 'assets/img/buttons/toggleBtn.png', 100, 100);
	this.addSpriteSheet('randomBtn', 'assets/img/buttons/randomBtn.png', 100, 100);
	this.addSpriteSheet('tiles', 'assets/img/tiles_3.png', 32, 32);
	this.addSpriteSheet('actors', 'assets/img/actors_4.png', 32, 32);

	this.addSpriteSheet('heart', 'assets/img/heart_8x8.png', 16, 16);
	this.addSpriteSheet('speed', 'assets/img/speed_3.png', 32, 32);
	this.addSpriteSheet('sword', 'assets/img/sword.png', 32, 32);
	this.addSpriteSheet('armour', 'assets/img/armour.png', 32, 32);
	this.addSpriteSheet('loot', 'assets/img/loot_2.png', 32, 32);
	this.addSpriteSheet('extraLoot', 'assets/img/loot_2.png', 32, 32);
	this.addSpriteSheet('traps', 'assets/img/traps_2.png', 32, 32);
	this.addSpriteSheet('shot', 'assets/img/shot_2.png', 32, 32);

};
