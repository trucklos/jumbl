function initMap(){
map = new L.Map('map', {'doubleClickZoom':false});
        var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/7ed9bab0587c49f79a34e6c987ed60fb/997/256/{z}/{x}/{y}.png', {
          attribution: '',
        });
        map.addLayer(cloudmade).setView(new L.LatLng(42.3875, -71.1), 13);
}

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

  allPathsLayer.clearLayers();
  var latlngs = [];
  $.each(path.points, function (key, val) {
    var point = new L.LatLng(val.lat, val.lon);
    latlngs.push(point);
    var marker = new L.Marker(point);
    allPathsLayer.addLayer(marker);
    marker.bindPopup('Point: ' + val.id + ' at Time: ' + val.time);
  });
  var polyline = new L.Polyline(latlngs ); // ,{color: 'blue'}
  allPathsLayer.addLayer(polyline);
  map.fitBounds(new L.LatLngBounds(latlngs));
  var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/7ed9bab0587c49f79a34e6c987ed60fb/997/256/{z}/{x}/{y}.png', {
    attribution: '',
  }); 
  map.addLayer(cloudmade); 
}

function getAndDrawPath(pathId){
  var url = '../api/paths/'+pathId;
  $.getJSON(url, function(path){
    drawPath(path);
  });
}

function ISODateString(d) {
    function pad(n){
        return n<10 ? '0'+n : n
    }
    return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z'
}

function loadUserPathList(pathList) {
        pathItems = [];
        $.each(pathList, function (key, val) {
            var description = val.description;
            var pathid = val.id;
            pathItems.push('<li><a href="javascript:void(0)" onclick="getAndDrawPath(\''+val.id+'\')">'
+val.description+'</a></li>');
        });
        $('ul#userlist').append( pathItems.join('\n') );
}

function createPath(description){

  $.post("../api/paths/",{'description': description,'user_id': currentUser}, function(path){ 
    currentPath = path;
  }).error(function() { alert("could not add path: probably a duplicate description"); } );

}

function addPoint(lat, lng){
  var currentTime = new Date();
  var timeFormat = ISODateString(currentTime);
  var postVars = {'path_id': currentPath.id, 'lat': lat,'lon': lng, 'time': timeFormat};
  
  $.post("../api/points/", postVars, function(point){
/*    var point = new L.LatLng(lat, lng);
    var marker = new L.Marker(point);
    map.addLayer(marker); */
    currentPath.points.push(point);
    drawPath(currentPath);
  }).error(function() { alert("could not add point"); } );
}

