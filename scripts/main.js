// Change the active page based on user clicks
$('.masthead-nav li a').click(function() {
  $('.masthead-nav li').removeClass('active');
  $(this).parent().addClass('active');
});

//Load json data if there is a content param
var content = window.location.href.split('?content=');
if(content.length == 2) {
  $.getJSON( "examples/" + content[1], function( data ) {
    $.each(data.concepts,function(i,d) {
      $("#concepts").val(function(ind, val) {
        return val + d + "\n";
      });
    });
    $.each(data.roles, function(i,d) {
      $("#roles").val(function(ind, val) {
        return val + d + "\n";
      });
    });
  });
}
