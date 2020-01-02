// *** CSE 5542 Lab 5 ******** //
// *** Author: Lujia Wang **** //
// *** Date: December 2019 *** //

var gl;
var shaderProgram = [];
var environmentProgram;

var use_texture = 0;

var light_ambient = [0, 0, 0, 1];
var light_diffuse = [.8, .8, .8, 1];
var light_specular = [1, 1, 1, 1];
var light_pos = [0, 0, 0, 1]; // eye space position 

var mat_ambient = [0, 0, 0, 1]; 
var mat_diffuse= [1, 1, 0, 1]; 
var mat_specular = [.9, .9, .9,1]; 
var mat_shine = [50]; 


//////////// Init OpenGL Context etc. ///////////////

function initGL(canvas) {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {}

    if (!gl) {
        alert("Could not initialize WebGL, sorry :-(");
    }
}

////////////// Init Texture //////////////////////////////////
var sampleTexture; 

function initTextures() {
    sampleTexture = gl.createTexture();
    sampleTexture.image = new Image();
    sampleTexture.image.onload = function() { handleTextureLoaded(sampleTexture); }
    sampleTexture.image.src = "texture.png";    
    console.log("loading texture....") 
}

function handleTextureLoaded(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
}


////////////////// Init Cube map /////////////////////////////

var cubemapTexture;

function initCubeMap() {
    cubemapTexture = gl.createTexture();
    cubemapTexture.image1 = new Image();
    cubemapTexture.image1.onload = function() { handleCubemapTextureLoaded(cubemapTexture); }
    cubemapTexture.image1.src = "cubemap/px.png";

    cubemapTexture.image2 = new Image();
    cubemapTexture.image2.onload = function() { handleCubemapTextureLoaded(cubemapTexture); }
    cubemapTexture.image2.src = "cubemap/nx.png";

    cubemapTexture.image3 = new Image();
    cubemapTexture.image3.onload = function() { handleCubemapTextureLoaded(cubemapTexture); }
    cubemapTexture.image3.src = "cubemap/py.png";
    
    cubemapTexture.image4 = new Image();
    cubemapTexture.image4.onload = function() { handleCubemapTextureLoaded(cubemapTexture); }
    cubemapTexture.image4.src = "cubemap/ny.png";
    
    cubemapTexture.image5 = new Image();
    cubemapTexture.image5.onload = function() { handleCubemapTextureLoaded(cubemapTexture); }
    cubemapTexture.image5.src = "cubemap/pz.png";
    
    cubemapTexture.image6 = new Image();
    cubemapTexture.image6.onload = function() { handleCubemapTextureLoaded(cubemapTexture); }
    cubemapTexture.image6.src = "cubemap/nz.png";

}    
function handleCubemapTextureLoaded(texture) {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.REPEAT); 
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR); 

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image1);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image2);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image3);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image4);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image5);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		  texture.image6);    
}



///////////////////////////////////////////////////////////////
/////////////////////// Draw Scene ////////////////////////////
///////////////////////////////////////////////////////////////

var mstack = [];

var mMatrix = mat4.create();
var vMatrix = mat4.create();
var pMatrix = mat4.create();
var nMatrix = mat4.create();

var v2wMatrix = mat4.create();

function degToRad(degrees) {
    return degrees * Math.PI / 100;
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram[0].mMatrixUniform, false, mMatrix);
    gl.uniformMatrix4fv(shaderProgram[0].vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram[0].pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram[0].nMatrixUniform, false, nMatrix);
    gl.uniformMatrix4fv(shaderProgram[0].v2wMatrixUniform, false, v2wMatrix);		
}

function PushMatrix(stack, matrix) {
    var copy = mat4.create();
    mat4.set(matrix, copy);
    stack.push(copy);
}

function PopMatrix(stack) {
    if (stack.length == 0) {
        throw "Invalid popMatrix!";
    }
    var copy = stack.pop();
    return copy;
}

function setLightUniforms() {
    shaderProgram[0].light_posUniform = gl.getUniformLocation(shaderProgram[0], "light_pos");

    gl.uniform4f(shaderProgram[0].light_ambientUniform, light_ambient[0], light_ambient[1], light_ambient[2], 1.0);
    gl.uniform4f(shaderProgram[0].light_diffuseUniform, light_diffuse[0], light_diffuse[1], light_diffuse[2], 1.0);
    gl.uniform4f(shaderProgram[0].light_specularUniform, light_specular[0], light_specular[1], light_specular[2], 1.0);

    gl.uniform4f(shaderProgram[0].light_posUniform, light_pos[0], light_pos[1], light_pos[2], light_pos[3]);

    gl.uniform4f(shaderProgram[0].ambient_coefUniform, mat_ambient[0], mat_ambient[1], mat_ambient[2], 1.0);
    gl.uniform4f(shaderProgram[0].diffuse_coefUniform, mat_diffuse[0], mat_diffuse[1], mat_diffuse[2], 1.0);
    gl.uniform4f(shaderProgram[0].specular_coefUniform, mat_specular[0], mat_specular[1], mat_specular[2], 1.0);
    gl.uniform1f(shaderProgram[0].shininess_coefUniform, mat_shine[0]);
}


var then = 0;

  // Draw the scene repeatedly
function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene(now);

    requestAnimationFrame(render);
}

function drawScene(now) {
    initScene();

    pMatrix = mat4.perspective(60, 1.0, 0.1, 100, pMatrix); //field of view, aspect ratio, near plane distance, far plane distance
    vMatrix = mat4.lookAt([0.0, 0.0, 5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix); //postion; center of interest; viewup vector

    mat4.identity(mMatrix);

    PushMatrix(mstack, mMatrix);
    mMatrix = mat4.rotate(mMatrix, degToRad(Z_angle+now*5), [0, 1, 0]);

    mat4.identity(nMatrix);
    nMatrix = mat4.multiply(nMatrix, vMatrix);
    nMatrix = mat4.multiply(nMatrix, mMatrix);
    nMatrix = mat4.inverse(nMatrix);
    nMatrix = mat4.transpose(nMatrix);

    mat4.identity(v2wMatrix);
    v2wMatrix = mat4.multiply(v2wMatrix, vMatrix);
    v2wMatrix = mat4.transpose(v2wMatrix);

    setLightUniforms();


    gl.uniform1i(shaderProgram[0].use_textureUniform, use_texture);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
    gl.uniform1i(shaderProgram[0].cube_map_textureUniform, 1);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sampleTexture);
    gl.uniform1i(shaderProgram[0].textureUniform, 0);

    drawModel(now); 
    drawEllip();


    mMatrix = PopMatrix(mstack);
    mMatrix = mat4.rotate(mMatrix, degToRad(Z_angle+now), [0, 1, 0]);

    drawBox();

}

////////////////////////////////////////////////////////////////////////

function initScene() {
    gl.clearColor(0.0, 0.0, 0.0, 0.0);	//background color

	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

var boxPositionBuffer;
var m_box = mat4.create();
function initEnviron(){
    var positions = [
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,     ];
    boxPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    boxPositionBuffer.itemSize = 2;
    boxPositionBuffer.numItems = 6;

    gl.bindBuffer(gl.ARRAY_BUFFER, boxPositionBuffer);      //active VBO
    gl.vertexAttribPointer(shaderProgram[0].vertexPositionAttribute, boxPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    mat4.identity(m_box);
    mMatrix = mat4.multiply(mMatrix, m_box);
    setMatrixUniforms();

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

////////////////////////////////////////////////////////////////////////
///////////////////////////// webGL Start //////////////////////////////
////////////////////////////////////////////////////////////////////////

function enableProgram0(){
    gl.enableVertexAttribArray(shaderProgram[0].vertexPositionAttribute);
    gl.enableVertexAttribArray(shaderProgram[0].vertexNormalAttribute);
    gl.enableVertexAttribArray(shaderProgram[0].vertexColorAttribute);
    gl.enableVertexAttribArray(shaderProgram[0].vertexTexCoordsAttribute);  
}

function webGLStart() {

    var canvas = document.getElementById("lab_canvas");
    initGL(canvas);
    initShaders();

    gl.enable(gl.DEPTH_TEST);

    //location of vertex shader attribute
    shaderProgram[0].vertexPositionAttribute = gl.getAttribLocation(shaderProgram[0], "aVertexPosition");
    shaderProgram[0].vertexNormalAttribute = gl.getAttribLocation(shaderProgram[0], "aVertexNormal");
    shaderProgram[0].vertexColorAttribute = gl.getAttribLocation(shaderProgram[0], "aVertexColor");

    //mvpn matrices
    shaderProgram[0].mMatrixUniform = gl.getUniformLocation(shaderProgram[0], "uMMatrix");
    shaderProgram[0].vMatrixUniform = gl.getUniformLocation(shaderProgram[0], "uVMatrix");
    shaderProgram[0].pMatrixUniform = gl.getUniformLocation(shaderProgram[0], "uPMatrix");
    shaderProgram[0].nMatrixUniform = gl.getUniformLocation(shaderProgram[0], "uNMatrix");
	shaderProgram[0].v2wMatrixUniform = gl.getUniformLocation(shaderProgram[0], "uV2WMatrix");		

    //light
    shaderProgram[0].light_posUniform = gl.getUniformLocation(shaderProgram[0], "light_pos");
    shaderProgram[0].ambient_coefUniform = gl.getUniformLocation(shaderProgram[0], "ambient_coef");
    shaderProgram[0].diffuse_coefUniform = gl.getUniformLocation(shaderProgram[0], "diffuse_coef");
    shaderProgram[0].specular_coefUniform = gl.getUniformLocation(shaderProgram[0], "specular_coef");
    shaderProgram[0].shininess_coefUniform = gl.getUniformLocation(shaderProgram[0], "mat_shininess");

    shaderProgram[0].light_ambientUniform = gl.getUniformLocation(shaderProgram[0], "light_ambient");
    shaderProgram[0].light_diffuseUniform = gl.getUniformLocation(shaderProgram[0], "light_diffuse");
    shaderProgram[0].light_specularUniform = gl.getUniformLocation(shaderProgram[0], "light_specular");


    //texture
    shaderProgram[0].vertexTexCoordsAttribute = gl.getAttribLocation(shaderProgram[0], "aVertexTexCoords");
    shaderProgram[0].textureUniform = gl.getUniformLocation(shaderProgram[0], "myTexture");
    shaderProgram[0].cube_map_textureUniform = gl.getUniformLocation(shaderProgram[0], "cubeMap");	
    shaderProgram[0].use_textureUniform = gl.getUniformLocation(shaderProgram[0], "use_texture");

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    initTextures();
    initCubeMap();

    enableProgram0();
    initJSON();
    initEllipBuffer();
    initBox();

    //drawScene(0);
}

///////////////////////////////////////////////////////////////
///////////////////// Mouse and Keyboard //////////////////////
///////////////////////////////////////////////////////////////

var lastMouseX = 0,
    lastMouseY = 0;
var Z_angle = 0;

///////////////////////////////////////////////////////////////

function onDocumentMouseDown(event) {
    event.preventDefault();
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);
    var mouseX = event.clientX;
    var mouseY = event.clientY;

    lastMouseX = mouseX;
    lastMouseY = mouseY;

}

function onDocumentMouseMove(event) {
    var mouseX = event.clientX;
    var mouseY = event.ClientY;

    var diffX = mouseX - lastMouseX;
    var diffY = mouseY - lastMouseY;

    Z_angle = Z_angle + diffX / 5;

    lastMouseX = mouseX;
    lastMouseY = mouseY;

    requestAnimationFrame(render);
}

function onDocumentMouseUp(event) {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

function onDocumentMouseOut(event) {
    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

//////////////////////////////////////////////////////////////////////
function texture(value) {

    use_texture = value;
    requestAnimationFrame(render);

} 