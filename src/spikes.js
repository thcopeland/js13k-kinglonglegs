import { xorshift } from "./utils"

export const newSpikes = (vertices, reach, speed_, delay) => {
    const positions = []
    const extension = []
    let rng = xorshift((vertices[0] ^ vertices[1]) | 1)
    let nx = 0
    let ny = 0
    for (let i = 0; i < vertices.length - 2; i += 2) {
        let dx = vertices[i+2] - vertices[i]
        let dy = vertices[i+3] - vertices[i+1]
        const dist = Math.hypot(dx, dy)
        dx /= dist
        dy /= dist
        for (let d = 0; d < dist; d += 16) {
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
            const l = Math.hypot(nx, ny)
            nx /= l
            ny /= l
            positions.push(vertices[i] + d * dx, vertices[i + 1] + d * dy, nx, ny)
            extension.push(speed_ == undefined ? 1 : 0, 0)
            rng = xorshift(rng)
            d += rng & 7
        }
    }
    return {
        type_: "spikes",
        reach: reach,
        positions: positions,
        extension: extension,
        vertices: vertices,
        speed_: speed_,
        delay: delay
    }
}


export const updateSpikes = (obj, dt) => {
    if (IS_DEVELOPMENT_BUILD) {
        if (obj.type_ != "spikes" || obj.positions == undefined || obj.extension == undefined || ((obj.speed_ == undefined) ^ (obj.delay == undefined)))
            throw new Error("invalid game object passed to updateSpike " + JSON.stringify(obj))
    }

    for (let i = 0; i < obj.positions.length; i += 4) {
        const dx = G.player.x - (obj.positions[i] + obj.reach * obj.extension[i/2] * obj.positions[i+2])
        const dy = G.player.y + 80 - (obj.positions[i+1] + 0.8*obj.reach * obj.extension[i/2] * obj.positions[i+3])
        const dist = Math.hypot(dx, dy)
        const proj = obj.reach * (dx * obj.extension[i/2] + dy * obj.extension[i/2]) / dist
        if (proj > 0.8 && dist < 30 + 0.2*obj.reach && obj.extension[i/2] > 0.75) {
            G.damage.pending ||= { push_x: obj.positions[i+2], push_y: obj.positions[i+3] }
        }

        if (obj.speed_ !== undefined) {
            if (obj.extension[i/2] === 1 && (dist > 250 || G.player.isDead)) { // extended
                obj.extension[i/2+1] += dt
                if (obj.extension[i/2+1] > 3000) {
                    obj.extension[i/2] -= 0.001
                    obj.extension[i/2+1] = -1
                }
            } else if (obj.extension[i/2] > 0 && obj.extension[i/2+1] < 0) { // retracting
                obj.extension[i/2] -= obj.speed_ * dt
                if (obj.extension[i/2] <= 0) {
                    obj.extension[i/2] = 0
                    obj.extension[i/2+1] = 0
                }
            } else if (obj.extension[i/2] > 0 && obj.extension[i/2+1] > 0) { // extending
                obj.extension[i/2+1] += dt
                if (obj.extension[i/2+1] > obj.delay) {
                    obj.extension[i/2] += obj.speed_ * dt
                    if (obj.extension[i/2] >= 1) {
                        obj.extension[i/2] = 1
                    }
                }
            } else if ((!G.player.isDead && dist < 80) ||
                (i < obj.positions.length - 4 && obj.extension[i/2 + 2] > 0.2 && obj.extension[i/2 + 3] > 0 && obj.extension[i/2 + 3] < 2000) ||
                (i > 4 && obj.extension[i/2 - 2] > 0.2 && obj.extension[i/2 - 1] > 0 && obj.extension[i/2 - 1] < 2000)) { // retracted
                // Extend if the player is nearby or a neighbor is extending.
                obj.extension[i/2] = 0.001
                obj.extension[i/2+1] = 1
            }
        }
    }
}
