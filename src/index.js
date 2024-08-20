import "./viewport.js"
import { drawWalker } from "./render"
import { newWalker } from "./walker"
import { drawLevel, drawBackdrop, LEVELS } from "./level"

// GLOBALS
mode = 1 // Start, Game, Game Over
level = 0
keys = {}
player = {
    character: newWalker(0, 500, 42),
    abilities: 0 // [Double Jump][]
}
ghosts = []
hiders = []
talkers = []
matches = []
lamposts = []
effects = []
canvas = document.createElement("canvas")
canvas.width = innerWidth
canvas.height = innerHeight
canvas.style.position = "absolute"
document.body.appendChild(canvas)
document.body.style.margin = "0"
ctx = canvas.getContext("2d")
viewport = { x: 0, y: 0, vx: 4, vy: 1, width_: canvas.width, height_: canvas.height }

document.onkeyup = (evt) => keys[evt.key] = false
document.onkeydown = (evt) => keys[evt.key] = true

let lastTime
const loop = (time) => {
    if (time != undefined) {
        const dt = lastTime == undefined ? 0 : (time - lastTime)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        viewport.x += viewport.vx * dt
        if (viewport.x < 0) {
            viewport.vx = 0.4
        } else if (viewport.x + viewport.width_ > LEVELS[level].width_) {
            viewport.vx = -0.4
        }
        player.character.x += dt / 4
        player.character.time_ += dt
        drawBackdrop()
        drawWalker(player.character)
        drawLevel()

        lastTime = time
    }
    requestAnimationFrame(loop)
}

loop()
