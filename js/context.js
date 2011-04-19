
WebGLRenderingContext.prototype.matrix = new Matrix();
WebGLRenderingContext.prototype.matrixStack = [];

WebGLRenderingContext.prototype.pushMatrix = function() {
    
    this.matrixStack.push(this.matrix);
    
};

WebGLRenderingContext.prototype.popMatrix = function() {
    
    if (this.matrixStack.length) {
        
        this.matrix = this.matrixStack.pop();
        
    }
    
};

WebGLRenderingContext.prototype.rotate = function(phi) {
    
    this.matrix.rotate2DSelf(phi);
    
};

WebGLRenderingContext.prototype.scale = function(x, y) {
    
    this.matrix.scale2DSelf(x, y);
    
};

WebGLRenderingContext.prototype.translate = function(x, y) {
    
    this.matrix.translate2DSelf(x, y);
    
};

WebGLRenderingContext.prototype.loadShader = function(id) {
    
    var shaderScript = document.getElementById(id);

    if (!shaderScript) {
        return null;
    }

    // Walk through the source element's children, building the
    // shader source string.

    var shaderSource = "",
        textNodeType = 3,
        currentChild = shaderScript.firstChild;

    while(currentChild) {
        
        if (currentChild.nodeType == textNodeType) {
            
            shaderSource += currentChild.textContent;
            
        }
        
        currentChild = currentChild.nextSibling;
    }


    var shader;

    if (shaderScript.type == "x-shader/x-fragment") {
 
        shader = this.createShader(this.FRAGMENT_SHADER);

    } else if (shaderScript.type == "x-shader/x-vertex") {
 
        shader = this.createShader(this.VERTEX_SHADER);

    } else {
 
        return null;

    }


    this.shaderSource(shader, shaderSource);

    this.compileShader(shader);

    if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
        
        log("An error occurred compiling the shaders: " + this.getShaderInfoLog(shader));
        return null;
        
    }

    return shader;

};

WebGLRenderingContext.prototype.linkShaderProgram = function(vertexShader, fragmentShader) {

	var shaderProgram = this.createProgram();

    this.attachShader(shaderProgram, vertexShader);
    this.attachShader(shaderProgram, fragmentShader);
    

    this.linkProgram(shaderProgram);


    if (!this.getProgramParameter(shaderProgram, this.LINK_STATUS)) {
  
        log("Unable to initialize the shader program.");

    }
	
	return shaderProgram;
	
};

WebGLRenderingContext.prototype.passVerticesToShader = function(vertices) {

	this.bufferData(this.ARRAY_BUFFER, new Float32Array(vertices), this.STATIC_DRAW);
		
	var vertexPositionAttribute = this.getAttribLocation(this.defaultShader, "position");
	this.enableVertexAttribArray(vertexPositionAttribute);

	this.vertexAttribPointer(vertexPositionAttribute, 3, this.FLOAT, false, 0, 0);
	
};

WebGLRenderingContext.prototype.passMatrixToShader = function(shader) {

    this.uniformMatrix4fv(
        this.getUniformLocation(shader, "matrix"), 
        false, 
        new Float32Array(this.matrix.flatten4D())
    );
    
};

WebGLRenderingContext.prototype.setupDefaultShader = function() {

	var vertexShader = this.loadShader("vertex-shader");
	var fragmentShader = this.loadShader("fragment-shader");
	
	this.defaultShader = this.linkShaderProgram(vertexShader, fragmentShader);
	
	this.useProgram(this.defaultShader);
	
};

WebGLRenderingContext.prototype.setColor = function(r, g, b, a) {

	var colors = [ r, g, b, a ];

    var colorUniform = this.getUniformLocation(this.defaultShader, "color");
    this.uniform4fv(colorUniform, new Float32Array(colors));

};

WebGLRenderingContext.prototype.enableAlpha = function() {

	this.enable(this.BLEND);
	this.blendFunc(this.SRC_ALPHA, this.ONE_MINUS_SRC_ALPHA);
	
};

WebGLRenderingContext.prototype.disableAlpha = function() {

	this.disable(this.BLEND);
	
};

WebGLRenderingContext.prototype.drawRect = function(x, y, width, height) {
    
    var vertexBuffer = this.createBuffer();

    this.bindBuffer(this.ARRAY_BUFFER, vertexBuffer);

    var vertices = [
        x, y, 1,
        x + width, y, 1,
        x, y + height, 1,
        x + width, y + height, 1
    ];

    this.passVerticesToShader(vertices);

	
	this.passMatrixToShader(this.defaultShader);

	
    this.drawArrays(this.TRIANGLE_STRIP, 0, 4);
    
};

WebGLRenderingContext.prototype.drawLine = function(x1, y1, x2, y2) {
    
    var vertexBuffer = this.createBuffer();

    this.bindBuffer(this.ARRAY_BUFFER, vertexBuffer);

    var vertices = [
        x1, y1, 0,
        x2, y2, 0
    ];
	
	this.passVerticesToShader(vertices);
	
	
    this.passMatrixToShader(this.defaultShader);

	
    this.drawArrays(this.LINE_STRIP, 0, 2);
    
};
