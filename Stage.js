var Stage = function Stage() {
	var state;
	var _frame = 0;
	var _tutorial = 0;
	var bonus = -1;
	var stage = 0;
	var oldbalance = 0, newbalance = 0;
	var CHESTVALUE = 50;
	var WAITING = -1, INPLAY = 0, FAILED = 1, SUCCESS = 2, PAUSED = 3; //states
	var BLUE = 5, GRAY = 8, GREEN = 4, RED = 3, SUPER = 2, WHITE = 1, TEAL = 5, YELLOW = 6, PINK = 7, LOGO = 0; //font colors
	var FONTSIZE = 40;
	var BASIC = 1,  INTERMEDIATE = 2, ADVANCED = 3, BOSS = 4, MAGE = 5, CHEST = 6, EMPTY = -1; //enemy types
	var NORMAL = 0, PETRIFIED = 1; //status effects
	var cleared = false;
	var model = new ArrayList2d();
	var player = new Entity();
	var displayedxp = 0;
	//var cursor = new Cursor();
	var messages = new Array();
	var SCREENRATIO = .85;
	var MENURATIO = .05;
	var mages = new Array();
	var statuseffects = new Array();
	var chests = new Array();
	var stageboss = new Point();
	var defeated = new Array();
	var injured = new Array();
	var _width, _height;
	var mute = false;
	var volume = .2;
	var locked = true;
	var btndown;
	var MINATK = 5; MINDEF = 5, MINSPD = 1; MINRCV = 1, MINHP = 12;
	var baseatk = 5, basedef = 5, basespd = 1, basercv = 1, basehp = 12;
	var PENALTYMIN = .05, PENALTYMAX = .15;
	var BASICRATIO = 3/5, INTRATIO = 1, ADVRATIO = 8/5, BOSSRATIO = 2, MAGERATIO = 7/5;
	var XPRATE = 1;
	var TRAPPEDCHESTDAMAGE = .75;
	var atkloss = 0, defloss = 0, spdloss = 0, rcvloss = 0;
	var subscribers = new Array();

	this.subscribe = function(s) {
		subscribers.push(s);
	};

	this.unsubscribe = function(s) {
		for (var i = 0; i<subscribers.length; i++) {
			if (subscribers[i] == s) {
				subscribers.splice(i);
				break;
			}
		}
	};

	this.notify = function(b) {
		for (var i = 0; i<subscribers.length; i++) {
			subscribers[i].call(this,b);
		}
	};

	this.init = function(w,h) {
		_height = h;
		_width = w;

		this.setVolume(volume);

		displayedxp = 0;
		oldbalance = 0;
		player = {hp: MINHP, currenthp: MINHP, xp: 1, currentxp : 0, atk: MINATK, def: MINDEF, spd: MINSPD, rcv: MINRCV, act: 99, spl: 0};

		this.reset();
	};

	this.keydown = function(evt) {
		if (evt.key == "p") {
			if (state == INPLAY) {
				state = PAUSED;
			}
		}
		else if (evt.key == "r") {
			displayedxp = 0;
			oldbalance = 0;
			newbalance = 0;
			stage = 0;
			player = {hp: MINHP, currenthp: MINHP, xp: 1, currentxp : 0, atk: MINATK, def: MINDEF, spd: MINSPD, rcv: MINRCV, act: 99, spl: 0};
			this.reset();
		}
		else if (evt.key == "m") {
			mute = !mute;
		}
	};

	this.mousedown = function(evt) {
		if (evt.clientY < _height*SCREENRATIO) {
			if (evt.button == 0) {
				btndown = new Date();
			}
		}
	};

	this.mouseup = function(evt) {
		if (evt.clientY < _height*SCREENRATIO) {
			if (evt.button == 0) {
				var btnup = new Date();
				if (btndown > 0 && btnup - btndown >= 500) this.rightClick(evt.clientX, evt.clientY);//long press
				else this.click(evt.clientX, evt.clientY); //left click
				btndown = 0;
			}
			else this.rightClick(evt.clientX, evt.clientY);
		}
	};

	this.mouseout = function(evt) {
	};

	this.mousemove = function(evt) {
	};

	this.touchstart = function(evt) {
		if (evt.touches[0].pageY < _height*SCREENRATIO) {
			btndown = new Date();
		}
	};

	this.touchend = function(evt) {
		if (evt.touches[0].pageY < _height*SCREENRATIO) {
			var btnup = new Date();
			if (btndown > 0 && btnup - btndown >= 500) this.rightClick(evt.touches[0].pageX, evt.touches[0].pageY);//long press
			else this.click(evt.touches[0].pageX, evt.touches[0].pageY); //left click
			btndown = 0;
		}
	};

	this.touchcancel = function(evt) {
	};

	this.touchmove = function(evt) {
	};

	this.rightClick = function(inputX, inputY) {
		if (state == INPLAY && player.spl >= 100) {
			var width = _width / model.getWidth();
			var height = (_height*SCREENRATIO) / model.getHeight();
			var x = Math.floor(inputX/width);
			var y = Math.floor(inputY/height);
			var resetspl = false;
			for (var i=-1; i<=1; i++) {
				for (var j=-1; j<=1; j++) {
					if (x+i >= 0 && x+i < model.getWidth() && y+j >= 0 && y+j < model.getHeight() && model.get(x+i,y+j).type != EMPTY && model.get(x+i,y+j).type != CHEST) {
						resetspl = true;
						//give status effect
						var temp = model.get(x+i, y+j);
						temp.statuseffect = PETRIFIED;
						temp.sts = 49; //10 second counter
						model.set(x+i, y+j, temp);
						//add them to the tracker
						var p = new Point();
						p = {x: x+i,y: y+j};
						statuseffects.push(p);
					}
				}
			}
			if (resetspl) player.spl = 0;
		}
		//else do nothing
	};

	this.click  = function(inputX, inputY) {
		if (state == WAITING) {
			oldbalance = newbalance;
			state = INPLAY;
		}
		else if (state == PAUSED) state = INPLAY;
		else if (state == INPLAY) {
			var width = _width / model.getWidth();
			var height = (_height*SCREENRATIO) / model.getHeight();
			var x = Math.floor(inputX/width);
			var y = Math.floor(inputY/height);
			var enemy = model.get(x,y);
			if ((enemy.type == BASIC || enemy.type == INTERMEDIATE || enemy.type == ADVANCED || enemy.type == MAGE || (enemy.type == BOSS && !locked)) && enemy.statuseffect != PETRIFIED){
				var atk = player.atk;
				var spd = enemy.spd;

				var d = Math.round(Math.random()*atk/4+(3*atk/4))*(3/2);
				if (Math.floor(Math.random()*32) === 0) {
					//critical hit
					d *= 2;
					var m = new Message();
					var fs = width/3;
					var txt = "critical hit";
					m = {type: GREEN, message: txt, x: inputX-(fs*txt.length/2), y: inputY, s: fs, duration: 1, tick: 0, delay: 0};
					messages.push(m);
				}
				else if (Math.floor(Math.random()*256/spd) === 0) {
					//miss
					d = 0;
					var m = new Message();
					var fs = width/3;
					var txt = "miss";
					m = {type: WHITE, message: txt, x: inputX-(fs*txt.length/2), y: inputY, s: fs, duration: 1, tick: 0, delay: 0};
					messages.push(m);
				}
				enemy.currenthp -= Math.round(d);

				if (!this.isInjured(x,y)) {
					var p = new Point();
					p = {x: x,y: y};
					injured.push(p);
				}

				var m = new Message();
				var fs = width/3;
				m = {type: GREEN, message:Math.round(d), x: inputX+fs*Math.random(), y: inputY-fs*Math.random(), s: fs, duration: 1, tick: 0, delay: 0};
				messages.push(m);

				if (enemy.currenthp > 0) {
					//enemy attack
					var def = player.def;
					var atk = enemy.atk;

					var d = Math.round(atk - def/2*(Math.random()*50+100)/256) + 1;
					if (enemy.type == BOSS) d += d * ((56-defeated.length)/56); //boss modifier

					var playerhp = ""+player.hp;
					var fs = _height*(1-SCREENRATIO) / 5;
					var margin = fs;
					var buffer = fs/2;
					var position = _height*SCREENRATIO + margin;
					var offset = _width*.6;
					var l = offset-margin-buffer-(fs*3);

					var spd = player.spd;

					if (Math.floor(Math.random()*256/spd) === 0) {
						//miss
						d = 0;
						var m = new Message();
						var txt = "dodge";
						var startx = (l - txt.length*fs)/2 + fs*3 + buffer + margin;
						m = {type: WHITE, message: txt, x: startx, y: position, s: fs, duration: 1, tick: 0, delay: 0};
						messages.push(m);
					}

					if (d > 0) {
						var m = new Message();
						var dam = ""+Math.round(d);
						var percent = player.currenthp/player.hp;
						var startx = offset - (1-percent)*l - dam.length*fs;
						m = {type: RED, message: Math.round(d), x: startx, y: position, s: fs, duration: 1, tick: 0, delay: 0};
						messages.push(m);

						player.spl += Math.round((d/(player.hp*3))*100);
						if (player.spl > 100) player.spl = 100;
					}

					player.currenthp -= Math.round(d);

					if (player.currenthp <= 0) {
						player.currenthp = 0;
						//dead
						atkloss = Math.round(player.atk * (PENALTYMIN + Math.random() * (PENALTYMAX - PENALTYMIN))) + 1;
						if (player.atk - atkloss < MINATK) atkloss = player.atk - MINATK;

						defloss = Math.round(player.def * (PENALTYMIN + Math.random() * (PENALTYMAX - PENALTYMIN))) + 1;
						if (player.def - defloss < MINDEF) defloss = player.def - MINDEF;

						spdloss = Math.round(player.spd * (PENALTYMIN + Math.random() * (PENALTYMAX - PENALTYMIN))) + 1;
						if (player.spd - spdloss < MINSPD) spdloss = player.spd - MINSPD;

						rcvloss = Math.round(player.rcv * (PENALTYMIN + Math.random() * (PENALTYMAX - PENALTYMIN))) + 1;
						if (player.rcv - rcvloss < MINRCV) rcvloss = player.rcv - MINRCV;

						if (!mute) resourceRepository.gameover.play();
						_frame = 0;
						state = 1;
					}
				}
				else {
					if (enemy.type == BOSS) {
						//boss defeated
						enemy.type = CHEST;
						enemy.act = 0;
						var p = new Point();
						p = {x: x,y: y};
						chests.push(p);
						cleared = true;
					}
					else if (enemy.type == MAGE) {
						//mage defeated
						for (var i=0; i<mages.length; i++) {
							if (mages[i].x == x && mages[i].y == y) mages.splice(i,1);
						}
						enemy.type = EMPTY;
					}
					else if (enemy.type == ADVANCED) {
						locked = false;
						enemy.type = EMPTY;
					}
					else enemy.type = EMPTY;

					for (var i=0; i<injured.length; i++) {
						if (injured[i].x == x && injured[i].y == y) injured.splice(i,1);
					}

					if (Math.floor(Math.random()*16) == 0) {
						enemy.type = CHEST;
						enemy.act = 0;
						var p = new Point();
						p = {x: x,y: y};
						chests.push(p);
					}
					else {
						var p = new Point();
						p = {x: x,y: y};
						defeated.push(p);
					}

					player.currentxp+= enemy.xp;
				}
			}
			else if (enemy.type == CHEST) {
				//opened chest
				enemy.type = EMPTY;
				for (var i=0; i<chests.length; i++) {
					if (chests[i].x == x && chests[i].y == y) chests.splice(i,1);
				}
				var p = new Point();
				p = {x: x,y: y};
				defeated.push(p);
				var n = Math.floor(enemy.act%4);
				if (n == 0) {
					//x5
					var g = CHESTVALUE*5;
					g = Math.round(g*.9)+Math.round(Math.random()*(g*.2));
					newbalance += g;
					var m = new Message();
					var txt = ""+g+" gld";
					var fs = Math.floor(_width/(txt.length+1));
					var starty = (_height-fs)/2;
					var startx = (_width-(fs*txt.length))/2;
					m = {type: YELLOW, message: txt, x: startx, y: starty, s: fs, duration: 2, tick: 0, delay: 0};
					messages.push(m);
				}
				else if (n == 1) {
					//x2
					var g = CHESTVALUE*2;
					g = Math.round(g*.9)+Math.round(Math.random()*(g*.2));
					newbalance += g;
					var m = new Message();
					var txt = ""+g+" gld";
					var fs = Math.floor(_width/(txt.length+1));
					var starty = (_height-fs)/2;
					var startx = (_width-(fs*txt.length))/2;
					m = {type: YELLOW, message: txt, x: startx, y: starty, s: fs, duration: 2, tick: 0, delay: 0};
					messages.push(m);
				}
				else if (n == 2) {
					//x1
					var g = CHESTVALUE;
					g = Math.round(g*.9)+Math.round(Math.random()*(g*.2));
					newbalance += g;
					var m = new Message();
					var txt = ""+g+" gld";
					var fs = Math.floor(_width/(txt.length+1));
					var starty = (_height-fs)/2;
					var startx = (_width-(fs*txt.length))/2;
					m = {type: YELLOW, message: txt, x: startx, y: starty, s: fs, duration: 2, tick: 0, delay: 0};
					messages.push(m);
				}
				else {
					//trapped chest
					var m = new Message();
					var txt = "trapped chest";
					var fs = Math.floor(_width/(txt.length+1));
					var starty = (_height-fs)/2;
					var startx = (_width-(fs*txt.length))/2;
					m = {type: RED, message: txt, x: startx, y: starty, s: fs, duration: 2, tick: 0, delay: 0};
					messages.push(m);

					if (!mute) resourceRepository.boom.play();

					var d = Math.floor(player.currenthp*TRAPPEDCHESTDAMAGE);

					var m = new Message();
					var playerhp = ""+player.hp;
					var dam = ""+Math.round(d);
					var fs = _height*(1-SCREENRATIO) / 5;
					var margin = fs;
					var buffer = fs/2;
					var position = _height*SCREENRATIO + margin;
					var offset = _width*.6;
					var l = offset-margin-buffer-(fs*3);
					var percent = player.currenthp/player.hp;
					var startx = offset - (1-percent)*l - dam.length*fs;
					m = {type: RED, message: Math.round(d), x: startx, y: position+fs, s: fs, duration: 1, tick: 0, delay: 0};
					messages.push(m);

					player.currenthp -= Math.round(d);

					if (player.currenthp <= 0) {
						player.currenthp = 0;
						//dead
						if (!mute) resourceRepository.gameover.play();
						_frame = 0;
						state = FAILED;
					}
				}

				if (cleared) {
					if (!mute) resourceRepository.cleared.play();
					player.currenthp = player.hp;
					_frame = 0;
					state = SUCCESS;
				}
				else {
					if (!mute) resourceRepository.acquire.play();
				}
			}
			model.set(x, y, enemy);
		}
	};

	this.draw = function(ctx) {
		ctx.clearRect(0, 0, _width, _height);

		//draw the model
		var width = _width / model.getWidth();
		var height = (_height*SCREENRATIO) / model.getHeight();
		var index = 0;
		for (var i=0;i<model.getWidth(); i++) {
			for (var j=0; j<model.getHeight(); j++) {
				//var image = new Image();
				switch (model.get(i,j).type) {
					case BASIC:
						index = 23; //black
						break;
					case INTERMEDIATE:
						index = 5; //green
						break;
					case ADVANCED:
						index = 2; //gold
						break;
					case BOSS:
						index = 10; //blue
						break;
					case MAGE:
						index = 14; //purple
						break;
					case CHEST:
						index = 17; //brown
						break;
					default:
						index = 20; //gray
						break;
				}
				if (state == WAITING || state == PAUSED) index = ((i+j+_frame) << 1 )%16; //colorful waiting screen
				else if (model.get(i,j).statuseffect == PETRIFIED) index = 22;//dark gray
				ctx.drawImage(resourceRepository.tileSheet, 64*(index%8)+1, 64*Math.floor(index/8)+1, 64, 64, i*width, j*height, width, height);

				if (state == INPLAY && model.get(i,j).type != -1) { //add damamge animation
					index = 0; //red
					if (model.get(i,j).statuseffect == PETRIFIED) index = 21;//light gray
					var hppercent = (model.get(i,j).currenthp / model.get(i,j).hp);
					var offset = Math.floor(64*hppercent);
					//var offset = Math.floor((model.get(i,j).currenthp / model.get(i,j).hp)*64);
					if (offset < 64 && offset >= 0) ctx.drawImage(resourceRepository.tileSheet, 64*(index%8)+offset, 64*Math.floor(index/8)+1, 64-offset, 64, i*width+(width*hppercent), j*height, width-(width*hppercent), height);
				}
				if (state == INPLAY && locked) { //add lock and key sprites
					if (model.get(i,j).type == BOSS) ctx.drawImage(resourceRepository.spriteSheet, 0, 0, 64, 64, i*width + (width*.1),j*height + (height*.1),width*.8,height*.8);
					else if (model.get(i,j).type == ADVANCED) ctx.drawImage(resourceRepository.spriteSheet, 65, 0, 64, 64, i*width + (width*.1),j*height + (height*.1),width*.8,height*.8);
				}

			}
		}
		//draw countdown for mages
		if (state == INPLAY) {
			for(var i=0; i<mages.length; i++) {
				var mage = model.get(mages[i].x, mages[i].y);
				var fs = _width / model.getWidth() / 2;
				this.writeMessage(ctx, (9-Math.floor(mage.act/10)), WHITE, mages[i].x*(_width / model.getWidth()) + (fs/2), mages[i].y*((_height*SCREENRATIO) / model.getHeight()) + (fs/2), fs);
			}
		}

		//chest roulette
		if (state == INPLAY) {
			for(var i=0; i<chests.length; i++) {
				var chest = model.get(chests[i].x, chests[i].y);
				var fs = _width / model.getWidth() / 4;
				switch (Math.floor(chest.act%4)) {
					case 0:
						this.writeMessage(ctx, "x5", WHITE, chests[i].x*(_width / model.getWidth()) + (fs), chests[i].y*((_height*SCREENRATIO) / model.getHeight()) + (fs*3/2), fs);
						break;
					case 1:
						this.writeMessage(ctx, "x2", WHITE, chests[i].x*(_width / model.getWidth()) + (fs), chests[i].y*((_height*SCREENRATIO) / model.getHeight()) + (fs*3/2), fs);
						break;
					case 2:
						this.writeMessage(ctx, "x1", WHITE, chests[i].x*(_width / model.getWidth()) + (fs), chests[i].y*((_height*SCREENRATIO) / model.getHeight()) + (fs*3/2), fs);
						break;
					case 3:
						this.writeMessage(ctx, "bad", WHITE, chests[i].x*(_width / model.getWidth()) + (fs/2), chests[i].y*((_height*SCREENRATIO) / model.getHeight()) + (fs*3/2), fs);
						break;
				}
			}
		}

		//draw scoreboard
		//ctx.clearRect(0, (_height*SCREENRATIO), _width, (_height*(1-SCREENRATIO)));


		var fs = _height*(1-SCREENRATIO) / 6;
		var margin = fs;
		var buffer = fs/2;
		var position = _height*SCREENRATIO + margin;
		this.writeMessage(ctx, "hp", WHITE, margin, position, fs);
		this.writeMessage(ctx, "exp", WHITE, margin, position+(3*fs/2), fs);
		this.writeMessage(ctx, "spl", WHITE, margin, position+fs*3, fs);

		var offset = _width-margin-fs*7-buffer;
		this.writeMessage(ctx, "atk", WHITE, offset+margin, position, fs);
		this.writeMessage(ctx, "def", WHITE, offset+margin, position+fs, fs);
		this.writeMessage(ctx, "spd", WHITE, offset+margin, position+fs*2, fs);
		this.writeMessage(ctx, "rcv", WHITE, offset+margin, position+fs*3, fs);

		var l = offset - buffer*2 - (fs*3);
		var percent = player.currenthp/player.hp;
		var bezel = 2;

		//display hp bar
		//ctx.fillStyle = "#a6a6a6";
		//ctx.fillRect(margin+buffer+(fs*2), position, l, fs);
		ctx.strokeStyle="black";
		ctx.strokeRect(margin+buffer+(fs*3), position, l, fs);
		if (l*percent > bezel*2) {
			ctx.fillStyle="white";
			ctx.fillRect(margin+buffer+(fs*3), position, l*percent, fs); //light box
			if (percent <= .3 && _frame%2 == 0) ctx.fillStyle="#eb1c23"; //red
			else ctx.fillStyle="#940200"; //dark red
			ctx.fillRect(margin+buffer+(fs*3)+bezel, position+bezel, l*percent-bezel, fs-bezel); //shadow box
			if (percent <= .3 && _frame%2 == 0) ctx.fillStyle="#940200"; //dark red
			else ctx.fillStyle="#eb1c23"; //red
			ctx.fillRect(margin+buffer+(fs*3)+bezel, position+bezel, l*percent-bezel*2, fs-bezel*2); //inner box
		}
		//var hp = this.zeroFill(Math.round(player.currenthp), (""+player.hp).length);
		//this.writeMessage(ctx, hp, WHITE, margin+buffer+(fs*3)+l-(fs*hp.length), position, fs);
		//ticking xp
		if (++displayedxp > player.currentxp/player.xp*100) displayedxp = player.currentxp/player.xp*100;
		if (displayedxp >= 100) {
			player.currentxp -= player.xp;
			displayedxp = 0;
			this.levelup();
			if (!mute) resourceRepository.levelup.play();
		}
		percent = displayedxp/100;
		//display xp bar
		//ctx.fillStyle = "#a6a6a6";
		//ctx.fillRect(margin+buffer+(fs*2), position+(fs), l, fs);
		ctx.strokeStyle="black";
		ctx.strokeRect(margin+buffer+(fs*3), position+(3*fs/2), l, fs);
		if (l*percent > bezel*2) {
			ctx.fillStyle="white";
			ctx.fillRect(margin+buffer+(fs*3), position+(3*fs/2), l*percent, fs); //light box
			ctx.fillStyle="#3e701e"; //dark green
			ctx.fillRect(margin+buffer+(fs*3)+bezel, position+(3*fs/2)+bezel, l*percent-bezel, fs-bezel); //shadow box
			ctx.fillStyle="#6cc236"; //green
			ctx.fillRect(margin+buffer+(fs*3)+bezel, position+(3*fs/2)+bezel, l*percent-bezel*2, fs-bezel*2); //inner box
		}
		//special bar
		ctx.strokeStyle="black";
		ctx.strokeRect(margin+buffer+(fs*3), position+fs*3, l, fs);
		percent = player.spl/100;
		if (l*percent > bezel*2) {
			ctx.fillStyle="white";
			ctx.fillRect(margin+buffer+(fs*3), position+fs*3, l*percent, fs); //light box
			if (player.spl >= 100 && _frame%2 == 0) ctx.fillStyle="#9400D3"; //dark violet
			else ctx.fillStyle="#4B0082"; //indigo
			ctx.fillRect(margin+buffer+(fs*3)+bezel, position+fs*3+bezel, l*percent-bezel, fs-bezel); //shadow box
			if (player.spl >= 100 && _frame%2 == 0)	ctx.fillStyle="#4B0082"; //indigo
			else ctx.fillStyle="#9400D3"; //dark violet
			ctx.fillRect(margin+buffer+(fs*3)+bezel, position+fs*3+bezel, l*percent-bezel*2, fs-bezel*2); //inner box
		}

		this.writeMessage(ctx, player.atk, WHITE, offset+margin+buffer+(fs*3), position, fs);
		this.writeMessage(ctx, player.def, WHITE, offset+margin+buffer+(fs*3), position+fs, fs);
		this.writeMessage(ctx, player.spd, WHITE, offset+margin+buffer+(fs*3), position+(fs*2), fs);
		this.writeMessage(ctx, player.rcv, WHITE, offset+margin+buffer+(fs*3), position+(fs*3), fs);

		//draw messages
		if (state == INPLAY) {
			for(var i=0; i<messages.length; i++) {
				if (messages[i].delay <= 0) {
					if (messages[i].type < 0) {
						ctx.drawImage(messages[i].message, 512, 0, 64, 64, messages[i].x, messages[i].y, messages[i].w, messages[i].h);
					}
					else {
						var move = _height/350;
						messages[i].y -= move;
						this.writeMessage(ctx, messages[i].message, messages[i].type, messages[i].x, messages[i].y, messages[i].s);
					}

					if (messages[i].ticks++ >= messages[i].duraction) messages.splice(i--, 1); //remove
				}
			}
		}

		//draw logo
		if (state == WAITING) {
			var w = _width*.9;
			var h = w * .8
			var margin = _width*.05;
			ctx.drawImage(resourceRepository.box, margin, _height*SCREENRATIO/2 - h/2, w, h);
			ctx.drawImage(resourceRepository.logo, margin, _height*SCREENRATIO/2 - h/2 - w*.29, w, w*.19);

			var txt = "click to begin";
			if (stage > 0) txt = "click to continue";
			var fs = _width / (txt.length+2);
			if (Math.round(_frame/5)% 2 == 1) this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, _height*SCREENRATIO/2 + h/2 + fs*2, fs);

			if (stage == 0) {
				//tutorial
				fs = Math.floor(w/20);
				var buffer = fs/2;
				var starth = _height*SCREENRATIO/2 - h/2;
				if (tutorial < 50) {
					var txt = "how to play";
					this.writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(1/2)), fs);
					var txt = "click to attack";
					this.writeMessage(ctx, txt, PINK, (_width-fs*txt.length)/2, starth + (fs*(2)), fs);

					var txt = "when the SPL bar is";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(7/2)), fs);
					var txt = "full long-press";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(9/2)), fs);
					var txt = "click to petrify";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(11/2)), fs);
					var txt = "nearby enemies";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(13/2)), fs);

					var txt = "Item Chest";
					this.writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(8)), fs);

					var index = 17;//brown
					ctx.drawImage(resourceRepository.tileSheet, 64*(index%8)+1, 64*Math.floor(index/8)+1, 63, 63, w/2 - fs/2, starth + (fs*(37/4)), fs*3, fs*3);

					var txt = "click chests for";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(25/2)), fs);
					var txt = "bonuses but lookout";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(27/2)), fs);
					var txt = "for trapped chests";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(29/2)), fs);
				}
				else if (tutorial < 100) {
					var txt = "Soldier";
					this.writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(1/2)), fs);

					var index = 23;//black
					ctx.drawImage(resourceRepository.tileSheet, 64*(index%8)+1, 64*Math.floor(index/8)+1, 63, 63, w/2 - fs/2, starth + (fs*(7/4)), fs*3, fs*3);

					var txt = "The weakest enemy";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(5)), fs);
					var txt = "7 out of 10 enemies";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(6)), fs);
					var txt = "in the dungeon";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(7)), fs);

					var txt = "Advanced Soldier";
					this.writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(8)), fs);

					var index = 5;//green
					ctx.drawImage(resourceRepository.tileSheet, 64*(index%8)+1, 64*Math.floor(index/8)+1, 63, 63, w/2 - fs/2, starth + (fs*(37/4)), fs*3, fs*3);

					var txt = "2nd weakest enemy";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(25/2)), fs);
					var txt = "2 out of 10 enemies";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(27/2)), fs);
					var txt = "in the dungeon";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(29/2)), fs);
				}
				else if (tutorial < 150) {
					var txt = "Commander";
					this.writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(1/2)), fs);

					var index = 2;//gold
					ctx.drawImage(resourceRepository.tileSheet, 64*(index%8)+1, 64*Math.floor(index/8)+1, 63, 63, w/2 - fs/2, starth + (fs*(7/4)), fs*3, fs*3);

					var txt = "2nd only to the Boss";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(5)), fs);
					var txt = "1 out of 20 enemies";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(6)), fs);
					var txt = "in the dungeon";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(7)), fs);

					var txt = "Mage";
					this.writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(8)), fs);

					var index = 14;//purple
					ctx.drawImage(resourceRepository.tileSheet, 64*(index%8)+1, 64*Math.floor(index/8)+1, 63, 63, w/2 - fs/2, starth + (fs*(37/4)), fs*3, fs*3);

					var txt = "A mage ressurects";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(25/2)), fs);
					var txt = "fallen comrades even";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(27/2)), fs);
					var txt = "himself if need be";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(29/2)), fs);
				}
				else if (tutorial < 200) {
					var txt = "Boss";
					this.writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(1/2)), fs);

					var index = 10;//blue
					ctx.drawImage(resourceRepository.tileSheet, 64*(index%8)+1, 64*Math.floor(index/8)+1, 63, 63, w/2 - fs/2, starth + (fs*(7/4)), fs*3, fs*3);

					var txt = "The strongest enemy";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(5)), fs);
					var txt = "Only 1 per dungeon";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(6)), fs);
					var txt = "He wont fight until";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(7)), fs);
					var txt = "a Commanders is";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(8)), fs);
					var txt = "defeated";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(9)), fs);
					var txt = "He gets a boost for";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(10)), fs);
					var txt = "each enemy left";
					this.writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(11)), fs);

					var txt = "Defeat the boss to";
					this.writeMessage(ctx, txt, PINK, (_width-fs*txt.length)/2, starth + (fs*(13)), fs);
					var txt = "clear the dungeon";
					this.writeMessage(ctx, txt, PINK, (_width-fs*txt.length)/2, starth + (fs*(14)), fs);
				}
				else tutorial = 0;
			}
			else {
				//show gold balance
				fs = Math.floor(w/16);
				var buffer = fs/2;
				var starth = _height*SCREENRATIO/2 - h/2;

				var txt = "loot";
				this.writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(1/2)), fs);

				var txt = "Old";
				this.writeMessage(ctx, txt, WHITE, margin+fs, starth + (fs*(5/2)), fs);
				txt = ""+oldbalance;
				this.writeMessage(ctx, txt, YELLOW, margin+w-(fs*(txt.length+1)), starth + (fs*(5/2)), fs);
				var txt = "New";
				this.writeMessage(ctx, txt, WHITE, margin+fs, starth + (fs*(9/2)), fs);
				txt = ""+(newbalance-oldbalance);
				var fc = YELLOW;
				if (newbalance == 0) fc = RED;
				this.writeMessage(ctx, txt, fc, margin+w-(fs*(txt.length+1)), starth + (fs*(9/2)), fs);
				var txt = "Total";
				this.writeMessage(ctx, txt, WHITE, margin+fs, starth + (fs*(13/2)), fs);
				txt = ""+newbalance;
				this.writeMessage(ctx, txt, YELLOW, margin+w-(fs*(txt.length+1)), starth + (fs*(13/2)), fs);
			}
		}
		else if (state == PAUSED) {
			var w = _width*.9;
			var h = w * .8
			var margin = _width*.05;
			var fs = _width / 16;
			ctx.drawImage(resourceRepository.logo, margin, _height*SCREENRATIO/2 - h/2 - w*.29, w, w*.19);
			if (Math.round(_frame/5)% 2 == 1) this.writeMessage(ctx, "click to resume", WHITE, (_width-fs*15)/2, _height*SCREENRATIO/2 + h/2 + fs*2, fs);
			fs = _width / 7;
			this.writeMessage(ctx, "paused", SUPER, (_width-fs*6)/2, _height*SCREENRATIO/2 - fs/2, fs);
		}
		else if (state == FAILED) {
			var txt = "penalty";
			var fs = Math.floor(_width/(txt.length+2));
			var starty = (_height*SCREENRATIO-fs*6)/2;
			var startx = (_width-(fs*txt.length))/2;
			this.writeMessage(ctx, txt, RED, (_width-(fs*txt.length))/2, starty, fs);

			txt = atkloss+" atk";
			this.writeMessage(ctx, txt, RED,(_width-(fs*txt.length))/2, starty+fs, fs);
			txt = defloss+" def";
			this.writeMessage(ctx, txt, RED, (_width-(fs*txt.length))/2, starty+fs*2, fs);
			txt = spdloss+" spd";
			this.writeMessage(ctx, txt, RED, (_width-(fs*txt.length))/2, starty+fs*3, fs);
			txt = rcvloss+" rcv";
			this.writeMessage(ctx, txt, RED, (_width-(fs*txt.length))/2, starty+fs*4, fs);
			txt = (newbalance-oldbalance)+" gld";
			this.writeMessage(ctx, txt, RED, (_width-(fs*txt.length))/2, starty+fs*5, fs);

			if (_frame > 24) {
				//death penalty
				player.atk -= atkloss;
				player.def -= defloss;
				player.spd -= spdloss;
				player.rcv -= rcvloss;

				player.currentxp = 0;
				displayedxp = 0;
				newbalance = oldbalance;

				player.act = 0;

				player.currenthp = player.hp;

				/* prevent death holes
				if (baseatk > player.atk) baseatk = player.atk;
				if (basedef > player.def) basedef = player.def;
				if (basespd > player.spd) basespd = player.spd;
				if (basercv > player.rcv) basercv = player.rcv;
				if (basehp > player.hp) basehp = player.hp;
				*/
				_frame = 0;
				//this.notify(false); //stage failed
				this.reset();
			}
		}
		else if (state == SUCCESS) {
			var txt = "dungeon cleared";
			var fs = Math.floor(_width/(txt.length+1));
			var starty = (_height*SCREENRATIO-fs)/2;
			var startx = (_width-(fs*txt.length))/2;
			this.writeMessage(ctx, txt, SUPER, startx, starty, fs);
			this.writeMessage(ctx, (5-Math.floor(_frame/5)), SUPER, (_width-fs)/2, (_height-fs)/2 + fs, fs);
			if (_frame > 24) {
				stage++;
				_frame = 0;
				baseatk = player.atk;
				basedef = player.def;
				basespd = player.spd;
				basercv = player.rcv;
				basehp = player.hp;
				//this.notify(true); //stage cleared
				this.reset();
			}
		}
	};

	this.writeMessage = function(ctx, m, t, x, y, s) {
		var _m = ""+m;
		var _m = _m.toLowerCase();
		if (x+ _m.length*s > _width) x = _width-_m.length*s;
		else if (x < 0) x=0;
		for(var i=0; i<_m.length; i++) {
			if (_m.charCodeAt(i) <= 126 && _m.charCodeAt(i) >= 32) ctx.drawImage(resourceRepository.font, FONTSIZE*(_m.charCodeAt(i)-32)+1, FONTSIZE*t+1, FONTSIZE-1, FONTSIZE-1, x+(i*s),y,s,s);
			else ctx.drawImage(resourceRepository.font, FONTSIZE*(41 /*question mark*/)+1, FONTSIZE*t+1, FONTSIZE, FONTSIZE, x+(i*s),y,s,s);
		}
	};

	this.zeroFill = function(n,p) {
		var s = ""+n;
		while (s.length<p) {
			s = "0"+s;
		}
		return s;
	};

	this.levelup = function() {
		player.xp = Math.ceil(player.xp+XPRATE);
		player.hp += 7;
		player.currenthp = player.hp;
		player.atk += Math.round(Math.random() + (1 * ((255 - player.atk) /256)));
		player.def += Math.round(Math.random() + (1 * ((255 - player.def) /256)));
		player.spd += Math.round(Math.random() + (1 * ((255 - player.spd) /256)));
		player.rcv += Math.round(Math.random() + (1 * ((255 - player.rcv) /256)));

		var m = new Message();
		var txt = "status up";
		var fs = Math.floor(_width/(txt.length+2));
		var starty = (_height-fs)/2;
		var startx = (_width-(fs*txt.length))/2;
		m = {type: SUPER, message: txt, x: startx, y: starty, s: fs, duration: 2, tick: 0, delay: 0};
		messages.push(m);
	};

	this.reset = function() {
		bonus = -1;
		locked = true;
		cleared = false;

		messages.splice(0, messages.length);
		defeated.splice(0, defeated.length);
		injured.splice(0, injured.length);
		mages.splice(0, mages.length);
		chests.splice(0, chests.length);
		statuseffects.splice(0, statuseffects.length);
		model.init(6, Math.floor((_height*SCREENRATIO) / (_width / 6)));

		for (var i=0;i<model.getWidth(); i++) {
			for (var j=0; j<model.getHeight(); j++) {
				model.set(i, j, this.generateEnemy());
			}
		}

		//stageboss (1 per stage)
		var temp = new Entity();
		temp = {hp: basehp*6, currenthp: basehp*6, xp: 5*(stage+1), atk: Math.floor(baseatk*BOSSRATIO+1), def: Math.floor(basedef*BOSSRATIO+1), spd: 1, rcv: Math.floor(basercv*BOSSRATIO+1), act: 0, statuseffect: NORMAL, sts: 0, type: BOSS};
		var x = Math.floor(Math.random()*model.getWidth());
		var y = Math.floor(Math.random()*model.getHeight());
		model.set(x, y, temp);
		stageboss = {x: x, y: y};

		state = WAITING;
		tutorial = 0;
	};

	this.generateEnemy = function() {
		var temp = new Entity();
		var t = Math.floor((Math.random()*100)+1);
		if (t>= 70) {
			if (t > 95) {
				//advanced enemies (~5%)
				temp = {hp: basehp*4, currenthp: basehp*4, xp: 3*(stage+1), atk: Math.floor(baseatk*ADVRATIO+1), def: Math.floor(basedef*ADVRATIO+1), spd: 1, rcv: Math.floor(basercv*ADVRATIO+1), act: 0, statuseffect: NORMAL, sts: 0, type: ADVANCED};
			}
			else {
				//intermediate enemies (~25%)
				temp = {hp: basehp*3, currenthp: basehp*3, xp: 2*(stage+1), atk: Math.floor(baseatk*INTRATIO+1), atk: Math.floor(basedef*INTRATIO+1), spd: 1, rcv: Math.floor(basercv*INTRATIO+1), act: 0, statuseffect: NORMAL, sts: 0, type: INTERMEDIATE};
			}
		}
		else {
			//basic enemies (~70%)
			temp = {hp: basehp*2, currenthp: basehp*2, xp: 1*(stage+1), atk: Math.floor(baseatk*BASICRATIO+1), def: Math.floor(basedef*BASICRATIO+1), spd: 1, rcv: Math.floor(basercv*BASICRATIO+1), act: 0, statuseffect: NORMAL, sts: 0, type: BASIC};
		}
		return temp;
	};

	this.setVolume = function(v) {
			volume = v;
			resourceRepository.gameover.volume = volume;
			resourceRepository.levelup.volume = volume;
			resourceRepository.cleared.volume = volume;
			resourceRepository.spawn.volume = volume;
			resourceRepository.acquire.volume = volume;
			resourceRepository.boom.volume = volume;
	};

	this.isInjured = function(x,y) {
		var isinjured = false;
		for(var i=0; i<injured.length; i++) {
			if (x == injured[i].x && y == injured[i].y) isinjured = true;
		}
		return isinjured;
	};

	this.update = function() {
		if (++_frame > 100) _frame = 0;
		if (++tutorial > 1000) tutorial = 0;
		if (state == INPLAY) {
			//regenerate hp player
			var rcv = player.rcv;
			var regen = rcv/4;
			if (player.currenthp+regen < player.hp) {
				player.currenthp += regen;
			}
			else player.currenthp = player.hp;
			//regenerate hp enemeies
			for(var i=0; i<injured.length; i++) {
				var enemy = model.get(injured[i].x, injured[i].y);
				var rcv = enemy.rcv;
				var regen = rcv/16;
				if (enemy.currenthp+regen <= enemy.hp) {
					if (enemy.statuseffect == NORMAL) enemy.currenthp += regen;
				}
				else {
					enemy.currenthp = enemy.hp;
					injured.splice(i,1);
				}
			}
			//tick messages
			for(var i=0; i<messages.length;i++) {
				if (messages[i].delay > 0) messages[i].delay--;
				else if (messages[i].tick++ > messages[i].duration) messages.splice(i,1);
			}
			//check status effects
			for(var i=0; i<statuseffects.length; i++) {
				var remove = false;
				var temp = model.get(statuseffects[i].x, statuseffects[i].y);
				if (--temp.sts < 0) {
					temp.sts = 0;
					temp.statuseffect = NORMAL;
					remove = true;
				}
				model.set(statuseffects[i].x, statuseffects[i].y, temp);
				if (remove) {
					statuseffects.splice(i,1);
					i--;
				}
			}
			//mage check
			if (!cleared && defeated.length > 0 && mages.length < stage && Math.floor(Math.random()*64) == 0) {
				//spawn mage
				var temp = new Entity();
				temp = {hp: basehp*5, currenthp: basehp*5, xp: 4*(stage+1), atk: Math.floor(baseatk*MAGERATIO+1), def: Math.floor(basedef*MAGERATIO+1), spd: 1, rcv: Math.floor(basercv*MAGERATIO+1), statuseffect: NORMAL, sts: 0, act: 0, type: MAGE};

				var m = new Message();
				var fs = _width/model.getWidth()/3;
				m = {type: BLUE, message: "mage spawn", x: defeated[0].x*(_width / model.getWidth()), y: defeated[0].y*((_height*SCREENRATIO) / model.getHeight()), s: fs, duration: 2, tick: 0, delay: 0};
				messages.push(m);
				if (!mute) resourceRepository.spawn.play();

				model.set(defeated[0].x, defeated[0].y, temp);
				mages.push(defeated[0]);
				defeated.splice(0,1);
			}
			//chest roulette
			for(var i=0; i<chests.length; i++) {
				var chest = model.get(chests[i].x, chests[i].y);
				if (++chest.act >= 99) chest.act = 0;
				model.set(chests[i].x, chests[i].y, chest);
			}
			//mage action
			for(var i=0; i<mages.length; i++) {
				var mage = model.get(mages[i].x, mages[i].y);
				if (mage.statuseffect == NORMAL) mage.act++;
				if (mage.act >= 89) {
					if (defeated.length > 0) {
						//summon
						model.set(defeated[0].x, defeated[0].y, this.generateEnemy());

						var m = new Message();
						m = {type: BLUE, message: "summon", x: defeated[0].x*(_width / model.getWidth()), y: defeated[0].y*((_height*SCREENRATIO) / model.getHeight()), s: fs, duration: 2, tick: 0, delay: 0};
						messages.push(m);
						if (!mute) resourceRepository.spawn.play();

						defeated.splice(0,1);
					}
					mage.act = 0;
				}
				model.set(mages[i].x, mages[i].y, mage);
			}
		}
	};
}
