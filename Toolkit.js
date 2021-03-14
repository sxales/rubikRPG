	var FONTSIZE = 48;
	this.writeMessage = function(ctx, m, t, x, y, s) {
		var _m = ""+m;
		var _m = _m.toLowerCase();
		if (x+ _m.length*s > _width) x = _width-_m.length*s;
		else if (x < 0) x=0;
		for(var i=0; i<_m.length; i++) {
			if (_m.charCodeAt(i) <= 126 && _m.charCodeAt(i) >= 32) ctx.drawImage(resourceRepository.font, FONTSIZE*(_m.charCodeAt(i)-32)+1, FONTSIZE*t+1, FONTSIZE-2, FONTSIZE-2, x+(i*s),y,s,s);
			else ctx.drawImage(resourceRepository.font, FONTSIZE*(41 /*question mark*/)+1, FONTSIZE*t+1, FONTSIZE, FONTSIZE, x+(i*s),y,s,s);
		}
	};

	this.drawBox = function(ctx, c, x, y, w, h) {//color, x, y, width, height
		ctx.drawImage(resourceRepository.tileSheet, 64*(c%8), 64*Math.floor(c/8), 16, 16, x, y, 16, 16);//top left corner
		ctx.drawImage(resourceRepository.tileSheet, 64*(c%8), 64*Math.floor(c/8)+48, 16, 16, x, (y+h)-16, 16, 16);//bottom left corner
		ctx.drawImage(resourceRepository.tileSheet, 64*(c%8)+48, 64*Math.floor(c/8), 16, 16, (x+w)-16, y, 16, 16);//top right corner
		ctx.drawImage(resourceRepository.tileSheet, 64*(c%8)+48, 64*Math.floor(c/8)+48, 16, 16, (x+w)-16, (y+h)-16, 16, 16);//bottom right corner

		ctx.drawImage(resourceRepository.tileSheet, 64*(c%8)+16, 64*Math.floor(c/8), 16, 16, x+15, y, w-30, 16);//top
		ctx.drawImage(resourceRepository.tileSheet, 64*(c%8)+16, 64*Math.floor(c/8)+48, 16, 16, x+15, (y+h)-16, w-30, 16);//bottom
		ctx.drawImage(resourceRepository.tileSheet, 64*(c%8), 64*Math.floor(c/8)+16, 16, 16, x, y+16, 15, h-30);//left
		ctx.drawImage(resourceRepository.tileSheet, 64*(c%8)+48, 64*Math.floor(c/8)+16, 16, 16, (x+w)-16, y+15, 16, h-30);//right

		ctx.drawImage(resourceRepository.tileSheet, 64*(c%8)+16, 64*Math.floor(c/8)+16, 16, 16, x+14, y+15, w-28, h-30);//fill
	};

	this.zeroFill = function(n,p) {
		var s = ""+n;
		while (s.length<p) {
			s = "0"+s;
		}
		return s;
	};