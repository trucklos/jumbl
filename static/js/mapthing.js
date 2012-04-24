
function getQueryVariable(variable) { 
	
	var query = window.location.search.substring(1); 
	var vars = query.split("&"); 

	for (var i=0; i<vars.length; i++) { 
		var pair = vars[i].split("="); 
		if (pair[0] == variable) { 
				return pair[1]; 
		} 
	}	 
	alert('Query Variable ' + variable + ' not found'); 
} 

function drawPath(path) {
  //var map = new L.Map('map');
  var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/7ed9bab0587c49f79a34e6c987ed60fb/997/256/{z}/{x}/{y}.png', {
    attribution: '',
  });

  var latlngs = [];
  $.each(path.points, function (key, val) {
    var point = new L.LatLng(val.lat, val.lon);
    latlngs.push(point);
    var marker = new L.Marker(point);
    map.addLayer(marker);
    marker.bindPopup('Point: ' + val.id + ' at Time: ' + val.time);
  });
  var polyline = new L.Polyline(latlngs, {color: 'blue'});
  map.addLayer(polyline);
  map.fitBounds(new L.LatLngBounds(latlngs));
  map.addLayer(cloudmade); 
}

function getAndDrawPath(pathId){
  var url = '../api/paths/'+pathId;
  $.getJSON(url, function(path){
    drawPath(path);
  });
}


function loadUserPathList(pathList) {
        pathItems = [];
        $.each(pathList, function (key, val) {
            var description = val.description;
            var pathid = val.id;
            pathItems.push('<li><a href="javascript:void(0)" onclick="getAndDrawPath(\''+val.id+'\')">'
+val.description+'</a></li>');
            //$('ul#userlist').append('<li><a href="javascript:getAndDrawPath("'+val.id+'")>' + description + '</a></li>');
        });
        $('ul#userlist').append( pathItems.join('\n') );
}


