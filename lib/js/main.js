(function(window,undefined) {

var WW = {}; // Woodwork ns


WW.ProjectBar = function($element) {
    var self = this;
    this.$element = $element,
    this.leftX = 0,
    this.firstElement = false,
    this.lastElement = false,
    this.url = '';

    this.init = function() {
        self.addListeners();
    };

    this.addListeners = function() {

        this.$element.on('mouseover', function() {

            if(!WW.ProjectOverlay.opened) {
                self.$element.find('.title').stop().animate({
                    'background-position': '0px 0px'
                }, 200, 'easeInOutQuad').addClass('selected');
            }
            else {
                if(WW.ScrollingCarousel.barActive.id-1 == self.id) {
                    self.$element.stop().animate({left: 10}, 300, 'easeOutSine');
                }
                else if(WW.ScrollingCarousel.barActive.id+1 == self.id) {
                    self.$element.stop().animate({left: -10}, 300, 'easeOutSine');
                }
            }
        });

        this.$element.on('mouseout', function() {
            if(!WW.ProjectOverlay.opened) {
                self.$element.find('.title').stop().animate({
                    'background-position': '-120px 0px'
                }, 75, 'easeInOutQuad').removeClass('selected');
            }
            else {
                if(WW.ScrollingCarousel.barActive.id-1 == self.id || WW.ScrollingCarousel.barActive.id+1 == self.id) {
                    self.$element.stop().animate({left: 0}, 300, 'easeInSine');
                }
            }
        });
    };

    this.handleClick = function() {
        if(WW.ScrollingCarousel.hidden) return;

        self.$element.stop(true,true).css({left:0});

        if(WW.ScrollingCarousel.barQueued != null) {
            //log('already queued');
            return;
        }

        WW.ScrollingCarousel.barQueued = self;
        WW.ScrollingCarousel.openProjectView();
    };

    this.foldOut = function(inDuration, callback) {
        var duration = (typeof inDuration == 'undefined')? 1000 : parseInt(inDuration);

        // add extra width when item is the first element, because it's not possible to scroll to negative values
        var extraWidth = self.firstElement? WW.ScrollingCarousel.BAR_HIDDEN_WIDTH: 0;

        self.$element
            .stop()
            .animate({
                left: -self.$element.width(),
                'margin-right': WW.ScrollingCarousel.contentWidth + extraWidth
            }, duration, 'easeInOutQuad', function() {

                if(typeof callback == 'function') {
                    callback();
                }
            })
            .addClass('active');

        WW.ScrollingCarousel.$element
            .stop()
            .animate({
                scrollLeft: self.leftX - WW.ScrollingCarousel.BAR_HIDDEN_WIDTH
            }, duration, 'easeInOutQuad');
    };

    this.foldIn = function(inDuration, callback) {
        var duration = (typeof inDuration == 'undefined')? 1000 : parseInt(inDuration);

        self.$element
            .removeClass('active')
            .stop()
            .animate({
                left: 0,
                'margin-right': 0
            }, duration, 'easeInOutQuad', function() {

                if(typeof callback == 'function') {
                    callback();
                }
            });

        WW.ScrollingCarousel.$element
            .stop()
            .animate({
                scrollLeft: self.leftX - self.$element.width()
            }, duration);
    };

    this.resize = function() {
        var height = Math.max(600, $(window).height());
        var width = 188 * (height/800);

        var top = 0;
        if(width < 188) {
            top = (height - 800) *.5;
            height = 800;
            width = 188;
        }

        var left = (180-width) * .5;
        self.$element.find('img').css({
            'height': Math.round(height),
            'width': Math.round(width),
            'left': Math.round(left),
            'top':  Math.round(top)
        });
    };

    this.init();
};

WW.ScrollingCarousel = {
    // options
    BAR_WIDTH: 180,
    BAR_HIDDEN_WIDTH: 15,

    // dom
    $element: null,
    $elementInner: null,

    // bars
    bars: [],
    barCount: 0,
    barActive: null,
    barQueued: null,
    navigating: false,
    hidden: false,

    // counters
    carouselCenter: 0,
    scrollTimer: null,
    carouselWidth: 0,
    contentAreaWidth: 0,
    contentWidth: 0,

    touchScroll : null,

    init: function($element) {
        WW.ScrollingCarousel.$element = $element;
        WW.ScrollingCarousel.$element.animate({scrollLeft:0}, 10);

        // init bars
        var i = 0;
        WW.ScrollingCarousel.barCount = WW.ScrollingCarousel.$element.find('.bar').length;
        WW.ScrollingCarousel.$element.find('.bar').each(function() {
            var bar = new WW.ProjectBar($(this));

            bar.id           = i;
            bar.firstElement = (i == 0);
            bar.lastElement  = (i+1 == WW.ScrollingCarousel.barCount);
            bar.leftX        = WW.ScrollingCarousel.BAR_WIDTH * i;
            bar.$element.css({'z-index': WW.ScrollingCarousel.barCount - i});
            bar.url          = $(this).attr('href');

            WW.ScrollingCarousel.bars.push(bar);

            i++;
        });


        // wrap inside div to make sure everything fits next to each other
        WW.ScrollingCarousel.$element.wrapInner($('<div id="carousel-inner"></div>'));
        WW.ScrollingCarousel.$elementInner = WW.ScrollingCarousel.$element.find('#carousel-inner');

        // resize
        WW.ScrollingCarousel.resize();
        WW.ScrollingCarousel.startAnimation();
    },

    startAnimation: function() {

        var b = WW.ScrollingCarousel.bars;
        var i = 1;
        for(var a in b) {
            b[a].$element.css({left: i*-180}).delay(100 + i*75).animate({left:0}, 750, 'easeInOutQuad');
            i++;
        }

        $('header h1').delay(200).fadeIn();

        setTimeout(function() {
            WW.ScrollingCarousel.addListeners();
        }, 1200);
    },

    addListeners: function() {

        if(Modernizr.touch) {
            WW.ScrollingCarousel.$element.css({'overflow-x': 'scroll', '-webkit-overflow-scrolling': 'touch', 'overflow-y': 'hidden'});
            return;
        }

        WW.ScrollingCarousel.$element.on('mouseleave', function() {
            clearTimeout(WW.ScrollingCarousel.scrollTimer);
        });

        //WW.ScrollingCarousel.$element.addClass('transform');
        WW.ScrollingCarousel.$element.on('mousemove', $.throttle(100, true, function(event) {
            var delta = event.clientX - WW.ScrollingCarousel.carouselCenter;
            var speed = Math.round(delta *.025);

            clearTimeout(WW.ScrollingCarousel.scrollTimer);

            (function moveBars() {
                WW.ScrollingCarousel.scrollTimer = setTimeout(function() {
                    WW.ScrollingCarousel.$element[0].scrollLeft += speed;
                    moveBars();
                }, 11);
            })();

        }));
    },

    removeListeners: function() {
        if(Modernizr.touch) {
            WW.ScrollingCarousel.$element.css({overflow: 'hidden'});
            return;
        }

        //WW.ScrollingCarousel.$element.removeClass('transform');
        WW.ScrollingCarousel.$element.off('mousemove mouseleave');
    },

    resize: function() {
        // resize inner div to wrap around all bars
        WW.ScrollingCarousel.carouselWidth = WW.ScrollingCarousel.barCount * WW.ScrollingCarousel.BAR_WIDTH;
        WW.ScrollingCarousel.$element.width($(window).width() - parseInt(WW.ScrollingCarousel.$element.css('left')));



        // cache some numbers
        WW.ScrollingCarousel.carouselCenter   = Math.round((WW.ScrollingCarousel.$element.width() / 2) + parseInt(WW.ScrollingCarousel.$element.css('left')));
        WW.ScrollingCarousel.contentWidth     = WW.ScrollingCarousel.$element.width() - (WW.ScrollingCarousel.BAR_HIDDEN_WIDTH*2) - WW.ScrollingCarousel.BAR_WIDTH;
        WW.ScrollingCarousel.contentAreaWidth = WW.ScrollingCarousel.$element.width() - (WW.ScrollingCarousel.BAR_HIDDEN_WIDTH*2);

        if(WW.ScrollingCarousel.barActive != null) {
            WW.ScrollingCarousel.$elementInner.width(WW.ScrollingCarousel.carouselWidth + WW.ScrollingCarousel.contentWidth);
            WW.ScrollingCarousel.barActive.$element.css({
                'margin-right': WW.ScrollingCarousel.contentWidth
            });
        }
        else {
            WW.ScrollingCarousel.$elementInner.width(WW.ScrollingCarousel.carouselWidth);
        }


        var bars = WW.ScrollingCarousel.bars;
        for(var i=0; i<bars.length; i++) {
            bars[i].resize();
        }
    },

    openProjectView: function() {
        if(WW.ScrollingCarousel.navigating) return;

        WW.ScrollingCarousel.removeListeners();
        clearTimeout(WW.ScrollingCarousel.scrollTimer);

        if(!WW.ScrollingCarousel.barQueued.lastElement) {
            WW.ScrollingCarousel.$elementInner.width(WW.ScrollingCarousel.carouselWidth + WW.ScrollingCarousel.contentWidth);
        }
        else {
            WW.ScrollingCarousel.$elementInner.width(WW.ScrollingCarousel.carouselWidth + WW.ScrollingCarousel.contentWidth + WW.ScrollingCarousel.BAR_HIDDEN_WIDTH);
        }

        // when theres an active project view, first close it
        if(WW.ScrollingCarousel.barActive != null) {
            WW.ProjectOverlay.hide(function() {
                WW.ScrollingCarousel.barActive.foldIn(750, function() {
                    WW.ScrollingCarousel.barActive = null;

                    WW.ScrollingCarousel.barQueued.foldOut(1000, function() {
                        WW.ScrollingCarousel.barActive = WW.ScrollingCarousel.barQueued;
                        WW.ScrollingCarousel.barQueued = null;

                        WW.ProjectOverlay.show();
                    });
                });
            });
        }
        else {
            WW.ScrollingCarousel.barQueued.foldOut(1000, function() {
                WW.ScrollingCarousel.barActive = WW.ScrollingCarousel.barQueued;
                WW.ScrollingCarousel.barQueued = null;

                WW.ProjectOverlay.show();
            });
        }

        WW.ScrollingCarousel.hideBlackBackground(0);
    },

    closeProjectView: function(callback) {
        WW.ScrollingCarousel.barActive.foldIn(1000, function() {
            WW.ScrollingCarousel.barActive = null;
            WW.ScrollingCarousel.barQueued = null;

            WW.ScrollingCarousel.addListeners();
            WW.NavigationManager.pageReady();

            if(typeof callback == 'function') {
                callback();
            }
        });

        WW.ScrollingCarousel.$elementInner.animate({width: WW.ScrollingCarousel.carouselWidth}, 1000, 'easeInOutQuad');

        WW.ScrollingCarousel.showBlackBackground(900);
    },

    hideCarousel: function() {
        WW.ScrollingCarousel.removeListeners();
        clearTimeout(WW.ScrollingCarousel.scrollTimer);

        var w = WW.ScrollingCarousel.$element.width() - WW.ScrollingCarousel.BAR_HIDDEN_WIDTH;
        WW.ScrollingCarousel.$element.stop().animate({scrollLeft: 0}, 500, 'linear').animate({'margin-left': w}, 500, 'easeInOutQuad');

        WW.ScrollingCarousel.hidden = true;

        WW.ScrollingCarousel.hideBlackBackground(500);
    },

    showCarousel: function() {
        WW.ScrollingCarousel.$element.stop().animate({'margin-left': 0}, 500, 'easeInOutQuad', function() {
            WW.ScrollingCarousel.addListeners();
            WW.NavigationManager.pageReady();
        });

        WW.ScrollingCarousel.hidden = false;

        WW.ScrollingCarousel.showBlackBackground(400);
    },

    getBarByURL: function(url) {
        for(var i=0; i<WW.ScrollingCarousel.bars.length; i++) {
            var bar = WW.ScrollingCarousel.bars[i];
            //log(bar.url, ' - ', url);
            if(bar.url.indexOf(url) > -1) {
                return bar;
            }
        }

        return null;
    },

    showBlackBackground: function(delay) {
        $('html, body').delay(delay).animate({'background-color': '#1f1f1f'}, 300);
    },

    hideBlackBackground: function(delay) {
        $('html, body').delay(delay).animate({'background-color': '#f7f8f9'}, 300);
    }
};


WW.ProjectOverlay = {
    CONTENT_PADDING: 10,
    MAX_CONTENT_SIZE: 900,

    $element: null,
    pictureGrid: null,
    opened: false,

    init: function($element) {
        WW.ProjectOverlay.$element = $element;

        WW.ProjectOverlay.resize();
        WW.ProjectOverlay.addListeners();
    },

    addListeners: function() {
        WW.ProjectOverlay.$element.on('mousemove', $.debounce(1000, false, function() {
            WW.ProjectOverlay.$element.find('.close-button').stop(true,true).fadeOut();
        }));

        WW.ProjectOverlay.$element.on('mousemove', $.throttle(500, false, function() {
            WW.ProjectOverlay.$element.find('.close-button').stop(true,true).fadeIn();
        }));

        WW.ProjectOverlay.$element.find('#video-placeholder').live('click', function(e) {
            e.preventDefault();
            WW.ProjectOverlay.$element.find('#video-placeholder').fadeOut();

            var videoURL = WW.ProjectOverlay.$element.find('#play-button').data('videourl');
            var $player = $('<iframe src="'+videoURL+'" width="100%" height="100%" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
            WW.ProjectOverlay.$element.find('#video').append($player);
        });

        new WW.MagicButton(WW.ProjectOverlay.$element.find('#play-button'), 95);
        new WW.MagicButton(WW.ProjectOverlay.$element.find('.close-button'), 17);

        new WW.MagicButton(WW.ProjectOverlay.$element.find('#share a.twitter'), 17);
        new WW.MagicButton(WW.ProjectOverlay.$element.find('#share a.vimeo'), 17);
        new WW.MagicButton(WW.ProjectOverlay.$element.find('#share a.facebook'), 17);
    },

    close: function(e, callback) {
        if(e) {
            e.preventDefault();
        }
        if(WW.ScrollingCarousel.barActive == null) {
            if(typeof callback == 'function') {
                callback();
            }

            return;
        }

        WW.ProjectOverlay.hide(function() {
            WW.ScrollingCarousel.closeProjectView(function() {
                if(typeof callback == 'function') {
                    callback();
                }
            });
        });
    },

    resize: function() {
        WW.ProjectOverlay.$element.width(WW.ScrollingCarousel.contentAreaWidth - (WW.ProjectOverlay.CONTENT_PADDING*2));

        WW.ProjectOverlay.resizeVideoPlayer();
        WW.ProjectOverlay.resizePictureGrid();
    },

    hide: function(callback) {
        WW.ProjectOverlay.$element.fadeOut(200, function() {
            WW.ProjectOverlay.opened = false;
            WW.ProjectOverlay.$element.html('');
            WW.ProjectOverlay.removeKeyListeners();

            if(typeof callback == 'function') {
                callback();
            }
        });
    },

    show: function() {
        WW.ProjectOverlay.$element.fadeIn(200, function() {
            WW.ProjectOverlay.opened = true;
            WW.ProjectOverlay.addKeyListeners();

            WW.NavigationManager.pageReady();

        });
    },

    addKeyListeners: function() {
        $(document).on('keyup', function(e) {
            var currentBar = WW.ScrollingCarousel.barActive;

            if(e.keyCode == 37) {
                if(currentBar.id == 0) return;
                WW.ScrollingCarousel.bars[currentBar.id-1].$element.click();
            }
            else if(e.keyCode == 39) {
                if(currentBar.lastElement) return;
                WW.ScrollingCarousel.bars[currentBar.id+1].$element.click();
            }
        });
    },

    removeKeyListeners: function() {
        $(document).off('keyup');
    },

    resizeVideoPlayer: function() {
        var w = Math.min(WW.ProjectOverlay.$element.width(), WW.ProjectOverlay.MAX_CONTENT_SIZE);

        WW.ProjectOverlay.$element.find('#video').css({
            'width': w,
            'height': Math.floor((w/16)*9),
            'margin-top': Math.floor((WW.ProjectOverlay.$element.width()-w) * .2)
        });
    },

    resizePictureGrid: function() {
        if(WW.ProjectOverlay.pictureGrid) {
            WW.ProjectOverlay.pictureGrid.resize(WW.ProjectOverlay.$element.width(), WW.ProjectOverlay.MAX_CONTENT_SIZE);
        }
    },

    initializePictureGrid: function() {
        if(WW.ProjectOverlay.$element.find('.grid').length > 0) {
            WW.ProjectOverlay.pictureGrid = new WW.PictureGrid(
                WW.ProjectOverlay.$element.find('.grid'),
                WW.ProjectOverlay.$element.width(),
                WW.ProjectOverlay.MAX_CONTENT_SIZE
            );
        }
    },

    setContent: function(content) {

        if(WW.ScrollingCarousel.barActive != null) {
            // wait 750
            setTimeout(function() {
                WW.ProjectOverlay.$element.html(content);
                WW.ProjectOverlay.resize();

                WW.ProjectOverlay.initializePictureGrid();
            }, 750);
        }
        else {
            // wait 0
            WW.ProjectOverlay.$element.html(content);
            WW.ProjectOverlay.resize();

            WW.ProjectOverlay.initializePictureGrid();
        }

    }
};


WW.PictureGrid = function($grid, width, max_width) {
    var self = this;

    this.$grid = $grid,
    this.initialWidth = width,
    this.maxWidth = max_width;

    this.init = function() {
        self.resize(self.initialWidth, self.maxWidth);
    };

    this.resize = function(width, max_width) {
        var w = Math.min(width, max_width);
        var hw = w/2 - 5;

        self.$grid.css({width: w});
        var $pics = self.$grid.find('.picture');

        $pics.filter('.portrait').css({
            width: Math.floor(hw),
            height: Math.floor(hw/16*9*2 + 10)
        });

        $pics.filter('.full').css({
            width: Math.floor(w),
            height: Math.floor(w/16*9)
        });

        $pics.filter('.landscape').css({
            width: Math.floor(hw),
            height: Math.floor(hw/16*9)
        });

        self.$grid.masonry({
            itemSelector: '.picture',
            columnWidth: Math.floor(hw),
            gutterWidth: 10

        });
    };

    self.init();
};



WW.StandardPage = {
    CONTENT_PADDING: 10,
    MIN_TOP_DISTANCE: 95,
    MAX_CONTENT_SIZE: 900,

    $element: null,
    opened: false,

    startLeftX: 0,
    pictureGrid: null,

    init: function($element) {
        WW.StandardPage.$element = $element;
        WW.StandardPage.startLeftX = parseInt($element.css('left'));

        WW.StandardPage.resize();
        WW.StandardPage.addListeners();
    },

    setContent: function(content, delay) {
        setTimeout(function() {
            WW.StandardPage.$element.html(content);
            WW.StandardPage.resize();

            WW.StandardPage.initializePictureGrid();
        }, delay);
    },

    resizePictureGrid: function() {
        if(WW.StandardPage.pictureGrid) {
            WW.StandardPage.pictureGrid.resize(WW.StandardPage.$element.width(), WW.StandardPage.MAX_CONTENT_SIZE);
        }
    },

    resizeVideoPlayer: function() {
        var w = Math.min(WW.StandardPage.$element.width(), WW.StandardPage.MAX_CONTENT_SIZE);

        WW.StandardPage.$element.find('#video').css({
            'width': w,
            'height': Math.floor((w/16)*9)
        });
    },

    initializePictureGrid: function() {

        if(WW.StandardPage.$element.find('.grid').length > 0) {
            WW.StandardPage.pictureGrid = new WW.PictureGrid(
                WW.StandardPage.$element.find('.grid'),
                WW.StandardPage.$element.width(),
                WW.StandardPage.MAX_CONTENT_SIZE
            );
        }
    },

    addListeners: function() {
        new WW.MagicButton(WW.StandardPage.$element.find('.close-button'), 17);
        new WW.MagicButton(WW.StandardPage.$element.find('#play-button'), 95);
        WW.StandardPage.$element.find('#map').live('mouseover', function() {
            $(this).find('img').stop().animate({top: -10}, 200);
        }).live('mouseout', function() {
            $(this).find('img').stop().animate({top: 0}, 100);
        });

        WW.StandardPage.$element.find('#video-placeholder').live('click', function(e) {
            e.preventDefault();
            WW.StandardPage.$element.find('#video-placeholder').fadeOut();

            var videoURL = WW.StandardPage.$element.find('#play-button').data('videourl');
            var $player = $('<iframe src="'+videoURL+'" width="100%" height="100%" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');
            WW.StandardPage.$element.find('#video').append($player);
        });

        $('#back-to-home').live('mouseover', function() {
            WW.ScrollingCarousel.$element.stop().animate({ 'margin-left': WW.ScrollingCarousel.$element.width() - WW.ScrollingCarousel.BAR_HIDDEN_WIDTH - 10});
        }).live('mouseout', function() {
            if(WW.ScrollingCarousel.hidden) {
                WW.ScrollingCarousel.$element.stop().animate({ 'margin-left': WW.ScrollingCarousel.$element.width() - WW.ScrollingCarousel.BAR_HIDDEN_WIDTH});
            }
        });
    },

    show: function(delay) {
        var $el = WW.StandardPage.$element;
        var $close = $el.find('.close-button');

        $el.css({left: WW.StandardPage.calculateAnimationStartPosition()}).show();

        setTimeout(function() {
            $el.animate({left: WW.StandardPage.startLeftX}, 500, 'easeInOutQuad', function() {
                WW.StandardPage.opened = true;
                WW.NavigationManager.pageReady();
            });
            $close.delay(500).fadeIn();

            $('#back-to-home').show();
        }, delay);
    },

    switchPage: function() {
        var $el = WW.StandardPage.$element;

        $el.animate({left: WW.StandardPage.startLeftX+100, opacity: 0}, 200, function() {
            $el.css({left: WW.StandardPage.startLeftX - 100}).show();
        }).delay(0).animate({left: WW.StandardPage.startLeftX, opacity: 1}, 200, 'easeInOutQuad', function() {
            WW.StandardPage.opened = true;
            WW.NavigationManager.pageReady();
        });
    },

    hide: function(delay) {
        var $el = WW.StandardPage.$element;
        var $close = $el.find('.close-button');

        setTimeout(function() {
            $close.fadeOut(300);
            $el.animate({left: WW.StandardPage.calculateAnimationStartPosition()}, 500, 'easeInOutQuad', function() {
                $el.hide();
                WW.StandardPage.pictureGrid = null;
                WW.StandardPage.$element.html('');
                WW.StandardPage.opened = false;
            });
        }, delay);

        $('#back-to-home').hide();
    },

    calculateAnimationStartPosition: function() {
        return WW.StandardPage.startLeftX - WW.ScrollingCarousel.BAR_HIDDEN_WIDTH - WW.StandardPage.$element.width() - 50;
    },

    close: function(e) {
        e.preventDefault();

        WW.StandardPage.hide();
        WW.ScrollingCarousel.showCarousel();
    },

    resize: function() {
        var $el = WW.StandardPage.$element;
        $el.width(WW.ScrollingCarousel.contentAreaWidth - WW.StandardPage.CONTENT_PADDING*2);

        WW.StandardPage.resizePictureGrid();
        WW.StandardPage.resizeVideoPlayer();

        if($el.height() < $(window).height()) {
            $el.css({'padding-top': Math.max(WW.StandardPage.MIN_TOP_DISTANCE, $(window).height()/2 - $el.height()/2)});
        }
        else {
            $el.css({'padding-top': WW.StandardPage.MIN_TOP_DISTANCE});
        }

        if(WW.StandardPage.opened) {
            WW.ScrollingCarousel.$element.css({ 'margin-left': WW.ScrollingCarousel.$element.width() - WW.ScrollingCarousel.BAR_HIDDEN_WIDTH});
        }
    }
};


WW.NavigationBar = {
    LOGO_AND_NAV_HEIGHT: 500,
    MIN_TOP_DISTANCE: 95,

    $element: null,
    activeHighlightTimeout: null,

    init: function($element) {
        WW.NavigationBar.$element = $element;

        WW.NavigationBar.resize();
        WW.NavigationBar.addListeners();
    },

    addListeners : function() {
        $('header nav').delay(200).fadeIn();
        setTimeout(function() {
            WW.NavigationBar.highlightMenuItem($nav.find('a').first());
        }, 200);


        var $nav = WW.NavigationBar.$element.find('nav');
        $nav.find('a').on('mouseover', function() {
            clearTimeout(WW.NavigationBar.activeHighlightTimeout);
            WW.NavigationBar.highlightMenuItem($(this));
        });

        $('header').on('mouseleave', function() {
            clearTimeout(WW.NavigationBar.activeHighlightTimeout);
            WW.NavigationBar.activeHighlightTimeout = setTimeout(function() {
                if($nav.find('a.active').length > 0) {
                    WW.NavigationBar.highlightMenuItem($nav.find('a.active'));
                }
            }, 750);
        });

        new WW.MagicButton(WW.NavigationBar.$element.find('#social a.twitter'), 27);
        new WW.MagicButton(WW.NavigationBar.$element.find('#social a.vimeo'), 27);
        new WW.MagicButton(WW.NavigationBar.$element.find('#social a.facebook'), 27);
    },

    setActive: function(id) {
        if(WW.NavigationBar.$element.find('nav').find('#'+id).length == 0) {
           id = 'our-work';
        }

        WW.NavigationBar.$element.find('nav').find('a').removeClass('active');
        WW.NavigationBar.$element.find('nav').find('#'+id).addClass('active');

    },

    highlightMenuItem: function($item) {
        $('#nav-pointer').stop().animate({ top: $item.position().top + 16 }, 500, 'easeOutBack');
        $('#nav-pointer').find('#pointer-left').stop().animate({left: $item.position().left - 5}, 500);
        $('#nav-pointer').find('#pointer-right').stop().animate({left: $item.position().left + $item.width() + 20}, 500);
    },

    resize: function() {
        var p = $(window).height() / 2 - WW.NavigationBar.LOGO_AND_NAV_HEIGHT / 2;
        WW.NavigationBar.$element.css({'padding-top': Math.max(p, WW.NavigationBar.MIN_TOP_DISTANCE)});
    }
};


WW.NavigationManager = {
    currentPageType : null,
    navigationAllowed : true,

    init: function() {
        WW.NavigationManager.addListeners();
    },

    addListeners: function() {
        $(window).on('statechange', WW.NavigationManager.handleStateChange);

        $('a:not(#play-button)').live('click', function (event) {
            var
                $this = $(this),
                url = $this.attr('href'),
                title = ($this.attr('title') || ''),
                data = null;

            title = (title != '')? title + ' | Woodwork' : 'Woodwork';

            // Continue as normal for cmd clicks etc
            if (event.which == 2
                || event.metaKey
                || typeof $this.attr('target') != 'undefined'
                || url.indexOf('mailto:') > -1) {

                return true;
            }

            if(!WW.NavigationManager.navigationAllowed) {
                return false;
            }

            History.pushState(data, title, url);

            event.preventDefault();
            return false;
        });
    },

    handleStateChange: function(event) {
        var
            State = History.getState(),
            url = State.url,
            relativeUrl = url.replace(HistoryRootURL, '')

        WW.NavigationManager.navigationAllowed = false;

        $.ajax({
            url: url,
            success: function (data, textStatus, jqXHR) {
                WW.NavigationManager.handlePageChange(data, relativeUrl);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                //document.location.href = url;
                return false;
            }
        });
    },

    handlePageChange: function(data, url) {
        if(typeof url == 'undefined') {
            url = window.location.href.replace(HistoryRootURL, '');
        }

        if(typeof _gaq != 'undefined') {
            _gaq.push(['_trackPageview']);
        }

        var pageId = $('h1', data).data('slug');
        var pageType = $('h1', data).data('class');

        WW.NavigationBar.setActive(pageId);

        if(pageType == 'home') {
            if(WW.NavigationManager.currentPageType == 'page') {
                WW.StandardPage.hide();
                WW.ScrollingCarousel.showCarousel();
            }
            else if(WW.NavigationManager.currentPageType == 'project') {
                WW.ProjectOverlay.close();
            }
        }
        else if(pageType == 'page') {
            if(WW.NavigationManager.currentPageType == 'page') {
                WW.StandardPage.setContent($('#page', data).html(), 200);
                WW.StandardPage.switchPage();
            }
            else {
                WW.ProjectOverlay.close(null, function() {
                    WW.ScrollingCarousel.hideCarousel();

                    WW.StandardPage.setContent($('#page', data).html(), 450);
                    WW.StandardPage.show(500);
                });
            }
        }
        else if(pageType == 'project') {
            bar = WW.ScrollingCarousel.getBarByURL(url);
            bar.handleClick();

            WW.ProjectOverlay.setContent($('#project-detail', data).html());
        }

        WW.NavigationManager.currentPageType = pageType;
    },

    pageReady: function() {
        WW.NavigationManager.navigationAllowed = true;
    }
};


WW.MagicButton = function($element, button_width) {
    $element.live('mouseover',function() {
        $(this).find('span').stop().animate({ width: button_width }, 200, 'easeInOutQuad');
    });
    $element.live('mouseout',function() {
        $(this).find('span').stop().animate({ width: 0 }, 100, 'easeInOutQuad');
    });
};



















var History, HistoryRootURL;
$(function() {
    History = window.History,
        HistoryRootURL = History.getRootUrl();

    WW.ScrollingCarousel.init($('#carousel'));
    WW.ProjectOverlay.init($('#project-detail'));
    WW.StandardPage.init($('#page'));
    WW.NavigationBar.init($('header'));

    WW.NavigationManager.init();
    setTimeout(function() {
        WW.NavigationManager.handlePageChange($('body'));
    }, 1500);


    $(window).on('resize', $.throttle(75, false, function() {
        WW.ScrollingCarousel.resize();
        WW.ProjectOverlay.resize();
        WW.StandardPage.resize();
        WW.NavigationBar.resize();
    }));
});



})(window);