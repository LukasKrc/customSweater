/**
 * Created by Lukas on 2015.10.03.
 */

// Produkto atvaizdavimo klase

function ProductPreview(canvasId, patternCanvasId, productImageSrc, patternImageParam, patternSizeParam, draw3dParam)
{
    // 3d atvaizdavimo kintamieji
    var draw3d = draw3dParam;
    var scene, camera, renderer, plane;
    var canvas3d = document.getElementById("3dCanvas");
    var animationID;
    var keepRendering = true;

    // Peles valdymo kintamieji
    var canvasOffset = $("#" + canvasId).offset();
    var offsetX = canvasOffset.left, offsetY = canvasOffset.top;
    var isDragging = false;
    var previousX = 0, previousY = 0, currentX = 0, currentY = 0;

    // 2d atvaizdavimo kintamieji
    var canvas = document.getElementById(canvasId);
    var patternCanvas = document.getElementById(patternCanvasId);
    var patternContext = patternCanvas.getContext("2d");
    var productImage = new Image();
    var patternImage = patternImageParam;
    var originalPatternImage = new Image();
    originalPatternImage.src = patternImage.src;
    var originalSizePatternImage = new Image();
    originalSizePatternImage.src = patternImage.src;
    var patternImageId = 0;
    var patternImageWidth, patternImageHeight;
    var patternSize = patternSizeParam;
    var pattern;
	var displacementMapId = 1;

    this.setDraw3d = function(draw3dParam)
    {
        this.draw3d = draw3dParam;
        if (draw3dParam) {
            document.getElementById(canvasId).style.display = "none";
            document.getElementById("3dContainer").style.display = "";
        } else {
            document.getElementById(canvasId).style.display = "";
            document.getElementById("3dContainer").style.display = "none";
        }
    }
    this.setDraw3d(draw3dParam);

    this.setPatternSize = function(patternSizeParam)
    {
        patternSize = patternSizeParam;
        draw(0, 0);
        if (draw3d)
            render();
    }
	
	this.setDisplacement = function(displacementID)
	{
		displacementMapId = displacementID;
	}
	
	this.setImage = function(ImageID)
    {
		productImage = new Image();
        productImage.src = ImageID;
		//displacementMapId = displacementID;
        draw(0, 0);
        if (draw3d){
			change3d();
			//init3d();
            //render();
		}
    }

    this.setOriginalSizePatternImage = function(originalSizePatternImageParam)
    {
        var newImage = new Image();
        newImage.src = originalSizePatternImageParam.src;
        originalSizePatternImage = newImage;
    }

    this.setOriginalPatternImage = function(originalPatternImageParam)
    {
        var newImage = new Image();
        newImage.src = originalPatternImageParam.src;
        originalPatternImage = newImage;
    }

    this.getOriginalPatternImage = function()
    {
        return originalPatternImage;
    }

    this.setPatternImage = function(patternImageParam)
    {
        var patternImageSource = patternImageParam.src.split("/");
        patternImageId = patternImageSource[patternImageSource.length - 1].split(".")[0];
        patternImageId = patternImageId[patternImageId.length - 1];
        patternImage = patternImageParam;
        pattern = patternContext.createPattern(patternImage, 'repeat');
        changeImageDimensions();
        currentX = currentY = 0;
        draw(0, 0);
        if (draw3d)
            patternImage.onload = render();
    }

    this.getPatternImageId = function()
    {
        return patternImageId;
    }

    this.getPatternImage = function()
    {
        return patternImage;
    }

    var changeImageDimensions = function() {
        if (patternImage.width < canvas.width || patternImage.height < canvas.height) {
            patternImageWidth = 2000;
            patternImageHeight = 2000;
        } else {
            patternImageWidth = patternImage.width;
            patternImageHeight = patternImage.height;
        }
    }

    var draw = function()
    {
        makePattern();
        render2D();
        if (draw3d)
            render3D();
    }

    var render2D = function()
    {
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.drawImage(productImage,0,0);
        context.globalCompositeOperation="source-atop";
        context.globalAlpha = 0.75;
        context.drawImage(this.patternCanvas, 0, 0, this.patternCanvas.width * patternSize, this.patternCanvas.height * patternSize);
        context.globalAlpha = 1;
        context.globalCompositeOperation = "multiply";
        context.drawImage(productImage,0,0);
    }

    var render3D = function()
    {
        //plane.material.uniforms.tDiffuse.value = null;
        //plane.material.uniforms.tDiffuse.value = new THREE.Texture(canvas);
        //DiffuseTexture = new THREE.Texture(canvas);
        //DiffuseTexture.needsUpdate = true;
        plane.material.uniforms.tDiffuse.value.needsUpdate = true;
        //plane.material.map = new THREE.Texture(canvas);
        //plane.material.map.needsUpdate = true;
        //scene.getObjectByName('plane').material.map = new THREE.Texture(canvas);
        //scene.getObjectByName('plane').material.map.needsUpdate = true;
    }

    var makePattern = function()
    {
        patternContext.clearRect(0, 0, this.patternCanvas.width, this.patternCanvas.height);
        patternContext.rect(0, 0, this.patternCanvas.width, this.patternCanvas.height);
        patternContext.translate(currentX, currentY);
        patternContext.fillStyle = pattern;
        //patternContext.fillRect(-offsetX, -offsetY, this.patternCanvas.width, this.patternCanvas.height);
        patternContext.fillRect(-currentX, -currentY, this.patternCanvas.width, this.patternCanvas.height);
        patternContext.translate(-currentX, -currentY);
    }

    var handleMouseDown = function(e)
    {
        keepRendering = true;
        animate();
        mousePositionX = parseInt(e.clientX - offsetX);
        mousePositionY = parseInt(e.clientY - offsetY);
        previousX = mousePositionX;
        previousY = mousePositionY;
        isDragging = true;
        return false;
    }

    var handleMouseUp = function(e)
    {
        mousePositionX = parseInt(e.clientX - offsetX);
        mousePositionY = parseInt(e.clientY - offsetY);
        isDragging=false;
        //cancelAnimationFrame(animationID);
        keepRendering = false;
        return false;
    }

    var handleMouseOut = function(e)
    {
        mousePositionX = parseInt(e.clientX - offsetX);
        mousePositionY = parseInt(e.clientY - offsetY);
        isDragging=false;
        //cancelAnimationFrame(animationID);
        keepRendering = false;
        return false;
    }

    var handleMouseMove = function(e)
    {
        mousePositionX = parseInt(e.clientX - offsetX);
        mousePositionY = parseInt(e.clientY - offsetY);
        if(isDragging){
            //console.log(mousePositionX - previousX);
           // console.log(mousePositionY - previousY);
            if ((currentX - 600 + patternImageWidth > 0 || mousePositionX - previousX > 0) && (currentX < 0 || mousePositionX - previousX < 0)) {
                if (currentX + mousePositionX - previousX < -patternImageWidth + canvas.width) {
                    currentX = -patternImageWidth + canvas.width;
                } else if (currentX + mousePositionX - previousX > 0) {
                    currentX = 0;
                } else {
                    currentX = currentX + (mousePositionX - previousX) / patternSize;
                }
            }
            if ((currentY - 600 + patternImageHeight > 0 || mousePositionY - previousY > 0) && (currentY < 0 || mousePositionY - previousY < 0)) {
                if (currentY + mousePositionY - previousY < -patternImageHeight + canvas.height) {
                    currentY = -patternImageHeight + canvas.height;
                } else if (currentY + mousePositionY - previousY > 0) {
                    currentY = 0;
                } else {
                    currentY = currentY + (mousePositionY - previousY) / patternSize;
                }
            }
            //console.log(currentX);
            //console.log(currentY);
            previousX = mousePositionX;
            previousY = mousePositionY;
        }
        draw();
        return false;
    }

    $("#canvas").mousedown(handleMouseDown);
    $("#canvas").mousemove(handleMouseMove);
    $("#canvas").mouseup(handleMouseUp);
    $("#canvas").mouseout(handleMouseOut);
    $("#3dContainer").mousedown(handleMouseDown);
    $("#3dContainer").mousemove(handleMouseMove);
    $("#3dContainer").mouseup(handleMouseUp);
    $("#3dContainer").mouseout(handleMouseOut);
	
	function change3d(){
		scene = new THREE.Scene();
		scene.add(camera);
		
		//renderer.setClearColor( 0xEEEEEE, 1);
		//document.getElementById("3dContainer").appendChild(renderer.domElement);
		
		var DiffuseTexture = new THREE.Texture(canvas);
        var DisplacementTexture = new THREE.ImageUtils.loadTexture("imgs/DisplaceMap/DMap" + displacementMapId + ".jpg", {}, render);
        var shader = THREE.ShaderLib["normalmap"];
        var fragShader = document.getElementById("fragmentShader").innerHTML;

        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms["enableDisplacement"].value = true;
        uniforms["enableDiffuse"].value = true;
        uniforms["tDisplacement"].value = DisplacementTexture;
        uniforms["tDiffuse"].value = DiffuseTexture;
        uniforms["uDisplacementScale"].value = 1;
        var parameters = {
            fragmentShader: fragShader/*shader.fragmentShader*/,
            vertexShader: shader.vertexShader,
            uniforms: uniforms,
            lights: true
        };
        var NormalMaterial = new THREE.ShaderMaterial(parameters);
		
		var geometry = new THREE.PlaneGeometry(16, 16, 256, 256);
        geometry.computeTangents();

        plane = new THREE.Mesh(geometry, NormalMaterial  /*material*/);
		
		scene.add(plane);
	}

    function init3d() {
        scene = new THREE.Scene();

        var SCREEN_WIDTH = productImage.width, SCREEN_HEIGHT = productImage.height;
        var VIEW_ANGLE = 80, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 1000;
        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        camera.position.z = 10;
        scene.add(camera);

        //renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas3d});
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(productImage.width, productImage.height);
        renderer.setClearColor( 0xEEEEEE, 1);
        document.getElementById("3dContainer").appendChild(renderer.domElement);

        var DiffuseTexture = new THREE.Texture(canvas);
        var DisplacementTexture = new THREE.ImageUtils.loadTexture("imgs/DisplaceMap/DMap" + displacementMapId + ".jpg", {}, render);
        var shader = THREE.ShaderLib["normalmap"];
        var fragShader = document.getElementById("fragmentShader").innerHTML;

        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        uniforms["enableDisplacement"].value = true;
        uniforms["enableDiffuse"].value = true;
        uniforms["tDisplacement"].value = DisplacementTexture;
        uniforms["tDiffuse"].value = DiffuseTexture;
        uniforms["uDisplacementScale"].value = 1;
        var parameters = {
            fragmentShader: fragShader/*shader.fragmentShader*/,
            vertexShader: shader.vertexShader,
            uniforms: uniforms,
            lights: true
        };
        var NormalMaterial = new THREE.ShaderMaterial(parameters);

        //var sphereMaterial =
        //    new THREE.MeshLambertMaterial(
        //        {
        //            color: 0
        //        });
        //
        //var material = new THREE.MeshPhongMaterial( {
        //
        //    transparent: true,
        //
        //    map: new THREE.Texture(canvas), //DiffuseTexture,
        //
        //    displacementMap: DisplacementTexture,
        //    displacementScale: 1,
        //    displacementBias: 0,
        //
        //    side: THREE.DoubleSide
        //
        //} );

        var geometry = new THREE.PlaneGeometry(16, 16, 256, 256);
        geometry.computeTangents();

        plane = new THREE.Mesh(geometry, NormalMaterial  /*material*/);
        scene.add(plane);

        //ambientLight = new THREE.AmbientLight(0xFFFFFF);
        //scene.add(ambientLight);

    }

    function animate() {
        //setTimeout( function() {
        //    if (keepRendering)
        //        requestAnimationFrame( animate );
        //
        //}, 1000 / 60 );
        render();
        if (keepRendering)
            requestAnimationFrame(animate);
    }

    function render() {
        if(draw3d) {
            console.log("Rendering");
            renderer.render(scene, camera);
        }
    }

    changeImageDimensions();
    patternImage.onload=function()
    {
        productImage.onload=function()
        {
            pattern = patternContext.createPattern(patternImage, 'repeat');
            canvas.width = productImage.width;
            canvas.height = productImage.height;
            if (draw3d)
                init3d();
            draw();
        }
        productImage.src = productImageSrc;
    }


    //window.onbeforeunload = function()
    //{
    //    plane.geometry.dispose();
    //    plane.material.dispose();
    //    plane.material.uniforms.tDiffuse.value.dispose();
    //    plane.dipose();
    //    scene.remove("plane");
    //    canvas = null;
    //    DisplacementTexture = null;
    //    DiffuseTexture = null;
    //    renderer.resetGlState();
    //    renderer.dispose();
    //}
    //
    //window.onunload = function()
    //{
    //    plane.geometry.dispose();
    //    plane.material.dispose();
    //    plane.material.uniforms.tDiffuse.value.dispose();
    //    plane.dipose();
    //    scene.remove("plane");
    //    canvas = null;
    //    DisplacementTexture = null;
    //    DiffuseTexture = null;
    //    renderer.resetGlState();
    //    renderer.dispose();
    //}
}