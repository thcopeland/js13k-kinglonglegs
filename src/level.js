import { xorshift } from "./utils"

export const loadLevel = (num) => {
    const level = LEVELS[num]
    GAME.level = level
    GAME.level_num = num
    GAME.npcs = level.npcs
    GAME.objects = level.objects
}

export const drawBackdrop = () => {
    ctx.save()
    ctx.translate(-GAME.viewport_x, -GAME.viewport_y)
    ctx.fillStyle = "#888"
    ctx.fillRect(0, 0, GAME.level.level_w, GAME.level.level_h)
    ctx.restore()
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
        const type = block[0] // TODO: normal, spikes
        const roughness = block[2]
        const points = block.slice(3)
        ctx.beginPath()
        ctx.moveTo(points[0], points[1])
        for (let i = 0; i < points.length-2; i += 2) {
            // Don't draw unnecessary lines.
            if (points[i] < GAME.viewport_x && points[i+2] < GAME.viewport_x ||
                points[i] > GAME.viewport_x + GAME.viewport_w && points[i+2] > GAME.viewport_x + GAME.viewport_w ||
                points[i+1] < GAME.viewport_y && points[i+3] < GAME.viewport_y ||
                points[i+1] > GAME.viewport_y + GAME.viewport_h && points[i+3] > GAME.viewport_y + GAME.viewport_h) {
                ctx.moveTo(points[i+2], points[i+3])
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

const LEVELS = [
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
        enter_hook: () => {},
        exit_hook: () => {},
        update_hook: () => {},
        draw_hook: () => {},
        level_w: 1500,
        level_h: 1000,
        objects: [],
        npcs: [],
        map: [
            [ 1, 0, 10,    0,500, 1000,500, 1200,600,   1200,700,   -10,700 ],
            [ 1, 0, 0,    1300,600, 1500,600, 1500,700, 1300,700, 1300,600]
        ]
    }
]