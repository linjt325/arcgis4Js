 
 $(function(){
 var map;
 $('.left-edit').hover(function(){
   $(this).children('ul').slideDown("fast").stop();
 },function(){
   $(this).children('ul').slideUp('fast');
 })

    require(["esri/map", "esri/geometry/Point","esri/layers/ArcGISTiledMapServiceLayer","esri/layers/FeatureLayer", "esri/tasks/GeometryService"
      ,"esri/dijit/OverviewMap","dojo/dom","esri/toolbars/navigation","dijit/registry","esri/dijit/editing/TemplatePicker"
      ,"esri/symbols/SimpleLineSymbol","esri/Color","esri/symbols/PictureMarkerSymbol","dojo/_base/array","esri/dijit/editing/Editor"
      ,"esri/dijit/InfoWindow","esri/symbols/SimpleMarkerSymbol","esri/toolbars/draw", "dojo/i18n!esri/nls/jsapi", "dojo/parser", "dojo/keys"
      ,"dijit/layout/BorderContainer", "dijit/layout/ContentPane","dojo/domReady!"], function (
      Map,Point,ArcGISTiledMapServiceLayer,FeatureLayer,GeometryService
      ,OverviewMap,dom,Navigation,registry,TemplatePicker
      ,SimpleLineSymbol,Color,PictureMarkerSymbol,arrayUtils,Editor
      ,InfoWindow,SimpleMarkerSymbol,Draw,jsapiBundle, parser, keys
    ) {
        parser.parse();
       // snapping is enabled for this sample - change the tooltip to reflect this
        jsapiBundle.toolbars.draw.start = jsapiBundle.toolbars.draw.start +  "<br>Press <b>ALT</b> to enable snapping";

        // refer to "Using the Proxy Page" for more information:  https://developers.arcgis.com/javascript/3/jshelp/ags_proxy.html
        esriConfig.defaults.io.proxyUrl = "/proxy/";

        //This service is for development and testing purposes only. We recommend that you create your own geometry service for use within your applications.
        esriConfig.defaults.geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

      var gisPoint=new Point(gisCenter);

      map = new Map("map", {
        basemap: "topo",  //使用arcgis提供的基础地图
        center:gisPoint, // longitude, latitude
        zoom: 13,
        logo : false,
		  	slider : false
      });

      //通过地图服务实例化Layer 缓存图片图层
      var mapServiceLayer=new ArcGISTiledMapServiceLayer("http://10.10.28.14:6080/arcgis/rest/services/GZ_DarkMap/MapServer")
      map.addLayer(mapServiceLayer);
      mapServiceLayer.resume();
      //map.getLayer(map.layerIds[0]);

      //添加图层
      var LLJLayer = new FeatureLayer(
						"http://10.10.28.14:6080/arcgis/rest/services/GZ_EditMap/FeatureServer/0",
						{
							mode : FeatureLayer.MODE_ONDEMAND,
							outFields : [ '*' ],
							visible : true
            });

      var selPointSymbol = new PictureMarkerSymbol(
        "../Images/featureEdit/icon_layer/search.png", 45,
        45);

      var selLineSymbol = new SimpleLineSymbol(
        SimpleLineSymbol.STYLE_SOLID, new Color([ 255, 255, 0,1 ]), 8);
        LLJLayer.setSelectionSymbol(selPointSymbol);
      map.addLayers([LLJLayer]);

      //鹰眼
      var overview=new OverviewMap({
        map:map,
        height:250,
        width:250,
        opacity:0.1,//透明度
        attachTo:"bottom-right",//鹰眼位置
        visible : true,//是否出初始课件
        maximizeButton:true,//放大缩小按钮
        showLabels : true//显示label **
      })
      overview.resize({h:100,w:100})
      /** 将鹰眼放在map之外的容器中
      var overview=new OverviewMap({
        map:map,
        height:250,
        width:250,
        opacity:0.1,//透明度
        attachTo:"bottom-right",//鹰眼位置
        visible : true,//是否出初始课件
        maximizeButton:true//放大缩小按钮

      },dom.byId('over'))//
       */
      overview.startup()

      // 导航工具
      var navBar = new Navigation(map);
      //点击放大放大层级
      $('#zoomInBtn').on('click',function(){
        var extent= map.extent
        map.setExtent( extent.expand(0.5))
        //navBar.zoomToNextExtent()
      })


      				// 绘制工具
				//var drawBar = new Draw(map);
      	// drawBar.on("draw-complete", drawComplete);
     
      map.on("layers-add-result",function(event){
        initEditor(event)
      })

      
      function initEditor(event) {
        var layers4temp =arrayUtils.map(event.layers,function(result){
          return result.layer
        })
        // layers4temp.push(event.layer)
        var templatePicker = new TemplatePicker({
          featureLayers: layers4temp,
          style:"width:227px; height:220px;background:#f3f5f7;border:none",
          columns: 3,
          rows:"auto",
          grouping:false,
        }, "templatePicker")
        templatePicker.startup();

        //layers==>[{featureLayer:result.layer}] 
         var layers = arrayUtils.map(event.layers, function(result) {
            return { featureLayer: result.layer };
          });

        var editor=new Editor({
          settings:{
            map:map,
            templatePicker: templatePicker,
            layerInfos:layers,
            toolbarVisible:true,
            createOptions:{
              polylineDrawTools : [ Editor.CREATE_TOOL_FREEHAND_POLYLINE ],
              polygonDrawTools : [
                  Editor.CREATE_TOOL_FREEHAND_POLYGON,
                  Editor.CREATE_TOOL_CIRCLE,
                  Editor.CREATE_TOOL_TRIANGLE,
                  Editor.CREATE_TOOL_RECTANGLE ]
            },
              toolbarOptions : {
                reshapeVisible : true,
                mergeVisible:true,
                cutVisible:true
              },
          }
        },"editorDiv")
        // var symbol = new SimpleMarkerSymbol(
				// 			SimpleMarkerSymbol.STYLE_CROSS, 15,
				// 			new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
				// 					new Color([ 255, 0, 0, 0.5 ]), 5), null);
				// 	// 开启捕捉
				// 	map.enableSnapping({
				// 		snapPointSymbol : symbol,
				// 		tolerance : 20,
				// 		snapKey : keys.ALT
				// 	});

        editor.startup()


      }
      	var mState = {
          "PAN" : 0,
          "ZOOM_IN" : 1,
          "ZOOM_OUT" : 2,
          "FULL_EXTENT" : 3,
          "MEASURE_LENGTH" : 4,
          "MEASURE_AREA" : 5,
          "SEARCH_BY_POLYGON" : 6,
          "GET_COORDINATE":7
        }
      var mapEventStatus=0;
      map.on('click',function(event){
        switch(mapEventStatus){
          case mState.PAN:
            break;
          case mState.GET_COORDINATE:
            pickUp_Coord(event)
            mapEventStatus=0;
          break;
          default:
          break;
        }
      })
      //坐标拾取
      $('#coord-btn').on('click',function(){
        mapEventStatus=7;
      })

      function pickUp_Coord(event){
        //	A standard DOM MouseEvent with additional properties mapPoint and screenPoint
        console.log(event)
        var mapPoint=event.mapPoint;
        $('#coord-input').val(mapPoint.x.toFixed(5)+','+mapPoint.y.toFixed(5))
        //var infowindow =new InfoWindow({},'infowindow');
      }
    


    });
 })
 