"use strict"

import { drawWalker, drawLevel, drawBackdrop, drawParticles, drawGameObjects } from "./render"
import { newWalker } from "./walker"
import { newParticle, addParticle, updateParticles } from "./particles"
import { loadLevel, raycastTerrain } from "./level"
import { updateSpikes } from "./spikes"
import { updateStats, incrementCourage, decrementCourage, drawStats } from "./stats"
import { adjustViewport } from "./viewport"
import { zzfx } from "./zzfx"

const canvas = document.querySelector("canvas")
canvas.width = Math.min(1600, innerWidth)
canvas.height = Math.min(900, innerHeight)
ctx = canvas.getContext("2d")
ctx.lineCap = "round"

GAME = {
    mode: 1, // Start, Game, Game Over
    level: undefined,
    level_num: 0,
    player: newWalker(400, 200, 42),
    player_abilities: 0,
    player_courage: 10,
    player_maxCourage: 10,
    pendingDamage: [],
    invincibility: 0,
    npcs: [],
    objects: [],
    particles: [],
    viewport_x: 0,
    viewport_y: 0,
    viewport_w: canvas.width,
    viewport_h: canvas.height,
    keyboard: {}
}

document.onkeyup = (evt) => GAME.keyboard[evt.key] = false
document.onkeydown = (evt) => GAME.keyboard[evt.key] = true
window.onblur = () => {
    Object.keys(GAME.keyboard).forEach(key => GAME.keyboard[key] = false)
    lastTime = undefined
}

loadLevel(0)

const updateGameObjects = (dt) => {
    for (let i = 0; i < GAME.level.objects.length; i++) {
        const obj = GAME.level.objects[i]
        if (obj.type_ === "spikes")
            updateSpikes(obj, dt)
        else {
            if (IS_DEVELOPMENT_BUILD) {
                throw new Exception("Invalid game object " + obj)
            }
        }
    }
}

let lastDash = 0
let lastTime
const loop = (time) => {
    if (time != undefined && document.visibilityState == "visible") {
        const dt = lastTime == undefined ? 0 : (time - lastTime) / 1
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        adjustViewport(dt)
        drawBackdrop()
        drawWalker(GAME.player)
        drawGameObjects()
        drawLevel()
        updateStats(dt)
        drawStats()
        updateParticles(dt)
        drawParticles()

        updateGameObjects(dt)

        if (GAME.invincibility > 0)
            GAME.invincibility -= dt
        if (GAME.pendingDamage.length > 0) {
            if (GAME.player_courage > 0 && GAME.invincibility <= 0) {
                decrementCourage()
                GAME.invincibility = 500
                GAME.player.vx = 5*GAME.pendingDamage[0].push_x
                GAME.player.vy = 5*GAME.pendingDamage[0].push_y
            }
            GAME.pendingDamage.length = 0
        }

        if (GAME.keyboard["q"] && GAME.player_courage < 10) {
            incrementCourage(false, GAME.player.x, GAME.player.y)
        }

        if (Math.random() < 0.05)
            addParticle(newParticle(0, undefined, 3000*Math.random() - 1000, 0, 10000, 0.01 + 0.005*Math.random()))

        const ground = raycastTerrain(GAME.player.x, GAME.player.y-40, 0, 1, 30)
        const isGrounded = ground.t < 2*dt + 2
        if (isGrounded)
        {
            GAME.player.y = ground.contact_y + 0.01 * ground.normal_y * dt
            GAME.player.vy = 0
        }

        if (GAME.keyboard["z"] && isGrounded) {
            zzfx(...[,,173,.03,.06,.05,1,.6,,91,,,,,,,,.6,.05])
            GAME.player.vy = -4
            GAME.player.anim_time = 0
        }
        if (GAME.keyboard["c"] && time - lastDash > 300) {
            zzfx(...[,.1,800,.02,.01,.2,1,,-0.1,.1,,,,3,,,.1])
            GAME.player.vx = 4*GAME.player.facing_
            lastDash = time
        }
        if (GAME.keyboard["ArrowUp"])
            GAME.player.vy -= 0.2
        if (GAME.keyboard["ArrowDown"])
            GAME.player.vy += 0.2
        if (GAME.keyboard["ArrowLeft"])
        {
            GAME.player.facing_ = -1
            GAME.player.vx -= 0.05
        }
        if (GAME.keyboard["ArrowRight"])
        {
            GAME.player.facing_ = 1
            GAME.player.vx += 0.05
        }

        let movementTime = dt
        for (let i = 0; i < 3; i++) {
            const collision = raycastTerrain(GAME.player.x, GAME.player.y-40, GAME.player.vx, GAME.player.vy, 30)
            if (collision.t <= movementTime) {
                const effective_t = Math.max(0, collision.t - 0.001)
                GAME.player.x += GAME.player.vx * effective_t
                GAME.player.y += GAME.player.vy * effective_t
                GAME.player.vx += collision.normal_x * (collision.impulse + 0.001)
                GAME.player.vy += collision.normal_y * (collision.impulse + 0.001)
                movementTime -= collision.t
            } else {
                GAME.player.x += GAME.player.vx * movementTime
                GAME.player.y += GAME.player.vy * movementTime
                break
            }
        }

        if (isGrounded)
            GAME.player.anim_time += 2 * dt

        GAME.player.vx *= Math.pow(0.99, dt)
        GAME.player.vy *= Math.pow(0.99, dt)
        if (!isGrounded)
            GAME.player.vy += 0.01 * dt

        lastTime = time
    }
    requestAnimationFrame(loop)
}

loop()
