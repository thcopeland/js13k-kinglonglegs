import { xorshift } from "./utils"
import { getAnimation } from "./animation"

export const drawWalker = (walker) => {
    ctx.save()
    ctx.translate(walker.x - GAME.viewport_x, walker.y - GAME.viewport_y)
    ctx.scale(walker.facing_*walker.scale_, walker.scale_)
    ctx.strokeStyle = "#333"
    ctx.lineWidth = "2"
    ctx.fillStyle = "#888"
    ctx.lineCap = "round"
    const animation = getAnimation(walker.animation_, walker.time_)
    drawCurve(animation.slice(2, 8))
    drawCurve(animation.slice(8, 14))
    // drawCurve(animation.slice(6, 10))
    // drawCurve(animation.slice(10, 14))
    // drawCurve(animation.slice(14, 18))
    // ctx.beginPath()
    // ctx.arc(animation[2], animation[3]+10, 4, 0, 2*Math.PI)
    // ctx.stroke()
    // ctx.fill()
    ctx.lineWidth = "2"
    drawRoughCircle(animation[0], animation[1], 40, walker.id_)
    if (IS_DEVELOPMENT_BUILD ) {
        ctx.strokeStyle = "#f00"
        ctx.lineWidth = "1"
        ctx.strokeRect(-32, -190, 64, 190)
    }
    ctx.restore()
}


export const drawBackdrop = () => {
    // ctx.save()
    // ctx.translate(-GAME.viewport_x, -GAME.viewport_y)
    ctx.fillStyle = "#888"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    // ctx.restore()
}

export const drawLevel = () => {
    let rng = xorshift(GAME.level_num | 1234)
    ctx.save()
    ctx.translate(-GAME.viewport_x, -GAME.viewport_y)
    GAME.level.map.forEach(block => {
        ctx.lineCap = "round"
        ctx.strokeStyle = "#000"
        ctx.fillStyle = "#aaa"
        ctx.lineWidth = "1"
        const roughness = block[0]
        const points = block.slice(1)
        ctx.beginPath()
        ctx.moveTo(points[0], points[1])
        for (let i = 0; i < points.length-2; i += 2) {
            // Don't draw unnecessary lines.
            if (false && (points[i] < GAME.viewport_x && points[i+2] < GAME.viewport_x ||
                points[i] > GAME.viewport_x + GAME.viewport_w && points[i+2] > GAME.viewport_x + GAME.viewport_w ||
                points[i+1] < GAME.viewport_y && points[i+3] < GAME.viewport_y ||
                points[i+1] > GAME.viewport_y + GAME.viewport_h && points[i+3] > GAME.viewport_y + GAME.viewport_h)) {
                ctx.lineTo(points[i+2], points[i+3])
            } else {
                const x = points[i]
                const y = points[i+1]
                const dx = points[i+2] - x
                const dy = points[i+3] - y
                const dist = Math.hypot(dx, dy)
                const nx = dy / dist
                const ny = -dx / dist
                for (let f = 0; f < dist; f += (rng % 16) + 16)
                {
                    ctx.lineTo(
                        x + dx / dist * f + nx * (Math.abs(rng=xorshift(rng))%roughness),
                        y + dy * f / dist + ny * (Math.abs(rng=xorshift(rng))%roughness))
                }
            }
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
    })
    if (IS_DEVELOPMENT_BUILD) {
        GAME.level.colliders.forEach(collider => {
            ctx.beginPath()
            ctx.strokeStyle = "#f00"
            ctx.moveTo(collider[1], collider[2])
            for (let i = 3; i < collider.length; i += 2) {
                ctx.lineTo(collider[i], collider[i+1])
            }
            ctx.stroke()
        })
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
    drawCurve(points, rng, 0)
}


export const drawCurve = (points) => {
    ctx.beginPath()
    ctx.moveTo(points[0], points[1])
    for (let i = 2; i < points.length - 2; i += 2) {
        ctx.quadraticCurveTo(points[i], points[i+1], (points[i] + points[i + 2]) / 2, (points[i + 1] + points[i + 3]) / 2)
    }
    ctx.lineTo(points[points.length-2], points[points.length-1])
    ctx.stroke()
}
