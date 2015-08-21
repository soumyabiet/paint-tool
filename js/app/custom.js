// JavaScript Document
var Custom = function( ) {
	return {
		init : function( window ) {
			var windowWidth = window.width();
			$('.topScroller').css('max-width', windowWidth);
			
			var liWidth = $('.topPan ul li').outerWidth();
			var liCount = $('.topPan ul li').length;
			
			var ulWidth = liWidth  * liCount
			//console.log(liWidth, liCount, ulWidth);
			$('.topPan ul').css('width',ulWidth);

			$(".topScroller").mCustomScrollbar({
				axis:"x",
				mouseWheel:{ enable: true }, 
				mouseWheel:{ axis: "x" }
			});
			
			$('.closeTopPan').hide();
			
			$('.openTopPan').click(function(){
				$(this).hide();
				$('.topPan').animate({
					top: 0	
				});
				$('.closeTopPan').show();
			});
			
			$('.closeTopPan').click(function(){
				$(this).hide();
				$('.topPan').animate({
					top: -135	
				});
				$('.openTopPan').show();
			});

			$('#load-json-data').on('click', 'li', function(){
				var source = $(this).data('source') || '';
				Paint.getUserData('getjson', source );
			});
			
		}		
	}
}();

