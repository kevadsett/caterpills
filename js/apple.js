var Apple = function(x, y, colour) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.sprite = game.add.sprite(x * cellSize + halfCellSize, y * cellSize + halfCellSize, 'apple-' + colour);
    this.sprite.anchor.setTo(0.5, 0.5);
    events.on('move', this.checkCollision, this);
};

Apple.prototype = {
    checkCollision: function(x, y) {
        if (x === this.x && y === this.y) {
            this.addToCaterpillar();
        }
    },
    addToCaterpillar: function() {
        events.emit('addSegment', this.colour);
        appleCount--;
        this.sprite.kill();
    }
};