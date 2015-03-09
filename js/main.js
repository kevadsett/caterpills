var UP = 0, LEFT = 1, DOWN = 2, RIGHT = 3;
var gameSpeed = 1;
var Caterpillar = function(x, y) {
    this.actCount = -1;
    this.bodyLength = 4;
    this.bodySegments = game.add.group();
    this.position = {
        x: x,
        y: y
    };
    this.speed = 30;
    this.direction = RIGHT;
    this.head = game.add.sprite(this.position.x, this.position.y, 'blank');
    this.directionChangePoints = new Array(this.bodyLength);
    for (var i = 0; i < this.bodyLength; i++) {
        this.bodySegments.create(this.position.x - ((i+1) * 30), this.position.y, 'blank');
    }
    game.input.onTap.add(this.onTap, this);
};
Caterpillar.prototype = {
    update: function() {
        var nextMoveAt = 60/gameSpeed;
        var raiseSegmentStep = nextMoveAt / (this.bodySegments.length + 1);
        var raisedSegmentIndex = this.bodySegments.length - Math.floor(this.actCount / raiseSegmentStep);
        console.log(raisedSegmentIndex);
        this.actCount = (this.actCount + 1) % nextMoveAt;
        for (var i = 0; i < this.bodySegments.length + 1; i++) {
            var seg = i === 0 ? this.head : this.bodySegments.getChildAt(i - 1);
            if (!seg) {}
            if (i === raisedSegmentIndex) {
                seg.y =  this.position.y - 30;
            } else {
                seg.y = this.position.y;
            }
        }
        if (this.actCount !== 0) return;
        switch (this.direction) {
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
        for (var i = 0; i < this.bodySegments.length; i++) {
            var seg = this.bodySegments.getChildAt(i);
            seg.prevPosition = seg.prevPosition || {};
            seg.prevPosition.x = seg.x;
            seg.prevPosition.y = seg.y;
            if (i === 0) {
                seg.x = this.head.prevPosition.x;
                seg.y = this.head.prevPosition.y;
            } else {
                var prevSeg = this.bodySegments.getChildAt(i - 1);
                if (prevSeg) {
                    seg.x = prevSeg.prevPosition.x;
                    seg.y = prevSeg.prevPosition.y;
                }
            }
        }
    },
    onTap: function(e) {
        var tapThreshold = 50;
        var tapX = e.x, tapY = e.y;
        var tappedAbove = e.y < this.position.y - tapThreshold;
        var tappedBelow = e.y > this.position.y + tapThreshold;
        var tappedLeft = e.x < this.position.x - tapThreshold;
        var tappedRight = e.x > this.position.x + tapThreshold;
        var travellingHorizontally = this.direction === RIGHT || this.direction === LEFT;
        var travellingVertically = this.direction === DOWN || this.direction === UP;
        if (tappedAbove && travellingHorizontally) {
            this.direction = UP;
        } else if (tappedBelow && travellingHorizontally) {
            this.direction = DOWN;
        } else if (tappedLeft && travellingVertically) {
            this.direction = LEFT;
        } else if (tappedRight && travellingVertically) {
            this.direction = RIGHT;
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