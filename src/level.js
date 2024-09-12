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
        level_right: [2, 0],
        level_up: [0, 0],
        level_down: [0, 0],
        objects: [
            newWords("Fortune favors the bold.", 3008, 1235, 0),
            newLamppost(299, 2539, false, -1, -0.15),
            newSpikes([570, 2100, 300, 2070], 40, undefined, undefined),
            newSpikes([820, 2130, 560, 2100], 30, undefined, undefined)
        ],
        walls: [
            [ 10,	0, 900, 730, 900, 1090, 940, 1340, 1030, 1290, 1220, 1120, 1450, 1120, 2230, 1040, 2360, 820, 2130, 300, 2070, 200, 2480, 340, 2540, 340, 2630, 3200, 2720, 3200, 3000, 0, 2990 ],
            [ 10,	1890, 1260, 2400, 1270, 2320, 1370, 2000, 1350, 1970, 1300, 1890, 1260 ],
            [ 30,	3200, 0, 3200, 870, 3030, 860, 2780, 840, 2730, 770, 2460, 790, 2230, 650, 2070, 630, 1930, 650, 1880, 730, 1740, 690, 1700, 590, 1670, 540, 1190, 360, 570, 450, 0, 500, 0, 0 ],
            [ 30,	3200, 2260, 2670, 2210, 2410, 2040, 2350, 1780, 2550, 1600, 2700, 1260, 3000, 1240, 3200, 1200 ]
        ],
        colliders: [
            [ 0, 900, 730, 900, 1090, 940, 1340, 1030, 1290, 1220, 1120, 1450, 1120, 2230, 1040, 2360, 820, 2130, 300, 2070, 200, 2480, 340, 2540, 340, 2630, 3200, 2720, 3200, 3000, 0, 2990 ],
            [ 1890, 1260, 2400, 1270, 2320, 1370, 2000, 1350, 1970, 1300, 1890, 1260 ],
            [ 3200, 0, 3200, 870, 3030, 860, 2780, 840, 2730, 770, 2460, 790, 2230, 650, 2070, 630, 1930, 650, 1880, 730, 1740, 690, 1700, 590, 1670, 540, 1190, 360, 570, 450, 0, 500, 0, 0 ],
            [ 3200, 2260, 2670, 2210, 2410, 2040, 2350, 1780, 2550, 1600, 2700, 1260, 3000, 1240, 3200, 1200 ]
        ]
    },
    {
        level_name: "Three",
        level_w: 2000,
        level_h: 6000,
        level_left: [1, 0],
        level_right: [0, 0],
        level_up: [0, 0],
        level_down: [0, 0],
        objects: [
            newWords("The path ahead grows dark.\nTake courage.", 638, 5392, 0),
            newSpikes([1180, 4560, 1180, 4350], 50, 0.001, 200),
            newSpikes([1650, 2410, 1830, 2400, 1900, 2490, 1850, 2540, 1630, 2540, 1650, 2410], 30, 0.003, 250)
        ],
        walls: [
            [ 30,	0, 1230, 180, 1210, 500, 1240, 730, 1380, 940, 1990, 520, 2190, 190, 2260, 0, 2260 ],
            [ 20,	300, 3470, 520, 3510, 690, 3470, 780, 3520, 690, 3580, 320, 3720 ],
            [ 20,	370, 2880, 670, 2950, 580, 3080, 350, 3010, 370, 2880 ],
            [ 20,	980, 3200, 1310, 3160, 1290, 3290, 1150, 3310, 980, 3300, 980, 3200 ],
            [ 20,	260, 4040, 550, 4090, 590, 4230, 720, 4260, 710, 4350, 330, 4320, 260, 4040 ],
            [ 30,	800, 4560, 1360, 4580, 1150, 4800, 780, 4620, 800, 4560 ],
            [ 30,	0, 5400, 2000, 5390, 2000, 5930, 0, 5970 ],
            [ 30,	1230, 2790, 2000, 2840, 2000, 4960, 1640, 4950, 1280, 4840, 1170, 4770, 1230, 2790 ],
            [ 20,	0, 2730, 170, 2730, 360, 2770, 370, 2970, 360, 4760, 280, 4840, 140, 4920, 0, 4970, 0, 5000, 0, 4990 ],
            [ 30,	980, 2210, 1580, 2180, 1390, 2310, 930, 2310, 980, 2210 ],
            [ 30,	0, 0, 1990, 10, 1990, 1150, 1900, 1160, 1760, 1170, 1640, 1150, 1290, 970, 1000, 940, 770, 990, 400, 930, 0, 890 ],
            [ 20,	910, 3820, 930, 3750, 1040, 3730, 1060, 3830, 910, 3820 ],
            [ 20,	640, 3900, 670, 3820, 780, 3830, 790, 3930, 640, 3900 ],
            [ 5,	1650, 2410, 1830, 2400, 1900, 2490, 1850, 2540, 1630, 2540, 1650, 2410 ]
        ],
        colliders: [
            [ 0, 1230, 180, 1210, 500, 1240, 730, 1380, 940, 1990, 520, 2190, 190, 2260, 0, 2260 ],
            [ 0, 2730, 170, 2730, 360, 2770, 370, 2970, 360, 4760, 280, 4840, 140, 4920, 0, 4970, 0, 5000, 0, 4990 ],
            [ 1230, 2790, 2000, 2840, 2000, 4960, 1640, 4950, 1280, 4840, 1170, 4770, 1230, 2790 ],
            [ 370, 2880, 670, 2950, 580, 3080, 350, 3010, 370, 2880 ],
            [ 980, 3200, 1310, 3160, 1290, 3290, 1150, 3310, 980, 3300, 980, 3200 ],
            [ 260, 4040, 550, 4090, 590, 4230, 720, 4260, 710, 4350, 330, 4320, 260, 4040 ],
            [ 800, 4560, 1360, 4580, 1150, 4800, 780, 4620, 800, 4560 ],
            [ 0, 5400, 2000, 5390, 2000, 5930, 0, 5970 ],
            [ 980, 2210, 1580, 2180, 1390, 2310, 930, 2310, 980, 2210 ],
            [ 0, 0, 1990, 10, 1990, 1150, 1900, 1160, 1760, 1170, 1640, 1150, 1290, 970, 1000, 940, 770, 990, 400, 930, 0, 890 ],
            [ 300, 3470, 520, 3510, 690, 3470, 780, 3520, 690, 3580, 320, 3720 ],
            [ 910, 3820, 930, 3750, 1040, 3730, 1060, 3830, 910, 3820 ],
            [ 640, 3900, 670, 3820, 780, 3830, 790, 3930, 640, 3900 ],
            [ 1650, 2410, 1830, 2400, 1900, 2490, 1850, 2540, 1630, 2540, 1650, 2410 ]
        ]
    },
    {
        level_name: "Four",
        level_w: 7000,
        level_h: 2500,
        level_left: [1, 0],
        level_right: [0, 0],
        level_up: [0, 0],
        level_down: [0, 0],
        objects: [
            newSpikes([5620, 2310, 6080, 2320], 30, 0.003, 10),
            newSpikes([4920, 2310, 5370, 2310], 30, 0.003, 10),
            newSpikes([4720, 1120, 4630, 970, 4510, 830], 30, 0.003, 10),
            newSpikes([1660, 850, 3200, 850], 100, 0.003, 10),
            newSpikes([3180, 300, 1750, 270], 60, 0.003, 10),
            newLamppost(908, 1731, false, 1, 12.25),
            newSpikes([1710, 240, 780, 260], 200, 0.003, 10)
        ],
        walls: [
            [ 30,	860, 2340, 7000, 2350, 7000, 2500, 840, 2500, 860, 2340 ],
            [ 30,	1230, 2450, 1280, 970, 3720, 970, 3730, 1180, 3100, 1340, 2830, 1450, 2730, 1510, 2590, 1620, 2490, 1670, 2350, 1790, 2320, 1860, 2300, 1920, 2260, 2500 ],
            [ 30,	6680, 0, 6990, 0, 7000, 2500, 6840, 2500, 6680, 0 ],
            [ 30,	1750, 0, 6290, 0, 6320, 1530, 4960, 1470, 4670, 960, 4600, 850, 4400, 680, 4300, 430, 4140, 400, 3910, 230, 1740, 180, 1750, 0 ],
            [ 30,	3930, 1960, 4120, 1990, 4140, 2070, 3940, 2070, 3890, 2020, 3930, 1960 ],
            [ 30,	3560, 1780, 3770, 1780, 3700, 1830, 3570, 1890, 3540, 1800, 3560, 1780 ],
            [ 30,	4010, 1590, 4200, 1590, 4150, 1690, 4020, 1670, 4010, 1590 ],
            [ 30,	4390, 1250, 4620, 1250, 4580, 1350, 4400, 1370, 4370, 1300, 4390, 1250 ],
            [ 30,	3890, 1020, 4080, 1020, 4080, 1110, 3910, 1120, 3890, 1020 ],
            [ 30,	2910, 620, 3130, 620, 3080, 680, 2990, 670, 2910, 670, 2910, 620 ],
            [ 30,	2570, 740, 2770, 740, 2580, 800, 2550, 740, 2570, 740 ],
            [ 30,	1800, 700, 1930, 710, 1950, 750, 1840, 780, 1770, 740, 1800, 700 ],
            [ 30,	810, 2500, 860, 1750, 1110, 1700, 1240, 1670, 1260, 1710, 1230, 2500 ],
            [ 30,	770, 120, 780, 0, 1740, 10, 1720, 120, 770, 120 ]
        ],
        colliders: [
            [ 860, 2340, 7000, 2350, 7000, 2500, 840, 2500, 860, 2340 ],
            [ 1230, 2450, 1280, 970, 3720, 970, 3730, 1180, 3100, 1340, 2830, 1450, 2730, 1510, 2590, 1620, 2490, 1670, 2350, 1790, 2320, 1860, 2300, 1920, 2260, 2500 ],
            [ 6680, 0, 6990, 0, 7000, 2500, 6840, 2500, 6680, 0 ],
            [ 1750, 0, 6290, 0, 6320, 1530, 4960, 1470, 4670, 960, 4600, 850, 4400, 680, 4300, 430, 4140, 400, 3910, 230, 1740, 180, 1750, 0 ],
            [ 3930, 1960, 4120, 1990, 4140, 2070, 3940, 2070, 3890, 2020, 3930, 1960 ],
            [ 3560, 1780, 3770, 1780, 3700, 1830, 3570, 1890, 3540, 1800, 3560, 1780 ],
            [ 4010, 1590, 4200, 1590, 4150, 1690, 4020, 1670, 4010, 1590 ],
            [ 4390, 1250, 4620, 1250, 4580, 1350, 4400, 1370, 4370, 1300, 4390, 1250 ],
            [ 3890, 1020, 4080, 1020, 4080, 1110, 3910, 1120, 3890, 1020 ],
            [ 2910, 620, 3130, 620, 3080, 680, 2990, 670, 2910, 670, 2910, 620 ],
            [ 2570, 740, 2770, 740, 2580, 800, 2550, 740, 2570, 740 ],
            [ 1800, 700, 1930, 710, 1950, 750, 1840, 780, 1770, 740, 1800, 700 ],
            [ 810, 2500, 860, 1750, 1110, 1700, 1240, 1670, 1260, 1710, 1230, 2500 ],
            [ 770, 120, 780, 0, 1740, 10, 1720, 120, 770, 120 ]
        ]
    },
    {
        level_name: "Five",
        level_w: 2000,
        level_h: 6000,
        level_left: [1, 0],
        level_right: [0, 0],
        level_up: [0, 0],
        level_down: [0, 0],
        objects: [
            
        ],
        walls: [
            
        ],
        colliders: [
            
        ]
    },
    {
        level_name: "Seven: Horatius's Bridge",
        level_w: 6000,
        level_h: 1500,
        level_left: [0, 0],
        level_right: [0, 0],
        level_up: [0, 0],
        level_down: [0, 0],
        objects: [
            newSpikes([830, 1200, 1520, 1230], 100, undefined, undefined),
            newSpikes([1690, 1220, 2640, 1260], 100, undefined, undefined),
            newSpikes([2770, 1250, 3600, 1280, 3950, 1280, 4060, 1150, 4200, 1000, 4290, 850], 100, undefined, undefined),
            newSpikes([4310, 0, 4080, 130, 3900, 280, 3740, 430, 3650, 610, 3410, 700, 3270, 520, 3170, 250, 3030, 10], 50, undefined, undefined),
            newLamppost(487, 705, true, 1, 0),
            newLamppost(486, 704, true, -1, 0),
            newLamppost(1853, 739, false, 1, 0.3),
            newLamppost(1855, 738, true, -1, -0.3),
            newWords("Then out spake brave Horatius,\nThe Captain of the Gate:", 857, 735, 0),
            newWords("\"To every man upon this earth\nDeath cometh soon or late.", 2139, 1097, 0.1),
            newWords("And how can man die better\nThan facing fearful odds,", 3728, 1150, -0.15),
            newWords("For the ashes of his fathers,\nAnd the temples of his Gods.\"", 4805, 696, 0),
            newSpikes([4920, 780, 4960, 940, 5010, 1370, 5060, 1390], 70, undefined, undefined),
            newLamppost(5709, 1366, true, 1, 0),
            newLamppost(5710, 1366, true, -1, 0)
        ],
        walls: [
            [ 10,	1520, 1450, 1500, 900, 790, 890, 720, 740, 1880, 740, 1910, 800, 1770, 840, 1820, 890, 1690, 910, 1700, 1440 ],
            [ 10,	3600, 1450, 3570, 1260, 3560, 1120, 3670, 1150, 3790, 1130, 3770, 1450 ],
            [ 10,	3880, 1390, 4000, 1200, 4210, 990, 4270, 1100, 3940, 1460, 3880, 1390 ],
            [ 10,	4310, 0, 4080, 130, 3900, 280, 3740, 430, 3650, 610, 3410, 700, 3270, 520, 3170, 250, 3030, 10 ],
            [ 30,	0, 690, 720, 720, 870, 1150, 1240, 1200, 4160, 1290, 4240, 830, 4350, 710, 4940, 690, 5010, 1380, 6000, 1360, 6000, 1500, 0, 1500, 0, 690 ],
            [ 10,	2580, 1250, 2740, 860, 2670, 810, 2520, 680, 2520, 580, 3010, 870, 3190, 960, 3150, 1060, 2860, 960, 2740, 1270 ],
            [ 30,	2030, 1200, 2080, 1090, 2210, 1100, 2220, 1250, 2030, 1200 ],
            [ 30,	6000, 0, 6000, 380, 5720, 360, 5300, 210, 4560, 130, 1950, 110, 800, 170, 0, 190, 0, 0 ]
        ],
        colliders: [
            [ 0, 690, 720, 720, 870, 1150, 1240, 1200, 4160, 1290, 4240, 830, 4350, 710, 4940, 690, 5010, 1380, 6000, 1360, 6000, 1500, 0, 1500, 0, 690 ],
            [ 1520, 1450, 1500, 900, 790, 890, 720, 740, 1880, 740, 1910, 800, 1770, 840, 1820, 890, 1690, 910, 1700, 1440 ],
            [ 3600, 1450, 3570, 1260, 3560, 1120, 3670, 1150, 3790, 1130, 3770, 1450 ],
            [ 3880, 1390, 4000, 1200, 4210, 990, 4270, 1100, 3940, 1460, 3880, 1390 ],
            [ 4310, 0, 4080, 130, 3900, 280, 3740, 430, 3650, 610, 3410, 700, 3270, 520, 3170, 250, 3030, 10 ],
            [ 2580, 1250, 2740, 860, 2670, 810, 2520, 680, 2520, 580, 3010, 870, 3190, 960, 3150, 1060, 2860, 960, 2740, 1270 ],
            [ 2030, 1200, 2080, 1090, 2210, 1100, 2220, 1250, 2030, 1200 ],
            [ 6000, 0, 6000, 380, 5720, 360, 5300, 210, 4560, 130, 1950, 110, 800, 170, 0, 190, 0, 0 ]
        ]
    },
    {
        level_name: "Eight",
        level_w: 4000,
        level_h: 1500,
        level_left: [0, 0],
        level_right: [0, 0],
        level_up: [0, 0],
        level_down: [0, 0],
        objects: [
            newLamppost(809, 715, true, 1, 0.1),
            newSpikes([850, 1070, 3350, 1120], 60, 0.002, 0),
            newSpikes([2690, 1120, 2730, 1110, 2770, 1120], 200, 0.002, 0),
            newSpikes([1710, 1100, 1750, 1090, 1790, 1100], 200, 0.002, 0)
        ],
        walls: [
            [ 15,	0, 1490, 0, 1050, 980, 1080, 1700, 1090, 3350, 1120, 4000, 1140, 4000, 1500 ],
            [ 30,	560, 680, 830, 690, 940, 900, 580, 1160, 490, 810, 560, 680 ],
            [ 30,	3370, 1140, 3470, 900, 3670, 900, 3830, 1160 ],
            [ 30,	4000, 0, 4000, 320, 3560, 380, 3170, 180, 2770, 200, 1610, 130, 450, 160, 0, 190, 0, 0 ]
        ],
        colliders: [
            [ 0, 1490, 0, 1050, 980, 1080, 1700, 1090, 3350, 1120, 4000, 1140, 4000, 1500 ],
            [ 560, 680, 830, 690, 940, 900, 580, 1160, 490, 810, 560, 680 ],
            [ 3370, 1140, 3470, 900, 3670, 900, 3830, 1160 ],
            [ 4000, 0, 4000, 320, 3560, 380, 3170, 180, 2770, 200, 1610, 130, 450, 160, 0, 190, 0, 0 ]
        ]
    },
    {
        level_name: "The Tower",
        level_w: 3000,
        level_h: 4000,
        level_left: [0, 0],
        level_right: [0, 0],
        level_up: [0, 0],
        level_down: [0, 0],
        objects: [
            newSpikes([1660, 3180, 2530, 3230, 2790, 3150, 2950, 3040, 3000, 3040], 80, undefined, undefined),
            newSpikes([2900, 3080, 2920, 3050, 2950, 3050], 200, undefined, undefined),
            newSpikes([2320, 3220, 2340, 3210, 2360, 3220], 200, undefined, undefined),
            newSpikes([260, 2770, 290, 2810, 270, 2850], 200, undefined, undefined),
            newWords("The wind blows fierce upon the tower.\nHold strong.", 1046, 2024, 0),
            newWords("O death, where is thy victory?\nO grave, where is thy sting?", 162, 1099, 0.1),
            newSpikes([280, 2920, 410, 3020, 760, 3160], 40, undefined, undefined)
        ],
        walls: [
            [ 10,	840, 2560, 1000, 2570, 1190, 2600, 1170, 2680, 890, 2640, 820, 2650 ],
            [ 10,	690, 3130, 700, 2820, 740, 2370, 800, 1990, 740, 1890, 730, 1810, 910, 1810, 910, 1990, 1200, 2040, 1360, 2030, 1440, 2040, 1410, 2080, 1270, 2100, 890, 2120, 860, 2460, 840, 2850, 860, 2960, 830, 3220, 760, 3240 ],
            [ 10,	1610, 3240, 1540, 3130, 1570, 2530, 1600, 2160, 1570, 1850, 1790, 1870, 1720, 2010, 1680, 2660, 1730, 3190 ],
            [ 20,	0, 4000, 0, 3790, 3000, 3820, 3000, 4000 ],
            [ 50,	3000, 3390, 2080, 3360, 1680, 3390, 1620, 3290, 1660, 3180, 2530, 3230, 2790, 3150, 2950, 3040, 3000, 3040, 3000, 3390 ],
            [ 30,	0, 1020, 220, 1110, 300, 1340, 280, 2920, 410, 3020, 760, 3160, 770, 3250, 730, 3330, 40, 3350 ],
            [ 10,	970, 3160, 1110, 3180, 1190, 3240, 1140, 3310, 910, 3290, 930, 3210, 970, 3160 ],
            [ 30,	0, 10, 120, 0, 60, 280, 50, 1060, 0, 1070 ]
        ],
        colliders: [
            [ 840, 2560, 1000, 2570, 1190, 2600, 1170, 2680, 890, 2640, 820, 2650 ],
            [ 690, 3130, 700, 2820, 740, 2370, 800, 1990, 740, 1890, 730, 1810, 910, 1810, 910, 1990, 1200, 2040, 1360, 2030, 1440, 2040, 1410, 2080, 1270, 2100, 890, 2120, 860, 2460, 840, 2850, 860, 2960, 830, 3220, 760, 3240 ],
            [ 1610, 3240, 1540, 3130, 1570, 2530, 1600, 2160, 1570, 1850, 1790, 1870, 1720, 2010, 1680, 2660, 1730, 3190 ],
            [ 0, 4000, 0, 3790, 3000, 3820, 3000, 4000 ],
            [ 3000, 3390, 2080, 3360, 1680, 3390, 1620, 3290, 1660, 3180, 2530, 3230, 2790, 3150, 2950, 3040, 3000, 3040, 3000, 3390 ],
            [ 2960, 3040, 2960, 2440, 2980, 40 ],
            [ 0, 1020, 220, 1110, 300, 1340, 280, 2920, 410, 3020, 760, 3160, 770, 3250, 730, 3330, 40, 3350 ],
            [ 970, 3160, 1110, 3180, 1190, 3240, 1140, 3310, 910, 3290, 930, 3210, 970, 3160 ],
            [ 2020, 1520, 2020, 1470, 2480, 1460, 2490, 1500, 2020, 1520 ],
            [ 2370, 1210, 2620, 1210, 2620, 1300, 2350, 1300, 2370, 1210 ],
            [ 1630, 870, 1810, 890, 1810, 950, 1630, 950, 1630, 870 ],
            [ 640, 790, 740, 790, 740, 810, 630, 820, 640, 790 ],
            [ 1150, 880, 1270, 880, 1260, 930, 1150, 910, 1150, 880 ],
            [ 0, 10, 120, 0, 60, 280, 50, 1060, 0, 1070 ]
        ]
    }
]