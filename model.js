// *** CSE 5542 Lab 5 ****** //
// *** Model information *** //


////////////////    Initialize JSON geometry file ///////////

var modelvert = [];
var modelnorm = [];
var modeluv = [];

function initJSON() {
    var request = new XMLHttpRequest();
    request.open("GET", "model.json");
    request.onreadystatechange =
        function() {
            if (request.readyState == 4) {
                console.log("state =" + request.readyState);
                handleLoadedModel(JSON.parse(request.responseText));
            }
        }
    request.send();
}



function handleLoadedModel(JSdata){
	modelvert = JSdata.geometries[0].data.attributes.position.array;
	modelnorm = JSdata.geometries[0].data.attributes.normal.array;

	initModelBuffer();
	requestAnimationFrame(render);
  	//requestAnimationFrame(render);
}


var modelVertexPositionBuffer;
var modelVertexColorBuffer;
var modelVertexNormalBuffer;

var modelVertexTextureCoordsBuffer;

function initModelBuffer(){

	modelVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelvert), gl.STATIC_DRAW);
	modelVertexPositionBuffer.itemSize = 3;
	modelVertexPositionBuffer.numItems = modelvert.length / 3;


	modelVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelnorm), gl.STATIC_DRAW);
	modelVertexNormalBuffer.itemSize = 3;
	modelVertexNormalBuffer.numItems = modelnorm.length / 3;


	modelVertexTextureCoordsBuffer = modelVertexPositionBuffer;


	modelVertexColorBuffer = modelVertexNormalBuffer;

}


///////////////// Draw Scene //////////////////////////////////
var m_model = mat4.create();

function drawModel(now){

	mat4.identity(m_model);
	m_model = mat4.translate(m_model, [0,-1,0]);


	mMatrix = mat4.multiply(mMatrix, m_model);

    PushMatrix(mstack, mMatrix);

	setMatrixUniforms();

	//connect buffer to shader attribute
	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexPositionBuffer);		//active VBO
	gl.vertexAttribPointer(shaderProgram[0].vertexPositionAttribute, modelVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexNormalBuffer);		//active VBO
	gl.vertexAttribPointer(shaderProgram[0].vertexNormalAttribute, modelVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexTextureCoordsBuffer);
	gl.vertexAttribPointer(shaderProgram[0].vertexTexCoordsAttribute, modelVertexTextureCoordsBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, modelVertexColorBuffer);	
	gl.vertexAttribPointer(shaderProgram[0].vertexColorAttribute, modelVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);


	gl.drawArrays(gl.TRIANGLES, 0, modelVertexPositionBuffer.numItems);
}
