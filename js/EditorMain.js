
$(document).ready(function() {

    var colourChanged = null;
    var patternImage = new Image();
    patternImage.src = "imgs/patterns/pattern0.png";

    var colourChanger = null;
    var productPreview = new ProductPreview("canvas", "patternCanvas", "imgs/sweater.png", patternImage, 1, "webgl");
    var mouseHandler = new MouseHandler(productPreview);

    $(window).load(function() {
        colourChanger = new ColourChanger(productPreview);
        getColours(productPreview.getPatternImageId());
    });

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
        // Paima raðto atskirø detaliø spalvas.
        var newColours = colours[colourId];

        var index = 0;
        // Eina per visus paveiksliuko pixelius
        for (var i = 0, l = originalPixels.data.length; i < l; i+= 4) {
            // Paima pixelio spalvà
            var pixelColour = {R: originalPixels.data[i], G: originalPixels.data[i + 1], B: originalPixels.data[i + 2]};
            // Suranda kurià spalvà reikia naudoti pagal originalaus paveiksliuko pixelio spalvà
            var colourIndex = getColourIndex(pixelColour);
            if (colourIndex >= newColours.length) {
                // Pakeicia pixelio spalva, jeigu foldery nera tiek paveiksliuku su spalvom kokio indexo dabar reikia,
                // tai imama pirma spalva ir didinamas indexas ir t.t. Jeigu neranda spalvos pagal ta indexa tai ima
                // tas kurios yra is eiles visas.
                currentPixels.data[i] = newColours[index].R;
                currentPixels.data[i + 1] = newColours[index].G;
                currentPixels.data[i + 2] = newColours[index].B;
                index++;
                // Jei jau priejo prie paskutines spalvos vel pradeda per nauja
                if (index >= newColours.length) index = 0;
            } else {
                // Tikrina ar pixelis nera visiskai permatomas, nes ner prasmes keist spalva jei nematomas pixelis
                if (currentPixels.data[i + 3] > 0) {
                    // Pakeicia spalva pixelio ir situo atveju foldery yra tiek spalvu, kiek reikia kad pakeist visu
                    // rasto daliu spalvas.
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