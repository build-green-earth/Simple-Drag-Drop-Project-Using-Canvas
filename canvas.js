const shapes = [
  {
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    type: "Rectangle"
  },
  {
    x: 300,
    y: 300,
    width: 100,
    height: 50,
    type: "Circle"
  },
  {
    x: 500,
    y: 300,
    width: 50,
    height: 100,
    type: "Circle"
  },
  {
    x: 100,
    y: 300,
    width: 100,
    height: 100,
    type: "Rectangle"
  },
]
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const delta = 1
let draggable = null
const offsetLeft = canvas.offsetLeft
const offsetTop = canvas.offsetTop
let lines = []
const width = canvas.width
const height = canvas.height

let lastPos = {x:0, y:0}

const drawCtx = () => {
  ctx.fillStyle = "gray";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //Draw Shapes
  ctx.fillStyle = "rgb(39, 137, 236)";
  ctx.strokeStyle = "rgb(252, 127, 252)";
  for (let i = 0; i < shapes.length; i++) {
    ctx.beginPath();
    if (shapes[i].type == "Rectangle") ctx.rect(shapes[i].x, shapes[i].y, shapes[i].width, shapes[i].height)
    else if (shapes[i].type == "Circle") ctx.ellipse(shapes[i].x + shapes[i].width / 2, shapes[i].y + shapes[i].height / 2, shapes[i].width / 2, shapes[i].height / 2, 0, -Math.PI, Math.PI)
    ctx.fill();
  }

  // Draw Lines
  for (let i = 0; i < lines.length; i++) {
    ctx.beginPath();
    ctx.moveTo(lines[i][0], lines[i][1]);
    ctx.lineTo(lines[i][0], lines[i][2]);
    ctx.stroke();

    const idx = lines[i][3]
    if (idx != -1) {
      ctx.beginPath();
      ctx.rect(shapes[idx].x, shapes[idx].y, shapes[idx].width, shapes[idx].height)
      ctx.stroke();
    }
  }

  //Draw Border For the Dragging Object
  ctx.fillStyle = "rgb(251, 252, 254)"
  ctx.strokeStyle = "rgb(148, 195, 248)"
  const RECT_SIZE = 5
  if (draggable) {
    ctx.beginPath();
    ctx.rect(draggable.x, draggable.y, draggable.width, draggable.height)
    ctx.stroke()
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i == j && i == 1) continue
      
        const x = draggable.x + draggable.width / 2 * i
        const y = draggable.y + draggable.height / 2 * j
        ctx.beginPath();
        ctx.rect(x - RECT_SIZE, y - RECT_SIZE, RECT_SIZE * 2, RECT_SIZE * 2)
        ctx.fill()
        
      }
    }
  }
}

const translateShape = (x, y, clearLines = false) => {
  draggable.x += x
  draggable.y += y

  lines = []
  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i] == draggable) continue
    let x = -1
    if (Math.abs(shapes[i].x - draggable.x) <= delta) {
      draggable.x = shapes[i].x
      x = draggable.x
    } else if (Math.abs(shapes[i].x + shapes[i].width / 2 - draggable.x - draggable.width / 2) <= delta) {
      draggable.x += (shapes[i].x + shapes[i].width / 2 - draggable.x - draggable.width / 2)
      x = shapes[i].x + shapes[i].width / 2
    } else if (Math.abs(shapes[i].x + shapes[i].width - draggable.x - draggable.width) <= delta) {
      draggable.x += (shapes[i].x + shapes[i].width - draggable.x - draggable.width)
      x = shapes[i].x + shapes[i].width
    }
    if (x != -1) {
      if (shapes[i].y > draggable.y) lines.push([x, shapes[i].y + shapes[i].height, draggable.y, i])
      else lines.push([x, shapes[i].y, draggable.y + draggable.height, i])
    }
  }

  if (draggable.x < delta) {
    draggable.x = 0
    lines.push([1, 0, height, -1])
  } else if (draggable.x + draggable.width >= width - delta) {
    draggable.x = width - draggable.width
    lines.push([width - 1, 0, height, -1])
  } else if (Math.abs(draggable.x + draggable.width / 2 - (width / 2)) < delta) {
    draggable.x = width / 2 - draggable.width / 2
    lines.push([width / 2 - 1, 0, height, -1])
  }

  if (clearLines) lines = []
  drawCtx()
}

canvas.addEventListener("mousedown", (e) => {
  const x = e.clientX - offsetLeft
  const y = e.clientY - offsetTop
  lastPos = {x, y}

  for (let i = 0; i < shapes.length; i++) {
    if (shapes[i].x <= x && shapes[i].y <= y && shapes[i].x + shapes[i].width >= x && shapes[i].y + shapes[i].height >= y) {
      draggable = shapes[i]
      return
    }
  }
})

canvas.addEventListener("mousemove", (e) => {
  const x = e.clientX - offsetLeft
  const y = e.clientY - offsetTop

  if (draggable) {
    translateShape(x - lastPos.x, y - lastPos.y)
  }

  lastPos = {x, y}
})

canvas.addEventListener("mouseup", (e) => {
  const x = e.clientX - offsetLeft
  const y = e.clientY - offsetTop

  if (draggable) {
    translateShape(x - lastPos.x, y - lastPos.y, true)
  }

  lastPos = {x, y}
  draggable = null
  lines = []
})

window.onload = function () {
  drawCtx()
}