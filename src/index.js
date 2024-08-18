import "./viewport.js"
import { drawWalker } from "./render.js"
import { Walker } from "./walker.js"

canvas = document.createElement("canvas")
canvas.width = innerWidth
canvas.height = innerHeight
canvas.style.position = "absolute"
document.body.appendChild(canvas)
document.body.style.margin = "0"
ctx = canvas.getContext("2d")


x = new Walker(100, 200, 4)

let lastTime
const loop = (time) => {
    if (time != undefined) {
        const dt = lastTime == undefined ? 0 : time - lastTime
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawWalker(x)
        x.time_ += dt
        lastTime = time
    }
    requestAnimationFrame(loop)
}

loop()

// points = [100, 100, 120, 150, 100, 200, 150, 200, 190, 250]

// for (let i = 0; i < points.length; i+=2)
// {
//     ctx.beginPath()
//     ctx.arc(points[i], points[i+1], 2, 0, Math.PI*2)
//     ctx.stroke()
// }

// ctx.beginPath()
// ctx.moveTo(points[0], points[1])
// for (var i = 2; i < points.length - 2; i += 2) {
//     ctx.quadraticCurveTo(points[i], points[i+1], (points[i] + points[i + 2]) / 2, (points[i + 1] + points[i + 3]) / 2)
// }
// ctx.lineTo(points[points.length-2], points[points.length-1])
// ctx.stroke()

// drawRoughCircle(400, 400, 100, 10)