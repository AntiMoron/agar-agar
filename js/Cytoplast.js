var Cytoplast = function(position) {
    
    Entity.call(this, position);
    
    this.dockedParticles = [];
    
    this.color = {
        r : 1,
        g : 0,
        b : 0,
        a : 0
    };
    
    this.spikeState = false;
    this.puke = false;
    this.puking = false;
    
    this.spikeTimer = 0;
    
    this.rotation = 0;
    this.rotateSpeed = Cytoplast.prototype.defaultRotateSpeed;
    
};

Cytoplast.prototype = new Entity();
Cytoplast.prototype.constructor = Entity;

Cytoplast.prototype.mass = 800000;
Cytoplast.prototype.spikeMass = 80000;

Cytoplast.prototype.entityRadius = 2;
Cytoplast.prototype.moveSpeed = 0;
Cytoplast.prototype.maxFill = 5;

Cytoplast.prototype.infectionTime = 3000;
Cytoplast.prototype.spikeTime = 5000;
Cytoplast.prototype.pukeTime = 1000;
Cytoplast.prototype.dockTime = 1000;

Cytoplast.prototype.corpusTextureSize = 1.0;
Cytoplast.prototype.spikeTextureSize = 1.8;

Cytoplast.prototype.squeezeTime = 700;
Cytoplast.prototype.squeezeFactor = 0.8;

Cytoplast.prototype.defaultRotateSpeed = 0.0002;
Cytoplast.prototype.spikeRotateSpeed = 0.0006;

Cytoplast.initialize = function(gl) {

    this.shader = gl.loadShader("cytoplast-vertex-shader", "cytoplast-fragment-shader");
    
    gl.bindShader(this.shader);
    
    this.shader.matrixUniformLocation = gl.getUniformLocation(this.shader, "matrix");
    gl.passMatrix();
    
    this.shader.colorUniformLocation = gl.getUniformLocation(this.shader, "color");
    
    gl.enableVertexAttribArray(gl.getAttribLocation(this.shader, "position"));
    gl.enableVertexAttribArray(gl.getAttribLocation(this.shader, "textureCoord"));
    
    this.corpusTexture = gl.loadTexture("textures/cytoplast_corpus.png");
    this.spikeTexture = gl.loadTexture("textures/cytoplast_spikes.png");
    
    this.textureUniformLocation = gl.getUniformLocation(this.shader, "texture");

};

Cytoplast.prototype.update = function(dt) {

    // code for fading in & out a red color, when in spike-state. still to decide if we use it or not
    // if(this.spikeState) {
    
        // this.color.a = Math.sin(this.spikeTimer / Cytoplast.prototype.spikeTime * Math.PI / 2) * 0.3;
    
    // } else {
    
        // this.color.a = 0.0;
    
    // }

    if(this.puking) {

        this.force.set(0, 0, 0);

    }
    
    var rotateStep = this.rotateSpeed * dt;
    
    this.rotation += rotateStep;
    
    this.rotateDockedParticles(rotateStep);
    
    var positionChange = Entity.prototype.update.call(this, dt);
    
    for (var i = 0; i < this.dockedParticles.length; i++) {
        
        this.dockedParticles[i].position.addSelf(positionChange);
    
    }
    
};

Cytoplast.prototype.rotateDockedParticles = function(angle) {

    var targetVector = new Vector(),
        rotatedTargetVector = new Vector();
    
    for(var i = 0; i < this.dockedParticles.length; i++) {
    
        targetVector = this.dockedParticles[i].position.sub(this.position);
        
        rotatedTargetVector = targetVector.rotate2D(angle);
        
        rotatedTargetVector.subSelf(targetVector);
        
        this.dockedParticles[i].position.addSelf(rotatedTargetVector);
    
    }

};

Cytoplast.prototype.draw = function(gl) {

    gl.pushMatrix();
    
    gl.translate(this.position.x, this.position.y);
    
    var size;
    
    
    gl.bindShader(Cytoplast.shader);
    gl.enableAlpha();
    
    gl.uniform4f(
        Cytoplast.shader.colorUniformLocation,
        this.color.r,
        this.color.g,
        this.color.b,
        this.color.a
    );
    
    if(this.spikeState) {
        
        gl.pushMatrix();
        
        size = 2 * this.spikeTextureSize * Cytoplast.prototype.entityRadius;
        gl.scale(size, size);
        gl.rotate(this.rotation);
        gl.passMatrix();

        gl.passTexture(Cytoplast.spikeTexture, Cytoplast.textureUniformLocation);
        gl.drawQuadTexture();
        
        gl.popMatrix();

    }
    
    size = 2 * this.corpusTextureSize * Cytoplast.prototype.entityRadius;
    
    gl.scale(size, size);
    gl.rotate(this.rotation);
    
    gl.passMatrix();
    
    gl.passTexture(Cytoplast.corpusTexture, Cytoplast.textureUniformLocation);
    gl.drawQuadTexture();
    
    gl.disableAlpha();
    gl.bindShader(gl.defaultShader);
    
    gl.popMatrix();
    
    // gl.setColor(1.0, 0.0, 0.0, 1);
    // Entity.prototype.draw.call(this, gl);
    
    Particle.drawEnqueue(this.dockedParticles);

};

Cytoplast.prototype.isFull = function() {

    return (this.dockedParticles.length >= this.maxFill);

};

Cytoplast.prototype.checkPuke = function() {

    if(!this.spikeState) {
    
        this.puke = true;
        this.puking = true;
        
        Animator.animate(
            this,
            0,
            Cytoplast.prototype.pukeTime,
            function() {
                this.puking = false;
            }
        );
        
    }

}

Cytoplast.prototype.spikify = function() {

    this.spikeState = true;
    this.mass = Cytoplast.prototype.spikeMass;
    this.spikeTimer = Cytoplast.prototype.spikeTime;
    this.rotateSpeed = Cytoplast.prototype.spikeRotateSpeed;
    
    this.squeeze();
    
    Animator.animate(
        this,
        {"spikeTimer" : 0},
        Cytoplast.prototype.spikeTime,
        Cytoplast.prototype.deSpikify
    );

}

Cytoplast.prototype.deSpikify = function() {    
    
    Animator.animate(
        this,
        {"spikeTextureSize" : Cytoplast.prototype.corpusTextureSize * Cytoplast.prototype.squeezeFactor},
        Cytoplast.prototype.squeezeTime,
        function() {
        
            this.spikeState = false;
            this.mass = Cytoplast.prototype.mass;
            this.dockedParticles = [];
            this.spikeTimer = 0;
            this.rotateSpeed = Cytoplast.prototype.defaultRotateSpeed;

        }
    );
    
}

Cytoplast.prototype.squeeze = function() {

    this.spikeTextureSize = Cytoplast.prototype.corpusTextureSize * Cytoplast.prototype.squeezeFactor;

    Animator.animate(
        this,
        {"corpusTextureSize" : Cytoplast.prototype.corpusTextureSize * Cytoplast.prototype.squeezeFactor},
        Cytoplast.prototype.squeezeTime,
        Cytoplast.prototype.inflate
    );

};

Cytoplast.prototype.inflate = function() {

    Animator.animate(
        this,
        {"corpusTextureSize" : Cytoplast.prototype.corpusTextureSize,
         "spikeTextureSize" : Cytoplast.prototype.spikeTextureSize},
        Cytoplast.prototype.squeezeTime
    );

};

Cytoplast.prototype.accelerateParticle = function(particle) {

    var target = new Vector(1, 0, 0);
    
    target.rotate2DSelf(Math.random() * Math.PI * 2);
    target.mulSelf(Math.random() * (this.entityRadius - 2 * particle.entityRadius));
    target.addSelf(this.position);
    
    Animator.animate(
        particle.position, 
        {"x" : target.x, "y" : target.y}, 
        Cytoplast.prototype.dockTime * 0.5
    );
    
    if(this.isFull() && !this.spikeState) {
    
        this.spikify();
        
    }

};

Cytoplast.prototype.dockParticle = function(particlePosition) {

    if(this.dockedParticles.length == 0) {
        
        Animator.animate(
            this,
            0,
            Cytoplast.prototype.infectionTime,
            Cytoplast.prototype.checkPuke
        );
    
    }
    
    var particle = new Particle(particlePosition.getCopy()),
        target = this.position.sub(particle.position);
        
    target.normalizeSelf();
    target.mulSelf(Particle.prototype.entityRadius);
    target.addSelf(particle.position);
    
    this.dockedParticles.push(particle);
    
    var self = this;
    
    Animator.animate(
        particle.position, 
        {"x" : target.x, "y" : target.y}, 
        Cytoplast.prototype.dockTime,
        function() {
        
            self.accelerateParticle(particle);
            
        }
    );
    
    Animator.animate(
        particle.position, 
        {"z" : 0.3}, 
        Cytoplast.prototype.infectionTime
    );
    
    delete target;
    
};
