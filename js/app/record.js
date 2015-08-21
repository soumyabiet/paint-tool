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
                var video = document.createElement('video');
                video.src = url;
                var top = $('#paint-canvas').offset().top;
                video.setAttribute('style', 'height: 70%; position: absolute; top:'+ top +'px; right : 10px; float:right;');
                document.body.appendChild(video);
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