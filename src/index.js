"use strict"

import { init, game } from "./game"

const canvas = document.querySelector("canvas")
canvas.width = Math.min(1600, innerWidth-100)
canvas.height = Math.min(900, innerHeight-100)
ctx = canvas.getContext("2d")

G = { }
init()

document.onkeyup = (evt) => G.keys[evt.key] = false
document.onkeydown = (evt) => G.keys[evt.key] = true
window.onblur = () => {
    Object.keys(G.keys).forEach(key => G.keys[key] = false)
    lastTime = undefined
}

let lastTime
const loop = (time) => {
    if (time != undefined && document.visibilityState == "visible") {
        const dt = lastTime == undefined ? 0 : (time - lastTime) / 1
        game(dt)
        lastTime = time
    }
    requestAnimationFrame(loop)
}

loop()
