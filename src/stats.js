import { newParticle, addParticle } from "./particles"
import { setStrokeAndFill } from "./utils"

const couragePending = []
const courageParticles = []
let courageDrawn = 0
let pendingTimeout = 0


export const incrementCourage = (isUpgrade, startX, startY) => {
    if (isUpgrade)
        G.player_maxCourage++
    G.player_courage ++
    couragePending.push([1, startX, startY ])
}


export const decrementCourage = () => {
    G.player_courage--
    couragePending.push([-1])
}


export const drawStats = () => {
    setStrokeAndFill(2, 14, 1)
    for (let i = 0; i < courageDrawn; i++)
    {
        ctx.beginPath()
        ctx.arc(i * 40 + 40, 40, 8, 0, 2*Math.PI)
        ctx.fill()
        ctx.stroke()
    }
    for (let i = courageDrawn; i < G.player_maxCourage; i++)
    {
        ctx.beginPath()
        ctx.arc(i * 40 + 40, 40, 8, 0, 2*Math.PI)
        ctx.stroke()
    }
}


export const updateStats = (dt) => {
    if (couragePending.length > 0) {
        const pending = couragePending[0]
        if (courageParticles.length === 0)
        {
            for (let i = 0; i < 10; i++) {
                let particle
                if (pending[0] > 0) {
                    particle = newParticle(1, [courageDrawn * 40 + 40, 40], pending[1] - G.viewport_x, pending[2] - G.viewport_y, 3000, 1e-10, 0.97, 1, 0.0001)
                    particle.screenspace = true
                    particle.onTop = true
                } else {
                    particle = newParticle(0, undefined, courageDrawn * 40 + G.viewport_x, 40 + G.viewport_y, 10000, 0.005, 0.99, 0.5, 0.005)
                    particle.onTop = true
                }
                particle.vx = 2 * (Math.random() - 0.5)
                particle.vy = 2 * (Math.random() - 0.5)
                pendingTimeout = 3000
                courageParticles[i] = particle
                addParticle(particle)
            }
        } else {
            pendingTimeout -= dt
            const finished = pendingTimeout < 0 || pending[0] < 0 || courageParticles.every(p => Math.hypot(p.x - p.varietyData[0], p.y - p.varietyData[1]) < 10 || p.life >= p.lifetime)
            if (finished) {
                courageDrawn += couragePending.shift()[0]
                if (pending[0] > 0)
                    courageParticles.forEach(p => p.lifetime = p.life)
                courageParticles.length = 0
            }
        }
    } else {
        courageDrawn = G.player_courage
    }
}
