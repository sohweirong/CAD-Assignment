$("#uploadThumbnail").click(function() {
    $('input[type="file"]').click();
});

$('input[type="file"]').change(function(e) {
    const imagePreviewUrl = URL.createObjectURL(e.target.files[0]);
    $("img#preview").attr("src", imagePreviewUrl);
    $("img#preview").addClass("w-75");
    $("img#preview").addClass("img-thumbnail");
    $("img#preview").addClass("mb-3");
});

$(".display-details").each(function(_){
    $(this).click(function(_){
        let tmpid = $(this).data("case-id");
        $.ajax({
            url: "/getitem",
            type: "POST",
            data: JSON.stringify({"case_id": tmpid}),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(data){
                const result = data["result"];
                const {bucket_information, itemName, itemDescription, lostLocation, lostFloor, lostDate, lostTime, case_id} = result;
                $("#pre_case_id").text(case_id.S);
                $("#pre_thumbnail").attr("src",`https://${bucket_information.M.bucketName.S}.s3.amazonaws.com/${bucket_information.M.key.S}`);
                $("#pre_item_title").text(itemName.S);
                $("#pre_item_desc").text(itemDescription.S);
                $("#pre_item_founddate").text(`${lostDate.S} ${lostTime.S}`);
                $("#pre_item_location").text(`${lostLocation.S} [Level ${lostFloor.S}]`);
                $("#pre_edit_item").attr('href',`/report/lost/edit/${case_id.S}`)
                $("#pre_add_notification").data("case-id",case_id.S);
                $("#detailModal").modal("toggle");
            },
            error: function(errMsg) {
                console.log(errMsg);
                $("#detailModal").hide();
            }
        });
    });
});

$("#pre_add_notification").click(function() {
    $("#detailModal").hide();
    $("#addNotificationModal").modal("toggle");
});

$("#addNotificationForm").submit(function(event) {
    event.preventDefault();
    const form = $(this);

    $.ajax({
        type: "POST",
        url: "/addnotif",
        data: form.serialize(), // serializes the form's elements.
        success: function(data) {
            $("#alertBox").removeClass("d-none");
            $("#alertMsg").text("Confirmation email sent! Please check your email.");
        },
        error: function(error) {
            console.log(error);
            $("#alertBox").removeClass("d-none");
            $("#alertMsg").text("Please try again later.");
        }
    });
});