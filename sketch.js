let webcam;
let detector;

let myVidoeRec;

let videoFrame;

let state = 0;

let btn_pause = [];
let btn_record = [];
let btn_stop = [];
let icon_person;
let stateIndicator = [];

let recordingTime = '00:00:00';
let recordingStartTime = 0;
let pausedStartTime = 0; 
let pausedTime = 0; 
let totalPausedTime = 0; 

let peopleNumber = 0;

let detectedObjects = [];

let myWriter;
let writerMsg='';

function preload() {  
  detector = ml5.objectDetector('cocossd');
  
  videoFrame = loadImage('img/video_preview.png');
  
  btn_pause[0] = loadImage('img/pause_disabled.png');
  btn_pause[2] = loadImage('img/pause_activated.png');
  
  btn_record[0] = loadImage('img/record_stop.png');
  btn_record[1] = loadImage('img/record_recording.png');
  btn_record[3] = loadImage('img/record_saved.png');
  
  btn_stop[0] = loadImage('img/stop_disabled.png');
  btn_stop[2] = loadImage('img/stop_activated.png');
    
  stateIndicator[0] = loadImage('img/tapToRecord.png');
  stateIndicator[1] = loadImage('img/state_recording.png');
  stateIndicator[2] = loadImage('img/state_paused.png');
  stateIndicator[3] = loadImage('img/state_saved.png');
}

function setup() {
  createCanvas(1100, 500);
  webcam = createCapture(VIDEO);
  webcam.size(828, 534);
  webcam.hide();
  
  myVideoRec = new P5MovRec();
  
  detector.detect(webcam, gotDetections);
}

function draw() {
  background(255);
  
  calculateRecordingTime();
  
  drawVideoPreview(0,0,828,534);
  
  doCOCOSSD(state);
  
  drawButtons(state);
  drawStatusBar(state);
  drawStateIndicator(state);
  writeLog(state);
  
  peopleNumber = 0;
}

function drawVideoPreview(x, y, w, h){
  image(webcam, x, y, w, h);
  image(videoFrame, x, y, w, h);
}

function drawStateIndicator(currentState){
  image(stateIndicator[currentState], 885,350,150,24);
}

function drawButtons(currentState){
  let pause_stop_button_number = 0;
  if(currentState == 1){
    pause_stop_button_number = 1;
  }  
  image(btn_record[currentState], 880, 400, 48, 48);
  image(btn_pause[pause_stop_button_number], 940, 400, 48, 48);
  image(btn_stop[pause_stop_button_number], 1000, 400, 48, 48);
}


function drawStatusBar(currentState){
  fill(0, 51);
  noStroke();
  rect(20,20,104,20,4);
  rect(130,20,82,20,4);
  rect(20,45,106,20,4);
  
  textFont('Inter');
  textSize(14);
  
  let currentTime = ''+nf(hour(),2,0)+':'+nf(minute(),2,0)+':'+nf(second(),2,0);
  let currentDate = ''+year()+'.'+nf(month(),2,0)+'.'+nf(day(),2,0)+'.';
  
  if(currentState == 0){
    noFill();
    stroke(255,153);
    strokeWeight(2);
    ellipse(40,30,11,11);
    fill(255,153);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 50, 35);
    textAlign(CENTER);
    text(currentTime, 170, 35);
    textAlign(CENTER);
    text(currentDate, 75, 60);
  }else if(currentState == 1){
    fill(202,38,38);
    noStroke();
    ellipse(16,12,12,12);
    fill(202,38,38);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 50, 35);
    fill(255);
    textAlign(CENTER);
    text(currentTime, 170, 35);
    textAlign(CENTER);
    text(currentDate, 75, 60);
  }else if(currentState == 2){
    noFill();
    stroke(202,38,38);
    strokeWeight(2);
    ellipse(16,12,11,11);
    fill(202,38,38);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 50, 35);
    fill(255,153);
    textAlign(CENTER);
    text(currentTime, 170, 35);
    textAlign(CENTER);
    text(currentDate, 75, 60);

  }else if(currentState == 3){
    noFill();
    stroke(255,153);
    strokeWeight(2);
    ellipse(16,12,11,11);
    fill(255,153);
    noStroke();
    textAlign(LEFT);
    text(recordingTime, 50, 35);
    textAlign(CENTER);
    text(currentTime, 170, 35);
    textAlign(CENTER);
    text(currentDate, 75, 60);
  }
}

function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }
  
  detectedObjects = results;
  detector.detect(webcam, gotDetections);
}


function mouseReleased(){
  if(state == 0){
    if(dist(mouseX, mouseY, 880, 400) <= 21){ 
      state = 1; 
      recordingStartTime = millis();
      startLog();
      myVideoRec.startRec(); 
    }
  }else if(state == 1){
    if(dist(mouseX, mouseY, 940, 400) <= 14){ 
      state = 2; 
      pausedStartTime = millis();
    }
    if(dist(mouseX, mouseY, 1000, 400) <= 14){ 
      state = 3; 
      initializeTimes();
      saveLog();
      myVideoRec.stopRec(); 
    }
  }else if(state == 2){
    if(dist(mouseX, mouseY, 880, 400) <= 21){ 
      state = 1; 
      totalPausedTime = totalPausedTime + pausedTime;
    }
  }else if(state == 3){
    if(dist(mouseX, mouseY, 880, 400) <= 21){ 
      state = 0; 
    }
  }
}
function initializeTimes(){
  recordingStartTime = 0;
  pausedStartTime = 0;
  pausedTime = 0;
  totalPausedTime = 0;
}
function calculateRecordingTime(){
  let cur_time = millis();
  
  if(state == 0){ //0.Main Page
    recordingTime = '00:00:00';
  }else if(state == 1){ 
    let rec_time = cur_time - recordingStartTime - totalPausedTime;
    let rec_sec = int(rec_time / 1000) % 60;
    let rec_min = int(rec_time / (1000*60)) % 60;
    let rec_hour = int(rec_time / (1000*60*60)) % 60;
    
    recordingTime = ''+nf(rec_hour,2,0)+':'+nf(rec_min,2,0)+':'+nf(rec_sec,2,0);
  }else if(state == 2){ 
    pausedTime = millis() - pausedStartTime;
  }else if(state == 3){ 
    recordingTime = '00:00:00';
  }
}

function doCOCOSSD(){
  let tempMsg='';
  for (let i = 0; i < detectedObjects.length; i++) {
    let object = detectedObjects[i];
    
    if(object.label == 'person'){
      peopleNumber = peopleNumber + 1;
      
      stroke(255,0,254);
      strokeWeight(2);
      noFill();
      rect(object.x, object.y, object.width, object.height);
      noStroke();
      fill(255,0,254);
      textSize(10);
      text(object.label+' '+peopleNumber, object.x, object.y - 5);
      
      let centerX = object.x + (object.width/2);
      let centerY = object.y + (object.height/2);
      strokeWeight(4);
      stroke(255,0,254);
      point(centerX, centerY);
      
      tempMsg = tempMsg+','+peopleNumber+','+centerX+','+centerY;
    }
  }
  let millisTime = int(millis() - recordingStartTime - totalPausedTime);
  writerMsg = ''+recordingTime+','+millisTime+','+peopleNumber+''+tempMsg;
}
function startLog(){
  let mm = nf(month(),2,0);
  let dd = nf(day(),2,0);
  let ho = nf(hour(),2,0);
  let mi = nf(minute(),2,0);
  let se = nf(second(),2,0);
  
  let fileName = 'data_'+ mm + dd +'_'+ ho + mi + se+'.csv';
  
  myWriter = createWriter(fileName);
}
function saveLog(){
  myWriter.close();
  myWriter.clear();
}
function writeLog(currentState){
  if(currentState == 1){
    myWriter.print(writerMsg);
  }
}

function mousePressed(){
  let fs = fullscreen();
  fullscreen(!fs);
}