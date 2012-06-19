// create a module and pass in jquery as $
var MapThing = (function ($) {

var map, allPathsLayer, mobile; 
var loadingPages = 0;

var currentPath = null;
var currentPathList = [];
var markers = [];

var userLat = null;
var userLon = null;

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

mt.fixScroll = function(){
  if(mobile)
    window.scrollTo(0, 1);
};

mt.resizeContentArea = function() {
  var content, contentHeight, iosBuffer, footer, header, viewportHeight;
  header = $(":jqmData(role='header'):visible");
  footer = $(":jqmData(role='footer'):visible");
  content = $(":jqmData(role='content'):visible");
  if((navigator.userAgent.match(/iPhone/i)) || 
    (navigator.userAgent.match(/iPod/i)) ||
    (navigator.userAgent.match(/iPad/i))){
    iosBuffer=66;
  }else{
    iosBuffer=0;
  }

  mt.fixScroll();

  viewportHeight = $(window).height();
  contentHeight = viewportHeight - header.outerHeight() - footer.outerHeight() + iosBuffer;
  $("div#leaflet-map").first().height(contentHeight);
  return $("#leaflet-map").height(contentHeight);
};

mt.initMap = function(elementId, locate, mob) {
  var locate = typeof(locate) === 'undefined' ? true : locate; 
  mobile = typeof(mob) === 'undefined' ? false : mob;

  map = new L.Map(elementId);
  var cloudmade = new L.TileLayer('http://{s}.tile.cloudmade.com/7ed9bab0587c49f79a34e6c987ed60fb/997/256/{z}/{x}/{y}.png');
  map.addLayer(cloudmade);

  allPathsLayer = new L.LayerGroup();
  currentLocationLayer = new L.LayerGroup();
  map.addLayer(allPathsLayer);
  map.addLayer(currentLocationLayer);

  var somerville = new L.LatLng(42.3875,-71.1);
  locationMarker = new L.CircleMarker(somerville, {'fillOpacity':.5, 'radius':5} );
  locationMarker.on('click',function(e){
    map.setView(e.latlng);
  });
  currentLocationLayer.addLayer(locationMarker);

  map.on('locationfound',function(data){
    userLat = data.latlng.lat;
    userLon = data.latlng.lng;
    locationMarker.setLatLng(data.latlng);
  });
  map.on('dragstart', mt.fixScroll);
  map.on('click', mt.fixScroll);

  if(locate){
    mt.locate();
  }

  if(mobile){
    $(window).bind('orientationchange pageshow resize pageinit', mt.resizeContentArea);
  }

};


mt.startLoading = function(){
  loadingPages=loadingPages+1;
  if(mobile)
    $.mobile.showPageLoadingMsg();
  return loadingPages;
};

mt.stopLoading = function(){
  loadingPages=Math.max(0,loadingPages-1);
  if(loadingPages==0 && mobile)
    $.mobile.hidePageLoadingMsg();
  return loadingPages;
};

mt.locate = function(zoom){
  var zoom = typeof(zoom) === 'undefined' ? true : zoom;
  map.locate({'setView': zoom, 'enableHighAccuracy':true, 'maxZoom':20});
};

mt.dropPointCenter = function(){
  var mid = map.getCenter(); 
  mt.addPoint(mid.lat, mid.lng);
};

mt.getLocation = function(){
  if(userLat != null){
    return [userLat, userLon];
  }else{
    var mid;
    mid = map.getCenter();
    return [mid.lat, mid.lng];
  }
}

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
  marker._popup.setContent( (marker.point.description === null ? " " : marker.point.description) + ( editable ? "<a href='javascript:void(0)' onclick='MapThing.editPointPopup("+markerKey+")' > edit</a>" : "" ) );
};

mt.updateDescription = function(pointKey, description){
  var point = currentPath.points[pointKey];
  point.description = description;
  $.ajax({
    type: 'PUT', 
    url: 'django/api/points/'+point.id,
    data: { 'description': description }
  });
  mt.setPointPopup(pointKey, true);
};

mt.deletePoint = function(pointKey){
  var point = currentPath.points[pointKey];
  currentPath.points.splice(pointKey,1);
  mt.drawPath(currentPath);

  $.ajax({type: 'DELETE', 
      url: 'django/api/points/'+point.id
    }).done(function(){
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
  var dataUrl = 'django/api/paths/'+pathId;
  $.ajax({
    url:dataUrl,
    beforeSend: function(xhr){
      mt.startLoading();
    }
  }).done(function(path){
    mt.drawPath(path, zoom, editable);
    if(typeof(callback) != 'undefined')
      callback(path);
  }).complete(function(){
    mt.stopLoading();
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

				alert("inside the load user path list");

        pathItems = [];
        pathSelectItems = [];
        $.each(pathList, function (key, val) {
            pathSelectItems.push( mt.getSelectItemText(val) );
        });
        
        $('div#path-list ul').empty();
        $('div#path-list ul').append(pathSelectItems.join('\n') );   

        if(mobile){
          $('div#path-list ul').trigger("change");
        }
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
  
	return '<li><a href="#">' + description + '</a></li>';
  //return '<option value="' + pathid + '" >' + description + '</option>';
};


mt.createPath = function(description, createForUser){
  
  $.post("django/api/paths/",{'description': description,'user_id': createForUser}, function(path){
    currentPath = path;
    mt.drawPath(currentPath, false);
    $('select#pathSelectList').append( mt.getSelectItemText(currentPath))
    $('select#pathSelectList option').attr("selected", false);
    $('select#pathSelectList option[value="' + currentPath.id + '"]').attr("selected", true);
    if(mobile)
      $('select#pathSelectList').trigger('change');
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

var FourSquare = (function(MapThing){

var fs = {};

fs.request = function(lat, lon, query, callback){
  var query = typeof(query) === 'undefined' ? "" : query;
  var searchString="https://api.foursquare.com/v2/venues/search?client_id=QTVZ0RMVUR3GEO30XJTKAWT02XMEQINHOH2FAEUFM42CZWMU&client_secret=4UAF15NQOUJKN1MJYOLY4U0PNWW1MLYLLSM0VYWYTRI4XF2X&ll={lat},{lon}&query={query}";  
  searchString = searchString.replace("{lat}",String(lat)).replace("{lon}",String(lon)).replace("{query}",query);
  $.ajax({
    url:searchString,
    beforeSend: function (xhr){
      MapThing.startLoading();
    }
  }).done(function (data){ 
    callback(data.response.groups[0].items);
  }).complete(function(){
    MapThing.stopLoading();
  });
}

fs.search = function(query){
  var center = MapThing.getLocation();
  fs.request(center[0], center[1], query, function(d){
    var newContent = [];
    $.each(d, function(key, val){
      newContent.push("<li> <a href=\"javascript:void(0)\" onclick=\"MapThing.addPoint("+val.location.lat+","+val.location.lng+"); window.history.back();\">"+val.name+"<br/>"+
      "<div style='color:#BBB;font-size:small;'>"+
        (typeof(val.location.address)==='undefined'?"":val.location.address+", ")+
        (typeof(val.location.city)==='undefined'?"":val.location.city)+
        (typeof(val.location.distance)==='undefined'?"": "<br/><p class='ui-li-aside'> "+String(Math.round(val.location.distance/1609.344*10)/10)+" mi</p>"  )+
      "</div> </a> </li>");
    });
    $("ul#venue-list").html(newContent.join('\n'));
    $("ul#venue-list").listview("refresh");
  });
}

return fs;

}(MapThing));