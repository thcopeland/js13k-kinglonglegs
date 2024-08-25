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
canvas.width = Math.min(1600, innerWidth-100)
canvas.height = Math.min(900, innerHeight-100)
ctx = canvas.getContext("2d")
ctx.lineCap = "round"

G = {
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
    keys: {}
}

document.onkeyup = (evt) => G.keys[evt.key] = false
document.onkeydown = (evt) => G.keys[evt.key] = true
window.onblur = () => {
    Object.keys(G.keys).forEach(key => G.keys[key] = false)
    lastTime = undefined
}

loadLevel(0)

const updateGameObjects = (dt) => {
    for (let i = 0; i < G.level.objects.length; i++) {
        const obj = G.level.objects[i]
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
        drawWalker(G.player)
        drawGameObjects()
        drawLevel()
        updateStats(dt)
        drawStats()
        updateParticles(dt)
        drawParticles()

        updateGameObjects(dt)

        if (G.invincibility > 0)
            G.invincibility -= dt
        if (G.pendingDamage.length > 0) {
            if (G.player_courage > 0 && G.invincibility <= 0) {
                decrementCourage()
                G.invincibility = 500
                G.player.vx = 5*G.pendingDamage[0].push_x
                G.player.vy = 5*G.pendingDamage[0].push_y
            }
            G.pendingDamage.length = 0
        }

        if (G.keys["q"] && G.player_courage < 10) {
            incrementCourage(false, G.player.x, G.player.y)
        }

        if (Math.random() < 0.05)
            addParticle(newParticle(0, undefined, 3000*Math.random() - 1000, 0, 10000, 0.01 + 0.005*Math.random()))

        const ground = raycastTerrain(G.player.x, G.player.y-40, 0, 1, 30)
        const isGrounded = ground.t < 2*dt + 2
        if (isGrounded)
        {
            G.player.y = ground.contact_y + 0.01 * ground.normal_y * dt
            G.player.vy = 0
        }

        if (G.keys["z"] && isGrounded) {
            zzfx(...[,,173,.03,.06,.05,1,.6,,91,,,,,,,,.6,.05])
            G.player.vy = -4
            G.player.anim_time = 0
        }
        if (G.keys["c"] && time - lastDash > 300) {
            zzfx(...[,.1,800,.02,.01,.2,1,,-0.1,.1,,,,3,,,.1])
            G.player.vx = 4*G.player.facing_
            lastDash = time
        }
        if (G.keys["ArrowUp"])
            G.player.vy -= 0.2
        if (G.keys["ArrowDown"])
            G.player.vy += 0.2
        if (G.keys["ArrowLeft"]) {
            G.player.facing_ = -1
            G.player.vx -= 0.05
        }
        if (G.keys["ArrowRight"]) {
            G.player.facing_ = 1
            G.player.vx += 0.05
        }

        let movementTime = dt
        for (let i = 0; i < 3; i++) {
            const collision = raycastTerrain(G.player.x, G.player.y-40, G.player.vx, G.player.vy, 30)
            if (collision.t <= movementTime) {
                const effective_t = Math.max(0, collision.t - 0.001)
                G.player.x += G.player.vx * effective_t
                G.player.y += G.player.vy * effective_t
                G.player.vx += collision.normal_x * (collision.impulse + 0.001)
                G.player.vy += collision.normal_y * (collision.impulse + 0.001)
                movementTime -= collision.t
            } else {
                G.player.x += G.player.vx * movementTime
                G.player.y += G.player.vy * movementTime
                break
            }
        }

        if (isGrounded)
            G.player.anim_time += 2 * dt

        G.player.vx *= Math.pow(0.99, dt)
        G.player.vy *= Math.pow(0.99, dt)
        if (!isGrounded)
            G.player.vy += 0.01 * dt

        lastTime = time
    }
    requestAnimationFrame(loop)
}

loop()
