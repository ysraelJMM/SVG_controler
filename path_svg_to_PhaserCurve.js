  /*	
Tomado desde https://github.com/Pomax/bezierjs/blob/gh-pages/lib/normalise-svg.js	
 He reutilizado el código, aprovechando que descompone la data en porciones de comandos y pares,	
por lo que en medio he podido incrustar comandos para la creación de curvas en Phaser Js.	
No tenía la opción para lo que son arcos elipticos, por lo que he agregado el algoritmo	
para poder exportarlo al formato requerido por en Phaser.	
 Sería interesante que ya lo tuviera implementado.


 * Normalise an SVG path to absolute coordinates	
 * and full commands, rather than relative coordinates	
 * and/or shortcut commands.	
 */
  
  function normalizePath(d) {
    // preprocess "d" so that we have spaces between values
    d = d
      .replace(/,/g, " ") // replace commas with spaces
      .replace(/-/g, " - ") // add spacing around minus signs
      .replace(/-\s+/g, "-") // remove spacing to the right of minus signs.
      .replace(/([a-zA-Z])/g, " $1 ");

    // set up the variables used in this function
    var instructions = d.replace(/([a-zA-Z])\s?/g, "|$1").split("|"),
      instructionLength = instructions.length,
      i,
      instruction,
      op,
      lop,
      args = [],
      alen,
      a,
      sx = 0,
      sy = 0,
      x = 0,
      y = 0,
      cx = 0,
      cy = 0,
      cx2 = 0,
      cy2 = 0,
      x0 = 0,
      y0 = 0,
      io = true,
      path, // Creo una variable con la que voy a operar, para ponerlo en la  notacion de phaser.
      normalized = "";

    // we run through the instruction list starting at 1, not 0,
    // because we split up "|M x y ...." so the first element will
    // always be an empty string. By design.
    for (i = 1; i < instructionLength; i++) {
      // which instruction is this?
      instruction = instructions[i];
      op = instruction.substring(0, 1);
      lop = op.toLowerCase();

      // what are the arguments? note that we need to convert
      // all strings into numbers, or + will do silly things.
      args = instruction
        .replace(op, "")
        .trim()
        .split(" ");
      args = args
        .filter(function(v) {
          return v !== "";
        })
        .map(parseFloat);
      alen = args.length;

      // we could use a switch, but elaborate code in a "case" with
      // fallthrough is just horrid to read. So let's use ifthen
      // statements instead.

      // moveto command (plus possible lineto)
      if (lop === "m") {
        normalized += "M ";
        if (op === "m") {
          x += args[0];
          y += args[1];
        } else {
          x = args[0];
          y = args[1];
        }
        // records start position, for dealing
        // with the shape close operator ('Z')
        sx = x;
        sy = y;
        normalized += x + " " + y + " ";
        if (io) {
          path = new Phaser.Curves.Path(x, y); //Crea un nuevo path
          x0 = x;
          y0 = y;
          io = false;
        } else {
          path.moveTo(x, y); //evita generar un nuevo path, y solamente ubica un nuevo punto
        }

        if (alen > 2) {
          for (a = 0; a < alen; a += 2) {
            if (op === "m") {
              x += args[a];
              y += args[a + 1];
            } else {
              x = args[a];
              y = args[a + 1];
            }
            normalized += ["L", x, y, ''].join(" ");
            path['lineTo'](x, y);
          }
        }
      } else if (lop === "l") {
        // lineto commands
        for (a = 0; a < alen; a += 2) {
          if (op === "l") {
            x += args[a];
            y += args[a + 1];
          } else {
            x = args[a];
            y = args[a + 1];
          }
          normalized += ["L", x, y, ''].join(" ");
          path['lineTo'](x, y);
        }
      } else if (lop === "h") {
        for (a = 0; a < alen; a++) {
          if (op === "h") {
            x += args[a];
          } else {
            x = args[a];
          }
          normalized += ["L", x, y, ''].join(" ");
          path['lineTo'](x, y);
        }
      } else if (lop === "v") {
        for (a = 0; a < alen; a++) {
          if (op === "v") {
            y += args[a];
          } else {
            y = args[a];
          }
          normalized += ["L", x, y, ''].join(" ");
          path['lineTo'](x, y);
        }
      } else if (lop === "q") {
        // quadratic curveto commands
        for (a = 0; a < alen; a += 4) {
          if (op === "q") {
            cx = x + args[a];
            cy = y + args[a + 1];
            x += args[a + 2];
            y += args[a + 3];
          } else {
            cx = args[a];
            cy = args[a + 1];
            x = args[a + 2];
            y = args[a + 3];
          }
          normalized += ["Q", cx, cy, x, y, ''].join(" ");
          path['quadraticBezierTo'](x, y, cx, cy);
        }
      } else if (lop === "t") {
        for (a = 0; a < alen; a += 2) {
          // reflect previous cx/cy over x/y
          cx = x + (x - cx);
          cy = y + (y - cy);
          // then get real end point
          if (op === "t") {
            x += args[a];
            y += args[a + 1];
          } else {
            x = args[a];
            y = args[a + 1];
          }
          normalized += ["Q", cx, cy, x, y, ''].join(" ");
          path['quadraticBezierTo'](x, y, cx, cy);
        }
      } else if (lop === "c") {
        // cubic curveto commands
        for (a = 0; a < alen; a += 6) {
          if (op === "c") {
            cx = x + args[a];
            cy = y + args[a + 1];
            cx2 = x + args[a + 2];
            cy2 = y + args[a + 3];
            x += args[a + 4];
            y += args[a + 5];
          } else {
            cx = args[a];
            cy = args[a + 1];
            cx2 = args[a + 2];
            cy2 = args[a + 3];
            x = args[a + 4];
            y = args[a + 5];
          }
          normalized += ["C", cx, cy, cx2, cy2, x, y, ''].join(" ");
          path['cubicBezierTo'](x, y, cx, cy, cx2, cy2);
        }
      } else if (lop === "s") {
        for (a = 0; a < alen; a += 4) {
          // reflect previous cx2/cy2 over x/y
          cx = x + (x - cx2);
          cy = y + (y - cy2);
          // then get real control and end point
          if (op === "s") {
            cx2 = x + args[a];
            cy2 = y + args[a + 1];
            x += args[a + 2];
            y += args[a + 3];
          } else {
            cx2 = args[a];
            cy2 = args[a + 1];
            x = args[a + 2];
            y = args[a + 3];
          }
          normalized += ["C", cx, cy, cx2, cy2, x, y, ''].join(" ");
          path['cubicBezierTo'](x, y, cx, cy, cx2, cy2);
        }
      } else if (lop === "a") {
        // elliptical arc  commands        https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
        var ratio = 180 / Math.PI;
        let dir, dar, starAngle, endAngle, nx = 0,
          ny = 0;
        for (a = 0; a < alen; a += 7) {
          if (op === "a") {
            rx = args[a];
            ry = args[a + 1];
            rotation = args[a + 2];
            dir = args[a + 3];
            dar = args[a + 4];
            nx = args[a + 5];
            ny = args[a + 6];
            x += args[a + 5];
            y += args[a + 6];
          } else {
            rx = args[a];
            ry = args[a + 1];
            rotation = args[a + 2];
            dir = args[a + 3];
            dar = args[a + 4];
            nx = args[a + 5] - x;
            ny = args[a + 6] - y;
            x = args[a + 5];
            y = args[a + 6];
          }
          if (rotation) {
            let rAng = -rotation / ratio; //Ángulo de rotación
            let nnx = nx * Math.cos(rAng) - ny * Math.sin(rAng);
            let nny = ny * Math.cos(rAng) + nx * Math.sin(rAng);
            nx = nnx; //Nuevo vector de direción
            ny = nny;
          }
          ny = ny * (rx / ry); //Ratio de proporción para la elipse
          angle = ratio * Math.asin(Math.hypot(nx, ny) / (2 * rx)); //ángulo interno generado por la cuerda (arco menor)
          angle2 = ratio * Math.atan2(ny, nx); // pendiente de vector
          angle2 < 0 ? angle2 += 360 : ''; // Para mantener el angulo dentro de la circunferencia trigonométrica

          if (dar) { //sentido de rotación (horario, antihorario)
            starAngle = -90 + angle2 - angle;
            endAngle = starAngle + (2 * angle);
          } else {
            starAngle = 90 + angle2 + angle;
            endAngle = starAngle - (2 * angle);
          }

          if (dir) { // Si piden el ángulo del arco mayor
            starAngle -= 90;
            endAngle += 90;
          }

          normalized += ["A", rx, ry, rotation, dir, dar, x, y, ''].join(" ");
          path['ellipseTo'](rx, ry, starAngle, endAngle, !dar, rotation); // Algoritmo arreglado por mí (Ysrael);
        }
      } else if (lop === "z") {
        normalized += "Z ";
        // not unimportant: path closing changes the current x/y coordinate
        x = sx;
        y = sy;
        path['closePath']();
      }
    }
    return {
      image,
      config,
      lineStyle,
      path: path, // path curve Phaser
      data: normalized.trim(), // data normalizada
      //coordenadas del origen de la curva. Util si se quiere mostrar la curva y posicionar el objeto
      x: x0,
      y: y0
    }
  }
