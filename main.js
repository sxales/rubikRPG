/**
 * requestAnim shim layer by Paul Irish
 * Finds the first API that works to optimize the animation loop,
 * otherwise defaults to setTimeout().
 */
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame   ||
	  window.webkitRequestAnimationFrame ||
	  window.mozRequestAnimationFrame    ||
	  window.oRequestAnimationFrame      ||
	  window.msRequestAnimationFrame     ||
	  function(/* function */ callback, /* DOMElement */ element){
		window.setTimeout(callback, 1000 / 60);
	  };
})();

var game = new Game();
var lastTick = Date.now();

function animate() {
	while (Date.now() - lastTick >= 250) {
		game.update();
		lastTick += 250; //Date.now();
	}
	game.draw();
	requestAnimFrame( animate );
};

function init() {
	if(game.init()) game.start();
}