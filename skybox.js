
var boxVertexPositionBuffer;
var boxVertexNormalBuffer;
var boxVertexTextureCoordBuffer;
var boxVertexIndexBuffer;
var boxVertexColorBuffer;
var m_box = mat4.create();

    var positions = [];
    var normals = [];
    var texCoords = [];
    var indices = [];

function initBox() {

    function face(xyz, nrm) {
        var start = positions.length / 3;
        var i;
        for (i = 0; i < 12; i++) {
            positions.push(xyz[i]);
        }
        for (i = 0; i < 4; i++) {
            normals.push(nrm[0], nrm[1], nrm[2]);
        }
        texCoords.push(0, 0, 1, 0, 1, 1, 0, 1);
        indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
    }
    face([-1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1], [0, 0, 1]);
    face([-1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1], [0, 0, -1]);
    face([-1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1], [0, 1, 0]);
    face([-1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1], [0, -1, 0]);
    face([1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1], [1, 0, 0]);
    face([-1, -1, -1, -1, -1, 1, -1, 1, 1, -1, 1, -1], [-1, 0, 0]);

    boxVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    boxVertexPositionBuffer.itemSize = 3;
    boxVertexPositionBuffer.numItems = 24;

    boxVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    boxVertexNormalBuffer.itemSize = 3;
    boxVertexNormalBuffer.numItems = 6;

    boxVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
    boxVertexTextureCoordBuffer.itemSize = 2;
    boxVertexTextureCoordBuffer.numItems = 24;

    boxVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    boxVertexIndexBuffer.itemSize = 1;
    boxVertexIndexBuffer.numItems = 36;

    boxVertexColorBuffer = boxVertexNormalBuffer;
}

var boxP = mat4.create();
var boxMV = mat4.create();


function drawBox(){
	//gl.clearColor(0,0,0,1);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	//boxP = mat4.perspective(60, 1.0, 0.1, 200, boxP); //field of view, aspect ratio, near plane distance, far plane distance
    mat4.identity(m_box);
    mat4.identity(mMatrix);
    m_box = mat4.scale(m_box, [10, 10, 10]);
    boxMV = mat4.multiply(boxMV, m_box);

    mMatrix = mat4.multiply(mMatrix, m_box);


    setMatrixUniforms();


    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexPositionBuffer);      //active VBO
    gl.vertexAttribPointer(shaderProgram[0].vertexPositionAttribute, boxVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexNormalBuffer);        //active VBO
    gl.vertexAttribPointer(shaderProgram[0].vertexNormalAttribute, boxVertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram[0].vertexTexCoordsAttribute, boxVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexColorBuffer); 
    gl.vertexAttribPointer(shaderProgram[0].vertexColorAttribute, boxVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxVertexIndexBuffer);

    gl.drawElements(gl.TRIANGLES, boxVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}

