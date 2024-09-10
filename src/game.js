import { drawWalker, drawLevel, drawBackdrop, drawParticles, drawGameObjects, drawMessages } from "./render"
import { updateParticles } from "./particles"
import { loadLevel } from "./level"
import { updateSpikes } from "./spikes"
import { updateWords } from "./comfort"
import { updateLamppost } from "./lamppost"
import { updateMessages } from "./message"
import { updatePlayer } from "./player"
import { updateStats, drawStats } from "./stats"
import { adjustViewport } from "./viewport"
import { newWalker } from "./walker"


export const init = () => {
    G = {
        mode: 1, // Start, Game, Game Over
        level: undefined,
        level_num: 0,
        player: newWalker(42, 400, 100, 2),
        player_courage: 3,
        player_maxCourage: 3,
        damage: {
            pending: undefined,
            invincibility: 0,
            deathTimer: 0,
            lastSavepoint: undefined
        },
        jump: {
            lastTime: -100,
            coyoteTime: 0,
            buffer: 0,
            zPressed: false,
            doubleJumpReady: false,
            hasDoubleJump: false
        },
        npcs: [],
        objects: [],
        particles: [],
        messages: [],
        viewport_x: 0,
        viewport_y: 0,
        viewport_w: ctx.canvas.width,
        viewport_h: ctx.canvas.height,
        keys: {},
        t: 0
    }
    loadLevel(0)
    ctx.lineCap = "round"
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
}

export const game = (dt) => {
    // dt /= 10
    G.t += dt

    updatePlayer(dt)
    updateGameObjects(dt)
    updateParticles(dt)
    updateMessages(dt)
    updateStats(dt)
    adjustViewport(dt)

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    drawBackdrop()
    drawWalker(G.player)
    drawGameObjects()
    drawParticles()
    drawLevel()
    drawMessages()
    drawStats()


    if (IS_DEVELOPMENT_BUILD && window.E && E.enabled) {
        E.draw()
     }
}


const updateGameObjects = (dt) => {
    for (let i = 0; i < G.level.objects.length; i++) {
        const obj = G.level.objects[i]
        if (obj.type_ === "spikes") {
            updateSpikes(obj, dt)
        } else if (obj.type_ === "words") {
            updateWords(obj, dt)
        } else if (obj.type_ === "lamp") {
            updateLamppost(obj, dt)  
        } else {
            if (IS_DEVELOPMENT_BUILD) {
                throw new Error("Invalid game object "  + JSON.stringify(obj))
            }
        }
    }
}
