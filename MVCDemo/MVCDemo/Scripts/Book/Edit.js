/// <reference path="../_references.js" />

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
                id: $.id,
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

    function renderBookTree(args) {
        args = args || {};
        var bookContent = args.bookContent || null;

        var chapters = $.Enumerable.From(bookContent)
            .Distinct(function(part) {
                return part.Chapter.Number;
            })
            .Select(function(part) {
                return {
                    data: { id: "chapter" + part.Chapter.Number, content: "Rozdział " + part.Chapter.Number + " - " + part.Chapter.Title },
                    classes: "chapter_node"
                };
            }).ToArray();

        var elements = $.Enumerable.From(bookContent)
            .Select(function (part) {
                return {
                    data: { id: part.Id, content: part.Choice + ":\n\n" + part.Description, parent: "chapter" + part.Chapter.Number },
                    classes: "story_node"
                };
            }).ToArray();

        var nodes = $.merge($.merge([], chapters), elements);

        var edges = [];
        $.each(bookContent, function(i, v) {
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

            //

            cy.$(".confirm_node").remove();
            cy.$(".crud_node").remove();

            $("#divBookEditTreeContent").slideUp(500);
            $("#divBookEditPartContent").slideDown(500, function() {
                positionBackground();
                resizeBackground();
            });
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

        function fillEditPanel(editedNode) {
            var nodeToModifyId = parseInt(editedNode.Id);

            $(".chapter_fullname").text("Edytuj wybraną część");
            $("#hdId").val(editedNode.Id);
            $("#txtChapterNumber").val(editedNode.Chapter.Number);
            $("#txtChapterTitle").val(editedNode.Chapter.Title);
            $("#txtChoice").val(editedNode.Choice);
            $("#taDescription").val(editedNode.Description);
            $("#taStory").val(editedNode.Story);

            var notEdited = $.Enumerable.From(bookContent).Where(function (part) {
                return part.Id !== nodeToModifyId;
            }).ToArray();

            $("#ddlParentIds, #ddlChildrenIds").children(".ddl_node_option").remove();
            $("#divParentIdsContainer").empty();
            $("#divChildrenIdsContainer").empty();

            var related = (editedNode.Children || []).concat(editedNode.Parents);
            var notRelated = related ? notEdited.diff(related) : notEdited;

            if (notRelated) {
                $.each(notRelated, function (i, v) {
                    $("#ddlParentIds, #ddlChildrenIds").append($("<option/>", {
                        "class": "ddl_node_option",
                        value: v.Id,
                        text: "(Rozdział " + v.Chapter.Number + ": " + v.Chapter.Title + ") "
                            + v.Choice + " - " + v.Description.split(" ").slice(0, 10).join(" ") + "..."
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

            $("#ddlParentIds, #ddlChildrenIds").off().on("selectmenuselect", function (e, ui) {
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
            cy.$(".crud_node").remove();

            $("#divBookEditTreeContent").slideUp(500);
            $("#divBookEditPartContent").slideDown(500, function () {
                positionBackground();
                resizeBackground();
            });
        }

        cy.on("tap", "#create", function () {
            var node = this;

            var parentNodeId = parseInt(node.predecessors().sources().first().id());
            var parent = $.Enumerable.From(bookContent).Single(function (part) {
                return part.Id === parentNodeId;
            });

            var allNodesById = $.Enumerable.From(bookContent).OrderBy(function (part) {
                return part.Id;
            }).ToArray();

            var lastNode = $.Enumerable.From(bookContent).OrderBy(function (part) {
                return part.Id;
            }).Last();

            var createdNodeId = parseInt(lastNode.Id) + 1;

            for (var i = 0; i < lastNode.Id - 1; i++) {
                if (allNodesById[i + 1].Id - allNodesById[i].Id > 1) {
                    createdNodeId = allNodesById[i].Id + 1;
                }
            }

            var created = {
                Id: createdNodeId,
                Parents: [ parent ],
                ParentIds: [ parentNodeId ],
                Children: null,
                ChildrenIds: null,
                Choice: "",
                Chapter: { Number: parent.Chapter.Number, Title: parent.Chapter.Title },
                Story: "Nowa przykładowa Historia " + createdNodeId,
                Description: "Opis przykładowej Historii " + createdNodeId
            };

            fillEditPanel(created);
        });

        cy.on("tap", "#edit", function () {
            var node = this;
            var editedNodeId = parseInt(node.predecessors().sources().first().id());
            var edited = $.Enumerable.From(bookContent).Single(function(part) {
                return part.Id === editedNodeId;
            });

            fillEditPanel(edited);
        });

        $("#btnCancel").on("click", function() {
            $("#divBookEditPartContent").slideUp(500);
            $("#divBookEditTreeContent").slideDown(500, function() {
                positionBackground();
                resizeBackground();
            });
        });

        $("#btnSave").on("click", function () {

            // 

            $("#divBookEditPartContent").slideUp(500);
            $("#divBookEditTreeContent").slideDown(500, function () {
                positionBackground();
                resizeBackground();
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

    displayBookTree();
});