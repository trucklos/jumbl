// create a module and pass in jquery as $
var MapThing = (function ($) {

// Visual Globals
var map;
var allPathsLayer;

// 
var currentPath;
var currentPathList = [];
var markers = [];

// Current Position
var userLat = null;
var userLong = null;

// module variable
var mt = {};

mt.getQueryVariable = function(variable, defaultval) { 
  
  var query = window.location.search.substring(1); 
  var vars = query.split("&"); 
  for (var i=0; i<vars.length; i++) { 
    var pair = vars[i].split("="); 
    if (pair[0] == variable) { 
        return pair[1]; 
    } 
  }   
  return defaultval;
};

// public function my.initMap
mt.initMap = function(elementId, locate){
  var locate = typeof(locate) === 'undefined' ? true : locate; 
  currentPath = null;
  currentPathList = [];
  map = new L.Map(elementId);
  allPathsLayer = new L.LayerGroup();
  currentLocationLayer = new L.LayerGroup();
  map.addLayer(allPathsLayer);
  map.addLayer(currentLocationLayer);
  var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/7ed9bab0587c49f79a34e6c987ed60fb/997/256/{z}/{x}/{y}.png');
  map.addLayer(cloudmade);
  var somerville = new L.LatLng(42.3875,-71.1);
  locationMarker = new L.CircleMarker(somerville, {'fillOpacity':.5, 'radius':5} );
  locationMarker.on('click',function(e){
    console.log(e);
    map.setView(e.latlng,16);
  });
  currentLocationLayer.addLayer(locationMarker);

  map.on('locationfound',function(data){
    locationMarker.setLatLng(data.latlng);
  });

  if(locate){
    map.locate({setView: true, enableHighAccuracy:true});
  }else{
    map.setView(somerville, 12 );
  }
};


mt.locate = function(){
  map.locate({setView: true, enableHighAccuracy:true});
};

mt.dropPointCenter = function(){
  var mid = map.getCenter(); 
  mt.addPoint(mid.lat, mid.lng);
};

mt.editPointPopup = function(markerKey){
  var marker = markers[markerKey];
  marker._popup.setContent("<form id='editForm' onsubmit='MapThing.updateDescription("+markerKey+",$(\"#desc\").val());' action='javascript:void(0)'>"+
    "<input type='text' id='desc' value='"+ (marker.point.description === null ? "" : marker.point.description)+"' />"+
    "</form>"+
    "<br/> <a href='javascript:void(0)' onclick='MapThing.deletePoint("+markerKey+")'> delete </a>");
    $('#desc').focus();
};

mt.setPointPopup = function(markerKey, editable){
  var editable = typeof(editable) === 'undefined' ? false : editable; 
  var marker = markers[markerKey];
  //if(marker.point.description != null || editable ){
    marker._popup.setContent( (marker.point.description === null ? " " : marker.point.description) + ( editable ? "<a href='javascript:void(0)' onclick='MapThing.editPointPopup("+markerKey+")' > edit</a>" : "" ) );
  //}else{
    //marker._popup.off();
  //}
};

mt.updateDescription = function(pointKey, description){
  var point = currentPath.points[pointKey];
  point.description = description;
  $.ajax({type: 'PUT', url: 'django/api/points/'+point.id,
                data: { 'description': description }
        });
  mt.setPointPopup(pointKey, true);
};

mt.deletePoint = function(pointKey){
  var point = currentPath.points[pointKey];
  currentPath.points.splice(pointKey,1);
  $.ajax({type: 'DELETE', 
      url: 'django/api/points/'+point.id
    }).done(function(){
      // TODO: if we wanted to make this consistent with the other calls, we could just delete the point locally and redraw locally and then send the delete request.  This would make the interface a little snappier.
      mt.getAndDrawPath(currentPath.id, false, true);
    });
};

mt.drawPath = function(path, zoom, editable) {
  var zoom = typeof(zoom) === 'undefined' ? true : zoom; 
  var editable = typeof(zoom) === 'undefined' ? false : editable; 
  allPathsLayer.clearLayers();
  markers = [];
  var latlngs = [];
  if (path.points.length > 0) {
    $.each(path.points, function (key, val) {
      var point = new L.LatLng(val.lat, val.lon);
      latlngs.push(point);
      markers[key] = new L.Marker(point, {'draggable':editable} );
      allPathsLayer.addLayer(markers[key]);
      markers[key].bindPopup('');
      markers[key].point = val;
      markers[key].path = path;

      if(editable){
        markers[key].on('dragend', function(e){
          this.point.lat = this._latlng.lat;
          this.point.lon = this._latlng.lng;
          mt.drawPath(this.path, false, true);
          $.ajax({type: 'PUT', url: 'django/api/points/'+this.point.id,
                data: { 'lat': this._latlng.lat , 'lon': this._latlng.lng }
          });
        });
      }
      mt.setPointPopup(key, editable);
    });

    var polyline = new L.Polyline(latlngs ); 
    allPathsLayer.addLayer(polyline);
    if(zoom)
      map.fitBounds(new L.LatLngBounds(latlngs));
  }
  currentPath = path;
};

mt.getAndDrawPath = function(pathId, zoom, editable, callback){
  var url = 'django/api/paths/'+pathId;
  $.getJSON(url, function(path){
    mt.drawPath(path, zoom, editable);
  }).done( function(path){
    if(typeof(callback) != 'undefined')
      callback(path);
  });
};

mt.ISODateString = function(d) {
    function pad(n){
        return n<10 ? '0'+n : n;
    }
    return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z';
};

mt.loadUserPathList = function(pathList) {
        pathItems = [];
        pathSelectItems = [];
        $.each(pathList, function (key, val) {
            //pathItems.push( mt.getPathText(val) );
            pathSelectItems.push( mt.getSelectItemText(val) );
        });
        //$('ul#userlist').empty();
        //$('ul#userlist').append( pathItems.join('\n') );
        
        $('select#pathSelectList').empty();
        $('select#pathSelectList').append(pathSelectItems.join('\n') );       
};

mt.getPathText = function(path){
  var description = path.description;
  var pathid = path.id;
  return '<li><a href="javascript:void(0)" onclick="MapThing.getAndDrawPath(\''+pathid+'\', true, true)">' + description + '</a>'+
               '<small> (<a href="share.html?pathid='+pathid+'">share</a></small>) </li>';
};

mt.getSelectItemText = function(path){
  var description = path.description;
  var pathid = path.id;
  return '<option value="' + pathid + '" >' + description + '</option>';
};


mt.createPath = function(description, createForUser){
  
  $.post("django/api/paths/",{'description': description,'user_id': createForUser}, function(path){
    currentPath = path;
    mt.drawPath(currentPath, false);
    $('select#pathSelectList').append( mt.getSelectItemText(currentPath))
    $('select#pathSelectList option').attr("selected", false);
    $('select#pathSelectList option[value="' + currentPath.id + '"]').attr("selected", true);
    
  }).error(function() { alert("Error: Could not add Path. Probably a duplicate description."); } );
};

mt.addPoint = function(lat, lng){
  var description = ""; //prompt("Please enter a description for this point.");
  var currentTime = new Date();
  var timeFormat = mt.ISODateString(currentTime);
  var postVars = {'path_id': currentPath.id, 'lat': lat,'lon': lng, 'time': timeFormat, 'description': description};
  $.post("django/api/points/", postVars, function(point){
    var newPointKey = currentPath.points.length;
    currentPath.points.push(point);
    mt.drawPath(currentPath, false, true);
    markers[newPointKey].openPopup();
    mt.editPointPopup(newPointKey);
  }).error(function() { alert("could not add point"); } );
};

mt.shareFromSelect = function() {
	var pathid = $('select#pathSelectList').val();
	window.location = 'share.html?pathid=' + pathid;
};

return mt;

}($));
