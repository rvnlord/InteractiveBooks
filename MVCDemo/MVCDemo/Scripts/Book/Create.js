/// <reference path="../_references.js" />

function btnCreateBook_Click(e) {
    $(e.target).prop("disabled", true);

    var loaderContainerId = "divBookCreateFields"; // pozycjonuj względem
    var $appendToElement = $("#divBookCreateContainer"); // umieść w

    $("#" + loaderContainerId).css({
        "min-height": "100px"
    });
    positionBackground();
    resizeBackground();

    toggleUniversalLoader({
        id: loaderContainerId,
        option: "show",
        loaderWidth: 64,
        loaderHeight: 64,
        appendToElement: $appendToElement
    });

    $.ajax({
        async: true,
        url: siteroot + "Book/CreateBook",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            book: {
                Title: $("#txtTitle").val()
            }
        }),
        dataType: "json",
        success: function (data) {
            var status = (data.Status || "").toLowerCase();
            var link = data.Link;
            var message = data.Message;
            var messageCombined = message + ": <a href='" + link + "'>Przejdź do Edycji</a>";
            var msgColor = status === "success" ? msgColor = "#0b970d" : "#FF5468";

            toggleUniversalLoader({
                id: loaderContainerId,
                option: "hide"
            });

            if (message) {
                toggleUniversalMessage({
                    id: loaderContainerId, 
                    option: "show",
                    fadeout: status !== "success",
                    fadetime: 1000,
                    length: 1000,
                    message: status !== "success" ? message : messageCombined,
                    messageColor: msgColor,
                    appendToElement: $appendToElement
                });
            }

            if (status !== "success") {
                $(e.target).prop("disabled", false);
                $("#" + loaderContainerId).css({
                    "min-height": "auto"
                });
                positionBackground();
                resizeBackground();
            }
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

$(document).ready(function() {
    $("#btnCreateBook").on("click", function (e) {
        btnCreateBook_Click(e);
    });
});