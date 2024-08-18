import { xorshift } from "./utils"
import { animations } from "./animation"

export const drawWalker = (walker) => {
    ctx.save()
    ctx.translate(walker.x, walker.y)
    if (walker.facing_ < 1)
        ctx.scale(-walker.scale_, walker.scale_)
    ctx.strokeStyle = "#333"
    ctx.lineWidth = "2"
    ctx.fillStyle = "#888"
    drawRoughCircle(0, -100, 40, walker.id_)
    drawAnimation(walker.animation_, walker.time_)
    ctx.restore()
}


export const drawAnimation = (animationIdx, time) => {
    const animation = animations[animationIdx]
    time = time % animation[0].t
    let p = 0, q = 0, interp = 0
    while (p < animation.length-1 && animation[p+1].t < time) p++
    if (p < animation.length-1) q = p + 1
    // Determine the interpolation factor between frames. This is complicated
    // by looping at the last frame.
    if (p == 0)
        interp = time / animation[q].t
    else if (p == animation.length-1)
        interp = (time - animation[p].t) / (animation[q].t - animation[p].t)
    const e1 = animation[p].e;
    const e2 = animation[q].e;
    for (let i = 0; i < e1.length; i++) {
        const points = []
        for (let j = 0; j < e1[i].length; j += 2) {
            points.push(e1[i][j]*(1-interp) + e2[i][j]*interp)
            points.push(e1[i][j+1]*(1-interp) + e2[i][j+1]*interp)
        }
        drawCurve(points)
    }
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