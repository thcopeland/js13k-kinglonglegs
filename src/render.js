import { xorshift } from "./utils"
import { getAnimation } from "./animation"

export const drawWalker = (walker) => {
    ctx.save()
    ctx.translate(walker.x, walker.y)
    ctx.scale(walker.facing_ < 1 ? -walker.scale_ : walker.scale_, walker.scale_)
    ctx.strokeStyle = "#333"
    ctx.lineWidth = "2"
    ctx.fillStyle = "#888"
    const animation = getAnimation(walker.animation_, walker.time_)
    drawRoughCircle(0, -100, 40, walker.id_)
    drawCurve(animation.slice(0, 6))
    ctx.fillStyle = "#f00"
    if (IS_DEVELOPMENT_BUILD ) {
        ctx.beginPath()
        ctx.arc(0, 0, 5, 0, 2*Math.PI)
        ctx.fill()
    }
    ctx.restore()
}


export const drawRoughCircle = (x, y, radius, rng) => {
    let angle = 0
    const points = []
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2*Math.PI)
    ctx.fill()
    while (angle < 4*Math.PI) {
        rng = xorshift(rng)
        angle += (rng & 255) / 512 + 0.05
        const s = 1 + ((rng & 255) - 128) / 6000
        points.push(Math.cos(angle) * radius*s + x)
        points.push(Math.sin(angle) * radius*s + y)
    }
    points.push(points[0])
    points.push(points[1])
    drawCurve(points)
    return rng
}


export const drawCurve = (points) => {
    ctx.beginPath()
    ctx.moveTo(points[0], points[1])
    for (var i = 2; i < points.length - 2; i += 2) {
        // ctx.quadraticCurveTo(points[i], points[i+1], (points[i] + points[i + 2]) / 2, (points[i + 1] + points[i + 3]) / 2)
        ctx.lineTo(points[i], points[i+1])
    }
    ctx.lineTo(points[points.length-2], points[points.length-1])
    ctx.stroke()
}