/// <reference path="../_references.js" />

$(document).ready(function () {

    function formatBookContent() {
        $(".book_page_separator").each(function(i, el) {
            var $prev = $(el).prev();
            var $next = $(el).next();
            if ($prev.is("p") && $next.is("p")) {
                $prev.text($prev.text() + $next.text());
                $next.remove();
            }
        });

        $(".book_page_separator").remove();
        var $storyContainer = $(".book_details_content_story");

        var lines = getLinesNumber();
        var pageLines = 30;
        var pages = Math.ceil(lines / pageLines);

        var topElements = $.makeArray($storyContainer.children("p"));
        var bottom = [];
        var top = $.Enumerable.From(topElements)
            .Select(function(x) {
                return {
                     p: x,
                     originalText: $(x).text().trim(),
                     originalParent: $(x).parent()
                };
            }).ToArray();

        for (var i = pages; i > 1; i--) {
            var last = top[top.length - 1];
            while (getLinesNumber() > (i - 1) * pageLines) {
                if (!$(last.p).text()) {
                    $(last.p).text(last.originalText);
                    $(last.p).remove();
                    $(last.p).addClass("paged");
                    bottom.unshift(top.pop());
                }
                last = top[top.length - 1];
                var textArr = $(last.p).text().split(" ");
                textArr.pop();
                $(last.p).text(textArr.join(" "));
            }
            var separator = top[top.length - 1];
            var text = $(separator.p).text();
            var head = text;
            var tail = separator.originalText.substring(text.length);

            $(separator.p).text(head);
            separator.originalText = head;

            bottom.unshift({
                p: $("<p class='paged'>" + tail + "</p>")[0],
                originalText: tail,
                originalParent: separator.originalParent
            });

            bottom.unshift({
                p: $("<div class='book_page_separator paged'> - " + (i - 1) + " - </div>")[0],
                originalText: " - " + (i - 1) + " - ",
                originalParent: separator.originalParent
            });
        }

        while (top.length > 0) {
            var currLast = top[top.length - 1];
            $(currLast.p).text(currLast.originalText);
            $(currLast.p).remove();
            $(currLast.p).addClass("paged");
            bottom.unshift(top.pop());
        }

        bottom.push({
            p: $("<div class='book_page_separator paged'> - " + pages + " - </div>")[0],
            originalText: " - " + pages + " - ",
            originalParent: bottom[bottom.length - 1].originalParent
        });

        $.each(bottom, function (idx, v) {
            var ccount = v.originalParent.children("div, p").not(".paged").length;
            if (ccount !== 0) {
                alert("Error: Container is not empty");
            } else {
                v.originalParent.append($(v.p));
            }
        });
    }

    function getLinesNumber() {
        var $storyContainerP = $(".book_details_content_story").children("p");
        var totalHeight = 0;
        $storyContainerP.each(function (i, el) {
            totalHeight += $(el).innerHeight();
        });
        var lineheight = parseFloat($storyContainerP.css("line-height"));
        
        return Math.ceil(totalHeight / lineheight);
    }

    function getXmlBookNodeContent(args) {
        args = args || {};
        var nodeNumber = args.nodeNumber || 0;
        var choiceParent = args.choiceParent || null;

        $("#divBookDetailsContentLoader").remove();
        var $divLoader = $("<div id='divBookDetailsContentLoader'></div>");
        $("#divBookDetailsContent").append($divLoader);
        $divLoader.css({
            "height": "100px"
        });

        toggleUniversalLoader({
            id: "divBookDetailsContentLoader",
            option: "show",
            loaderWidth: 64,
            loaderHeight: 64,
            appendToElement: $("#divBookDetailsContainer")
        });

        $.ajax({
            async: true,
            url: siteroot + "Book/GetXmlBookNodeContent",
            method: "post",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                id: $.id,
                nodeNumber: nodeNumber,
                choiceParent: choiceParent
            }),
            dataType: "json",
            success: function (data) {
                var bookContentView = $.parseHTML(data.PartialView.replace(/(\r\n|\n|\r)/gm, ""));
                $(bookContentView).appendTo($("#divBookDetailsContent"));

                var message = data.Message;
                if (message) {
                    toggleUniversalMessage({
                        id: "divBookDetailsContentLoader",
                        option: "show",
                        fadeout: false,
                        message: message,
                        messageColor: "#FF5468",
                        appendToElement: $("#divBookDetailsContainer")
                    });
                } else {
                    $divLoader.remove();
                    formatBookContent();
                }

                toggleUniversalLoader({
                    id: "divBookDetailsContentLoader",
                    option: "hide"
                });

                positionBackground();
                resizeBackground();
            },
            error: function (err) {
                $("html").html(err.responseText);
            }
        });
    }

    getXmlBookNodeContent();

    $(document).on("click", ".book_details_content_choice_option", function(e) {
        $(".book_details_content_choice_option").closest("div.book_details_content_choice").remove();
        getXmlBookNodeContent({
            nodeNumber: $(e.target).attr("choice-num"),
            choiceParent: $(e.target).closest(".book_details_content_choice").attr("choice-parent")
        });
    });

    //$(document).on("click", ".book_details_content_loadpages", function () {

    //});
});