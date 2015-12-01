
$(document).ready(function() {

    var colourChanged = null;
    var patternImage = new Image();
    patternImage.src = "imgs/patterns/pattern0.png";
    var imageID = 0;

    // Divas ekrano uzdengimui kraunant
    var loadingDiv = document.createElement("div");
    loadingDiv.id = "loadingCover";

    var colourChanger = null;
    var productPreview = new ProductPreview("canvas", "patternCanvas", "imgs/renderPictures/0/model.png", patternImage, 1, "webgl");
    var mouseHandler = new MouseHandler(productPreview);

    window.onload = function()
    {
        colourChanger = new ColourChanger(productPreview);
        getColours(productPreview.getPatternImageId());
    };

    function getColours(colourId) {
        $.ajax({
            type: "POST",
            url: "getColours.php",
            data: { patternId : colourId },
            success: function(response) {
                var data = JSON.parse(response);
                colourChanger.setColours(data);
                colourChanger.displayColourButtons();
            }
        });
    }

    // Defaultine uzsakymo reiksme
    $("#orderButton").attr("clotheNumber", 0);

    // Uzsakymo funkcija
    $("#orderButton").click( function(e) {
        var garmentId = $(this).attr("clotheNumber");
        var canvas = document.createElement('canvas');
        var uvMap = new Image();
        uvMap.onload = function() {
            canvas.setAttribute('width', uvMap.width);
            canvas.setAttribute('height', uvMap.height);
            $("#container").append(canvas);
            var context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(uvMap,0,0);
            context.globalCompositeOperation="source-atop";
            var patternCanvas = document.getElementById("patternCanvas");
            context.drawImage(patternCanvas, 0, 0, canvas.width, canvas.height);
        }
        uvMap.src = "imgs/renderPictures/uvMaps/uv" + garmentId + ".png";
    });

    $(".clothesButton").click( function(e) {
        $("#container").append(loadingDiv);
        var clothID = $(this).attr("clotheNumber");
        $("#orderButton").attr("clotheNumber", clothID);
        console.log(clothID);
        var modelImage = new Image();
        var maskImage = new Image();
        var uvImage = new Image();
        modelImage.onload = function() {
            maskImage.onload = function() {
                uvImage.onload = function() {
                    productPreview.setWebglResource(uvImage, modelImage, maskImage);
                    $("#loadingCover").remove();
                }
                uvImage.src = "imgs/renderPictures/"+ clothID +"/uv.png";
                //productPreview.setDisplacement(displacementImage);
                //productPreview.setImage(productImage);
            }
            maskImage.src = "imgs/renderPictures/"+ clothID +"/mask.png";
        }
        modelImage.src = "imgs/renderPictures/" + clothID + "/model.png";

    });

    $(".patternButton").click( function(e) {
        var buttonId = $(this).attr("buttonNumber");
        var i = productPreview.getPatternImageId();
        if (buttonId != productPreview.getPatternImageId()) {
            var newImage = new Image();
            newImage.src = "imgs/patterns/pattern" + buttonId + ".png";
            productPreview.setOriginalPatternImage(newImage);
            productPreview.setOriginalSizePatternImage(newImage);
            productPreview.setPatternImage(newImage);
            getColours(productPreview.getPatternImageId());
            colourChanged = null;
        }
    });

    $(".sizeButton").click( function(e) {
        var sizeID = $(this).attr("sizeNumber");

        console.log(sizeID);
        switch(sizeID) {
            case '2':
                productPreview.setPatternSize(1.5);
                break;
            case '1':
                productPreview.setPatternSize(1.25);
                break;
            case '0':
                productPreview.setPatternSize(1);
                break;
        }

    });

    $("#colours").on("click", "div", function (e)
    {
        var buttonId = $(this).attr("id");
        if (colourChanged == null || colourChanged != buttonId) {
            colourChanger.changeImageColour(buttonId);
            colourChanged = buttonId;
        }
    });
});

// Spalvos keitiklio klase

function ColourChanger(productPreviewParam)
{
    var productPreview = productPreviewParam;
    var canvas = document.getElementById("colourChangeCanvas");
    var context = canvas.getContext("2d");
    var originalPixels = null;
    var currentPixels = null;
    var canvasReady = false;
    var colours = [];
    var imageColours = [];

    this.getColours = function()
    {
        return colours;
    }

    this.setColours = function(coloursParam)
    {
        colours = coloursParam;
        this.displayColourButtons();
    }

    canvas.onload = function()
    {
        canvasReady = true;
    }

    this.setProductPreview = function(productPreviewParam)
    {
        productPreview = productPreviewParam;
    }

    this.getProductPreview = function()
    {
        return productPreview;
    }

    var getPixels = function()
    {
        var patternImage = productPreview.getOriginalPatternImage();
        canvas.width = patternImage.width;
        canvas.height =  patternImage.height;
        context.drawImage(
            patternImage,
            0,
            0,
            patternImage.naturalWidth,
            patternImage.naturalHeight,
            0,
            0,
            patternImage.width,
            patternImage.height
        );

        originalPixels = context.getImageData(
            0,
            0,
            patternImage.width,
            patternImage.height
        );

        imageColours = [];
        for (var i = 0, l = originalPixels.data.length; i < l; i+= 4) {
            var colour = {R: originalPixels.data[i], G: originalPixels.data[i + 1], B: originalPixels.data[i + 2]};
            if (!colourExists(colour, imageColours)) {
                imageColours.push(colour);
            }
        }

        currentPixels = context.getImageData(
            0,
            0,
            patternImage.width,
            patternImage.height
        );
    }

    var colourExists = function(colour, array)
    {
        for (var i = 0; i < array.length; i++) {
            if (array[i].R == colour.R && array[i].G == colour.G && array[i].B == colour.B)
                return true;
        }
        return false;
    }

    var getColourIndex = function(colour)
    {
        for (var i = 0; i < imageColours.length; i++) {
            if (imageColours[i].R == colour.R && imageColours[i].G == colour.G && imageColours[i].B == colour.B)
                return i;
        }
        return -1;
    }

    var changeColour = function(colourId)
    {
        canvasReady = false;
        if(!originalPixels) return;
        var newColours = colours[colourId];

        var index = 0;
        for (var i = 0, l = originalPixels.data.length; i < l; i+= 4) {
            var pixelColour = {R: originalPixels.data[i], G: originalPixels.data[i + 1], B: originalPixels.data[i + 2]};
            var colourIndex = getColourIndex(pixelColour);
            if (colourIndex >= newColours.length) {
                currentPixels.data[i] = newColours[index].R;
                currentPixels.data[i + 1] = newColours[index].G;
                currentPixels.data[i + 2] = newColours[index].B;
                index++;
                if (index >= newColours.length) index = 0;
            } else {
                if (currentPixels.data[i + 3] > 0) {
                    currentPixels.data[i] = newColours[colourIndex].R;
                    currentPixels.data[i + 1] = newColours[colourIndex].G;
                    currentPixels.data[i + 2] = newColours[colourIndex].B;
                }
            }
        }

        context.putImageData(currentPixels, 0, 0);
        return canvas.toDataURL("image/png");
    }

    this.changeImageColour = function(colourId)
    {
        getPixels();
        var colourURL = changeColour(colourId);
        var newImage = new Image();
        newImage.src = colourURL;
        productPreview.setPatternImage(newImage);
        productPreview.setOriginalSizePatternImage(newImage);
    }


    this.displayColourButtons = function()
    {
        var colourDiv = document.getElementById("colours");
        while (colourDiv.firstChild) {
            colourDiv.removeChild(colourDiv.firstChild);
        }
        for (i = 0; i < colours.length; i++) {
            getPixels();
            var colourURL = changeColour(i);
            var colourImage = new Image();
            colourImage.src = colourURL;
            var newDiv = document.createElement("div");
            newDiv.className = "colourButton";
            newDiv.style.backgroundImage = "url(" + colourURL + ")";
            newDiv.id = i;
            colourDiv.appendChild(newDiv);
        }
    }
}