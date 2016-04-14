/// <reference path="../_references.js" />

function toggleAjaxEvents(args) {
    args = args || [];
    var option = args.option || null;

    var $divCoverDnDHandler = $("#divCoverDnDHandler");
    var $divDeleteCover = $("#divDeleteCover");

    if (option === "disable" || option === "enable") {
        $divCoverDnDHandler.off("drop dragenter");
        $divDeleteCover.off("click mouseenter mouseleave");
    }

    if (option === "disable") {
        $("#btnSaveBook").prop("disabled", true);
        $("#btnSave").prop("disabled", true);
        $("#btnCancel").prop("disabled", true);
    } else if (option === "enable") {
        $("#btnSaveBook").prop("disabled", false);
        $("#btnSave").prop("disabled", false);
        $("#btnCancel").prop("disabled", false);
        $divCoverDnDHandler.on("dragenter", function(e) {
            divCoverDnDHandler_DragEnter(e);
        });
        $divCoverDnDHandler.on("drop", function(e) {
            divCoverDnDHandler_Drop(e);
        });
        $divDeleteCover.on("click", function(e) {
            divDeleteCover_Click(e);
            divDeleteCover_MouseLeave(e);
        });
        $divDeleteCover.on("mouseenter", function(e) {
            divDeleteCover_MouseEnter(e);
        });
        $divDeleteCover.on("mouseleave", function(e) {
            divDeleteCover_MouseLeave(e);
        });
    }
}

function btnSaveBook_Click(e) {
    toggleAjaxEvents({
        option: "disable"
    });

    var loaderContainerId = "tableBookEdit";
    var $appendToElement = $("#divBookEditContainer");

    toggleUniversalLoader({
        id: loaderContainerId,
        option: "show",
        loaderWidth: 64,
        loaderHeight: 64,
        appendToElement: $appendToElement
    });

    $.ajax({
        async: true,
        url: siteroot + "Book/UpdateBook",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            book: {
                Id: $.id,
                Title: $("#txtTitle").val(),
                Category: $("#txtCategory").val(),
                Description: $("#taBookDescription").val()
            }
        }),
        dataType: "json",
        success: function (data) {
            var status = (data.Status || "").toLowerCase();
            var message = data.Message;
            var msgColor = status === "success" ? msgColor = "#0b970d" : "#FF5468";

            toggleUniversalLoader({
                id: loaderContainerId,
                option: "hide"
            });

            if (message) {
                toggleUniversalMessage({
                    id: loaderContainerId, // nad jakim elementem jest wyświetlana wiadomość
                    option: "show",
                    fadeout: true,
                    fadetime: 1000,
                    length: 1000,
                    message: message,
                    messageColor: msgColor,
                    appendToElement: $appendToElement // do czego przyłączam
                });
            }

            toggleAjaxEvents({
                option: "enable"
            });
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

function divDeleteCover_Click(e) {
    toggleAjaxEvents({
        option: "disable"
    });

    var loaderContainerId = "tableBookEdit";
    var $appendToElement = $("#divBookEditContainer");

    toggleUniversalLoader({
        id: loaderContainerId,
        option: "show",
        loaderWidth: 64,
        loaderHeight: 64,
        appendToElement: $appendToElement
    });

    $.ajax({
        async: true,
        url: siteroot + "Book/DeleteCover",
        method: "post",
        contentType: "application/json;charset=utf-8",
        data: JSON.stringify({
            id: $.id
        }),
        dataType: "json",
        success: function (data) {
            var status = (data.Status || "").toLowerCase();
            var message = data.Message;
            var d = new Date();
            var msgColor;

            if (status === "success") {
                msgColor = "#0b970d";
                var noImagePath = siteroot + "Data/Books/No_Image_Available.png?" + d.getTime();
                $("#divCover").css({
                    "background-image": "url('" + noImagePath + "')"
                });
                $("#divDeleteCover").off("click mouseenter mouseleave").hide();
            } else {
                msgColor = "#FF5468";
            }

            toggleUniversalLoader({
                id: loaderContainerId,
                option: "hide"
            });

            if (message) {
                toggleUniversalMessage({
                    id: loaderContainerId, // nad jakim elementem jest wyświetlana wiadomość
                    option: "show",
                    fadeout: true,
                    fadetime: 1000,
                    length: 1000,
                    message: message,
                    messageColor: msgColor,
                    appendToElement: $appendToElement // do czego przyłączam
                });
            }

            toggleAjaxEvents({
                option: "enable"
            });
        },
        error: function (err) {
            $("html").html(err.responseText);
        }
    });
}

function divDeleteCover_MouseEnter(e) {
    $(e.target).stop(true, true).animate({
        "opacity": 1
    }, 250);
    $(e.target).parent().stop(true, true).animate({
        "background-color": "rgb(120, 0, 0)"
    }, 250);
}

function divDeleteCover_MouseLeave(e) {
    $(e.target).stop(true, true).animate({
        "opacity": 0.4
    }, 250);
    $(e.target).parent().stop(true, true).animate({
        "background-color": "transparent"
    }, 250);
}

function divCoverDnDHandler_DragEnter(e) {
    e.stopPropagation();
    e.preventDefault();
    $(e.target).css("border", "2px solid #0B85A1");
}

function divCoverDnDHandler_Drop(e) {
    toggleAjaxEvents({
        option: "disable"
    });
    $(e.target).css("border", "2px dotted #0B85A1");
    e.preventDefault();
    var file = e.originalEvent.dataTransfer.files[0];

    handleFileUpload(file, $("#divStatusInfo"));
}

function document_DragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    $("#divCoverDnDHandler").css("border", "2px dotted #0B85A1");
}

var rowCount = 0;
function CreateStatusbar($divStatusInfo) {
    rowCount++;
    var row = "odd";
    if (rowCount % 2 === 0)
        row = "even";
    this.statusbar = $("<div class='statusbar " + row + "'></div>");
    this.filename = $("<div class='filename'></div>").appendTo(this.statusbar);
    this.size = $("<div class='filesize'></div>").appendTo(this.statusbar);
    this.progressBar = $("<div class='progressBar'><div></div></div>").appendTo(this.statusbar);
    this.abort = $("<div class='abort'>Anuluj</div>").appendTo(this.statusbar);
    $divStatusInfo.html(this.statusbar);
    this.percentage = $("<div class='percentage'></div>").appendTo($divStatusInfo);
    this.percentage.offset({
        left: this.progressBar.offset().left,
        top: this.progressBar.offset().top
    });

    positionBackground();
    resizeBackground();

    this.setFileNameSize = function (name, size) {
        var sizeStr = "";
        var sizeKb = size / 1024;
        if (parseInt(sizeKb) > 1024) {
            var sizeMb = sizeKb / 1024;
            sizeStr = sizeMb.toFixed(2) + " MB";
        }
        else {
            sizeStr = sizeKb.toFixed(2) + " KB";
        }

        this.filename.html(name);
        this.size.html(sizeStr);
    }
    this.setProgress = function (progress) {
        var progressBarWidth = progress * this.progressBar.width() / 100;
        this.progressBar.find("div").stop(true, true).animate({ width: progressBarWidth }, 10);
        this.percentage.html(progress + "%");
        if (parseInt(progress) >= 100) {
            this.abort.hide();
        }
    }
    this.setAbort = function (jqxhr) {
        var sb = this.statusbar;
        var perc = this.percentage;
        this.abort.off();
        this.abort.click(function () {
            jqxhr.abort();
            sb.remove();
            perc.remove();
            toggleAjaxEvents({
                option: "enable"
            });
        });
        this.abort.on("mouseenter", function (e) {
            $(e.target).stop(true, true).animate({
                "background-color": "#8f0f08"
            }, 250);
        });
        this.abort.on("mouseleave", function (e) {
            $(e.target).stop(true, true).animate({
                "background-color": "#A8352F"
            }, 250);
        });
    }
}

function handleFileUpload(file, obj) {
    var fd = new FormData();
    fd.append("file", file);
    fd.append("id", $.id);

    var status = new CreateStatusbar(obj); // Ten obiekt pozwoli ustawić postęp wysyłania
    status.setFileNameSize(file.name, file.size);
    sendFileToServer(fd, status);
}

function sendFileToServer(formData, status) {
    var jqXhr = $.ajax({
        xhr: function () {
            var xhrobj = $.ajaxSettings.xhr();
            if (xhrobj.upload) {
                xhrobj.upload.addEventListener("progress", function (event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }
                    status.setProgress(percent);
                }, false);
            }
            return xhrobj;
        },
        url: siteroot + "Book/UploadCover",
        type: "POST",
        contentType: false,
        processData: false,
        cache: false,
        data: formData,
        dataType: "json",
        success: function (data) {
            status.setProgress(100);
            var result = (data.Status || "").toLowerCase();
            var path = data.Path;
            var message = data.Message;
            var msgColor;

            if (result === "success") {
                msgColor = "#0b970d";
                var d = new Date();
                $("#divCover").css({
                    "background-image": "url('" + siteroot + path + "?" + d.getTime() + "')"
                });
            } else {
                msgColor = "#FF5468";
                status.statusbar.remove();
                status.percentage.remove();
            }

            if (message) {
                toggleUniversalMessage({
                    id: "tableBookEdit", // nad jakim elementem jest wyświetlana wiadomość
                    option: "show",
                    fadeout: true,
                    fadetime: 1000,
                    length: 1000,
                    message: message,
                    messageColor: msgColor,
                    appendToElement: $("#divBookEditContainer") // do czego przyłączam
                });
            }

            toggleAjaxEvents({
                option: "enable"
            });
            $("#divDeleteCover").show();
            positionBackground();
            resizeBackground();
        }
    });

    status.setAbort(jqXhr);
}

$(document).ready(function () {

    function displayBookTree() {
        $("#divBookEditTreeContentLoader").remove();
        var $divLoader = $("<div id='divBookEditTreeContentLoader'></div>");
        $("#divBookEditTreeContent").append($divLoader);
        $divLoader.css({
            "height": "100px"
        });

        toggleUniversalLoader({
            id: "divBookEditTreeContentLoader",
            option: "show",
            loaderWidth: 64,
            loaderHeight: 64,
            appendToElement: $("#divBookEditContainer")
        });

        $.ajax({
            async: true,
            url: siteroot + "Book/GetXmlBookContentForGraph",
            method: "post",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                id: $.id
            }),
            dataType: "json",
            success: function (data) {
                var bookContent = resolveReferences(data.BookContent);
                if (bookContent) {
                    renderBookTree({
                        bookContent: bookContent
                    });
                }

                var message = data.Message;
                if (message) {
                    toggleUniversalMessage({
                        id: "divBookEditTreeContentLoader",
                        option: "show",
                        fadeout: false,
                        message: message,
                        messageColor: "#FF5468",
                        appendToElement: $("#divBookEditContainer")
                    });
                } else {
                    $divLoader.remove();
                }

                toggleUniversalLoader({
                    id: "divBookEditTreeContentLoader",
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

    function updateBookTree(args)
    {
        args = args || [];
        var operation = args.operation.toLowerCase() || "none";
        var bookContentPart = args.bookContentPart || "";

        toggleAjaxEvents({
            option: "disable"
        });

        var loaderContainer = operation === "delete" ? "divBookEditTreeContent" : "divBookEditPartContent";
        bookContentPart.Children = null;
        bookContentPart.Parents = null;

        toggleUniversalLoader({
            id: loaderContainer,
            option: "show",
            loaderWidth: 64,
            loaderHeight: 64,
            appendToElement: $("#divBookEditContainer")
        });

        $.ajax({
            async: true,
            url: siteroot + "Book/UpdateXmlBookContentForGraph",
            method: "post",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                id: $.id,
                bookContentPart: bookContentPart,
                operation: operation
            }),
            dataType: "json",
            success: function (data) {
                var bookContent = resolveReferences(data.BookContent);

                toggleUniversalLoader({
                    id: loaderContainer,
                    option: "hide"
                });

                var message = data.Message;
                if (message) {
                    toggleUniversalMessage({
                        id: loaderContainer,
                        option: "show",
                        fadeout: false,
                        message: message,
                        messageColor: "#FF5468",
                        appendToElement: $("#divBookEditContainer")
                    });
                }

                if (operation !== "delete" && !message) {
                    $("#divBookEditPartContent").slideUp(500);
                    $("#divBookEditTreeContent").slideDown(500, function() {
                        positionBackground();
                        resizeBackground();

                        if (bookContent) {
                            renderBookTree({
                                bookContent: bookContent
                            });
                        }
                        toggleAjaxEvents({
                            option: "enable"
                        });
                    });
                } else {
                    if (bookContent) {
                        renderBookTree({
                            bookContent: bookContent
                        });
                    }
                    toggleAjaxEvents({
                        option: "enable"
                    });
                }
            },
            error: function (err) {
                $("html").html(err.responseText);
            }
        });
    }

    function renderBookTree(args) {
        args = args || {};
        var bookContent = args.bookContent || null;

        $(".book_edit_tree").empty();

        var elements, chapters, nodes, edges;

        if (!bookContent || bookContent.length === 0) {
            chapters = [];
            elements = [];
            nodes = [
                { data: { id: "create", content: "Dodaj" }, classes: "crud_node" }
            ];
            edges = [];
        } else {
            chapters = $.Enumerable.From(bookContent)
                .Distinct(function (part) {
                    return part.Chapter.Number;
                })
                .Select(function (part) {
                    return {
                        data: { id: "chapter" + part.Chapter.Number, content: "Rozdział " + part.Chapter.Number + " - " + part.Chapter.Title },
                        classes: "chapter_node"
                    };
                }).ToArray();

            elements = $.Enumerable.From(bookContent)
                .Select(function (part) {
                    return {
                        data: { id: part.Id, content: part.Choice + ":\n\n" + part.Description, parent: "chapter" + part.Chapter.Number },
                        classes: "story_node"
                    };
                }).ToArray();

            nodes = $.merge($.merge([], chapters), elements);

            edges = [];
            $.each(bookContent, function (i, v) {
                $.merge(
                    edges,
                    $.Enumerable.From(v.ChildrenIds)
                        .Select(function (id) {
                            return {
                                data: { source: v.Id, target: id }
                            };
                        }).ToArray()
                );
            });
        }

        var cy = cytoscape({
            container: $(".book_edit_tree"),

            pan: { x: 0, y: 20 },
            zoom: 1,
            wheelSensitivity: 0.1,
            minZoom: 0.5,
            maxZoom: 4,

            boxSelectionEnabled: false,
            autounselectify: true,

            style: cytoscape.stylesheet()
                .selector("node")
                .css({
                    "height": 150,
                    "width": 150,
                    "line-height": "26px",
                    "font-size": "12px",
                    "background-fit": "cover",
                    "border-color": "#000",
                    "border-width": 3,
                    "border-opacity": 0.5,
                    "label": "data(content)",
                    "text-wrap": "wrap",
                    "text-max-width": "150px", 
                    "text-valign": "center",
                    "text-outline-width": 2,
                    "text-outline-color": "black",
                    "background-color": "rgb(0, 0, 50)",
                    "color": "white",
                    "background-image": siteroot + "images/site_background_book.jpg",
                    "background-repeat": "no-repeat",
                    "z-index": "1"
                })
              .selector("$node > node")
                .css({
                    "font-size": "18px",
                    "padding-top": "10px",
                    "padding-left": "10px",
                    "padding-bottom": "10px",
                    "padding-right": "10px",
                    "text-wrap": "none",
                    "text-valign": "top",
                    "text-halign": "center",
                    "text-outline-width": 2,
                    "text-outline-color": "black",
                    "color": "yellow",
                    "background-color": "#333333",
                    "background-image": "none",
                    "z-index": "0"
                })
              .selector("edge")
                .css({
                    "width": 6,
                    "target-arrow-shape": "triangle",
                    "line-color": "#ffaaaa",
                    "target-arrow-color": "#ffaaaa"
                })
              .selector(".crud_node")
                .css({
                    "height": 80,
                    "width": 80,
                    "font-size": "18px",
                    "text-valign": "center",
                    "text-halign": "center",
                    "text-outline-width": 2,
                    "text-outline-color": "black",
                    "color": "blue",
                    "background-color": "#262626",
                    "background-image": "none",
                    "z-index": 10
                })
              .selector(".crud_edge")
                .css({
                    "width": 6,
                    "target-arrow-shape": "circle",
                    "line-color": "#0700bf",
                    "target-arrow-color": "#0700bf",
                    "z-index": 10
                })
              .selector(".confirm_node")
                .css({
                    "height": 60,
                    "width": 60,
                    "font-size": "18px",
                    "text-valign": "center",
                    "text-halign": "center",
                    "text-outline-width": 2,
                    "text-outline-color": "black",
                    "color": "yellow",
                    "background-color": "#202020",
                    "background-image": "none",
                    "z-index": 10
                })
              .selector(".confirm_edge")
                .css({
                    "width": 6,
                    "target-arrow-shape": "circle",
                    "line-color": "#ff0000",
                    "target-arrow-color": "#ff0000",
                    "z-index": 10
                }),
            elements: {
                nodes: nodes,
                edges: edges
            },

            layout: {
                name: "dagre",
                rankDir: "TB",
                fit: false,
                animate: false
            }
        }); // cy init

        cy.off();

        cy.on("tap", ".story_node", function () {
            var node = this;
            var crudObjects = [
                {
                    node: { group: "nodes", data: { id: "edit", content: "Edytuj" }, position: { x: node.position("x"), y: node.position("y") }, classes: "crud_node" },
                    edge: { group: "edges", data: { source: node.id(), target: "edit" }, classes: "crud_edge" },
                    targetPos: { x: node.position("x") + 150, y: node.position("y") - 75 }
                },
                {
                    node: { group: "nodes", data: { id: "create", content: "Dodaj" }, position: { x: node.position("x"), y: node.position("y") }, classes: "crud_node" },
                    edge: { group: "edges", data: { source: node.id(), target: "create" }, classes: "crud_edge" },
                    targetPos: { x: node.position("x") + 200, y: node.position("y") }
                },
                {
                    node: { group: "nodes", data: { id: "delete", content: "Usuń" }, position: { x: node.position("x"), y: node.position("y") }, classes: "crud_node" },
                    edge: { group: "edges", data: { source: node.id(), target: "delete" }, classes: "crud_edge" },
                    targetPos: { x: node.position("x") + 150, y: node.position("y") + 75 }
                }
            ];

            var areCrudNodesAdded = cy.$(".crud_node").length > 0;
            var source = cy.$(".crud_node").predecessors().sources().first();
            var delay = 0;
            var duration = 250;
            var sourceId = source.id();
            var thisId = this.id();
            cy.$(".confirm_node").remove();
            cy.$(".crud_node").remove();
            if (!areCrudNodesAdded || sourceId !== thisId) {
                $.each(crudObjects, function (idx, crud) {
                    if (node.successors().targets().not(".crud_node").length > 0 && crud.node.data.id === "delete") {
                        return true;
                    }
                    crud.edge.data.target = crud.node.data.id;
                    var crudNode = cy.add(crud.node);
                    cy.add(crud.edge);

                    crudNode.css({
                        "width": 10,
                        "height": 10,
                        "border-width": 0,
                        "opacity": 0
                    }).delay(delay).animate({
                        position: crud.targetPos,
                        css: {
                            "width": 80,
                            "height": 80,
                            "border-width": 2,
                            "opacity": 1
                        }
                    }, {
                        duration: duration,
                        complete: function() {
                            crudNode.removeCss();
                        }
                    });

                    delay += duration;
                });
            }
        }); // on tap

        cy.on("tap", "#delete", function () {
            var node = this;
            var confirmObjects = [
                {
                    node: { group: "nodes", data: { id: "confirm", content: "Potwierdź" }, position: { x: node.position("x"), y: node.position("y") }, classes: "confirm_node" },
                    edge: { group: "edges", data: { source: node.id(), target: "edit" }, classes: "confirm_edge" },
                    targetPos: { x: node.position("x") + 150, y: node.position("y") - 50 }
                },
                {
                    node: { group: "nodes", data: { id: "cancel", content: "Anuluj" }, position: { x: node.position("x"), y: node.position("y") }, classes: "confirm_node" },
                    edge: { group: "edges", data: { source: node.id(), target: "create" }, classes: "confirm_edge" },
                    targetPos: { x: node.position("x") + 150, y: node.position("y") + 50 }
                }
            ];

            var areConfirmNodesAdded = cy.$(".crud_node").length > 0;
            var source = cy.$(".confirm_node").predecessors().sources().first();
            var delay = 0;
            var duration = 250;
            var sourceId = source.id();
            var thisId = this.id();
            cy.$(".confirm_node").remove();
            if (!areConfirmNodesAdded || sourceId !== thisId) {
                $.each(confirmObjects, function (idx, confirm) {
                    confirm.edge.data.target = confirm.node.data.id;
                    var confirmNode = cy.add(confirm.node);
                    cy.add(confirm.edge);

                    confirmNode.css({
                        "width": 10,
                        "height": 10,
                        "border-width": 0,
                        "opacity": 0
                    }).delay(delay).animate({
                        position: confirm.targetPos,
                        css: {
                            "width": 60,
                            "height": 60,
                            "border-width": 2,
                            "opacity": 1
                        }
                    }, {
                        duration: duration,
                        complete: function () {
                            confirmNode.removeCss();
                        }
                    });

                    delay += duration;
                });
            }
        });

        cy.on("tap", "#cancel", function () {
            cy.$(".confirm_node").remove();
        });

        cy.on("tap", "#confirm", function () { // confirm_delete
            var bcId = parseInt(this.predecessors().sources().first().predecessors().sources().first().id());
            updateBookTree({
                operation: "delete",
                bookContentPart: $.Enumerable.From(bookContent).Single(function (part) { return part.Id === bcId })
            });

            cy.$(".confirm_node").remove();
            cy.$(".crud_node").remove();
        });

        function addTag(bookPart, tagsContainer) {
            var $tagContainer = $("<span class='tag_container' node-id='" + bookPart.Id + "' />");
            $tagContainer.appendTo($(tagsContainer));
            var $tagContent = $("<span class='tag_content' />");
            var $deleteTag = $("<span class='delete_tag' />");
            $tagContent.appendTo($tagContainer);
            $deleteTag.appendTo($tagContainer);
            $("<span style='color: rgb(0, 0, 255); font-style: italic;'>Rozdział " + bookPart.Chapter.Number + ": " + bookPart.Chapter.Title + "</span><br /><br />").appendTo($tagContent);
            $("<span style='color: rgb(220, 220, 220)'>" + bookPart.Choice + "</span><br /><br />").appendTo($tagContent);
            $("<span style='color: rgb(190, 190, 190)'>" + bookPart.Description + "</span>").appendTo($tagContent);
            positionBackground();
            resizeBackground();

            $deleteTag.on("click", function (e) {
                $("#ddlParentIds, #ddlChildrenIds").append($("<option/>", {
                    "class": "ddl_node_option",
                    value: bookPart.Id,
                    text: "(Rozdział " + bookPart.Chapter.Number + ": " + bookPart.Chapter.Title + ") "
                        + bookPart.Choice + " - " + bookPart.Description.split(" ").slice(0, 10).join(" ") + "..."
                }));
                sortDdl("ddlParentIds");
                sortDdl("ddlChildrenIds");
                $("#ddlParentIds, #ddlChildrenIds").selectmenu("refresh");
                $(e.target).parent().remove();
                positionBackground();
                resizeBackground();
            });

            $deleteTag.on("mouseover", function (e) {
                $(e.target).stop(true, true).animate({
                    "opacity": 1
                }, 250);
                $(e.target).parent().stop(true, true).animate({
                    "background-color": "rgb(120, 0, 0)"
                }, 250);
            });

            $deleteTag.on("mouseout", function (e) {
                $(e.target).stop(true, true).animate({
                    "opacity": 0.4
                }, 250);
                $(e.target).parent().stop(true, true).animate({
                    "background-color": "rgb(30, 30, 30)"
                }, 250);
            });
        }

        function parseStoryFromXmlToPlain(story) {
            if (story) {
                // Akapit
                var p = " ".repeat(12);
                //if (story.startsWith("[p]")) {
                //    story = p + story;
                //}
                var storySplitByP = story.split("[p]");
                if (storySplitByP && storySplitByP.length > 0 && storySplitByP[0].length === 0) {
                    storySplitByP.shift();
                    story = p + storySplitByP.join("\n" + p);
                } else {
                    story = storySplitByP.join("\n" + p);
                }
                // Nowe Linie
                story = story.split("[n]").join("\n");
                // Gwiazdki
                story = story.split("[***]").join("\n***");
            }

            return story;
        }

        function fillEditPanel(a) {
            a = a || [];
            var editedNode = a.node || "";
            var operation = a.operation || null;

            if (!editedNode)
                alert("Nie mozna wstawić wartości do panelu argument 'node' jest pusty");

            var nodeToModifyId = parseInt(editedNode.Id);

            $(".chapter_fullname").text(operation === "create" ? "Utwórz nową część" : "Edytuj wybraną część");
            $("#hdId").val(editedNode.Id);
            $("#hdOperation").val(operation);
            $("#txtChapterNumber").val(editedNode.Chapter.Number);
            $("#txtChapterTitle").val(editedNode.Chapter.Title);
            $("#txtChoice").val(editedNode.Choice);
            $("#taDescription").val(editedNode.Description);
            $("#taStory").val(parseStoryFromXmlToPlain(editedNode.Story));

            $("#btnSave").val(operation === "create" ? "Utwórz Nową Część" : "Zapisz Zmiany");

            var notEdited = $.Enumerable.From(bookContent).Where(function (part) {
                return part.Id !== nodeToModifyId;
            }).ToArray();

            $("#ddlParentIds, #ddlChildrenIds").children(".ddl_node_option").remove();
            $("#divParentIdsContainer").empty();
            $("#divChildrenIdsContainer").empty();

            var related = Array.prototype.concat.apply([], [
                editedNode.Children || [],
                editedNode.Parents || []
            ]);
            var notRelated = !related
                ? notEdited
                : $.Enumerable.From(notEdited).Where(function(x) {
                    return !contains($.Enumerable.From(related).Select(function(y) {
                        return y.Id;
                    }).ToArray(), x.Id);
                }).ToArray();

            if (notRelated) {
                $.each(notRelated, function (i, v) {
                    $("#ddlParentIds, #ddlChildrenIds").append($("<option/>", {
                        "class": "ddl_node_option",
                        value: v.Id,
                        text: "(Rozdział " + v.Chapter.Number + ": " + v.Chapter.Title + ") "
                            + v.Choice + " - " + (v.Description || "").split(" ").slice(0, 10).join(" ") + "..."
                    }));
                });
            }

            if (editedNode.Parents) {
                $.each(editedNode.Parents, function (i, v) {
                    addTag(v, "#divParentIdsContainer");
                });
            }

            if (editedNode.Children) {
                $.each(editedNode.Children, function (i, v) {
                    addTag(v, "#divChildrenIdsContainer");
                });
            }

            $("#ddlParentIds, #ddlChildrenIds").off().on("selectmenuselect", function (e, ui) { //"selectmenuselect", "#ddlParentIds, #ddlChildrenIds"
                var selectedId = parseInt(ui.item.value);
                if (selectedId === -1) {
                    return;
                }

                var selected = $.Enumerable.From(bookContent).Single(function (part) {
                    return part.Id === selectedId;
                });
                var tagsContainer = "#" + $(e.target).attr("id").replace("ddl", "div") + "Container";
                addTag(selected, tagsContainer);
                $("#ddlParentIds, #ddlChildrenIds").children("option[value = " + selectedId + "]").remove();
                $("#ddlParentIds, #ddlChildrenIds").selectmenu("refresh"); //$(e.target)
            });

            $("#ddlParentIds, #ddlChildrenIds").selectmenu("refresh");

            cy.$(".confirm_node").remove();
            if (bookContent && bookContent.length > 0) {
                cy.$(".crud_node").remove();
            }

            $("#divBookEditTreeContent").slideUp(500);
            $("#divBookEditPartContent").slideDown(500, function () {
                positionBackground();
                resizeBackground();
            });
        }

        cy.on("tap", "#create", function () {
            var node = this;
            var created;

            var parentNodeId = parseInt(node.predecessors().sources().first().id());
            if (!isNaN(parentNodeId)) {
                var parent = $.Enumerable.From(bookContent).Single(function(part) {
                    return part.Id === parentNodeId;
                });

                var allNodesById = $.Enumerable.From(bookContent).OrderBy(function(part) {
                    return part.Id;
                }).ToArray();

                var lastNode = $.Enumerable.From(bookContent).OrderBy(function(part) {
                    return part.Id;
                }).Last();

                var createdNodeId = parseInt(lastNode.Id) + 1;

                for (var i = 0; i < lastNode.Id - 1; i++) {
                    if (allNodesById[i + 1].Id - allNodesById[i].Id > 1) {
                        createdNodeId = allNodesById[i].Id + 1;
                        break;
                    }
                }

                created = {
                    Id: createdNodeId,
                    Parents: [parent],
                    ParentIds: [parentNodeId],
                    Children: null,
                    ChildrenIds: null,
                    Choice: "-",
                    Chapter: { Number: parent.Chapter.Number, Title: parent.Chapter.Title },
                    Story: null,
                    Description: null
                };
            } else {
                created = {
                    Id: 0,
                    Parents: null,
                    ParentIds: null,
                    Children: null,
                    ChildrenIds: null,
                    Choice: "-",
                    Chapter: { Title: null, Number: null },
                    Story: null,
                    Description: null
                };
            }

            fillEditPanel({
                node: created,
                operation: "create"
            });
        });

        cy.on("tap", "#edit", function () {
            var node = this;
            var editedNodeId = parseInt(node.predecessors().sources().first().id());
            var edited = $.Enumerable.From(bookContent).Single(function(part) {
                return part.Id === editedNodeId;
            });

            fillEditPanel({
                node: edited,
                operation: "edit"
            });
        });

        $("#btnCancel").off().on("click", function () {
            $("#divBookEditPartContent").slideUp(500);
            $("#divBookEditTreeContent").slideDown(500, function() {
                positionBackground();
                resizeBackground();
            });
        });

        $("#btnSave").off().on("click", function () {
            var parentIds = $.Enumerable.From($.makeArray($("#divParentIdsContainer").children(".tag_container"))).Select(function (el) {
                return parseInt($(el).attr("node-id"));
            }).ToArray();
            var childrenIds = $.Enumerable.From($.makeArray($("#divChildrenIdsContainer").children(".tag_container"))).Select(function (el) {
                return parseInt($(el).attr("node-id"));
            }).ToArray();

            updateBookTree({
                operation: $("#hdOperation").val(),
                bookContentPart: {
                    id: $("#hdId").val(),
                    ParentIds: parentIds,
                    ChildrenIds: childrenIds,
                    Choice: $("#txtChoice").val(),
                    Chapter: {
                        Title: $("#txtChapterTitle").val(),
                        Number: $("#txtChapterNumber").val()
                    },
                    Story: $("#taStory").val(),
                    Description: $("#taDescription").val()
                }
            });
        });

        cy.on("mouseover", "node", function () {
            this.css({
                "border-color": "blue"
            });
        }); // on mouseover

        cy.on("mouseout", "node", function () {
            this.removeCss();
        }); // on mouseout
    }

    $("#ddlParentIds, #ddlChildrenIds").selectmenu({
        width: 300,
        icons: { button: "custom-icon-down-arrow" }
    });

    var $divCoverDnDHandler = $("#divCoverDnDHandler");

    $divCoverDnDHandler.on("dragenter", function (e) {
        divCoverDnDHandler_DragEnter(e); 
    });

    $divCoverDnDHandler.on("dragover", function (e) {
        e.stopPropagation();
        e.preventDefault();
    });

    $divCoverDnDHandler.on("drop", function (e) {
        divCoverDnDHandler_Drop(e);
    });

    $(document).on("dragenter", function (e) 
    {
        e.stopPropagation();
        e.preventDefault();
    });

    $(document).on("dragover", function (e) {
        document_DragOver(e);
    });

    $(document).on("drop", function (e) 
    {
        e.stopPropagation();
        e.preventDefault();
    });

    var $divDeletecover = $("#divDeleteCover");
    if ($divDeletecover.is(":visible")) {
        var $divDeleteCover = $("#divDeleteCover");
        $divDeleteCover.off("click mouseenter mouseleave");
        $divDeleteCover.on("click", function (e) {
            divDeleteCover_Click(e);
            divDeleteCover_MouseLeave(e);
        });
        $divDeleteCover.on("mouseenter", function (e) {
            divDeleteCover_MouseEnter(e);
        });
        $divDeleteCover.on("mouseleave", function (e) {
            divDeleteCover_MouseLeave(e);
        });
    }

    $("#btnSaveBook").on("click", function(e) {
        btnSaveBook_Click(e);
    });

    displayBookTree();
});