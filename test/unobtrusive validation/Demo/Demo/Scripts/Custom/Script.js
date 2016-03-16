/// <reference path="../_references.js" />
/// <reference path="../jquery.validate-vsdoc.js" />
/// <reference path="~/Scripts/jquery.linq-vsdoc.js" />
/// <reference path="~/Scripts/linq-vsdoc.js" />


// Load jQuery and jQuery-Validate scripts

// When the document is ready
$(document).ready(function () {

    $.validator.addMethod("dateRange", function (value, element, parameter) {
        if (this.optional(element)) {
            return true;
        }
        var startDate = Date.parse("01/01/1900"),
        endDate = Date.parse(new Date()),
        enteredDate = Date.parse(value);

        return ((startDate <= enteredDate) && (enteredDate <= endDate));

    }, "Please specify a valid date.");

    $.validator.addMethod("numberEqualTo", function (value, element, parameter) {
        return parseInt(value) === parseInt(parameter);
    }, "Values must match");

    $.validator.addMethod("passwordValid", function (value, element, parameter) {
        return value.match(/(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,})$/g);
    }, "Please enter a valid password.");

    $.validator.addMethod("postalCodeUS", function (value, element) {
        return this.optional(element) || /\d{5}-\d{4}$|^\d{5}$/.test(value);
    }, "The specified US ZIP Code is invalid");

    $.validator.addMethod("ssn", function (value, element, parameter) {
        return value.match(/^([0-6]\d{2}|7[0-6]\d|77[0-2])([ \-]?)(\d{2})\2(\d{4})$/);
    }, "Please enter a valid Social Security Number.");

    //validation rules
    $("#example2").validate({
        //set this to false if you don't what to set focus on the first invalid input
        focusInvalid: false,
        //by default validation will run on input keyup and focusout
        //set this to false to validate on submit only
        //onkeyup: false, // tylko false, true jest domyślnie, jeśli wpiszemy true, to wywali błąd
        //onfocusout: true,
        //by default the error elements is a <label>
        errorElement: "div",
        //place all errors in a <div id="errors"> element
        errorPlacement: function (error, element) {
            //error.appendTo("div#errors");
            error.insertAfter(element);
        },
        rules: {
            "example2-fullname": {
                required: true,
                minlength: 5
            },
            "example2-phone": {
                required: true,
                number: true
            },
            "example2-zip": {
                required: true,
                number: true,
                rangelength: [3, 5]
            },
            "example2-value": {
                required: true,
                number: true,
                numberEqualTo: 10
            }
        },
        messages: {
            "example2-fullname": {
                required: "You must enter your full name",
                minlength: "First name must be at least 5 characters long"
            },
            "example2-phone": {
                required: "You must enter your phone number",
                number: "Phone number must contain digits only"
            },
            "example2-zip": {
                required: "You must enter your zip code",
                number: "Zip code must contain digits only",
                rangelength: "Zip code must have between 3 to 5 digits"
            },
            "example2-value": {
                required: "You must enter your value",
                number: "Value must be a digit",
                numberEqualTo: "Value must be equal to 10"
            }
        }
    });

    var jsonArray = [
        { "user": { "id": 100, "screen_name": "d_linq" }, "text": "to objects" },
        { "user": { "id": 130, "screen_name": "c_bill" }, "text": "g" },
        { "user": { "id": 155, "screen_name": "b_mskk" }, "text": "kabushiki kaisha" },
        { "user": { "id": 301, "screen_name": "a_xbox" }, "text": "halo reach" }
    ];

    // żeby użyć wersji JQuery wystarczy poprzedzić "Enurmerable" "$.", czyli: "$.Enurmerable"

    // ["b_mskk:kabushiki kaisha", "c_bill:g", "d_linq:to objects"]
    var queryResult = Enumerable.From(jsonArray)
        .Where(function (x) { return x.user.id < 200 })
        .OrderBy(function (x) { return x.user.screen_name })
        .Select(function (x) { return x.user.screen_name + ": " + x.text })
        .ToArray();

    // shortcut! string lambda selector
    var queryResult2 = Enumerable.From(jsonArray)
        .Where("$.user.id < 200")
        .OrderBy("$.user.screen_name")
        .Select("$.user.screen_name + ': ' + $.text")
        .ToArray();

    // v3
    var queryResult3 = Enumerable.From(jsonArray)
        .Where("x => x.user.id < 200")
        .OrderBy("x => x.user.screen_name")
        .Select("x => x.user.screen_name + ': ' + x.text")
        .ToArray();

    alert(queryResult.join(", \n"));
    alert(queryResult2.join(", \n"));
    alert(queryResult3.join(", \n"));
});