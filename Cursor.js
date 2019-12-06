var Cursor = function Cursor() {
	var x = 0,y = 0;

	this.update = function(evt) {
		this.x = evt.clientX;
		this.y = evt.clientY;
	};
}