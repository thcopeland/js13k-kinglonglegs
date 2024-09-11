import { newSpikes } from "./spikes"
import { newWords } from "./comfort"
import { newLamppost } from "./lamppost"
import { LEG_OFFSET } from "./walker" // Circular dependency :(
import { importLevel } from "./editor/level"

export const loadLevel = (num) => {
    const level = LEVELS[num]
    G.level = level
    G.level_num = num
    G.npcs = level.npcs
    G.objects = level.objects

    if (IS_DEVELOPMENT_BUILD && E.enabled) {
        console.log("CURRENT LEVEL: " + num + " " + LEVELS[num].level_name)
        importLevel()
    }
}


export const enforceLevelBounds = () => {
    const level = G.level
    const horizonalMargin = 20
    const aboveMargin = 50
    const belowMargin = 100

    if (IS_DEVELOPMENT_BUILD && E.enabled && G.isEditPaused && E.tool === "add") {
        // Don't switch levels at inconvenient times.
        return
    }

    const viewportOffsetX = G.viewport_x - G.player.x
    const viewportOffsetY = G.viewport_y - G.player.y
    if (G.player.x < horizonalMargin) {
        loadLevel(level.level_left[0])
        G.player.y += level.level_left[1]
        G.player.x = G.level.level_w - horizonalMargin - 1
        if (IS_DEVELOPMENT_BUILD && level.level_left[1] !== -G.level.level_right[1] && level !== G.level) {
            console.error("Asymmetric left->right transition between " + level.level_name + " and " + G.level.level_name)
        }
    } else if (G.player.x > level.level_w - horizonalMargin) {
        loadLevel(level.level_right[0])
        G.player.y += level.level_right[1]
        G.player.x = horizonalMargin + 1
        if (IS_DEVELOPMENT_BUILD && level.level_right[1] !== -G.level.level_left[1] && level !== G.level) {
            console.error("Asymmetric right->left transition between " + level.level_name + " and " + G.level.level_name)
        }
        console.log("(", G.player.x + ", "+ G.player.y, ")")
    } else if (G.player.y < aboveMargin) {
        loadLevel(level.level_up[0])
        G.player.x += level.level_up[1]
        G.player.y = G.level.level_h - belowMargin
        if (IS_DEVELOPMENT_BUILD && level.level_up[1] !== -G.level.level_down[1] && level !== G.level) {
            console.error("Asymmetric up->down transition between " + level.level_name + " and " + G.level.level_name)
        }
    } else if (G.player.y > level.level_h - belowMargin) {
        loadLevel(level.level_down[0])
        G.player.x += level.level_down[1]
        G.player.y = aboveMargin
        if (IS_DEVELOPMENT_BUILD && level.level_down[1] !== -G.level.level_up[1] && level !== G.level) {
            console.error("Asymmetric down_up transition between " + level.level_name + " and " + G.level.level_name)
        }
    } else {
        return
    }

    // Ensure the player doesn't fall through the ground between levels.
    // This isn't strictly necessary but it makes level design much easier.
    const ground = raycastTerrain(G.player.x, G.player.y + LEG_OFFSET - 30, 0, 1, 30)
    if (IS_DEVELOPMENT_BUILD && ground.t > 50)
        console.error("difference:" + (G.player.y - (ground.contact_y - LEG_OFFSET)))
    if (ground.t < 50)
        G.player.y = ground.contact_y - LEG_OFFSET - 1
    G.viewport_x = viewportOffsetX + G.player.x
    G.viewport_y = viewportOffsetY + G.player.y
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
    {
        level_name: "One",
        level_w: 4000,
        level_h: 2000,
        level_left: [0, 0],
        level_right: [1, -1000],
        level_up: [0, 0],
        level_down: [0, 0],
        objects: [
            newLamppost(342, 1824, true, -1, 0),
            newWords("Far below the king waits.\nBe bold.", 3801, 1198, 0)
        ],
        walls: [
            [ 20,	1330, 1870, 1430, 1780, 1510, 1760, 1600, 1870, 1330, 1870 ],
            [ 15,	1710, 1900, 1840, 1770, 1770, 1560, 1970, 1600, 2080, 1700, 2160, 1700, 2170, 1900, 1710, 1900 ],
            [ 20,	4000, 1510, 3650, 1480, 3450, 1380, 3450, 1220, 4000, 1180 ],
            [ 20,	4000, 1200, 3960, 1170, 3980, 840, 3560, 670, 3030, 560, 2640, 710, 2630, 910, 2920, 1180, 3070, 1270, 3070, 1410, 2770, 1430, 2470, 1220, 1880, 1090, 1480, 430, 0, 460, 0, 360, 4000, 260 ],
            [ 20,	0, 450, 70, 1050, 120, 1610, 310, 1820, 4000, 1870, 4000, 2000, 0, 2000 ],
            [ 15,	3290, 1560, 3480, 1560, 3470, 1650, 3250, 1660, 3290, 1560 ]
        ],
        colliders: [
            [ 1330, 1870, 1430, 1780, 1510, 1760, 1600, 1870, 1330, 1870 ],
            [ 1710, 1900, 1840, 1770, 1770, 1560, 1970, 1600, 2080, 1700, 2160, 1700, 2170, 1900, 1710, 1900 ],
            [ 4000, 1510, 3650, 1480, 3450, 1380, 3450, 1220, 4000, 1180 ],
            [ 4000, 1200, 3960, 1170, 3980, 840, 3560, 670, 3030, 560, 2640, 710, 2630, 910, 2920, 1180, 3070, 1270, 3070, 1410, 2770, 1430, 2470, 1220, 1880, 1090, 1480, 430, 0, 460, 0, 360, 4000, 260 ],
            [ 0, 450, 70, 1050, 120, 1610, 310, 1820, 4000, 1870, 4000, 2000, 0, 2000 ],
            [ 3290, 1560, 3480, 1560, 3470, 1650, 3250, 1660, 3290, 1560 ]
        ]
    },
    {
        level_name: "Two",
        level_w: 3200,
        level_h: 3000,
        level_left: [0, 1000],
        level_right: [2, -1450],
        level_up: [0, 0],
        level_down: [0, 0],
        objects: [
            newWords("Fortune favors the bold.", 3008, 1235, 0),
            newLamppost(299, 2539, false, -1, -0.15),
            newSpikes([570, 2100, 300, 2070], 40, undefined, undefined),
            newSpikes([820, 2130, 560, 2100], 30, undefined, undefined)
        ],
        walls: [
            [ 20,	0, 900, 730, 900, 1090, 960, 1290, 1070, 1290, 1220, 1120, 1450, 1120, 2230, 1040, 2360, 820, 2130, 300, 2070, 200, 2480, 340, 2540, 340, 2630, 3200, 2720, 3200, 3000, 0, 2990 ],
            [ 30,	1910, 1230, 2360, 1220, 2330, 1350, 2010, 1340, 1970, 1280, 1910, 1230 ],
            [ 30,	3200, 120, 3200, 870, 3030, 860, 2780, 840, 2730, 770, 2460, 790, 2230, 650, 2070, 630, 1930, 650, 1880, 730, 1740, 690, 1700, 590, 1670, 540, 1190, 360, 570, 450, 0, 500, -10, 80 ],
            [ 30,	3200, 2260, 2670, 2210, 2410, 2040, 2350, 1780, 2550, 1600, 2700, 1260, 3000, 1240, 3200, 1200 ]
        ],
        colliders: [
            [ 0, 900, 730, 900, 1090, 960, 1290, 1070, 1290, 1220, 1120, 1450, 1120, 2230, 1040, 2360, 820, 2130, 300, 2070, 200, 2480, 340, 2540, 340, 2630, 3200, 2720, 3200, 3000, 0, 2990 ],
            [ 1910, 1230, 2360, 1220, 2330, 1350, 2010, 1340, 1970, 1280, 1910, 1230 ],
            [ 3200, 120, 3200, 870, 3030, 860, 2780, 840, 2730, 770, 2460, 790, 2230, 650, 2070, 630, 1930, 650, 1880, 730, 1740, 690, 1700, 590, 1670, 540, 1190, 360, 570, 450, 0, 500, -10, 80 ],
            [ 3200, 2260, 2670, 2210, 2410, 2040, 2350, 1780, 2550, 1600, 2700, 1260, 3000, 1240, 3200, 1200 ]
        ]
    },
    {
        level_name: "Three",
        level_w: 1500,
        level_h: 4000,
        level_left: [1, 1450],
        level_right: [2, -1000],
        level_up: [0, 0],
        level_down: [0, 0],
        objects: [
            newSpikes([800, 3070, 1170, 3080], 30, 0.003, 10),
            newSpikes([740, 3170, 780, 3070], 30, 0.003, 10)
        ],
        walls: [
            [ 30,	-100, 280, 470, 280, 550, 560, 510, 660, 380, 720, 190, 780, 40, 800, 0, 800, -30, 820, -70, 840, -90, 850, -100, 850 ],
            [ 30,	310, 1440, 550, 1430, 520, 1540, 490, 1690, 360, 1710, 300, 1700, 230, 1630, 310, 1440 ],
            [ 30,	1000, 1910, 1270, 1920, 1240, 2120, 1090, 2220, 1000, 2190, 960, 2090, 950, 1990, 970, 1930, 1000, 1910 ],
            [ 30,	260, 2590, 560, 2590, 510, 2690, 460, 2720, 300, 2730, 250, 2660, 260, 2590 ],
            [ 30,	800, 3110, 1360, 3130, 1320, 3280, 1110, 3330, 780, 3170, 800, 3110 ],
            [ 30,	-100, 3950, 1500, 3950, 1500, 4000, -100, 4000 ],
            [ 30,	1160, 1380, 1500, 1390, 1500, 3440, 1360, 3420, 1280, 3390, 1210, 3350, 1170, 3320, 1160, 1380 ],
            [ 30,	-100, 1280, 40, 1280, 170, 1310, 290, 1360, 350, 1460, 360, 1540, 360, 3310, 280, 3390, 140, 3470, -20, 3520, -100, 3550, -100, 3540 ],
            [ 30,	960, 730, 1200, 720, 1250, 820, 1210, 890, 1030, 880, 930, 860, 960, 730 ]
        ],
        colliders: [
            [ -100, 280, 470, 280, 550, 560, 510, 660, 380, 720, 190, 780, 40, 800, 0, 800, -30, 820, -70, 840, -90, 850, -100, 850 ],
            [ -100, 1280, 40, 1280, 170, 1310, 290, 1360, 350, 1460, 360, 1540, 360, 3310, 280, 3390, 140, 3470, -20, 3520, -100, 3550, -100, 3540 ],
            [ 1160, 1380, 1500, 1390, 1500, 3440, 1360, 3420, 1280, 3390, 1210, 3350, 1170, 3320, 1160, 1380 ],
            [ 310, 1440, 550, 1430, 520, 1540, 490, 1690, 360, 1710, 300, 1700, 230, 1630, 310, 1440 ],
            [ 1000, 1910, 1270, 1920, 1240, 2120, 1090, 2220, 1000, 2190, 960, 2090, 950, 1990, 970, 1930, 1000, 1910 ],
            [ 260, 2590, 560, 2590, 510, 2690, 460, 2720, 300, 2730, 250, 2660, 260, 2590 ],
            [ 800, 3110, 1360, 3130, 1320, 3280, 1110, 3330, 780, 3170, 800, 3110 ],
            [ -100, 3950, 1500, 3950, 1500, 4000, -100, 4000 ],
            [ 960, 730, 1200, 720, 1250, 820, 1210, 890, 1030, 880, 930, 860, 960, 730 ]
        ]
    }
]