var Game = function Game() {
	var bgCanvas, spriteCanvas, bgContext, spriteContext, menuCanvas, menuContext;
	var stage = new Stage();
	//var overworld = new OverWorld();
	var currentScene;
	//var cursor = new Cursor();
	var SCREENRATIO = .85;


	this.init = function() {
		this.bgCanvas = document.getElementById('background');
		this.spriteCanvas = document.getElementById('sprite');

		width = this.spriteCanvas.width;
		height = this.spriteCanvas.height;

		window.addEventListener("keydown", function(evt) { currentScene.keydown(evt); }, false);
		this.spriteCanvas.addEventListener("mousedown", function(evt) {
			currentScene.mousedown(evt);
		}, false);
		this.spriteCanvas.addEventListener("mouseup", function(evt) {
			currentScene.mouseup(evt);
		}, false);
		this.spriteCanvas.addEventListener("moustout", function(evt) {
			currentScene.mouseout(evt);
		}, false);
		this.spriteCanvas.addEventListener("mousemove", function(evt) {
			currentScene.mousemove(evt);
		}, false);
		this.spriteCanvas.addEventListener("touchstart", function(evt) {
			currentScene.mousedown(evt);
		}, false);
		this.spriteCanvas.addEventListener("touchend", function(evt) {
			currentScene.mouseup(evt);
		}, false);
		this.spriteCanvas.addEventListener("touchcancel", function(evt) {
			currentScene.mouseout(evt);
		}, false);
		this.spriteCanvas.addEventListener("touchmove", function(evt) {
			currentScene.mousemove(evt);
		}, false);
		this.spriteCanvas.addEventListener("contextmenu", function(evt) { evt.preventDefault(); }, false);

		if (this.bgCanvas.getContext && this.spriteCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.spriteContext = this.spriteCanvas.getContext('2d');

			_height = window.innerHeight;
			_width = _height*9/16;

			this.spriteCanvas.width = _width;
			this.spriteCanvas.height = _height;

			this.bgCanvas.width = _width;
			this.bgCanvas.height = _height;

			this.bgContext.drawImage(resourceRepository.background, 0, _height*SCREENRATIO, _width, _height*(1-SCREENRATIO));

			stage.init(_width, _height);
			currentScene = stage;

			return true;
		}
		return false;
	};

	this.draw = function() {
		var ctx = this.spriteContext;
		currentScene.draw(ctx);
	};

	this.update = function() {
		currentScene.update();
	};

	// Start the animation loop
	this.start = function() {
		animate();
	};
}
