var UP = 0, LEFT = 1, DOWN = 2, RIGHT = 3;
var directions = ["UP", "LEFT", "DOWN", "RIGHT"];
var gameSpeed = 0.5;
var Caterpillar = function(x, y) {
    this.actCount = -1;
    this.bodyLength = 5;
    this.bodySegments = game.add.group();
    this.position = {
        x: x,
        y: y
    };
    this.speed = 30;
    this.head = game.add.sprite(this.position.x, this.position.y, 'blank');
    this.head.currentPosition = {
        x: this.head.x,
        y: this.head.y
    };
    this.head.direction = RIGHT;
    this.head.directionChangePoints = new Array(this.bodyLength);
    for (var i = 0; i < this.bodyLength - 1; i++) {
        var newSeg = game.add.sprite(this.position.x - ((i+1) * 30), this.position.y, 'blank');
        newSeg.currentPosition = {
            x: newSeg.x,
            y: newSeg.y
        };
        newSeg.prevPosition = {
            x: newSeg.x,
            y: newSeg.y
        };
        this.bodySegments.add(newSeg);
    }
    game.input.onTap.add(this.onTap, this);
};
Caterpillar.prototype = {
    update: function() {
        var nextMoveAt = 60/gameSpeed;
        var raiseSegmentStep = nextMoveAt / (this.bodySegments.length + 1);
        var raisedSegmentIndex = this.bodySegments.length - Math.floor(this.actCount / raiseSegmentStep);
        var seg;
        this.actCount = (this.actCount + 1) % nextMoveAt;
        if (this.actCount !== 0) return;
        switch (this.head.direction) {
            case UP:
                this.position.y -= this.speed;
                break;
            case LEFT:
                this.position.x -= this.speed;
                break;
            case DOWN:
                this.position.y += this.speed;
                break;
            case RIGHT:
                this.position.x += this.speed;
                break;
        }
        this.head.prevPosition = {
            x: this.head.x,
            y: this.head.y
        };
        this.head.x = this.position.x;
        this.head.y = this.position.y;
        var segmentDirections = [directions[this.head.direction]];
        for (var i = 0; i < this.bodySegments.length; i++) {
            seg = this.bodySegments.getChildAt(i);
            seg.prevPosition.x = seg.x;
            seg.prevPosition.y = seg.y;
            var nextPosition = {};
            if (i === 0) {
                nextPosition.x = this.head.prevPosition.x;
                nextPosition.y = this.head.prevPosition.y;
            } else {
                var prevSeg = this.bodySegments.getChildAt(i - 1);
                if (prevSeg) {
                    nextPosition.x = prevSeg.prevPosition.x;
                    nextPosition.y = prevSeg.prevPosition.y;
                }
            }
            seg.currentPosition = {
                x: nextPosition.x,
                y: nextPosition.y
            };
            var xDiff = nextPosition.x - seg.x;
            var yDiff = nextPosition.y - seg.y;
            if (xDiff > 0) {
                seg.direction = RIGHT;
            } else if (xDiff < 0) {
                seg.direction = LEFT;
            } else if (yDiff > 0) {
                seg.direction = DOWN;
            } else if (yDiff < 0) {
                seg.direction = UP;
            }
            seg.x = nextPosition.x;
            seg.y = nextPosition.y;
            segmentDirections.push(directions[seg.direction]);
        }
    },
    onTap: function(e) {
        var tapThreshold = 50;
        var tapX = e.x, tapY = e.y;
        var tappedAbove = e.y < this.position.y - tapThreshold;
        var tappedBelow = e.y > this.position.y + tapThreshold;
        var tappedLeft = e.x < this.position.x - tapThreshold;
        var tappedRight = e.x > this.position.x + tapThreshold;
        var travellingHorizontally = this.head.direction === RIGHT || this.head.direction === LEFT;
        var travellingVertically = this.head.direction === DOWN || this.head.direction === UP;
        if (tappedAbove && travellingHorizontally) {
            this.head.direction = UP;
        } else if (tappedBelow && travellingHorizontally) {
            this.head.direction = DOWN;
        } else if (tappedLeft && travellingVertically) {
            this.head.direction = LEFT;
        } else if (tappedRight && travellingVertically) {
            this.head.direction = RIGHT;
        }

    }
};
var main = {
    preload: function() {
    },
    create: function() {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.caterpillar = new Caterpillar(game.world.width / 2, game.world.height / 2);
    },
    update: function() {
        this.caterpillar.update();
    }
};
var game = new Phaser.Game(1104, 621, Phaser.AUTO, 'gameDiv');
game.state.add('main', main);
game.state.start('main');