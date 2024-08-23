"use strict"

import { drawWalker, drawLevel, drawBackdrop } from "./render"
import { newWalker } from "./walker"
import { loadLevel, raycastTerrain } from "./level"
import { adjustViewport } from "./viewport"
import { zzfx } from "./zzfx"

const canvas = document.querySelector("canvas")
canvas.width = Math.min(1600, innerWidth)
canvas.height = Math.min(900, innerHeight)
ctx = canvas.getContext("2d")

GAME = {
    mode: 1, // Start, Game, Game Over
    level: undefined,
    level_num: 0,
    player: newWalker(0, 400, 42),
    player_abilities: 0,
    npcs: [],
    objects: [],
    effects: [],
    viewport_x: 0,
    viewport_y: 0,
    viewport_w: canvas.width,
    viewport_h: canvas.height,
    keyboard: {}
}

document.onkeyup = (evt) => GAME.keyboard[evt.key] = false
document.onkeydown = (evt) => GAME.keyboard[evt.key] = true

loadLevel(0)


let lastDash = 0
let lastTime
const loop = (time) => {
    if (time != undefined) {
        const dt = lastTime == undefined ? 0 : (time - lastTime) / 1
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawBackdrop()
        drawWalker(GAME.player)
        drawLevel()

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
            // console.log(collision.t)
            // if (collision.t < 1e-10) {
            //     GAME.player.x += collision.normal_x
            //     GAME.player.y += collision.normal_y
            if (collision.t <= movementTime) {
                const effective_t = Math.max(0, collision.t - 0.001)
                GAME.player.x += GAME.player.vx * effective_t
                GAME.player.y += GAME.player.vy * effective_t
                // console.log(collision.t, collision.impulse)
                // console.log(Math.hypot(GAME.player.x - collision.contact_x, GAME.player.y - collision.contact_y))
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

        // console.log(GAME.player.x, GAME.player.y)

        GAME.player.vx *= Math.pow(0.99, dt)
        GAME.player.vy *= Math.pow(0.99, dt)
        if (!isGrounded)
            GAME.player.vy += 0.01 * dt

        // GAME.player.vx = Math.min(Math.max())
        adjustViewport(dt)

        lastTime = time
    }
    requestAnimationFrame(loop)
}

loop()
