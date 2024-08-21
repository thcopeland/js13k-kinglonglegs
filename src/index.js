import { drawWalker, drawLevel, drawBackdrop } from "./render"
import { newWalker } from "./walker"
import { loadLevel, getNextCollision } from "./level"

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

let lastTime
const loop = (time) => {
    if (time != undefined) {
        const dt = lastTime == undefined ? 0 : (time - lastTime)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawBackdrop()
        drawWalker(GAME.player)
        if (GAME.keyboard["z"])
            GAME.player.vy = -2
        if (GAME.keyboard["ArrowUp"])
            GAME.player.vy -= 0.1
        if (GAME.keyboard["ArrowDown"])
            GAME.player.vy += 0.1
        if (GAME.keyboard["ArrowLeft"])
            GAME.player.vx -= 0.1
        if (GAME.keyboard["ArrowRight"])
            GAME.player.vx += 0.1
        drawLevel()

        // TODO: stick to the ground, grip shallow slopes, etc
        let movementTime = dt
        for (let i = 0; i < 3; i++) {
            const collision = getNextCollision(GAME.player.x, GAME.player.y-40, GAME.player.vx, GAME.player.vy, 30)
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

        // console.log(GAME.player.x, GAME.player.y)

        GAME.player.vx *= 0.8
        GAME.player.vy *= 0.8
        GAME.player.vy += 0.02 * dt

        // GAME.player.vx = Math.min(Math.max())

        lastTime = time
    }
    requestAnimationFrame(loop)
}

loop()
