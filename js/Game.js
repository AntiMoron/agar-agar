var Game = function(width, height) {
    
    this.vectorfield = new Vectorfield(width, height);
    // this.controller = new Controller();
    // this.inputHandler = new InputHandler();
    // this.generator = new Generator();
    // this.fader = new Fader();
    
};

Game.prototype = {
    
    update : function(dt) {
        
        // if (this.fader.isActive()) {
        //     
        //     this.fader.update(dt);
        //     
        // } else {
        //     
            this.vectorfield.update(dt);
        //     this.controller.update(dt);
        //     this.inputHandler.update(dt);
        //     
        // }
        
    },
    
    draw : function(gl) {
        
        // if (this.fader.isActive()) {
        //     
        //     this.fader.draw(gl);
        //     
        // } else {
        //     
            this.vectorfield.draw(gl);
        //     this.controller.draw(gl);
        //     this.inputHandler.draw(gl);
        //     
        // }
        
    }
    
};