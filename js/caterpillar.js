var Caterpillar = function(x, y) {
    this.x = x;
    this.y = y;
    this.isAlive = true;
    this.actCount = -1;
    this.bodyLength = 1;
    this.bodySegments = game.add.group();
    this.head = game.add.sprite(x * cellSize + halfCellSize, y * cellSize + halfCellSize, 'body');
    this.head.anchor.setTo(0.5, 0.5);
    this.head.currentPosition = {
        x: this.head.x,
        y: this.head.y
    };
    this.head.direction = LEFT;
    this.head.rotation = Math.PI * this.head.direction;
    this.head.directionChangePoints = new Array(this.bodyLength);
    this.bodySegments.add(this.head);
    console.log(this.bodySegments.length);
    /*for (var i = 0; i < this.bodyLength - 1; i++) {
        var newX = 1 + x + i;
        var newSeg = game.add.sprite(newX * cellSize, y * cellSize, 'body');
        newSeg.anchor.setTo(0.5, 0.5);
        newSeg.currentPosition = {
            x: newSeg.x,
            y: newSeg.y
        };
        newSeg.direction = LEFT;
        newSeg.rotation = Math.PI * newSeg.direction;
        this.bodySegments.add(newSeg);
    }*/
    game.input.onTap.add(this.onTap, this);
    events.off('addSegment');
    events.on('addSegment', this.addSegment, this);
};
Caterpillar.prototype = {
    update: function() {
        if (!this.isAlive) {
            return;
        }
        var nextMoveAt = 60/gameSpeed;
        var raiseSegmentStep = Math.floor(nextMoveAt / (this.bodySegments.length));
        var raisedSegmentIndex = this.bodySegments.length - 1 - Math.floor(this.actCount / raiseSegmentStep);
        var seg;
        this.actCount = (this.actCount + 1) % nextMoveAt;
        if (this.actCount === 0) {
            console.log(this.bodySegments.length);
            var nextPosition = {};
            switch (this.head.direction) {
                case UP:
                    nextPosition.x = this.x;
                    nextPosition.y = this.y - 1;
                    break;
                case LEFT:
                    nextPosition.x = this.x - 1;
                    nextPosition.y = this.y;
                    break;
                case DOWN:
                    nextPosition.x = this.x;
                    nextPosition.y = this.y + 1;
                    break;
                case RIGHT:
                    nextPosition.x = this.x + 1;
                    nextPosition.y = this.y;
                    break;
            }
            var outOfBounds = nextPosition.x < 0 ||
                nextPosition.y < 0 ||
                nextPosition.x >= gameSize.width ||
                nextPosition.y >= gameSize.height;
            var hitTail = false;
            for (i = 0; !hitTail && i < this.bodySegments.length; i++) {
                seg = this.bodySegments.getChildAt(i);
                hitTail = nextPosition.x === seg.currentPosition.x &&
                    nextPosition.y === seg.currentPosition.y;
            }
            if (outOfBounds || hitTail) {
                console.log("outOfBounds: " + outOfBounds + ", hitTail: " + hitTail);
                this.isAlive = false;
            } else {
                console.log("Moving");
                for (var i = this.bodySegments.length - 1; i > 0; i--) {
                    seg = this.bodySegments.getChildAt(i);
                    var nextDirection;
                    var prevSeg = this.bodySegments.getChildAt(i - 1);
                    seg.currentPosition.x = prevSeg.currentPosition.x;
                    seg.currentPosition.y = prevSeg.currentPosition.y;
                    console.log(seg.currentPosition);
                    seg.x = seg.currentPosition.x * cellSize + halfCellSize;
                    seg.y = seg.currentPosition.y * cellSize + halfCellSize;
                    seg.direction = prevSeg.direction;
                    seg.rotation = Math.PI * seg.direction;
                }
                this.x = nextPosition.x;
                this.y = nextPosition.y;
                this.head.x = this.x * cellSize + halfCellSize;
                this.head.y = this.y * cellSize + halfCellSize;
                this.head.currentPosition.x = this.x;
                this.head.currentPosition.y = this.y;
                events.emit('move', this.x, this.y);
            }
        }/* else if (this.actCount % raiseSegmentStep === 0) {
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
        }*/
    },
    onTap: function(e) {
        if (!this.isAlive) {
            game.state.start("main");
            return;
        }
        var tapThreshold = 15;
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
    },
    addSegment: function(colour) {
        var tailSeg = this.bodySegments.getChildAt(this.bodySegments.length - 1);
        var x, y;
        switch (tailSeg.direction) {
            case UP:
                x = tailSeg.currentPosition.x;
                y = tailSeg.currentPosition.y + 1;
                break;
            case LEFT:
                x = tailSeg.currentPosition.x + 1;
                y = tailSeg.currentPosition.y;
                break;
            case DOWN:
                x = tailSeg.currentPosition.x;
                y = tailSeg.currentPosition.y - 1;
                break;
            case RIGHT:
                x = tailSeg.currentPosition.x - 1;
                y = tailSeg.currentPosition.y;
                break;
        }
        var newSeg = game.add.sprite(x * cellSize + halfCellSize, y * cellSize + halfCellSize, 'body-' + colour);
        newSeg.anchor.setTo(0.5, 0.5);
        newSeg.currentPosition = {
            x: x,
            y: y
        };
        newSeg.direction = LEFT;
        newSeg.rotation = Math.PI * newSeg.direction;
        this.bodySegments.add(newSeg);
    }
};