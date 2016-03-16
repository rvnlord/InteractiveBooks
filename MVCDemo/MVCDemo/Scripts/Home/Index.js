$(document).ready(function () {

    // Autocomplete - Eventy

    $("#txtSearch").on("keyup change", function (e) {
        if (isNullOrEmpty($(e.target).val())) {
            refreshTooltip({
                isValidatedBy: null,
                areAnyResults: false
            });
        }
    });

});