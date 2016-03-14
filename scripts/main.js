// Change the active page based on user clicks
$('.masthead-nav li a').click(function() {
  $('.masthead-nav li').removeClass('active');
  $(this).parent().addClass('active');
});

// Retrun to home when modal is closed
$('.modal').on('hidden.bs.modal', function () {
    $(".masthead-nav li").removeClass('active');
    $(".masthead-nav li:first-child").addClass('active');
});

function renderData(data, timePage) {
  $("#concepts").val("");
  $("#roles").val("");
  $("#tbox").val("");

  if (!timePage)
    timePage = 0;
  $("#time-page").html('<h5>Time Page: ' + (timePage+1) + '/' + data.length + '</h5>');

  var currentPage = data[timePage];
  $.each(currentPage.concepts, function(i, d) {
    $("#concepts").val(function(ind, val) {
      return val + d + "\n";
    });
  });
  $.each(currentPage.roles, function(i, d) {
    $("#roles").val(function(ind, val) {
      return val + d + "\n";
    });
  });
  $.each(currentPage.tbox, function(i, d) {
    $("#tbox").val(function(ind, val) {
      return val + d + "\n";
    });
  });
}

//Load json data if there is a content param
var content = window.location.href.split('?content=');
if (content.length == 2) {
  $.getJSON("examples/" + content[1], function(data) {
    renderData(data);
    var currentPage = 0;
    $('#time-page-left').on('click', function () {
      currentPage -= 1;
      if (currentPage < 0)
        currentPage = 0;
      renderData(data, currentPage);
    });
    $('#time-page-right').on('click', function () {
      currentPage += 1;
      if (currentPage >= data.length) {
        currentPage = data.length;
      }
      renderData(data, currentPage);
    });
    $('#refresh').click();
  });
}

//Allow user to upload json files
function handleFileSelect(evt) {
  var file = evt.target.files[0]; // FileList object
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = JSON.parse(e.target.result);
    renderData(contents);
    console.log(contents);
    $(".upload-modal").modal('hide');
  };
  reader.readAsText(file);
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);
