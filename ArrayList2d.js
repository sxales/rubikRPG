var ArrayList2d = function ArrayList2d() {
	var array = new Array();
	var _width, _height;

	this.init = function(width, height) {
		_width = width;
		_height = height;

		array = new Array(width);
		for (var i = 0; i < width; i++) {
			array[i] = new Array(height);
			for (var j = 0; j < height; j++) {
				array[i][j] = null;
			}
		}
	};

	this.set = function(X,Y, data) {
		if (X < _width && Y < _height) {
			array[X][Y] = data;
		}
		return array[X][Y];
	};

	this.get = function(X,Y) {
		if (X < _width && Y < _height) {
			return array[X][Y];
		}
	};

	this.getWidth = function() {
		return _width;
	};

	this.getHeight = function() {
		return _height;
	};
}