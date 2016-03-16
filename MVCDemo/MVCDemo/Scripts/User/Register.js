/// <reference path="../_references.js" />

$(document).ready(function() {

    //var remoteCustomAjaxRequest;
    //var remoteCustomAjaxRequestNumber = -1;
    //$.validator.addMethod("remoteCustom", function( value, element, param ) {
    //    if ( this.optional( element ) ) {
    //        return "dependency-mismatch";
    //    }
    //
    //    var previous = this.previousValue( element ),
    //        validator, data;
    //
    //    if (!this.settings.messages[ element.name ] ) {
    //        this.settings.messages[ element.name ] = {};
    //    }
    //    previous.originalMessage = this.settings.messages[ element.name ].remote;
    //    this.settings.messages[ element.name ].remote = previous.message;
    //
    //    param = typeof param === "string" && { url: param } || param;
    //
    //    if ( previous.old === value ) {
    //        return previous.valid;
    //    }
    //
    //    previous.old = value;
    //    validator = this;
    //    this.startRequest( element );
    //    data = {};
    //    data[element.name] = value;
    //
    //    if (remoteCustomAjaxRequest) {
    //        remoteCustomAjaxRequest.abort();
    //    }
    //
    //    var thisRequestNumber = ++remoteCustomAjaxRequestNumber;
    //    remoteCustomAjaxRequest = $.ajax($.extend(true, {
    //        mode: "abort",
    //        port: "validate" + element.name,
    //        dataType: "json",
    //        data: data,
    //        context: validator.currentForm,
    //        success: function( response ) {
    //            if (thisRequestNumber === remoteCustomAjaxRequestNumber) {
    //                var valid = response === true || response === "true",
    //                    errors,
    //                    message,
    //                    submitted;
    //
    //                validator.settings.messages[element.name].remote = previous.originalMessage;
    //                if (valid) {
    //                    submitted = validator.formSubmitted;
    //                    validator.prepareElement(element);
    //                    validator.formSubmitted = submitted;
    //                    validator.successList.push(element);
    //                    delete validator.invalid[element.name];
    //                    validator.showErrors();
    //                } else {
    //                    errors = {};
    //                    message = response || validator.defaultMessage(element, "remote");
    //                    errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
    //                    validator.invalid[element.name] = true;
    //                    validator.showErrors(errors);
    //                }
    //                previous.valid = valid;
    //                validator.stopRequest(element, valid);
    //                remoteCustomAjaxRequest = null;
    //            }
    //        }
    //    }, param ) );
    //    return "pending";
    //}, "Zapytanie do Serwera zwróciło fałsz");

    // Panel Rejestracji

    function addValidationToRegisterPanel() {
        $("#frmRegisterPanel").validate({
            focusInvalid: false,
            onkeyup: false, // tylko false, true jest domyślnie, jeśli wpiszemy true, to wyrzuci błąd
            onfocusout: false, // wywoływane TYLKO ręcznie
            onsubmit: false,
            errorElement: "div",
            success: function (label, element) {
                var isPending = $(element).validate().pendingRequest !== 0;
                if (isPending)
                    return;
                toggleIndividualValidator({
                    inputElement: $(element),
                    option: "show",
                    containersName: "RegistrationValidation",
                    errorElement: label,
                    appendToElement: $("#divRegisterPanelContainer"),
                    inputBackgroundColor: "rgba(11, 115, 12, 0.5)", //#0b730c //#0b970d
                    inputBorderColor: "#0b970d",
                    validationMessageColor: "#0b970d",
                    validationImage: "url('" + siteroot + "Images/Correct.png')"
                });
            },
            errorPlacement: function (error, element) {
                var isPending = element.validate().pendingRequest !== 0;
                if (isPending)
                    return;
                toggleIndividualValidator({
                    inputElement: element,
                    option: "show",
                    containersName: "RegistrationValidation",
                    errorElement: error,
                    appendToElement: $("#divRegisterPanelContainer"),
                    inputBackgroundColor: "rgba(245, 27, 52, 0.5)", //#f51b34 //#FF5468
                    inputBorderColor: "#FF5468",
                    validationMessageColor: "#FF5468",
                    validationImage: "url('" + siteroot + "Images/Incorrect.png')"
                });
            },
            rules: {
                "UserName": {
                    required: true,
                    rangelength: [3, 25],
                    regex: /^[a-zA-Z]+$/,
                    remote: {
                        url: siteroot + "User/IsUserNameAvailable",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                },
                "Password": {
                    required: true,
                    regex: /(?=^.{6,25}$)(?=.*\d)(?=.*[A-Za-z])(?!.*\s).*$/
                },
                "ConfirmPassword": {
                    required: true,
                    equalTo: "#txtPassword"
                },
                "Email": {
                    required: true,
                    regex: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i, // /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i,
                    remote: {
                        url: siteroot + "User/IsEmailAvailable",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                }
            },
            messages: {
                "UserName": {
                    required: "Nazwa Użytkownika jest wymagana",
                    rangelength: "Nazwa Użytkownika musi mieć od 3 do 25 znaków",
                    regex: "Nazwa Użytkownika musi składać się wyłącznie z liter",
                    remote: "Nazwa Użytkownika jest już używana"
                },
                "Password": {
                    required: "Hasło jest wymagane",
                    regex: "Hasło musi zawierać 6-25 znaków, co najmniej jedną cyfrę i jedną literę"
                },
                "ConfirmPassword": {
                    required: "Powtórzenie Hasła jest wymagane",
                    equalTo: "Hasła muszą być takie same"
                },
                "Email": {
                    required: "Email jest wymagany",
                    regex: "To nie jest poprawny adres email",
                    remote: "Email jest już używany"
                }
            }
        });
    }

    function attachEventsToRegisterPanel() {
        $("#frmRegisterPanel input").not(":button").on("focusout", function (e) {
            var $this = $(e.target);
            if ($this.val()) {
                var loaderOptions = {
                    inputElement: $this,
                    containersName: "RegistrationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    appendToElement: $("#divRegisterPanelContainer")
                };

                var $txtConfirmPassword = $("#txtConfirmPassword");
                var confirmPasswordLoaderOptions = {
                    inputElement: $txtConfirmPassword,
                    containersName: "RegistrationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    appendToElement: $("#divRegisterPanelContainer")
                };

                var validator = $("#frmRegisterPanel").data("validator");

                $this.removeData("previousValue");
                toggleIndividualLoader(loaderOptions);
                validator.element($this);

                if ($this.attr("id") === "txtPassword" && $txtConfirmPassword.val()) {
                    $txtConfirmPassword.removeData("previousValue");
                    toggleIndividualLoader(confirmPasswordLoaderOptions);
                    validator.element($txtConfirmPassword);
                }

                $this.not(":button").off().on("keyup", function (evt) {
                    var excludedKeys = [ 16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225 ];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);

                    if ($this.attr("id") === "txtPassword" && $txtConfirmPassword.val()) {
                        $txtConfirmPassword.removeData("previousValue");
                        toggleIndividualLoader(confirmPasswordLoaderOptions);
                        validator.element($txtConfirmPassword);
                    }
                });
            }
        });

        var validRegisterPendingTimeout;
        function registerUserAsync() {
            var validator = $("#frmRegisterPanel").data("validator"); // .validate();
            var isPending = validator.pendingRequest !== 0;
            var isValid = validator.checkForm();
            validator.submitted = {};

            var inputNamesArr = [];
            $("#frmRegisterPanel input").each(function (i, el) {
                if (!validator.pending[$(el).attr("name")])
                    inputNamesArr.push($(el).attr("name"));
            });
            inputNamesArr = inputNamesArr.filter(function (n) { return n != undefined });

            $.each(inputNamesArr, function (i, val) {
                validator.element($("#frmRegisterPanel input[name=" + val + "]").first());
            });

            //var validatedElementsKeyValuePairs = $.Enumerable.From(validator.pending)
            //    .Where(function(x) {
            //        return $.inArray(x.Key, inputNamesArr) === -1; // && x.Value === true
            //    }).ToArray();

            if (isPending) {
                if (typeof validRegisterPendingTimeout !== "undefined") {
                    clearTimeout(validRegisterPendingTimeout);
                }
                validRegisterPendingTimeout = setTimeout(function () {
                    registerUserAsync();
                }, 200);
                return;
            } else if (!isValid) {
                $("#btnRegister").prop("disabled", false);
                toggleUniversalLoader({
                    id: "divRegisterPanelContainer",
                    option: "hide"
                });
                return;
            }

            var email = $("#txtEmail").val();

            $.ajax({
                async: true,
                url: siteroot + "User/RegisterUser",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    UserName: $("#txtUserName").val(),
                    Password: $("#txtPassword").val(),
                    ConfirmPassword: $("#txtConfirmPassword").val(),
                    Email: email
                }),
                dataType: "json",
                success: function (data) {
                    toggleUniversalLoader({
                        id: "divRegisterPanelContainer",
                        option: "hide"
                    });
                    var message = data.Message.toString();
                    if (message) {
                        var colonOccurance = message.lastIndexOf(":");
                        message = colonOccurance > -1 ? message.substring(0, colonOccurance + 2) + "<span class='linklike'>" + message.substring(colonOccurance + 2) + "</span>" : message;

                        toggleUniversalMessage({
                            id: "divRegisterPanelContainer",
                            option: "show",
                            fadeout: data.ResultString !== "Success",
                            fadetime: 1000,
                            length: 1000,
                            message: message,
                            messageColor: data.ResultString === "Success" ? "#0b970d" : "#FF5468",
                            appendToElement: $("#divRegisterPanelContainer")
                        });
                    }
                    if (data.ResultString === "Success") {
                        $("#frmRegisterPanel input").off();

                        displayActivateAccountPanel({
                            overrideSession: true,
                            fillEmailWith: email
                        });
                    } else {
                        $("#btnRegister").prop("disabled", false);
                    }
                },
                error: function (err) {
                    $("html").html(err.responseText);
                }
            });
        }

        $("#btnRegister").click(function (e) {
            $(e.target).prop("disabled", true);

            var $inputs = $("#frmRegisterPanel input").not(":button");
            var validator = $("#frmRegisterPanel").data("validator");

            $inputs.each(function (i, el) {
                var $this = $(el);

                $this.removeData("previousValue");

                var loaderOptions = {
                    inputElement: $this,
                    containersName: "RegistrationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    appendToElement: $("#divRegisterPanelContainer")
                };

                var $txtConfirmPassword = $("#txtConfirmPassword");
                var confirmPasswordLoaderOptions = {
                    inputElement: $txtConfirmPassword,
                    containersName: "RegistrationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    appendToElement: $("#divRegisterPanelContainer")
                };

                toggleIndividualLoader(loaderOptions);

                $this.off().on("keyup", function (evt) {
                    var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);

                    if ($this.attr("id") === "txtPassword" && $txtConfirmPassword.val()) {
                        $txtConfirmPassword.removeData("previousValue");
                        toggleIndividualLoader(confirmPasswordLoaderOptions);
                        validator.element($txtConfirmPassword);
                    }
                });
            });

            toggleUniversalLoader({
                id: "divRegisterPanelContainer",
                option: "show",
                loaderWidth: 64,
                loaderHeight: 64,
                appendToElement: $("#divRegisterPanelContainer")
            });

            validator.checkForm();
            
            registerUserAsync();
        });
    }

    function displayRegisterPanel(args) {
        args = args || {};
        var overrideSession = args.overrideSession || false;

        $("#divRegisterPanelContainer").css({
            "height": "100px"
        });

        toggleUniversalLoader({
            id: "divRegisterPanelContainer",
            option: "show",
            loaderWidth: 64,
            loaderHeight: 64,
            appendToElement: $("#divRegisterPanelContainer")
        });

        $.ajax({
            async: true,
            url: siteroot + "User/GetRegisterPanel",
            method: "post",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({ }),
            dataType: "json",
            success: function (data) {
                if (data.DisplayPanel === true || overrideSession === true) {
                    var sRegisterPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
                    var registerPanelView = $.parseHTML(sRegisterPanelView);
                    $("#divRegisterPanelContainer").empty();
                    $(registerPanelView).appendTo($("#divRegisterPanelContainer"));
                    addValidationToRegisterPanel();
                    attachEventsToRegisterPanel();
                }

                toggleUniversalLoader({
                    id: "divRegisterPanelContainer",
                    option: "hide"
                });

                $("#divRegisterPanelContainer").css({
                    "height": "auto"
                });

                positionBackground();
                resizeBackground();
            },
            error: function (err) {
                $("html").html(err.responseText);
            }
        });
    }

    displayRegisterPanel();

    $("#lnkbtnLoadRegisterPanel").one("click", function () {
        displayRegisterPanel({
            overrideSession: true
        });
    });

    // Panel Aktywacji

    function addValidationToActivateAccountPanel() {
        $("#frmActivateAccountPanel").validate({
            focusInvalid: false,
            onkeyup: false, // tylko false, true jest domyślnie, jeśli wpiszemy true, to wyrzuci błąd
            onfocusout: false, // wywoływane TYLKO ręcznie
            onsubmit: false,
            errorElement: "div",
            success: function (label, element) {
                var isElementPending = $(element).validate().pendingRequest !== 0; // walidator w zależności od aktuialnie walidowanego Panelui!
                //var validator = $("#frmActivateAccountPanel").data("validator");
                //var isAnyPending = validator.pendingRequest !== 0;
                //var isElementPending = !isAnyPending
                //    ? false
                //    : Enumerable.From(validator.pending)
                //        .Any(function(x) { return x.Key === $(element).attr("name") && x.Value === true; });

                if (isElementPending) {
                    return; 
                }

                toggleIndividualValidator({
                    inputElement: $(element),
                    option: "show",
                    containersName: "ActivationValidation",
                    errorElement: label,
                    appendToElement: $("#divActivateAccountPanelContainer"),
                    inputBackgroundColor: "rgba(11, 115, 12, 0.5)", //#0b730c //#0b970d
                    inputBorderColor: "#0b970d",
                    validationMessageColor: "#0b970d",
                    validationImage: "url('" + siteroot + "Images/Correct.png')"
                });
            },
            errorPlacement: function (error, element) {
                var isElementPending = element.validate().pendingRequest !== 0; // walidator w zależności od aktuialnie walidowanego Panelui!
                //var validator = $("#frmActivateAccountPanel").data("validator"); 
                //var isAnyPending = validator.pendingRequest !== 0;
                //var isElementPending = !isAnyPending
                //    ? false
                //    : Enumerable.From(validator.pending)
                //        .Any(function(x) { return x.Key === element.attr("name") && x.Value === true; });

                if (isElementPending) {
                    return;
                }

                toggleIndividualValidator({
                    inputElement: element,
                    option: "show",
                    containersName: "ActivationValidation",
                    errorElement: error,
                    appendToElement: $("#divActivateAccountPanelContainer"),
                    inputBackgroundColor: "rgba(245, 27, 52, 0.5)", //#f51b34 //#FF5468
                    inputBorderColor: "#FF5468",
                    validationMessageColor: "#FF5468",
                    validationImage: "url('" + siteroot + "Images/Incorrect.png')"
                });
            },
            rules: {
                "ActivationEmail": {
                    required: true,
                    regex: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i, // /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i,
                    remote: {
                        url: siteroot + "User/IsEmailInDatabaseAjax",
                        //method: "post",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                },
                "ActivationCode": {
                    required: true,
                    regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                    remote: {
                        data: {
                            "activationEmail": function() {
                                return $("#txtActivationEmail").val();
                            }
                        },
                        url: siteroot + "User/IsActivationCodeValid",
                        //method: "post",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                }
            },
            messages: {
                "ActivationEmail": {
                    required: "Email jest wymagany",
                    regex: "To nie jest poprawny adres Email",
                    remote: "Podany Email nie istnieje w Bazie Danych"
                },
                "ActivationCode": {
                    required: "Kod Aktywacyjny jest wymagany",
                    regex: "Kod Aktywacyjny ma niepoprawny Format",
                    remote: "Kod aktywacyjny dla podanego Emaila jest błędny"
                }
            }
        });
    }

    function attachEventsToActivateAccountPanel() {
        $("#frmActivateAccountPanel input").not(":button").on("focusout", function (e) {
            var $this = $(e.target);
            if ($this.val()) {
                var loaderOptions = {
                    inputElement: $(this),
                    containersName: "ActivationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    appendToElement: $("#divActivateAccountPanelContainer")
                };

                var validator =  $("#frmActivateAccountPanel").data("validator");

                $this.removeData("previousValue");
                toggleIndividualLoader(loaderOptions);
                validator.element($this);

                $this.not(":button").off().on("keyup", function (evt) {
                    var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);
                });
            }
        });

        var validActivatePendingTimeout;
        function activateUserAsync() {
            var validator = $("#frmActivateAccountPanel").validate(); // .data("validator")
            var isPending = validator.pendingRequest !== 0;
            var isValid = validator.checkForm();
            validator.submitted = {};

            var inputNamesArr = [];
            $("#frmActivateAccountPanel input").each(function (i, el) {
                if (!validator.pending[$(el).attr("name")])
                    inputNamesArr.push($(el).attr("name"));
            });
            inputNamesArr = inputNamesArr.filter(function (n) { return n != undefined });

            $.each(inputNamesArr, function (i, val) {
                validator.element($("#frmActivateAccountPanel input[name=" + val + "]").first());
            });

            if (isPending) {
                if (typeof validActivatePendingTimeout !== "undefined") {
                    clearTimeout(validActivatePendingTimeout);
                }
                validActivatePendingTimeout = setTimeout(function() {
                    activateUserAsync();
                }, 200);
                return;
            } else if (!isValid) {
                $("#btnActivateAccount").prop("disabled", false);
                toggleUniversalLoader({
                    id: "divActivateAccountPanelContainer",
                    option: "hide"
                });
                return;
            }

            $.ajax({
                async: true,
                url: siteroot + "User/ActivateUserAccount",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    ActivationEmail: $("#txtActivationEmail").val(),
                    ActivationCode: $("#txtActivationCode").val()
                }),
                dataType: "json",
                success: function (data) {
                    toggleUniversalLoader({
                        id: "divActivateAccountPanelContainer",
                        option: "hide"
                    });
                    var message = data.Message.toString();
                    if (message) {
                        toggleUniversalMessage({
                            id: "divActivateAccountPanelContainer",
                            option: "show",
                            fadeout: data.ResultString !== "Success",
                            fadetime: 1000,
                            length: 1000,
                            message: message,
                            messageColor: data.ResultString === "Success" ? "#0b970d" : "#FF5468",
                            appendToElement: $("#divActivateAccountPanelContainer")
                        });
                    }
                    if (data.ResultString === "Success") {
                        $("#frmActivateAccountPanel input").off();
                    } else {
                        $("#btnActivateAccount").prop("disabled", false);
                    }
                },
                error: function (err) {
                    $("html").html(err.responseText);
                }
            });
        }

        $("#btnActivateAccount").click(function (e) {
            $(e.target).prop("disabled", true);

            var $inputs = $("#frmActivateAccountPanel input").not(":button");
            var validator = $("#frmActivateAccountPanel").data("validator");

            $inputs.each(function (i, el) {
                var $this = $(el);

                $this.removeData("previousValue");

                var loaderOptions = {
                    inputElement: $this,
                    containersName: "ActivationValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    appendToElement: $("#divActivateAccountPanelContainer")
                };

                toggleIndividualLoader(loaderOptions);

                $this.off().on("keyup", function (evt) {
                    var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);
                });
                
            });

            toggleUniversalLoader({
                id: "divActivateAccountPanelContainer",
                option: "show",
                loaderWidth: 64,
                loaderHeight: 64,
                appendToElement: $("#divActivateAccountPanelContainer")
            });

            validator.checkForm();

            activateUserAsync();
        });

        var validSendActivationPendingTimeout;
        function sendActivationCodeAsync() {
            var validator = $("#frmActivateAccountPanel").data("validator");
            var isPending = validator.pendingRequest !== 0;
            var isValid = validator.check($("#txtActivationEmail"));
            validator.submitted = {};

            var inputNamesArr = [];
            $("#frmActivateAccountPanel").find("#txtActivationEmail").each(function (i, el) {
                if (!validator.pending[$(el).attr("name")])
                    inputNamesArr.push($(el).attr("name"));
            });
            inputNamesArr = inputNamesArr.filter(function (n) { return n != undefined });

            $.each(inputNamesArr, function (i, val) {
                validator.element($("#frmActivateAccountPanel input[name=" + val + "]").first());
            });

            if (isPending) {
                if (typeof validSendActivationPendingTimeout !== "undefined") {
                    clearTimeout(validSendActivationPendingTimeout);
                }
                validSendActivationPendingTimeout = setTimeout(function() {
                    sendActivationCodeAsync();
                }, 200);
                return;
            } else if (!isValid) {
                $("#lnkbtnSendActivationCodeAgain").removeClass("linklike_disabled").addClass("linklike");
                toggleUniversalLoader({
                    id: "divActivateAccountPanelContainer",
                    option: "hide"
                });
                return;
            }

            $.ajax({
                async: true,
                url: siteroot + "User/SendActivationEmailAgain",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    ActivationEmail: $("#txtActivationEmail").val()
                }),
                dataType: "json",
                success: function (data) {
                    toggleUniversalLoader({
                        id: "divActivateAccountPanelContainer",
                        option: "hide"
                    });
                    var message = data.Message.toString();
                    if (message) {
                        toggleUniversalMessage({
                            id: "divActivateAccountPanelContainer",
                            option: "show",
                            fadeout: true,
                            fadetime: 1000,
                            length: 1000,
                            message: message,
                            messageColor: data.ResultString === "Success" ? "#0b970d" : "#FF5468",
                            appendToElement: $("#divActivateAccountPanelContainer")
                        });
                    }

                    if (data.ResultString === "Success") {
                        var $txtActivationCode = $("#txtActivationCode");
                        //$txtActivationCode.removeAttr("value");
                        $txtActivationCode.val("");
                        emptyIndividualLoader({
                            inputElement: $txtActivationCode,
                            containersName: "ActivationValidation"
                        });
                    }

                    $("#lnkbtnSendActivationCodeAgain").removeClass("linklike_disabled").addClass("linklike");
                },
                error: function (err) {
                    $("html").html(err.responseText);
                }
            });
        };

        $("#lnkbtnSendActivationCodeAgain").click(function (e) {
            if (!$(e.target).hasClass("linklike"))
                return;

            $(e.target).removeClass("linklike").addClass("linklike_disabled");

            var validator = $("#frmActivateAccountPanel").data("validator");

            var $emailInput = $("#frmActivateAccountPanel").find("#txtActivationEmail").first();
            $emailInput.removeData("previousValue");

            var loaderOptions = {
                inputElement: $emailInput,
                containersName: "ActivationValidation",
                option: "show",
                loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                appendToElement: $("#divActivateAccountPanelContainer")
            };

            toggleIndividualLoader(loaderOptions);

            $emailInput.off().on("keyup", function (evt) {
                var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                if (evt.which === 9 && !$emailInput.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                    return;
                }

                $emailInput.removeData("previousValue");
                toggleIndividualLoader(loaderOptions);
                validator.element($emailInput);
            });

            toggleUniversalLoader({
                id: "divActivateAccountPanelContainer",
                option: "show",
                loaderWidth: 64,
                loaderHeight: 64,
                appendToElement: $("#divActivateAccountPanelContainer")
            });

            validator.check($emailInput);

            sendActivationCodeAsync();
        });
    }

    function displayActivateAccountPanel(args) {
        args = args || {};
        var overrideSession = args.overrideSession || false;
        var fillEmailWith = args.fillEmailWith || null;

        $("#divActivateAccountPanelContainer").css({
            "height": "100px"
        });

        toggleUniversalLoader({
            id: "divActivateAccountPanelContainer",
            option: "show",
            loaderWidth: 64,
            loaderHeight: 64,
            appendToElement: $("#divActivateAccountPanelContainer")
        });

        $.ajax({
            async: true,
            url: siteroot + "User/GetActivateAccountPanel",
            method: "post",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({ }),
            dataType: "json",
            success: function (data) {
                if (data.DisplayPanel === true || overrideSession === true) {
                    var sActivateAccountPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
                    var activateAccountPanelView = $.parseHTML(sActivateAccountPanelView);
                    $("#divActivateAccountPanelContainer").empty();
                    $(activateAccountPanelView).appendTo($("#divActivateAccountPanelContainer"));
                    addValidationToActivateAccountPanel();
                    attachEventsToActivateAccountPanel();
                }

                toggleUniversalLoader({
                    id: "divActivateAccountPanelContainer",
                    option: "hide"
                });

                $("#divActivateAccountPanelContainer").css({
                    "height": "auto"
                });

                if (fillEmailWith) {
                    $("#frmActivateAccountPanel").find("#txtActivationEmail").val(fillEmailWith);
                }

                positionBackground();
                resizeBackground();
            },
            error: function (err) {
                $("html").html(err.responseText);
            }
        });
    }

    displayActivateAccountPanel();

    $("#lnkbtnLoadActivateAccountPanel").one("click", function () {
        displayActivateAccountPanel({
            overrideSession: true
        });
    });

    // Panel Przypomnienia Hasła

    function addValidationToRemindPasswordPanel() {
        $("#frmRemindPasswordPanel").validate({
            focusInvalid: false,
            onkeyup: false, 
            onfocusout: false, 
            onsubmit: false,
            errorElement: "div",
            success: function (label, element) {
                var isElementPending = $(element).validate().pendingRequest !== 0;

                if (isElementPending) {
                    return;
                }

                toggleIndividualValidator({
                    inputElement: $(element),
                    option: "show",
                    containersName: "RemindPasswordValidation",
                    errorElement: label,
                    appendToElement: $("#divRemindPasswordPanelContainer"),
                    inputBackgroundColor: "rgba(11, 115, 12, 0.5)",
                    inputBorderColor: "#0b970d",
                    validationMessageColor: "#0b970d",
                    validationImage: "url('" + siteroot + "Images/Correct.png')"
                });
            },
            errorPlacement: function (error, element) {
                var isElementPending = element.validate().pendingRequest !== 0;

                if (isElementPending) {
                    return;
                }

                toggleIndividualValidator({
                    inputElement: element,
                    option: "show",
                    containersName: "RemindPasswordValidation",
                    errorElement: error,
                    appendToElement: $("#divRemindPasswordPanelContainer"),
                    inputBackgroundColor: "rgba(245, 27, 52, 0.5)",
                    inputBorderColor: "#FF5468",
                    validationMessageColor: "#FF5468",
                    validationImage: "url('" + siteroot + "Images/Incorrect.png')"
                });
            },
            rules: {
                "RemindPasswordEmail": {
                    required: true,
                    regex: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i, // /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i,
                    remote: {
                        url: siteroot + "User/IsEmailInDatabaseAjax",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                },
                "RemindPasswordCode": {
                    required: true,
                    regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                    remote: {
                        data: {
                            "remindPasswordEmail": function () {
                                return $("#txtRemindPasswordEmail").val();
                            }
                        },
                        url: siteroot + "User/IsRemindPasswordCodeValid",
                        dataFilter: function (data) {
                            var json = JSON.parse(data);
                            if (json.ResultString === "Success") {
                                return '"true"';
                            }
                            return "\"" + json.Message + "\"";
                        }
                    }
                },
                //"RemindPasswordOldPassword": {
                //    required: true,
                //    regex: /(?=^.{6,25}$)(?=.*\d)(?=.*[A-Za-z])(?!.*\s).*$/,
                //    notEqualTo: "#txtRemindPasswordNewPassword",
                //    remote: {
                //        data: {
                //            "remindPasswordEmail": function () {
                //                return $("#txtRemindPasswordEmail").val();
                //            }
                //        },
                //        url: siteroot + "User/IsRemindPasswordOldPasswordValid",
                //        dataFilter: function (data) {
                //            var json = JSON.parse(data);
                //            if (json.ResultString === "Success") {
                //                return '"true"';
                //            }
                //            return "\"" + json.Message + "\"";
                //        }
                //    }
                //},
                "RemindPasswordNewPassword": {
                    required: true,
                    regex: /(?=^.{6,25}$)(?=.*\d)(?=.*[A-Za-z])(?!.*\s).*$/,
                    equalTo: "#txtRemindPasswordConfirmPassword",
                    notEqualTo: "#txtRemindPasswordOldPassword"
                },
                "RemindPasswordConfirmPassword": {
                    required: true,
                    equalTo: "#txtRemindPasswordNewPassword"
                }
            },
            messages: {
                "RemindPasswordEmail": {
                    required: "Email jest wymagany",
                    regex: "To nie jest poprawny adres Email",
                    remote: "Podany Email nie istnieje w Bazie Danych"
                },
                "RemindPasswordCode": {
                    required: "Kod Weryfikacyjny jest wymagany",
                    regex: "Kod Weryfikacyjny ma niepoprawny Format",
                    remote: "Kod Weryfikacyjny dla podanego Emaila jest błędny"
                },
                //"RemindPasswordOldPassword": {
                //    required: "Stare Hasło jest wymagane",
                //    regex: "Stare Hasło musi zawierać 6-25 znaków, co najmniej jedną cyfrę i jedną literę",
                //    notEqualTo: "Stare i Nowe Hasło muszą się różnić",
                //    remote: "Stare Hasło dla Użytkownika o podanym Emailu jest błędne"
                //},
                "RemindPasswordNewPassword": {
                    required: "Nowe Hasło jest wymagane",
                    regex: "Nowe Hasło musi zawierać 6-25 znaków, co najmniej jedną cyfrę i jedną literę",
                    equalTo: "Hasła muszą być takie same",
                    notEqualTo: "Stare i Nowe Hasło muszą się różnić"
                },
                "RemindPasswordConfirmPassword": {
                    required: "Powtórzenie Hasła jest wymagane",
                    equalTo: "Hasła muszą być takie same"
                }
            }
        });
    }

    function attachEventsToRemindPasswordPanel() {
        $("#frmRemindPasswordPanel input").not(":button").on("focusout", function (e) {
            var $this = $(e.target);
            if ($this.val()) {
                var loaderOptions = {
                    inputElement: $(this),
                    containersName: "RemindPasswordValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    appendToElement: $("#divRemindPasswordPanelContainer")
                };

                var validator = $("#frmRemindPasswordPanel").data("validator");

                $this.removeData("previousValue");
                toggleIndividualLoader(loaderOptions);
                validator.element($this);

                var pwdsArray = [/*"RemindPasswordOldPassword", */"RemindPasswordNewPassword", "RemindPasswordConfirmPassword"];
                if ($.inArray($this.attr("name"), pwdsArray) !== -1) {
                    pwdsArray = $.grep(pwdsArray, function (value) {
                        return value !== $this.attr("name");
                    });
                    $.each(pwdsArray, function(i, v) {
                        var $v = $("#txt" + v);
                        $v.removeData("previousValue");
                        toggleIndividualLoader({
                            inputElement: $v,
                            containersName: "RemindPasswordValidation",
                            option: "show",
                            loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                            appendToElement: $("#divRemindPasswordPanelContainer")
                        });
                        validator.element($v);
                    });
                }

                $this.not(":button").off().on("keyup", function (evt) {
                    var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);

                    if ($.inArray($this.attr("name"), pwdsArray) !== -1) {
                        pwdsArray = $.grep(pwdsArray, function (value) {
                            return value !== $this.attr("name");
                        });
                        $.each(pwdsArray, function(i, v) {
                            var $v = $("#txt" + v);
                            $v.removeData("previousValue");
                            toggleIndividualLoader({
                                inputElement: $v,
                                containersName: "RemindPasswordValidation",
                                option: "show",
                                loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                                appendToElement: $("#divRemindPasswordPanelContainer")
                            });
                            validator.element($v);
                        });
                    }
                });
            }
        });

        var validRemindPasswordPendingTimeout;
        function remindUserPasswordAsync() {
            var validator = $("#frmRemindPasswordPanel").validate(); // .data("validator")
            var isPending = validator.pendingRequest !== 0;
            var isValid = validator.checkForm();
            validator.submitted = {};

            var inputNamesArr = [];
            $("#frmRemindPasswordPanel input").each(function (i, el) {
                if (!validator.pending[$(el).attr("name")])
                    inputNamesArr.push($(el).attr("name"));
            });
            inputNamesArr = inputNamesArr.filter(function (n) { return n != undefined });

            $.each(inputNamesArr, function (i, val) {
                validator.element($("#frmRemindPasswordPanel input[name=" + val + "]").first());
            });

            if (isPending) {
                if (typeof validRemindPasswordPendingTimeout !== "undefined") {
                    clearTimeout(validRemindPasswordPendingTimeout);
                }
                validRemindPasswordPendingTimeout = setTimeout(function () {
                    remindUserPasswordAsync();
                }, 200);
                return;
            } else if (!isValid) {
                $("#btnRemindPassword").prop("disabled", false);
                toggleUniversalLoader({
                    id: "divRemindPasswordPanelContainer",
                    option: "hide"
                });
                return;
            }

            $.ajax({
                async: true,
                url: siteroot + "User/RemindUserPassword",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    RemindPasswordEmail: $("#txtRemindPasswordEmail").val(),
                    RemindPasswordCode: $("#txtRemindPasswordCode").val(),
                    RemindPasswordOldPassword: $("#txtRemindPasswordOldPassword").val(),
                    RemindPasswordNewPassword: $("#txtRemindPasswordNewPassword").val(),
                    RemindPasswordConfirmPassword: $("#txtRemindPasswordConfirmPassword").val()
                }),
                dataType: "json",
                success: function (data) {
                    toggleUniversalLoader({
                        id: "divRemindPasswordPanelContainer",
                        option: "hide"
                    });
                    var message = data.Message.toString();
                    if (message) {
                        toggleUniversalMessage({
                            id: "divRemindPasswordPanelContainer",
                            option: "show",
                            fadeout: data.ResultString !== "Success",
                            fadetime: 1000,
                            length: 1000,
                            message: message,
                            messageColor: data.ResultString === "Success" ? "#0b970d" : "#FF5468",
                            appendToElement: $("#divRemindPasswordPanelContainer")
                        });
                    }
                    if (data.ResultString === "Success") {
                        $("#frmRemindPasswordPanel input").off();
                    } else {
                        $("#btnRemindPassword").prop("disabled", false);
                    }
                },
                error: function (err) {
                    $("html").html(err.responseText);
                }
            });
        }

        $("#btnRemindPassword").click(function (e) {
            $(e.target).prop("disabled", true);

            var $inputs = $("#frmRemindPasswordPanel input").not(":button");
            var validator = $("#frmRemindPasswordPanel").data("validator");

            $inputs.each(function (i, el) {
                var $this = $(el);

                $this.removeData("previousValue");

                var loaderOptions = {
                    inputElement: $this,
                    containersName: "RemindPasswordValidation",
                    option: "show",
                    loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                    appendToElement: $("#divRemindPasswordPanelContainer")
                };

                toggleIndividualLoader(loaderOptions);

                $this.off().on("keyup", function (evt) {
                    var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                    if (evt.which === 9 && !$this.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                        return;
                    }

                    $this.removeData("previousValue");
                    toggleIndividualLoader(loaderOptions);
                    validator.element($this);

                    var pwdsArray = [/*"RemindPasswordOldPassword", */"RemindPasswordNewPassword", "RemindPasswordConfirmPassword"];
                    if ($.inArray($this.attr("name"), pwdsArray) !== -1) {
                        pwdsArray = $.grep(pwdsArray, function (value) {
                            return value !== $this.attr("name");
                        });
                        $.each(pwdsArray, function(i, v) {
                            var $v = $("#txt" + v);
                            $v.removeData("previousValue");
                            toggleIndividualLoader({
                                inputElement: $v,
                                containersName: "RemindPasswordValidation",
                                option: "show",
                                loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                                appendToElement: $("#divRemindPasswordPanelContainer")
                            });
                            validator.element($v);
                        });
                    }
                });

            });

            toggleUniversalLoader({
                id: "divRemindPasswordPanelContainer",
                option: "show",
                loaderWidth: 64,
                loaderHeight: 64,
                appendToElement: $("#divRemindPasswordPanelContainer")
            });

            validator.checkForm();

            remindUserPasswordAsync();
        });

        var validSendRemindPasswordRequestPendingTimeout;
        function sendRemindPasswordRequestAsync() {
            var validator = $("#frmRemindPasswordPanel").data("validator");
            var isPending = validator.pendingRequest !== 0;
            var isValid = validator.check($("#txtRemindPasswordEmail"));
            validator.submitted = {};

            var inputNamesArr = [];
            $("#frmRemindPasswordPanel").find("#txtRemindPasswordEmail").each(function (i, el) {
                if (!validator.pending[$(el).attr("name")])
                    inputNamesArr.push($(el).attr("name"));
            });
            inputNamesArr = inputNamesArr.filter(function (n) { return n != undefined });

            $.each(inputNamesArr, function (i, val) {
                validator.element($("#frmRemindPasswordPanel input[name=" + val + "]").first());
            });

            if (isPending) {
                if (typeof validSendRemindPasswordRequestPendingTimeout !== "undefined") {
                    clearTimeout(validSendRemindPasswordRequestPendingTimeout);
                }
                validSendRemindPasswordRequestPendingTimeout = setTimeout(function () {
                    sendRemindPasswordRequestAsync();
                }, 200);
                return;
            } else if (!isValid) {
                $("#lnkbtnSendRemindPasswordRequest").removeClass("linklike_disabled").addClass("linklike");
                toggleUniversalLoader({
                    id: "divRemindPasswordPanelContainer",
                    option: "hide"
                });
                return;
            }

            $.ajax({
                async: true,
                url: siteroot + "User/SendRemindPasswordRequest",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    RemindPasswordEmail: $("#txtRemindPasswordEmail").val()
                }),
                dataType: "json",
                success: function (data) {
                    toggleUniversalLoader({
                        id: "divRemindPasswordPanelContainer",
                        option: "hide"
                    });
                    var message = data.Message.toString();
                    if (message) {
                        toggleUniversalMessage({
                            id: "divRemindPasswordPanelContainer",
                            option: "show",
                            fadeout: true,
                            fadetime: 1000,
                            length: 1000,
                            message: message,
                            messageColor: data.ResultString === "Success" ? "#0b970d" : "#FF5468",
                            appendToElement: $("#divRemindPasswordPanelContainer")
                        });
                    }

                    if (data.ResultString === "Success") {
                        var $txtRemindPasswordCode = $("#txtRemindPasswordCode");
                        $txtRemindPasswordCode.val("");
                        emptyIndividualLoader({
                            inputElement: $txtRemindPasswordCode,
                            containersName: "RemindPasswordValidation"
                        });
                    }

                    $("#lnkbtnSendRemindPasswordRequest").removeClass("linklike_disabled").addClass("linklike");
                },
                error: function (err) {
                    $("html").html(err.responseText);
                }
            });
        };

        $("#lnkbtnSendRemindPasswordRequest").click(function (e) {
            if (!$(e.target).hasClass("linklike"))
                return;

            $(e.target).removeClass("linklike").addClass("linklike_disabled");

            var validator = $("#frmRemindPasswordPanel").data("validator");

            var $emailInput = $("#frmRemindPasswordPanel").find("#txtRemindPasswordEmail").first();
            $emailInput.removeData("previousValue");

            var loaderOptions = {
                inputElement: $emailInput,
                containersName: "RemindPasswordValidation",
                option: "show",
                loaderImage: "url('" + siteroot + "Images/Loading/loading4.gif')",
                appendToElement: $("#divRemindPasswordPanelContainer")
            };

            toggleIndividualLoader(loaderOptions);

            $emailInput.off().on("keyup", function (evt) {
                var excludedKeys = [16, 17, 18, 20, 35, 36, 37, 38, 39, 40, 45, 144, 225];

                if (evt.which === 9 && !$emailInput.val() || $.inArray(evt.keyCode, excludedKeys) !== -1) {
                    return;
                }

                $emailInput.removeData("previousValue");
                toggleIndividualLoader(loaderOptions);
                validator.element($emailInput);
            });

            toggleUniversalLoader({
                id: "divRemindPasswordPanelContainer",
                option: "show",
                loaderWidth: 64,
                loaderHeight: 64,
                appendToElement: $("#divRemindPasswordPanelContainer")
            });

            validator.check($emailInput);

            sendRemindPasswordRequestAsync();
        });
    }

    function displayRemindPasswordPanel(args) {
        args = args || {};
        var overrideSession = args.overrideSession || false;

        $("#divRemindPasswordPanelContainer").css({
            "height": "100px"
        });

        toggleUniversalLoader({
            id: "divRemindPasswordPanelContainer",
            option: "show",
            loaderWidth: 64,
            loaderHeight: 64,
            appendToElement: $("#divRemindPasswordPanelContainer")
        });

        $.ajax({
            async: true,
            url: siteroot + "User/GetRemindPasswordPanel",
            method: "post",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({}),
            dataType: "json",
            success: function (data) {
                if (data.DisplayPanel === true || overrideSession === true) {
                    var sRemindPasswordPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, "");
                    var remindPasswordPanelView = $.parseHTML(sRemindPasswordPanelView);
                    $("#divRemindPasswordPanelContainer").empty();
                    $(remindPasswordPanelView).appendTo($("#divRemindPasswordPanelContainer"));
                    addValidationToRemindPasswordPanel();
                    attachEventsToRemindPasswordPanel();
                }

                toggleUniversalLoader({
                    id: "divRemindPasswordPanelContainer",
                    option: "hide"
                });

                $("#divRemindPasswordPanelContainer").css({
                    "height": "auto"
                });

                positionBackground();
                resizeBackground();
            },
            error: function (err) {
                $("html").html(err.responseText);
            }
        });
    }

    displayRemindPasswordPanel();

    $("#lnkbtnLoadRemindPasswordPanel").one("click", function () {
        displayRemindPasswordPanel({
            overrideSession: true
        });
    });

});