var Button = function Button() {
	var x,y;
	var w,h;
	var txt;
	var over;

	this.init = function(t, tx, ty, tw, th) {
		txt = t;
		x = tx;
		y = ty;
		w = tw;
		h = th;
		over = false;
	};

	this.draw = function(ctx) {
		var fs = h/2;
		var index  = 5;
		var font = 8;
		if (over) {
			index = 3;
			font = 4
		}
		drawBox(ctx, index, x, y, w, h);
		writeMessage(ctx, txt, font, x + (w-fs*txt.length)/2, y + fs/2, fs);
	};

	this.check = function(tx, ty) {
		if (tx > x && tx < x+w && ty > y && ty < y+h) {
			over = true;
			return true;
		}
		over = false;
		return false;
	};
}