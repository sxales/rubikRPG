var resourceRepository = new function() {
	// Define images
	this.background = new Image();

	this.tileSheet = new Image();
	this.spriteSheet = new Image();

	this.font = new Image();

	this.gameover = new Audio();
	this.levelup = new Audio();
	this.cleared = new Audio();
	this.spawn = new Audio();
	this.acquire = new Audio();
	this.boom = new Audio();

	// Ensure all images have loaded before starting the game
	var numResources = 10;
	var numLoaded = 0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numResources) {
			window.init();
		}
		else document.getElementById("loading").innerHTML = "loading . . . "+Math.round((numLoaded/numResources)*100)+"%";
	}

	this.gameover.oncanplay = function() {
		imageLoaded();
	}
	this.levelup.oncanplay = function() {
		imageLoaded();
	}
	this.cleared.oncanplay = function() {
		imageLoaded();
	}
	this.spawn.oncanplay = function() {
		imageLoaded();
	}
	this.acquire.oncanplay = function() {
		imageLoaded();
	}
	this.boom.oncanplay = function() {
		imageLoaded();
	}
	this.background.onload = function() {
		imageLoaded();
	}
	this.tileSheet.onload = function() {
		imageLoaded();
	}
	this.spriteSheet.onload = function() {
		imageLoaded();
	}
	this.font.onload = function() {
		imageLoaded();
	}

 	// Set images src
	this.background.src = "images/background.png";

	this.tileSheet.src = "images/tiles.png";
	this.spriteSheet.src = "images/sprites.png";
	this.font.src = "images/font1.png";

	this.gameover.src = "sounds/gameover.wav";
	this.levelup.src = "sounds/levelup.wav";
	this.cleared.src = "sounds/cleared.wav";
	this.spawn.src = "sounds/heal.wav";
	this.acquire.src = "sounds/get.wav";
	this.boom.src = "sounds/boom.wav";

	this.gameover.load();
	this.levelup.load();
	this.cleared.load();
	this.spawn.load();
	this.acquire.load();
	this.boom.load();
}