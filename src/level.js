import { xorshift } from "./utils"

export const LEVELS = [
    // Introduction
    {
        messages_: [
            {
                text_: "The First",
                position_: {
                    reference_: 1, // Absolute, Player, Viewport
                    x: 10,
                    y: 0
                },
                cost: 0,
                trigger: () => true
            }
        ],
        brightness: 1,
        dust: 0,
        enter: () => {},
        exit: () => {},
        logic: () => {},
        draw: () => {},
        width_: 1500,
        height_: 1000,
        segments: [
            [ 1, 0, 5,    0,500, 1000,500, 1200,600,   1200,700,   -10,700 ],
            [ 1, 0, 0,    1300,600, 1500,600, 1500,700, 1300,700, 1300,600]
        ]
    }
]

export const drawBackdrop = () => {
    ctx.save()
    ctx.translate(-viewport.x, -viewport.y)
    const l = LEVELS[level]
    ctx.fillStyle = "#888"
    ctx.fillRect(0, 0, l.width_, l.height_)
    ctx.restore()
}

export const drawLevel = () => {
    let rng = xorshift(level | 1234)
    ctx.save()
    ctx.translate(-viewport.x, -viewport.y)
    LEVELS[level].segments.forEach(segment => {
        ctx.lineCap = "round"
        ctx.strokeStyle = "#000"
        ctx.fillStyle = "#aaa"
        ctx.lineWidth = "1"
        const type = segment[0] // TODO: normal, spikes
        const roughness = segment[2]
        const points = segment.slice(3)
        ctx.beginPath()
        ctx.moveTo(points[0], points[1])
        for (let i = 0; i < points.length-2; i += 2) {
            // Don't draw unnecessary lines.
            if (points[i] < viewport.x && points[i+2] < viewport.x ||
                points[i] > viewport.x + viewport.width_ && points[i+2] > viewport.x + viewport.width_ ||
                points[i+1] < viewport.y && points[i+3] < viewport.y ||
                points[i+1] > viewport.y + viewport.height_ && points[i+3] > viewport.x + viewport.height) {
                ctx.moveTo(points[i+2], points[i+3])
            } else {
                const x = points[i]
                const y = points[i+1]
                const dx = points[i+2] - x
                const dy = points[i+3] - y
                const dist = Math.hypot(dx, dy)
                const nx = -dy / dist
                const ny = dx / dist
                for (let f = 0; f < dist; f += (rng % 16) + 16)
                {
                    ctx.lineTo(
                        x + dx / dist * f + nx * (((rng = xorshift(rng)) % roughness - 6)), 
                        y + dy * f / dist + ny * (((rng = xorshift(rng)) % roughness - 6)))
                }
            }
        }
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
        if (IS_DEVELOPMENT_BUILD) {
            ctx.beginPath()
            ctx.strokeStyle = "#00f"
            ctx.moveTo(points[0], points[1])
            for (let i = 0; i < points.length; i += 2) {
                const x = points[i]
                const y = points[i+1]
                ctx.lineTo(x, y)
            }
            ctx.closePath()
            ctx.stroke()
        }
    })
    ctx.restore()
}

// [isColliding, segment, signed distance]
export const getNextCollision = (bbX, bbY, bbW, bbH) => {
    const rad = Math.hypot(bbW, bbH) / 2

}