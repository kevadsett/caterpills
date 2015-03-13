var Apple = function(x, y, colour) {
    this.x = x / 30;
    this.y = y / 30;
    this.colour = colour;
    this.sprite = game.add.sprite(x, y, 'apple-' + colour);
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