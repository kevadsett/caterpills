var Apple = function(x, y, colour) {
    this.x = x;
    this.y = y;
    appleCoords[x][y] = this;
    this.age = 0;
    this.colour = colour;
    this.sprite = game.add.sprite(x * cellSize + halfCellSize, y * cellSize + halfCellSize, 'sprites', colours[colour].frames.apple);
    this.sprite.anchor.setTo(0.5, 0.5);
};

Apple.prototype = {
    checkCollision: function(x, y) {
        if (x === this.x && y === this.y) {
            this.addToCaterpillar();
        }
    },
    addToCaterpillar: function() {
        events.emit('addSegment', this.colour);
        this.destroy();
    },
    update: function() {
        this.age += (game.time.elapsedMS / 1000);
        if (this.age > 10) {
            this.age = 0;
            this.colour = colours[this.colour].prev;
            if (this.colour) {
                this.sprite.frame = colours[this.colour].frames.apple;
            } else {
                this.destroy();
            }
        }
    },
    destroy: function() {
        appleCoords[this.x][this.y] = undefined;
        this.sprite.kill();
        apples.splice(apples.indexOf(this), 1);
    }
};