"use strict";
var Paint = function() {
    /**
     * Name of actual sellected shape
     */
    var currShape = 'pen';
    var undoRedo = [];
    var _socket;

    function getRGB( str ) {
        str = str.replace(/[a-z\(\)]/gi, '');
        return str.split(/,/);
    }

    function saveAsImage( p, c ) {
        $('#new-canvas').on('click', function(){
            if(confirm('Do you want to save existing project?')) {
                $('#save-as-image').click();
                setTimeout(function(){
                    paper.project.clear();
                }, 1000);
            } else {
                setTimeout(function(){
                    paper.project.clear();
                }, 300);
            }
        });

        $('#save-as-image').on('click', function(){
            var img = c.toDataURL();
            var data = JSON.stringify( p.project.exportJSON() );
            
            $.post('upload.php', { image : img, data : data }, function( data ) {
                if( data.status ) {
                    alert(data.message);
                    getUserData('getpng', function() {
                        $('.openTopPan').click();    
                    });
                }
            });
        });

        $('#stop').attr('disabled', true);

        $('#start').on('click', function() {
            $(this).attr('disabled', true);
            $('#stop').attr('disabled', false);
            recorder.startRecording();
        });

        $('#stop').on('click', function() {
            recorder.stopRecording(function(url) {
                var blob = recorder.blob;

                var fd = new FormData();
                fd.append('file', blob);

                $.ajax({
                    url :  "save.php",
                    type : 'POST',
                    data : fd,
                    contentType: false,
                    processData: false,
                    success: function(data) {
                        var exitCallback = function(){
                            $('.popup.visible').addClass('transitioning').removeClass('visible');
                            $('html').removeClass('overlay');

                            setTimeout(function () {
                                $('.popup').removeClass('transitioning');
                                $('#recording-video-content').html('');
                            }, 10);
                        };

                        $('#light-wt-video-pop-exit').click(exitCallback);

                        var video = document.createElement('video');
                        video.src = url;

                        var vH = c.width;
                        if( vH ) {
                            $('#light-wt-video-pop').css({'margin-left' : '-'+(vH/2)+'px'});
                        }
                        

                        $('#recording-video-content').append(video);
                        $('#light-wt-video-pop').addClass('visible');
                        $('html').addClass('overlay');

                        video.controls = true;
                        video.play();

                        $('#stop').attr('disabled', true);
                        $('#start').attr('disabled', false);
                    },    
                    error: function() {
                        alert("error on ajax request");
                        $('#stop').attr('disabled', true);
                        $('#start').attr('disabled', false);
                    }
                });
            });
        });
    }

    function getUserData() {
        var args = Array.prototype.slice.call( arguments );
        var fn, action = '';
        if(typeof args[0] === 'string') {
            action = args.shift();
        }
        if( action ) {
            var params = {r : action};
            switch( action ) {
                case 'getjson' : 
                    $.extend( params, { f : args.shift() });
                    break;
            }

            if( typeof args[0] === 'function' ) {
                fn = args.shift();
            }

            $.post('request.php', params , function( data ){
                if(data.a && action == 'getpng') { // getpng
                    if( data._tui) {
                        $('#user-data-panel').children('div.topScroller').html( data._tui );
                        setTimeout(function(){
                            Custom.init( $(window) );
                            if(fn) { 
                                fn();
                            };
                        }, 1500);
                    }
                } else if(data.a && action == 'getjson') {
                    reopen( data._con );
                    if(fn) { 
                        fn();
                    };
                }
            });
        } else {
            alert('Invalid argument call');
        }
        
    }

    function reopen( content ) {
        paper.project.clear();
        var d = JSON.parse( content );
        paper.project.importJSON( d );
        paper.view.update();
    }

    function removeActiveClass() {
        $('li.fa').removeClass('active');
    }

    function init( paper ) {
        var tool = new paper.Tool();

        var line = new Line( paper, tool );
        var circle = new Circle( paper, tool );
        var rect = new Rectangle( paper, tool );
        var brush = new Brush( paper, tool );
        var eraser = new Eraser( paper, tool );
        var selectTool = new SelectTool( paper, tool );
        

        $('#color-panel').on('change', function() {
            
            switch( currShape ) {
                case 'pen' :
                    line.setColor( $(this).val() );
                    break;
                case 'circle' :
                    circle.setColor( $(this).val() );
                    break;
                case 'rectangle' :
                    rect.setColor( $(this).val() );
                    break;
                case 'brush' :
                    brush.setColor( $(this).val() );
                    break;
            }
        });
        $('#left-panel').on('click', 'li.line',function() {
            $(this).addClass('selectsize');
        });

        $('#left-panel').on('click', 'li.fa' ,function() {
            
            var title = $(this).attr('title');
            removeActiveClass();
            $(this).addClass('active');

            if(['picker'].indexOf(title.toLowerCase()) === -1) {
                currShape = title.toLowerCase();
            }
            
            var lineWidth = 4;
            if(['pen', 'eraser', 'brush'].indexOf(title.toLowerCase()) !== -1) {
                if( $(this).find('li.selectsize').length ) {
                    var $size = $(this).find('li.selectsize');
                    lineWidth = $size.data('size');
                    $size.removeClass('selectsize');
                } else {
                    lineWidth = $(this).find('li.line:first').data('size');
                }
            }

            if(currShape != 'select') {
                selectTool.disable();
            }
            

            switch( currShape ) {
                case 'pen' :
                    line.setColor( $('#color-panel').val() );
                    line.setWidth( lineWidth );
                    line.draw();
                    break;
                case 'circle' :
                    circle.setColor( $('#color-panel').val() );
                    circle.draw();
                    break;
                case 'rectangle' :
                    rect.setColor( $('#color-panel').val() );
                    rect.draw();
                    break;
                case 'brush' :
                    brush.setColor( $('#color-panel').val() );
                    brush.setWidth( lineWidth );
                    brush.draw();
                    break;
                case 'eraser' :
                    eraser.setWidth( lineWidth );
                    eraser.draw();
                    break;
                case 'select' : 
                    selectTool.enable();
                    break;
                case 'text' :
                    removeActiveClass();
                    $(this).addClass('active');
                    tool.onMouseDown = onMouseDown;
                    tool.onMouseDrag = onMouseDrag;
                    break;
            }
        });

        function onMouseDown( event ) {

            var exitCallback = function(){
                $('.popup.visible').addClass('transitioning').removeClass('visible');
                $('html').removeClass('overlay');

                setTimeout(function () {
                    $('.popup').removeClass('transitioning');
                    $('#light-wt-pop-content').html('');
                }, 10);
            };

            $('#light-wt-pop').addClass('visible');
            $('html').addClass('overlay');

            var $xAxis = $('#x-axis-point');
            var $yAxis = $('#y-axis-point');

            $xAxis.val(event.point.x);
            $yAxis.val(event.point.y);

            
            $('#light-wt-pop-exit').click(exitCallback);

            $('#light-wt-pop-save').off('click').on('click', function() {
                var color = $('#color-panel1').val();
                var fontFamily = $('#popup-font-family').val();
                var fontSize = $('#popup-font-size').val();
                var t = $('#popup-content').val() || '';

                
                var x = $xAxis.val() || event.point.x,
                    y = $yAxis.val() || event.point.y;

                
                var point = new paper.Point(Number(x), Number(y));
                
                var text = new paper.PointText(point);
                text.fillColor = '#'+ color;
                text.fontSize = (fontSize ? fontSize : 12);
                text.fontFamily = (fontFamily ? fontFamily : 'Arial') ;
                text.content = t;
                
                $('#light-wt-pop-exit').click();
                $('#light-wt-pop-content').html(''); 


                Paint.collaborate();
        
            });
        }

        function onMouseDrag() {
            return false;
        }
        
        $('#undo-selection').on('click', function() {
            if($(this).hasClass('disable')) {
                return false;
            }
            var item = paper.project.activeLayer.lastChild;
            if( item ) {
                undoRedo.push( item );
                item.remove();
                paper.view.update();    
            }
        });

        $('#redo-selection').on('click', function() {
            if($(this).hasClass('disable')) {
                return false;
            }
            if( undoRedo.length ) {
                var item = undoRedo.pop();
                paper.project.activeLayer.addChild( item );    
                paper.view.update();
            }
        });

        function onKeyDown(event) {
            if(event.key == 'delete') {
                var item = paper.project.selectedItems[0];
                if( item ) {
                    undoRedo.push( item );
                    item.remove();
                }
            }
        }
        tool.onKeyDown = onKeyDown;

        $('#add-text-item').on('click', function() {
            currShape = 'text';

        });

        // initial tool set as line
        line.draw();
    }

    function resize( paper, canvas ) {
        var isMobileDevice = navigator.userAgent.match(/ipad|android/i);

        function calculateHeightWidth( ) {
            var desiredWidth = $(window).width();
            var desiredHeight = $(window).height();

            if( isMobileDevice ) {
                var device = isMobileDevice.toString().toLowerCase();
                switch( device ){
                    case 'ipad' :
                        if( desiredWidth > desiredHeight) {
                            desiredWidth = (desiredWidth - Math.floor( desiredWidth * .1 )) - 110; // reduce 40%
                            desiredHeight = (desiredHeight - 110); // padding 50 px both top & bottom                
                        } else if( desiredHeight > desiredWidth ) {
                            var dh = (desiredHeight - Math.floor( desiredHeight * .1 )) - 150; // reduce 40%
                            var dw = (desiredWidth - 45); // padding 50 px both top & bottom 
                            desiredWidth = dh;
                            desiredHeight = dw;                
                        }
                        break;
                    case 'android' :
                        if( desiredWidth > desiredHeight) {
                            // alert('width greater height');
                            desiredWidth = (desiredWidth - Math.floor( desiredWidth * .4 )) - 150; // reduce 40%
                            desiredHeight = (desiredHeight - 110); // padding 50 px both top & bottom                
                            // alert(desiredWidth + '>'+ desiredHeight);
                        } else if( desiredHeight > desiredWidth ) {
                            // alert('height greater width');
                            var dh = (desiredHeight - Math.floor( desiredHeight * .4 )); // reduce 40%
                            var dw = (desiredWidth - 55); // padding 50 px both top & bottom 
                            desiredWidth = dh;
                            desiredHeight = dw;                
                            // alert(desiredWidth + '>'+ desiredHeight);
                        }
                        break;
                    default :
                        alert('Your device is not supported');
                        return false;
                        break;
                }
            } else {
                desiredWidth = (desiredWidth - Math.floor( desiredWidth * .1 )) - 150; // reduce 10%
                desiredHeight = (desiredHeight - 110); // padding 50 px both top & bottom                
            }

            return [ desiredWidth, desiredHeight];
        }

        function resizeAndRedrawCanvas() {
            var c = calculateHeightWidth();
            var w = c[0];
            var h = c[1];
            canvas.width = w;
            canvas.height = h 

            paper.view.viewSize = new paper.Size( w, h );
            paper.view.draw();
            paper.view.update();
        }

        paper.view.onResize = resizeAndRedrawCanvas;
        $(window).resize(function() {
            paper.view.fire('resize');
        });
        
        var c = calculateHeightWidth();
        paper.view.setViewSize(c[0], c[1]);
    }

    function collaborate() {
        var toJsonData = paper.project.exportJSON();
        var data = JSON.stringify( { p : toJsonData, i : userInfo } );
        _socket.emit('canvas message' , data );
    }

    
    return {
        /**
         * Provides initialization for the app
         */
        initialize : function( paper, socket ) {
            _socket = socket;
            init( paper );
            getUserData('getpng');
        },
        collaborate : collaborate,
        saveAsImage : saveAsImage,
        getUserData : getUserData,
        resize : resize
    };
}();