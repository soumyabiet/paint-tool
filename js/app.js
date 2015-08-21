// configuration js file
requirejs.config({
    baseUrl : 'js/lib',
    paths : {
        app : '../app',
        sce : './sceditor'
    },
    shim : {
        "mCustomScrollbar"  : ["jquery"]
    }
});

var files = ['jquery', 'paper', 'socket.io', 'jscolor', 'mCustomScrollbar', 
            'app/figures', 'app/paint', 'app/custom'];

requirejs(files, function( $, paper, io ) {
    var parent = window.parent;
    var userInfo = {
        uID : parent.getonsip.gumID,
        cID : parent.getonsip.cID,
        name : parent.getonsip.displayName
    };

    window.userInfo = userInfo;

    var socket = io(parent.NODE_PAINT_SERVER_URL);
    var canvas = document.getElementById('tutorial');
    // config jscolor 
    jscolor.dir = 'images/';
    jscolor.install();
    
    // Initilize Paper
    paper.setup( canvas );
    
    // Setup canvas layer
    var background = new paper.Layer();
    background.setName('Background');
    var foreground = new paper.Layer();
    foreground.setName('Foreground');
    // Activate foreground layer
    foreground.activate();

    for(var i in paper.project.layers) {
        var layer = paper.project.layers[i];
    }
    

    // Initilize Paint
	Paint.initialize( paper, socket );
    Paint.saveAsImage( paper, canvas );
    Paint.resize( paper, canvas );

    $(function(){
          
    });
    socket.on('canvas message', function(data) {
        // paper.project.clear();
        var d = JSON.parse( data );

        if( userInfo.cID == d.i.cID) {
            background.activate();
            paper.project.importJSON( d.p );
            paper.view.update();
            foreground.activate();
        }
    });
});

