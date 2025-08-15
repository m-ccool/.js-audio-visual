$(document).ready(function () {
    $(window).scroll(function () {
      // Get the position of the "music_video" section
      var musicVideoPosition = $('#music_video').offset().top;

      // Check if the user has scrolled to the "music_video" section
      if ($(window).scrollTop() >= musicVideoPosition) {
        // Remove the 'hide' class to reveal the navbar
        $('nav').removeClass('hide');
        // Apply a fade-in effect
        $('nav').css('opacity', '1');
      } else {
        // Hide the navbar when user scrolls back to "splash" section
        $('nav').addClass('hide');
        $('nav').css('opacity', '0');
      }
    });
  });