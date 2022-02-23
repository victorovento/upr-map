/*
 * This file is part of OpenLevelUp!.
 * 
 * OpenLevelUp! is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * OpenLevelUp! is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with OpenLevelUp!.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * The images overlay panel component
 */
OLU.view.ImagesView = function(main) {
//ATTRIBUTES
	/** The main view **/
	this._mainView = main;
	
	/** The currently shown spherical image **/
	this._currentSpherical = -1;
	
	/** The leaflet window **/
	this._window = null;
	
	/** The available spherical images **/
	this._sphericalImages = null;
	
	/*
	 * Sphere related attributes
	 */
	this._camera = null;
	this._scene = null;
	this._renderer = null;
	this._container= null;
	this._isUserInteracting = null;
	this._onMouseDownMouseX = null;
	this._onMouseDownMouseY = null;
	this._lon = null;
	this._onMouseDownLon = null;
	this._lat = null;
	this._onMouseDownLat = null;
	this._phi = null;
	this._theta = null;
	this._firstClick = null;
	this._mesh = null;

//CONSTRUCTOR
	this._window = L.control.window(
		this._mainView.getMapView().get(),
		{
			title: '<div id="op-images-tabs-links"><a id="tab-imgs-a" href="#tab-imgs"><img src="img/icon_picture.svg" alt="Simple" /></a><a id="tab-spheric-a" href="#tab-spheric"><img src="img/icon_spherical_picture.svg" alt="Sphere" /></a></div>',
			content: '<div id="op-images-tabs-content">'
				+'	<div class="op-images-tab galleria" id="tab-imgs">'
				+'	</div>'
				+'	<div class="op-images-tab" id="tab-spheric">'
				+'		<div id="spherical-content"></div>'
				+'		<div id="spherical-legend">'
				+'			<div id="spherical-legend-title"></div>'
				+'			<div id="spherical-legend-text"></div>'
				+'		</div>'
				+'		<div id="spherical-nav">'
				+'			<div id="spherical-nav-left">&lt;</div>'
				+'			<div id="spherical-nav-right">&gt;</div>'
				+'		</div>'
				+'		<div id="spherical-counter">'
				+'			<span>- / -</span>'
				+'		</div>'
				+'	</div>'
				+'</div>'
				+'<div id="op-images-status">'
				+'	<img src="img/icon_web.svg" alt="Web" title="Web" /> <a id="status-web"><span class="status">&#x25CF;</span></a>'
				+'	<img src="img/icon_mapillary.svg" alt="Mapillary" title="Mapillary" /> <a id="status-mapillary"><span class="status">&#x25CF;</span></a>'
				+'	<img src="img/icon_flickr.svg" alt="Flickr" title="Flickr" /> <a id="status-flickr"><span class="status">&#x25CF;</span></a>'
				+'</div>',
			position: 'center',
			className: 'control-window control-window-wide',
			modal: true,
			hideWhenClosed: true,
			maxWidth: $(window).width() * 0.8
		}
	);
	
	$("#tab-imgs-a").click(function() { OLU.controller.getView().getImagesView().changeTab("tab-imgs"); });
	$("#tab-spheric-a").click(function() { OLU.controller.getView().getImagesView().changeTab("tab-spheric"); });
	$("#spherical-nav-left").click(function() { OLU.controller.getView().getImagesView().previousSpherical(); });
	$("#spherical-nav-right").click(function() { OLU.controller.getView().getImagesView().nextSpherical(); });
};

//OTHER METHODS
	/**
	 * Opens and set images for the given feature
	 * @param ftId The feature ID
	 */
	OLU.view.ImagesView.prototype.open = function(ftId) {
		//Retrieve feature
		var ft = this._mainView.getData().getFeature(ftId);
		var ftImgs = ft.getImages();
		var images = ftImgs.get();
		this._sphericalImages = ftImgs.getSpherical();
		
		//Create images list
		var imagesData = [];
		for(var i=0; i < images.length; i++) {
			var img = images[i];

			imagesData.push({
				image: img.url,
				link: img.url,
				title: img.source,
				description: this._getLegend(img)
			});
		}
		
		/*
		 * Set images tab
		 */
		var hasCommon = imagesData.length > 0;
		var hasSpherical = this._sphericalImages.length > 0 && this._mainView.hasWebGL();
		
		//Common images
		if(hasCommon) {
			$("#tab-imgs-a").show();
			
			//Load base images
			Galleria.run('.galleria', { dataSource: imagesData, popupLinks: true, _toggleInfo: false, carousel: false, thumbnails: false });
		}
		else {
			$("#tab-imgs-a").hide();
		}
		
		//Spherical images
		if(hasSpherical) {
			this._currentSpherical = 0;
			$("#tab-spheric-a").show();
			var sceneInit = this._scene == null;
			if(sceneInit) {
				this._initSphere();
			}
			this._loadSphere();
			if(sceneInit) {
				this._animateSphere();
			}
			
			//Other settings
			this._renderer.setSize(this._getSphereWidth(), this._getSphereHeight());
			
			//Navigation buttons
			if(this._sphericalImages.length > 1) {
				$("#spherical-nav").show();
			}
			else {
				$("#spherical-nav").hide();
			}
		}
		else {
			this._currentSpherical = -1;
			$("#tab-spheric-a").hide();
		}
		
		//Open panel
		if(hasCommon) {
			this.changeTab("tab-imgs");
		}
		else if(hasSpherical) {
			this.changeTab("tab-spheric");
		}
		
		//Update images status
		var status = ftImgs.getStatus();
		this.updateStatus("web", status.web, ft.getTag("image"));
		this.updateStatus("mapillary", status.mapillary, ft.getTag("mapillary"));
		this.updateStatus("flickr", status.flickr);
		
		//Show window
		this._window.show();
		
		if(hasSpherical) {
			this._onWindowResize();
			this._onWindowResize(); //Poor fix to set sphere size correctly
		}
	};
	
 	/**
 	 * Changes the currently opened tab in images popup
 	 * @param tab The tab name
 	 */
 	OLU.view.ImagesView.prototype.changeTab = function(tab) {
		$("#op-images-tabs-links a").removeClass("selected");
 		$("#"+tab+"-a").addClass("selected");
		$(".op-images-tab").hide();
 		$("#"+tab).show();
		if(tab == "tab-spheric") {
			this._onWindowResize();
			this._onWindowResize();
		}
 	};
	
	/**
	 * Changes the status for a given source
	 * @param source The image source (mapillary, flickr, web)
	 * @param status The image status (ok, missing, bad, unknown)
	 * @param baselink The image link (optional)
	 */
	OLU.view.ImagesView.prototype.updateStatus = function(source, status, baselink) {
		var link = $("#status-"+source);
		var element = $("#status-"+source+" span");
		
		element.removeClass("ok missing bad");
		if(status != "unknown") {
			element.addClass(status);
		}
		
		//Update title
		var title;
		switch(status) {
			case "ok":
				title = this._mainView.getTranslation("title", "image", "statusok");
				break;
			case "missing":
				title = this._mainView.getTranslation("title", "image", "statusmissing");
				break;
			case "bad":
				title = this._mainView.getTranslation("title", "image", "statusbad");
				if(source == "mapillary") {
					title += " "+this._mainView.getTranslation("title", "image", "checkmpl");
				}
				else if(source == "web") {
					title += " (URL: "+baselink+")";
				}
				break;
			case "unknown":
				title = this._mainView.getTranslation("title", "image", "loading");
				break;
		}
		link.prop("title", title);
	};
	
	/**
	 * @param img The image details
	 * @return The description
	 */
	OLU.view.ImagesView.prototype._getLegend = function(img) {
		var description = "";
		
		if(img.author != undefined) { description += img.author }
		if(img.date != undefined && img.date > 0) {
			if(description != "") { description += ", "; }
			description += new Date(img.date).toLocaleString();
		}
		if(img.page != undefined) {
			if(description != "") { description += " - "; }
			description += '<a href="'+img.page+'" target="_blank" class="i18n image.page">'+this._mainView.getTranslation("image", "page")+'</a>';
		}
		description += "<br />"+img.tag;
		
		return description;
	};
	
	/*
	 * Sphere related methods
	 */
	
	OLU.view.ImagesView.prototype._getSphereWidth = function() {
		var w = $("#spherical-content").width();
		return (w > 0) ? w : OLU.CONFIG.view.images.spherical.width;
	};
	
	OLU.view.ImagesView.prototype._getSphereHeight = function() {
		var h = $("#spherical-content").height();
		return (h > 0) ? h : OLU.CONFIG.view.images.spherical.height;
	};
	
	/**
	 * Changes the spherical to the previous one (if any)
	 */
	OLU.view.ImagesView.prototype.previousSpherical = function() {
		if(this._sphericalImages.length > 1) {
			if(this._currentSpherical > 0) {
				this._currentSpherical--;
			}
			else {
				this._currentSpherical = this._sphericalImages.length -1;
			}
			this._loadSphere();
		}
	};
	
	/**
	 * Changes the spherical to the previous one (if any)
	 */
	OLU.view.ImagesView.prototype.nextSpherical = function() {
		if(this._sphericalImages.length > 1) {
			if(this._currentSpherical < this._sphericalImages.length -1) {
				this._currentSpherical++;
			}
			else {
				this._currentSpherical = 0;
			}
			this._loadSphere();
		}
	};
	
	/**
	 * Initializes the ThreeJS sphere
	 */
	OLU.view.ImagesView.prototype._initSphere = function() {
		$("#spherical-content canvas").remove();
		this._container = document.getElementById("spherical-content");
		
		//Scene
		this._scene = new THREE.Scene();
		
		//Renderer
		this._renderer = new THREE.WebGLRenderer({ antialias: true });
		this._renderer.setPixelRatio( window.devicePixelRatio );
		this._container.appendChild(this._renderer.domElement);
		
		//Events
		$("#spherical-content canvas").mousedown(this._onDocumentMouseDown.bind(this));
		$("#spherical-content canvas").mousemove(this._onDocumentMouseMove.bind(this));
		$("#spherical-content canvas").mouseup(this._onDocumentMouseUp.bind(this));
		$("#spherical-content canvas").bind("mousewheel DOMMouseScroll", this._onDocumentMouseWheel.bind(this));
		//document.addEventListener('DOMMouseScroll', this._onDocumentMouseWheel.bind(this), false);
		document.addEventListener('dragover', function ( event ) {
			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';
		}.bind(this), false );
		document.addEventListener( 'dragenter', function ( event ) {
			document.body.style.opacity = 0.5;
		}.bind(this), false );
		document.addEventListener( 'dragleave', function ( event ) {
			document.body.style.opacity = 1;
		}.bind(this), false );
		window.addEventListener( 'resize', this._onWindowResize.bind(this), false );
	};
	
	/**
	 * Loads the ThreeJS sphere with current spherical image
	 */
	OLU.view.ImagesView.prototype._loadSphere = function() {
		var sphericalImg = this._sphericalImages[this._currentSpherical];
		$("#spherical-legend-title").html(sphericalImg.source);
		$("#spherical-legend-text").html(this._getLegend(sphericalImg));
		$("#spherical-counter span").html((this._currentSpherical+1)+' / '+this._sphericalImages.length);
		
		//Init vars
		this._isUserInteracting = false;
		this._onMouseDownMouseX = 0;
		this._onMouseDownMouseY = 0;
		this._onMouseDownLon = 0;
		this._lat = 0;
		this._onMouseDownLat = 0;
		this._phi = 0;
		this._theta = 0;
		this._firstClick = true;
		
		//Set initial direction
		this._lon = (sphericalImg.relativeDirection != undefined) ? sphericalImg.relativeDirection - 180 : sphericalImg.angle;
		
		//Camera
		this._camera = new THREE.PerspectiveCamera(75, this._getSphereWidth() / this._getSphereHeight(), 1, 1000);
		this._camera.target = new THREE.Vector3( 0, 0, 0 );
		
		//Sphere
		if(this._mesh != null) {
			this._scene.remove(this._mesh);
		}
		var geometry = new THREE.SphereGeometry(100, 30, 30);
		geometry.applyMatrix( new THREE.Matrix4().makeScale( -1, 1, 1 ) );
		THREE.ImageUtils.crossOrigin = "anonymous";
		var texture = THREE.ImageUtils.loadTexture(sphericalImg.url);
		texture.anisotropy = this._renderer.getMaxAnisotropy();
		texture.magFilter = THREE.LinearFilter;
		texture.minFilter = THREE.LinearMipMapLinearFilter;
		var material = new THREE.MeshBasicMaterial({
			map: texture,
			side: THREE.FrontSide
		});
		this._mesh = new THREE.Mesh( geometry, material );
		this._mesh.rotation.y = Math.PI - THREE.Math.degToRad(sphericalImg.angle); //Pointing to north
		this._scene.add( this._mesh );
		
		//Events
		document.addEventListener( 'drop', function ( event ) {
			event.preventDefault();
			var reader = new FileReader();
			reader.addEventListener( 'load', function ( event ) {
				material.map.image.src = event.target.result;
				material.map.needsUpdate = true;
			}, false );
			reader.readAsDataURL( event.dataTransfer.files[ 0 ] );
			document.body.style.opacity = 1;
		}.bind(this), false );
	};
	
	OLU.view.ImagesView.prototype._onWindowResize = function() {
		var aspect = this._getSphereWidth() / this._getSphereHeight(); //this._container.clientWidth / this._container.clientHeight;
		if(!isNaN(aspect) && aspect > 0) {
			this._camera.aspect = aspect;
			this._camera.updateProjectionMatrix();
			this._renderer.setSize(this._getSphereWidth(), this._getSphereHeight());
		}
	};

	OLU.view.ImagesView.prototype._onDocumentMouseDown = function( event ) {
		event.preventDefault();
		if($('#spherical-content canvas:hover').length != 0) {
			this._isUserInteracting = true;
			onPointerDownPointerX = event.clientX;
			onPointerDownPointerY = event.clientY;
			onPointerDownLon = this._lon;
			onPointerDownLat = this._lat;
		}
	};

	OLU.view.ImagesView.prototype._onDocumentMouseMove = function( event ) {
		if ( this._isUserInteracting === true ) {
			this._lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
			this._lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
		}
	};

	OLU.view.ImagesView.prototype._onDocumentMouseUp = function( event ) {
		this._isUserInteracting = false;
		if($('#spherical-content canvas:hover').length != 0) {
			this._firstClick = false;
		}
	};

	OLU.view.ImagesView.prototype._onDocumentMouseWheel = function( event ) {
		event = event.originalEvent;
		var prevFov = this._camera.fov;
		// WebKit
		if ( event.wheelDeltaY ) {
			this._camera.fov -= event.wheelDeltaY * 0.05;
		// Opera / Explorer 9
		} else if ( event.wheelDelta ) {
			this._camera.fov -= event.wheelDelta * 0.05;
		// Firefox
		} else if ( event.detail ) {
			this._camera.fov += event.detail * 1.0;
		}
		
		//Limit wheel action
		if(this._camera.fov < 40 || this._camera.fov > 100) {
			this._camera.fov = prevFov;
		}
		this._camera.updateProjectionMatrix();
	};

	OLU.view.ImagesView.prototype._animateSphere = function() {
		requestAnimationFrame( this._animateSphere.bind(this) );
		this._update();
	};

	OLU.view.ImagesView.prototype._update = function() {
		if (this._firstClick && this._isUserInteracting === false) {
			this._lon += 0.1;
		}
		this._lat = Math.max( - 85, Math.min( 85, this._lat ) );
		this._phi = THREE.Math.degToRad( 90 - this._lat );
		this._theta = THREE.Math.degToRad( this._lon );
		this._camera.target.x = 500 * Math.sin( this._phi ) * Math.cos( this._theta );
		this._camera.target.y = 500 * Math.cos( this._phi );
		this._camera.target.z = 500 * Math.sin( this._phi ) * Math.sin( this._theta );
		this._camera.lookAt( this._camera.target );
		
		//var angle = Math.round(THREE.Math.radToDeg(this._theta) % 360);
		//if(angle < 0) { angle += 360; }
		//$("#spherical-direction").html(angle+"°");
		
		this._renderer.render( this._scene, this._camera );
	};
