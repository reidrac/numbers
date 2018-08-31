var Game = function(id) {
	var self = {
		id: id,
		canvas: undefined,
		ctx: undefined,

		touch_current: undefined,
		touch_on: false,

		dt: 0,
		then: 0,

		cmax: 200,
		timer: 0,
		cool_down: 50,
		count: 1,
		effect: undefined,

		loading: 0,
		total_loading: 10,
	};

	self.draw = function() {
		self.ctx.save();
		self.ctx.fillStyle = "rgb(0, 0, 0)";
		self.ctx.textAlign = "center";
		self.ctx.font = "bold 8pt Arial";
		self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

		if (self.loading != self.total_loading)
		{
			self.ctx.fillStyle = "rgb(255, 255, 255)";
			self.ctx.fillText("Loading " + (self.loading + 1) + " of " + self.loading_total, Math.floor(self.canvas.width/2), Math.floor(self.canvas.height/3));
			self.ctx.restore();
			return;
		}

		if (self.effect != undefined) {
			var e = self.effect;

			if (e.c > self.cmax) {
				self.effect = undefined;
				self.count = 1;
			} else {
				var a = 1 - (e.c / self.cmax);
				self.ctx.beginPath();
				self.ctx.arc(e.x, e.y, e.c, 2 * Math.PI, false);		
				self.ctx.fillStyle = "rgba(" + e.r + "," + e.g + "," + e.b + "," + a + ")";
				self.ctx.fill();
				self.ctx.font = "bold " + Math.floor(e.c) + "pt Arial";
				self.ctx.fillText(self.effect.number, e.x, e.y + Math.floor(Math.floor(e.c)/2));
				e.c += 2;
				self.effect = e;
			}
		}

		self.ctx.restore();
	};

	self.update = function update(dt) {
		if (self.touch_on) {
			if (self.timer) {
				self.timer--;
			} else {
				self.timer = self.cool_down;

				var x = self.touch_current.x;
				var y = self.touch_current.y;

				self.effect = { 
					x: x, 
					y: y,
					c: 0,
					r: 255 - Math.floor(Math.random() * 128),
					g: 255 - Math.floor(Math.random() * 128),
					b: 255 - Math.floor(Math.random() * 128),
					number: self.count++
				};
				createjs.Sound.play(self.count - 1);

				if (self.count == 11) {
					self.count = 1;
				}
			}
		} else {
			self.timer = 0;
		}
	};
	
	self.run = function() {
		self.loop(0);
	}

	self.loop = function loop(now) {
		var k = 1 / 80;
		self.dt += Math.min(1 / 60, now - self.then) || 0;
		while(self.dt >= k) {
			self.update(k);
			self.dt -= k;
		}

		self.draw();

		self.then = now;
		requestAnimationFrame(self.loop);
	};

	self.touch_find_current = function(list) {
		var i;
		for(i=0; i<list.length; i++) {
			if(list[i].identifier == self.touch_current.id) {
				return list[i];
			}
		}
		return undefined;
	};

	self.touch_start = function(event) {
		self.touch_on = true;
		var e = event.changedTouches[0];
		self.touch_current = { id: e.identifier, x: parseInt(e.clientX) - e.target.offsetLeft, y: parseInt(e.clientY) - e.target.offsetTop };
		event.preventDefault();
	};

	self.touch_move = function(event) {
		var e = self.touch_find_current(event.changedTouches);
		if (e != undefined) {
			self.touch_current = { id: e.identifier, x: parseInt(e.clientX) - e.target.offsetLeft, y: parseInt(e.clientY) - e.target.offsetTop };
		}
		event.preventDefault();
	};

	self.touch_end = function(event) {
		if(self.touch_on) {
			var c = self.touch_find_current(event.changedTouches);
			if(c != undefined) {
				self.touch_on = false;
				self.touch_current = undefined;
			}
		}
		event.preventDefault();
	};

	self.on_resize = function() {
		self.canvas.width = window.innerWidth;
		self.canvas.height = window.innerHeight;
	};

	self.canvas = document.getElementById(self.id);
	if (!self.canvas.getContext) {
		self.canvas.insertAdjacentHTML("afterend", "<h1>This game requires canvas 2D support :(</h1>");
		return undefined;
	}

	self.canvas.style.background = "rgb(21, 21, 21)";
	self.canvas.addEventListener('touchstart', self.touch_start, false);
	self.canvas.addEventListener('touchmove', self.touch_move, false);
	self.canvas.addEventListener('touchend', self.touch_end, false);
	self.ctx = self.canvas.getContext("2d");

	self.on_resize();
	window.addEventListener('resize', self.on_resize, false);

	self.loaded = function() {
		self.loading++;
	}

	var audio = {
		1: "snd/one.ogg",
		2: "snd/two.ogg",
		3: "snd/three.ogg",
		4: "snd/four.ogg",
		5: "snd/five.ogg",
		6: "snd/six.ogg",
		7: "snd/seven.ogg",
		8: "snd/eight.ogg",
		9: "snd/nine.ogg",
		10: "snd/ten.ogg",
	};

	createjs.Sound.addEventListener("fileload", createjs.proxy(self.loaded));
	for(index in audio) {
		createjs.Sound.registerSound(audio[index], index);
	}

	return self;
};

window.onload = function () {
	game = Game("game");
	if (game != undefined) {
		game.loop(0);
	}
};
