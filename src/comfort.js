import { addParticle, newParticle } from "./particles"
import { incrementCourage } from "./stats"
import { hypot } from "./utils"


export const newWords = (text, x, y) => {
    return {
        type_: "words",
        text: text,
        x: x,
        y: y,
        t: 0, // unused, using, used
    }
}


export const updateWords = (obj, dt) => {
    if (IS_DEVELOPMENT_BUILD && obj.type_ != "words") {
        throw new Error("Invalid game object passed to updateWords " + JSON.stringify(obj))
    }
    if (obj.t === 0) {
        if (Math.random() < 0.002*dt) {
            const particle = newParticle(
                0,
                undefined,
                obj.x + 50 * (Math.random() - 0.5), 
                obj.y - 50 * Math.random(),
                5000 + 300 * Math.random(),
                -0.005,
                0.97,
                0.25,
                0.01)
            addParticle(particle)
        }

        const dist = hypot(G.player.x - obj.x, G.player.y - obj.y)
        if (dist < 30) {
            obj.t = 0.001
        }
    } else if (obj.t < 1000) {
        obj.t += dt
        if (obj.t >= 1000) {
            incrementCourage(true, obj.x, obj.y)
        }
    }
}
