import { newSpikes } from "./spikes"
import { newWords } from "./comfort"
import { newLamppost } from "./lamppost"

export const loadLevel = (num) => {
    const level = LEVELS[num]
    G.level = level
    G.level_num = num
    G.npcs = level.npcs
    G.objects = level.objects
}


export const enforceLevelBounds = () => {
    const level = G.level
    const horizonalMargin = 20
    const aboveMargin = 50
    const belowMargin = 100

    if (G.player.x < horizonalMargin) {
        loadLevel(level.level_left[0])
        G.player.y += level.level_left[1]
        G.player.x = G.level.level_w - horizonalMargin
        if (IS_DEVELOPMENT_BUILD && level.level_left[1] !== -G.level.level_right[1]) {
            console.error("Asymmetric left->right transition between " + level.level_name + " and " + G.level.level_name)
        }
    } else if (G.player.x > level.level_w - horizonalMargin) {
        loadLevel(level.level_right[0])
        G.player.y += level.level_right[1]
        G.player.x = horizonalMargin
        if (IS_DEVELOPMENT_BUILD && level.level_right[1] !== -G.level.level_left[1]) {
            console.error("Asymmetric right->left transition between " + level.level_name + " and " + G.level.level_name)
        }
    } else if (G.player.y < aboveMargin) {
        loadLevel(level.level_up[0])
        G.player.x += level.level_up[1]
        G.player.y = G.level.level_h - belowMargin
        if (IS_DEVELOPMENT_BUILD && level.level_up[1] !== -G.level.level_down[1]) {
            console.error("Asymmetric up->down transition between " + level.level_name + " and " + G.level.level_name)
        }
    } else if (G.player.y > level.level_h - belowMargin) {
        loadLevel(level.level_down[0])
        G.player.x += level.level_down[1]
        G.player.y = aboveMargin
        if (IS_DEVELOPMENT_BUILD && level.level_down[1] !== -G.level.level_up[1]) {
            console.error("Asymmetric down_up transition between " + level.level_name + " and " + G.level.level_name)
        }
    }
}


// Perform a swept sphere vs line segment collision.
export const raycastTerrain = (x, y, vx, vy, radius) => {
    // ctx.save()
    // ctx.translate(-G.viewport_x, -G.viewport_y)
    const result = { t: 1e10 }
    for (let i = 0; i < G.level.colliders.length; i++) {
        const collider = G.level.colliders[i]

        // Perform swept sphere vs vertex checks.
        for (let j = 0; j < collider.length; j += 2)
        {
            const qx = x - collider[j]
            const qy = y - collider[j+1]
            const qDotV = qx*vx + qy*vy
            const t = qroot(vx*vx + vy*vy, 2*qDotV, qx*qx + qy*qy - radius*radius)
            if (t >= 0 && t <= 1e3 && t < result.t)
            {
                // ctx.strokeStyle = "purple"
                // ctx.beginPath()
                // ctx.moveTo(x + vx*t, y+vy*t)
                // ctx.lineTo(x + vx*t + qx, y+vy*t + qy)
                // ctx.stroke()
                result.t = t    // normalized time
                result.s = 0    // normalized distance along segment
                result.i = i    // collider index
                result.j = j    // segment index
                result.contact_x = collider[j]
                result.contact_y = collider[j+1]
                result.impulse = -qDotV / radius
            }
        }

        // Perform swept sphere vs line segment checks.
        for (let j = 0; j < collider.length-2; j += 2)
        {
            let nx = collider[j+3] - collider[j+1]
            let ny = collider[j] - collider[j+2]
            const l = Math.hypot(nx, ny)
            nx /= l
            ny /= l
            const nDotV = vx * nx + vy * ny
            if (nDotV > 0)
                continue;
            const nDotP = (x - collider[j]) * nx + (y - collider[j+1]) * ny
            const t = (radius - nDotP) / nDotV
            // Check that the collision happens in the future.
            if (t >= 0 && t <= 1e3 && t < result.t)
            {
                // const ax = (collider[j] + collider[j+2])/2
                // const ay = (collider[j+1] + collider[j+3])/2
                // ctx.beginPath()
                // ctx.strokeStyle = "violet"
                // ctx.moveTo(ax, ay)
                // ctx.lineTo(ax + nx * 30, ay + ny * 30)
                // ctx.stroke()
                // ctx.strokeStyle = "black"
                // ctx.strokeText("t = " + Math.round(100*t)/100 + (t > 0 && t < 16 ? " COLLISION" : ""), ax, ay-35)
                const s = (-ny * (x + vx * t - collider[j]) + nx * (y + vy * t - collider[j+1])) / l
                // ctx.strokeText("s = " + Math.round(100*s)/100 + (s > 0 && s < 1 ? " COLLISION" : ""), ax, ay-20)
                // Check that the sphere intersects the line segment.
                if (s >= 0 && s <= 1)
                {
                    // ctx.strokeStyle = "purple"
                    // ctx.beginPath()
                    // ctx.moveTo(x + vx*t, y+vy*t)
                    // ctx.lineTo(x + vx*t + nx * 50, y+vy*t + ny * 50)
                    // ctx.stroke()
                    result.t = t    // normalized time
                    result.s = s    // normalized distance along segment
                    result.i = i    // collider index
                    result.j = j    // segment index
                    result.contact_x = collider[j] + (collider[j+2] - collider[j]) * s
                    result.contact_y = collider[j+1] + (collider[j+3] - collider[j+1]) * s
                    result.impulse = -nDotV
                    // ctx.fillStyle = "blue"
                    // ctx.beginPath()
                    // ctx.arc(result.dest_x, result.dest_y, 10, 0, 6.28)
                    // ctx.fill()
                    // ctx.beginPath()
                    // ctx.arc(result.dest_x + result.normal_x * 20, result.dest_y + result.normal_y * 20, 5, 0, 6.28)
                    // ctx.fill()
                }
            }
        }
    }

    result.dest_x = x + vx * result.t
    result.dest_y = y + vy * result.t
    result.normal_x = (result.dest_x - result.contact_x) / radius
    result.normal_y = (result.dest_y - result.contact_y) / radius
    // ctx.restore()
    return result
}


const qroot = (a, b, c) => {
    // Return the smaller positive real root of ax^2 + bx + c, or a negative number.
    const det = b*b - 4 * a * c
    if (det < 0)
        return -1
    const e = -b / (2 * a)
    const f = Math.sqrt(det) / (2 * a)
    return e-f >= 0 ? e-f : e+f
}


const LEVELS = [
    // Introduction
    {
        level_name: "One",
        enter_hook: () => {},
        exit_hook: () => {},
        update_hook: () => {},
        draw_hook: () => {},
        brightness: 1,
        dust: 0,
        level_w: 2000,
        level_h: 2000,
        level_left: [0, 0],
        level_right: [0, 0],
        level_up: [0, 0],
        level_down: [0, 0],
        objects: [
            newSpikes([0, 500, 1000, 500, 1200, 600, 1200, 700, -10, 700], 30, undefined, undefined),
            newSpikes([1300, 600, 1500, 600, 1500, 700, 1300, 700, 1300, 600], 30, 0.003, 100),
            newWords("The path ahead is dark.\nTake courage.", 700, 205, -0.05),
            newLamppost(1350, 600, false, -1, -0.1)
        ],
        walls: [
            [ 10,	0, 500, 1000, 500, 1200, 600, 1200, 700, -10, 700 ],
            [ 1,	1300, 600, 1500, 600, 1500, 700, 1300, 700, 1300, 600 ],
            [ 30,	300, 300, 700, 200, 800, 200, 700, 300, 300, 300 ],
            [ 30,	-10, -60, 290, -80, 340, -40, 60, 20, 260, 300, 20, 360, -60, 110, -10, -60 ]
        ],
        colliders: [
            [ 0, 500, 1000, 500, 1200, 600, 1200, 700, -10, 700 ],
            [ 1300, 600, 1500, 600, 1500, 700, 1300, 700, 1300, 600 ],
            [ 300, 300, 700, 200, 800, 200, 700, 300, 300, 300 ],
            [ -10, -60, 290, -80, 340, -40, 60, 20, 260, 300, 20, 360, -60, 110, -10, -60 ]
        ]
    }
]