import { drawWalker, drawLevel, drawBackdrop, drawNpcs, drawParticles, drawGameObjects, drawMessages } from "./render"
import { updateParticles } from "./particles"
import { loadLevel, enforceLevelBounds } from "./level"
import { updateSpikes } from "./spikes"
import { updateWords } from "./comfort"
import { updateLamppost } from "./lamppost"
import { updateMessages } from "./message"
import { updateWater } from "./water"
import { updatePlayer } from "./player"
import { updateTalker } from "./talker"
import { updateStats, drawStats } from "./stats"
import { adjustViewport } from "./viewport"
import { newWalker } from "./walker"


export const init = () => {
    G = {
        mode: 1, // Start, Game, Game Over
        level: undefined,
        level_num: 0,
        player: newWalker(42, 440, 1700, 2),
        player_courage: 20,
        player_maxCourage: 20,
        damage: {
            pending: undefined,
            invincibility: 0,
            deathTimer: 0,
            lastSavepoint: undefined,
            lastSavepointLevel: 0
        },
        jump: {
            lastTime: -100,
            coyoteTime: 0,
            buffer: 0,
            zPressed: false,
            doubleJumpReady: false,
            hasDoubleJump: true
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
    G.damage.lastSavepoint = G.level.objects.find(({ type_ }) => type_ === "lamp")
    ctx.lineCap = "round"
    ctx.textAlign = "center"
}

export const game = (dt) => {
    // dt /= 10
    G.t += dt

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    drawBackdrop()
    drawWalker(G.player)
    drawNpcs()
    drawGameObjects()
    drawParticles(false)
    drawLevel()
    drawParticles(true)
    drawMessages()
    drawStats()

    if (IS_DEVELOPMENT_BUILD && window.E && E.enabled) {
        E.draw()
    }

    if (G.level.level_update)
        G.level.level_update(dt)

    enforceLevelBounds()
    updatePlayer(dt)
    updateNpcs(dt)
    updateGameObjects(dt)
    updateParticles(dt)
    updateMessages(dt)
    updateStats(dt)
    adjustViewport(dt)
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
        } else if (obj.type_ === "water") {
            updateWater(obj, dt)
        } else {
            if (IS_DEVELOPMENT_BUILD) {
                throw new Error("Invalid game object "  + JSON.stringify(obj))
            }
        }
    }
}

const updateNpcs = (dt) => {
    for (const npc of G.npcs) {
        if (npc.type_ === "talker") {
            updateTalker(npc, dt)
        }
    }
}
