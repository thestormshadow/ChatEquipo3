function ignoreDrag(e) {
  e.originalEvent.stopPropagation();
  e.originalEvent.preventDefault();
}

$(document).ready(function(){
    $('#alerter')
    .bind('dragenter', ignoreDrag)
    .bind('dragover', ignoreDrag)
    .bind('drop', drop);
    $('#creatorImage').hover(function () {
        $('#creatorImage').fadeOut(500, function () {
            $('#creatorImage').fadeIn(500);
        });
    });
});

function drop(e) {
  ignoreDrag(e);
  var dt = e.originalEvent.dataTransfer;
  var files = dt.files;

  if(dt.files.length > 0){
    var fr = new FileReader();
    fr.readAsDataURL(dt.files[0]);
    fr.onload = function (oFREvent) {
        $("#creatorImage").attr('src', oFREvent.target.result);
    };
    
  }
}