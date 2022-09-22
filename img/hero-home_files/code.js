jQuery.noConflict();

var TBM_SET_FOCUS_AS_IS = 1;
var TBM_SET_FOCUS_ON = 2;
var TBM_SET_FOCUS_OFF = 3;

jQuery(document).ready(function($) {
  "use strict";
  
  /* media queries to match */
  var smallMobile = "all and (max-width: 375px)";
  var mobile = "all and (min-width: 376px) and (max-width: 568px)";
  var phablet = "all and (min-width: 569px) and (max-width: 768px)";
  var tablet = "all and (min-width: 769px) and (max-width: 959px)";
  var desktopSmall = "all and (min-width: 960px) and (max-width: 1024px)";
  var desktop = "all and (min-width: 1025px)";
  var untillDesktop = "all and (max-width: 1024px)";
  var latLongCenter;

  var app = {
    enquiries: function() {

      /*ellipis on press release heading on small mobile*/
      var ellipsis = {
        match: function() {
            $(".comp-press h2").dotdotdot(); //not actually working due to position absolute footer meta
        }
      };

     /*fixed crest bg on tablet*/
      var tabletBG = {
        match: function() {
            var winHeight = $(window).height();
            $('#bg').css("height", winHeight);
        }
      };

      /* Maps - Mainly on Listing Pages*/
      var map = {
        match: function() {
          Drupal.TBM.settings.mapOptions = {};
          Drupal.TBM.settings.mapOptions.center = [53.964223, 5.009466];
          Drupal.TBM.settings.mapOptions.zoom = 5;
          Drupal.TBM.renderMap('#map');
        }
      };
      var mapMobile = {
        match: function() {
          Drupal.TBM.settings.mapOptions = {};
          Drupal.TBM.settings.mapOptions.center = [53.192534, -2.589823];
          Drupal.TBM.settings.mapOptions.zoom = 7;
          Drupal.TBM.renderMap('#map');
        }
      };
      /* ENDOF: Maps - Mainly on Listing Pages*/

      /* Homepage splash transition */
      var homepageAnimation = {
        match: function() {
            if ($(".tbm-splashable").not('.tbm-unsplashed').length){/*if homepg*/
                var winHeight = $(window).height();
                var lastScrollTop = 0, delta = 5;
                var titlePos = winHeight * 0.35;
                var gridPos = $('.page-wrapper').offset().top - 158;

                $('.page-wrapper').css({ 'margin-top' : 0 });
                $('#nav-main').css({ 'top' : -titlePos });

                var clicked = false;
                $('#arrow').click(function() {
                  clicked = true;
                  disable_scroll();
                  $('html, body').animate({ scrollTop : (gridPos-158) }, 1500);
                  TweenMax.to('header', 3, { top: -winHeight });
                  TweenMax.to('header .crest img', 2.5, { position: 'relative', top: -500 });
                  TweenMax.to('header .overlay, #arrow', 0.5, {opacity: 0});
                  TweenMax.to('nav', 1.5, {position: 'relative', top: 0, onComplete: function() {
                    $('nav').addClass('fixed').removeClass('hero').css({ position: 'fixed' });
                    $('.bridge-enabled nav#nav-main').css({'padding-top': $('.region-bridge-area').height()});
                    $('.page-wrapper').css({ 'margin-top' : 158 });
                    $('body').removeClass('waiting-to-scroll');
                  }});
                  TweenMax.to('nav .crest, nav .menu_btn', 0.8, {top: 0, opacity: 1, delay: 1.3, onComplete: function() {
                    $('header').hide(0, function() {
                      $('html, body').scrollTop(0);
                    });
                    enable_scroll();
                  }});

                });

                $(window).scroll(function() {
                  if( $('header').css('display') != 'none' && clicked == false ) {
                    $('#arrow').click();
                    clicked = true;
                    return false;
                  }
                });
            }
            else {
              // Shifting things down for bridge mode.
              $('.bridge-enabled nav#nav-main').css({'padding-top': $('.region-bridge-area').height()});
            }
        }
      };

      /* Homepage splash transition on mobile */
      var homepageAnimationMobile = {
        match: function() {
            var adminToolbarHeight = 0;
            if ($('body.admin-menu').length) {
              adminToolbarHeight = 47;
            }
            if ($(".tbm-splashable").not('.tbm-unsplashed').length){/*if homepg*/

              var winHeight = $(window).height();
              var lastScrollTop = 0, delta = 5;
              //var titlePos = winHeight * 0.55;
              var titlePos = ($('#nav-main').offset().top + 300) - (winHeight - $('#nav-main').height()) + $('#arrow').height() + 20;
              var gridPos = $('.page-wrapper').offset().top - 158;

              $('.page-wrapper').css({ 'margin-top' : 0 });
              $('#nav-main').css({ 'top' : -titlePos });

              var clicked = false;
              $('#arrow').click(function() {
                clicked = true;
                $('html, body').animate({ scrollTop : winHeight }, 1500);
                TweenMax.to('header .overlay, #arrow', 0.5, {opacity: 0});
                TweenMax.to('nav', 1, {position: 'relative', top: 0, onComplete: function() {
                  $('nav').removeClass('hero');
                  if ($('.bridge-enabled').length == 0) {
                    $('nav').css({ position : 'static' });
                    $('nav#nav-main').css({'position': 'relative', 'top': adminToolbarHeight});
                  }
                  else {
                    $('.bridge-enabled nav#nav-main').css({'position': 'relative', 'top': adminToolbarHeight + $('.region-bridge-area').height()});
                  }
                  $('body').removeClass('waiting-to-scroll');
                }});
                TweenMax.to('nav .crest', 0.8, {opacity: 1, delay: 1});
                TweenMax.to('nav .menu_btn', 0.8, {top: 21, opacity: 1, delay: 0.9, onComplete: function() {
                  $('header').hide(0, function() {
                    $('html, body').scrollTop(0);
                  });
                }});
                return false;
              });

              $(window).scroll(function() {
                if( $('header').css('display') != 'none' && clicked == false ) {
                  $('#arrow').click();
                  clicked = true;
                  return false;
                }
              });
            }
            else {
              $('.bridge-enabled nav#nav-main').css({'position': 'relative', 'margin-top': adminToolbarHeight + $('.region-bridge-area').height()});
            }
        }
      };

      //enquire.register(smallMobile, ellipsis);

      enquire.register(tablet, tabletBG);
      enquire.register(phablet, tabletBG);

      enquire.register(smallMobile, homepageAnimationMobile);
      enquire.register(mobile, homepageAnimationMobile);
      enquire.register(phablet, homepageAnimationMobile);
      enquire.register(tablet, homepageAnimationMobile);
      enquire.register(desktopSmall, homepageAnimation);
      enquire.register(desktop, homepageAnimation);

      enquire.register(untillDesktop, mapMobile);
      enquire.register(desktop, map);
    },

    init: function() {
      app.enquiries();
    }
  };

    /*initialise*/
    allSizes();
    app.init();

    function allSizes() {

      function selectedThumb(event) {
              var selected = event.item.index;
              $sync2.find("li").removeClass('selected');
              $sync2.find("li:eq("+selected+")").addClass('selected');
      }

      // timeline
      if( $('#timeline').length ) {
        var timeline = new TL.Timeline('timeline', Drupal.settings.TBM.timeline, {
          theme_color: "#000000",
          /*hash_bookmark: true,*/
          /*ga_property_id: "UA-27829802-4"*/
        });
      }

      /*header*/
      var winH = $(window).height();
      var winW = $(window).width();
      $('header').height(winH);

      $(window).resize(function() {
           var winH = $(window).height();
           $('header').height(winH);
      });

      /* menu */
      var menu = {
          content: $('.menu'),
          menuBtn: $('.menu_btn'),
          showing: false,
          init : function() {
              menu.menuBtn.on('click touchstart', this.showMenu);
          },
          showMenu : function(e) {
              e.preventDefault();
              if (menu.showing === false) {
                  menu.menuBtn.addClass('close');
                  menu.content.fadeIn('fast');

                  setTimeout(function() {
                      $(document).on('keyup', function(e) {
                           if (e.keyCode == 27) {
                              menu.closeMenu();
                          }
                      });
                  }, 255);

                  menu.showing = true;
              } else {
                  menu.closeMenu();
              }
          },
          closeMenu : function(e) {
              menu.menuBtn.removeClass('close');
              menu.content.fadeOut('fast');
              setTimeout(function() {
                  // Allows timing for css animation to complete
                  menu.showing = false;
                  $(document).unbind('keyup');
              }, 255);
          }
      };
      menu.init();

      $('.tab-map').click(function() {
          $("#map").gmap3({trigger:"resize"});
      });

    }

});

function checkNavHeight() {
  var headerHeight = ($('#nav-main').height() + $('#block-tbm-bridge-tbm-bridge-message').height()).toString() + 'px';
  var container = $('.container, .page-wrapper');
  if (headerHeight != container.css('margin-top') && $(window).width() > 942) {
    container.css('margin-top', headerHeight);
  }
}

function isScrolledIntoView(elem) {
    var $elem = jQuery(elem);
    var $window = jQuery(window);

    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();

    var elemTop = $elem.offset().top;
    var elemBottom = elemTop + $elem.height();

    if( elemBottom < docViewBottom ) {
      return true;
    } else if( elemTop - 300 < docViewBottom ) {
      return true;
    } else if( (( (elemBottom-450) <= docViewBottom) && (elemTop >= docViewTop)) ) {
      return true;
    } else {
      return false;
    }
}

/*left: 37, up: 38, right: 39, down: 40,
spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36*/
var keys = [37, 38, 39, 40];

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;
}

function keydown(e) {
    for (var i = keys.length; i--;) {
        if (e.keyCode === keys[i]) {
            preventDefault(e);
            return;
        }
    }
}

function wheel(e) {
  preventDefault(e);
}

function disable_scroll() {
  if (window.addEventListener) {
      window.addEventListener('DOMMouseScroll', wheel, false);
  }
  window.onmousewheel = document.onmousewheel = wheel;
  document.onkeydown = keydown;
}

function enable_scroll() {
    if (window.removeEventListener) {
        window.removeEventListener('DOMMouseScroll', wheel, false);
    }
    window.onmousewheel = document.onmousewheel = document.onkeydown = null;
}