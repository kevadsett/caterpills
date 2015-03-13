var UP = 1.5, LEFT = 1, DOWN = 0.5, RIGHT = 0;
var directions = ["UP", "LEFT", "DOWN", "RIGHT"];
var gameSpeed = 1;
var Caterpillar = function(x, y) {
    this.actCount = -1;
    this.bodyLength = 5;
    this.bodySegments = game.add.group();
    this.position = {
        x: x,
        y: y
    };
    this.speed = 30;
    this.head = game.add.sprite(this.position.x, this.position.y, 'body');
    this.head.anchor.setTo(0.5, 0.5);
    this.head.currentPosition = {
        x: this.head.x,
        y: this.head.y
    };
    this.head.direction = LEFT;
    this.head.rotation = Math.PI * this.head.direction;
    this.head.directionChangePoints = new Array(this.bodyLength);
    this.bodySegments.add(this.head);
    for (var i = 0; i < this.bodyLength - 1; i++) {
        var newSeg = game.add.sprite(this.position.x + ((i+1) * 30), this.position.y, 'body');
        newSeg.anchor.setTo(0.5, 0.5);
        newSeg.currentPosition = {
            x: newSeg.x,
            y: newSeg.y
        };
        newSeg.direction = LEFT;
        newSeg.rotation = Math.PI * newSeg.direction;
        this.bodySegments.add(newSeg);
    }
    game.input.onTap.add(this.onTap, this);
};
Caterpillar.prototype = {
    update: function() {
        var nextMoveAt = 60/gameSpeed;
        var raiseSegmentStep = Math.floor(nextMoveAt / (this.bodySegments.length));
        console.log(raiseSegmentStep);
        var raisedSegmentIndex = this.bodySegments.length - 1 - Math.floor(this.actCount / raiseSegmentStep);
        var seg;
        this.actCount = (this.actCount + 1) % nextMoveAt;
        if (this.actCount === 0) {
            for (var i = this.bodySegments.length - 1; i > 0; i--) {
                seg = this.bodySegments.getChildAt(i);
                var nextPosition = {};
                var nextDirection;
                var prevSeg = this.bodySegments.getChildAt(i - 1);
                seg.x = seg.currentPosition.x = prevSeg.currentPosition.x;
                seg.y = seg.currentPosition.y =  prevSeg.currentPosition.y;
                seg.direction = prevSeg.direction;
                seg.rotation = Math.PI * seg.direction;
            }
            switch (this.head.direction) {
                case UP:
                    this.head.y -= this.speed;
                    break;
                case LEFT:
                    this.head.x -= this.speed;
                    break;
                case DOWN:
                    this.head.y += this.speed;
                    break;
                case RIGHT:
                    this.head.x += this.speed;
                    break;
            }
            this.head.currentPosition.x = this.head.x;
            this.head.currentPosition.y = this.head.y;
        } else if (this.actCount % raiseSegmentStep === 0) {
            console.log("Raise segment " + raisedSegmentIndex);
            var maxInfluence = this.bodySegments.length / 4;
            for (var i = 1; i < this.bodySegments.length; i++) {
                seg = this.bodySegments.getChildAt(i);
                if (i === raisedSegmentIndex) {
                    seg.y = seg.currentPosition.y - 30;
                } else {
                    var influence = Math.round(30 * Math.max(maxInfluence - Math.abs(i - raisedSegmentIndex), 0) / maxInfluence);
                    seg.y = seg.currentPosition.y - influence;
                }
            }
        }
    },
    onTap: function(e) {
        var tapThreshold = 50;
        var tapX = e.x, tapY = e.y;
        var tappedAbove = e.y < this.head.y - tapThreshold;
        var tappedBelow = e.y > this.head.y + tapThreshold;
        var tappedLeft = e.x < this.head.x - tapThreshold;
        var tappedRight = e.x > this.head.x + tapThreshold;
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
        this.head.rotation = Math.PI * this.head.direction;

    }
};
var main = {
    preload: function() {
        game.load.image('body', '../img/body.png');
        game.load.image('leg', '../img/leg.png');
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