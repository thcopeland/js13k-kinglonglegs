import { drawWalker } from "./render"
import { newWalker } from "./walker"
import { loadLevel, drawLevel, drawBackdrop } from "./level"

const canvas = document.querySelector("canvas")
canvas.width = innerWidth
canvas.height = innerHeight
ctx = canvas.getContext("2d")

GAME = {
    mode: 1, // Start, Game, Game Over
    level: undefined,
    level_num: 0,
    player_character: newWalker(0, 500, 42),
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
        GAME.viewport_x += 1
        GAME.player_character.x += dt / 4
        GAME.player_character.time_ += dt
        drawBackdrop()
        drawWalker(GAME.player_character)
        drawLevel()

        lastTime = time
    }
    requestAnimationFrame(loop)
}

loop()
