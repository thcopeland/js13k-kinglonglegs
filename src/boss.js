import { newWalker, updateWalker } from './walker'
import { drawWalker } from './render'
import { addMessage } from './message'

const boss = newWalker(666, 600, 1900, 13)
let mode = 0

export const finalLevelUpdate = (dt) => {
    updateWalker(boss, dt)

    if (mode === 0 && G.player.x > 300) {
        addMessage("IMPOSSIBLE!", boss.x, boss.y-100, undefined, false)
        mode = 1
    } else if (mode === 1) {
        boss.vx += 0.35

        if (boss.x > 2800 || boss.x > G.viewport_x + G.viewport_w) {
            boss.vx = 0
            boss.x = 4600
            boss.y = 1830
            mode = 2
        }
    } else if (mode === 2 && G.player.x > 4400) {
        addMessage("NO! ALL MY TRAPS HAVE FAILED!\nBUT MY THIRTEEN LEGS WILL NOT!", boss.x, boss.y-100, undefined, false)
        mode = 3
    } else if (mode === 3 && !boss.isDead) {
        boss.vx += 0.1
        if (boss.x < 4620)
            boss.vy = -2
        if (boss.y > 2050)
            boss.isDead = true
    }
}


export const finalLevelDraw = () => {
    drawWalker(boss)
}
