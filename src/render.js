import { xorshift, setStrokeAndFill, grayscale, hypot } from "./utils"
import { getAnimation } from "./animation"
import { WALKER_SKULL, WALKER_FIBULA, WALKER_FEMUR } from "./walker"
import { WORDS_OF_COMFORT_PEDESTAL, WORDS_OF_COMFORT_BOOK } from "./shapes"

export const drawText = (x, y, text) => {
    const lines = text.split("\n")
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        ctx.fillText(line, x, y)
        if (i < lines.length-1) {
            const m = ctx.measureText(line)
            y += 1.5 * (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent)
        }
    }
}


export const drawWalker = (walker) => {
    ctx.save()
    ctx.translate(walker.x - G.viewport_x, walker.y - G.viewport_y)
    // ctx.scale(walker.facing_*walker.scale_, walker.scale_)
    setStrokeAndFill(3, 9, 2)
    for (let i = 0; i < walker.legs.length; i++) {
        const leg = walker.legs[i]
        // Solve the two-segment inverse kinematics problem. Something like
        // FABRIK is pretty simple but trigonometry is sufficient.
        const c = Math.min(10000 + WALKER_FIBULA + WALKER_FEMUR, Math.hypot(leg[0] - leg[2], leg[1] - leg[3]))
        // Use the Law of Cosines to find the angle between the femur and fibula.
        const theta = Math.acos((WALKER_FIBULA*WALKER_FIBULA + WALKER_FEMUR*WALKER_FEMUR - c*c) / (2 * WALKER_FEMUR * WALKER_FIBULA)) || Math.PI
        // Use the Law of Sines to find the angle between the long edge and the femur.
        let phi = Math.PI - theta - (Math.asin(WALKER_FEMUR * Math.sin(theta) / c) || 0) // Law of Sines
        if (walker.facing_ < 0)
            phi = -phi
        // Calculate the angle betwen the vertical and the femur.
        const alpha = Math.PI/2 - phi - Math.asin((leg[2] - leg[0]) / c)
        ctx.beginPath()
        ctx.moveTo(leg[0], leg[1])
        ctx.lineTo(leg[0] + WALKER_FEMUR * Math.cos(alpha), leg[1] + WALKER_FEMUR * Math.sin(alpha))
        // ctx.lineTo(leg[0] + WALKER_FEMUR * Math.cos(alpha) - WALKER_FIBULA * Math.cos(Math.PI - (alpha + theta)), 
        //            leg[1] + WALKER_FEMUR * Math.sin(alpha) - WALKER_FIBULA * Math.sin(Math.PI - (alpha + theta)))
        ctx.lineTo(leg[2], leg[3])
        ctx.stroke()
    }

    ctx.beginPath()
    ctx.arc(0, 0, WALKER_SKULL, 0, 2 * Math.PI)
    // ctx.fill()
    ctx.stroke()

    // const animation = getAnimation(walker.anim, walker.anim_time)
    // drawCurve(animation.slice(2, 8))
    // drawCurve(animation.slice(8, 14))
    // drawRoughCircle(animation[0], animation[1], 40, walker.id_, 1)
    // setStrokeAndFill(3, 0, 2)
    // ctx.beginPath()
    // ctx.arc(animation[0] + 20, animation[1], 3, 0, 2*Math.PI)
    // ctx.fill()
    ctx.restore()
}


export const drawBackdrop = () => {
    // ctx.save()
    // ctx.translate(-G.viewport_x, -G.viewport_y)
    ctx.fillStyle = "#888"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    // ctx.restore()
}

export const drawLevel = () => {
    ctx.save()
    ctx.translate(-G.viewport_x, -G.viewport_y)
    setStrokeAndFill(0, 10, 1)
    G.level.map.forEach((block, seed) => {
        const roughness = block[0]
        const points = block.slice(1)
        ctx.beginPath()
        ctx.moveTo(points[0], points[1])
        for (let i = 0; i < points.length-2; i += 2) {
            let rng = xorshift((G.level_num ^ seed ^ roughness ^ i) | 1)
            // Don't draw unnecessary lines.
            if (points[i] < G.viewport_x && points[i+2] < G.viewport_x ||
                points[i] > G.viewport_x + G.viewport_w && points[i+2] > G.viewport_x + G.viewport_w ||
                points[i+1] < G.viewport_y && points[i+3] < G.viewport_y ||
                points[i+1] > G.viewport_y + G.viewport_h && points[i+3] > G.viewport_y + G.viewport_h) {
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
        ctx.strokeStyle = "#f00"
        ctx.fillStyle = "#000"
        ctx.lineWidth = 1
        G.level.colliders.forEach(collider => {
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
    ctx.translate(-G.viewport_x, -G.viewport_y)
    setStrokeAndFill(13, 15, 1)
    for (let i = 0; i < G.particles.length; i++)
    {
        const particle = G.particles[i]
        if (particle !== undefined)  {
            const px = particle.screenspace ? particle.x + G.viewport_x : particle.x
            const py = particle.screenspace ? particle.y + G.viewport_y : particle.y
            if (px > G.viewport_x - 10 && px < G.viewport_x + G.viewport_w + 10 &&
                py > G.viewport_y - 10 && py < G.viewport_y + G.viewport_h + 10) {
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
        points.push(Math.cos(angle) * radius*s + x, Math.sin(angle) * radius*s + y)
    }
    points.push(points[0], points[1])
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
    ctx.translate(-G.viewport_x, -G.viewport_y)
    for (let i = 0; i < G.level.objects.length; i++) {
        const object = G.level.objects[i]
        let rng = xorshift(i | 11)
        if (object.type_ === "spikes") {
            setStrokeAndFill(0, 10, 2)
            ctx.beginPath()
            for (let j = 0; j < object.positions.length; j += 4) {
                rng = xorshift(rng)
                const reach = object.reach * (1 + (rng % 30) / 100)
                const span = Math.log(reach) + 1
                const extension = Math.pow(object.extension[j/2], 4)
                const x = object.positions[j]
                const y = object.positions[j+1]
                if (x > G.viewport_x - reach && x < G.viewport_x + G.viewport_w + reach &&
                    y > G.viewport_y - reach && y < G.viewport_y + G.viewport_h + reach) {
                    const nx = object.positions[j+2]
                    const ny = object.positions[j+3]
                    ctx.beginPath()
                    ctx.moveTo(x + ny * span + nx * reach * (extension - 1), y - nx * span + ny * reach * (extension - 1))
                    ctx.lineTo(x + nx * reach * extension, y + ny * reach * extension)
                    ctx.lineTo(x - ny * span + nx * reach * (extension - 1), y + nx * span + ny * reach * (extension - 1))
                    ctx.stroke()
                    ctx.fill()
                }
            }
        } else if (object.type_ === "words") {
            drawShape(WORDS_OF_COMFORT_BOOK, object.x, object.y - 157 + 15 * Math.pow(object.t / 500, 3))
            drawShape(WORDS_OF_COMFORT_PEDESTAL, object.x, object.y)
        } else {
            if (IS_DEVELOPMENT_BUILD) {
                ctx.restore()
                throw new Error("Invalid game object " + JSON.stringify(object))
            }
        }
    }
    ctx.restore()
}


export const drawShape = (shape, x, y) => {
    ctx.beginPath()
    for (let i = 0; i < shape.length; i++) {
        const command = shape[i]
        if (command.cmd === "s")
            ctx.stroke()
        else if (command.cmd === "f")
            ctx.fill()
        else if (command.cmd === "S")
            ctx.strokeStyle = grayscale(command.data[0])
        else if (command.cmd === "F")
            ctx.fillStyle = grayscale(command.data[0])
        else if (command.cmd === "W")
            ctx.lineWidth = command.data[0]
        else if (command.cmd === "l") {
            for (let j = 0; j < command.data.length; j += 2)
                ctx.lineTo(command.data[j] + x, command.data[j+1] + y)
        } else if (command.cmd === "A")
            ctx.beginPath()
        else if (command.cmd === "Z")
            ctx.closePath()
        else if (command.cmd === "a") {
            ctx.arc(command.data[0] + x, command.data[1] + y, command.data[2], command.data[3], command.data[4])
        } else if (command.cmd === "r") {
            ctx.fillRect(command.data[0] + x, command.data[1] + y, command.data[2], command.data[3])
            ctx.strokeRect(command.data[0] + x, command.data[1] + y, command.data[2], command.data[3])
        } else if (IS_DEVELOPMENT_BUILD)
            throw new Error("Unexpected drawing command " + command.cmd)
    }
}


export const drawMessages = () => {
    ctx.save()
    ctx.translate(-G.viewport_x, -G.viewport_y)
    for (let i = 0; i < G.messages.length; i++) {
        const m = G.messages[i]
        if (m !== undefined) {
            if (m.t > 1000)
                ctx.fillStyle = "#000"
            else
                ctx.fillStyle = "#000000" + Math.floor(255 * m.t / 1000).toString(16)
            drawText(m.x, m.y, m.text)
        }
    }
    ctx.restore()
}