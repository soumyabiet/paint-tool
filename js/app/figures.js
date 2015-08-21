"use strict";
var Line = function( paper, tool ) {
    this.sColor = '#ff0000';
    this.sWidth = 4;

    this.setColor = function( c ) {
        this.sColor = '#'+ c;
    };

    this.setWidth = function( w ) {
        this.sWidth = w;
    };

    this.draw = function() {
        var path;

        var self = this;

        
        // Define a mousedown and mousedrag handler
        tool.onMouseDown = function( event ) {
            path = new paper.Path();
            path.strokeColor = self.sColor;
            path.strokeWidth = self.sWidth;
            path.add(event.point);
        }

        tool.onMouseDrag = function( event ) {
            path.add(event.point);
        }

        tool.onMouseUp = function( event ) {
            Paint.collaborate();
        }
        
    };
};

var Circle = function( paper, tool ) {
    this.sColor = '#ff0000';
    this.eDistance = [];

    this.setColor = function( c ) {
        this.sColor = '#'+ c;
    };

    this.draw = function() {
        var self = this;
        var firstPoint;
        var secondPoint;


        function onMouseDown(event) {
            firstPoint = event.point;
        }
        tool.onMouseDown = onMouseDown;


        function onMouseDrag(event) {
            secondPoint = event.point;
            var distance = calculateDistance(firstPoint,secondPoint);
            self.eDistance.push( Math.floor( distance ) );
            
            var c = new paper.Path.Circle(firstPoint, distance);
            c.fillColor = 'white';
            c.strokeColor = self.sColor;
            c.strokeWidth = 4;
        }
        tool.onMouseDrag = onMouseDrag;

        function calculateDistance(firstPoint,secondPoint){
           var x1 = firstPoint.x;
           var y1 = firstPoint.y;
           var x2 = secondPoint.x;
           var y2 = secondPoint.y;
           
           var distance = Math.sqrt((Math.pow((x2-x1), 2))+(Math.pow((y2-y1), 2)));
           return distance;
        }

        tool.onMouseUp = function( event ) {
            Paint.collaborate();
        }
    };
};

var Rectangle = function( paper, tool ) {
    this.sColor = '#ff0000';

    this.setColor = function( c ) {
        this.sColor = '#'+ c;
    };

    this.draw = function() {
        var self = this;
        var firstPoint;
        var secondPoint;


        function onMouseDown(event) {
            firstPoint = event.point;
        }
        tool.onMouseDown = onMouseDown;


        function onMouseDrag(event) {
            var secondPoint = event.point;

            var r = new paper.Path.Rectangle(firstPoint, secondPoint);
            r.fillColor = 'white';
            r.strokeColor = self.sColor;
            r.strokeWidth = 4;
        }

        tool.onMouseDrag = onMouseDrag;

        tool.onMouseUp = function( event ) {
            Paint.collaborate();
        }

        function calculateDistance(firstPoint,secondPoint){
           var x1 = firstPoint.x;
           var y1 = firstPoint.y;
           var x2 = secondPoint.x;
           var y2 = secondPoint.y;
           
           var distance = Math.sqrt((Math.pow((x2-x1), 2))+(Math.pow((y2-y1), 2)));
           return distance;
        }
    };
};

var Brush = function( paper, tool ) {
    this.sColor = '#ff0000';
    this.sWidth = 4;

    this.setColor = function( c ) {
        this.sColor = '#'+ c;
    };

    this.setWidth = function( w ) {
        this.sWidth = w;
    };

    this.draw = function() {
        var path;

        var self = this;

        
        // Define a mousedown and mousedrag handler
        tool.onMouseDown = function(event) {
            path = new paper.Path();
            path.strokeColor = self.sColor;
            path.strokeWidth = self.sWidth;
            path.strokeCap = 'butt';
            path.add(event.point);
        }

        tool.onMouseDrag = function(event) {
            path.add(event.point);
        }

        tool.onMouseUp = function( event ) {
            Paint.collaborate();
        }
        
    };
};


var Eraser = function( paper, tool ) {

    this.sWidth = 12;

    this.setWidth = function( w ) {
        this.sWidth = w;
    };

    this.draw = function() {
        var path;

        var self = this;
        // Define a mousedown and mousedrag handler
        tool.onMouseDown = function(event) {
            path = new paper.Path();
            path.strokeColor = 'white';
            path.strokeWidth = self.sWidth;
            path.add(event.point);
        };

        tool.onMouseDrag = function(event) {
            path.add(event.point);
        };

        tool.onMouseUp = function( event ) {
            Paint.collaborate();
        }
        
    };
};

var SelectTool = function( paper, tool ) {
    var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 50
    };
    var prev;
    
    this.enable = function() {
        function onMouseMove(event) {
            if (prev) {
                prev.selected = false;
            }
                    
            var result = paper.project.hitTest(event.point, hitOptions);
            if (result) {
                var item = result.item;
                item.selected = true;
                prev = item;
            }
        }
        tool.onMouseMove = onMouseMove;
        function onMouseDown(event) {
            if (prev) {
                prev.selected = false;
            }
                    
            var result = paper.project.hitTest(event.point, hitOptions);
            if (result) {
                var item = result.item;
                item.selected = true;
                prev = item;
            }
        }
        tool.onMouseDown = onMouseDown;
    };

    this.disable = function() {
        function onMouseMove(event) {
            if (event.item) {
                event.item.selected = false;
            }
        }

        function onMouseDown(event) {
            if (event.item) {
                event.item.selected = false;
            }
        }
        
        tool.onMouseDown = onMouseDown;
        tool.onMouseMove = onMouseMove;
    };
};