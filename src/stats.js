import { newParticle, addParticle } from "./particles"
import { setStrokeAndFill } from "./utils"

const couragePending = []
const courageParticles = []
let courageDrawn = 0


export const incrementCourage = (isUpgrade, startX, startY) => {
    if (isUpgrade)
        GAME.player_maxCourage++
    GAME.player_courage ++
    couragePending.push([1, startX, startY ])
}


export const decrementCourage = () => {
    GAME.player_courage--
    couragePending.push([-1])
}


export const drawStats = () => {
    setStrokeAndFill("#aaa", "#eee", "1")
    for (let i = 0; i < courageDrawn; i++)
    {
        ctx.beginPath()
        ctx.arc(i * 40 + 40, 40, 8, 0, 2*Math.PI)
        ctx.fill()
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
                    particle = newParticle(1, [courageDrawn * 40 + 40, 40], pending[1] - GAME.viewport_x, pending[2] - GAME.viewport_y, 1500, 1e-10, 0.97, 1, 0.0001)
                    particle.screenspace = true
                } else {
                    particle = newParticle(0, undefined, courageDrawn * 40 + GAME.viewport_x, 40 + GAME.viewport_y, 10000, 0.005, 0.99, 0.5, 0.005)
                }
                particle.vx = 2 * Math.random() - 1
                particle.vy = 2 * Math.random() - 1
                courageParticles[i] = particle
                addParticle(particle)
            }
        } else {
            const finished = pending[0] < 0 || courageParticles.every(p => Math.hypot(p.x - p.varietyData[0], p.y - p.varietyData[1]) < 10 || p.life >= p.lifetime)
            if (finished) {
                courageDrawn += couragePending.shift()[0]
                if (pending[0] > 0)
                    courageParticles.forEach(p => p.lifetime = p.life)
                courageParticles.length = 0
            }
        }
    } else {
        courageDrawn = GAME.player_courage
    }
}