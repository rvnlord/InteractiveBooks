// DEBUGOWANIE

var debugMode = false;

// Zmienne

var $divMain = $("#Main");
// localhost
//var siteroot = "/MVCDemo";
// interaktywneksiazki.azurewebsites.net
//var siteroot = "";
var siteroot = $.url("");

// Walidacja wyszukiwania - Wiadomości

var msgSearchTermInitial = "Przeszukaj menu, słowa muszą zawierać co najmniej 3 znaki, aby były uwzględnione w wyszukiwaniu. ";
var msgSearchTermValid = "Wyszukiwana fraza jest poprawna. ";
var msgSearchTermInvalidCharacters = "Szukana fraza zawiera niepoprawne znaki. ";
var msgSearchTermFirstStringNotLongEnough = "Wyszukiwane frazy muszą mieć co najmniej 3 znaki. ";

var msgIncludeTitleValid = "Wartość dla pola wyboru \"Uwzględnij Tytuł\" jest poprawna. ";
var msgIncludeTitleInvalid = "Wartość dla pola wyboru \"Uwzględnij Tytuł\" jest nieprawidłowa. ";

var msgIncludeAuthorValid = "Wartość dla pola wyboru \"Uwzględnij Autora\" jest poprawna. ";
var msgIncludeAuthorInvalid = "Wartość dla pola wyboru \"Uwzględnij Autora\" jest nieprawidłowa. ";

var msgIncludeCategoryValid = "Wartość dla pola wyboru \"Uwzględnij Kategorię\" jest poprawna. ";
var msgIncludeCategoryInvalid = "Wartość dla pola wyboru \"Uwzględnij Kategorię\" jest nieprawidłowa. ";

var msgIncludeDescriptionValid = "Wartość dla pola wyboru \"Uwzględnij Opis\" jest poprawna. ";
var msgIncludeDescriptionInvalid = "Wartość dla pola wyboru \"Uwzględnij Opis\" jest nieprawidłowa. ";

var msgIncludesValid = "Zaznaczono przynajmniej jedną kategorię wyszukiwania. ";
var msgIncludesInvalid = "Należy zaznaczyć przynajmniej jedną kategorię wyszukiwania. ";

var msgSortByValid = "Wartość dla listy rozwijanej \"Kategoria Sortowania\" jest poprawna. ";
var msgSortByInvalid = "Wartość dla listy rozwijanej \"Kategoria Sortowania\" jest nieprawidłowa. ";

var msgSortOrderValid = "Wartość dla listy rozwijanej \"Kierunek Sortowania\" jest poprawna. ";
var msgSortOrderInvalid = "Wartość dla listy rozwijanej \"Kierunek Sortowania\" jest nieprawidłowa. ";

var msgHowMuchSkipValid = "Wartość dla wartości \"Ile Wyników Pominąć\" jest poprawna. ";
var msgHowMuchSkipInvalid = "Wartość dla wartości \"Ile Wyników Pominąć\" jest nieprawidłowa. ";

var msgHowMuchTakeValid = "Wartość dla wartości \"Ile Wyników Wyświetlić\" jest poprawna. ";
var msgHowMuchTakeInvalid = "Wartość dla wartości \"Ile Wyników Wyświetlić\" jest nieprawidłowa. ";

var msgAllValid = "Wyszukiwana fraza i pola wyszukiwania są poprawne. ";
var msgAllInvalid = "Nie wszystkie pola wyszukiwania są poprawne. ";

// - walidacja wyszukiwania - kolory

var colorInformation = "white";
var colorValid = "#04B512";
var colorInvalid = "#FF5468";

// Wyszukiwanie - inicjalizuj możliwe właściwości i ich domyślne wartości

function getDefaultSearchProperties() {
    var defProps = null;

    $.ajax({
        async: false,
        url: siteroot + "Base/GetDefaultSearchProperties",
        method: "post",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (defaultSearchProperties) {
            defProps =  defaultSearchProperties;
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });

    return defProps;
}

var searchAvalProperties = keysToLowerCase(getDefaultSearchProperties());

// Klasy

function ValidationResult(output, code, message, color, ischanged, isdefaulted) {
    this.output = output;
    this.code = code;
    this.message = message;
    this.color = color;
    this.ischanged = ischanged;
    this.isdefaulted = isdefaulted;
}

// Walidacja - Funkcje

function setDefaultAndIsChangedProperties(currProp, currValues, oldValues, vResults) {

    // set default - jeśli walidacja zwróci false

    if (searchAvalProperties != null && !vResults[currProp].output) {
        currValues[currProp] = searchAvalProperties[currProp];
        vResults[currProp].isdefaulted = true;
    }
    else {
        vResults[currProp].isdefaulted = false;
    }

    // set ischanged - jeśli wartość jest inna niż poprzednia

    if (oldValues != null) {
        vResults[currProp].ischanged = oldValues[currProp] !== currValues[currProp];
    }

    return { currValues: currValues, vResults: vResults }
}

function removeJsonNulls(jsonObj) {
    $.each(jsonObj, function (key, val) {
        if (typeof (val) != "function" && isNullOrEmpty(val)) {
            jsonObj[key] = "";
        }
    });

    return jsonObj;
}

function getOldValues(searchAvalProperties) {
    var jsonValues = null;

    $.ajax({
        async: false,
        url: siteroot + "Base/GetJsonSearchParamsSession",
        method: "post",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (oldValues) {
            jsonValues = removeJsonNulls($.extend({}, searchAvalProperties, keysToLowerCase(oldValues)));
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });

    return jsonValues;
}

function getAvalPropertyNames(avalProps) {
    var names = [];

    for (var o in avalProps) {
        if (avalProps.hasOwnProperty(o)) {
            names.push(o); // the property name
        }
    }

    return names;
}

function validateSearchProperties(args) {
    args = args || {};
    var currValues = args.currvalues || null;
    var props = args.props || ["all"];
    var oldValues = args.getchangedagainst || null;
    //var avalProps = args.setdefaultsagainst || null; // teraz jako zmienna globalna

    var vResults = {};
    var currProp = null;
    var includeProps = [];

    if (props.length > 0) {
        args = $.map(props, function (n) { // , i
            n.toLowerCase();
        });
    }

    // searchTerm
    currProp = "searchTerm".toLowerCase();
    var changedProps;
    if (props.indexOf(currProp) > -1 || props.indexOf("all") > -1) {
        if (isNullOrEmpty(currValues[currProp])) {
            vResults[currProp] = new ValidationResult(true, "null_or_empty", msgSearchTermInitial, colorInformation);
        }
        else if (!currValues.searchterm.match(/^[a-zA-Z ĄąĆćĘęŁłŃńÓóŚśŹźŻż:]*$/)) {
            vResults[currProp] = new ValidationResult(false, "invalid_chars", msgSearchTermInvalidCharacters, colorInvalid);
        }
        else {
            var arrCurrTerm = currValues.searchterm.split(" ");

            if (arrCurrTerm[0].length < 3) {
                vResults[currProp] = new ValidationResult(false, "too_short_words", msgSearchTermFirstStringNotLongEnough, colorInvalid);
            }
            else {
                vResults[currProp] = new ValidationResult(true, "ok", msgSearchTermValid, colorValid);
            }
        }

        // set default & ischanged
        changedProps = setDefaultAndIsChangedProperties(currProp, currValues, oldValues, vResults);
        currValues = changedProps.currValues;
        vResults = changedProps.vResults;
    }

    // includeTitle
    currProp = "includeTitle".toLowerCase();

    if (props.indexOf(currProp) > -1 || props.indexOf("all") > -1) {
        includeProps.push(currProp);
        if (isNullOrEmpty(currValues[currProp])) {
            vResults[currProp] = new ValidationResult(false, "null_or_empty", msgIncludeTitleInvalid, colorInvalid);
        }
        else {
            vResults[currProp] = new ValidationResult(true, "ok", msgIncludeTitleInvalid, colorValid);
        }

        // set default & ischanged
        changedProps = setDefaultAndIsChangedProperties(currProp, currValues, oldValues, vResults);
        currValues = changedProps.currValues;
        vResults = changedProps.vResults;
    }

    // includeAuthor
    currProp = "includeAuthor".toLowerCase();

    if (props.indexOf(currProp) > -1 || props.indexOf("all") > -1) {
        includeProps.push(currProp);
        if (isNullOrEmpty(currValues[currProp])) {
            vResults[currProp] = new ValidationResult(false, "null_or_empty", msgIncludeAuthorInvalid, colorInvalid);
        }
        else {
            vResults[currProp] = new ValidationResult(true, "ok", msgIncludeAuthorValid, colorValid);
        }

        // set default & ischanged
        changedProps = setDefaultAndIsChangedProperties(currProp, currValues, oldValues, vResults);
        currValues = changedProps.currValues;
        vResults = changedProps.vResults;
    }

    // includeCategory
    currProp = "includeCategory".toLowerCase();

    if (props.indexOf(currProp) > -1 || props.indexOf("all") > -1) {
        includeProps.push(currProp);
        if (isNullOrEmpty(currValues[currProp])) {
            vResults[currProp] = new ValidationResult(false, "null_or_empty", msgIncludeCategoryInvalid, colorInvalid);
        }
        else {
            vResults[currProp] = new ValidationResult(true, "ok", msgIncludeCategoryValid, colorValid);
        }

        // set default & ischanged
        changedProps = setDefaultAndIsChangedProperties(currProp, currValues, oldValues, vResults);
        currValues = changedProps.currValues;
        vResults = changedProps.vResults;
    }

    // includeDescription
    currProp = "includeDescription".toLowerCase();

    if (props.indexOf(currProp) > -1 || props.indexOf("all") > -1) {
        includeProps.push(currProp);
        if (isNullOrEmpty(currValues[currProp])) {
            vResults[currProp] = new ValidationResult(false, "null_or_empty", msgIncludeDescriptionInvalid, colorInvalid);
        }
        else {
            vResults[currProp] = new ValidationResult(true, "ok", msgIncludeDescriptionValid, colorValid);
        }

        // set default & ischanged
        changedProps = setDefaultAndIsChangedProperties(currProp, currValues, oldValues, vResults);
        currValues = changedProps.currValues;
        vResults = changedProps.vResults;
    }

    // All includes must be true

    if (includeProps && includeProps.length > 0 && currValues["includeTitle".toLowerCase()] === false && currValues["includeAuthor".toLowerCase()] === false && currValues["includeCategory".toLowerCase()] === false && currValues["includeDescription".toLowerCase()] === false) {
        vResults["allincludes"] = new ValidationResult(false, "all_includes_false", msgIncludesInvalid, colorInvalid);
    }
    else {
        vResults["allincludes"] = new ValidationResult(true, "ok", msgIncludesValid, colorValid);
    }

    // sortBy
    currProp = "sortBy".toLowerCase();

    if (props.indexOf(currProp) > -1 || props.indexOf("all") > -1) {
        var sortByOptions = $("#ddlSortBy").children("option");
        var sortByValues = $.map(sortByOptions, function (option) {
            if (option.value.toLowerCase() !== "default") {
                return option.value.toLowerCase();
            } // ReSharper disable once NotAllPathsReturnValue
        });

        if (isNullOrEmpty(currValues[currProp])) {
            vResults[currProp] = new ValidationResult(false, "null_or_empty", msgSortByInvalid, colorInvalid);
        }
        else if (sortByValues.indexOf(currValues[currProp]) === -1) {
            vResults[currProp] = new ValidationResult(false, "not_valid_sortby", msgSortByInvalid, colorInvalid);
        }
        else {
            vResults[currProp] = new ValidationResult(true, "ok", msgSortByValid, colorValid);
        }

        // set default & ischanged
        changedProps = setDefaultAndIsChangedProperties(currProp, currValues, oldValues, vResults);
        currValues = changedProps.currValues;
        vResults = changedProps.vResults;
    }

    // sortOrder
    currProp = "sortOrder".toLowerCase();

    if (props.indexOf(currProp) > -1 || props.indexOf("all") > -1) {
        if (isNullOrEmpty(currValues[currProp])) {
            vResults[currProp] = new ValidationResult(false, "null_or_empty", msgSortOrderInvalid, colorInvalid);
        }
        else if (["asc", "desc"].indexOf(currValues[currProp]) === -1) {
            vResults[currProp] = new ValidationResult(false, "not_valid_sortorder", msgSortOrderInvalid, colorInvalid);
        }
        else {
            vResults[currProp] = new ValidationResult(true, "ok", msgSortOrderValid, colorValid);
        }

        // set default & ischanged
        changedProps = setDefaultAndIsChangedProperties(currProp, currValues, oldValues, vResults);
        currValues = changedProps.currValues;
        vResults = changedProps.vResults;
    }

    // howMuchSkip
    currProp = "howMuchSkip".toLowerCase();

    if (props.indexOf(currProp) > -1 || props.indexOf("all") > -1) {
        if (isNullOrEmpty(currValues[currProp])) {
            vResults[currProp] = new ValidationResult(false, "null_or_empty", msgHowMuchSkipInvalid, colorInvalid);
        }
        else if (isNaN(currValues[currProp])) {
            vResults[currProp] = new ValidationResult(false, "not_valid_sikp", msgHowMuchSkipInvalid, colorInvalid);
        }
        else {
            vResults[currProp] = new ValidationResult(true, "ok", msgHowMuchSkipValid, colorValid);
        }

        // set default & ischanged
        changedProps = setDefaultAndIsChangedProperties(currProp, currValues, oldValues, vResults);
        currValues = changedProps.currValues;
        vResults = changedProps.vResults;
    }

    // howMuchTake
    currProp = "howMuchTake".toLowerCase();

    if (props.indexOf(currProp) > -1 || props.indexOf("all") > -1) {
        if (isNullOrEmpty(currValues[currProp])) {
            vResults[currProp] = new ValidationResult(false, "null_or_empty", msgHowMuchTakeInvalid, colorInvalid);
        }
        else if (isNaN(currValues[currProp])) {
            vResults[currProp] = new ValidationResult(false, "not_valid_take", msgHowMuchTakeInvalid, colorInvalid);
        }
        else {
            vResults[currProp] = new ValidationResult(true, "ok", msgHowMuchTakeValid, colorValid);
        }

        // set default & ischanged
        changedProps = setDefaultAndIsChangedProperties(currProp, currValues, oldValues, vResults);
        currValues = changedProps.currValues;
        vResults = changedProps.vResults;
    }

    // Wszystkie Właściwości

    vResults["all"] = new ValidationResult(true, "ok", msgAllValid, colorValid);
    $.each(vResults, function (key, val) {
        if (!val.output) {
            vResults["all"] = new ValidationResult(false, "not_all_correct", msgAllInvalid, colorInvalid);
            return false;
        } // ReSharper disable once NotAllPathsReturnValue      
    });

    return {
        validationresults: vResults,
        validatedvalues: currValues
    };
};

// Tooltip - Funkcje

function refreshTooltip(args) {
    args = args || {};
    var areAnyResults = args.areAnyResults || false;
    var validation = args.isValidatedBy || null;

    var isTooltipDisabled = $("#txtSearch").tooltip("option", "disabled");
    if (isTooltipDisabled) {
        $("#txtSearch").tooltip("enable");
    }

    var sTooltipContent = "<ul class='custom_validation_summary'>";

    if (!validation) {
        var address = window.location.href;
        var controller = "Book";
        var action = "Index";

        var endsWithAction = address.endsWith("/" + controller + "/" + action) || address.indexOf("/" + controller + "/" + action + "?") > -1 || address.indexOf("/" + controller + "/" + action + "#") > -1;
        var endsWithController = address.endsWith("/" + controller) || address.indexOf("/" + controller + "?") > -1 || address.indexOf("/" + controller + "#") > -1;

        if (endsWithAction || endsWithController) {
            validation = validateSearchProperties({
                props: getAvalPropertyNames(keysToLowerCase(searchAvalProperties)),
                currvalues: {
                    searchterm: $("#txtSearch").val(),
                    includetitle: $("#cbIncludeTitle").prop("checked"),
                    includeauthor: $("#cbIncludeAuthor").prop("checked"),
                    includecategory: $("#cbIncludeCategory").prop("checked"),
                    includedescription: $("#cbIncludeDescription").prop("checked"),
                    sortby: $("#ddlSortBy").first("option:selected").val(),
                    sortorder: $("#ddlSortOrder").first("option:selected").val(),
                    howmuchtake: 12,
                    howmuchskip: 0
                }
            });
        }
        else {
            validation = validateSearchProperties({
                props: ["searchterm", "includeauthor"],
                currvalues: {
                    searchterm: $("#txtSearch").val(),
                    includeauthor: $("#cbIncludeAuthor").prop("checked")
                },
                setdefaultsagainst: searchAvalProperties
            });
        }
    }

    if (areAnyResults) {
        if (validation.validationresults.all.output) { // WYNIKI = true, WALIDACJA POPRAWNA = true
            if ($("#txtSearch").val().length === 0) {
                sTooltipContent += "<li style='color: " + validation.validationresults.searchterm.color + "'>" + validation.validationresults.searchterm.message + "</li>";
            }
            else {
                sTooltipContent += "<li style='color: " + validation.validationresults.all.color + "'>" + validation.validationresults.all.message + "</li>";
            }
        } else { // ReSharper disable once UnusedParameter // WYNIKI = true, WALIDACJA POPRAWNA = false 
            $.each(validation.validationresults, function (key, value) {
                if (validation.validationresults[key].output === false && key !== "all") {
                    sTooltipContent += "<li style='color: " + validation.validationresults[key].color + "'>" + validation.validationresults[key].message + "</li>";
                }
            });
        } 
    }
    else {
        if (validation.validationresults.all.output) { // WYNIKI = false, WALIDACJA POPRAWNA = true
            if (args.isValidatedBy) { // WYNIKI = false, WALIDACJA POPRAWNA = true, WALIDACJA PRZEKAZANA = true
                sTooltipContent += "<li style='color: " + colorInformation + "'>" + "Brak Rezultatów" + "</li>";
            }
            else { // WYNIKI = false, WALIDACJA POPRAWNA = true, WALIDACJA PRZEKAZANA = false
                if ($("#txtSearch").val().length === 0) {
                    sTooltipContent += "<li style='color: " + validation.validationresults.searchterm.color + "'>" + validation.validationresults.searchterm.message + "</li>";
                }
                else {
                    sTooltipContent += "<li style='color: " + validation.validationresults.all.color + "'>" + validation.validationresults.all.message + "</li>";
                }
            }
        }
        else { // ReSharper disable once UnusedParameter // WYNIKI = false, WALIDACJA POPRAWNA = false
            $.each(validation.validationresults, function (key, value) {
                if (validation.validationresults[key].output === false && key !== "all") {
                    sTooltipContent += "<li style='color: " + validation.validationresults[key].color + "'>" + validation.validationresults[key].message + "</li>";
                }
            });
        }         
    }
    sTooltipContent += "</ul>";
    $("#txtSearch").tooltip("option", "content", sTooltipContent);
}

function fixTooltipPosition() {
    $(".txtSearch_tooltip").css({
        "left": $("#txtSearch").offset().left
    });
}

// Search i Autocomplete - Funkcje

function toggleSearchFieldSpinner(option) {
    var bgImage = "url('" + siteroot + "Images/Loading/loading1.gif')";
    var bgNone = "none";

    $(".autocomplete_loading_container").css({
        "background-image": function (/*i, val*/) {
            if (option === "show") {
                return bgImage;
            }
            else if (option === "hide") {
                return bgNone;
            }
            else {
                alert("toggleSearchFieldSpinner - podana opcja jest nieprawidłowa. ");
                return bgNone;
            }
        }
    });
}

// Formatowanie Tła - Funkcje

function resizeBackground() {
    $("#Background").height($("#Main").outerHeight(true));
}

function positionBackground() {
    $("#Background").offset({ top: 0, left: $(document.body).offset().left + ($(document.body).width() - $("#Background").width()) / 2 });
}

// Wszystkie Panele - Funkcje

$.validator.addMethod("regex", function (value, element, regexp) {
    var re = new RegExp(regexp);
    return this.optional(element) || re.test(value);
}, "To nie jest poprawne Wyrażenie Regularne.");

function toggleIndividualLoader(args) {
    args = args || {};
    var inputElement = args.inputElement || null;
    var containersName = args.containersName || null;
    var option = args.option || null;
    var loaderImage = args.loaderImage || null;
    var appendToElement = args.appendToElement || null;

    if (option === "show" || option === "hide") {
        $("#div" + containersName + inputElement.attr("id")).remove();
        $("#img" + containersName + inputElement.attr("id")).remove();
    };

    if (option === "show") {
        var $divValidationImage = $("<div></div>");

        inputElement.css({
            "background-color": "transparent",
            "border": "1px solid #darkgreen"
        });

        $divValidationImage.appendTo(appendToElement)
            .css({
                "position": "absolute",
                "width": "26px",
                "height": "26px",
                "background-position": "center center",
                "background-repeat": "no-repeat",
                "background-image": loaderImage,
                "-ms-background-size": "contain",
                "background-size": "contain"
            })
            .offset({
                left: (inputElement.offset().left + inputElement.outerWidth()),
                top: (inputElement.offset().top + inputElement.outerHeight() - $divValidationImage.outerHeight())
            }).addClass(containersName.toLowerCase() + "_image").attr("id", "img" + containersName + inputElement.attr("id"));
    }
}

function toggleIndividualValidator(args) {
    args = args || {};
    var inputElement = args.inputElement || null;
    var errorElement = args.errorElement || null;
    var containersName = args.containersName || null;
    var option = args.option || null;
    var inputBackgroundColor = args.inputBackgroundColor || null;
    var inputBorderColor = args.inputBorderColor || null;
    var validationMessageColor = args.validationMessageColor || null;
    var validationImage = args.validationImage || null;
    var appendToElement = args.appendToElement || null;

    if (option === "show" || option === "hide") {
        $("#div" + containersName + inputElement.attr("id")).remove();
        $("#img" + containersName + inputElement.attr("id")).remove();
    };

    if (option === "show") {
        var $divValidationImage = $("<div></div>");

        inputElement.css({
            "background-color": inputBackgroundColor, //#f51b34 //#FF5468
            "border": "1px solid " + inputBorderColor
        });

        $divValidationImage.appendTo(appendToElement)
            .css({
                "position": "absolute",
                "width": "26px",
                "height": "26px",
                "background-position": "center center",
                "background-repeat": "no-repeat",
                "background-image": validationImage,
                "-ms-background-size": "contain",
                "background-size": "contain"
            })
            .offset({
                left: (inputElement.offset().left + inputElement.outerWidth()),
                top: (inputElement.offset().top + inputElement.outerHeight() - $divValidationImage.outerHeight())
            }).addClass(containersName.toLowerCase() + "_image").attr("id", "img" + containersName + inputElement.attr("id"));

        if (errorElement) {
            errorElement.appendTo(appendToElement)
                .css({
                    "position": "absolute",
                    "color": validationMessageColor
                })
                .offset({
                    left: (inputElement.offset().left + inputElement.outerWidth() + $divValidationImage.outerWidth()),
                    top: (inputElement.offset().top + inputElement.outerHeight() - errorElement.outerHeight())
                }).addClass(containersName.toLowerCase() + "_message").attr("id", "div" + containersName + inputElement.attr("id"));
        }
    }
}

function emptyIndividualLoader(args) {
    args = args || {};
    var inputElement = args.inputElement || null;
    var containersName = args.containersName || null;

    $("#div" + containersName + inputElement.attr("id")).remove();
    $("#img" + containersName + inputElement.attr("id")).remove();

    inputElement.css({
        "background-color": "transparent",
        "border": "1px solid #darkgreen"
    });
}

function toggleUniversalLoader(args) {
    args = args || {};
    var id = args.id || null;
    var option = args.option || null;
    var loaderWidth = args.loaderWidth || null;
    var loaderHeight = args.loaderHeight || null;
    var appendToElement = args.appendToElement || null;

    var containerId = id + "UniversalSpinnerContainer";
    var contentId = id + "UniversalSpinnerContent";
    var spinnerBgImage = "url('" + siteroot + "Images/Loading/loading3.gif')";
    var $element = $("#" + id);

    if (option === "show") {
        $("#" + id + "UniversalMessageContainer").stop(true, true).remove();
        $("#" + id + "UniversalMessageContent").stop(true, true).remove();
        $("#" + containerId).stop(true, true).remove();
        $("#" + contentId).stop(true, true).remove();

        var $divContainer = $("<div id='" + containerId + "'></div>");
        $divContainer.appendTo(appendToElement);
        $divContainer
            .css({
                "opacity": "0",
                "position": "absolute",
                "background-color": "#202020",
                "z-index": "5",
                "width": $element.outerWidth() + "px",
                "height": $element.outerHeight() + "px"
            })
            .offset({
                left: $element.offset().left,
                top: $element.offset().top
            });

        var $divContent = $("<div id='" + contentId + "'></div>");
        $divContent.appendTo(appendToElement);
        $divContent
            .css({
                "opacity": "0",
                "position": "absolute",
                "width": loaderWidth ? loaderWidth + "px" : (($element.outerWidth() - 10) > 0 ? ($element.outerWidth() - 10) : $element.outerWidth() + "px"), // marginesy 10px
                "height": loaderHeight ? loaderHeight + "px" : (($element.outerHeight() - 10) > 0 ? ($element.outerHeight() - 10) : $element.outerHeight() + "px"),
                "z-index": "6",
                "background-position": "center center",
                //"background-color": "blue",
                "background-repeat": "no-repeat",
                "background-image": spinnerBgImage,
                "-ms-background-size": "contain",
                "background-size": "contain"
            })
            .offset({
                left: $element.offset().left + (($element.innerWidth() - $divContent.innerWidth()) / 2),
                top: $element.offset().top + (($element.innerHeight() - $divContent.innerHeight()) / 2)
            });

        //alert("divContainer - left: " + $divContainer.css("left") + ", top: " + $divContainer.css("top"));

        $divContainer
            .stop(true, true)
            .animate({ "opacity": "0.8" }, { queue: false, duration: 250 });

        $divContent
            .stop(true, true)
            .animate({ "opacity": "1" }, { queue: false, duration: 250 });
    }
    else if (option === "hide") {
        $("#" + containerId)
            .animate({
                "opacity": "0"
            }, {
                queue: false,
                duration: 250,
                complete: function () {
                    $(this).remove();
                }
            });

        $("#" + contentId)
            .animate({
                "opacity": "0"
            }, {
                queue: false,
                duration: 250,
                complete: function () {
                    $(this).remove();
                }
            });
    }
    else {
        alert("toggleSearchResultsSpinner - podana opcja jest nieprawidłowa. ");
    }
}

function toggleUniversalMessage(args) {
    args = args || {};
    var id = args.id || null;
    var option = args.option || null;
    var message = args.message || null;
    var fadeout = args.fadeout || null; // true / false - hide or not
    var length = args.length || 1000; // time in miliseconds
    var fadetime = args.fadetime || 1000; // time of fade in and fade out in miliseconds
    var messageColor = args.messageColor || "yellow";
    var appendToElement = args.appendToElement || null;

    var containerId = id + "UniversalMessageContainer";
    var contentId = id + "UniversalMessageContent";
    var $element = $("#" + id);
    var $divContainer, $divContent;

    if (option === "show") {
        $("#" + containerId).stop(true, true).remove();
        $("#" + contentId).stop(true, true).remove();

        $divContainer = $("<div id='" + containerId + "'></div>");
        $divContainer.appendTo(appendToElement);
        $divContainer
            .css({
                "opacity": "0",
                "position": "absolute",
                "background-color": "#000000",
                "z-index": "5",
                "width": $element.outerWidth() + "px",
                "height": $element.outerHeight() + "px"
            })
            .offset({
                top: $element.offset().top,
                left: $element.offset().left
            });

        $divContent = $("<div id='" + contentId + "'>" + message + "</div>");
        $divContent.appendTo(appendToElement);
        $divContent
            .css({
                "opacity": "0",
                "position": "absolute",
                //"width": $element.outerWidth() + "px",
                //"height": $element.outerHeight() + "px",
                "z-index": "6",
                "background-position": "center center",
                "background-repeat": "no-repeat",
                "-ms-background-size": "contain",
                "background-size": "contain",
                "color": messageColor,
                "font-size": "26px",
                "text-align": "center",
                //"line-height": $element.outerHeight() + "px",
                "vertical-align": "middle" //,
                //"background-color": "blue"
            })
            .offset({
                left: $element.offset().left + (($element.innerWidth() - $divContent.innerWidth()) / 2),
                top: $element.offset().top + (($element.innerHeight() - $divContent.innerHeight()) / 2)
            });

        $divContainer
            .css({ "opacity": "0" })
            .stop(true, true)
            .animate({ "opacity": "0.8" }, { queue: true, duration: fadetime });

        $divContent
            .css({ "opacity": "0" })
            .stop(true, true)
            .animate({ "opacity": "1" }, { queue: true, duration: fadetime });
    }
    if (option === "hide" || fadeout) {
        $divContainer = $("#" + containerId);
        $divContent = $("#" + contentId);

        $divContainer
            .delay(length)
            .animate({ "opacity": "0" }, { queue: true, duration: fadetime, complete: function () { $divContainer.remove(); } });
        $divContent
            .delay(length)
            .animate({ "opacity": "0" }, { queue: true, duration: fadetime, complete: function () { $divContent.remove(); } });
    }
    if (option !== "show" && option !== "hide") {
        alert("toggleSearchResultsSpinner - podana opcja jest nieprawidłowa. ");
    }
}

// Rozszerzone funkcje

if (typeof String.prototype.startsWith != "function") { // ReSharper disable once NativeTypePrototypeExtending
    String.prototype.startsWith = function (prefix) {
        return this.slice(0, prefix.length) === prefix;
    };
}

if (typeof String.prototype.endsWith != "function") { // ReSharper disable once NativeTypePrototypeExtending
    String.prototype.endsWith = function (suffix) {
        return this.slice(-suffix.length) === suffix;
    };
}

function isNullOrEmpty(str) {
    return str == null || 0 === str.length;
}

function keysToLowerCase(obj) {
    var key, keys = Object.keys(obj);
    var n = keys.length;
    var newobj = {}
    while (n--) {
        key = keys[n];
        newobj[key.toLowerCase()] = obj[key];
    }
    return (newobj);

    //return obj.replace(/"([^"]+)":/g, function ($0, $1) { return ('"' + $1.toLowerCase() + '":'); });
}

(function ($) {
    $.eventReport = function (selector, root) {
        var s = [];
        $(selector || "*", root).andSelf().each(function () {
            // the following line is the only change
            var e = $.data(this, "events");
            if (!e) return;
            s.push(this.tagName);
            if (this.id) s.push("#", this.id);
            if (this.className) s.push(".", this.className.replace(/ +/g, "."));
            for (var p in e) {
                if (e.hasOwnProperty(p)) {
                    var r = e[p],
                        h = r.length - r.delegateCount;
                    if (h)
                        s.push("\n", h, " ", p, " handler", h > 1 ? "s" : "");
                    if (r.delegateCount) {
                        for (var q = 0; q < r.length; q++)
                            if (r[q].selector) s.push("\n", p, " for ", r[q].selector);
                    }
                }
            }
            s.push("\n\n");
        });
        return s.join("");
    }
    $.fn.eventReport = function (selector) {
        return $.eventReport(selector, this);
    }
})(jQuery);

// Jquery validate - rozszerzenie additional methods

jQuery.validator.addMethod("notEqualTo", function (value, element, param) {
    return this.optional(element) || value !== $(param).val();
}, "Wartości nie mogą być sobie równe");

// "visible" sprawdza czy JQuery element $ jest widoczny na ekranie
// "above" - sprawdza czy element jest na lub 'nad' ekranem
function checkVisible(elm, evalType) {
    evalType = evalType || "visible";

    var vpH = $(window).height(), // Viewport Height
        st = $(window).scrollTop(), // Scroll Top
        y = $(elm).offset().top,
        elementHeight = $(elm).height();

    if (evalType === "above")
        return ((y < (vpH + st)));

    // if (evalType === "visible")
    return ((y < (vpH + st)) && (y > (st - elementHeight)));
}

$(document).ready(function () {

    $("#btnSearchSubmit").prop("disabled", false);
    $("#btnLoginSubmit").prop("disabled", false);

    // DEBUGOWANIE

    if (!debugMode) {
        $("#divDebug").hide();
    }
    else {
        $("#divDebug").draggable();
    }
    
    //var oldValues = searchAvalProperties;

    // Formatowanie

    $.fn.extend({
        center: function (options) {
            options = $.extend({ // Default values
                inside: window, // element, center into window
                transition: 0, // millisecond, transition time
                minX: 0, // pixel, minimum left element value
                minY: 0, // pixel, minimum top element value
                withScrolling: true, // booleen, take care of the scrollbar (scrollTop)
                vertical: true, // booleen, center vertical
                horizontal: true // booleen, center horizontal
            }, options);
            return this.each(function () {
                var props = { position: "absolute" };
                if (options.vertical) {
                    var top = ($(options.inside).height() - $(this).outerHeight()) / 2;
                    if (options.withScrolling) top += $(options.inside).scrollTop() || 0;
                    top = (top > options.minY ? top : options.minY);
                    $.extend(props, { top: top + "px" });
                }
                if (options.horizontal) {
                    var left = ($(options.inside).width() - $(this).outerWidth()) / 2;
                    if (options.withScrolling) left += $(options.inside).scrollLeft() || 0;
                    left = (left > options.minX ? left : options.minX);
                    $.extend(props, { left: left + "px" });
                }
                if (options.transition > 0) $(this).animate(props, options.transition);
                else $(this).css(props);
                return $(this);
            });
        }
    });

    // Animacje

    $(document).on("mouseenter", "input[type=button], input[type=submit]", function () { // żeby porzyciski ładowane dynamicznie również otrzymywały style
    //$("input[type=button], input[type=submit]").on("mouseenter", function () {
        $(this).stop().animate({
            color: "white",
            backgroundColor: "#252525",
            borderColor: "white"
        }, 250);
    });

    $(document).on("mouseleave", "input[type=button], input[type=submit]", function () {
    //$("input[type=button], input[type=submit]").on("mouseleave", function () {
        $(this).stop().animate({
            color: "yellow",
            backgroundColor: "transparent",
            borderColor: "#254117"
        }, 250);
    });

    // Date Picker

    $.validator.methods.date = function (value/*, element*/) {
        var mDate = moment(value, "DD-MM-YYYY");
        var d = mDate.toDate();
        var dRegEx = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;

        return dRegEx.test(value) && mDate && d;
    }

    $("input:text.date").datepicker({
        dateFormat: "dd-mm-yy"
    });


    // Tooltip

    $("#txtSearch").tooltip({
        tooltipClass: "txtSearch_tooltip",
        track: false,
        show: { delay: 10, duration: 500, effect: "fadeIn" },
        hide: { delay: 10, duration: 500, effect: "fadeOut" },
        left: 0,
        position: {
            my: "left top", 
            at: "left bottom+10"
        },
        open: function (/*event, ui*/) {
            fixTooltipPosition();
        }
    });

    $("#txtSearch").mouseenter(function () {
        refreshTooltip({
            isValidatedBy: null,
            areAnyResults: false
        });
    });

    // Autocomplete

    function updateTextBox(event, ui) {
        $(this).val(ui.item.Title);
        return false;
    }

    $("#txtSearch").autocomplete({
        search: function (/*event, ui*/) {
            toggleSearchFieldSpinner("show");
        },
        source: function (request, response) {
            var validation = validateSearchProperties({
                props: ["searchterm", "includeauthor"],
                currvalues: {
                    searchterm: $("#txtSearch").val(),
                    includeauthor: $("#cbIncludeAuthor").prop("checked")
                }
            });

            if (validation.validationresults.all.output) {
                $.ajax({
                    async: true,
                    url: siteroot + "Base/GetAutocompleteResults",
                    method: "post",
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify({
                        SearchTerm: validation.validatedvalues.searchterm,
                        IncludeAuthor: validation.validatedvalues.includeauthor
                    }),
                    dataType: "json",
                    success: function (data) {
                        if (data.length === 0) { // jeśli nie ma wyników lub fallback jeśli błąd połączenia z bazą
                            refreshTooltip({
                                isValidatedBy: validation,
                                areAnyResults: false
                            });
                            $("#txtSearch").tooltip("open");
                        }
                        else {
                            refreshTooltip({
                                isValidatedBy: validation,
                                areAnyResults: true
                            });
                            $("#txtSearch").tooltip("close");
                            $("#txtSearch").tooltip("disable");
                        }
                        toggleSearchFieldSpinner("hide");
                        //data["AdditionDate"] = JSON.parse(data.AdditionDate);
                        response(data);
                    },
                    error: function (err) {
                        toggleSearchFieldSpinner("hide");
                        $("html").html(err.responseText);
                    }
                });
            }
            else {
                var isHovered = !!$("#txtSearch").filter(function () {
                    return $(this).is(":hover");
                }).length;

                refreshTooltip({
                    isValidatedBy: validation,
                    areAnyResults: false
                });
                if (isHovered) {
                    $("#txtSearch").tooltip("open");
                }
                toggleSearchFieldSpinner("hide");
                response();
            }
        },
        minLength: 1,
        position: {
            my: "left top",
            at: "left bottom+10"
        },
        select: updateTextBox
    })
        .autocomplete("instance")._renderItem = function (ul, item) {
            var sTableRow = null;

            $.ajax({
                async: false,
                url: siteroot + "Base/GetAutocompleteItem",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    item: JSON.stringify(item)
                }),
                dataType: "html",
                success: function (data) {
                    sTableRow = data;
                },
                error: function (err) {
                    $("html").html(err.responseText);
                }
            });

            sTableRow = sTableRow.replace(/(\r\n|\n|\r|\s\s+)/gm, "");
            var tableRow = $.parseHTML(sTableRow);
            var currTerm = this.term;
            var arrCurrTerm = currTerm.split(" ");
            var itemsToCheck = $("#cbIncludeAuthor").prop("checked") ? ".autocomplete_item_title, .autocomplete_item_author" : ".autocomplete_item_title";

            $.each(arrCurrTerm, function (index, value) {
                if (value.length > 2) {
                    var regex = new RegExp("(" + value + ")(?![^<]*>|[^<>]*<\/)", "i"); // druga część zapobiega podmianie tagów html

                    $(tableRow).find(itemsToCheck).each(function (i, el) {
                        $(el).html($(el).html().replace(regex, "<span style='text-decoration: underline; font-weight: bold; color: blue;'>" + "$1" + "</span>"));
                    });
                }
            });

            return $(tableRow).appendTo(ul);
        };

    $("#frmSearch").submit(function (e) {
        //$(e.target).find("input[type='hidden'][name='includeAuthor']").detach(); // usuwa przed wysłaniem hidden element tworzony dla każdego checknboxa przez MVC, żeby nie było podwójnych wartości Query Stringów, wartość pola hidden pozwala otrzymać controllerowi wartość checkboxa jeśli jest false // komentarz, bo nie używam obecnie w projekcie querystringów do przekazywania wartości tego formularza
        var address = window.location.href;
        var controller = "Book";
        var action = "Index";

        var endsWithAction = address.endsWith("/" + controller + "/" + action) || address.indexOf("/" + controller + "/" + action + "?") > -1 || address.indexOf("/" + controller + "/" + action + "#") > -1;
        var endsWithController = address.endsWith("/" + controller) || address.indexOf("/" + controller + "?") > -1 || address.indexOf("/" + controller + "#") > -1;

        if (endsWithAction || endsWithController) { // Jeśli jesteśmy w index book, zdarzenie z Book/Index.js implementuje ten event, czyli program tutaj nie robi nic
            e.preventDefault();
        }
        else { // Jeśli nie jesteśmy w w Index/Book to Submit wysyła do Book/Index
            var currValues = {
                searchterm: $("#txtSearch").val(),
                includeauthor: $("#cbIncludeAuthor").prop("checked")
            }

            var validation = validateSearchProperties({
                props: ["searchterm", "includeauthor"],
                currvalues: currValues
            });

            if (!validation.validationresults.all.output) {
                e.preventDefault();
            }
            else {
                $("#btnSearchSubmit").prop("disabled", true);
            }
        }
    });


    // Menu strony

    $("#divMenu div.menu_mainlvl_item").mouseenter(function () {
        $(this).parent().find(".menu_sublvl_container").stop().slideDown(250);
        if (!$(this).hasClass("menu_selected_item")) {
            $(this).find("a").stop().animate({
                color: "#383D41"
            }, 250);
            $(this).css({
                "background-image": "url('" + siteroot + "images/menu_item_active.jpg')",
                "background-repeat": "no-repeat",
                "background-position": "center center",
                "cursor": "pointer"
            });
        }
    });

    $("#divMenu div.menu_mainlvl_item, #divMenu div.menu_sublvl_item").mouseleave(function () {
        if (!$(this).hasClass("menu_selected_item")) {
            $(this).find("a").stop().animate({
                color: "#FFFF00"
            }, 250);
            $(this).css({
                "background-image": "none",
                "background-repeat": "no-repeat",
                "background-position": "center center",
                "cursor": "pointer"
            });
        }
    });

    $("#divMenu div.menu_mainlvl_container").mouseleave(function () {
        $(this).parent().find(".menu_sublvl_container").stop().slideUp(250);
    });

    $("#divMenu div.menu_sublvl_item").mouseenter(function () {
        if (!$(this).hasClass("menu_selected_item")) {
            $(this).find("a").stop().animate({
                color: "#383D41"
            }, 250);
            $(this).css({
                "background-image": "url('" + siteroot + "images/menu_item_active.jpg')",
                "background-repeat": "no-repeat",
                "background-position": "center center",
                "cursor": "pointer"
            });
        }
    });


    // Menu, Wyszukiwanie i Panel Logowania - Formatowanie

    function formatMenuSearchAndLoginPanel() {
        var $divMenuAndSearchContainer = $("#divMenuAndSearchContainer");
        var $divMenuContainer = $("#divMenuContainer");

        $("#divSearchWidget").position({
            my: "left top",
            at: "left top",
            of: $divMenuAndSearchContainer,
            collision: "none"
        });

        $("#divLoginPanelContainer").offset({
            top: $("#divSearchWidget").offset().top, // + $("#divSearchWidget").innerHeight() + $("#divMenuContainer").innerHeight(),
            left: $("#divSearchWidget").offset().left + $("#Main").width() - $("#divLoginPanelContainer").innerWidth()
        });

        $divMenuContainer.offset({
            top: $("#divSearchWidget").offset().top + $("#divLoginPanelContainer").innerHeight(),
            left: $("#divSearchWidget").offset().left
        });

        $divMenuContainer.css({
            "width": $("#Main").width()
        });

        $divMenuAndSearchContainer.css({
            "height": $("#divLoginPanelContainer").innerHeight() + $("#divMenuContainer").innerHeight()
        });

        $("#divSearchOptions").offset({ // po ustaleniu HEIGHT panelu z search i menu
            top: $(".books_scrollbar")[0] ? $(".books_scrollbar").first().offset().top + $(".books_scrollbar").first().innerHeight() : $("#divSearchWidget").offset().top,
            left: $(".books_scrollbar")[0] ? $(".books_scrollbar").first().offset().left : $("#divSearchWidget").offset().left
        });
    }

    formatMenuSearchAndLoginPanel();


    // Panel Logowania

    function updateLoginPanelOnBegin() {
        toggleUniversalLoader({
            id: "divLoginPanelContainer",
            option: "show",
            loaderWidth: 64,
            loaderHeight: 64,
            appendToElement: $("#divLoginPanelContainer")
        });
    }

    function updateLoginPanelOnComplete(message) {
        toggleUniversalLoader({
            id: "divLoginPanelContainer",
            option: "hide"
        });

        if (message) {
            toggleUniversalMessage({
                id: "divLoginPanelContainer",
                option: "show",
                fadeout: true,
                fadetime: 1000,
                length: 1000,
                message: message,
                appendToElement: $("#divLoginPanelContainer"),
                messageColor: "#FF5468"
            });
        }
    }

    //$(document).on("click keydown", "#btnLoginSubmit, #frmLoginPanel input", function (e) {
    //    if (e.type === "keydown" && e.which !== 13)
    //        return;
    //
    //    if (e.type === "click" && e.target.id !== "btnLoginSubmit")
    //        return;

    $(document).on("keyup", "#frmLoginPanel input", function (e) {
        if (e.which !== 13)
            return;

        $("#btnLoginSubmit").click();
    });

    //$("#btnLoginSubmit").on("click keydown", function(e) {
    $(document).on("click", "#btnLoginSubmit", function (e) {
        $("#btnLoginSubmit").prop("disabled", true);
        updateLoginPanelOnBegin();

        $.ajax({
            async: true,
            url: siteroot + "Base/LoginUser",
            method: "post",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                UserName: $("#txtLoginUserName").val(),
                Password: $("#txtLoginPassword").val(),
                RememberMe: $("#cbLoginRememberMe").prop("checked")
            }),
            dataType: "json",
            success: function (data) {
                var sLoginPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, ""); //.replace(" ", "&nbsp;") //|\s\s+
                var loginPanelView = $.parseHTML(sLoginPanelView);
                $("#divLoginPanelContainer").empty();
                $(loginPanelView).appendTo($("#divLoginPanelContainer"));
                updateLoginPanelOnComplete(data.LoginMessage);
                formatMenuSearchAndLoginPanel();
                positionBackground();
                resizeBackground();
                $("#btnLoginSubmit").prop("disabled", false);
            },
            error: function (err) {
                $("html").html(err.responseText);
            }
        });

        //e.preventDefault();
    });

    $(document).on("click", "#lnkbtnLogout", function (e) {
        toggleUniversalLoader({
            id: "divLoginPanelContainer",
            option: "show",
            loaderWidth: 64,
            loaderHeight: 64,
            appendToElement: $("#divLoginPanelContainer")
        });

        $.ajax({
            async: true,
            url: siteroot + "Base/Logout",
            method: "post",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({ }),
            dataType: "json",
            success: function (data) {
                var sLoginPanelView = data.PartialView.replace(/(\r\n|\n|\r)/gm, ""); 
                var loginPanelView = $.parseHTML(sLoginPanelView);
                $("#divLoginPanelContainer").empty();
                $(loginPanelView).appendTo($("#divLoginPanelContainer"));
                toggleUniversalLoader({
                    id: "divLoginPanelContainer",
                    option: "hide"
                });
                formatMenuSearchAndLoginPanel();
                positionBackground();
                resizeBackground();
                $("#btnLoginSubmit").prop("disabled", false);
            },
            error: function (err) {
                $("html").html(err.responseText);
            }
        });
    });


    // Formatowanie tła

    $(window).on("resize", function () {
        positionBackground();
        resizeBackground();
    });

    $divMain.find("*").on("attrchange", function () {
        positionBackground();
        resizeBackground();
    });

});