import { xorshift } from "./utils"
import { getAnimation } from "./animation"
import { setStrokeAndFill, hypot } from "./utils"


export const drawWalker = (walker) => {
    ctx.save()
    ctx.translate(walker.x - GAME.viewport_x, walker.y - GAME.viewport_y)
    ctx.scale(walker.facing_*walker.scale_, walker.scale_)
    setStrokeAndFill("#333", "#888", "2")
    const animation = getAnimation(walker.anim, walker.anim_time)
    drawCurve(animation.slice(2, 8))
    drawCurve(animation.slice(8, 14))
    drawRoughCircle(animation[0], animation[1], 40, walker.id_, 1)
    setStrokeAndFill("#333", "#000", "2")
    ctx.beginPath()
    ctx.arc(animation[0] + 20, animation[1], 3, 0, 2*Math.PI)
    ctx.fill()
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
    ctx.save()
    ctx.translate(-GAME.viewport_x, -GAME.viewport_y)
    setStrokeAndFill("#000", "#aaa", "1")
    GAME.level.map.forEach((block, seed) => {
        const roughness = block[0]
        const points = block.slice(1)
        ctx.beginPath()
        ctx.moveTo(points[0], points[1])
        for (let i = 0; i < points.length-2; i += 2) {
            let rng = xorshift((GAME.level_num ^ seed ^ roughness ^ i) | 1)
            // Don't draw unnecessary lines.
            if (points[i] < GAME.viewport_x && points[i+2] < GAME.viewport_x ||
                points[i] > GAME.viewport_x + GAME.viewport_w && points[i+2] > GAME.viewport_x + GAME.viewport_w ||
                points[i+1] < GAME.viewport_y && points[i+3] < GAME.viewport_y ||
                points[i+1] > GAME.viewport_y + GAME.viewport_h && points[i+3] > GAME.viewport_y + GAME.viewport_h) {
                ctx.lineTo(points[i+2], points[i+3])
            } else {
                const x = points[i]
                const y = points[i+1]
                const dx = points[i+2] - x
                const dy = points[i+3] - y
                const dist = hypot(dx, dy)
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
        setStrokeAndFill("#f00", "#000", "1")
        GAME.level.colliders.forEach(collider => {
            ctx.beginPath()
            ctx.moveTo(collider[1], collider[2])
            for (let i = 3; i < collider.length; i += 2) {
                ctx.lineTo(collider[i], collider[i+1])
            }
            ctx.stroke()
        })
    }
    ctx.restore()
}


export const drawParticles = () => {
    ctx.save()
    ctx.translate(-GAME.viewport_x, -GAME.viewport_y)
    setStrokeAndFill("#fff8", "#fff", "2")
    for (let i = 0; i < GAME.particles.length; i++)
    {
        const particle = GAME.particles[i]
        if (particle !== undefined)  {
            const px = particle.screenspace ? particle.x + GAME.viewport_x : particle.x
            const py = particle.screenspace ? particle.y + GAME.viewport_y : particle.y
            if (px > GAME.viewport_x - 10 && px < GAME.viewport_x + GAME.viewport_w + 10 &&
                py > GAME.viewport_y - 10 && py < GAME.viewport_y + GAME.viewport_h + 10) {
                ctx.beginPath()
                ctx.arc(px, py, 3, 0, 2 * Math.PI)
                ctx.fill()
                ctx.stroke()
            }
        }
    }
    ctx.restore()
}


export const drawRoughCircle = (x, y, radius, rng, noise) => {
    let angle = 0
    const points = []
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2*Math.PI)
    ctx.fill()
    while (angle < 4*Math.PI) {
        rng = xorshift(rng)
        angle += (rng & 255) / 512 + 0.1
        const s = 1 + ((rng & 255) - 128) / 6000 * noise
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


export const drawGameObjects = () => {
    ctx.save()
    ctx.translate(-GAME.viewport_x, -GAME.viewport_y)
    for (let i = 0; i < GAME.level.objects.length; i++) {
        const object = GAME.level.objects[i];
        if (object.type_ === "spikes") {
            setStrokeAndFill("#000", "#aaa", "2")
            let rng = xorshift(i | 11)
            ctx.beginPath()
            for (let j = 0; j < object.positions.length; j += 4) {
                rng = xorshift(rng)
                const span = 4
                const extension = Math.pow(object.extensions[j/2], 4)
                const x = object.positions[j]
                const y = object.positions[j+1]
                if (x > GAME.viewport_x - 100 && x < GAME.viewport_x + GAME.viewport_w + 100 &&
                    y > GAME.viewport_y - 100 && y < GAME.viewport_y + GAME.viewport_h + 100) {
                    const nx = object.positions[j+2]
                    const ny = object.positions[j+3]
                    ctx.beginPath()
                    ctx.moveTo(x + ny * span + nx * object.reach * (extension - 1), y - nx * span + ny * object.reach * (extension - 1))
                    ctx.lineTo(x + nx * object.reach * extension, y + ny * object.reach * extension)
                    ctx.lineTo(x - ny * span + nx * object.reach * (extension - 1), y + nx * span + ny * object.reach * (extension - 1))
                    ctx.stroke()
                    ctx.fill()
                }
            }
        } else {
            if (IS_DEVELOPMENT_BUILD) {
                ctx.restore()
                throw new Exception("Invalid game object " + object)
            }
        }
    }
    ctx.restore()
}
