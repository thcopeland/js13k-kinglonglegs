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
    if (obj.speed !== undefined) {
        // detect player nearness (should we inflict damage here?)
    }
}
