var Typer = function(element) {
  this.element = element;
  var delim = element.dataset.delim || ","; // default to comma
  var words = element.dataset.words || "override these,sample typing";
  this.words = words.split(delim).filter(function(v){return v;}); // non empty words
  this.delay = element.dataset.delay || 200;
  this.loop = element.dataset.loop || "true";
  this.deleteDelay = element.dataset.deletedelay || element.dataset.deleteDelay || 800;

  this.progress = { word:0, char:0, building:true, atWordEnd:false, looped: 0 };
  this.typing = true;

  var colors = element.dataset.colors || "black";
  this.colors = colors.split(",");
  this.element.style.color = this.colors[0];
  this.colorIndex = 0;

  this.doTyping();
};

Typer.prototype.start = function() {
  if (!this.typing) {
    this.typing = true;
    this.doTyping();
  }
};
Typer.prototype.stop = function() {
  this.typing = false;
};
Typer.prototype.doTyping = function() {
  var e = this.element;
  var p = this.progress;
  var w = p.word;
  var c = p.char;
  var currentDisplay = [...this.words[w]].slice(0, c).join("");
  p.atWordEnd = false;
  if (this.cursor) {
    this.cursor.element.style.opacity = "1";
    this.cursor.on = true;
    clearInterval(this.cursor.interval);
    var itself = this.cursor;
    this.cursor.interval = setInterval(function() {itself.updateBlinkState();}, 400);
  }

  e.innerHTML = currentDisplay;

  if (p.building) {
    if (p.char == [...this.words[w]].length) {
      p.building = false;
      p.atWordEnd = true;
    } else {
      p.char += 1;
    }
  } else {
    if (p.char == 0) {
      p.building = true;
      p.word = (p.word + 1) % this.words.length;
      this.colorIndex = (this.colorIndex + 1) % this.colors.length;
      this.element.style.color = this.colors[this.colorIndex];
    } else {
      p.char -= 1;
    }
  }

  if(p.atWordEnd) p.looped += 1;

  if(!p.building && (this.loop == "false" || this.loop <= p.looped) ){
    this.typing = false;
  }

  var myself = this;
  setTimeout(function() {
    if (myself.typing) { myself.doTyping(); };
  }, p.atWordEnd ? this.deleteDelay : this.delay);
};

var Cursor = function(element) {
  this.element = element;
  this.cursorDisplay = element.dataset.cursordisplay || "_";
  element.innerHTML = this.cursorDisplay;
  this.on = true;
  element.style.transition = "all 0.1s";
  var myself = this;
  this.interval = setInterval(function() {
    myself.updateBlinkState();
  }, 400);
}
Cursor.prototype.updateBlinkState = function() {
  if (this.on) {
    this.element.style.opacity = "0";
    this.on = false;
  } else {
    this.element.style.opacity = "1";
    this.on = true;
  }
}

function TyperSetup() {
  var typers = {};
  var elements = document.getElementsByClassName("typer");
  for (var i = 0, e; e = elements[i++];) {
    typers[e.id] = new Typer(e);
  }
  var elements = document.getElementsByClassName("typer-stop");
  for (var i = 0, e; e = elements[i++];) {
    let owner = typers[e.dataset.owner];
    e.onclick = function(){owner.stop();};
  }
  var elements = document.getElementsByClassName("typer-start");
  for (var i = 0, e; e = elements[i++];) {
    let owner = typers[e.dataset.owner];
    e.onclick = function(){owner.start();};
  }

  var elements2 = document.getElementsByClassName("cursor");
  for (var i = 0, e; e = elements2[i++];) {
    let t = new Cursor(e);
    t.owner = typers[e.dataset.owner];
    t.owner.cursor = t;
  }
}

TyperSetup();
