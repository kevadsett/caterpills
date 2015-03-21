var Apple = function(x, y, colour) {
    this.x = x;
    this.y = y;
    appleCoords[x][y] = this;
    this.age = 0;
    this.colour = colour;
    this.sprite = game.add.sprite(x * cellSize + halfCellSize, y * cellSize + halfCellSize, 'sprites', colours[colour].frames.apple);
    this.sprite.anchor.setTo(0.5, 0.5);
    events.on('destroyApples', this.destroy, this);
};

Apple.prototype = {
    update: function() {
        if (!game.tutorialAging) {
            this.age += (game.time.elapsedMS / 1000);
        }
        var maxAge = game.tutorialMode ? 2 : 10;
        if (this.age > maxAge) {
            this.age = 0;
            this.colour = colours[this.colour].prev;
            if (this.colour) {
                this.sprite.frame = colours[this.colour].frames.apple;
            } else {
                if (game.tutorialMode) {
                    game.tutorialMode = false;
                }
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