/**
 * Created by Lukas on 2015.10.03.
 */

function MouseHandler(productPreviewInstance) {

    var productPreview = productPreviewInstance;
    var canvasOffset = $("#" + productPreview.getCanvasId()).offset();
    var offsetX = canvasOffset.left, offsetY = canvasOffset.top;
    var isDragging = false;
    var previousX = 0, previousY = 0, currentX = 0, currentY = 0;
    var patternImageWidth, patternImageHeight, patternSize;
    var mousePositionX, mousePositionY;

    var handleMouseDown = function(e) {
        productPreview.setKeepRendering(true);
        productPreview.animateMethod();
        mousePositionX = parseInt(e.clientX - offsetX);
        mousePositionY = parseInt(e.clientY - offsetY);
        previousX = mousePositionX;
        previousY = mousePositionY;
        isDragging = true;
        return false;
    }

    var handleMouseUp = function(e) {
        mousePositionX = parseInt(e.clientX - offsetX);
        mousePositionY = parseInt(e.clientY - offsetY);
        isDragging = false;
        productPreview.setKeepRendering(false);
        return false;
    }

    var handleMouseOut = function(e) {
        mousePositionX = parseInt(e.clientX - offsetX);
        mousePositionY = parseInt(e.clientY - offsetY);
        isDragging = false;
        productPreview.setKeepRendering(false);
        return false;
    }

    var handleMouseMove = function(e) {
        mousePositionX = parseInt(e.clientX - offsetX);
        mousePositionY = parseInt(e.clientY - offsetY);
        patternImageWidth = productPreview.getPatternImageWidth();
        patternImageHeight = productPreview.getPatternImageHeight();
        patternSize = productPreview.getPatternSize();
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
            productPreview.setDrawX(currentX);
            productPreview.setDrawY(currentY);
        }
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
}

// Produkto atvaizdavimo klase

function ProductPreview(canvasId, patternCanvasId, productImageSrc, patternImageParam, patternSizeParam, drawTypeParam) {

    var self = this;
    var drawX = 0;
    var drawY = 0;

    // 3d atvaizdavimo kintamieji
    var drawType;

    // 2d atvaizdavimo kintamieji
    var canvas = document.getElementById(canvasId);
    var patternCanvas = document.getElementById(patternCanvasId);
    var productImage = new Image();
    var patternImage = patternImageParam;
    var originalPatternImage = new Image();
    originalPatternImage.src = patternImage.src;
    var originalSizePatternImage = new Image();
    originalSizePatternImage.src = patternImage.src;
    var patternImageId = 0;
    var patternImageWidth, patternImageHeight;
    var patternSize = patternSizeParam;

    this.setDrawX = function(drawXParam) {
        drawX = drawXParam;
    }

    this.setDrawY = function(drawYParam) {
        drawY = drawYParam;
    }

    this.getCanvasId = function() {
        return canvasId;
    }

    this.setKeepRendering = function(keepRenderingParam) {
        keepRendering = keepRenderingParam;
    }

    this.getPatternSize= function() {
        return patternSize;
    }

    this.getPatternImageWidth = function() {
        return patternImageWidth;
    }

    this.getPatternImageHeight = function() {
        return patternImageHeight;
    }

    this.setOriginalSizePatternImage = function(originalSizePatternImageParam) {
        originalSizePatternImage = originalSizePatternImageParam;
    }

    this.setOriginalPatternImage = function(originalPatternImageParam) {
        originalPatternImage = originalPatternImageParam;
    }

    this.getOriginalPatternImage = function() {
        return originalPatternImage;
    }

    this.getPatternImageId = function() {
        return patternImageId;
    }

    this.getPatternImage = function() {
        return patternImage;
    }

    this.setDrawType = function(drawTypeParam) {
        drawType = drawTypeParam;
        if (drawTypeParam == "webgl") {
            //document.getElementById(canvasId).style.display = "none";
            //document.getElementById("3dContainer").style.display = "";
            webglRenderer.initWebgl();
            webglRenderer.setVisibility(true);
            canvasRenderer.setVisibility(false);
            threeJsRenderer.setVisibility(false);
        } else if (drawTypeParam == "threejs"){
            //document.getElementById(canvasId).style.display = "";
            //document.getElementById("3dContainer").style.display = "none";
            threeJsRenderer.setProductImage(productImage);
            threeJsRenderer.init3d();
            webglRenderer.setVisibility(false);
            canvasRenderer.setVisibility(false);
            threeJsRenderer.setVisibility(true);
        } else {
            webglRenderer.setVisibility(false);
            canvasRenderer.setVisibility(true);
            threeJsRenderer.setVisibility(false);
        }
    }

    this.setPatternSize = function(patternSizeParam) {
        patternSize = patternSizeParam;
        canvasRenderer.setPatternSize(patternSizeParam);
        draw();
    }

    this.setPatternImage = function(patternImageParam) {
        var patternImageSource = patternImageParam.src.split("/");
        patternImageId = patternImageSource[patternImageSource.length - 1].split(".")[0];
        patternImageId = patternImageId[patternImageId.length - 1];
        patternImage = patternImageParam;
        patternMaker.setPatternImage(patternImageParam);
        patternImage.onload = function() {
            changeImageDimensions();
            draw();
        }
    }

    var draw = function() {
        patternMaker.makePattern(drawX, drawY);
        if (drawType == "canvas" || drawType == "threejs")
            canvasRenderer.render2D();
        if (drawType == "webgl")
            webglRenderer.drawWebgl();
        if (drawType == "threejs")
            threeJsRenderer.render();
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

    this.animateMethod = function() {
        animate();
    }

    function animate() {
        draw();
        if (keepRendering)
            requestAnimationFrame(animate);
    }

    var interp = new Image();
    var model = new Image();
    var source = new Image();
    var mask = new Image();

    var derp = "derp";

    var canvasRenderer = new CanvasRenderer(canvas, patternCanvas);
    var webglRenderer = new WebglRenderer(interp, source, model, mask, patternCanvas);
    var threeJsRenderer = new ThreeJsRenderer(canvas, patternCanvas);
    var patternMaker = new PaternMaker(patternCanvas);

    patternImage.onload=function() {
        productImage.onload=function() {
            changeImageDimensions();
            canvasRenderer.setProductImage(productImage);
            patternMaker.setPatternImage(patternImage);
            canvas.width = productImage.width;
            canvas.height = productImage.height;
            interp.onload = function() {
                source.onload = function() {
                    model.onload = function() {
                        mask.onload = function() {
                            self.setDrawType(drawTypeParam);
                            draw();
                        }
                        mask.src = "mask.png";
                    }
                    model.src = "model1.jpg"
                }
                source.src = "uv.png";
            }
            interp.src = "dasd.png";
        }
        productImage.src = productImageSrc;
    }
}

function PaternMaker(patternCanvasParam) {

    var self = this;

    var patternCanvas = patternCanvasParam;
    var patternContext = patternCanvasParam.getContext("2d");
    var pattern, patternImage;

    this.setPatternImage = function(patternImageParam) {
        patternImage = patternImageParam;
        pattern = patternContext.createPattern(patternImage, 'repeat');
    }

    this.makePattern = function(currentX, currentY)  {
        patternContext.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
        patternContext.rect(0, 0, patternCanvas.width, patternCanvas.height);
        patternContext.translate(currentX, currentY);
        patternContext.fillStyle = pattern;
        patternContext.fillRect(-currentX, -currentY, patternCanvas.width, patternCanvas.height);
        patternContext.translate(-currentX, -currentY);
    }

}

function WebglRenderer(interp, source, model, mask, patternCanvasParam) {

    var self = this;
    var program;
    var vertexPositionsBuffer;
    var uvBuffer;
    var gl;
    var patternCanvas = patternCanvasParam;
    var canvas;

    this.setVisibility = function(visible) {
        if (visible) {
            $(canvas).css("display", "");
            console.log("vis");
        } else {
            $(canvas).css("display", "none");
            console.log("invis");
        }
    }

    function setupGlTexture(glTextureUnit, texture) {
        gl.activeTexture(glTextureUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    function uploadGlTexture(glTextureUnit, canvasOrImage) {
        gl.activeTexture(glTextureUnit);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvasOrImage);
    }

    function setupGlUniformTexture(name, slot) {
        if (program)
        {
            var location = gl.getUniformLocation(program, name);
            gl.uniform1i(location, slot);
        }
    }

    this.initWebgl = function() {

        console.log("init");

        canvas = document.createElement('canvas');
        canvas.setAttribute('width', 500);
        canvas.setAttribute('height', 555);

        $("#3dContainer").append(canvas);

        gl = canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        var interpTexture = gl.createTexture();
        var modelTexture = gl.createTexture();
        var sourceTexture = gl.createTexture();
        var maskTexture = gl.createTexture();

        setupGlTexture(gl.TEXTURE0, interpTexture);
        setupGlTexture(gl.TEXTURE1, modelTexture);
        setupGlTexture(gl.TEXTURE2, sourceTexture);
        setupGlTexture(gl.TEXTURE3, maskTexture);
        uploadGlTexture(gl.TEXTURE0, interp);
        uploadGlTexture(gl.TEXTURE1, model);
        uploadGlTexture(gl.TEXTURE2, source);
        uploadGlTexture(gl.TEXTURE3, mask);

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var vertexShaderSource = $("#vertexShaderWebgl").html();
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        var fragmentShaderSource = $("#fragmentShaderWebgl").html();
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        gl.useProgram(program);

        var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

        setupGlUniformTexture("u_interp", 0);
        setupGlUniformTexture("u_model", 1);
        setupGlUniformTexture("u_source", 2);
        setupGlUniformTexture("u_mask", 3);

        var texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        var positionLocation = gl.getAttribLocation(program, "a_position");

        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1.0, -1.0,
                1.0, -1.0,
                -1.0, 1.0,
                -1.0, 1.0,
                1.0, -1.0,
                1.0, 1.0]),
            gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        self.drawWebgl();
    }

    this.drawWebgl = function() {
        uploadGlTexture(gl.TEXTURE2, patternCanvas);

        gl.clearColor(1.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

}

function CanvasRenderer(canvasParam, patternCanvasParam, derp) {

    var self = this;

    var canvas = canvasParam;
    var canvasContext = canvas.getContext("2d");
    var patternCanvas = patternCanvasParam;
    var patternSize = 1;
    var productImage;

    this.setVisibility = function(visible) {
        if (visible) {
            $(canvas).css("display", "");
        } else {
            $(canvas).css("display", "none");
        }
    }

    this.setProductImage = function(productImageParam) {
        productImage = productImageParam;
    }

    this.setPatternSize = function(patternSizeParam) {
        patternSize = patternSizeParam;
    }

    this.render2D = function() {
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.drawImage(productImage,0,0);
        canvasContext.globalCompositeOperation="source-atop";
        canvasContext.globalAlpha = 0.75;
        canvasContext.drawImage(patternCanvas, 0, 0, patternCanvas.width * patternSize, patternCanvas.height * patternSize);
        canvasContext.globalAlpha = 1;
        canvasContext.globalCompositeOperation = "multiply";
        canvasContext.drawImage(productImage,0,0);
    }
}

function ThreeJsRenderer(canvasParam, patternCanvasParam) {

    var self = this;

    var patternCanvas = patternCanvasParam;
    var canvas = canvasParam;
    var renderCanvas;
    var scene, camera, renderer, plane;
    var animationID;
    var keepRendering = true;
    var productImage;

    this.setProductImage = function(productImageParam) {
        productImage = productImageParam;
    }

    this.setVisibility = function(visible) {
        if (visible) {
            $(renderCanvas).css("display", "");
        } else {
            $(renderCanvas).css("display", "none");
        }
    }

    this.init3d = function() {
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
        renderCanvas = renderer.domElement;
        document.getElementById("3dContainer").appendChild(renderCanvas);

        var DiffuseTexture = new THREE.Texture(canvas);
        var DisplacementTexture = new THREE.ImageUtils.loadTexture("imgs/DisplacementMap.jpg", {}, self.render);
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

    this.render = function() {
        plane.material.uniforms.tDiffuse.value.needsUpdate = true;
        renderer.render(scene, camera);
    }
}