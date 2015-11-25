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
    <script id="fragmentShaderWebgl" type="x-shader/x-fragment">
        precision mediump float;

        uniform sampler2D u_interp;
        uniform sampler2D u_model;
        uniform sampler2D u_source;
        uniform sampler2D u_mask;
        varying vec2 v_texCoord;

        void main()
        {
          vec4 uvmap = texture2D(u_interp, v_texCoord);
          vec2 txy = vec2((uvmap.x * 256. + uvmap.y) / 257., (uvmap.z * 256. + uvmap.w) / 257.);
          vec3 c = texture2D(u_source, txy).xyz;
          float sourceOpacity = texture2D(u_source, txy).a;
          float mask = texture2D(u_mask, v_texCoord).x;
          vec3 base = texture2D(u_model, v_texCoord).xyz;

          if (mask > 0.5)
          {
            vec3 c2;
            if (sourceOpacity < 0.1) {
                c2 = base;
            } else {
                c2 = (c * (1. + (base.x-0.8) / length(c)) * mask) + base*(1.-mask);
            }
            gl_FragColor = vec4(c2.x, c2.y, c2.z, 1);
          }
          else
          {
             gl_FragColor = vec4(base.x, base.y, base.z, 1);
          }
        }
    </script>
    <script id="vertexShaderWebgl" type="x-shader/x-vertex">
        precision mediump float;

        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;

        void main()
        {
          gl_Position = vec4(a_position, 0, 1);
          v_texCoord = a_texCoord;
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
</div>
<canvas id="colourChangeCanvas" width=600 height=600></canvas>
<canvas id="patternCanvas" width=1000 height=1000></canvas>
<canvas id="canvas3dPrepare"></canvas>
</body>
</html>