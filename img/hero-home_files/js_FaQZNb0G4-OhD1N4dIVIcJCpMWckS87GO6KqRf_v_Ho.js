(function($) {
  Drupal = Drupal || {};
  Drupal.behaviors = Drupal.behaviors || {};
  Drupal.behaviors.TbmMessages = {
    attach: function(context, settings) {
      var $messageForm = $("form[id^=tbm-message-form]");

      $messageForm.find("[name='ajax']").val(1);

      $messageForm.find("input, textarea").on("blur change", function() {
        var thisFieldName = $(this).attr("name");
        Drupal.TbmMessages.formValidate(thisFieldName, $(this).closest('form'));
      });

      // Initialise the message popup step at 'form'.
      Drupal.TbmMessages.popupChangeStep('form', $messageForm);

      $messageForm.submit(function(e) {
        const $messageFormAncestor = Drupal.TbmMessages.getFormAncestor($(this));
        $messageFormAncestor.find("#tbm-messages-form-result-subwrapper").text("");
        e.preventDefault();

        if (Drupal.TbmMessages.formValidate('all', $(this))) {
          Drupal.TbmMessages.formPreview($(this));
        }
      });

      $(window).on('tbm_popup_close', function() {
        Drupal.TbmMessages.resetForm($messageForm);
      });
    }
  };

  Drupal.TbmMessages = Drupal.TbmMessages || {};

  Drupal.TbmMessages.fieldInfo = function() {
    return [
      {
        name: 'name',
        label: 'Name',
        messageEmpty: 'Please, enter your name.',
      },
      {
        name: 'email',
        label: 'Email address',
        messageEmpty: 'Please, enter your email address.',
      },
      {
        name: 'location',
        label: 'Location',
        messageEmpty: 'Please, enter your location.',
      },
      {
        name: 'message',
        label: 'Message',
        messageEmpty: 'Please, enter your message.',
      }
    ];
  }

  Drupal.TbmMessages.formValidate = function(fieldToValidate, $messageForm) {
    var isFormValid = true;
    var fieldsInfo = Drupal.TbmMessages.fieldInfo();
    for (var i in fieldsInfo) {
      var fieldInfo = fieldsInfo[i];
      if(fieldInfo.name !== fieldToValidate && fieldToValidate !== 'all') {
        continue;
      }
      var $inputElement = $messageForm.find("[name='" + fieldInfo.name + "']");

      // Get the field's value.
      var inputValue = $inputElement.val();
      if ($inputElement.attr('type') === 'checkbox') {
        inputValue = $inputElement.is(':checked');
      }

      $inputElement.prop("placeholder", fieldInfo.messageEmpty);

      if (!inputValue) {
        $inputElement.addClass("error");
        if(!$inputElement.prev().hasClass('form-error')) {
          $inputElement.before('<div class="form-error">'+fieldInfo.messageEmpty+'</div>')
        }
        else {
          $inputElement.prev('.form-error').show();
        }
        if ($inputElement.attr('type') === 'checkbox') {
          $inputElement.closest('.form-item').addClass('error');
        }
        isFormValid = false;
      }
      else {
        $inputElement.removeClass('error').prev('.form-error').hide();
        if ($inputElement.attr('type') === 'checkbox') {
          $inputElement.closest('.form-item').removeClass('error');
        }
      }
    }

    return isFormValid;
  };

  Drupal.TbmMessages.getFormAncestor = function($messageForm) {
    return $messageForm.closest("[id=tbm-messages-form-wrapper]").parent();
  };

  Drupal.TbmMessages.formPreview = function($messageForm) {
    Drupal.TbmMessages.popupChangeStep('preview', $messageForm);

    var fieldsInfo = Drupal.TbmMessages.fieldInfo();
    var submissionSanitisedValues = [];
    for (var i in fieldsInfo) {
      var fieldInfo = fieldsInfo[i];
      var $inputElement = $messageForm.find("[name='" + fieldInfo.name + "']");
      var rawValue = $inputElement.val();

      // Use jQuery to sanitise the raw value from the form.
      var sanitisedValue = $('<div>').text(rawValue).html();

      // Handle line-breaks in the message.
      if (fieldInfo.name == 'message') {
        sanitisedValue = sanitisedValue.replace(/\n/g, '</p><p>').replace('<p></p>', '');
      }

      submissionSanitisedValues[fieldInfo.name] = sanitisedValue;
    }

    // Hide/show the relevant parts.
    const $messageFormAncestor = Drupal.TbmMessages.getFormAncestor($messageForm);

    $messageFormAncestor.find("#tbm-messages-form-wrapper").hide();

    var previewHtml = '';
    previewHtml += '<a href="#" id="tbm-messages--back-to-form">Edit your message</a>';
    previewHtml += '<div id="tbm-messages--message-wrapper">';
    previewHtml += '<p>' + submissionSanitisedValues['message'] + '</p>';
    previewHtml += '<p><b>From: ' + submissionSanitisedValues['name'] + '</b></p>';
    previewHtml += '</div>';
    previewHtml += '<div class="form-generic"><div class="form-actions">';
    previewHtml += '<input type="submit" id="tbm-messages--submit" class="btn-pri" value="Send your message"/>';
    previewHtml += '</div></div>';

    $messageFormAncestor.find("#tbm-messages-form-result-wrapper").show();
    $messageFormAncestor.find("#tbm-messages-form-result-subwrapper").html(previewHtml);

    $messageFormAncestor.find('#tbm-messages--submit').on('click', function() {
      Drupal.TbmMessages.formAjaxSubmit($messageForm);
    });
    $messageFormAncestor.find('#tbm-messages--back-to-form').on('click', function(e) {
      e.preventDefault();
      Drupal.TbmMessages.popupChangeStep('form', $messageForm);
      $messageFormAncestor.find("#tbm-messages-form-wrapper").show();
      $messageFormAncestor.find("#tbm-messages-form-result-wrapper").hide();
    });
  };

  Drupal.TbmMessages.formAjaxSubmit = function($messageForm) {
    var errorOutput = "<h2>Message Failed to Send</h2><p>Please refresh the page and try again.</p>";
    errorOutput = '<div id="tbm-messages--message-wrapper">' + errorOutput + '</div>';
    var successOutput = "<h2>Thank you for your message</h2>";
    successOutput = '<div id="tbm-messages--message-wrapper">' + successOutput + '</div>';

    const $messageFormAncestor = Drupal.TbmMessages.getFormAncestor($messageForm);
    var $resultSubWrapper = $messageFormAncestor.find("#tbm-messages-form-result-subwrapper");
    $.ajax({
       type: "POST",
       url: $messageForm.attr('action'),
       data: $messageForm.serialize(),
       dataType: 'json',
       success: function(data) {
         Drupal.TbmMessages.popupChangeStep('result', $messageForm);
         if(data.success === true) {
           $resultSubWrapper.html(successOutput);
         }
         else {
           $resultSubWrapper.html(errorOutput);
           console.log(data.errorMessage);
         }
       },
       error: function (data) {
         Drupal.TbmMessages.popupChangeStep('result', $messageForm);
         $resultSubWrapper.html(errorOutput);
      }
    });
  }

  Drupal.TbmMessages.popupChangeStep = function(step, $messageForm) {
    var classesToRemove = [
      'tbm-msg--step--form',
      'tbm-msg--step--preview',
      'tbm-msg--step--result'
    ].join(' ');

    $messageForm.closest('.tbm-popup-outer')
      .removeClass(classesToRemove)
      .addClass('tbm-msg--step--' + step);
  }

  Drupal.TbmMessages.resetForm = function($messageForm) {
    Drupal.TbmMessages.popupChangeStep('form', $messageForm);

    var fieldsInfo = Drupal.TbmMessages.fieldInfo();
    for (var i in fieldsInfo) {
      var fieldInfo = fieldsInfo[i];
      $messageForm.find("[name='" + fieldInfo.name + "']").val('').prop('checked', false);
    }

    // Remove errors on the form.
    $messageForm.find('.error').removeClass('error');
    $messageForm.find('.form-error').remove();
    $messageForm.find('[placeholder]').removeAttr('placeholder');

    // Hide/show the relevant parts.
    const $messageFormAncestor = Drupal.TbmMessages.getFormAncestor($messageForm);
    $messageFormAncestor.find("#tbm-messages-form-wrapper").show();
    $messageFormAncestor.find("#tbm-messages-form-result-wrapper").hide();
    $messageFormAncestor.find("#tbm-messages-form-result-subwrapper").html('');

    // Refresh our token (this code is copied from the recaptcha_v3 module).
    grecaptcha.ready(function () {
      var $element = $messageForm.find('[name=recaptcha_v3_token]');

      grecaptcha.execute(
        $element.data('recaptcha-v3-sitekey'),
        {
          action: $element.data('recaptcha-v3-action')
        }
      ).then(function (token) {
        $element.val(token);
        $element.trigger('change');
      });
    });
  }
})(jQuery);
;
