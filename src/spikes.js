import { xorshift, hypot } from "./utils"

export const newSpikes = (vertices, reach, speed, delay) => {
    const positions = []
    const extensions = []
    let rng = xorshift((vertices[0] ^ vertices[1]) | 1)
    let nx = 0
    let ny = 0
    for (let i = 0; i < vertices.length - 2; i += 2) {
        let dx = vertices[i+2] - vertices[i]
        let dy = vertices[i+3] - vertices[i+1]
        const dist = hypot(dx, dy)
        dx /= dist
        dy /= dist
        for (let d = 0; d < dist; d += 10) {
            if (nx === 0 && ny === 0 || d > 30) {
                nx = dy
                ny = -dx
            } else {
                // Fake but easy normal interpolation.
                nx = (nx + dy) / 2
                ny = (ny - dx) / 2
            }
            rng = xorshift(rng)
            nx += (rng % 100) / 400
            rng = xorshift(rng)
            ny += (rng % 100) / 400
            const l = hypot(nx, ny)
            nx /= l
            ny /= l
            positions.push(vertices[i] + d * dx, vertices[i + 1] + d * dy, nx, ny)
            extensions.push(speed == undefined ? 1 : 0, 0)
            rng = xorshift(rng)
            d += rng & 7
        }
    }
    return {
        type_: "spikes",
        reach: reach,
        positions: positions,
        extensions: extensions,
        speed: speed,
        delay: delay
    }
}


export const updateSpikes = (obj, dt) => {
    if (IS_DEVELOPMENT_BUILD) {
        if (obj.type_ != "spikes" || obj.positions == undefined || obj.extensions == undefined || ((obj.speed == undefined) ^ (obj.delay == undefined)))
            throw new Exception("invalid game object passed to updateSpike " + obj)
    }
    for (let i = 0; i < obj.positions.length; i += 4) {
        const dx = GAME.player.x - obj.positions[i]
        const dy = GAME.player.y - obj.positions[i+1]
        const dist = hypot(dx, dy)
        if (dist < obj.reach * 0.75 && obj.extensions[i/2] > 0.75) {
            GAME.pendingDamage.push({ cause: "spikes", push_x: obj.positions[i+2], push_y: obj.positions[i+3] })
        }

        if (obj.speed !== undefined) {
            if (obj.extensions[i/2] === 1 && dist > 250) { // extended
                obj.extensions[i/2+1] += dt
                if (obj.extensions[i/2+1] > 3000) {
                    obj.extensions[i/2] -= 0.001
                    obj.extensions[i/2+1] = -1
                }
            } else if (obj.extensions[i/2] > 0 && obj.extensions[i/2+1] < 0) { // retracting
                obj.extensions[i/2] -= obj.speed * dt
                if (obj.extensions[i/2] <= 0) {
                    obj.extensions[i/2] = 0
                    obj.extensions[i/2+1] = 0
                }
            } else if (obj.extensions[i/2] > 0 && obj.extensions[i/2+1] > 0) { // extending
                obj.extensions[i/2+1] += dt
                if (obj.extensions[i/2+1] > obj.delay) {
                    obj.extensions[i/2] += obj.speed * dt
                    if (obj.extensions[i/2] >= 1) {
                        obj.extensions[i/2] = 1
                    }
                }
            } else if (dist < 50 ||
                (i < obj.positions.length - 4 && obj.extensions[i/2 + 2] > 0.2 && obj.extensions[i/2 + 3] > 0 && obj.extensions[i/2 + 3] < 2000) ||
                (i > 4 && obj.extensions[i/2 - 2] > 0.2 && obj.extensions[i/2 - 1] > 0 && obj.extensions[i/2 - 1] < 2000)) { // retracted
                // Extend if the player is nearby or a neighbor is extending.
                obj.extensions[i/2] = 0.001
                obj.extensions[i/2+1] = 1
            }
        }
    }
}
