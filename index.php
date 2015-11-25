<!doctype html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <link rel="stylesheet" type="text/css" href="css/style.css">
    <script src="js/libs/three.js"></script>
    <script src="js/libs/jquery-2.1.4.js"></script>



    <script src="js/ProductPreview.js"></script>
    <script src="js/EditorMain.js"></script>
    <script id="fragmentShader" type="x-shader/x-fragment">
        #ifdef GL_ES
        precision highp float;
        #endif

    	uniform sampler2D tDiffuse;

    	varying vec2 vUv;

        void main(void)
        {
            vec4 Cdiff = texture2D(tDiffuse, vUv);
            if (Cdiff.a > 0.9)
                gl_FragColor = Cdiff;
            else
                gl_FragColor = vec4(0, 0, 0, 0);
        }
    </script>
</head>

<body>

<div id="container">

    <div id="optionsContainer">
        <div id="size">
            <div class="optionHeader">Dydžiai</div>
            <ul id="sizeList">
                <?php
                    $dir = new DirectoryIterator(dirname(__DIR__ . '/imgs/size/*'));
                    $i = 0;
                    foreach ($dir as $fileinfo) {
                        if (!$fileinfo->isDot() && $fileinfo->isFile()) {
                            echo "<li sizeNumber='$i' class=\"sizeButton\" style=\"background-image: url('imgs/size/normal$i.png')\"></li>\n";
                            $i++;
                        }
                    }
                ?>
            </ul>
        </div>

        <div id="patterns">
        <div class="optionHeader">Raštai</div>
            <ul id="patternList">
                <?php
                    $dir = new DirectoryIterator(dirname(__DIR__ . '/imgs/patterns/*'));
                        $i = 0;
                        foreach ($dir as $fileinfo) {
                            if (!$fileinfo->isDot() && $fileinfo->isFile()) {
                                echo "<li buttonNumber='$i' class=\"patternButton\" style=\"background-image: url('imgs/patterns/pattern$i.png')\"></li>\n";
                                $i++;
                            }
                        }
                ?>
            </ul>
        </div>
		
		
        <div id="coloursContainer">
            <div class="optionHeader">Spalvos</div>
            <div id="colours"></div>
        </div>
    </div>
       <div id="canvasContainer">
            <canvas id="canvas" width=600 height=600></canvas>
            <div id="3dContainer" width=600 height=600></div>
       </div>
	   
	   <div id="clothesContainer">
        <div class="optionHeader">Drabužiai</div>
		 <div id="clothes">
            <ul id="clothesList">
                <?php
                    $dir = new DirectoryIterator(dirname(__DIR__ . '/imgs/clothes/*'));
                        $i = 0;
                        foreach ($dir as $fileinfo) {
                            if (!$fileinfo->isDot() && $fileinfo->isFile()) {
                                echo "<li clotheNumber='$i' class=\"clothesButton\" style=\"background-image: url('imgs/clothes/clothe$i.png')\"></li>\n";
                                $i++;
                            }
                        }
                ?>
            </ul>
		 </div>
        </div>
	   
	   
</div>
<canvas id="colourChangeCanvas" width=600 height=600></canvas>
<canvas id="patternCanvas" width=1000 height=1000></canvas>
<canvas id="canvas3dPrepare"></canvas>
</body>
</html>