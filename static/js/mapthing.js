// create a module and passh jquery as $
var MapThing = (function ($) {

var map;
var allPathsLayer;
var currentPath;
var currentPathList = []

// module variable
var mt = {}

// public function my.initMap
mt.initMap = function(elementId){
  currentPath = null;
  currentPathList = [];

  map = new L.Map(elementId, {'doubleClickZoom':false});
  allPathsLayer = new L.LayerGroup();
  map.addLayer(allPathsLayer);

  map.on('dblclick',function(e){

        if(currentPath == null) {
          alert('no path set');
        } else {
          addPoint(e.latlng.lat, e.latlng.lng);
        }
      });

  var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/7ed9bab0587c49f79a34e6c987ed60fb/997/256/{z}/{x}/{y}.png');
  map.addLayer(cloudmade).setView(new L.LatLng(42.3875, -71.1), 13);
}

// my.initMap public function 
mt.getQueryVariable = function(variable) { 
  
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

function editPath(path){
  currentPath = path;
}

function drawPath(path, zoom) {
  var zoom = typeof(zoom) === 'undefined' ? true : zoom; 

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
  if(zoom)
    map.fitBounds(new L.LatLngBounds(latlngs));
}

mt.getAndDrawPath = function(pathId){
  var url = '../api/paths/'+pathId;
  $.getJSON(url, function(path){
    drawPath(path);
    editPath(path);
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

mt.loadUserPathList = function(pathList) {
        pathItems = [];
        $.each(pathList, function (key, val) {
            var description = val.description;
            var pathid = val.id;
            pathItems.push('<li><a href="javascript:void(0)" onclick="MapThing.getAndDrawPath(\''+val.id+'\')">' + val.description + '</a></li>');
        });
        $('ul#userlist').empty();
        $('ul#userlist').append( pathItems.join('\n') );
}

createPath = function(description, createForUser){

  $.post("../api/paths/",{'description': description,'user_id': createForUser}, function(path){ 
    currentPath = path;
    // For now let's just tack it on to the end of the path list
    // TODO: actually maintain a list of paths so we can access them later
    $('ul#userlist').append('<li><a href="javascript:void(0)" onclick="getAndDrawPath(\''+path.id+'\')">' + path.description + '</a></li>');
  }).error(function() { alert("could not add path: probably a duplicate description"); } );

}

addPoint = function(lat, lng){
  var currentTime = new Date();
  var timeFormat = ISODateString(currentTime);
  var postVars = {'path_id': currentPath.id, 'lat': lat,'lon': lng, 'time': timeFormat};
  
  $.post("../api/points/", postVars, function(point){
    currentPath.points.push(point);
    drawPath(currentPath, false);
  }).error(function() { alert("could not add point"); } );
}

return mt;

}($));
