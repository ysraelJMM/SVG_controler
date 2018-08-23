function n_svg(tipo, id, padre) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", tipo);
  this.svg = svg;
  this.s_att = function(obj) {
    Object.keys(obj).map((key) => this.svg.setAttribute(key, obj[key]));
  }
  this.a_att = (att, val) => this.svg.setAttribute(att, val);
  this.r_att = function(obj) {
    obj.map((a) => this.svg.removeAttribute(a));
  }
  this.g_att = (a) => this.svg.getAttribute(a);
  this.draw_into = (ob) => {
    if (typeof ob === "string") {
      ob = document.getElementById(ob)
    }
    ob.appendChild(this.svg);
  }
  this.add_event = (a, fun) => {
    this.svg.addEventListener(a, fun)
  };
  this.remov_event = (a, fun) => {
    this.svg.removeEventListener(a, fun)
  };
  this.inner = (a) => this.svg.innerHTML = a;
  if (id != undefined) {
    this.a_att("id", id)
  }
  if (padre != undefined) {
    this.draw_into(padre)
  }
  this.animate = (event, atributes, obj) => {
    let ob = obj;
    if (obj == undefined) {
      ob = this;
    }
    this.add_event(event, () => ob.s_att(atributes));
  }
  this.length = () => this.svg.getTotalLength();
  this.box = () => this.svg.getBBox();
}

function inser_nodos(padre, nodos) {
  var l = arguments.length;
  for (var i = 1; i < l; i++) {
    arguments[i].draw_into(padre);
  }
}

function asing_element(elemento, nodos) {
  var l = arguments.length;
  for (var i = 1; i < l; i++) {
    arguments[i].s_att(elemento);
  }
}
