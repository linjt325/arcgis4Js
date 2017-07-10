 
 $(function(){
 var map;

    require(["esri/map", "esri/geometry/Point","esri/layers/ArcGISTiledMapServiceLayer","dojo/domReady!"], function (Map,Point,ArcGISTiledMapServiceLayer) {
      
      var gisPoint=new Point(gisCenter);

      map = new Map("map", {
        //basemap: "topo",  //For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
        center:gisPoint, // longitude, latitude
        zoom: 13,
        logo : false,
		  	slider : false
      });
      var mapServiceLayer=new ArcGISTiledMapServiceLayer("http://10.10.28.14:6080/arcgis/rest/services/GZ_DarkMap/MapServer")

      map.addLayer(mapServiceLayer);
      mapServiceLayer.resume();
      console.log("abc")
    });
 })
 