const PIXEL_DENSITY = 2;
const NUM_IMG = 2;
let theShader;
let canvas;
let textureBases = [];
let id = 0;

// Part 2 - Step 2.1
// from here
let textureBase;
let control = {
	hAmount: 10.0,
	noiseScaleAmount: 400.0,
	catColor: {r: 255, g: 144, b: 130 },
	brightBackgroundColor: {r: 171, g: 167, b: 164}, 
	darkBackgroundColor: {r: 35, g: 10, b: 0}, 
	holeColor: {r: 246, g: 235, b: 223}, 
}
// to here

// Part 2 - Step 2.2
// from here
window.onload = function() {
	var gui = new dat.GUI();
	gui.domElement.id = 'gui';
	gui.add(control, 'hAmount', 1, 30).name("Edge Width");
	gui.add(control, 'noiseScaleAmount', 1, 450).name("Background Scale");
	gui.addColor(control, 'catColor').name("Cat Color");
	gui.addColor(control, 'brightBackgroundColor').name("Bright Backgound");
	gui.addColor(control, 'darkBackgroundColor').name("Dark Backgound");
	gui.addColor(control, 'holeColor').name("Hole Color");
};
// to here

// Part 1 - Step 4
// from here
function preload(){
	theShader = loadShader('vert.glsl', 'hw2.frag');
	//textureBase = loadImage("data/cat_0.jpg");
	for (let i = 0; i < NUM_IMG; i++) {

		textureBases[i] = loadImage("/data/cat_" + i.toString() + ".jpg");
	}
}
// to here

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function setup() {
	pixelDensity(PIXEL_DENSITY);
	// canvas = createCanvas(1000,1000, WEBGL);
	canvas = createCanvas(windowWidth, windowHeight, WEBGL);

	background(0);
	noStroke();
	shader(theShader);
}

function draw() {

	var y = (mouseY-500) / min(1, windowWidth / windowHeight) + 500;
	
	theShader.setUniform("u_resolution", [width * PIXEL_DENSITY, height * PIXEL_DENSITY]);
	theShader.setUniform("u_mouse", [mouseX * PIXEL_DENSITY, (height-y) * PIXEL_DENSITY]);
  	theShader.setUniform("u_time", millis() / 1000.0);

	// Part 2 - Step 2.3
	// from here
	theShader.setUniform("u_tex0", textureBases[id]);
	// theShader.setUniform("u_tex0", textureBase);
	theShader.setUniform("h", control.hAmount);
	theShader.setUniform("noiseScale", control.noiseScaleAmount);
	theShader.setUniform("catColor", [control.catColor.r / 255, control.catColor.g / 255, control.catColor.b / 255]);
	theShader.setUniform("brightBackgroundColor", [control.brightBackgroundColor.r / 255, control.brightBackgroundColor.g / 255, control.brightBackgroundColor.b / 255]);
	theShader.setUniform("darkBackgroundColor", [control.darkBackgroundColor.r / 255, control.darkBackgroundColor.g / 255, control.darkBackgroundColor.b / 255]);
	theShader.setUniform("holeColor", [control.holeColor.r / 255, control.holeColor.g / 255, control.holeColor.b / 255]);
	// to here
	
	rect(windowWidth * -0.5, windowHeight * -0.5, windowWidth, windowHeight);

	id = (id + 1);
	if(id >= NUM_IMG) {id = 0;}

	frameRate(12);
	// setTimeout(myMessage, 3000);
}

function keyPressed() {
	if (keyCode == ESCAPE) { dat.GUI.toggleHide(); }
}
