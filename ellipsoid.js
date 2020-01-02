// *** CSE 5542 Lab 5 *********************** //
// *** Parametric - ellipsoid information *** //


var ellipverts = [];
var ellipcolors = [];
var ellipindicies = [];
var ellipnormals = [];

var sectorCount = 36;
var stackCount = 18;
var a=3.0, b=1.0, c=3.0;


function createEllipsoid(){
    var x, y, z, xy, i, j;

    var sectorStep = 2 * Math.PI / sectorCount;
    var stackStep = Math.PI / stackCount;
    var sectorAngle, stackAngle;

    var k1, k2;

    for (i = 0; i <= stackCount; ++i) {

        stackAngle = Math.PI / 2 - i * stackStep;
        xy = Math.cos(stackAngle);
        z = Math.sin(stackAngle);

        k1 = i * (sectorCount + 1);
        k2 = k1 + sectorCount + 1;

        for (j = 0; j <= sectorCount; ++j, ++k1, ++k2) {
            sectorAngle = j * sectorStep;

            x = xy * Math.cos(sectorAngle);
            y = xy * Math.sin(sectorAngle);

            ellipverts.push(x * a);
            ellipverts.push(y * b);
            ellipverts.push(z * c);

            ellipcolors.push(1.0);
            ellipcolors.push(1.0);
            ellipcolors.push(0.0);
            ellipcolors.push(1.0);

            ellipnormals.push(x);
            ellipnormals.push(y);
            ellipnormals.push(z);

            if (i != 0) {
                ellipindicies.push(k1);
                ellipindicies.push(k2);
                ellipindicies.push(k1 + 1);
            }
            if (i != (stackCount - 1)) {
                ellipindicies.push(k1 + 1);
                ellipindicies.push(k2);
                ellipindicies.push(k2 + 1);
            }

        }
    }

}


var ellipVertexPositionBuffer;
var ellipVertexNormalBuffer;
var ellipVertexColorBuffer;
var ellipVertexIndexBuffer;

function initEllipBuffer() {

    createEllipsoid();

    ellipVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ellipVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ellipverts), gl.STATIC_DRAW);
    ellipVertexPositionBuffer.itemSize = 3;
    ellipVertexPositionBuffer.numItems = ellipverts.length / 3;

    ellipVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ellipVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ellipnormals), gl.STATIC_DRAW);
    ellipVertexNormalBuffer.itemSize = 3;
    ellipVertexNormalBuffer.numItems = ellipnormals.length / 3;

    ellipVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ellipVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ellipindicies), gl.STATIC_DRAW);
    ellipVertexIndexBuffer.itemsize = 1;
    ellipVertexIndexBuffer.numItems = ellipindicies.length;

    ellipVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ellipVertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ellipcolors), gl.STATIC_DRAW);
    ellipVertexColorBuffer.itemSize = 4;
    ellipVertexColorBuffer.numItems = ellipcolors.length / 4;

}

var m_ellip = mat4.create();

function drawEllip(){

    mat4.identity(m_ellip);
    m_ellip = mat4.translate(m_ellip, [0,-0.1,0.1]);
    m_ellip = mat4.scale(m_ellip, [.3,.3,.3]);    

    mMatrix = mat4.multiply(mMatrix, m_ellip);
    setMatrixUniforms();


    gl.bindBuffer(gl.ARRAY_BUFFER, ellipVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram[0].vertexPositionAttribute, ellipVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, ellipVertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram[0].vertexNormalAttribute, ellipVertexNormalBuffer.itemSize, gl.FLOAT, false, 0,0);

    gl.bindBuffer(gl.ARRAY_BUFFER, ellipVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram[0].vertexColorAttribute, ellipVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ellipVertexIndexBuffer);


    gl.drawElements(gl.TRIANGLES, ellipVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);


}
