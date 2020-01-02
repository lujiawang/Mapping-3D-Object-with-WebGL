function initShaders(){

	shaderProgram[0] = gl.createProgram();	//1. create a shader program
	
	var vertexShader = getShader(gl, "shader-vs");
	var fragmentShader = getShader(gl, "shader-fs");	//2. create shader objects

	gl.attachShader(shaderProgram[0], vertexShader);
	gl.attachShader(shaderProgram[0], fragmentShader);
	gl.linkProgram(shaderProgram[0]);	//3. send shaders to program and link two shaders together

	if(!gl.getProgramParameter(shaderProgram[0], gl.LINK_STATUS)){
		alert("Could not initialize shaders");
	}
	gl.useProgram(shaderProgram[0]);
}

function getShader(gl, id){
	var shaderScript = document.getElementById(id);
	if(!shaderScript){
		return null;
	}

	var str = "";
	var k = shaderScript.firstChild;
	while(k){
		if(k.nodeType == 3){
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-vertex"){
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else if (shaderScript.type == "x-shader/x-fragment"){
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else{
		return null;
	}
	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		alert(gl.getShaderInfoLog(shader));
		return null;
	}
	return shader;

}