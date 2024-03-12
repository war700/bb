(function($) {

    Drupal.behaviors.chatWindow = {
      attach: function(context, settings) {
        // We only want to add this widget on a vanilla page load.
        var pageLoadContext = $('body', context);
        // If there aren't any chat widgets in settings then there aren't any on
        // the page so we return. We also check against our percentage and any
        // cookies the user may have as an additional
        var chatWidgets = settings.quicken_chat ? settings.quicken_chat.chatWindows : null;
        if (!chatWidgets || !quickenChatWindowShow(settings) || !pageLoadContext.length) {
          return;
        }
  
  
        $.getScript('https://quicken.widget.custhelp.com/euf/rightnow/RightNow.Client.js', function() {
          var len = chatWidgets.length;
          for (var i = 0; i < len; i++) {
            quickenChatWindowBuild(chatWidgets[i], i);
          }
        });
      }
    }
  
    /**
     * Makes a decision as to whether a chat window should show for the current
     * user and sets that decision as a cookie in their browser. Once the cookie is
     * set this function will check for that cookie first before making a new
     * decision.
     *
     * @param object settings
     *  Drupal settings.
     * @return boolean
     *  True if the window should show, false if it should not.
     */
  var quickenChatWindowShow = function(settings) {
    var pct = parseFloat(settings.quicken_chat.chatWindowPct);
    if (($.cookie('quicken_support_chat') && $.cookie('quicken_support_chat') < 1) || pct == 0) {
      return false;
    }
    var rand = Math.random();
    var chatCookieVal = rand > pct ? 0 : 1;
      $.cookie('quicken_support_chat', chatCookieVal, {
        path: "/",
        domain: Drupal.baseurl,
        expires: 7,
        secure: true
      });
    return chatCookieVal == 1;
  }
  
  /**
   * Builds the chat window and inserts it into the dom.
   *
   * @param object $conf
   *  The chat widget conf from panels.
   * @param number $index
   *  A unique index for the conf, used to ensure that all html ids are unique.
   */
  var quickenChatWindowBuild = function($conf, $index) {
    var chatWidget = $('<div class="quickenchatwidget ' + $conf.widget_class + '">');
    chatWidget.append($('<div><span class="qc-ask-community"></span><a href="/community">Ask the community</a></div>'));
    var ids = ['QuickenChatLinkContainer', 'QuickenChatLink', 'QuickenChatLinkInfo'];
    var divs = {};
    var len = ids.length;
    for (var i = 0; i < len; i++) {
      divs[i] = i == 0 ? $('<div class="chatlinkcontainer">') : $('<div>');
      divs[i].attr('id', ids[i] + '-' + $index);
      if (i > 0) {
        divs[i - 1].append(divs[i]);
      }
    }
    chatWidget.append(divs[0]);
    chatWidget.insertAfter($conf.selector);
  
    RightNow.Client.Controller.addComponent(
      {
        container_element_id: 'myChatLinkContainer' + '-' + $index,
        chat_login_page: $conf.agent_path,
        c: $conf.category_id,
        info_element_id: 'QuickenChatLinkInfo' + '-' + $index,
        label_available_immediately_template: "Chat Now",
        link_element_id: 'QuickenChatLink' + '-' + $index,
        wait_threshold: 180,
        instance_id: 'sccl_0',
        module: 'ConditionalChatLink',
        p: $conf.product_id,
        type: 7
      },
      'https://quicken.widget.custhelp.com/ci/ws/get'
    );
  }
  
  })(jQuery);
  ;
  
  if (typeof QuickenGlobal === 'undefined') {
    QuickenGlobal = {};
  }
  
  QuickenGlobal.loaded = function(name) {
    var loaded_time = Date.now();
    var total = loaded_time - QuickenGlobal.start_page_time;
  
    if ((typeof mixpanel !== 'undefined') && (mixpanel !== null)) {
      mixpanel.track("Timing", {
        "name": name,
        "time": total
      });
    }
  
  };
  
  (function($) {
    QuickenGlobal.productSelector = {
      /**
       * Guided Product Selector (QMNT-7155)
       *
       * To activate the Product Selector modal on any page,
       * set up a button / link in this fashion:
       *
       *   <a
       *      href='#'
       *      data-compare-plans-url='https://example.quicken.com/compare'
       *      data-toggle='modal'
       *      data-target='#product-selector'
       *   >
       *     Product Selector
       *   </a>
       *
       *   <button
       *      type="button"
       *      data-compare-plans-url='https://example.quicken.com/compare'
       *      data-toggle='modal'
       *      data-target='#product-selector'
       *   >
       *     Product Selector
       *   </button>
       */
  
      setup: () => {
        const {
          setComparePlansUrl,
          onClickHeaderButton,
        } = QuickenGlobal.productSelector;
  
        if ($('#product-selector').length === 0) {
          $('body').append(`
            <style>
              #product-selector .modal-dialog {
                width: calc(100vw - 20px);
                height: 97%;
              }
              #product-selector .modal-content {
                border-radius: 20px;
                height: 100%;
              }
              #product-selector .modal-body {
                padding: 0;
                position: absolute;
                top: 53px;
                left: 0;
                right: 0;
                bottom: 0;
              }
              #product-selector .modal-body .embed-responsive {
                padding-bottom: unset;
                height: 100%;
              }
              #product-selector .modal-header {
                background: #F6F7F8;
                display: flex;
                justify-content: center;
                border-radius: 20px 20px 0 0;
              }
              #product-selector .modal-header .close {
                margin: 0px;
                font-size: 30px;
                right: 15px;
                top: 13px;
                position: absolute;
                opacity: 0.5;
              }
              #product-selector .modal-header .back {
                border: 0;
                padding: 0;
                position: absolute;
                top: 17px;
                left: 15px;
                background: transparent;
              }
              #product-selector .modal-header .button {
                color: #2F3EA8;
                border: solid 1.2px #2F3EA8;
                height: 24.4px;
                border-radius: 24px;
                margin: 0 8px;
                background: #fff;
                padding: 0px 21px;
                font-size: 10px;
                text-transform: none;
              }
            </style>
  
            <div aria-hidden='true' style='display: none;' class='modal fade' id='product-selector' role='dialog' tabindex='-1'>
              <div class='modal-dialog modal-dialog-centered' role='document'>
                <div class='modal-content'>
                  <div class="modal-header">
                    <button type="button" class="back" data-action-type="navigate" data-action-value="-1">
                      <img src="/misc/arrow-left.svg" alt="Back" title="Back" />
                    </button>
                    <button type="button" class="button" data-action-type="reset">Start Over</button>
                    <button type="button" class="button" data-action-type="compare-plans">Compare Plans</button>
  
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
  
                  <div class='modal-body'>
                    <div class='embed-responsive embed-responsive-16by9'>
                      <iframe src='about:blank'></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `);
          $('#product-selector').on('shown.bs.modal', ({ relatedTarget }) => {
            setComparePlansUrl($(relatedTarget).data('compare-plans-url'));
            $("#product-selector iframe").attr('src', '/in-product/product-selector/build/index.html?release=Drupal-9.10.0');
          });
          $('#product-selector').on('hide.bs.modal', () => {
            $("#product-selector iframe").attr('src', '');
          });
          $('#product-selector .modal-header button').on('click', onClickHeaderButton);
        }
      },
  
      /**
       * Handle clicks on any of the buttons in the modal header
       * @param {Event} param0
       */
      onClickHeaderButton: ({ currentTarget }) => {
        const {
          dispatch,
          currentPageIndex,
          comparePlansUrl,
        } = QuickenGlobal.productSelector;
        const $button = $(currentTarget);
        const action = {
          type: $button.data('action-type'),
          value: undefined,
        };
        if (action.type === 'navigate') {
          action.value = parseInt($button.data('action-value'));
          if (currentPageIndex === 0 && action.value < 0) {
            // Close modal if click BACK from first page
            $('#product-selector button.close').click();
          }
        }
        if (action.type === 'compare-plans') {
          if (comparePlansUrl) {
            window.location.href = comparePlansUrl;
          } else {
            // Close modal if no compare-plans URL, on the
            // assumption that the guided product selector
            // was launched from within the appropriate
            // compare-plans page in the first place.
            $('#product-selector button.close').click();
          }
        }
        dispatch(action);
      },
  
      /**
       * The dispatcher provides communication between the
       * parent window and the iframe React application.
       */
      dispatch: () => console.error('Dispatcher not yet connected.'),
  
      /**
       * Set the destination of the Compare Plans header button
       */
      comparePlansUrl: undefined,
      setComparePlansUrl: (url) => QuickenGlobal.productSelector.comparePlansUrl = url,
  
      /**
       * The dispatcher callback is overridden by the iframe React application
       */
      setDispatcher: (dispatcher) => QuickenGlobal.productSelector.dispatch = dispatcher,
  
      /**
       * Keeps the host window informed of which page is being
       * rendered in the iframe React application.
       */
      currentPageIndex: undefined,
      setPageIndex: (pageIndex) => {
        const {
          isMobile,
          productSelector: {
            currentPageIndex,
            scrollTop,
          }
        } = QuickenGlobal;
        if (currentPageIndex !== pageIndex) {
          scrollTop();
        }
        QuickenGlobal.productSelector.currentPageIndex = pageIndex;
        const $backButton = $('#product-selector .modal-header button.back');
        if (pageIndex === 0 && !isMobile()) {
          $backButton.addClass('hidden');
        }
        else {
          $backButton.removeClass('hidden');
        }
      },
  
      scrollTop: () => {
        $('#product-selector iframe')[0].contentWindow.scroll(0,0);
        $('#product-selector')[0].scroll(0,0);
      },
  
      /**
       * A convenience method, accessible via console in the host window.
       * Resets all state data to default value.
       */
      reset: () => QuickenGlobal.productSelector.dispatch({
        type: 'reset'
      }),
    };
  
    /**
     * Returns true if a mobile browser is detected.
     */
    function isMobile() {
      let check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    };
  
    function isMac() {
      var mac = false;
      var path = window.location.pathname;
  
      // Check if on a mac page
      if (path.indexOf('/mac') === 0) {
        mac = true;
      }
      if (path.indexOf('/quicken-2015-mac') >= 0) {
        mac = true;
      }
  
      // Check if we are coming from a seach that had mac in it
      // Bing will send this, looks like yahoo and google don't
      var pos = document.referrer.indexOf('?q=');
      if (pos >= 0) {
        pos = pos + 3;
        if (document.referrer.slice(pos).indexOf('mac') > 0) {
          mac = true;
        }
      }
      return mac;
    }
  
    function isSEO() {
      var seo = false;
      var ref = document.referrer;
      var pcol = ref.indexOf("://") + 3;
  
      // Check for google dot com and dot co dot uk etc
      if (ref.indexOf("google.") == pcol || ref.indexOf("www.google.") == pcol) {
        seo = true;
      }
      // bing always redirects back to bing dot com for intl sites
      if (ref.indexOf("bing.com") == pcol || ref.indexOf("www.bing.com") == pcol) {
        seo = true;
      }
      // yahoo does the same as bing except to r.seaarch....
      if (ref.indexOf("r.search.yahoo.com") == pcol) {
        seo = true;
      }
      // duckduckgo is a search engine
      if (ref.indexOf("duckduckgo.") == pcol) {
        seo = true;
      }
      return seo;
    }
  
    /**
     * Get's user's device from userAgent.
     *
     * @return string
     * The device.
     */
    function quickenUserDevice() {
      var regex = /\(([A-z0-9\s\.]+);/;
      var ua = navigator.userAgent.match(regex);
      if (ua && ua[1]) {
        return ua[1];
      }
      return false;
    }
  
    function userCanSeeDiscount() {
      var subs = JSON.parse($.cookie("qkn_subscriber"));
  
      if (!subs) {
        return true;
      }
      if (subs && subs.is_subscriber === 0) {
        return true;
      }
      if (subs && subs.sees_discount && subs.sees_discount === 1) {
        return true;
      }
      else {
        if (subs && subs.exp_date && subs.exp_date > 0) {
          var timestamp = subs.exp_date;
          var now = Math.floor(Date.now() / 1000);
  
          if (timestamp > now) {
            return false;
          }
  
          var seconds = now - timestamp;
  
          // discount if expired within 45 to 60 days amd over 90
          var days =  Math.floor(seconds / 60 / 60 / 24);
          if (((days >= 45) && (days <= 60)) || (days >= 90)) {
            subs.sees_discount = 1;
            $.cookie("qkn_subscriber", JSON.stringify(subs), {secure: true});
            return true;
          }
        }
      }
      return false;
    }
  
    /**
     * Determines if the user is a subscriber based on subscriber cookie state.
     */
    function userIsSubscriber() {
      var subs = JSON.parse($.cookie("qkn_subscriber"));
  
      if (subs && subs.is_subscriber) {
        return true;
      }
  
      return false;
    }
    /**
     * Return US or CA depending on the current URL
     */
    function getCountry() {
      return window.location.pathname.startsWith("/canada/") ? "CA" : "US";
    }
  
    /**
     * Return the concatenated saved coupon codes in a foramt that can be set to the back end
     * the data param
     */
    function getCouponCodes(data) {
      var coupon = "";
      var couponsArray = [];
  
      if (data && data.coupon)  {
        for (var i = 0; i < data.coupon.length; i++) {
          var coupons = data.coupon[i];
          couponsArray.push(coupons.code);
        }
  
        // data.coupon.forEach(coupons => {
        //   couponsArray.push(coupons.code);
        // });
        coupon = couponsArray.join();
      }
      return coupon;
    }
  
    function runQKNPricing(classes, url) {
      if (Quicken.DynamicPricing ) {
        let qdp = new Quicken.DynamicPricing(classes);
  
        document.addEventListener('couponDataSet', function (e) {
          console.log("caught setCoupon event");
          qdp.clearData();
          getCouponFromStorage();
        });
        if (!url) {
          qdp.setURL(window.location.origin + '/get_sku_coupon_prices');
        }
        else {
          qdp.setURL(url);
        }
        if (window.qkn_yearly) {
          qdp.setYearly(true);
        }
  
        // "Loops" until the coupon data is written to local storage
        const id = setInterval(getCouponFromStorage, 50);
        let count = 0;
  
        function getCouponFromStorage() {
          let data = JSON.parse(localStorage.getItem("couponData"));
  
          if (QuickenGlobal.userCanSeeDiscount()) {
            coupon = QuickenGlobal.getCouponCodes(data);
            if (window.qkn_coupon && window.qkn_coupon !== "" ) {
              coupon = window.qkn_coupon;
            }
            if (coupon) {
              console.log("cID : " + id);
              clearInterval(id);
              qdp.setCoupon(coupon);
              qdp.adjustPrices();
            }
            else {
              count++;
              console.log(". " + count);
            }
          }
          else {
            clearInterval(id);
            qdp.adjustPrices();
          }
          if (count === 10) {
            clearInterval(id);
            qdp.adjustPrices();
          }
        }
      }
    }
  
    QuickenGlobal.isSEO = isSEO;
    QuickenGlobal.isMac = isMac;
    QuickenGlobal.isMobile = isMobile;
    QuickenGlobal.userDevice = quickenUserDevice();
    QuickenGlobal.userCanSeeDiscount = userCanSeeDiscount;
    QuickenGlobal.userIsSubscriber = userIsSubscriber;
    QuickenGlobal.getCountry = getCountry;
    QuickenGlobal.getCouponCodes = getCouponCodes;
    QuickenGlobal.runQKNPricing = runQKNPricing;
    QuickenGlobal.userCountry = 'US';
    // Evaluate confirmed non-US or CA country
    QuickenGlobal.userIsConfirmedNonUSorCA = function() {
      return typeof this.userCountry == 'string' &&
        this.userCountry.length == 2 &&
        this.userCountry != 'US' &&
        this.userCountry != 'CA';
    };
    QuickenGlobal.userIsMobile = function() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    QuickenGlobal.userIsIOS = function() {
      return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    };
    QuickenGlobal.userIsAndroid = function() {
      return /Android/i.test(navigator.userAgent);
    };
  
    $().ready(QuickenGlobal.productSelector.setup);
  })(jQuery);
  
  (function(window) {
  
    // IE, 'nuff said
    if (!Array.includes) {
      Array.prototype.includes = function(obj) {
        var i = this.length;
        while (i--) {
          if (this[i] === obj) {
            return true;
          }
        }
        return false;
      };
    }
  
    if (window.location.search.length) {
      if (window.location.search.indexOf('utm_medium=email') > 0) {
        jQuery.cookie('utm_medium', 'email', {'path': '/', secure: true});
      }
      else if (window.location.search.indexOf('utm_medium=directmail') > 0) {
        jQuery.cookie('utm_medium', 'directmail', {'path': '/', secure: true});
      }
    }
    //var subs = JSON.parse(jQuery.cookie("qkn_subscriber"));
  
    if (!QuickenGlobal.userCanSeeDiscount()) {
      jQuery(".promo-banner").css('display', 'none');
      jQuery(document).on('ready', function() {
        jQuery(".novpromo-footer").css('display', 'none');
      });
    }
  
  
  })(this);
  
  
  (function($, Drupal, QuickenGlobal) {
    Drupal.behaviors.quickenGlobal = {
      attach: function(context, settings) {
  
        if (this.isTopAccessible()) {
          if (window.location !== window.top.location) {
            var pages = settings.quicken.breakout_pages;
            if (pages.includes(window.location.pathname)) {
              window.top.location = window.location;
            }
          }
        }
        if (settings.currentPath === "non-sub/web") {
          if (jQuery.cookie("qkn_country") === "CA" && (settings.basePath === '/')) {
            window.location.href = "/canada/non-sub/web";
          }
        }
  
        if (settings.currentPath === "front" && settings.quicken_global.sign_in_preload) {
          var loader = document.createElement('iframe');
          loader.src = settings.quicken_global.sign_in_preload_url;
          loader.width = 0;
          loader.height = 0;
          $('body').append(loader);
        }
  
        if (settings.basePath === '/canada/') {
          jQuery.cookie("qkn_country", "CA", {path: "/", secure: true});
          // Canada OS rewrites.
          if ((typeof settings.quicken_global !== 'undefined') && settings.quicken_global.os_redirect_enabled) {
            this.comparePageLinkAlterCA(context);
          }
        }
        else {
          jQuery.cookie("qkn_country", "US", {path: "/", secure: true});
          // Rewrite compare page links if OS rewrite is enabled.
          // settings.quicken_global is undefined for the imce module because
          // quicken_global_page_build() does not run with imce.
          if ((typeof settings.quicken_global !== 'undefined') && settings.quicken_global.os_redirect_enabled) {
            this.comparePageLinkAlter(context);
            this.maybeRedirectMacUsers(context);
          }
  
          // Fix for Firefox when we redirect to a URL with a fragment.
          // Scrolling after a redirect based on a URL fragment does not work well
          // in Firefox.
          var regex = /Firefox/;
          if (regex.test(navigator.userAgent)) {
            var scroll_id = window.location.hash || null;
            if (scroll_id) {
              var elem = $(scroll_id);
  
              if (elem.length) {
                var $screen = $('html, body', context);
                var topOffset = parseInt(elem.offset().top);
                var paddingTop = parseInt(elem.css('padding-top'));
                var scrollAmount = topOffset - ($screen.height() - topOffset) - paddingTop;
                $screen.scrollTop(scrollAmount);
              }
            }
          }
        }
  
        /**
         * Any link with class cp-url-params will be appended with the url
         * paramaters of the current page. Usefuly for 1-year or 2-year links to
         * companion landing pages where you want to preserve the url paramaters
         * on those pages.
         */
        var params = window.location.search.slice(1);
        if (params !== "") {
          $('a.cp-url-params:not(.cp-url-params-processed)', context).each(function(index, value) {
            var concat = '?';
            var href = $(value).attr('href');
            if (href.indexOf('?') >= 0) {
              concat = '&';
            }
            href = href + concat + params;
            $(value).attr('href', href).addClass('cp-url-params-processed');
          });
        }
  
        // Open zoomable images in a colorbox modal.
        $('body').on('click', 'img.colorbox-zoom', function (e) {
          e.preventDefault();
          var imageUrl = $(this).parent().attr('href');
          // Fallback to image's URL if image is not a link.
          if (!imageUrl) {
            imageUrl = $(this).attr('src');
          }
          $.colorbox({
            href: imageUrl,
            className: 'colorbox-zoom--opened',
            maxWidth: '100%'
          });
        });
  
      },
  
      isTopAccessible: function() {
        try {
          window.top.location.href;
          return true;
        }
        catch (err) {
          return false;
        }
      },
  
  
    comparePageLinkAlter: function(context) {
        // Paths /compare and /compare/mac need to redirect to /mac/compare for
        // OSX users.
        if (QuickenGlobal.userDevice != 'Macintosh') {
          return;
        }
  
        var comparePageMac = '/mac/compare';
        var regex = /\/compare(\/mac)?$/i;
  
        // Header primary nav link.
        var $headerLink = $('.navbar a[href="/compare"]', context);
        $headerLink.attr('href', comparePageMac);
        if (window.location.pathname == comparePageMac) {
          $headerLink.addClass('active');
        }
        $('#footer .fine-print a[href="/compare"]', context).attr('href', comparePageMac);
  
        $('body.front main a:not(.no-os-rewrite)')
          .filter(function() {
            return $(this).attr('href').match(regex) && !$(this).text().match(/windows/i);
          })
          .each(function() {
            $(this).attr('href', comparePageMac);
          });
      },
  
      comparePageLinkAlterCA: function(context) {
        // Alter compare page links but the Canada version.
        if (QuickenGlobal.userDevice != 'Macintosh') {
          return;
        }
  
        var comparePageMac = '/canada/compare/mac';
        var regex = /\/canada\/compare(\/mac)?$/i;
  
        $('.navbar a[href="/canada/compare"]:not(.no-os-rewrite)', context).attr('href', comparePageMac);
        $('#footer .fine-print a[href="/canada/compare"]', context).attr('href', comparePageMac);
  
        $('.page-home main a:not(.no-os-rewrite)')
          .filter(function() {
            return $(this).attr('href').match(regex) && !$(this).text().match(/windows/i);
          })
          .each(function() {
            $(this).attr('href', comparePageMac);
          });
      },
  
      // this is our opportunity to redirect to the Mac version of a page when
      // appropriate. for example, we need to redirect /turbotax/amazon to
      // /turbotax/amazon/mac
      maybeRedirectMacUsers: function() {
        if (QuickenGlobal.userDevice != 'Macintosh') {
          return;
        }
        // Placeholder.
      }
    };
  
  })(jQuery, Drupal, QuickenGlobal);
  ;
  /**
   * @file
   * Custom JavaScript for Right Price Right Person.
   */
  
  (function ($, Drupal) {
    'use strict';
  
    Drupal.qknSubscriberCookie = function() {
      this.subscriberCookie = JSON.parse($.cookie('qkn_subscriber')) || null;
    };
  
    Drupal.qknSubscriberCookie.prototype.is_cookied = function() {
      if (typeof this.subscriberCookie != "object" || this.subscriberCookie == null) {
        return false;
      }
      return true;
    };
  
    Drupal.qknSubscriberCookie.prototype.is_subscriber = function() {
      if (!this.is_cookied()) {
        return false;
      }
      if (typeof this.subscriberCookie == "object" && this.subscriberCookie.hasOwnProperty('is_subscriber')) {
        if (this.subscriberCookie.is_subscriber == 1) {
          return true;
        }
      }
      return false;
    };
  
    Drupal.qknSubscriberCookie.prototype.is_customer = function() {
      if (!this.is_cookied()) {
        return false;
      }
      if (typeof this.subscriberCookie == "object" && this.subscriberCookie.hasOwnProperty('is_customer')) {
        if (this.subscriberCookie.is_customer == 1) {
          return true;
        }
      }
      return false;
    };
  
  })(jQuery, Drupal);
  ;
  (function ($) {
  
    'use strict';
  
    Drupal.behaviors.lazy = {
      attach: function (context, settings) {
        if(!settings.lazy) {
            return;
        }
        var options = settings.lazy.bLazy ? settings.lazy.bLazy : {};
        Drupal.blazy = new Blazy(options);
      }
    };
  
  })(jQuery);
  ;
  