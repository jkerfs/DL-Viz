// Change the active page based on user clicks
$('.masthead-nav li a').click(function() {
  $('.masthead-nav li').removeClass('active');
  $(this).parent().addClass('active');
});

function renderData(data) {
  $("#concepts").val("");
  $("#roles").val("");
  $.each(data.concepts, function(i, d) {
    $("#concepts").val(function(ind, val) {
      return val + d + "\n";
    });
  });
  $.each(data.roles, function(i, d) {
    $("#roles").val(function(ind, val) {
      return val + d + "\n";
    });
  });
}
//Load json data if there is a content param
var content = window.location.href.split('?content=');
if (content.length == 2) {
  $.getJSON("examples/" + content[1], function(data) {
    renderData(data);
  });
}

//Allow user to upload json files
function handleFileSelect(evt) {
  var file = evt.target.files[0]; // FileList object
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = JSON.parse(e.target.result);
    renderData(contents);
    $(".upload-modal").modal('hide');
  };
  reader.readAsText(file);
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);
