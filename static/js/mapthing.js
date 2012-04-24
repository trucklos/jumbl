
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

function drawMap() {
    
    // initialize the map on the "map" div
    var map = new L.Map('map');
    var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/7ed9bab0587c49f79a34e6c987ed60fb/997/256/{z}/{x}/{y}.png', {
        attribution: '',
    });

    var url = '../api/path/' + getQueryVariable("pathid") + '/points';
    $.getJSON(url, function (json) {
        var latlngs = [];
        $.each(json, function (key, val) {
            var point = new L.LatLng(val.lat, val.lon);
            latlngs.push(point);

            var marker = new L.Marker(point);
            map.addLayer(marker);
            marker.bindPopup('Point: ' + val.id + ' at Time: ' + val.time);
        });
        var polyline = new L.Polyline(latlngs, {
            color: 'blue'
        });
        map.addLayer(polyline);
        map.fitBounds(new L.LatLngBounds(latlngs));
        map.addLayer(cloudmade);
    });
}

function loadUserPathList() {
    
    var userId = getQueryVariable("userid");
    
    var url = '../api/user/' + userId + '/paths/';

    $.getJSON(url, function (json) {
        var latlngs = [];
        $.each(json, function (key, val) {
            var description = val.description;
            var pathid = val.id;
            
            $('ul#userlist').append('<li><a href="../static/index.html?pathid=' + pathid + '">' + description + '</a></li>');
        });
    });
}


