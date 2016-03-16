$(document).ready(function () {

    var oldValues = $.extend({}, searchAvalProperties, getOldValues(searchAvalProperties));

    // Autocomplete

    $("#txtSearch").autocomplete("disable");

    /**
     * Formatuje odstępy divów, w których będą wyniki wyszukiwania
    */
    function formatBooks() {
        var $bookRow = $("#divListBooks .book_row");
        var $divListBooks = $("#divListBooks");
        var lastRowIndex = $bookRow.length - 1;

        $("#divListBooks .book_row .book_content").css({
            "margin": "10px",
            "margin-bottom": "0"
        });

        $bookRow.each(function (i, el) {

            $(el).children().first(".book_content").css({
                "margin-right": "0"
            });

            var elSpacing = ($divListBooks.outerWidth(true) - $(el).outerWidth(true)) / 5;
            $(el).css({
                "margin-right": (i * elSpacing) + "px"
            });

            if (i === lastRowIndex) {
                $(el).children().css({
                    "margin-bottom": "10px"
                });
            }
        });
    }

    formatBooks();

    // Search

    /**
     * Wyświetla dodatkową wiadomość na wynikach wyszukiwania
     * @param {} containerId - Id kontenera z zawartością
     * @param {} contentId - Id zawartości
     * @param {string} message - wiadomość do wyświetlenia
     * @param {boolean} fadeout - Czy wiadomość po wyświetleniu ma zostać po sekundzie wyłączona
     */
    function showSearchMessage(containerId, contentId, message, fadeout, duration, delay) {
        duration = duration !== 0 && !duration ? 1000 : duration;
        delay = delay !== 0 && !delay ? 1000 : delay;
        $("#" + containerId).stop(true, true).remove();
        $("#" + contentId).stop(true, true).remove();

        var $bookFirstContent = $("#divListBooks .book_row").first().children().first(".book_content");
        var $divNoSearchResults = $("<div id='" + containerId + "'></div>");
        $divNoSearchResults.appendTo($("#divSearchResults"));
        $divNoSearchResults
            .css({
                "width": ($bookFirstContent.outerWidth() * 2 + 10) + "px",
                "height": $bookFirstContent.outerHeight() / 2
            })
            .offset({
                top: $bookFirstContent.offset().top,
                left: $bookFirstContent.offset().left
            });
            //.position({
            //    my: "left top",
            //    at: "left top",
            //    of: $bookFirstContent
            //});
        var $divSearchNoResultsContent = $("<div id='" + contentId + "'>" + message + "</div>");
        $divSearchNoResultsContent.appendTo($("#divSearchResults"));
        $divSearchNoResultsContent.position({
            my: "center center",
            at: "center center",
            of: $divNoSearchResults
        });

        $divNoSearchResults
            .css({ "opacity": "0" })
            .stop(true, true)
            .animate({ "opacity": "0.8" }, { queue: true, duration: 1000 });

        $divSearchNoResultsContent
            .css({ "opacity": "0" })
            .stop(true, true)
            .animate({ "opacity": "1" }, { queue: true, duration: 1000 });

        if (fadeout) {
            hideSearchMessage(containerId, contentId, duration, delay);
        }
    }

    function hideSearchMessage(containerId, contentId, duration, delay) {
        duration = duration !== 0 && !duration ? 1000 : duration;
        delay = delay !== 0 && !delay ? 1000 : delay;
        var $divNoSearchResults = $("#" + containerId);
        var $divSearchNoResultsContent = $("#" + contentId);

        $divNoSearchResults
            .delay(delay)
            .animate({ "opacity": "0" }, { queue: true, duration: duration, complete: function () { $divNoSearchResults.remove(); } });
        $divSearchNoResultsContent
            .delay(delay)
            .animate({ "opacity": "0" }, { queue: true, duration: duration, complete: function () { $divSearchNoResultsContent.remove(); } });
    }

    function toggleSearchResultsSpinner(option) {
        var containerId = "divSearchResultsSpinnerContainer";
        var contentId = "divSearchResultsSpinnerContent";
        var spinnerBgImage = "url('" + siteroot + "Images/Loading/loading3.gif')";

        if (option === "show") {
            hideSearchMessage("divNoSearchResults", "divSearchNoResultsContent", 0, 0);
            $("#" + containerId).stop(true, true).remove();
            $("#" + contentId).stop(true, true).remove();

            var $bookFirstContent = $("#divListBooks .book_row").first().children().first(".book_content");
            //$bookFirstContent.css({ "background-color": "green"});
            var $divContainer = $("<div id='" + containerId + "'></div>");
            $divContainer.appendTo($("#Main"));
            $divContainer
                .css({
                    "opacity": "0",
                    "position": "absolute",
                    "background-color": "#202020",
                    "z-index": "5",
                    "width": ($bookFirstContent.outerWidth() * 2 + 10) + "px",
                    "height": $bookFirstContent.outerHeight() / 2
                })
                .position({
                    my: "left top",
                    at: "left top",
                    of: $bookFirstContent
                });

            var $divContent = $("<div id='" + contentId + "'></div>");
            $divContent.appendTo($("#Main"));
            $divContent
                .css({
                    "opacity": "0",
                    "position": "absolute",
                    "width": ($bookFirstContent.outerWidth() * 2 + 10) + "px",
                    "height": $bookFirstContent.outerHeight() / 2 - 20,
                    "z-index": "6",
                    "background-position": "center center",
                    //"background-color": "blue",
                    "background-repeat": "no-repeat",
                    "background-image": spinnerBgImage,
                    "-ms-background-size": "contain",
                    "background-size": "contain"
                })
                .position({
                    my: "center center",
                    at: "center center",
                    of: $divContainer
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
                    complete: function() {
                        $(this).remove();
                    }
                });

            $("#" + contentId)
                .animate({
                    "opacity": "0"
                }, {
                    queue: false,
                    duration: 250,
                    complete: function() {
                        $(this).remove();
                    }
                });
        }
        else {
            alert("toggleSearchResultsSpinner - podana opcja jest nieprawidłowa. ");
        }
    }

    function updateResultsCounter(resultsCounter) {
        $("#divSearchResults").children(".div_results_counter").remove();
        var $bookFirstContent = $("#divListBooks .book_row").first().children().first(".book_content");
        var $divResultsCounter = $("<div class='div_results_counter'></div>");
        $divResultsCounter.appendTo($("#divSearchResults"));
        $divResultsCounter
            .css({
                "opacity": "1",
                "position": "absolute",
                "width": "150px",
                "height": "60px",
                "z-index": "3",
                "background-position": "center center",
                //"background-color": "blue",
                "background-repeat": "no-repeat",
                //"border": "1px solid #FFFFFF",
                "-ms-background-size": "contain",
                "background-size": "contain",
                "-webkit-box-sizing": "border-box",
                "-moz-box-sizing": "border-box",
                "box-sizing": "border-box",
                "line-height": "60px",
                "text-align": "center",
                "vertical-align": "middle",
                "font-size": "24px"
            })
            .position({
                my: "center top",
                at: "right-" + ($bookFirstContent.outerWidth() + 10 + 10 / 2) + " top",
                of: $(".books_scrollbar").first()
            });

        $divResultsCounter.text(resultsCounter);

        $divResultsCounter.clone().appendTo("#divSearchResults").position({
            my: "center top",
            at: "left+" + ($bookFirstContent.outerWidth() + 10 + 10 / 2) + " top",
            of: $(".books_scrollbar").last()
        });;
    }

    /**
     * Przypisuje Id do divów z wynikami wyszukiwania i zwraca ich tablicę
     * @param {string} currClass - Klasa bazowa, z której będzie utworzone Id
     * @param {number} lowB - (opcjonalnie) Dolna granica numeracji
     * @param {number} highB - (opcjonalnie) Górna granica numeracji
     * @returns {Object[]} - Zwraca tablicę divów, które otrzymały Id
     */
    function assignSearchDiv(currClass, lowB, highB) {
        var arr = [];
        var elNum = 0;

        $("." + currClass).each(function (i, el) {
            if ((i >= lowB || !lowB) && (i <= highB || !highB)) {
                $(el).attr("id", currClass + "_" + elNum++);
                arr.push(el);
            }
            else {
                $(el).addClass("searchdiv_to_delete");
                $(el).attr("id", "");
            }
        });
        return arr;
    }

    /**
     * Obiekt reprezentujący górne i dolne granice numeracji divów
     * @typedef {Object} BoundaryArguments
     * @property {Number} lowBoundary - dolna granica numeracji divów
     * @property {Number} highBoundary - górna granica numeracji divów
    */
    /**
     * Zwraca w formie obiektu JSON wszystkie divy, wszystkich klas, którym, nadano Id
     * @param {BoundaryArguments} args - granice nadawania Id divom
     * @returns {Object} - obiekt JSON będący reprezentacją wszystkich divów, wszystkich klas, którym nadano Id
     */
    function getSearchDivs(args) {
        args = args || {};
        var lowB = args.lowBoundary || null;
        var highB = args.highBoundary || null;

        var searchResultBackgrounds = assignSearchDiv("searchresult_background", lowB, highB);
        var searchResultContentBackgrounds = assignSearchDiv("searchresult_content_background", lowB, highB);
        var searchResultContainers = assignSearchDiv("searchresult_container", lowB, highB);
        var searchResultCovers = assignSearchDiv("searchresult_cover", lowB, highB);
        var searchResultAdditionDates = assignSearchDiv("searchresult_item_additiondate", lowB, highB);
        var searchResultDescriptions = assignSearchDiv("searchresult_item_description", lowB, highB);

        return {
            searchResultBackgrounds: searchResultBackgrounds,
            searchResultContentBackgrounds: searchResultContentBackgrounds,
            searchResultContainers: searchResultContainers,
            searchResultAdditionDates: searchResultAdditionDates,
            searchResultCovers: searchResultCovers,
            searchResultDescriptions: searchResultDescriptions
        };
    }

    function bindSearchHoverEvents(searchResultCover, searchResultContainer, searchResultContentBackground, searchResultAdditionDate, searchResultDescription, hoverDiff, duration, initContPosTop, initBgPosTop, initBgHeight, initOpacity, descriptionHeight) {
        $(searchResultCover).off();

        var initCoverHeight = $(searchResultCover).outerHeight();

        $(searchResultCover).on("mouseenter", function () {
            var curr = searchResultContainer;
            $(curr).find(".searchresult_item_showmore").stop().slideDown(duration);
            $(curr).stop().animate({ 'top': initContPosTop - hoverDiff }, { queue: false, duration: duration });
            $(searchResultContentBackground).stop()
                .animate({ 'top': initBgPosTop - hoverDiff }, { queue: false, duration: duration })
                .animate({ 'height': initBgHeight + hoverDiff }, { queue: false, duration: duration })
                .animate({ 'opacity': "0.8" }, { queue: false, duration: duration });
            $(searchResultAdditionDate).stop().animate({ 'opacity': "0.7" }, { queue: false, duration: duration });
            $(searchResultDescription).stop().animate({ 'opacity': "1" }, { queue: false, duration: duration }).slideDown({ queue: false, duration: duration });
            $(searchResultCover).stop().animate({ 'height': initCoverHeight + descriptionHeight }, { queue: false, duration: duration });
        });

        $(searchResultCover).on("mouseleave", function () {
            var curr = searchResultContainer;
            $(curr).find(".searchresult_item_showmore").stop().slideUp(duration);
            $(curr).stop().animate({ 'top': initContPosTop }, { queue: false, duration: duration });
            $(searchResultContentBackground).stop()
                .animate({ 'top': initBgPosTop }, { queue: false, duration: duration })
                .animate({ 'height': initBgHeight }, { queue: false, duration: duration })
                .animate({ 'opacity': initOpacity }, { queue: false, duration: duration });
            $(searchResultAdditionDate).stop().animate({ 'opacity': "0" }, { queue: false, duration: duration });
            $(searchResultDescription).stop().animate({ 'opacity': "0" }, { queue: false, duration: duration }).slideUp({ queue: false, duration: duration });
            $(searchResultCover).stop().animate({ 'height': initCoverHeight }, { queue: false, duration: duration });
        });
    }

    // Formatuj pojedyczny wynik wyszukiwania
    function formatSingleSearchResult($outerContainer, length, searchResultBackground, searchResultContentBackground, searchResultContainer, searchResultCover, searchResultAdditionDate, searchResultDescription, bookNum, bindEvents) {
        if (bookNum < length) {

            var margin = 5;

            // Background

            $(searchResultBackground).css({
                "width": $outerContainer.outerWidth() + "px",
                "height": $outerContainer.outerHeight() + "px"
            });
            $(searchResultBackground).position({
                my: "left top",
                at: "left top",
                of: $outerContainer,
                collision: "none"
            });

            // Content

            $(searchResultContainer).css({
                "width": ($(searchResultBackground).innerWidth() - 2 * margin) + "px"
            });

            var hoveredHeight = $(searchResultContainer).outerHeight();
            $(searchResultContainer).find(".searchresult_item_showmore").hide();
            //$(searchResultDescription).show();
            
            //$(searchResultDescription).hide();
            var unhoveredHeight = $(searchResultContainer).outerHeight();

            $(searchResultContainer).position({
                my: "left bottom",
                at: "left+5 bottom-5",
                of: $outerContainer,
                collision: "none"
            });

            // Content Background

            $(searchResultContentBackground).css({
                "width": ($(searchResultContainer).innerWidth() + 2 * margin) + "px",
                "height": ($(searchResultContainer).innerHeight() + 2 * margin) + "px"
            });
            $(searchResultContentBackground).position({
                my: "left bottom",
                at: "left bottom",
                of: $outerContainer,
                collision: "none"
            });

            // Content - Addition Date (not part of container)

            $(searchResultAdditionDate).css({
                "width": "150px",
                "border-left": "1px solid blue",
                "opacity": "0"
            });

            $(searchResultAdditionDate).position({
                my: "right top",
                at: "right top",
                of: $(searchResultBackground),
                collision: "none"
            });

            // Cover

            $(searchResultCover).css({
                "width": $outerContainer.outerWidth() + "px",
                "height": $outerContainer.outerHeight() + "px"
            });
            $(searchResultCover).position({
                my: "left top",
                at: "left top",
                of: $outerContainer,
                collision: "none"
            });

            // Description

            $(searchResultDescription).css({
                "width": $outerContainer.outerWidth() + "px",
                "opacity": "0"
            });
            $(searchResultDescription).position({
                my: "left top",
                at: "left bottom",
                of: $outerContainer,
                collision: "none"
            });

            var descriptionHeight = $(searchResultDescription).outerHeight(); // wartość descriptionHeight musi być pobierana w tym miejscu, bo dopiero tutaj div jest widoczny i ma ustawioną ostateczną szerokość

            $(searchResultDescription).hide();

            // Events

            var hoverDiff = hoveredHeight - unhoveredHeight;
            var duration = 250;
            var initContPosTop = $(searchResultContainer).position().top;
            var initBgPosTop = $(searchResultContentBackground).position().top;
            var initBgHeight = $(searchResultContentBackground).outerHeight();
            var initOpacity = $(searchResultContentBackground).css("opacity");
            //var initBgSize = $(searchResultBackground).css("background-size");

            if (bindEvents) {
                bindSearchHoverEvents(searchResultCover, searchResultContainer, searchResultContentBackground, searchResultAdditionDate, searchResultDescription, hoverDiff, duration, initContPosTop, initBgPosTop, initBgHeight, initOpacity, descriptionHeight);
            }
        }
    }

    function scrollSearchResults(scrollDir) {
        $(".book_row .book_content").each(function(i, el) {
            $("<div class='event_blocker'></div>").css({
                "position": "absolute",
                "width": $(el).outerWidth() + 20,
                "height": $(el).outerHeight() + 20,
                //"background-color": "blue",
                //"opacity": "0.4",
                "z-index": "20"
            }).appendTo($(el)).position({
                my: "left-10 top-10",
                at: "left top",
                of: $(el),
                collision: "none"
            });
        });

        $(".searchresult_cover").eventPause("pause"); // musi być natychmiast po kliknięciu, żeby żaden cymbał nie najechał wyniku myszą w czasie postbacku do serwera
        disableScrollEvents();
        disableSearchEvents();
        toggleSearchResultsSpinner("show");
        toggleSearchFieldSpinner("show");

        var currValues = {
            searchterm: $("#txtSearch").val(),
            includetitle: $("#cbIncludeTitle").prop("checked"),
            includeauthor: $("#cbIncludeAuthor").prop("checked"),
            includecategory: $("#cbIncludeCategory").prop("checked"),
            includedescription: $("#cbIncludeDescription").prop("checked"),
            sortby: $("#ddlSortBy").first("option:selected").val(),
            sortorder: $("#ddlSortOrder").first("option:selected").val(),
            howmuchtake: 12,
            howmuchskip: scrollDir.toLowerCase() === "scrolldown" ? 2 : -2
        }

        var validation = validateSearchProperties({
            props: getAvalPropertyNames(keysToLowerCase(searchAvalProperties)),
            currvalues: currValues
        });

        if (validation.validationresults.all.output) {
            $.ajax({
                async: true,
                url: siteroot + "Book/GetScrollSearchResults",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    SearchTerm: validation.validatedvalues.searchterm,
                    IncludeTitle: validation.validatedvalues.includetitle,
                    IncludeAuthor: validation.validatedvalues.includeauthor,
                    IncludeCategory: validation.validatedvalues.includecategory,
                    IncludeDescription: validation.validatedvalues.includedescription,
                    SortBy: validation.validatedvalues.sortby,
                    SortOrder: validation.validatedvalues.sortorder,
                    HowMuchSkip: validation.validatedvalues.howmuchskip,
                    HowMuchTake: validation.validatedvalues.howmuchtake,
                    ScrollDirection: scrollDir
                }),
                dataType: "json",
                success: function (data) {
                    if (data.ResultsCount <= 0) {
                        refreshTooltip({
                            isValidatedBy: validation,
                            areAnyResults: false
                        });
                        $("#txtSearch").tooltip("open");

                        if (data.ResultsCount === -1) {
                            showSearchMessage("divNoSearchResults", "divSearchNoResultsContent", "Baza danych nie odpowiada", false);
                        } else if (data.ResultsCount === -2) {
                            showSearchMessage("divNoSearchResults", "divSearchNoResultsContent", "Sesja jest pusta lub nieprawidłowa", false);
                        } else {
                            showSearchMessage("divNoSearchResults", "divSearchNoResultsContent", "Nie ma więcej wyników", true);
                        }
                        enableSearchEvents();
                        enableScrollEvents(); // rebind w else jest po animacjach, w funkcji formatScrollResults
                        $(".searchresult_cover").eventPause("active");
                        $(".event_blocker").remove();
                    }
                    else {
                        refreshTooltip({
                            isValidatedBy: validation,
                            areAnyResults: true
                        });
                        $("#txtSearch").tooltip("close");
                        $("#txtSearch").tooltip("disable");

                        var sSearchScrollResultsView = data.PartialView.replace(/(\r\n|\n|\r|\s\s+)/gm, "");
                        var searchScrollResultsView = $.parseHTML(sSearchScrollResultsView);

                        // ScrollResults
                        // APPEND i ANIMUJ

                        if (scrollDir.toLowerCase() === "scrolldown") {
                            $(searchScrollResultsView).appendTo($("#divSearchResults"));
                        }
                        else {
                            $(searchScrollResultsView).prependTo($("#divSearchResults"));
                        }
                        // ReSharper disable once FunctionsUsedBeforeDeclared
                        formatScrollResults(scrollDir); // nie ma eventPause, rebind eventów dla nowych elementów jest w tej funkcji
                        updateResultsCounter(data.ResultsCounter);
                        //alert(data.ResultsCount);
                    }

                    toggleSearchResultsSpinner("hide");
                    toggleSearchFieldSpinner("hide");
                },
                error: function (err) {
                    toggleSearchResultsSpinner("hide");
                    toggleSearchFieldSpinner("hide");
                    $(".searchresult_cover").eventPause("active");
                    $(".event_blocker").remove();
                    enableSearchEvents();
                    enableScrollEvents();
                    $("html").html(err.responseText);
                }
            });
        }
        else {
            var isHovered = !!$("#txtSearch").filter(function () { // sprawdź czy kursor jest nad elementem
                return $(this).is(":hover");
            }).length;

            refreshTooltip({
                isValidatedBy: validation,
                areAnyResults: false
            });
            if (isHovered) {
                $("#txtSearch").tooltip("open");
            }
            enableSearchEvents();
            enableScrollEvents(); // rebind w if jest po animacjach, w funkcji formatScrollResults
            $(".searchresult_cover").eventPause("active");
            $(".event_blocker").remove();
            toggleSearchResultsSpinner("hide");
            toggleSearchFieldSpinner("hide");
        }
    }

    function disableSearchEvents() {
        $("#txtSearch, #btnSearchSubmit, #cbIncludeTitle, #cbIncludeAuthor, #cbIncludeCategory, #cbIncludeDescription").prop("disabled", true);
        $("#ddlSortBy, #ddlSortOrder").selectmenu("option", "disabled", true);
        //$("#txtSearch, #btnSearchSubmit, #cbIncludeTitle, #cbIncludeAuthor, #cbIncludeCategory, #cbIncludeDescription").off();
    }

    function enableSearchEvents() {
        disableSearchEvents();
        $("#txtSearch, #btnSearchSubmit, #cbIncludeTitle, #cbIncludeAuthor, #cbIncludeCategory, #cbIncludeDescription").prop("disabled", false);
        $("#ddlSortBy, #ddlSortOrder").selectmenu("option", "disabled", false);
    }

    function disableScrollEvents() {
        $(".div_books_scrollup, .div_books_scrolldown")
            .off().stop().animate({ "opacity": "0.6" }, 500);
        $(".div_books_scrollup, .div_books_scrolldown").prop("disable", true);
    }

    function enableScrollEvents() {
        disableScrollEvents();
        $(".div_books_scrollup, .div_books_scrolldown").prop("disable", false);

        $(".div_books_scrollup, .div_books_scrolldown").on("mouseenter", function () {
            $(this).stop().animate({ "opacity": "1" }, 500);
        });

        $(".div_books_scrollup, .div_books_scrolldown").on("mouseleave", function () {
            $(this).stop().animate({ "opacity": "0.6" }, 500);
        });

        $(".div_books_scrollup").on("click", function () {
            scrollSearchResults("scrollup");
        });

        $(".div_books_scrolldown").on("click", function () {
            scrollSearchResults("scrolldown");
        });
    }

    // Formatuj wyniki po wyszukiwaniu
    function formatSearchResults() {
        var $bookRow = $("#divListBooks .book_row");
        var bookNum = 0;
        var divs = getSearchDivs();
        var length = divs.searchResultContainers.length;

        var arrScrollBars = [];

        $(".books_scrollbar").empty().each(function (i, el) {
            arrScrollBars.push(el);
        });

        $bookRow.each(function (i, el) {
            var $leftBookContent = $(el).children().first(".book_content");
            var $rightBookContent = $(el).children().last(".book_content");

            formatSingleSearchResult($leftBookContent, length, divs.searchResultBackgrounds[bookNum], divs.searchResultContentBackgrounds[bookNum], divs.searchResultContainers[bookNum], divs.searchResultCovers[bookNum], divs.searchResultAdditionDates[bookNum], divs.searchResultDescriptions[bookNum], bookNum++, true);
            formatSingleSearchResult($rightBookContent, length, divs.searchResultBackgrounds[bookNum], divs.searchResultContentBackgrounds[bookNum], divs.searchResultContainers[bookNum], divs.searchResultCovers[bookNum], divs.searchResultAdditionDates[bookNum], divs.searchResultDescriptions[bookNum], bookNum++, true);

            switch (i) {
                case 0:
                {
                    $("<div id=\"divBooksScrollUpTop\" class=\"div_books_scrollup\"></div>").appendTo($(arrScrollBars[0])).css({
                        /*"border": "1px solid red", */"box-sizing": "border-box", /*"position": "absolute",*/ "z-index": "3"//,
                    }).position({
                        my: "center bottom",
                        at: "left+" + (($(arrScrollBars[0]).outerWidth() - $leftBookContent.outerWidth() * 2 - 10 * 3) + 10 + $leftBookContent.outerWidth() / 2) + " bottom",
                        of: $(arrScrollBars[0])
                    });

                    $("<div id=\"divBooksScrollDownTop\" class=\"div_books_scrolldown\"></div>").appendTo($(arrScrollBars[0])).css({
                        /*"border": "1px solid green", */"box-sizing": "border-box", /*"position": "absolute",*/ "z-index": "3"//,
                    }).position({
                        my: "center bottom",
                        at: "left+" + (($(arrScrollBars[0]).outerWidth() - $leftBookContent.outerWidth() * 2 - 10 * 3) + 10 * 2 + $rightBookContent.outerWidth() + $leftBookContent.outerWidth() / 2) + " bottom",
                        of: $(arrScrollBars[0])
                    });
                    break;
                }
                case 5: { // numery w casie oznaczają cały wiersz, więc szukamy wiersza 6 - 1
                    $("<div id=\"divBooksScrollUpBottom\" class=\"div_books_scrollup\"></div>").appendTo($(arrScrollBars[1])).css({
                        /*"border": "1px solid yellow", */"box-sizing": "border-box", /*"position": "absolute",*/ "z-index": "3"//,
                    }).position({
                        my: "center top",
                        at: "left+" + (10 + $leftBookContent.outerWidth() / 2) + " top",
                        of: $(arrScrollBars[1])
                    });

                    $("<div id=\"divBooksScrollDownBottom\" class=\"div_books_scrolldown\"></div>").appendTo($(arrScrollBars[1])).css({
                        /*"border": "1px solid blue", */"box-sizing": "border-box", /*"position": "absolute",*/ "z-index": "3"//,
                    }).position({
                        my: "center top",
                        at: "left+" + (10 * 2 + $rightBookContent.outerWidth() + $leftBookContent.outerWidth() / 2) + " top",
                        of: $(arrScrollBars[1])
                    });
                    enableScrollEvents();
                    break;
                }
                default: {
                    break;
                }
            }
        });

        // Ustaw z-indeksy elementów

        $.each(divs.searchResultCovers, function (i, el) {
            $(el).css({ "z-index": 16 - i }); // chcę żeby ostatni div miał z-index = 5, a skoro iteracja jest od 0, to trzeba zacząć od 16, a nie 17
        });
    }

    // Formatuj wyniki po przewijaniu
    function formatScrollResults(scrollDir) {
        var $bookRow = $("#divListBooks .book_row");
        var $bookContents = [];
        var bookNum = null;
        var initBookNum = null;
        $bookRow.each(function (i, el) {
            $bookContents.push($(el).children().first(".book_content"));
            $bookContents.push($(el).children().last(".book_content"));
        });
        var lowB = scrollDir.toLowerCase() === "scrolldown" ? 2 : 0;
        var highB = scrollDir.toLowerCase() === "scrolldown" ? 13 : 11;
        var divs = getSearchDivs({
            lowBoundary: lowB,
            highBoundary: highB
        });
        var length = divs.searchResultContainers.length;
        var initCoverHeight = $bookContents[0].outerHeight();

        if (scrollDir.toLowerCase() === "scrolldown") {
            bookNum = 10;
        }
        else {
            bookNum = 0;
        }
        initBookNum = bookNum;

        formatSingleSearchResult($bookRow.last().children().first(".book_content"), length, divs.searchResultBackgrounds[bookNum], divs.searchResultContentBackgrounds[bookNum], divs.searchResultContainers[bookNum], divs.searchResultCovers[bookNum], divs.searchResultAdditionDates[bookNum], divs.searchResultDescriptions[bookNum], bookNum++, false); // musi być inkrementacja, bo kolejne wywołanie bierze zaaktualizowaną wartość dla wszystkich argumentów, nie tylko dla bookNum
        formatSingleSearchResult($bookRow.last().children().last(".book_content"), length, divs.searchResultBackgrounds[bookNum], divs.searchResultContentBackgrounds[bookNum], divs.searchResultContainers[bookNum], divs.searchResultCovers[bookNum], divs.searchResultAdditionDates[bookNum], divs.searchResultDescriptions[bookNum], bookNum++, false);

        // odbindowanie eventów wywołane przed metodą ajaxa

        bookNum = initBookNum; // resetuj wartość bookNum

        // Ukryj na początku 2 dodane wyniki

        $.each(divs, function (i, el) {
            $(el[bookNum]).css({ "opacity": "0" });
            $(el[bookNum + 1]).css({ "opacity": "0" });
        });

        // Wyłącz animacje

        $.each(divs, function (i, el) {
            for (var j = 0; j < $bookContents.length; j++) {
                if (i !== bookNum && i !== bookNum + 1) {
                    $(el[j]).stop(true, true);
                }
            }
        });
        var initDateOpacity = $(divs.searchResultAdditionDates[0]).css("opacity");
        var initDescriptionOpacity = $(divs.searchResultDescriptions[0]).css("opacity");

        $(".searchresult_cover").eventPause("active").off(); // wyłączyć pauzę jeśli wiadomo, że eventy będa usuwane

        // Fade Out 2 niepotrzebne wyniki

        var duration = 500;

        $(".searchdiv_to_delete")
            .animate({
                "opacity": "0"
            }, {
                queue: true,
                duration: duration,
                complete: function () {
                    //$(this).remove(); // Na koniec
                    // dalsza animacja
                }
            });

        // Animuj Wyniki

        $.each(divs, function (i, el) { // el - typ divu, bookNum - numer divu
            for (var j = 0; j < $bookContents.length; j++) {
                if (i !== bookNum && i !== bookNum + 1) { // nie dotyczy nowych dwóch wyników

                    // Background

                    if ($(el[j]).hasClass("searchresult_background")) {
                        $(el[j]).position({
                            my: "left top",
                            at: "left top",
                            of: $bookContents[j],
                            collision: "none",
                            using: function(pos) {
                                $(this).stop(true, true).animate(pos, { duration: duration });
                            }
                        });
                    }
                    // Content

                    else if ($(el[j]).hasClass("searchresult_container")) {
                        $(el[j]).position({
                            my: "left bottom",
                            at: "left+5 bottom-5",
                            of: $bookContents[j],
                            collision: "none",
                            using: function(pos) {
                                $(this).stop(true, true).animate(pos, { duration: duration });
                            }
                        });
                    }
                    // Content Background

                    else if ($(el[j]).hasClass("searchresult_content_background")) {
                        $(el[j]).position({
                            my: "left bottom",
                            at: "left bottom",
                            of: $bookContents[j],
                            collision: "none",
                            using: function(pos) {
                                $(this).stop(true, true).animate(pos, { duration: duration });
                            }
                        });
                    }
                    // Content - Addition Date (not part of container)

                    else if ($(el[j]).hasClass("searchresult_item_additiondate")) {
                        $(el[j]).css({ "opacity": "0" }).position({
                            my: "right top",
                            at: "right top",
                            of: $bookContents[j],
                            collision: "none",
                            using: function(pos) {
                                $(this).stop(true, true).animate(pos, {
                                    duration: duration,
                                    complete: function() {
                                        $(this).css({ "opacity": initDateOpacity });
                                    }
                                });
                            }
                        });
                    }
                    // Description (not part of container)

                    else if ($(el[j]).hasClass("searchresult_item_description")) {
                        $(el[j]).css({ "opacity": "0" }).show().position({
                            my: "left top",
                            at: "left bottom",
                            of: $bookContents[j],
                            collision: "none",
                            using: function(pos) {
                                $(this).stop(true, true).animate(pos, {
                                    duration: duration,
                                    complete: function() {
                                        $(this).css({ "opacity": initDescriptionOpacity }).hide();
                                    }
                                });
                            }
                        });
                    }
                    // Cover

                    else if ($(el[j]).hasClass("searchresult_cover")) {
                        $(el[j]).position({
                            my: "left top",
                            at: "left top",
                            of: $bookContents[j],
                            collision: "none",
                            using: function (pos) {
                                $(this).stop(true, true).css({ "height": initCoverHeight }).animate(pos, duration,
                                (function (j) {
                                    return function () {
                                        var tempJ = j;
                                        $(divs.searchResultContainers[tempJ]).find(".searchresult_item_showmore").show();
                                        var hoveredHeight = $(divs.searchResultContainers[tempJ]).outerHeight();
                                        $(divs.searchResultContainers[tempJ]).find(".searchresult_item_showmore").hide();
                                        var unhoveredHeight = $(divs.searchResultContainers[tempJ]).outerHeight();

                                        $(divs.searchResultDescriptions[tempJ]).show();
                                        var descriptionHeight = $(divs.searchResultDescriptions[tempJ]).outerHeight(); // div jest sformatowany włącznie z szerokościa, przy wyszukiwaniu, przy scrollowaniu operuje na gotowych elementach, dlatego descripyioon height ma właściwą wartość
                                        $(divs.searchResultDescriptions[tempJ]).hide();

                                        var hoverDiff = hoveredHeight - unhoveredHeight;
                                        var dur = 250;
                                        var initContPosTop = $(divs.searchResultContainers[tempJ]).position().top;
                                        var initBgPosTop = $(divs.searchResultContentBackgrounds[tempJ]).position().top;
                                        var initBgHeight = $(divs.searchResultContentBackgrounds[tempJ]).outerHeight();
                                        var initOpacity = 0.7; // $(divs.searchResultContentBackgrounds[tempJ]).css("opacity"); // Nie mogę wziąć z divu, bo dwa pierwsze albo dwa ostatnie będą ukryte
                                        //var initBgSize = $(divs.searchResultBackgrounds[tempJ]).css("background-size");

                                        //alert($.eventReport(divs.searchResultCovers[tempJ]));
                                        $(divs.searchResultCovers[tempJ]).eventPause("pause");
                                        bindSearchHoverEvents(divs.searchResultCovers[tempJ], divs.searchResultContainers[tempJ], divs.searchResultContentBackgrounds[tempJ], divs.searchResultAdditionDates[tempJ], divs.searchResultDescriptions[tempJ], hoverDiff, dur, initContPosTop, initBgPosTop, initBgHeight, initOpacity, descriptionHeight);
                                    } // ReSharper disable once ClosureOnModifiedVariable
                                })(j));
                            }
                        });
                    }
                }
            }

        });

        // Ustaw z-indeksy elementów

        $.each(divs.searchResultCovers, function (i, el) {
            $(el).css({ "z-index": 16 - i }); // chcę żeby ostatni div miał z-index = 5, a skoro iteracja jest od 0, to trzeba zacząć od 16, a nie 17
        });

        // Fade In nowe Wyniki

        var fadeInDuration = duration;
        var transparentOpacity = "0.7";

        if (bookNum + 1 < length) {
            $(divs.searchResultBackgrounds[bookNum + 1]).stop(true, true).animate({ "opacity": "1" }, { duration: fadeInDuration });
            $(divs.searchResultContentBackgrounds[bookNum + 1]).stop(true, true).animate({ "opacity": transparentOpacity }, { duration: fadeInDuration });
            $(divs.searchResultContainers[bookNum + 1]).stop(true, true).animate({ "opacity": "1" }, { duration: fadeInDuration });
            $(divs.searchResultAdditionDates[bookNum + 1]).stop(true, true).animate({ "opacity": "0" }, { duration: fadeInDuration });
            $(divs.searchResultDescriptions[bookNum + 1]).slideUp(0).stop(true, true).animate({ "opacity": "1" }, { duration: fadeInDuration });
            $(divs.searchResultCovers[bookNum + 1]).stop(true, true).animate({ "opacity": "0.2" }, { duration: fadeInDuration });
        }

        $(divs.searchResultBackgrounds[bookNum]).stop(true, true).animate({ "opacity": "1" }, { duration: fadeInDuration });
        $(divs.searchResultContentBackgrounds[bookNum]).stop(true, true).animate({ "opacity": transparentOpacity }, { duration: fadeInDuration });
        $(divs.searchResultContainers[bookNum]).stop(true, true).animate({ "opacity": "1" }, { duration: fadeInDuration });
        $(divs.searchResultAdditionDates[bookNum]).stop(true, true).animate({ "opacity": "0" }, { duration: fadeInDuration });
        $(divs.searchResultDescriptions[bookNum]).hide().stop(true, true).animate({ "opacity": "1" }, { duration: fadeInDuration });
        $(divs.searchResultCovers[bookNum]).stop(true, true).animate({ "opacity": "0.2" }, {
            duration: fadeInDuration, queue: true, complete: function () {
                $(".searchdiv_to_delete").remove();

                enableSearchEvents();
                enableScrollEvents();
                $(".searchresult_cover").eventPause("active");
                $(".event_blocker").remove();
            }
        });

    }

    function searchBooks() {
        // pokaż spinnery
        disableScrollEvents();
        toggleSearchResultsSpinner("show");
        toggleSearchFieldSpinner("show");

        var currValues = {
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

        // DEBUGOWANIE

        var key;
        var $divDebugSearch = $("<div id='divDebug_Search'></div>");
        var $divDebug = $("#divDebug");
        if (debugMode) {
            $("#divDebug_Search").remove();
            
            $divDebugSearch.html("DEBUG - SEARCH <br /><br />");
            $divDebugSearch.append("currValues: <br /><br />");

            for (key in currValues) {
                if (currValues.hasOwnProperty(key)) {
                    $divDebugSearch.append(key + " -> " + currValues[key] + "<br />");
                }
            }
        }

        // ===========

        var validation = validateSearchProperties({
            props: getAvalPropertyNames(keysToLowerCase(searchAvalProperties)),
            currvalues: currValues,
            getchangedagainst: oldValues
        });

        // DEBUGOWANIE

        if (debugMode) {
            $divDebugSearch.append("<br />validatedValues: <br /><br />");

            for (key in validation.validatedvalues) {
                if (validation.validatedvalues.hasOwnProperty(key)) {
                    $divDebugSearch.append(key + " -> " + validation.validatedvalues[key] + "<br />");
                }
            }

            $divDebugSearch.appendTo($divDebug);
        }

        // ===========

        oldValues = currValues;

        if (validation.validationresults.all.output) {
            $.ajax({
                async: true,
                url: siteroot + "Book/GetSearchResults",
                method: "post",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    SearchTerm: validation.validatedvalues.searchterm,
                    IncludeTitle: validation.validatedvalues.includetitle,
                    IncludeAuthor: validation.validatedvalues.includeauthor,
                    IncludeCategory: validation.validatedvalues.includecategory,
                    IncludeDescription: validation.validatedvalues.includedescription,
                    SortBy: validation.validatedvalues.sortby,
                    SortOrder: validation.validatedvalues.sortorder,
                    HowMuchSkip: validation.validatedvalues.howmuchskip,
                    HowMuchTake: validation.validatedvalues.howmuchtake
                }),
                dataType: "json",
                success: function (data) { 
                    if (data.ResultsCount <= 0) {
                        refreshTooltip({
                            isValidatedBy: validation,
                            areAnyResults: false
                        });
                        $("#txtSearch").tooltip("open");

                        //var $bookFirstContent = $("#divListBooks .book_row").first().children().first(".book_content");

                        $("#divSearchResults").empty();
                        if (data.ResultsCount === -1) {
                            showSearchMessage("divNoSearchResults", "divSearchNoResultsContent", "Baza danych nie odpowiada", false);
                        } else {
                            showSearchMessage("divNoSearchResults", "divSearchNoResultsContent", "Brak Rezultatów Wyszukiwania", false);
                        }
                        enableScrollEvents(); // rebind w else jest w funkcji formatSearchResults
                        $("#divSearchResults").children(".div_results_counter").remove(); // usuń licznik wyników
                    }
                    else {
                        refreshTooltip({
                            isValidatedBy: validation,
                            areAnyResults: true
                        });
                        $("#txtSearch").tooltip("close");
                        $("#txtSearch").tooltip("disable");

                        var sSearchResultsView = data.PartialView.replace(/(\r\n|\n|\r|\s\s+)/gm, "");
                        var searchResultsView = $.parseHTML(sSearchResultsView);
                        $("#divSearchResults").empty();
                        $(searchResultsView).appendTo($("#divSearchResults"));
                        formatSearchResults();
                        updateResultsCounter(data.ResultsCounter);
                    }

                    toggleSearchResultsSpinner("hide");
                    toggleSearchFieldSpinner("hide");
                },
                error: function (err) {
                    toggleSearchResultsSpinner("hide");
                    toggleSearchFieldSpinner("hide");
                    enableScrollEvents(); // rebind w else jest w funkcji formatSearchResults
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
            toggleSearchResultsSpinner("hide");
            toggleSearchFieldSpinner("hide");
            enableScrollEvents(); // rebind w if jest w funkcji formaySearchResults
        }
    }

    $("#txtSearch").on("keyup /*change*/", function () {
        // po odświeżeniu tooltipa (z Base)

        searchBooks();
    });

    $("#btnSearchSubmit, #cbIncludeTitle, #cbIncludeAuthor, #cbIncludeCategory, #cbIncludeDescription").click(function () { // submit wywoływany po evencie submit (gdzie zatrzymuje go preventDefault) z Base/Index
        searchBooks();
    });

    $("#ddlSortBy").selectmenu({
        width: 200,
        icons: { button: "custom-icon-down-arrow" },
        select: function () { // event, ui
            searchBooks();
        }
    });

    $("#ddlSortOrder").selectmenu({
        width: 200,
        icons: { button: "custom-icon-down-arrow" }, //ui-icon-arrow-1-s
        select: function () { // event, ui
            searchBooks();
        }
    });

    searchBooks(); // musi być po nałożeniu selectmenu na dropdownlisty, bo zmieniają one wysokość, przesuwając całą stronę w dół i pozycja spinnera była by brana według położeń z przed nałożenia menu

    //$.getScript("Scripts/jquery.mobile-1.4.5.js", function () {
    //    alert("Script loaded but not necessarily executed.");
    //});

});