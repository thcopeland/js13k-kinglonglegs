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
    let scale = ctx.canvas.height < 900 ? ctx.canvas.height / 900 : 1
    ctx.scale(scale, scale)

    G = {
        mode: 1, // Start, Game, Game Over
        level: undefined,
        level_num: 0,
        player: newWalker(1, 440, 1700, 2),
        player_courage: 3,
        player_maxCourage: 3,
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
            hasDoubleJump: false
        },
        npcs: [],
        objects: [],
        particles: [],
        messages: [],
        viewport_x: 0,
        viewport_y: 0,
        viewport_w: ctx.canvas.width / scale,
        viewport_h: ctx.canvas.height / scale,
        keys: {},
        t: 0
    }
    loadLevel(0)
    G.damage.lastSavepoint = G.level.objects.find(({ type_ }) => type_ === "lamp")
    ctx.lineCap = "round"
}

export const game = (dt) => {
    // dt /= 10
    G.t += dt

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    drawBackdrop()
    drawWalker(G.player)
    drawNpcs()
    drawGameObjects()
    if (G.level.level_draw)
        G.level.level_draw()
    drawParticles()
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
