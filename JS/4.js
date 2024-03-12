/**
 * @file
 * Custom JavaScript for the subscriptions page.
 */

(function ($) {
    Drupal.behaviors.subscriptions = {
  
      $code_text_fld: null,
      $code_btn: null,
      code_length: 19,
      full_length: false,
  
      attach: function (context, settings) {
  
        $('button[data-toggle-modal]', context).click(function(e) {
          e.preventDefault();
          var $modal = $($(this).attr('data-toggle-modal'));
          $('.modal').hide();
          $modal.show();
        });
  
        $('.modal-close,.modal .close', context).click(function(e) {
          e.preventDefault();
          $(this).closest('.modal').hide();
        });
  
        var $setup = $('.pane-quicken-activation-welcome',context);
        if ($setup.length !== 0) {
  
          $('#help-text-open').on('click', function(e) {
            e.preventDefault();
            $('#help-dialog').css('display','block');
          });
  
          $('.form-close').on('click', function (e) {
            $('#help-dialog').css('display','none');
          });
  
        }
  
        var $embedded_welcome = $('.pane-activation-welcome-embedded', context);
        if ($embedded_welcome.length) {
          if (navigator.userAgent.indexOf('Windows NT') === -1) {
            $('#switch-user-message-gen', $embedded_welcome).hide();
            $('#switch-user-message-mac', $embedded_welcome).show();
          }
        }
  
        var $activation = $('.page-activation', context);
        if ($activation.length === 0 ) {
          return;
        }
        var $code_text_fld = $('.form-item-code #edit-code', context);
        var $renewal_form = $('#quicken-activation-renewal-form');
        var $subscription_error_text = $('.subscription-error-text', context);
        var $code_btn = $('.activation-code-btn', context);
        var $close_window_btn = $('#close-window-activation-btn',context);
        var $show_help = $('.find-activation-code',context);
        var $hide_help = $('.close-activation-code-help',context);
        var $address = $('.js-checkout-billing-address', context);
        var $city = $('.js-checkout-billing-city', context);
        var $state = $('.js-checkout-billing-state', context);
        var $billing_zip = $('.js-checkout-billing-zip',context);
        var $success = $('.page-activation-success',context);
        var $check_info = $('.sub-txt',context);
  
        if ($check_info.length !== 0) {
          if (QuickenGlobal.userDevice === 'Macintosh') {
            $check_info.html('click <strong>Check for Updates</strong> from the Quicken menu to activate your membership');
          }
        }
  
        if ($success.length !== 0) {
          if (QuickenGlobal.userDevice === 'Macintosh') {
            $('.on-windows').hide();
            $('.on-mac').show();
          }
          else {
            $('.on-mac').hide();
            $('.on-windows').show();
          }
        }
  
        if ($billing_zip.length !== 0) {
          Drupal.behaviors.customerInfo.autocomplete($address, $city, $state, $billing_zip);
          var $submit = $('.js-customer-info-submit', context);
          var $firstname = $('.js-checkout-billing-firstname', context);
          var $lastname = $('.js-checkout-billing-lastname', context);
          var $address = $('.js-checkout-billing-address', context);
          var $address_2 = $('.js-checkout-billing-address-2', context);
          var $city = $('.js-checkout-billing-city', context);
          var $state = $('.js-checkout-billing-state', context);
          var $zip = $('.js-checkout-billing-zip', context);
          var $where = $('.js-activate-where', context);
          var $usage = $('.js-activate-usage', context);
  
          var $where_col = $('.where-did-you-buy-col', context);
  
          var $profile_fields = [$firstname, $lastname, $address, $city, $state, $zip, $where, $usage];
  
          if ($where.val()) {
            $where_col.css('display','none');
          }
  
          var that = this;
  
          $submit.on('click', function(e) {
            e.preventDefault();
            setTimeout(function() {
              var validation = that.validateProfileInfo($profile_fields);
              if (!validation) {
                return false;
              }
              $submit.off('click');
              $submit.trigger('click');
            },1000);
          });
  
        }
  
        if ($renewal_form.length !== 0) {
          $show_help.click(function (e) {
            e.preventDefault();
            $('.find-activation-code').fadeOut('slow', function () {
              $('.help-box').slideDown();
            });
          });
        }
  
        if ($code_text_fld.length !== 0) {
  
          $code_text_fld.mask("AAAA-AAAA-AAAA-AAAA", {placeholder: "XXXX-XXXX-XXXX-XXXX"});
  
          var that = this;
  
          $code_btn.on('click', function(e) {
            if (!that.validate($code_text_fld.val())) {
              e.preventDefault();
            }
          });
  
          $code_text_fld.keyup(function () {
            if ($code_text_fld.val().length === that.code_length) {
              this.full_length = true;
              if (that.validate($code_text_fld.val())) {
                $code_text_fld.addClass('completed');
                $code_btn.removeClass('disabled');
                $code_text_fld.removeClass('error');
                $subscription_error_text.hide();
              }
            }
            else {
              $code_text_fld.removeClass('completed');
              $code_btn.addClass('disabled');
            }
          });
  
          var $error = $(".messages.error");
          var error_code = $.cookie("qkn_activation_flow");
          var error_code_ext;
  
          try {
            error_code_ext = JSON.parse($.cookie("qkn_activation_flow_ext"));
          }
          catch (e) {
          }
  
          if (error_code) {
            $.cookie("qkn_activation_flow", "", {secure: true});
  
            var error_messages = {'QCS-0400-8' : 'Sorry, this code has already been activated.',
              'QCS-0401-2': 'There was an authorization error, please sign in again.',
              'CODE_UNRECOGNIZED': 'That is not a valid activation code.<br/>Please check your activation code and try again.',
              'CODE_UNAVAILABLE': 'This code has already been redeemed Please <br/> <a href="/support">contact customer support<a/> for more information.',
              'CODE_EXPIRED': 'This code has expired Please <br/> <a href="/support">contact customer support<a/> for more information.',
              'CODE_ALREADY_CONSUMED_BY_USER': 'You have already redeemed this code. Please <br/> <a href="/support">contact customer support<a/> for more information.',
              'ACTIVATION_VIOLATES_SUBSCRIPTION_RULES': 'You recently went through an upgrade of membership. <br/>Please come back later to upgrade again',
              'ALLOWED_FOR_NEW_USER_ONLY': 'The product you purchased is for New Subscribers only, and you are an existing subscriber. You can request a refund for this product by going  <a href="/refund">here<a/>. In your Quicken software, go to the help menu and select My Quicken Account to review your renewal options.',
              'SUBSCRIPTION_CREATION_FAILED': 'The call to the subscription service failed, please try again later.',
              'QCS-0500-1' : 'An unknown error occurred please try again.'};
  
            $code_text_fld.addClass('error');
  
            var message = error_messages[error_code] || 'An unknown error occurred please try again.';
  
            if ((error_code === 'ACTIVATION_VIOLATES_SUBSCRIPTION_RULES') && error_code_ext) {
              var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  
              if (error_code_ext.relativeTier === 'equal' || (error_code_ext.relativeTier === 'lesser')) {
                message = 'Please wait until ' + new Date(error_code_ext.consumableOn).toLocaleDateString("en-US", options) + ' to redeem this activation code.';
              }
            }
            $subscription_error_text.html(message);
            $subscription_error_text.show();
          }
          else {
            $code_text_fld.keyup();
          }
        }
  
        var $renew_link = $('.js-renewal-trigger', context);
        var $renew_copy = $('.js-renewal-copy', context);
  
        $renew_link.click(function (e) {
          e.preventDefault();
  
          if ($renew_copy.is(":visible")) {
            return;
          }
  
          $renew_copy.fadeIn(300, function(){
            $renew_copy.focus();
          });
        });
  
        $renew_copy.blur(function (e) {
          $renew_copy.fadeOut(300);
        });
  
        $show_help.click(function (e) {
          e.preventDefault();
          $('.find-activation-code').fadeOut('slow', function(){
            $('.help-box').slideDown();
          });
  
        });
  
        $hide_help.click(function(e) {
          e.preventDefault();
          $('.help-box').slideUp(function() {
            $('.find-activation-code').fadeIn();
          });
  
        });
      },
  
      isEmpty: function(e) {
        return e === null || e === '';
      },
  
      showError: function(field) {
        var msg = field.parent().next('.js-customer-info-error');
        msg.removeClass('hidden');
        field.addClass('error');
      },
  
      validateProfileInfo: function($profile_fields) {
        var success = true;
        for (var i = 0; i < $profile_fields.length; i++) {
          var field = $profile_fields[i];
  
          if ((this.isEmpty(field.val())) || (field.val() === '00')) {
            this.showError(field);
            success = false;
          }
        }
        return success;
      },
  
      validate: function(val) {
        if (val) {
          return (val.length === 19)
        }
        else {
          return true;
        }
      }
  
    };
  })(jQuery);
  ;
  /**
   * @file
   * Custom JavaScript for Braintree checkout form.
   */
  
  (function($) {
    Drupal.behaviors.activationRenewal = {
      attach : function(context, settings) {
        var $body = $('html, body', context);
        var $braintree_form = $('.js-braintree-form', context);
        var $renewal_page = $('.page-activation-renewal',context);
  
        if ((!$braintree_form.length) || (!$renewal_page.length)) {
          return;
        }
  
        // Advanced Fraud Protection Data
        var deviceData = null;
  
        var $payment_error = $('#js-cart-review-error', context);
  
        var $ccValid = $('.js-checkout-cc', context);
  
        var $cvv_link = $('.js-cvv-trigger', context);
        var $cvv_copy = $('.js-cvv-copy', context);
  
        var $cc_name = $('#card-name-field', context);
  
        $cvv_link.click(function (e) {
          e.preventDefault();
  
          if ($cvv_copy.is(":visible")) {
            return;
          }
  
          $cvv_copy.fadeIn(300, function(){
            $cvv_copy.focus();
          });
        });
  
        $cvv_copy.blur(function (e) {
          $cvv_copy.fadeOut(300);
        });
  
        var $card_number_error = $('.js-card-number-error', context);
        var $card_expiration_error = $('.js-card-expiration-date-error', context);
        var $card_cvv_error = $('.js-card-security-code-error', context);
        var $card_name_error = $('.js-card-name-error', context);
  
        var $submit = $('.activation-renewal-btn', context);
  
        function checkName() {
          if ($cc_name.val() === '') {
            showBraintreeError('name');
            return false;
          }
          else {
            hideBraintreeError('name');
            return true;
          }
        };
  
        function hideAllErrors() {
          hideBraintreeError('number');
          hideBraintreeError('expirationDate');
          hideBraintreeError('cvv');
          hideBraintreeError('name');
        }
  
        function showBraintreeError(field_name) {
          switch(field_name) {
            case 'number':
              $card_number_error.html('Please enter a valid card number');
              $card_number_error.siblings('.braintree-field').addClass('braintree-hosted-fields-invalid');
              break;
  
            case 'expirationDate':
              $card_expiration_error.html('Please enter a valid expiration date');
              $card_expiration_error.siblings('.braintree-field').addClass('braintree-hosted-fields-invalid');
              break;
  
            case 'cvv':
              $card_cvv_error.html('Please enter valid security code');
              $card_cvv_error.siblings('.braintree-field').addClass('braintree-hosted-fields-invalid');
              break;
  
            case 'name':
              $card_name_error.html('Please enter your name as shown on the credit card');
              $card_name_error.siblings('.braintree-field').addClass('braintree-hosted-fields-invalid');
              break;
          }
        }
  
        function hideBraintreeError(field_name) {
          switch(field_name) {
            case 'number':
              $card_number_error.html('');
              $card_number_error.siblings('.braintree-field').removeClass('braintree-hosted-fields-invalid');
              break;
  
            case 'expirationDate':
              $card_expiration_error.html('');
              $card_expiration_error.siblings('.braintree-field').removeClass('braintree-hosted-fields-invalid');
              break;
  
            case 'cvv':
              $card_cvv_error.html('');
              $card_cvv_error.siblings('.braintree-field').removeClass('braintree-hosted-fields-invalid');
              break;
  
            case 'name':
              $card_name_error.html('');
              $card_name_error.siblings('.braintree-field').removeClass('braintree-hosted-fields-invalid');
              break;
          }
        }
  
        function showAllErrors() {
          var inputs = ['number', 'expirationDate', 'cvv'];
          for (var i = 0; i < inputs.length; i++) {
            showBraintreeError(inputs[i]);
          }
        }
  
        function showPaymentError(r) {
          $payment_error.html(r).show();
          $body.animate({
            scrollTop: $payment_error.offset().top
          }, 1000);
        }
  
        // Locks out form if braintree auth fails.
        function lockoutBraintreeForm() {
          $('.js-customer-info-submit', $braintree_form).attr('disabled', 'disabled');
          $braintree_form.submit(function(){
            e.preventDefault();
            return false;
          });
        }
  
        function hidePaymentError() {
          $payment_error.html('').hide();
        }
  
        hidePaymentError();
  
        $cc_name.on('keyup', function(e) {
          checkName();
        });
  
        setupBraintree();
  
        function setupBraintree() {
          // Check if braintree is defined.
          if (typeof braintree !== "object") {
            var errorMessage = settings.quicken_activation.payment_error;
            showPaymentError(errorMessage);
            lockoutBraintreeForm();
          }
  
          braintree.client.create({
            authorization: Drupal.settings.quicken_activation.braintree_token
          }, function (clientErr, clientInstance) {
            if (clientErr) {
              var errorMessage = settings.quicken_activation.payment_error;
              showPaymentError(errorMessage);
              lockoutBraintreeForm();
              return;
            }
  
            braintree.dataCollector.create({
              client : clientInstance,
              kount : true
            }, function(dataCollectorErr, dataCollectorInstance) {
              // kount environment sandbox?
              deviceData = dataCollectorInstance.deviceData;
            });
  
            braintree.hostedFields.create({
              client : clientInstance,
              styles : {
                // Override Braintree styles
                'input': {
                  'font-size': '14px'
                }
              },
              fields : {
                number : {
                  selector : '#card-number-field',
                  placeholder : 'XXXX XXXX XXXX XXXX'
                },
                cvv : {
                  selector : '#card-security-code-field',
                },
                expirationDate : {
                  selector : '#card-expiration-date-field',
                  placeholder : 'MM / YY'
                }
              }
            }, function(hostedFieldsErr, hostedFieldsInstance) {
              // Event types: blur focus empty notEmpty cardTypeChange validityChange
              // v2 had all events lumped together
              hostedFieldsInstance.on('cardTypeChange', function(event) {
                if (event.cards.length === 1) {
                  var cardType = event.cards[0].type;
                  $ccValid
                    .removeClass('visa master-card discover jcb american-express diners-club maestro')
                    .addClass(cardType);
                } else {
                  // Card type not known yet, remove all
                  $ccValid.removeClass('visa master-card discover jcb american-express diners-club maestro');
                }
              });
              hostedFieldsInstance.on('blur', function(event) {
                var field = event.fields[event.emittedBy];
                if (!field.isEmpty && (field.isValid || field.isPotentiallyValid)) {
                  hideBraintreeError(event.emittedBy);
                }
                else {
                  showBraintreeError(event.emittedBy);
                }
              });
              hostedFieldsInstance.on('validityChange', function(event) {
                var field = event.fields[event.emittedBy];
  
                if (field.isValid || field.isPotentiallyValid) {
                  hideBraintreeError(event.emittedBy);
                }
                else {
                  showBraintreeError(event.emittedBy);
                }
              });
  
              $braintree_form.on('submit.qknBraintree', function(event) {
                event.preventDefault();
  
                hideAllErrors();
                hidePaymentError();
                if (checkName() === false) {
                  return;
                }
  
                hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
                  if (tokenizeErr) {
                    switch (tokenizeErr.code) {
                      case 'HOSTED_FIELDS_FIELDS_EMPTY':
                        // occurs when none of the fields are filled in
  
                        showAllErrors();
  
                        break;
                      case 'HOSTED_FIELDS_FIELDS_INVALID':
                        // occurs when certain fields do not pass client side validation
  
                        tokenizeErr.details.invalidFieldKeys.map(function(item) {
                          showBraintreeError(item);
                        });
  
                        break;
                      case 'HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE':
                        // occurs when:
                        //   * the client token used for client authorization was generated
                        //     with a customer ID and the fail on duplicate payment method
                        //     option is set to true
                        //   * the card being tokenized has previously been vaulted (with any customer)
                        // See: https://developers.braintreepayments.com/reference/request/client-token/generate/#options.fail_on_duplicate_payment_method
  
                        showPaymentError(settings.quicken_activation.payment_error);
  
                        break;
                      case 'HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED':
                        // occurs when:
                        //   * the client token used for client authorization was generated
                        //     with a customer ID and the verify card option is set to true
                        //     and you have credit card verification turned on in the Braintree
                        //     control panel
                        //   * the cvv does not pass verfication (https://developers.braintreepayments.com/reference/general/testing/#avs-and-cvv/cid-responses)
                        // See: https://developers.braintreepayments.com/reference/request/client-token/generate/#options.verify_card
  
                        showBraintreeError('cvv');
  
                        break;
                      case 'HOSTED_FIELDS_FAILED_TOKENIZATION':
                        // occurs for any other tokenization error on the server
  
                        showPaymentError(settings.quicken_activation.payment_error);
  
                        break;
                      case 'HOSTED_FIELDS_TOKENIZATION_NETWORK_ERROR':
                        // occurs when the Braintree gateway cannot be contacted
  
                        showPaymentError(settings.quicken_activation.payment_error);
  
                        break;
                      default:
                        showPaymentError(settings.quicken_activation.payment_error);
                    }
                    return;
                  }
  
                  var post_data = {};
                  var nonce = payload.nonce;
                  var name_on_card = $('#card-name-field', context).val();
  
                  post_data['quicken_activation_renewal_nonce'] = nonce;
                  post_data['quicken_activation_renewal_card_name'] = name_on_card;
  
                  if (payload.details) {
                    post_data['quicken_activation_renewal_card_type'] = payload.details.cardType;
                    post_data['quicken_activation_renewal_card_digits'] = payload.details.lastTwo;
                  }
  
                  if (deviceData) {
                    post_data['quicken_activation_renewal_device_data'] = deviceData;
                  }
  
                  // Disable submit button while processing.
                  $submit.attr('disabled', 'disabled');
  
                  // Not combined form, use AJAX callback handler.
                  $.post(Drupal.settings.quicken_activation.renewal_callback, post_data, function (result) {
                    if (!result.success) {
                      if (result.card_error) {
                        if (result.card_error == 'cvv') {
                          // Invalid CVV.
                          showBraintreeError('cvv');
                        }
                        else {
                          // Standard error.
                          showPaymentError(result.card_error);
                        }
                        $submit.removeAttr('disabled');
                        return;
                      }
  
                      if (result.connection_error) {
                        window.location = '/'  + Drupal.settings.quicken_activation.error_path;
                        return;
                      }
                    }
                    else {
                      // Success!
                      window.location = '/'  + Drupal.settings.quicken_activation.profile_path;
                    }
                  });
  
                });
              });
            });
          });
        }
      }
    };
  })(jQuery);
  ;
  /**
   * @file
   * Custom JavaScript for Quicken Akamai module.
   */
  
  (function($) {
    Drupal.behaviors.akamai_popup = {
      attach : function(context, settings) {
        $('body', context).once(function() {
          var $akamai_links = $('.js-akamai-link', context);
          var $body = $('body', context);
  
          if ($akamai_links.length < 1) {
            return;
          }
  
          if (Drupal.settings.quicken_akamai.timeout) {
            var akamai_timeout = Drupal.settings.quicken_akamai.timeout * 1000;
            setTimeout(function (){
              if (Drupal.settings.quicken_akamai.timeout_warning_path) {
                $.post(Drupal.settings.quicken_akamai.timeout_warning_path, {}, function(result) {
                  var $popup = $(result).appendTo($body);
                  $popup.find('.modal-box').show();
                });
              }
            }, akamai_timeout);
          }
        });
      }
    };
  })(jQuery);
  ;
  /**
   * @file
   * Custom JavaScript for the subscriptions page.
   */
  
  (function ($) {
    Drupal.behaviors.capital_one = {
  
      attach: function (context, settings) {
        var $faq_q = $('.faq-q', context);
  
        if ($faq_q.length === 0) {
          return;
        }
  
        var $btn = $('.capital-one-btn', context);
        var $form_close  = $('.form-close', context);
        var $modal = $('.modal', context);
  
        var $firstname = $('.js-capital-firstname', context);
        var $lastname = $('.js-capital-lastname', context);
        var $email = $('.js-capital-email', context);
        var $version = $('.js-capital-version', context);
        var $signup_btn = $('.signup-btn', context);
        var $story_link = $('.pref-partner', context);
  
        var $form_fields = [$firstname, $lastname, $email, $version];
  
        $.postJSON = function(url, data, callback) {
          return jQuery.ajax({
            'type': 'POST',
            'url': url,
            'contentType': 'application/json',
            'data': JSON.stringify(data),
            'dataType': 'json',
            'success': callback
          });
        };
  
  
        $faq_q.on('click', function (e) {
          $(e.target).next().slideToggle();
        });
  
        $btn.on('click', function (e) {
          var url = window.location.href;
          if (url.indexOf('?') >= 0) {
            url = url + '&learnmore=1';
          }
          else {
            url = url + '?learnmore=1';
          }
          window.location.href = url;
        });
  
        $story_link.on('click', function (e) {
          $('#story-modal').css('display','block');
  
        });
  
        $form_close.on('click', function (e) {
          $('#form-modal').css('display','none');
          $('#story-modal').css('display','none');
        });
  
        var that = this;
        $signup_btn.on('click', function(e) {
          $('.form-area').css('display','block');
          $('.success-area').css('display','none');
  
          var validation = that.validateInfo($form_fields);
          if (!validation) {
            return false;
          }
          else {
            $.postJSON(Drupal.settings.quicken_capital_one.form_endpoint,
                  {
                    "firstName": $firstname.val(), "lastName": $lastname.val(), "email": $email.val(), "quickenVersion": $version.val()
                  },
                  function(response) {
                    $('.form-area').css('display','none');
                    $('.success-area').css('display','block');
                  });
          }
        });
      },
  
      showError: function(field) {
        var msg = field.parent().next('.js-customer-info-error');
        msg.removeClass('hidden');
        field.addClass('error');
      },
  
      validateInfo: function($form_fields) {
        var success = true;
  
        for (var i = 0; i < $form_fields.length; i++) {
          var field = $form_fields[i];
  
          if ((this.isEmpty(field.val())) || (field.val() === '00')) {
            this.showError(field);
            success = false;
          }
        }
        return success;
      },
  
      isEmpty: function(e) {
        return e === null || e === '';
      }
  
    }
  })(jQuery);
  ;
  /**
   * @file
   * Custom JavaScript to add a coupon into the user's session.
   */
  
  (function($) {
    Drupal.behaviors.quicken_coupons = {
      attach : function(context, settings) {
        var that = this;
        $('body', context).once(function() {
          that.callAJAX(context, Drupal.settings);
          that.replaceDiscountText();
        });
      },
  
      callAJAX : function(context, settings) {
        var that = this;
        $('body', context).once(function() {
          if (typeof(Drupal.settings.quicken_coupon) === 'undefined') {
            return;
          }
          var couponData = JSON.parse(localStorage.getItem("couponData"));
          if (!that.isset(couponData)) {
            couponData = {
              has_coupon: false
            };
            localStorage.setItem("couponData", JSON.stringify(couponData));
            Drupal.behaviors.quicken_coupons.replaceDiscountText();
          }
  
          $.get(Drupal.settings.quicken_coupon.get_coupon_callback, function (result) {
            if (result.has_coupon) {
              if (!couponData.has_coupon || (!that.codesMatch(result.coupon, couponData.coupon))) {
                console.log("about to call setCoupon after get 1 with " + JSON.stringify(result));
                that.setCoupon(result);
                Drupal.behaviors.quicken_coupons.resetDataTime();
              }
              else {
                $(document).trigger('quicken_coupon:get');
              }
              Drupal.behaviors.quicken_coupons.requestData();
              return;
            }
            else if (result.has_coupon != couponData.has_coupon) {
              console.log("about to call setCoupon after get 2 with " + JSON.stringify(result));
              that.setCoupon(result);
            }
            else {
              $(document).trigger('quicken_coupon:get');
            }
  
            var post_data = {};
  
            if (QuickenGlobal.isSEO()) {
              post_data.quicken_coupon_code = Drupal.settings.quicken_coupon.seo_coupon;
            }
            else {
              post_data.quicken_coupon_code = Drupal.settings.quicken_coupon.default_coupon;
            }
  
            $.post(Drupal.settings.quicken_coupon.set_coupon_callback, post_data, function(data) {
              if (typeof data.success === 'undefined' || data.success === false) {
                return;
              }
              if (typeof(data.coupon) !== 'undefined') {
                console.log("about to call setCoupon after post with " + JSON.stringify(data.coupon));
                that.setCoupon({
                  has_coupon: true,
                  coupon: data.coupon
                });
              }
              Drupal.behaviors.quicken_coupons.resetDataTime();
              Drupal.behaviors.quicken_coupons.requestData();
            });
          });
        });
      },
  
      codesMatch: function(coupons, newCoupons) {
        let result = true;
        if (coupons?.length !== newCoupons?.length) {
          return false;
        }
        coupons.forEach((coupon, index) => {
          if (coupon.code !== newCoupons[index].code) {
            result = false;
          }
        });
        return result;
      },
  
      setCoupon: function(coupon) {
        coupon.time = Date.now();
        localStorage.setItem("couponData", JSON.stringify(coupon));
        var couponEvt = new CustomEvent("couponDataSet", {
          detail: {
            couponInfo: coupon,
             }
        });
        document.dispatchEvent(couponEvt);
        console.log("dispatching couponDataSet event");
        $(document).trigger('quicken_coupon:set');
        Drupal.behaviors.quicken_coupons.replaceDiscountText();
      },
  
      requestData: function(context) {
        if (typeof Drupal.settings.quicken_ajax != 'undefined'
          && typeof Drupal.settings.quicken_ajax.ajax_keys != 'undefined'
          && typeof Drupal.settings.quicken_ajax.ajax_path != 'undefined') {
  
          if (!QuickenGlobal.userCanSeeDiscount()) {
            return;
          }
  
          var result = JSON.parse(localStorage.getItem("priceData"));
          var couponData = JSON.parse(localStorage.getItem("couponData"));
          var one_hour_ago = Date.now() - (1000 * 60 * 60);
          var data_time = Math.floor(result ? result.time * 1000 : 0);
  
          // Check if the stored price/data is not stale and has the correct coupon and is from the correct
          // store/country, is so apply it to the page, otherwise fetch it again, store and apply it
          if (result && (data_time > one_hour_ago) &&
             (couponData && (couponData.coupon[0].code === result.coupon.code)) &&
             (result.store === QuickenGlobal.getCountry())) {
            Drupal.behaviors.quicken_coupons.applyData(context, result.ajax_data);
          }
          else {
            $.get(Drupal.settings.quicken_ajax.ajax_path, function (result, status, ajaxXHR) {
              localStorage.setItem("priceData", JSON.stringify(result));
              Drupal.behaviors.quicken_coupons.applyData(context, result.ajax_data);
            });
          }
        }
      },
  
      applyData: function(context,ajax_data) {
        var keys = Object.keys(ajax_data);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var value = ajax_data[key];
  
          if (value === "") {
            continue;
          }
  
          $(key, context).html(value).trigger('quicken:pricing:apply');
        }
        Drupal.behaviors.quicken_coupons.replaceDiscountText();
      },
  
      resetDataTime: function(context) {
        var priceData = JSON.parse(localStorage.getItem("priceData"));
        if (priceData) {
          priceData.time = 0;
        }
        else {
          priceData = {};
          priceData.time = 0;
        }
        localStorage.setItem("priceData", JSON.stringify(priceData));
        Drupal.behaviors.quicken_coupons.replaceDiscountText();
      },
  
      isset: function(variable) {
        return typeof variable !== "undefined" && variable !== null;
      },
  
      showDiscounts: function() {
        var els = document.getElementsByClassName("display-discount");
        for (var i = 0, l = els.length; i < l; i++) {
          els[i].style.display = null;
        }
        var els = document.getElementsByClassName("hide-discount");
        for (var i = 0, l = els.length; i < l; i++) {
          els[i].style.display = 'none';
        }
        var els = document.getElementsByClassName("check-discount");
        for (var i = 0, l = els.length; i < l; i++) {
          els[i].classList.add('user-discount-true');
        }
      },
  
      hideDiscounts: function() {
        var els = document.getElementsByClassName("hide-discount");
        for (var i = 0, l = els.length; i < l; i++) {
          els[i].style.display = null;
        }
        var els = document.getElementsByClassName("display-discount");
        for (var i = 0, l = els.length; i < l; i++) {
          els[i].style.display = 'none';
        }
        var els = document.getElementsByClassName("check-discount");
        for (var i = 0, l = els.length; i < l; i++) {
          els[i].classList.add('user-discount-false');
        }
      },
  
      determineBestCoupon: function(couponObj) {
        try {
          if (!couponObj) return false;
          if (!couponObj.coupon) return false;
  
          if (couponObj.coupon.length === 1) {
            // if single coupon just act as normal but handle for if it's a single dollar amount monthly presentment
            if (couponObj.coupon[0].discount_type === 'by_percent') {
              couponObj.coupon[0].presentMonthly = false;
              couponObj.coupon[0].monthlyVal = false;
            } else {
              couponObj.coupon[0].presentMonthly = true;
              couponObj.coupon[0].monthlyVal = parseInt(couponObj.coupon[0].discount) / 12;
            }
            couponObj.coupon[0].upToMsging = false;
  
            return couponObj.coupon[0];
          } else if (couponObj.coupon.length > 1) {
            // if multiple coupons, pick the highest value
            // if a mix of $ off and % off, pick the highest % as winner
            var allFixed = Object.values(couponObj.coupon).every(function (coupon) {
              return coupon.discount_type === 'by_fixed';
            });
  
            var maxCoupon = null;
  
            for (var i = 0; i < couponObj.coupon.length; i++) {
              var coupon = couponObj.coupon[i];
  
              if (allFixed) {
                if (!maxCoupon) { maxCoupon = coupon; }
  
                // All dollar off, then just go with max dollar amount and flag the coupon to divide by 12 and put in the
                if (parseInt(coupon.discount) > maxCoupon.discount) {
                  maxCoupon = coupon;
                  maxCoupon.presentMonthly = true;
                  maxCoupon.monthlyVal = parseInt(coupon.discount) / 12;
                }
              } else {
                // Otherwise we find the maximum amount of % off coupons only
                if (!maxCoupon) { maxCoupon = coupon; }
  
                if (coupon.discount_type === 'by_percent' && (parseInt(coupon.discount) > maxCoupon.discount)) {
                  maxCoupon = coupon;
                  maxCoupon.presentMonthly = false;
                  maxCoupon.monthlyVal = false;
                }
              }
            }
  
            maxCoupon.upToMsging = (couponObj.coupon.length > 1) ? true : false;
  
            return maxCoupon;
          } else {
            return false;
          }
        } catch (error) {
          console.log("determineBestCoupon catch: " + error);
          return false;
        }
      },
  
      replaceDiscountText: function (context, settings) {
        if (!localStorage) {
          return;
        }
        var priceData = JSON.parse(localStorage.getItem("priceData"));
        var ccodeKeyExists = false;
  
        if(!priceData) {
          priceData = JSON.parse(localStorage.getItem("couponData"));
        }
  
        var winningCoupon = this.determineBestCoupon(priceData);
  
        if (winningCoupon) {
          if (typeof winningCoupon !== 'undefined') {
            if (typeof winningCoupon.code !== 'undefined') {
              ccodeKeyExists = true;
            }
          }
        }
  
        // Show/hide discounts based on the userCanSeeDiscount value
        if (QuickenGlobal.userCanSeeDiscount()) {
          Drupal.behaviors.quicken_coupons.showDiscounts();
        }
        else {
          Drupal.behaviors.quicken_coupons.hideDiscounts();
        }
  
        if (!ccodeKeyExists) {
          return;
        }
  
        // Build the value we want to insert places based on the localstorage coupon data
        // var discountString = '' + winningCoupon.discount;
        var discountString = winningCoupon.presentMonthly ? winningCoupon.monthlyVal : winningCoupon.discount;
        switch (winningCoupon.discount_type) {
          case "by_percent":
            discountString += "%";
            break;
          case "by_fixed":
            discountString = "$" + discountString;
            break;
          default:
            break;
        }
  
        // basic classname to put in html to display the current discount value
        $('.display-coupon-data').each(function () {
          jQuery(this).text(discountString);
        });
  
        // Conditional messaging fields to fill in if conditions are met
        if (winningCoupon.upToMsging) {
          $('.multiple-cpn-text').text('up to');
        }
        if (winningCoupon.presentMonthly) {
          $('.monthly-price-text').text('Per Month');
          $('.monthly-price-text').show();
        }
  
        // data attribute to conditionally display an element if a certain coupon is the active coupon
        $('*[data-displayifcoupon]').each(function () {
          var attrCoupCode = $(this).data("displayifcoupon");
          if (winningCoupon.code === attrCoupCode) {
            $(this).show();
          }
          else {
            $(this).hide();
          }
        });
  
        // Loop through all coupon code object values and make the accesible in the html through a data attribute
        for (var [key, value] of Object.entries(winningCoupon)) {
          //data-name is too commonly use in other scripts and SVGs and was breaking stuff so rename the key
          if(key === 'name') { key = 'coupon_name' };
          $('[data-' + key + ']').text(value);
        }
      }
    };
  
  
  })(jQuery);
  ;
  (function($) {
    Drupal.behaviors.quickenWinFaq = {
      attach: function(context, settings) {
        if (!$('.panels-page-windows-faq-page', context).length && !$('.quicken-mac-faq-page', context).length) {
          return;
        }
  
        var firstRunOnFAQ = true;
  
        function initFAQ() {
          $('.faq-category-button', context).each(function(i) {
            var button = $(this);
            button.click(function() {
              flipTheCat(button);
            });
            if (i == 0) {
              flipTheCat(button);
            }
          });
  
          $('.faq-answer', context).hide();
  
          $('.qkn-faq', context).click(function() {
            var faq = $(this);
            flipTheQ(faq);
          });
        }
  
        var flipTheCat = function(button) {
          var catTid = button.data('category-tid');
          var catName = button.data('category-name');
  
          // Turn all answers off.
          $('.faq-answer', context).hide();
          $('.qkn-faq', context).removeClass('active');
  
          // Flip title and category box.
          $('.faq-title', context).text(catName);
  
          // Show/hide questions.
          $('.qkn-faq:not(.cat-tid-' + catTid + ')', context).hide();
          $('.qkn-faq.cat-tid-' + catTid, context).show();
  
          // Flip the category button states.
          $('.faq-category-button', context).removeClass('active');
          button.addClass('active');
          // scrollToAnchor($('#faq-title', context), null, null, 0);
  
          
          // Get query params
          var parts = getUrlVars();
          
          // if faq_item is present, expand that one.
          if(parts.faq_item == 'data_in_cloud') {
            if(firstRunOnFAQ) {
              firstRunOnFAQ = false;
              setTimeout(function() {
                flipTheQ($('.qkn-faq:visible', context).eq(1));
              }, 1000);
            }
          } else{
            // Expand the first item.
            if(firstRunOnFAQ) {
              firstRunOnFAQ = false;
              setTimeout(function() {
                flipTheQ($('.qkn-faq:visible', context).eq(0));
              }, 1000);
            }
          }
          
        };
        
        function getUrlVars() {
          var vars = {};
          var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
          });
          return vars;
        }
  
        var flipTheQ = function(faq) {
          var answer = faq.find('.faq-answer');
          if(faq.hasClass('active')) {
            faq.removeClass('active');
            answer.slideUp(100);
          }
          else {
            faq.addClass('active');
            answer.slideDown(100);
          }
        };
  
        var initBackToTopButton = function() {
          $('body', context).attr('id', 'top');
          var backButton = $('<a id="backToTop" href="#top" title="Back to top"></a>').appendTo('body', context);
  
          backButton.click(function(e) {
            e.preventDefault();
            scrollToAnchor(theTarget, name);
          });
  
          setInterval(function() {
            if (window.scrollY >= 200 && !backButton.hasClass('show')) {
              backButton.addClass('show');
            }
            else if (window.scrollY < 200 && backButton.hasClass('show')) {
              backButton.removeClass('show');
            }
          }, 10);
        };
  
        var scrollToAnchor = function(el, name, speed, padding) {
          el = $(el);
          speed = (speed) ? speed: 500;
          padding = (padding) ? padding: 90;
          var theTop = el.offset().top;
  
          $('html, body').stop().animate({ scrollTop:theTop }, speed, 'easeInOutCubic');
        };
  
  
        initFAQ();
        initBackToTopButton();
  
      }
    }
  })(jQuery);
  ;
  (function($) {
    Drupal.behaviors.quickenGlobalNav = {
      attach: function(context) {
  
      }
    };
  })(jQuery);
  ;
  (function($) {
    Drupal.behaviors.shopQuickenForMacWinLinkAdjust = {
      attach: function(context, settings) {
        var linkShopQuickenForMac = $('a.has-apple-logo-prefix', context);
        var linkShopQuickenForWin = $('a.has-windows-logo-prefix', context);
        if (!linkShopQuickenForMac.length && !linkShopQuickenForWin.length) {
          return;
        }
        var pageUrl = window.location.href.toLowerCase();
        //------------------------------------------------------------------------------------------------
        // Shop Quicken for Mac
        //------------------------------------------------------------------------------------------------
        if (linkShopQuickenForMac.length) {
          if (
            pageUrl.indexOf('email/win/deluxe')  !== -1 ||
            pageUrl.indexOf('email/win/premier') !== -1 ||
            pageUrl.indexOf('email/win/hbr')     !== -1
          ) {
            linkShopQuickenForMac.attr('href', '/email/mac');
          }
          else if (pageUrl.indexOf('ppc/win/nf') !== -1) {
            linkShopQuickenForMac.attr('href', '/ppc/mac/nf');
          }
          else if (pageUrl.indexOf('ppc/win/nfnb') !== -1) {
            linkShopQuickenForMac.attr('href', '/ppc/mac/nfnb');
          }
          else if (pageUrl.indexOf('tsm/win/nf') !== -1) {
            linkShopQuickenForMac.attr('href', '/tsm/mac/nf');
          }
          else if (
            pageUrl.indexOf('tsm/win/deluxe')  !== -1 ||
            pageUrl.indexOf('tsm/win/premier') !== -1 ||
            pageUrl.indexOf('tsm/win/hbr')     !== -1
          ) {
            linkShopQuickenForMac.attr('href', '/tsm/mac');
          }
          else if (
            pageUrl.indexOf('email/qkn18/40off/deluxe')  !== -1 ||
            pageUrl.indexOf('email/qkn18/40off/premier') !== -1 ||
            pageUrl.indexOf('email/qkn18/40off/hbr')     !== -1
          ) {
            linkShopQuickenForMac.attr('href', '/email/qkn18/40off/mac');
          }
          else if (
            pageUrl.indexOf('pulse1lp/ppc/40per/deluxe')  !== -1 ||
            pageUrl.indexOf('pulse1lp/ppc/40per/premier') !== -1 ||
            pageUrl.indexOf('pulse1lp/ppc/40per/hbr')     !== -1
          ) {
            linkShopQuickenForMac.attr('href', '/pulse1lp/ppc/40per/mac');
          }
          else if (
            pageUrl.indexOf('pulse1lp/tsm/40per/deluxe')  !== -1 ||
            pageUrl.indexOf('pulse1lp/tsm/40per/premier') !== -1 ||
            pageUrl.indexOf('pulse1lp/tsm/40per/hbr')     !== -1
          ) {
            linkShopQuickenForMac.attr('href', '/pulse1lp/tsm/40per/mac');
          }
        }
        //------------------------------------------------------------------------------------------------
        // Shop Quicken for Windows
        //------------------------------------------------------------------------------------------------
        if (linkShopQuickenForWin) {
          if (pageUrl.indexOf('ppc/mac/nf') !== -1) {
            linkShopQuickenForWin.attr('href', '/ppc/win/nf');
          }
          else if (pageUrl.indexOf('ppc/mac/nfnb') !== -1) {
            linkShopQuickenForWin.attr('href', '/ppc/win/nfnb');
          }
          else if (pageUrl.indexOf('tsm/mac/nf') !== -1) {
            linkShopQuickenForWin.attr('href', '/tsm/win/nf');
          }
          else if (pageUrl.indexOf('pulse1lp/ppc/40per/mac') !== -1) {
            linkShopQuickenForWin.attr('href', '/pulse1lp/ppc/40per/deluxe');
          }
          else if (pageUrl.indexOf('pulse1lp/tsm/40per/mac') !== -1) {
            linkShopQuickenForWin.attr('href', '/pulse1lp/tsm/40per/deluxe');
          }
        }
      }
    };
  })(jQuery);
  ;
  (function($) {
    Drupal.behaviors.quickenBurstPromoCampaign = {
      attach: function(context, settings) {
        /* Deprecated in favor of quicken_ns_promo */
  
        if (!settings.quicken_burst_promo.is_active) {
          return;
        }
  
        if (!QuickenGlobal.userCanSeeDiscount()) {
          return;
        }
  
        var endMoment;
        var daysLeft;
        if (typeof moment == 'function') {
          endMoment = moment(settings.quicken_burst_promo.end_date);
          daysLeft = endMoment.diff(moment(), 'days', true);
          daysLeft = Math.ceil(daysLeft);
        }
  
        var currentPath = window.location.pathname;
        if (settings.quicken_burst_promo.burst_pages.indexOf(currentPath) >= 0) {
          $('body', context).addClass('pulse-promo');
          if ($('.hero-product-card .guarantee-badge', context).length) {
            $('.hero-product-card .guarantee-badge', context).addClass('promo-badge');
          }
  
          if ($('.promo-hero-card-without-badge .hero-product-card', context).length) {
            $('.hero-product-card-top', context).append('<div class="guarantee-badge promo-badge" />');
          }
  
          this.addProductDisclaimers(context, settings);
        }
  
        // Failsafe defaults for countdown format.
        var countdownFormat, countdownFormatLastday;
        if (settings.quicken_burst_promo.countdown_format != null) {
          countdownFormat = settings.quicken_burst_promo.countdown_format;
        }
        else {
          countdownFormat = 'Hurry – only %d days left!';
        }
  
        if (settings.quicken_burst_promo.countdown_format_lastday != null) {
          countdownFormatLastday = settings.quicken_burst_promo.countdown_format_lastday;
        }
        else {
          countdownFormatLastday = 'Hurry – sale ends today!';
        }
  
        // Add countdown clock.
        if (settings.quicken_burst_promo.show_countdown_clock && endMoment.isValid()) {
          var daysLeftText;
          if (daysLeft <= 1) {
            daysLeftText = countdownFormatLastday;
          }
          else {
            daysLeftText = countdownFormat.replace('%d', daysLeft);
          }
          var comparePageUrl = (QuickenGlobal.userDevice === 'Macintosh') ? '/mac/compare' : '/compare';
  
          if ($('.page-home', context).length) {
            $('.second-row .second-inner', context).prepend('<h3 class="promo-countdown">Over 8 out of 10 users highly recommend Quicken 2018<sup>*</sup></h3><h3 class="promo-countdown"><strong>' + daysLeftText + ' <a class="btn btn-primary buy-now add-to-cart no-os-rewrite" href="' + comparePageUrl + '">BUY NOW</a></strong></h3>');
          }
  
          if ($('.page-mac-home', context).not('.no-burst').length) {
            $('.second-row .second-inner', context).prepend('<h3 class="promo-countdown">Over 8 out of 10 users highly recommend Quicken 2018<sup>*</sup></h3><h3 class="promo-countdown"><strong>' + daysLeftText + ' <a class="btn btn-primary buy-now add-to-cart no-os-rewrite" href="/mac/compare">BUY NOW</a></strong></h3>');
          }
        }
  
        // Adjust the product disclaimer for the last day text.
        if (!settings.quicken_burst_promo.show_countdown_clock && daysLeft == 1) {
          $('.subhead-product-disclaimer', context).html('<b>Hurry - Sale ends today!<b>');
        }
  
        // Add countdown text to TSM.
        var tsmCountdownHeader = $('.tsm-countdown-header', context);
        if (tsmCountdownHeader.length && endMoment.isValid()) {
          var tsmCountdownText;
          if (daysLeft <= 1) {
            tsmCountdownText = countdownFormatLastday;
          }
          else {
            tsmCountdownText = countdownFormat.replace('%d', daysLeft);
          }
  
          if ($('.node-tsm-mac', context).length) {
            // Mac.
            var tsmBodyElement = $('.field-name-body .field-item', context);
            var tsmCountdownElement = $('.node-tsm-mac .mac-countdown-text', context);
            if (tsmCountdownElement.length) {
              tsmCountdownElement.html(tsmCountdownText);
            }
            else {
              tsmBodyElement.append('<p class="mac-countdown-text">' + tsmCountdownText + '</p>');
            }
          }
          else {
            // Win.
            var tsmHeaderField = tsmCountdownHeader.find('.field-item');
            var tsmHeaderH2 = tsmHeaderField.find('h2');
            if (tsmHeaderH2.length) {
              tsmHeaderH2.prepend(' ' + tsmCountdownText);
            }
            else {
              tsmHeaderField.prepend('<h2>' + tsmCountdownText + '</h2>');
            }
          }
        }
      },
  
      addProductDisclaimers: function(context, settings) {
        var productDisclaimers = settings.quicken_burst_promo.product_disclaimers;
        var products = Object.keys(productDisclaimers);
  
        if (products.length === 0) {
          return;
        }
  
        for (var i = 0; i < products.length; i++) {
          // Hero product card or comp chart column.
          var product = $(products[i], context);
          if (product.length === 0) {
            continue;
          }
  
          var price = product.find('span[class^="js-price-sku"], .field-name-field-price');
          var text = $('<div>').addClass("promo-product-disclaimer").html(productDisclaimers[products[i]]);
  
          $(price).each(function(idx, elem) {
            $(elem).parent().append(text.clone());
          });
        }
      }
    };
  })(jQuery);
  ;
  /**
   * @file
   * Enables refund links opening in modal windows throughout the site.
   */
  (function ($) {
    Drupal.behaviors.quickenRefunds = {
      attach: function(context) {
        if (context !== document) {
          return;
        }
  
        var refundFormLinks = $('a[href="/refunds"]', context);
        if (refundFormLinks.length > 0) {
          refundFormLinks.addClass('ctools-modal-refund-form');
          var url = '/refunds/ajax';
  
          if (Drupal.ajax.hasOwnProperty(url)) {
            return;
          }
  
          var elementSettings = {};
          elementSettings.url = url;
          elementSettings.event = 'click';
          elementSettings.progress = { type: 'throbber' };
          Drupal.ajax[url] = new Drupal.ajax(url, refundFormLinks, elementSettings);
          refundFormLinks.addClass('ctools-use-modal-processed');
  
          // JS to catch ajax complete events.
          refundFormLinks.ajaxComplete(function(event, xhr, settings) {
            // Hide the throbber on the support page when the popup displays.
            if (event.target.className == 'ctools-modal-refund-form ctools-use-modal-processed') {
              $(event.target).next('.ajax-progress.ajax-progress-throbber').remove();
            }
          });
        }
      }
    };
  
    Drupal.theme.prototype.refundModalHtml = function() {
      return Drupal.settings.quickenRefunds.modalHtml;
    }
  })(jQuery);
  ;
  /**
   * @file
   * Extra functionality for InQuira exported content.
   * For example: Collapsable sections, etc.
   */
  
  (function ($) {
  
    Drupal.behaviors.quickenSupportInQuira = {
      attach: function (context, settings) {
        $('.uaq_msnav', context).click(function(e) {
          e.preventDefault();
  
          $(this).toggleClass('uaq_arrow_expanded').nextAll('.uaq_collapsed:first').toggle().toggleClass('uaq_expanded');
        });
      }
    };
  
  })(jQuery);
  ;
  /**
   * @file
   * Custom JavaScript for shopping cart page.
   */
  
  (function($) {
    Drupal.behaviors.shoppingcart = {
      attach : function(context, settings) {
        var $phone = $('#phone', context);
        var $simplifi_sms_error = $('.simplifi-sms-error',context);
        var $simplifi_sms_thanks = $('.simplifi-sms-thanks',context);
        var $simplifi_sms_label = $('.simplifi-sms-label',context);
  
        if ((window.location.pathname == '/shoppingcart/confirmation') || (window.location.pathname == '/shoppingcart/confirmation/canada')) {
  
          let os = (QuickenGlobal.userDevice === 'Macintosh') ? 'mac' : 'win';
  
          dataLayer.push({
            "event": "purchase",
            "ecommerce": {
              "transaction_id": Drupal.settings.quickenCheckout.orderId,
              "value": parseFloat(Drupal.settings.quickenCheckout.purchasePrice),
              "payment_type": Drupal.settings.quickenCheckout.paymentType,
              "customer_id": Drupal.settings.quickenCheckout.customer_id,
              "customer_segment": Drupal.settings.quickenCheckout.segment,
              "tax": parseFloat(Drupal.settings.quickenCheckout.tax),
              "currency": Drupal.settings.quickenCheckout.currency,
              "items" : [{
                "item_id": Drupal.settings.quickenCheckout.item_id,
                "item_name": Drupal.settings.quickenCheckout.item_name,
                "discount": parseFloat(Drupal.settings.quickenCheckout.discount),
                "coupon_code": Drupal.settings.quickenCheckout.coupon_code,
                "item_brand": Drupal.settings.quickenCheckout.item_brand,
                "item_category": Drupal.settings.quickenCheckout.item_category,
                "item_category2": Drupal.settings.quickenCheckout.item_category2,
                "item_category3": os,
                "item_category4": Drupal.settings.quickenCheckout.item_category4,
                "price": parseFloat(Drupal.settings.quickenCheckout.price),
                "quantity": Drupal.settings.quickenCheckout.quantity
              }]
            }
          });
        }
  
        if ($phone.length > 0) {
          var $simplifi_sms_btn = $('.simplifi-sms-btn', context);
  
          $phone.click(function(e) {
            $simplifi_sms_error.addClass('hidden');
          });
  
          $simplifi_sms_btn.click(function(e) {
            e.preventDefault();
            if ($phone.val() === '') {
              $simplifi_sms_error.removeClass('hidden');
              return;
            }
            var $error = $('body').find( ":invalid" );
            if ($error.length > 0) {
              $simplifi_sms_error.removeClass('hidden');
              return;
            }
  
            var url = Drupal.settings.quickenCheckout.phone_url;
            url = url + "?number=" + $phone.val().replace(/\D/g,'');
            $.get(url, null, function (result) {
              $simplifi_sms_btn.css("display", "none");
              $phone.css("display", "none");
              $simplifi_sms_label.css("display", "none");
              $simplifi_sms_thanks.removeClass("hidden").fadeIn();
            }).fail(function () {
              alert("An error occurred. Please try again.");
            });
          });
        }
  
        var $shopping_cart_form = $('#quicken-checkout-cart-form', context);
        if ($shopping_cart_form.length < 1) {
          return;
        }
  
        var $toggle_buttons = $('.js-product-toggle', context);
        var $cart_alert = $('.js-cart-alert', context);
        var $checkout_button = $('.js-checkout-button', context);
        var $qty_control = $('.js-qty-control', context);
  
        var force_blur = false;
        var auto_click = false;
  
        if ($toggle_buttons.length > 0) {
          // We need to also check if we have executed this code before as the form
          // uses ajax and the behaviors execute.
          if (context.length) {
            return;
          }
  
          $toggle_buttons.click(function (e) {
            if ($(this).hasClass('disabled')) {
              e.preventDefault();
              return;
            }
  
            $toggle_buttons.addClass('disabled');
          });
        }
  
        if ($cart_alert.length > 0) {
          $cart_alert.delay(3000).fadeOut();
        }
  
        $qty_control.change(function () {
          force_blur = true;
        });
  
        $shopping_cart_form.ajaxComplete(function (e, hxr, settings) {
          force_blur = false;
          if (auto_click) {
            $checkout_button.click();
            auto_click = false;
          }
        });
  
        $checkout_button.click(function (e) {
          // Prevent submission if ajax events have not finished.
          if (force_blur) {
            auto_click = true;
            e.preventDefault();
          }
        });
      }
    };
  })(jQuery);
  ;
  /**
   * @file
   * Custom JavaScript for all pages of checkout for general functionality.
   */
  
  (function ($) {
    Drupal.behaviors.checkout = {
      attach: function (context, settings) {
  
        $(document).ready(function () {
          $("html").ajaxStart(function () { $(this).css('cursor','wait'); });
          $("html").ajaxStop(function () { $(this).css('cursor',''); });
        });
  
        var that = this;
  
        // Add cd link
        $('#add-cd-link', context).once('add-cd-link', function () {
          $(this).one("click", function (e) {
            e.preventDefault();
            that.switchSku(e);
          });
        });
  
        $('#switch-path', context).once('switch-path', function () {
          $(this).one("click", function (e) {
            e.preventDefault();
            that.switchSku(e);
          });
        });
  
  
        // Show link in a popup.
        $(context).on('click', '.popup-link', function (e) {
          e.preventDefault();
          window.open($(this).prop('href'), "Quicken", "width=500,height=500");
        });
  
        var $login_frame = $('.pane-embedded-login iframe', context);
        var $login_pane = $('.pane-embedded-login',context);
        $login_pane.css('height','600px');
  
        $login_frame.load(function(){
          $login_pane.css('height','auto');
        });
  
        var $tooltip_trigger = $('.js-subscription-tooltip-trigger', context);
        if ($tooltip_trigger.length > 0) {
          $tooltip_trigger.each(function() {
            var $trigger = $(this);
            var $tooltip = $(this).parent().siblings('.js-subscription-tooltip');
            $trigger.click(function(e) {
              e.preventDefault();
  
              if ($tooltip.is(":visible")) {
                return;
              }
  
              $tooltip.fadeIn(300, function() {
                $tooltip.focus();
              });
            });
  
            $tooltip.blur(function(e) {
              $tooltip.fadeOut(300);
            });
          });
        }
      },
  
      switchSku: function(e) {
        e.preventDefault();
        var switch_url =  e.target.getAttribute('data-switch-path') + "?sku=" + e.target.getAttribute('data-sku');
        $.get(switch_url, null, function (result) {
          $('.pane-cart-mini div:first-child').html(result);
          $('.has_cd').toggle(700);
          if ($('#in_test').length == 0) {
            $('.js-checkout-shipping-form').toggleClass('active', true);
          }
          Drupal.attachBehaviors($('.pane-cart-mini div:first-child'));
        }).fail(function () {
          e.stopImmediatePropagation();
          alert('An error occurred. Please try again.');
        });
      }
  
    };
  
    // Set cookie for promobox
    Drupal.behaviors.quicken_promobox = {
  
      // Implements attach method.
      attach: function (context, settings) {
  
        // Return if we don't have promobox settings.
        if (typeof settings.quicken_promobox === "undefined") {
          return;
        }
  
        var conf = settings.quicken_promobox;
        // Return if the cookie name isn't set or we are not in document context
        if (conf.cookie_name == "" || document != context) {
          return;
        }
  
        // Return if the cookie is already set to 1
        if (!!$.cookie(conf.cookie_name) && $.cookie(conf.cookie_name) == 1) {
         return;
        }
  
        var param = new URLSearchParams(window.location.search).get("qkn_promobox");
        if (null !== param && param == "1") {
          this.setCookie();
          return;
        }
  
        conf.exclude = [];
        conf.include = [];
  
        // Set the cookie if we have a cookie name but empty pages
        if (conf.cookie_pages.length === 0) {
          this.setCookie();
          return;
        }
  
        // Build an array of paths to check
        conf.cookie_pages.forEach((path) => {
          var g = (path.charAt(0) == "~") ? "exclude" : "include";
          if (path != "") {
            conf[g].push(this.parsePath(path));
          }
        });
  
        var groups = ["exclude", "include"];
        outer:
        for (var gi = 0; gi < groups.length; gi++) {
          for (var i = 0; i < conf[groups[gi]].length; i++) {
            // Starting with excluded paths, break out on the first match
            var regex = new RegExp(conf[groups[gi]][i]);
            if (regex.test(window.location.pathname)) {
              if (gi == 1) {
                this.setCookie();
              }
              break outer;
            }
          }
        }
      },
  
      // Helper to convert to regex friendly string
      parsePath: function(path) {
        path = path.replace("~", "");
        path = "^\/" + path;
        return path;
      },
  
      // Set the cookie for 1 month
      setCookie() {
        $.cookie(Drupal.settings.quicken_promobox.cookie_name, 1, { expires: 31, path: '/', secure: true });
      }
    };
  
  })(jQuery);
  ;
  /**
   * @file
   * Custom JavaScript for the customer information form.
   */
  
  (function($) {
    Drupal.behaviors.customerInfo = {
      autocomplete : function($address, $city, $state, $zip) {
        if ($address.length < 1) {
          return;
        }
  
        var autocomplete = new google.maps.places.Autocomplete($address[0], {types: ['geocode']});
        autocomplete.addListener('place_changed', function(s) {
          var place = autocomplete.getPlace();
  
          var componentForm = {
            street_number: {
              key : 'short_name',
              val : null
            },
            route: {
              key : 'long_name',
              val : null
            },
            locality: {
              key : 'long_name',
              val : null
            },
            administrative_area_level_1: {
              key : 'short_name',
              val : null
            },
            postal_code: {
              key : 'short_name',
              val : null
            },
          };
  
          for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
              var val = place.address_components[i][componentForm[addressType].key];
              componentForm[addressType].val = val;
            }
          }
  
          var address = {
            'city' : componentForm.locality.val,
            'state' : componentForm.administrative_area_level_1.val,
            'zip' : componentForm.postal_code.val
          }
  
          if (componentForm.street_number.val == null) {
            address.address = componentForm.route.val;
  
            $address.addClass('error');
            $address.parent().siblings('.js-customer-info-address-error').removeClass('hidden');
          }
          else {
            address.address = componentForm.street_number.val + " " + componentForm.route.val;
  
            $address.removeClass('error');
            $address.parent().siblings('.js-customer-info-address-error').addClass('hidden');
          }
  
          $address.val(address.address);
          $city.val(address.city);
          $state.val(address.state);
          $zip.val(address.zip);
        });
      },
  
      attach : function(context, settings) {
  
        var validation = false;
        var validated = false;
  
        var formContext = $('#quicken-checkout-customer-info-combined-form', context);
  
        if (!formContext.length) {
          return;
        }
  
        // Trap the return/enter key.  If it comes from the first address field it's likely from the google
        // Auto complete where a user selected an address.  Therefor prevent it from submitting the customer info
        // form.  If it's from anywhere else let it submit the form
        $(window).bind("keypress", function(e) {
          if (e.keyCode === 13) {
            if ($(e.target).hasClass("js-checkout-billing-address")) {
              e.preventDefault();
            }
          }
        });
  
        var $change_payment_link = $('.has-payment-link', context);
        var $has_payment = $('.has-payment', context);
        var $payment_form_card = $('.payment-cc-form', context);
        var $checkout_paypal_form = $('.checkout-paypal-form', context);
        var $payment_form_name = $('.payment-cc-form > .payment-name', context);
        var $billing_card_name = $("input[name='quicken_checkout_billing_card_name']",context);
  
        var $card_name = $('#card-name-field', context);
  
        var $shippingTrigger = $('.js-checkout-shipping-toggle', context);
        var $shippingTarget = $('.js-checkout-shipping-form', context);
        var $first_time_sel = $('#edit-first-time-new',context);
        var $quicken_no_preview = $('.quicken_no_preview',context);
  
        var $email_addr = $('.js-checkout-email', context);
        var $address = $('.js-checkout-billing-address', context);
        var $address_2 = $('.js-checkout-billing-address-2', context);
        var $city = $('.js-checkout-billing-city', context);
        var $state = $('.js-checkout-billing-state', context);
        var $zip = $('.js-checkout-billing-zip', context);
        var $country = $('#country', context);
  
        var $same_as_billing = $('.js-checkout-shipping-toggle', context);
  
        var $has_cd = $('.has_cd', context);
        var $shipping_firstname = $('.js-checkout-shipping-firstname', context);
        var $shipping_lastname = $('.js-checkout-shipping-lastname', context);
        var $shipping_address = $('.js-checkout-shipping-address', context);
        var $shipping_address_2 = $('.js-checkout-shipping-address-2', context);
        var $shipping_city = $('.js-checkout-shipping-city', context);
        var $shipping_state = $('.js-checkout-shipping-state', context);
        var $shipping_zip = $('.js-checkout-shipping-zip', context);
        var $shipping_country = $('#shipping_country', context);
  
        var $combined_address = $('.combined-address',context);
        var $combined_address_text = $('.combined-address-text',context);
        var $address_form = $('.address-form',context);
        var $combined_address_link = $('.combined-address-link',context);
  
  
        var $submit = $('.js-customer-info-submit', context);
        var $top_submit = $('.top-button-form-submit',context);
  
        var $all_errors = $('.js-customer-info-error', context);
        var $editingstoredcc = $('.editingstoredcc', context);
  
        var $minicart_tooltip_trigger = $('.minicart-tooltip-trigger', context);
        var $minicart_tooltip_subscription_tooltip = $('.minicart-tooltip-subscription-tooltip', context);
        var $checkout_cc_form_radio = $('.checkout-cc-form-radio',context);
        var $checkout_paypal_form_radio = $('.checkout-paypal-form-radio',context);
  
        var $cc_form = $('.cc-form',context);
        var $paypal_form = $('.paypal-form',context);
        var $paypal_name = $('.paypal-name',context);
        var $paypal_account_name = $('.paypal-account-name',context);
        var $msg = $('.js-payment-method-error');
  
        // Remove after test
        var $cc_tab = $('.cc-tab',context);
        var $paypal_tab = $('.paypal-tab',context);
  
        var $in_test = $('#in_test',context);
        var $body = $('body', context);
  
        $combined_address.css('display','none');
  
        if ($paypal_tab.length > 0) {
          $(".checkout-form-header").css("display","none");
          $(".payment-cc-form").css("border","none");
          $(".checkout-paypal-form").css("border","none");
          $(".checkout-form-line").css("border","none");
          $(".checkout-simplifi-form-line").css("border","none");
        }
  
        $cc_tab.click(function (e) {
          if (!$cc_tab.hasClass("selected")) {
            $cc_tab.toggleClass("selected");
            $paypal_tab.toggleClass("selected");
            $checkout_cc_form_radio.prop('checked', true);
            $checkout_paypal_form_radio.prop("checked", false);
            $cc_form.show("fast", function () {
              $cc_form.css("overflow", "unset");
            });
            $paypal_form.hide();
            $paypal_name.slideUp();
            $msg.addClass('hidden');
          }
        });
  
        $('.addr-optional-toggle').click(function(e) {
          e.preventDefault();
          $('.addr-optional').css("display","block");
          $('.addr-optional-toggle').css("display","none");
        });
  
        $paypal_tab.click(function (e) {
          if (!$paypal_tab.hasClass("selected")) {
            $cc_tab.toggleClass("selected");
            $paypal_tab.toggleClass("selected");
            $checkout_paypal_form_radio.prop("checked", true);
            $checkout_cc_form_radio.prop("checked", false);
            $paypal_form.show("fast", function () {
              $paypal_form.css("overflow", "unset");
            });
            $cc_form.hide();
            $paypal_name.hide();
            $msg.addClass('hidden');
          }
        });
        // To here
  
  
        $minicart_tooltip_trigger.click(function (e) {
          e.preventDefault();
  
          if ($minicart_tooltip_subscription_tooltip.is(":visible")) {
            return;
          }
  
          $minicart_tooltip_subscription_tooltip.fadeIn(300, function() {
            $minicart_tooltip_subscription_tooltip.focus();
          });
        });
  
        $minicart_tooltip_subscription_tooltip.blur(function (e) {
          $minicart_tooltip_subscription_tooltip.fadeOut(300);
        });
  
  
        $minicart_tooltip_trigger.hover(function (e) {
          if ($minicart_tooltip_subscription_tooltip.is(":visible")) {
            return;
          }
          $minicart_tooltip_subscription_tooltip.fadeIn(300);
        },
        function (e) {
          $minicart_tooltip_subscription_tooltip.fadeOut(300);
        });
  
  
  
        if (hasAddress()) {
          var combined_address = "";
  
          if (($address.val() !== "N/A") && ($city.val() !== 'N/A')) {
            combined_address = $address.val() + ', ' + $city.val() + ', ' + $state.val() + ', ' + $zip.val();
          }
          else {
            combined_address =  $state.val() + ', ' + $zip.val();
          }
  
  
          $combined_address_text.html(combined_address);
          $address_form.css('display','none');
          $combined_address.css('display','block');
        }
  
        if ($change_payment_link.length >= 1) {
          if (url('?e') !== 'payment_error') {
            $payment_form_card.css('display', 'none');
            $checkout_paypal_form.css('display', 'none');
            if ($payment_form_name.hasClass('payment-name-required')) {
              $payment_form_name.find('label:first').text('Full Name');
            }
            else {
              $payment_form_name.css('display', 'none');
            }
  
            $change_payment_link.click(function (e) {
              $has_payment.slideUp('slow', function () {
                $payment_form_name.find('label').text('Name on Card');
                $payment_form_card.slideDown();
                $checkout_paypal_form.slideDown();
                if ($quicken_no_preview.val() === "1") {
                  if (Drupal.settings.quicken_checkout.simplifi_flow  && Drupal.settings.quicken_checkout.simplifi_trial_flow) {
                    $submit.val("Start your free trial");
                    $top_submit.val("Start your free trial");
                  }
                  else {
                    $submit.val("Submit Order");
                    $top_submit.val("Submit Order");
                  }
                }
                else {
                  $submit.val("Review Order");
                }
              });
            });
          }
          else {
            // There was an error.
            $has_payment.hide();
          }
        }
  
        $combined_address_link.click(function (e) {
          e.preventDefault();
          $combined_address.slideUp('slow',function() {
            $address_form.slideDown();
          });
        });
  
        if ($quicken_no_preview.val() == "1") {
           $submit.val("Submit Order");
           $top_submit.val("Submit Order");
        }
        if (Drupal.settings.quicken_checkout.simplifi_flow  && Drupal.settings.quicken_checkout.simplifi_trial_flow) {
          $submit.val("Start your free trial");
          $top_submit.val("Start your free trial");
        }
        if (hasAddress() &&  $change_payment_link.length >= 1  && $editingstoredcc.length == 0) {
          if (Drupal.settings.quicken_checkout.simplifi_flow && Drupal.settings.quicken_checkout.simplifi_trial_flow) {
            $submit.val("Start your free trial");
            $top_submit.val("Start your free trial");
          }
          else {
            $submit.val("Submit Order");
            $top_submit.val("Submit Order");
          }
          $quicken_no_preview.val("1");
        }
  
        // Add autocomplete for the address fields.
        Drupal.behaviors.customerInfo.autocomplete($address, $city, $state, $zip);
        Drupal.behaviors.customerInfo.autocomplete($shipping_address, $shipping_city, $shipping_state, $shipping_zip);
  
        $address.on('blur', function() {
          formContext.removeClass('address-validated');
        });
        $zip.on('blur', function() {
          if (($zip[0].value === "") && ($zip[1]) && ($zip[1].value != "")) {
            $zip[0].value = $zip[1].value;
          }
          if ($zip[1] && ($zip[1].value === "") && ($zip[0].value != "")) {
            $zip[1].value = $zip[0].value;
          }
          populateCityState();
        });
  
        var $billing_fields = [];
  
  
        var $shipping_fields = [$shipping_firstname, $shipping_lastname, $shipping_address, $shipping_city, $shipping_state, $shipping_zip];
  
        if (($has_cd.length > 0) && ($has_cd.css('display') !== 'none')) {
          if (($(".checkout-shipping-form").length > 0) && ($(".checkout-shipping-form").css("visibility") !== 'visible')) {
            $shipping_fields = [$shipping_firstname, $shipping_lastname];
          }
        }
  
        // validate on blur
        $zip.on('blur', function(e) {
          if (($zip[0].value === "") && ($zip[1]) && ($zip[1].value != "")) {
            $zip[0].value = $zip[1].value;
          }
          if (($zip[1]) && ($zip[1].value === "") && ($zip[0].value != "")) {
            $zip[1].value = $zip[0].value;
          }
          if ((!validateZipCode($zip.val())) && (!validateCAPostCode(($zip.val())))) {
             showError($zip);
           }
           else {
            $zip.removeClass('error');
            var msg = $zip.parent().next('.js-customer-info-error');
            msg.addClass('hidden');
          }
        });
  
        $shippingTrigger.on('change', function() {
          $shippingTarget.toggleClass('active', !$shippingTrigger.is(':checked'));
        });
  
        function showLoader($loader) {
          if ($('.loader-wrap', context).length < 1) {
            $body.append($loader);
          }
        }
  
        function submitOrderScreen() {
          var $loader = [];
  
          if ($submit.val() === "Submit Order") {
            $loader += '<div class="loader-wrap">';
            $loader += '<div class="loader">Your Order is being placed</div>';
            $loader += '</div>';
            showLoader($loader);
          }
        }
  
        function isMobileCart() {
          if  (($('.form-item-address').css('display') === 'none') || $('.address-form').hasClass('hidden')) {
            return true;
          }
          return false;
        }
  
        function hasAddress() {
          return ($address.val().length > 0) && ($city.val().length > 0) && ($zip.val().length > 0) && ($state.val() !== '00');
        }
  
        function hasName() {
          return ($card_name.val().length > 0);
        }
  
        function getCountryFromState(dropDown) {
          var country = $('#' + dropDown + ' :selected').parent().attr('label');
          if (country) {
            return country.substring(0, 2).toUpperCase();
          }
          else {
            return "";
          }
        }
  
  
        function validateZipCode(elementValue){
          var zipCodePattern = /^\d{5}$|^\d{5}-\d{4}$/;
          return zipCodePattern.test(elementValue);
        }
  
        function validateCAPostCode(elementValue) {
          // No CA postal codes are correct for the simplifi flow
          if (Drupal.settings.quicken_checkout.simplifi_flow) {
            return false;
          }
          var ca_post_regex = /^[ABCEGHJKLMNPRSTVXY]{1}\d{1}[A-Z]{1} *\d{1}[A-Z]{1}\d{1}$/i;
          return  ca_post_regex.test(elementValue);
        }
  
  
        function isEmpty(e) {
          return e === null || e === '';
        }
  
        function showError(field) {
          var $combined_address = $('.combined-address',context);
          var $address_form = $('.address-form',context);
  
          $address_form.css('display','block');
          $combined_address.css('display','none');
  
          var msg = field.parent().next('.js-customer-info-error');
          msg.removeClass('hidden');
          field.addClass('error');
        }
  
        function validateAddress() {
          var success = true;
  
          if ($('.payment-cc-form').length === 0) {
            validated = true;
            validation = true;
            return true;
          }
  
          if (!isMobileCart()) {
            $billing_fields = [$address, $city, $state,$zip];
          }
          else {
            $billing_fields = [$zip];
            $address.val('N/A');
            $city.val('N/A');
          }
  
          for (var i = 0; i < $billing_fields.length; i++) {
            var field = $billing_fields[i];
  
            if (isEmpty(field.val())) {
              showError(field);
              success = false;
            }
          }
  
          if ($("input[name='first_time']:checked").length > 0) {
            var radioValue = $("input[name='first_time']:checked").val();
            if (!radioValue) {
              $(".js-customer-info-survey-error").removeClass('hidden');
              $("input[name='first_time']").addClass('error');
  
              $(".survey-box").addClass('survey-box-error');
              success = false;
            }
          }
  
          // if ($state.val() === '00') {
          //   showError($state);
          //   // State field is hidden in mobile cart, we looked up state based on zip
          //   // but that must have failed
          //   if (isMobileCart()) {
          //     showError($zip);
          //   }
          //   success = false;
          // }
          if (!validatePaymentInfo()) {
            success = false;
          }
  
          if (!ValidateEmail($email_addr.val())) {
            $('.js-email-error').removeClass('hidden');
            $email_addr.addClass('error');
            success = false;
          }
  
          if (($(".checkout-shipping-form").length > 0) && ($(".checkout-shipping-form").css("visibility") == 'visible')) {
            for (var i = 0; i < $shipping_fields.length; i++) {
              var field = $shipping_fields[i];
  
              if (isEmpty(field.val())) {
                showError(field);
                success = false;
              }
            }
  
            if ($shipping_state.val() === '00') {
              showError($shipping_state);
              success = false;
            }
          }
          if (Drupal.settings.quicken_checkout.simplifi_flow) {
            if (getCountryFromState('edit-state') == "CA") {
              showError($('.country-error-field'));
              success = false;
            }
            if ($country.val() == "CA") {
              showError($('.country-error-field'));
              success = false;
            }
          }
          if (($has_cd.length > 0) && ($has_cd.css('display') !== 'none')) {
  
            if (getCountryFromState('edit-shipping-state') == "CA") {
              showError($same_as_billing);
              success = false;
            }
            else {
              if ($same_as_billing.is(':checked')) {
                if (getCountryFromState('edit-state') == "CA") {
                  showError($same_as_billing);
                  success = false;
                }
              }
            }
          }
          validation = success;
          validated = true;
        }
  
        function ValidateEmail(email) {
          var emailReg = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
          return emailReg.test(email);
        }
  
        function populateCityState() {
          var url = Drupal.settings.quicken_checkout.address_url;
          url = url + $zip.val() + "&key=" + Drupal.settings.quicken_checkout.address_token;
          $.get(url, function (data) {
            if ((data) && (data.results[0])) {
              for (var i = 0; i < data.results[0].address_components.length; i++) {
                if (data.results[0].address_components[i].types[0] === 'administrative_area_level_1') {
                  $state.val(data.results[0].address_components[i].short_name);
                }
                if (data.results[0].address_components[i].types[0] === 'locality') {
                  $city.val(data.results[0].address_components[i].short_name);
                }
              }
            }
          });
        }
  
        function  validatePaymentInfo() {
          if (($checkout_cc_form_radio.length === 0) && ($checkout_paypal_form_radio.length === 0)) {
            return true;
          }
          if ((!$checkout_cc_form_radio.is(":checked") && (!$checkout_paypal_form_radio.is(":checked")))) {
            var msg = $('.js-payment-method-error');
            msg.text('Please choose a payment Method');
            msg.removeClass('hidden');
            return false;
          }
          if ($checkout_paypal_form_radio.is(":checked")) {
            if ($('.paypal-account-name').text().trim().length === 0) {
              var msg = $('.js-payment-method-error');
              msg.text('Please sign in to PayPal');
              msg.removeClass('hidden');
              return false;
            }
  
          }
          return true;
        }
  
        function validateCustomerInfo() {
          if ($zip.val() !== $zip.attr('data-original-value')) {
            $state.val('00');
          }
  
          if (!isEmpty($zip.val())) {
            var url = Drupal.settings.quicken_checkout.address_url;
            url = url + $zip.val() + "&key=" + Drupal.settings.quicken_checkout.address_token;
            $.get(url, function (data) {
              if ((data) && (data.results[0])) {
                for (var i = 0; i < data.results[0].address_components.length; i++) {
                  if (data.results[0].address_components[i].types[0] === 'administrative_area_level_1') {
                    $state.val(data.results[0].address_components[i].short_name);
                  }
                  if (data.results[0].address_components[i].types[0] === 'locality') {
                    $city.val(data.results[0].address_components[i].short_name);
                  }
                  if (data.results[0].address_components[i].types[0] === 'country') {
                    $country.attr('value', data.results[0].address_components[i].short_name);
                    if ((Drupal.settings.quicken_checkout.simplifi_flow) && ($country.val() === "CA")) {
                      showError($('.country-error-field'));
                    }
                  }
                  if (data.results[0].address_components[i].types[0] === 'postal_code') {
                    if (data.results[0].address_components[i].short_name !== $zip.val()) {
                      $zip.val("");
                    }
                  }
                }
                validateAddress();
              }
              else {
                $zip.val("");
                validateAddress();
              }
            });
          }
          else {
            validateAddress();
          }
        }
  
  
        function hideCustomerInfoErrors() {
          $all_errors.addClass('hidden');
          for (var i = 0; i < $billing_fields.length; i++) {
            $billing_fields[i].removeClass('error');
          }
          $state.removeClass('error');
  
          for (var i = 0; i < $shipping_fields.length; i++) {
            $shipping_fields[i].removeClass('error');
          }
          $shipping_state.removeClass('error');
          $(".survey_box").removeClass('survey_box_error');
          $('.country-error').removeClass('error');
          $('.country-error').addClass('hidden');
        }
  
  
        function handleAddressValidationSuccess(result) {
  
          if (!result.show_modal) {
            // Use original.
            $("input[name='billing_use_original']").val(1);
            if (!$same_as_billing.is(':checked')) {
              $("input[name='shipping_use_original']").val(1);
            }
            formContext.addClass('address-validated');
            formContext.submit();
            return;
          }
          if (result.markup) {
            var $popup = $(result.markup).appendTo($body);
  
            var $address_cancel = $('.js-modal-close', $popup);
            var $address_okay = $('.js-address-okay', $popup);
  
            $popup.find('.modal-box').show();
  
            $("input:radio[name='billing']:checked").focus();
  
            $address_cancel.on('click', function(e) {
              $('.modal-overlay', $body).remove();
            });
  
            $address_cancel.on('keypress', function (e) {
              if (e.keyCode == 13) {
                $address_cancel.click();
              }
            });
  
            $address_cancel.on('keydown', function (e) {
              if (e.keyCode == 9) {
                $("input:radio[name='billing']:checked").focus();
                e.preventDefault();
              }
            });
  
            $address_okay.on('click', function(e) {
              var $billing_address_selection = $("input:radio[name='billing']:checked").val();
              if ($billing_address_selection == null) {
                $billing_address_selection = 'billing_original';
              }
  
              if ($billing_address_selection !== 'billing_original') {
                var updated_billing_address = Drupal.behaviors.customerInfo.validAddresses[$billing_address_selection];
  
                $address.val(updated_billing_address.street[0]);
                $city.val(updated_billing_address.city);
                $zip.val(updated_billing_address.postcode);
                $state.find('option').each(function() {
                  if ($(this).text() == updated_billing_address.region) {
                    $(this).attr('selected', 'selected');
                  }
                });
              }
              else {
                $("input[name='billing_use_original']").val(1);
              }
  
              if (!$same_as_billing.is(':checked')) {
                var $shipping_address_selection = $("input:radio[name='shipping']:checked").val();
                if ($shipping_address_selection == null) {
                  $shipping_address_selection = 'shipping_original';
                }
  
                if ($shipping_address_selection !== 'shipping_original') {
                  var updated_shipping_address = Drupal.behaviors.customerInfo.validAddresses[$shipping_address_selection];
  
                  $shipping_address.val(updated_shipping_address.street[0]);
                  $shipping_city.val(updated_shipping_address.city);
                  $shipping_zip.val(updated_shipping_address.postcode);
                  $shipping_state.find('option').each(function() {
                    if ($(this).text() == updated_shipping_address.region) {
                      $(this).attr('selected', 'selected');
                    }
                  });
                }
                else {
                  $("input[name='shipping_use_original']").val(1);
                }
              }
  
              $('.modal-overlay', $body).remove();
              formContext.addClass('address-validated');
              formContext.submit();
            }),
  
            $address_okay.on('keypress', function (e) {
              if (e.keyCode == 13) {
                $address_okay.click();
              }
            });
          }
        }
  
        $top_submit.on('click.qknCustomerInfo', function(e) {
          $top_submit.attr('disabled', true);
          $submit.click();
        });
  
        $submit.on('click.qknCustomerInfo', function(e) {
          $submit.attr('disabled', true);
          $top_submit.attr('disabled', true);
          hideCustomerInfoErrors();
  
          e.preventDefault();
          validateCustomerInfo();
  
          var checking  = setInterval(function() {
            if (!validation && validated) {
              $submit.attr('disabled', false);
              $top_submit.attr('disabled', false);
              clearInterval(checking);
              return;
            }
            if (!validated) {
              $submit.attr('disabled', false);
              $top_submit.attr('disabled', false);
              return;
            }
  
            if (!$billing_card_name.val() && $card_name.val()) {
              $billing_card_name.val($card_name.val());
            }
  
            var addressIsValidated = formContext.hasClass('address-validated') || formContext.hasClass('bypass-address-validation');
  
            if (addressIsValidated) {
              clearInterval(checking);
              $submit.attr('disabled', true);
              $top_submit.attr('disabled', true);
              //submitOrderScreen();
              formContext.submit();
              return;
            }
  
            if (!addressIsValidated) {
              var $post_data = {};
              $post_data.billing = {};
              $post_data.billing.street = $address.val();
              $post_data.billing.address_2 = $address_2.val();
              $post_data.billing.city = $city.val();
              $post_data.billing.state = $state.val();
              $post_data.billing.zip = $zip.val();
  
              if (!$same_as_billing.is(':checked')) {
                $post_data.shipping = {};
                $post_data.shipping.street = $shipping_address.val();
                $post_data.shipping.address_2 = $shipping_address_2.val();
                $post_data.shipping.city = $shipping_city.val();
                $post_data.shipping.state = $shipping_state.val();
                $post_data.shipping.zip = $shipping_zip.val();
              }
              else {
                $post_data.shipping = {};
                $post_data.shipping.street = $address.val();
                $post_data.shipping.address_2 = $address_2.val();
                $post_data.shipping.city = $city.val();
                $post_data.shipping.state = $state.val();
                $post_data.shipping.zip = $zip.val();
              }
  
              $.post('/shoppingcart/validate-address', $post_data, function(result) {
                handleAddressValidationSuccess(result);
                clearInterval(checking);
                $submit.attr('disabled', false);
                $top_submit.attr('disabled', false);
              }).fail(function () {
                e.stopImmediatePropagation();
                alert('An error occurred. Please try again.');
                clearInterval(checking);
              });
            }
            else {
              // No address validation needed.
              clearInterval(checking);
              //submitOrderScreen();
              formContext.submit();
              $submit.attr('disabled', true);
              $top_submit.attr('disabled', true);
              return;
            }
            $submit.attr('disabled', false);
            $top_submit.attr('disabled', false);
            clearInterval(checking);
          }, 750);
        });
        QuickenGlobal.loaded('shoppingcart/customer-info');
      }
    };
  
    Drupal.behaviors.miniCart = {
  
      pricing: false,
  
      attach: function (context, settings) {
        var that = this;
        var $couponPanel = $('.checkout-mini-cart--coupon-panel', context);
        if (!$couponPanel.length) {
          return;
        }
  
        if (typeof (Drupal.settings.quicken_coupon) === 'undefined') {
          $('.coupon-panel--link').show();
        }
  
        $('.coupon-panel--link', context).click(function (e) {
          e.preventDefault();
          $(this).hide();
          $('.coupon-panel--form', context).css('display', 'flex');
        });
  
        $('.coupon-panel--add', context).click(function (e) {
          e.preventDefault();
          that.pricing = true;
          var postData = {
            "quicken_coupon_code": $('.coupon-panel--coupon', context).val(),
            "sku": Drupal.settings.quicken_checkout.sku,
          };
          that.setCoupon(postData);
        });
  
        $('.offer-discount-remove', context).click(function (e) {
          $(this).hide();
          that.pricing = true;
  
          if (!QuickenGlobal.userCanSeeDiscount() || !that.defaultCoupon()) {
            that.clearCoupon();
          }
          else {
            var postData = {
              "quicken_coupon_code": that.defaultCoupon()
            };
            if (typeof (Drupal.settings.quicken_checkout) !== 'undefined' && Drupal.settings.quicken_checkout.sku !== false) {
              postData.sku = Drupal.settings.quicken_checkout.sku;
            }
            that.setCoupon(postData);
          }
        });
  
        if (context == document) {
          $(document).on("quicken_coupon:set quicken_coupon:get quicken:pricing:apply", function (e) {
            that.pricing = false;
            that.checkCoupon();
          });
          if (!that.defaultCoupon()) {
            that.checkCoupon();
          }
        }
        else if (!that.pricing) {
          that.checkCoupon();
        }
      },
  
      clearCoupon: function() {
        var that = this;
        $('.coupon-panel--error').hide();
        $.get(Drupal.settings.quicken_coupon.clear_coupon_callback, function (data) {
          that.switchSku();
        });
      },
  
      setCoupon: function (postData) {
        var that = this;
        $('.coupon-panel--error').hide();
        $.post(Drupal.settings.quicken_coupon.set_coupon_callback, postData, function (data) {
          if (typeof data.success === 'undefined' || data.success === false) {
            $('.coupon-panel--error').show();
            return;
          }
          couponData = {
            has_coupon: true,
            coupon: data.coupon,
            time: Date.now()
          };
          localStorage.setItem("couponData", JSON.stringify(couponData));
          that.pricing = false;
          that.switchSku();
        });
      },
  
      couponExists: function(coupon) {
        let coupons = this.defaultCoupon();
        if (coupons) {
          if (coupons.indexOf(coupon) !== -1) {
            return true;
          }
        }
        return false;
      },
  
      defaultCoupon: function() {
        var default_coupon = 'default_coupon';
        if (Drupal.settings.quicken_checkout.review_path == 'shoppingcart/review/canada') {
          default_coupon = 'ca_default_coupon';
        }
        if (typeof (Drupal.settings.quicken_coupon[default_coupon]) === 'undefined') {
          return false;
        }
        return Drupal.settings.quicken_coupon[default_coupon];
      },
  
      activeCoupon: function() {
        if (typeof (Drupal.settings.quicken_coupon['active']) === 'undefined') {
          return false;
        }
        return Drupal.settings.quicken_coupon['active'];
      },
  
      checkCoupon: function () {
        var that = this;
        var data = JSON.parse(localStorage.getItem("couponData"));
        if (!data.has_coupon) {
          $('.offer-discount-remove').hide();
          $('.coupon-panel--link').show();
        }
        else if (that.defaultCoupon()) {
          if (that.couponExists(that.activeCoupon())) {
            $('.offer-discount-remove').hide();
            $('.coupon-panel--link').show();
          }
          else {
            $('.offer-discount-remove').show();
            $('.coupon-panel--link').hide();
          }
        }
        else if (!that.couponExists(that.activeCoupon())) {
          $('.offer-discount-remove').show();
          $('.coupon-panel--link').hide();
        }
        else {
          $('.offer-discount-remove').hide();
          $('.coupon-panel--link').show();
        }
      },
  
      switchSku() {
        $.get('/shoppingcart/switch_sku', null, function (result) {
          $('.pane-cart-mini div:first-child').html(result);
          Drupal.attachBehaviors($('.pane-cart-mini div:first-child'));
          Drupal.behaviors.quicken_coupons.resetDataTime();
          Drupal.behaviors.quicken_coupons.requestData();
        }).fail(function () {
          e.stopImmediatePropagation();
          alert('An error occurred. Please try again.');
        });
      }
    }
  })(jQuery);
  ;
  /**
   * @file
   * Custom JavaScript for Braintree checkout form.
   */
  
  (function($) {
    Drupal.behaviors.billingInfo = {
      attach : function(context, settings) {
        var $body = $('html, body', context);
        var $braintree_form = $('.js-braintree-form', context);
        var $billing_info_page = $('.page-shoppingcart-billing-info',context);
        var $customer_info_page = $('.page-shoppingcart-customer-info',context);
  
        if ((!$billing_info_page.length) && (!$customer_info_page.length)) {
          return;
        }
  
        if (!$braintree_form.length) {
          return;
        }
  
       // Advanced Fraud Protection Data
        var deviceData = null;
  
        var $payment_error = $('#js-cart-review-error', context);
        var $payment_form = $('.payment-cc-form', context);
        var $checkout_header = $('.checkout-subsection-header', context);
        var $payment_form_name = $('.payment-cc-form > .payment-name', context);
  
        var $ccValid = $('.js-checkout-cc', context);
  
        var $cvv_link = $('.js-cvv-trigger', context);
        var $cvv_copy = $('.js-cvv-copy', context);
        var $cc_number = $('#credit-card-number',context);
  
        var $cc_name = $('#card-name-field', context);
        var $is_using_paypal = $('.is-using-paypal', context);
        var $checkout_cc_form_radio = $('.checkout-cc-form-radio',context);
        var $checkout_paypal_form_radio = $('.checkout-paypal-form-radio',context);
        var $cc_form = $('.cc-form',context);
        var $paypal_form = $('.paypal-form',context);
        var $paypal_name = $('.paypal-name',context);
        var $paypal_account_name = $('.paypal-account-name',context);
        var $msg = $('.js-payment-method-error');
  
  
        $cc_form.slideUp();
        $paypal_form.slideUp();
        $paypal_name.slideUp();
  
        if ($checkout_cc_form_radio.is(":checked")) {
          $cc_form.slideDown("slow", function() {
            $cc_form.css("overflow","unset");
          });
          $msg.addClass('hidden');
        }
        else if ($checkout_paypal_form_radio.is(":checked")) {
          $paypal_form.slideDown();
          $paypal_name.slideDown();
          $msg.addClass('hidden');
          if ($paypal_account_name.html() !== '') {
            $paypal_account_name.css("display","inline-block");
          }
        }
        if ($('.paypal-account-name').text().trim().length !== 0) {
          $('.paypal-info-text').text("You can click on the PayPal button to change the account you are using.");
        }
  
        $checkout_cc_form_radio.click(function (e) {
          //e.preventDefault();
          if ($checkout_cc_form_radio.is(":checked")) {
            $checkout_paypal_form_radio.prop("checked", false);
            $cc_form.slideDown("slow", function() {
              $cc_form.css("overflow","unset");
            });
            $paypal_form.slideUp();
            $paypal_name.slideUp();
            $msg.addClass('hidden');
          }
        });
  
        $checkout_paypal_form_radio.click(function (e) {
         // e.preventDefault();
          if ($checkout_paypal_form_radio.is(":checked")) {
            $checkout_cc_form_radio.prop("checked", false);
            $paypal_form.slideDown("slow", function() {
              $paypal_form.css("overflow","unset");
            });
            $cc_form.slideUp();
            $paypal_name.slideDown();
            $msg.addClass('hidden');
          }
        });
  
  
        $cvv_link.click(function (e) {
          e.preventDefault();
  
          if ($cvv_copy.is(":visible")) {
            return;
          }
  
          $cvv_copy.fadeIn(300, function(){
            $cvv_copy.focus();
          });
        });
  
        $cvv_copy.blur(function (e) {
          $cvv_copy.fadeOut(300);
        });
  
  
        var $card_number_error = $('.js-card-number-error', context);
        var $card_expiration_error = $('.js-card-expiration-date-error', context);
        var $card_cvv_error = $('.js-card-security-code-error', context);
        var $card_name_error = $('.js-card-name-error', context);
  
        var $submit = $('.checkout-button', context);
  
        var $change_paypal_link = $('.change-paypal-link', context);
  
        $change_paypal_link.click(function(e){
          $cc_form.fadeIn(400);
          $payment_form_name.fadeIn(400);
          $checkout_header.fadeIn(400);
          $is_using_paypal.slideUp();
        });
  
        function showLoader($loader) {
          if ($('.loader-wrap', context).length < 1) {
            $body.append($loader);
          }
        }
  
        function hideLoader() {
          $('.loader-wrap', context).remove();
        }
  
        function checkName() {
          if ($payment_form_name.is(":visible") && ($cc_name.val() == '')) {
            showBraintreeError('name');
            return false;
          }
          else {
            hideBraintreeError('name');
            return true;
          }
        };
  
  
        function hideAllErrors() {
          hideBraintreeError('number');
          hideBraintreeError('expirationDate');
          hideBraintreeError('cvv');
          hideBraintreeError('name');
        }
  
        function showBraintreeError(field_name) {
          $submit.attr('disabled', false);
          switch(field_name) {
            case 'number':
              $card_number_error.html('Please enter a valid card number');
              $card_number_error.siblings('.braintree-field').addClass('braintree-hosted-fields-invalid');
              break;
  
            case 'expirationDate':
              $card_expiration_error.html('Please enter a valid expiration date');
              $card_expiration_error.siblings('.braintree-field').addClass('braintree-hosted-fields-invalid');
              break;
  
            case 'cvv':
              $card_cvv_error.html('Please enter valid security code');
              $card_cvv_error.siblings('.braintree-field').addClass('braintree-hosted-fields-invalid');
              break;
  
            case 'name':
              var message = 'Please enter your name as shown on the credit card';
              if ($payment_form_name.hasClass('payment-name-required') && !$payment_form_card.is(":visible")) {
                message = 'Please enter your full name';
              }
              $card_name_error.html(message);
              $card_name_error.siblings('.braintree-field').addClass('braintree-hosted-fields-invalid');
              break;
          }
        }
  
        function hideBraintreeError(field_name) {
          switch(field_name) {
            case 'number':
              $card_number_error.html('');
              $card_number_error.siblings('.braintree-field').removeClass('braintree-hosted-fields-invalid');
              break;
  
            case 'expirationDate':
              $card_expiration_error.html('');
              $card_expiration_error.siblings('.braintree-field').removeClass('braintree-hosted-fields-invalid');
              break;
  
            case 'cvv':
              $card_cvv_error.html('');
              $card_cvv_error.siblings('.braintree-field').removeClass('braintree-hosted-fields-invalid');
              break;
  
            case 'name':
              $card_name_error.html('');
              $card_name_error.siblings('.braintree-field').removeClass('braintree-hosted-fields-invalid');
              break;
          }
        }
  
        function showAllErrors() {
          var inputs = ['number', 'expirationDate', 'cvv'];
          for (var i = 0; i < inputs.length; i++) {
            showBraintreeError(inputs[i]);
          }
          $body.animate({
            scrollTop: $('#page-title', context).offset().top
          }, 1000);
        }
  
        function showPaymentError(r) {
          $payment_error.html(r).show();
          $body.animate({
            scrollTop: $payment_error.offset().top
          }, 1000);
        }
  
        // Locks out form if braintree auth fails.
        function lockoutBraintreeForm() {
          $('.js-customer-info-submit', $braintree_form).attr('disabled', 'disabled');
          $braintree_form.submit(function(){
            e.preventDefault();
            return false;
          });
        }
  
        function hidePaymentError() {
          $payment_error.html('').hide();
        }
  
  
  
        function submitRenewalScreen() {
          var $cart_review_error = $('#js-cart-review-error', context);
          var $loader = [];
  
          $loader += '<div class="loader-wrap">';
          $loader += '<div class="loader">Your Subscription is being renewed</div>';
          $loader += '</div>';
          showLoader($loader);
        }
  
        var search = location.search.substring(1);
  
        search = search.replace('?','&');
        var obj;
        try {
          obj = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function (key, value) {
            return key === '' ? value : decodeURIComponent(value);
          });
        }
        catch (e) {}
  
        // Show error.
        if (obj && obj.e == 'payment_error') {
          var errorCode = obj.eMsg;
  
          if (errorCode in settings.quicken_checkout.error_codes) {
            // We have a valid error code.
            if (settings.quicken_checkout.error_codes[errorCode] == 'cvv') {
              hidePaymentError();
              showBraintreeError('cvv');
            }
            else {
              showPaymentError(settings.quicken_checkout.error_codes[errorCode]);
            }
          }
          else {
            // Invalid error code - show generic message.
            showPaymentError(settings.quicken_checkout.payment_error);
          }
        }
        else {
          // No error.
          hidePaymentError();
        }
  
        $cc_name.on('keyup', function(e) {
          checkName();
        });
  
  
        if ($cc_form.length > 0) {
          setupBraintree();
        }
  
        setDataFromPayPalCookie();
  
        function setDataFromPayPalCookie() {
          var data = $.cookie("qkn_pp");
          if (!data) {
            return;
          }
          var post_data = {};
  
          data = JSON.parse(data);
  
          var $address = $('.js-checkout-billing-address', context);
          var $city = $('.js-checkout-billing-city', context);
          var $state = $('.js-checkout-billing-state', context);
          var $zip = $('.js-checkout-billing-zip', context);
          var $paypal_email_address = $('.paypal-email-address', context);
          var $paypal_header = $('.paypal-header',context);
          var $paypal_name = $('.paypal-card-name',context);
          var $paypal_account = $('#quicken_checkout_paypal_account',context);
          var $paypal_account_name = $('.paypal-account-name',context);
          var $email_addr = $('.js-checkout-email', context);
          var $email_confirm_addr = $('.js-checkout-confirm-email', context);
          var $checkout_paypal_form_radio = $('.checkout-paypal-form-radio',context);
  
          var $combined_address = $('.combined-address',context);
          var $combined_address_text = $('.combined-address-text',context);
          var $address_form = $('.address-form',context);
  
          $email_addr.val(data.email);
          $email_confirm_addr.val(data.email);
          $address.val(data.address);
          $city.val(data.city);
          $state.val(data.state);
          $zip.val(data.zip);
          $paypal_email_address.html(data.email);
          $paypal_name.val(data.first_name +  " " + data.last_name);
  
          $paypal_account_name.html("<b>" + data.email + "</b>");
          $paypal_account_name.css("display","inline-block");
          $('.paypal-info-text').text("You can click on the PayPal button to change the account you are using.");
  
  
          post_data['quicken_checkout_billing_card_name'] = data.first_name +  " " + data.last_name;
          post_data['quicken_checkout_billing_card_type'] = data.type;
          post_data['quicken_checkout_billing_card_digits'] = "";
          post_data['quicken_checkout_billing_nonce'] = data.nonce;
          post_data['quicken_checkout_paypal_account'] = data.email;
          post_data['quicken_checkout_billing_device_data'] = data.deviceData;
  
          $.each(post_data, function (key, value) {
            $('input[name="' + key + '"]', $braintree_form).val(value);
          });
          $checkout_paypal_form_radio.attr("checked","checked").trigger("click");
          $.cookie("qkn_pp", null, {path: '/'});
          $('.email-row').show();
          $combined_address_text.html(data.address.replaceAll('+', ' ') + ", " + data.city.replaceAll('+', ' ') + ", " + data.state.replaceAll('+',' '));
          $combined_address.show();
          $address_form.hide();
  
        }
  
        function setupBraintree() {
          // Check if braintree is defined.
          if (typeof braintree != "object") {
            var errorMessage = settings.quicken_checkout.payment_error;
            showPaymentError(errorMessage);
            lockoutBraintreeForm();
          }
  
          braintree.client.create({
            authorization: Drupal.settings.quicken_checkout.braintree_token
          }, function (clientErr, clientInstance) {
            if (clientErr) {
              var errorMessage = settings.quicken_checkout.payment_error;
              showPaymentError(errorMessage);
              lockoutBraintreeForm();
              return;
            }
  
            braintree.dataCollector.create({
              client : clientInstance,
              kount : true
            }, function(err, dataCollectorInstance) {
              // kount environment sandbox?
              if (err) {
                // Handle error in creation of data collector
                return;
              }
              deviceData = dataCollectorInstance.deviceData;
              console.log("dataCollectorInstance.deviceData : " + dataCollectorInstance.deviceData);
            });
  
            if ($paypal_form.length === 0) {
               return;
            }
            braintree.paypalCheckout.create({
              client: clientInstance
            }, function (paypalCheckoutErr, paypalCheckoutInstance) {
  
              // Stop if there was a problem creating PayPal Checkout.
              // This could happen if there was a network error or if it's incorrectly
              // configured.
              if (paypalCheckoutErr) {
                console.error('Error creating PayPal Checkout:', paypalCheckoutErr);
                return;
              }
  
              // Set up PayPal with the checkout.js library
              paypal.Button.render({
                env: Drupal.settings.quicken_checkout.braintree_env,
                style: {
                  color: 'gold',
                  size: 'medium',
                  shape: 'rect',
                  tagline: "false"
                },
                funding: {
                  disallowed: [paypal.FUNDING.CREDIT]
                },
  
                payment: function () {
                  return paypalCheckoutInstance.createPayment({
                    flow: 'vault',
                    billingAgreementDescription: 'Your agreement description',
                    enableShippingAddress: true,
                    shippingAddressEditable: false
                  });
                },
  
                onAuthorize: function (data, actions) {
                  return paypalCheckoutInstance.tokenizePayment(data, function (err, payload) {
                    var post_data = {};
                    var nonce = payload.nonce;
  
                    post_data['quicken_checkout_billing_nonce'] = nonce;
  
                    if (payload.details) {
                      post_data['quicken_checkout_billing_card_name'] = payload.details.firstName + payload.details.lastName;
                      post_data['quicken_checkout_billing_card_type'] = payload.details.cardType;
                      post_data['quicken_checkout_billing_card_digits'] = payload.details.lastTwo;
                      var $address = $('.js-checkout-billing-address', context);
                      var $city = $('.js-checkout-billing-city', context);
                      var $state = $('.js-checkout-billing-state', context);
                      var $zip = $('.js-checkout-billing-zip', context);
                      var country;
                      var $paypal_email_address = $('.paypal-email-address', context);
                      var $paypal_header = $('.paypal-header',context);
                      var $paypal_name = $('.paypal-card-name',context);
                      var $paypal_account = $('#quicken_checkout_paypal_account',context);
                      var $paypal_account_name = $('.paypal-account-name',context);
  
                      var name_on_card = $('#card-name-field', context).val();
  
                      if (payload.details && payload.details.billingAddress) {
                        $address.val(payload.details.billingAddress.line1);
                        $city.val(payload.details.billingAddress.city);
                        $state.val(payload.details.billingAddress.state);
                        $zip.val(payload.details.billingAddress.postalCode);
                        country = payload.details.billingAddress.countryCode;
                      }
                      else if (payload.details && payload.details.shippingAddress) {
                        $address.val(payload.details.shippingAddress.line1);
                        $city.val(payload.details.shippingAddress.city);
                        $state.val(payload.details.shippingAddress.state);
                        $zip.val(payload.details.shippingAddress.postalCode);
                        country = payload.details.shippingAddress.countryCode;
                      }
                      $paypal_email_address.html(payload.details.email);
                      $paypal_name.val(payload.details.firstName + "  " + payload.details.lastName);
                      $paypal_account_name.css('display','inline-block');
                      $paypal_account_name.html("<b>PayPal " + payload.details.email + "</b>");
                      $msg.addClass('hidden');
  
                      post_data['quicken_checkout_billing_nonce'] = nonce;
                      post_data['quicken_checkout_billing_card_name'] = payload.details.firstName + "  " + payload.details.lastName;
                      post_data['quicken_checkout_billing_card_type'] = payload.type;
                      post_data['quicken_checkout_paypal_account'] = payload.details.email;
                    }
  
                    if (deviceData) {
                      console.log("On Auth, Device data - " + deviceData);
                      post_data['quicken_checkout_billing_device_data'] = deviceData;
                    }
                    else {
                      console.log("On Auth, Device data - NO DATA");
                    }
  
                    if (Drupal.settings.quicken_checkout.simplifi_flow) {
                      if (country == "CA") {
                        var msg = $('.country-error');
                        msg.removeClass('hidden');
                      }
                    }
  
                    $.each(post_data, function (key, value) {
                      $('input[name="' + key + '"]', $braintree_form).val(value);
                    });
                  });
                },
  
                onCancel: function (data) {
                  console.log('checkout.js payment cancelled', JSON.stringify(data, 0, 2));
                },
  
                onError: function (err) {
                  console.error('checkout.js error', err);
                }
              }, '#paypal-button').then(function () {
                // The PayPal button will be rendered in an html element with the id
                // `paypal-button`. This function will be called when the PayPal button
                // is set up and ready to be used.
              });
  
            });
  
  
  
            braintree.hostedFields.create({
              client : clientInstance,
              styles : {
                // Override Braintree styles
                'input': {
                  'font-size': '14px',
                  'padding': '6px 12px'
                }
              },
              fields : {
                number : {
                  selector : '#card-number-field',
                  placeholder : 'XXXX XXXX XXXX XXXX'
                },
                cvv : {
                  selector : '#card-security-code-field',
                },
                expirationDate : {
                  selector : '#card-expiration-date-field',
                  placeholder : 'MM / YY'
                }
              }
            }, function(hostedFieldsErr, hostedFieldsInstance) {
              // Event types: blur focus empty notEmpty cardTypeChange validityChange
              // v2 had all events lumped together
              hostedFieldsInstance.on('cardTypeChange', function(event) {
                if (event.cards.length === 1) {
                  var cardType = event.cards[0].type;
                  $ccValid
                    .removeClass('visa master-card discover jcb american-express diners-club maestro')
                    .addClass(cardType);
                } else {
                  // Card type not known yet, remove all
                  $ccValid.removeClass('visa master-card discover jcb american-express diners-club maestro');
                }
              });
              hostedFieldsInstance.on('blur', function(event) {
                var field = event.fields[event.emittedBy];
                if (!field.isEmpty && (field.isValid || field.isPotentiallyValid)) {
                  hideBraintreeError(event.emittedBy);
                }
                else {
                  showBraintreeError(event.emittedBy);
                }
              });
              hostedFieldsInstance.on('validityChange', function(event) {
                var field = event.fields[event.emittedBy];
  
                if (field.isValid || field.isPotentiallyValid) {
                  hideBraintreeError(event.emittedBy);
                }
                else {
                  showBraintreeError(event.emittedBy);
                }
              });
  
              $braintree_form.on('submit.qknBraintree', function(event) {
                event.preventDefault();
  
                var validationError = false;
                hideAllErrors();
                hidePaymentError();
                if ((checkName() === false) && ($payment_form_name.is(":visible"))) {
                  $body.animate({
                    scrollTop: $('#page-title', context).offset().top
                  }, 1000);
                  validationError = true;
                }
                $submit.attr('disabled', false);
  
                if (validationError) {
                  return;
                }
                $submit.attr('disabled', true);
  
                var $address = $('.js-checkout-billing-address', context);
                var $city = $('.js-checkout-billing-city', context);
                var $state = $('.js-checkout-billing-state', context);
                var $zip = $('.js-checkout-billing-zip', context);
                var $country = $('#country', context);
  
                var tokenizeOptions = {
                  billingAddress: {
                    postalCode: $zip.val(),
                    region: $state.val(),
                    countryCodeAlpha2: $country.val()
                  }
                };
  
                if (($address.val() !== "") && ($address.val() !== "N/A")) {
                  tokenizeOptions.billingAddress.streetAddress =  $address.val()
                }
                if (($city.val() !== "") && ($city.val() !== "N/A")) {
                  tokenizeOptions.billingAddress.locality =  $city.val()
                }
  
                hostedFieldsInstance.tokenize(tokenizeOptions, function (tokenizeErr, payload) {
  
                  if (tokenizeErr && $cc_form.is(":visible")) {
                    switch (tokenizeErr.code) {
                      case 'HOSTED_FIELDS_FIELDS_EMPTY':
                        // occurs when none of the fields are filled in
  
                        showAllErrors();
  
                        break;
                      case 'HOSTED_FIELDS_FIELDS_INVALID':
                        // occurs when certain fields do not pass client side validation
  
                        tokenizeErr.details.invalidFieldKeys.map(function (item) {
                          showBraintreeError(item);
                        });
  
                        break;
                      case 'HOSTED_FIELDS_TOKENIZATION_FAIL_ON_DUPLICATE':
                        // occurs when:
                        //   * the client token used for client authorization was generated
                        //     with a customer ID and the fail on duplicate payment method
                        //     option is set to true
                        //   * the card being tokenized has previously been vaulted (with any customer)
                        // See: https://developers.braintreepayments.com/reference/request/client-token/generate/#options.fail_on_duplicate_payment_method
  
                        showPaymentError(settings.quicken_checkout.payment_error);
  
                        break;
                      case 'HOSTED_FIELDS_TOKENIZATION_CVV_VERIFICATION_FAILED':
                        // occurs when:
                        //   * the client token used for client authorization was generated
                        //     with a customer ID and the verify card option is set to true
                        //     and you have credit card verification turned on in the Braintree
                        //     control panel
                        //   * the cvv does not pass verfication (https://developers.braintreepayments.com/reference/general/testing/#avs-and-cvv/cid-responses)
                        // See: https://developers.braintreepayments.com/reference/request/client-token/generate/#options.verify_card
  
                        showBraintreeError('cvv');
  
                        break;
                      case 'HOSTED_FIELDS_FAILED_TOKENIZATION':
                        // occurs for any other tokenization error on the server
  
                        showPaymentError(settings.quicken_checkout.payment_error);
  
                        break;
                      case 'HOSTED_FIELDS_TOKENIZATION_NETWORK_ERROR':
                        // occurs when the Braintree gateway cannot be contacted
  
                        showPaymentError(settings.quicken_checkout.payment_error);
  
                        break;
                      default:
                        showPaymentError(settings.quicken_checkout.payment_error);
                    }
                    $submit.attr('disabled', false);
                    $body.animate({
                      scrollTop: $('#page-title', context).offset().top
                    }, 1000);
                    return;
                  }
  
                  var post_data = {};
                  if ($cc_form.is(":visible")) {
  
                    var nonce = payload.nonce;
                    var name_on_card = $('#card-name-field', context).val();
  
                    post_data['quicken_checkout_billing_nonce'] = nonce;
                    post_data['quicken_checkout_billing_card_name'] = name_on_card;
  
                    if (payload.details) {
                      post_data['quicken_checkout_billing_card_type'] = payload.details.cardType;
                      post_data['quicken_checkout_billing_card_digits'] = payload.details.lastTwo;
                    }
  
                    if (deviceData) {
                      console.log("On Submit, Device data - " + deviceData);
                      post_data['quicken_checkout_billing_device_data'] = deviceData;
                    }
                    else {
                      console.log("On Sumbit, Device data - NO DATA");
                    }
                  }
  
                  $.each(post_data, function (key, value) {
                    $('input[name="' + key + '"]', $braintree_form).val(value);
                  });
                  $braintree_form.off('submit.qknBraintree');
                  $braintree_form.trigger('submit');
                  //if (Drupal.settings.quicken_checkout.renewing) {
                  //  submitRenewalScreen();
                  //}
                });
              });
            });
          });
        }
      }
    };
  })(jQuery);
  ;
  /**
   * @file
   * Custom JavaScript to submit the order to Magento.
   */
  
  (function($, Drupal, QuickenGlobal) {
    Drupal.behaviors.checkoutReview = {
      attach : function(context, settings) {
        var $body = $('body', context);
  
        if ($body.hasClass('panels-page-shopping-cart-confirmation')) {
          // Confirmation page
          var $checkout_download_button = $('.checkout-download-button',context);
          if ($checkout_download_button.length > 0) {
            if (QuickenGlobal.userDevice === 'Macintosh') {
              $btn = $('#checkout-download-button-win',context);
              $btn.removeClass('button btn-primary checkout-download-button');
            }
            else {
              $btn = $('#checkout-download-button-mac',context);
              $btn.removeClass('button btn-primary checkout-download-button');
            }
          }
  
          // Confirmation "Start on Web" page: win/mac download link toggle.
          var $sow_checkout_download = $('.confirm-content--details--download', context);
          if ($sow_checkout_download.length > 0) {
            if (QuickenGlobal.userDevice === 'Macintosh') {
              $sow_checkout_download.find('.checkout-dl-win-link').hide();
              $sow_checkout_download.find('.checkout-dl-mac-link').show();
  
              $('.confirm-content--details .checkout-dl-win-link-primary').hide();
              $('.confirm-content--details .checkout-dl-mac-link-secondary').hide();
            } else {
              $sow_checkout_download.find('.checkout-dl-win-link').show();
              $sow_checkout_download.find('.checkout-dl-mac-link').hide();
  
              $('.confirm-content--details .checkout-dl-mac-link-primary').hide();
              $('.confirm-content--details .checkout-dl-win-link-secondary').hide();
            }
          }
  
          // Show mobile panel only on mobile.
          if (QuickenGlobal.userIsMobile()) {
            if (QuickenGlobal.userIsAndroid()) {
              var $appDownloadLink = $('.app-download-link', context);
              $appDownloadLink.attr('href', $appDownloadLink.data('link-android'));
            }
  
            $('.js-checkout-desktop-only-panel', context).hide();
            $('.js-checkout-mobile-only-panel', context).show();
          }
        }
  
        var $checkout_button = $('.js-quicken-checkout-button', context);
        if ($checkout_button.length < 1) {
          return;
        }
  
        var $cart_review_error = $('#js-cart-review-error', context);
        var $loader = [];
  
        $loader += '<div class="loader-wrap">';
        $loader += '<div class="loader">Your order is being processed…</div>';
        $loader += '</div>';
  
  
  
        function showPaymentError(err) {
          $cart_review_error.html(err).show();
        }
  
        function hidePaymentError() {
          $cart_review_error.html('').hide();
        }
  
        function showLoader() {
          if ($('.loader-wrap', context).length < 1) {
            $body.append($loader);
          }
        }
  
        function hideLoader() {
          $('.loader-wrap', context).remove();
        }
  
        hidePaymentError();
  
        $checkout_button.click(function (e) {
          e.preventDefault();
          $(this).addClass('disabled');
          showLoader();
          hidePaymentError();
  
          $.post(Drupal.settings.quicken_checkout.place_order_callback, {}, function (result) {
            if (result.error) {
              if (Drupal.settings.quicken_checkout.placeorder) {
                window.location = "/" + Drupal.settings.quicken_checkout.customer_info_path + "?e=payment_error&eMsg=" + result.error;
              }
              hideLoader();
              showPaymentError(result.error);
              $body.animate({
                scrollTop: $cart_review_error.offset().top
              }, 1500);
            }
  
            if (result.fatal_error) {
              window.location = "/" + Drupal.settings.quicken_checkout.error_path;
            }
  
            if (result.success) {
              window.location = "/" + Drupal.settings.quicken_checkout.confirmation_path;
            }
          });
        });
  
        if (Drupal.settings.quicken_checkout.placeorder) {
          $(".checkout-template").css("opacity", 0);
          $(".footer-main-checkout-nav").css("opacity", 0);
          $(".footer-main-checkout-legal").css("opacity", 0);
          $(".navbar").css("opacity", 0);
          $("#page-title").css("opacity", 0);
          $(".breadcrumb-wrapper").css("opacity", 0);
          $checkout_button.click();
        }
  
        // Setup order summary for mobile.
        Drupal.behaviors.checkoutReview.constructMobileHeader(context);
      },
  
      constructMobileHeader: function(context){
        var total = $('.js-review-total', context).text();
  
        var $mobileHeaderDiv = $('<div class="cart-review-mobile-header" />')
          .append('<a class="order-details-link" href="#orderdetails">' + Drupal.t('Show order summary') + '</a>')
          .append('<span class="total">' + total + '</span>')
          .append($('.js-quicken-checkout-button', context).clone(true, true));
  
        $mobileHeaderDiv.insertBefore($('.breadcrumb-wrapper', context));
  
        $('.order-details-link', context).on('click', function(e) {
          $('html, body').animate({
            scrollTop: $('#orderdetails').offset().top
          }, 700);
        });
      }
    };
  })(jQuery, Drupal, QuickenGlobal);
  ;
  /**
   * @file
   * When a Mac user visits the all products page we need to highlight Mac and replaced elements.
   *
   * To ensure this is Varnish friendly we do this switcharoo in JS.
   */
  (function ($) {
    Drupal.behaviors.quickenProductMacToTop = {
      attach: function(context) {
        if (!$('.view-all-products-list', context).length) {
          return;
        }
        var os = navigator.platform;
        // According to http://stackoverflow.com/a/19883965/43, Mac means
        var mac_oses = ["Macintosh", "MacIntel", "MacPPC", "Mac68K", "iPhone", "iPod", "iPad", "iPhone Simulator", "iPod Simulator", "iPad Simulator"];
        var $products = $('.view-all-products-list', context);
        // If this isn't a Mac user we don't need to do anything.
        if (mac_oses.indexOf(os) == -1) {
          $products.append($('.operating-system-mac', $products));
          return;
        }
      }
    };
    Drupal.behaviors.smoothScrollToClickedProduct = {
      attach: function(context) {
        if (!$('.view-all-products-list, .view-all-products-list-mac', context).length) {
          return;
        }
        $('a[href^="#product-summary"]', context).on('click', function(e){
          e.preventDefault();
          var hash = this.hash;
          $('html, body').animate({
            scrollTop: $(hash).offset().top
          }, 800);
        });
      }
    };
  })(jQuery);
  ;
  (function ($) {
    Drupal.behaviors.quickenProductsSystemRequirementsModal = {
      attach: function(context) {
        if (!$('.js-system-requirements-link', context).length) {
          return;
        }
  
        // Activate interlay for Product Card + Comp chart header.
        $('.js-system-requirements-link', context).on('click.qknSysReqs', function(e) {
          var modalHref = $(this).data('js-href');
          activateSysReqsModalOnClick(modalHref);
          e.preventDefault();
        });
  
        var activateSysReqsModalOnClick = function(modalHref) {
          $.get(modalHref, function(result) {
            if (result.markup) {
              var $body = $('body', context);
              var $overlay = $(result.markup).appendTo($body);
              var $modal_box = $('.modal-box', context);
  
              $overlay.on('click', function(e) {
                if ($(e.currentTarget).hasClass('modal-overlay')) {
                  e.preventDefault();
                  $overlay.remove();
                }
              });
  
              $('.js-modal-close', $overlay).on('click', function(e) {
                e.preventDefault();
                $overlay.remove();
              });
  
              $modal_box.show();
  
            }
          });
        };
  
      }
    };
  })(jQuery);
  ;
  /**
   * @file
   * Custom JavaScript to override pricing discounts.
   */
  
  (function ($) {
  
    /**
     * Overrides default pricing rendering with predefined dynamic callbacks.
     *
     * Uses a config with expected format like:
     * {
     *   "monthly": {
     *     "/tsm/win/discopulse2": {},
     *     "/pulse/email/deluxe": {
     *       "query": "mp=1"
     *     }
     *   },
     *   "yearlyPlus3": {
     *     "/email/1yr/nf/3mo": {
     *       "message": "+ 3 months",
     *     }
     *   }
     * }
     */
    Drupal.behaviors.quickenPrice = {
  
      /**
       * The default list of wrappers selectors for price.
       */
      wrappers: [
        ".views-field-field-price",
        ".hero-product-card-price"
      ],
  
      /**
       * The default selector for the amount.
       */
      amountSel: '.checkout-cart-item-price-promo .price-amount',
  
      /**
       * The default selector for the strikethrough amount.
       */
      strikeSel: '.checkout-cart-item-price-strike .price-amount',
  
  
      /**
       * Attaches the behavior to the page.
       *
       * @param context
       * @param settings
       */
      attach: function (context, settings) {
        if (typeof (settings.quickenPrice) === 'undefined' || typeof (settings.quickenPrice.frontendOverrides) === 'undefined') {
          return;
        }
  
        var config = settings.quickenPrice.frontendOverrides;
  
        Object.keys(config).forEach(function (configKey) {
          if (Drupal.behaviors.quickenPrice.render.hasOwnProperty(configKey)) {
            Drupal.behaviors.quickenPrice.render[configKey](config[configKey], context);
          }
        });
      },
  
      /**
       * Defines a utility function to round amount to a price value.
       *
       * @param amount
       * @returns {number}
       */
      roundPrice: function (amount) {
        var precision = Math.pow(10, 2);
        return Math.ceil(amount * precision) / precision;
      },
  
      /**
       * Defines a utility function to get the configuration for the current page.
       *
       * Returns false if there is no entry for the current page in the subconfig.
       *
       * @param subConfig
       */
      getCurrentPageConfig: function (subConfig) {
        var pathName = window.location.pathname.toLowerCase();
        if (!subConfig.hasOwnProperty(pathName)) {
          return false;
        }
  
        var queryString = window.location.search.toLowerCase();
  
        if (subConfig[pathName].hasOwnProperty('query')) {
          if (queryString.indexOf(subConfig[pathName].query.toLowerCase()) === -1) {
            return false;
          }
        }
  
        // Do a hard skip if the value for "excludeQuery" is matched in order to
        // allow multiple price renderings on a single URL.
        if (subConfig[pathName].hasOwnProperty('excludeQuery')) {
          if (queryString.indexOf(subConfig[pathName].excludeQuery.toLowerCase()) >= 0) {
            return false;
          }
        }
  
        return subConfig[pathName];
      },
  
      /**
       * Defines a utility function to get a property from a pageConfig if it
       * exists. Otherwise it falls back to the passed default value.
       *
       * @param pageConfig
       * @param key
       * @param defaultValue
       * @returns {*}
       */
      getPageConfigValue: function (pageConfig, key, defaultValue) {
        if (pageConfig.hasOwnProperty(key)) {
          return pageConfig[key];
        }
  
        return defaultValue;
      },
  
      /**
       * Defines a reusable function to quickly update a price element to be in
       * monthly format.
       *
       * @param selector
       * @param months
       * @returns The total price amount
       */
      setMonthlyAmount: function (selector, $target, months) {
        var $amount = $(selector, $target);
        var amount = $amount.data('amount');
        var monthly = Drupal.behaviors.quickenPrice.roundPrice(amount / months).toFixed(2);
        $amount.html(monthly);
  
        // Add price suffix if it doesn't exist.
        if ($amount.siblings('.price-suffix').length === 0) {
          $amount.after($('<span class="price-suffix"></span>'));
        }
        $amount.siblings('.price-suffix').html('/month');
  
        return amount;
      },
  
      /**
       * Perform standard/generic monthly rendering for a price.
       *
       * @param $target
       * @param $currentTarget
       * @param pageConfig
       */
      handleStandardMonthlyRendering: function ($target, $currentTarget, pageConfig) {
        // Set the full behavior name to shorter temp variable for readability.
        var QP = Drupal.behaviors.quickenPrice;
  
        var months = QP.getPageConfigValue(pageConfig, 'months1y', 12);
        var billedText = QP.getPageConfigValue(pageConfig, 'billedText1y', 'Billed annually -');
        var subscriptionLength = $('.checkout-cart-item-price-promo', $target).data('subscriptionLength');
        // Check if this is a 2 year sku or not.
        if (subscriptionLength === 24) {
          months = QP.getPageConfigValue(pageConfig, 'months2y', 24);
          billedText = QP.getPageConfigValue(pageConfig, 'billedText2y', 'Billed at purchase -');
        }
  
        var promoAmount = QP.setMonthlyAmount(QP.amountSel, $target, months);
  
        // Use the base non-promotion SKU length for the strikeout price.
        var discoAmount = QP.setMonthlyAmount(QP.strikeSel, $target, subscriptionLength);
  
        // Set the billed text amount below the CTA button.
        $currentTarget.parent().addClass('monthly-price').addClass('pricing-monthly');
        $currentTarget
          .siblings('.views-field-field-product-sku')
          .append('<div class="cta--footer">' + billedText + ' $' + promoAmount + '</div>');
      },
  
      /**
       * List of render callback types supported. Called dynamically based on the
       * admin settings for settings.quickenPrice.frontendOverrides.
       */
      render: {
        /**
         * Renders monthly pricing for given pages.
         */
        monthly: function (subConfig, context) {
          // Set the full behavior name to shorter temp variable for readability.
          var QP = Drupal.behaviors.quickenPrice;
  
          var pageConfig = QP.getCurrentPageConfig(subConfig);
          if (pageConfig === false) {
            return;
          }
  
          $(QP.wrappers.join(','), context).on("quicken:pricing:apply", function (event) {
            var $target = $(event.target);
            var $currentTarget = $(event.currentTarget);
            QP.handleStandardMonthlyRendering($target, $currentTarget, pageConfig);
  
            // Hide/show elements that are dynamic based on if this is triggered.
            $('.pricing-monthly-hide').hide();
            $('.pricing-monthly-show').show();
          });
        },
  
        /**
         * Renders yearly pricing and shows +3 months for given pages.
         */
        yearlyPlus3: function (subConfig, context) {
          // Set the full behavior name to shorter temp variable for readability.
          var QP = Drupal.behaviors.quickenPrice;
  
          var pageConfig = QP.getCurrentPageConfig(subConfig);
          if (pageConfig === false) {
            return;
          }
  
          $(QP.wrappers.join(','), context).on("quicken:pricing:apply", function (event) {
            var $target = $(event.target);
            var $currentTarget = $(event.currentTarget);
  
            // Add CSS class if this needs to be targeted later.
            $($currentTarget).parent().addClass('pricing-yearlyPlus3');
  
            // Insert +3 months verbiage.
            var message = QP.getPageConfigValue(pageConfig, 'message', '+ 3 bonus months FREE!');
  
            $(QP.strikeSel, $target).parent()
              .hide()
              .after('<span class="price-suffix quicken-red-text">' + message + '</span>');
  
            // Hide/show elements that are dynamic based on if this is triggered.
            $('.pricing-yearlyPlus3-hide').hide();
            $('.pricing-yearlyPlus3-show').show();
          });
        },
  
        /**
         * Renders monthly pricing and shows +3 months for given pages.
         */
        monthlyPlus3: function (subConfig, context) {
          // Set the full behavior name to shorter temp variable for readability.
          var QP = Drupal.behaviors.quickenPrice;
  
          var pageConfig = QP.getCurrentPageConfig(subConfig);
          if (pageConfig === false) {
            return;
          }
  
          $(QP.wrappers.join(','), context).on("quicken:pricing:apply", function (event) {
            var $target = $(event.target);
            var $currentTarget = $(event.currentTarget);
  
            // Add CSS class if this needs to be targeted later.
            $($currentTarget).parent().addClass('pricing-monthlyPlus3');
  
            QP.handleStandardMonthlyRendering($target, $currentTarget, pageConfig);
  
            // Hide/show elements that are dynamic based on if this is triggered.
            $('.pricing-monthlyPlus3-hide').hide();
            $('.pricing-monthlyPlus3-show').show();
          });
        }
      },
    };
  })(jQuery);
  ;
  (function($) {
    Drupal.behaviors.QuickenNSPromoCampaign = {
      attach: function(context, settings) {
        if (!settings.QknNSPromo) {
          return;
        }
  
  
        // Maybe show supernav.
        if (!settings.QknNSSupernav.isAffectedBySubscriberCookie || !QuickenGlobal.userCanSeeDiscount()) {
          if ($('.nav-promo-box-container', context).length) {
            $('.nav-promo-box-container', context).removeClass('nojs-hidden');
          }
        }
  
        if (!QuickenGlobal.userCanSeeDiscount()) {
          return;
        }
  
        // Allows for alternate text for users who see discount.
        $('[data-promo-alt-text]').each(function( i, el ) {
          $(el).text( $(el).attr('data-promo-alt-text') );
          $(el).removeAttr('data-promo-alt-text')
        });
  
        // Add ribbon.
        if (settings.QknNSPromo.shouldShowRibbon) {
          // Compare & Canada stuff.
          var macComparePath = 'mac/compare';
          var compareLinkHref = '/compare';
          var macCompareLinkHref = '/mac/compare';
          if (settings.QknNSPromo.isCanada) {
            // Set compare path for Canada.
            var macComparePath = 'compare/mac';
            var compareLinkHref = '/canada/compare';
            var macCompareLinkHref = '/canada/compare/mac';
          }
  
          $ribbonContent = $('<div class="promo-banner"><div class="promo-banner-inner">' +
            settings.QknNSPromo.ribbonContent +
          '</div></div>');
          if (settings.QknNSPromo.currentPath == 'compare' || settings.QknNSPromo.currentPath == macComparePath) {
            $('.promo-banner--ribbon__cta', $ribbonContent).remove();
          }
          else if (QuickenGlobal.userDevice == 'Macintosh' && $('.promo-banner--ribbon__cta a', $ribbonContent).attr('href') == compareLinkHref) {
            // Edit CTA destination based on OS.
            $('.promo-banner--ribbon__cta a', $ribbonContent).attr('href', macCompareLinkHref);
          }
          $parent = $(settings.QknNSPromo.parentSelector, context).prepend($ribbonContent);
  
          $('body', context).addClass('qkn-non-subscriber-promo-active');
  
          var resizePromoBannerHeight = function() {
            var calcdHeight = $('.promo-banner--ribbon__body', context).outerHeight(true) + $('.promo-banner--ribbon__cta', context).outerHeight(true);
            calcdHeight = calcdHeight + 30;
            $('.promo-banner--ribbon-decoration', context).height(calcdHeight);
          }.bind(this);
  
          // Init.
          resizePromoBannerHeight();
  
          // Add listener to resize ribbon height.
          if (typeof $.debounce === 'function') {
            resizePromoBannerHeight = $.debounce(250, resizePromoBannerHeight);
          }
          $(window).on('resize', resizePromoBannerHeight);
        }
  
        var currentPath = window.location.pathname;
        if (settings.QknNSPromo.burstPages.indexOf(currentPath) >= 0) {
          $('body', context).addClass('pulse-promo');
          if (settings.QknNSPromo.burstClass) {
            $('body', context).addClass(settings.QknNSPromo.burstClass);
          }
          if ($('.hero-product-card .guarantee-badge', context).length) {
            $('.hero-product-card .guarantee-badge', context).addClass('promo-badge');
          }
  
          if ($('.promo-hero-card-without-badge .hero-product-card', context).length) {
            $('.hero-product-card-top', context).append('<div class="guarantee-badge promo-badge" />');
          }
  
          Drupal.behaviors.quickenBurstPromoCampaign.addProductDisclaimers(context, settings);
        }
  
      }
    };
  })(jQuery);
  ;
  