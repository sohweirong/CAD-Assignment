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