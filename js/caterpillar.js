var Caterpillar = function(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 40;
    this.isAlive = true;
    this.actCount = -1;
    this.bodyLength = 1;
    this.bodySegments = game.add.group();
    this.head = game.add.sprite(x * cellSize + halfCellSize, y * cellSize + halfCellSize, 'sprites', 11);
    this.head.anchor.setTo(0.5, 0.5);
    this.head.currentPosition = {
        x: this.head.x,
        y: this.head.y
    };
    this.head.direction = LEFT;
    this.head.directionChangePoints = new Array(this.bodyLength);
    this.bodySegments.add(this.head);
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
        if (cursors.up.isDown) {
            this.head.direction = UP;
            this.head.frame = 13;
        } else if (cursors.down.isDown) {
            this.head.direction = DOWN;
            this.head.frame = 12;
        } else if (cursors.left.isDown) {
            this.head.direction = LEFT;
            this.head.frame = 11;
        } else if (cursors.right.isDown) {
            this.head.direction = RIGHT;
            this.head.frame = 10;
        }
        var nextMoveAt = 60 - this.speed;
        var raiseSegmentStep = Math.floor(nextMoveAt / (this.bodySegments.length));
        var raisedSegmentIndex = this.bodySegments.length - 1 - Math.floor(this.actCount / raiseSegmentStep);
        var seg;
        this.actCount = (this.actCount + 1) % nextMoveAt;
        if (this.actCount === 0) {
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
                this.isAlive = false;
            } else {
                for (var i = this.bodySegments.length - 1; i > 0; i--) {
                    seg = this.bodySegments.getChildAt(i);
                    var nextDirection;
                    var prevSeg = this.bodySegments.getChildAt(i - 1);
                    seg.currentPosition.x = prevSeg.currentPosition.x;
                    seg.currentPosition.y = prevSeg.currentPosition.y;
                    seg.x = seg.currentPosition.x * cellSize + halfCellSize;
                    seg.y = seg.currentPosition.y * cellSize + halfCellSize;
                    seg.direction = prevSeg.direction;
                }
                this.x = nextPosition.x;
                this.y = nextPosition.y;
                this.head.x = this.x * cellSize + halfCellSize;
                this.head.y = this.y * cellSize + halfCellSize;
                this.head.currentPosition.x = this.x;
                this.head.currentPosition.y = this.y;
                var apple = appleCoords[this.x][this.y];
                if (apple) {
                    if (apple.colour !== 'diamond') {
                        this.addSegment(apple.colour);
                    } else {
                        this.flushBrowns();
                    }
                    apple.destroy();
                }
            }
            this.print();
        }/* else if (this.actCount % raiseSegmentStep === 0) {
            var maxInfluence = this.bodySegments.length / 4;
            for (var i = 1; i < this.bodySegments.length; i++) {
                seg = this.bodySegments.getChildAt(i);
                if (i === raisedSegmentIndex) {
                    seg.y = (seg.currentPosition.y - 1) * cellSize - halfCellSize;
                } else {
                    var influence = Math.round(30 * Math.max(maxInfluence - Math.abs(i - raisedSegmentIndex), 0) / maxInfluence);
                    seg.y = (seg.currentPosition.y) * cellSize - halfCellSize - influence;
                }
            }
        }*/
    },
    onTap: function(e) {
        if (!this.isAlive) {
            game.state.start("main");
            return;
        }
        var tapThreshold = cellSize/2;
        var tapX = e.x, tapY = e.y;
        var tappedAbove = e.y < this.head.y - tapThreshold;
        var tappedBelow = e.y > this.head.y + tapThreshold;
        var tappedLeft = e.x < this.head.x - tapThreshold;
        var tappedRight = e.x > this.head.x + tapThreshold;
        var travellingHorizontally = this.head.direction === RIGHT || this.head.direction === LEFT;
        var travellingVertically = this.head.direction === DOWN || this.head.direction === UP;
        if (tappedAbove && travellingHorizontally) {
            this.head.direction = UP;
            this.head.frame = 13;
        } else if (tappedBelow && travellingHorizontally) {
            this.head.direction = DOWN;
            this.head.frame = 12;
        } else if (tappedLeft && travellingVertically) {
            this.head.direction = LEFT;
            this.head.frame = 11;
        } else if (tappedRight && travellingVertically) {
            this.head.direction = RIGHT;
            this.head.frame = 10;
        }
    },
    addSegment: function(colour) {
        var x, y;
        switch (tailSeg.direction) {
            case UP:
                x = tailSeg.currentPosition.x;
                y = tailSeg.currentPosition.y + 1;
                break;
        if (this.head.direction === LEFT || this.head.direction === RIGHT) {
            y = this.head.currentPosition.y;
        } else {
            x = this.head.currentPosition.x;
        }
        switch (this.head.direction) {
            case UP:
                y = this.head.currentPosition.y + 1;
                break;
            case DOWN:
                y = this.head.currentPosition.y - 1;
                break;
            case LEFT:
                x = this.head.currentPosition.x + 1;
                break;
            case RIGHT:
                x = this.head.currentPosition.x - 1;
                break;
        }
        var newSeg = game.add.sprite(x * cellSize + halfCellSize, y * cellSize + halfCellSize, 'sprites', colours[colour].frames.caterpillar);
        newSeg.anchor.setTo(0.5, 0.5);
        newSeg.currentPosition = {
            x: x,
            y: y
        };
        newSeg.direction = this.head.direction;
        newSeg.colour = colour;
        this.bodySegments.addChildAt(newSeg, 1);
        this.detectColourMatch(newSeg, 1);
    },
    detectColourMatch: function(startSeg, startIndex) {
        var segmentsToRemove = [startSeg];
        var match = true;
        i = startIndex;
        while (i < this.bodySegments.length - 1 && match) {
            seg = this.bodySegments.getChildAt(++i);
            if (seg.colour === startSeg.colour) {
                segmentsToRemove.push(seg);
                console.log(seg.colour);
            } else {
                match = false;
                console.log("Found " + segmentsToRemove.length + " " + startSeg.colour + " segment" + (segmentsToRemove.length > 1 ? "s" : ""));
            } 
        }

        if (segmentsToRemove.length > 2) {
            setTimeout(function() {
                var nextColour = colours[startSeg.colour].next;
                for (var i = 0; i < segmentsToRemove.length; i++) {
                    this.bodySegments.remove(segmentsToRemove[i]);
                    if ((i + 1) % 3 === 0) {
                        if (nextColour) {
                            this.addSegment(nextColour);
                        }
                    }
                }
            }.bind(this), 500);
        } else if (segmentsToRemove.length > 0) {
            var nextIndex = startIndex + segmentsToRemove.length;
            if (nextIndex < this.bodySegments.length) {
                var nextSegment = this.bodySegments.getChildAt(nextIndex);
                this.detectColourMatch(nextSegment, nextIndex);
            }
        }

    },
    flushBrowns: function() {
        var newBody = [], i, seg;
        newBody.push(this.head);
        for (i = 1; i < this.bodySegments.length; i++) {
            seg = this.bodySegments.getChildAt(i);
            console.log(seg.colour);
            if (seg.colour !== 'brown') {
                newBody.push(seg);
            }
        }
        var newBodySegments = game.add.group();
        for (i = 0; i < newBody.length; i++) {
            seg = newBody[i];
            newBodySegments.addChild(seg);
        }
        this.bodySegments.destroy();
        this.bodySegments = newBodySegments;
        for (i = 1; i < this.bodySegments.length; i++) {
            seg = this.bodySegments.getChildAt(i);
            var prevSeg = this.bodySegments.getChildAt(i - 1);
            if (prevSeg.direction === LEFT || prevSeg.direction === RIGHT) {
                seg.currentPosition.y = prevSeg.currentPosition.y;
            } else {
                seg.currentPosition.x = prevSeg.currentPosition.x;
            }
            switch (prevSeg.direction) {
                case UP:
                    seg.currentPosition.y = prevSeg.currentPosition.y + 1;
                    break;
                case DOWN:
                    seg.currentPosition.y = prevSeg.currentPosition.y - 1;
                    break;
                case LEFT:
                    seg.currentPosition.x = prevSeg.currentPosition.x + 1;
                    break;
                case RIGHT:
                    seg.currentPosition.x = prevSeg.currentPosition.x - 1;
                    break;
            }
            seg.x = seg.currentPosition.x * cellSize + halfCellSize;
            seg.y = seg.currentPosition.y * cellSize + halfCellSize;
            seg.direction = prevSeg.direction;
        }
    },
    print: function() {
        var string = "";
        for (var i = 0; i  < this.bodySegments.length; i++) {
            string += (i === 0 ? "X" : this.bodySegments.getChildAt(i).colour.charAt(0));
        }
        console.log(string);
    }
};