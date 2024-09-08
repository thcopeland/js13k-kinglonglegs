"use strict"

import { init, game } from "./game"
import { initEditor } from "./editor/editor"


const canvas = document.querySelector("canvas")
canvas.width = Math.min(1600, innerWidth-100)
canvas.height = Math.min(900, innerHeight-100)
ctx = canvas.getContext("2d")

G = { }
if (IS_DEVELOPMENT_BUILD) {
    E = { }
    addEventListener("keydown", (evt) => {
        if (evt.key === "e" && !E.enabled) {
           initEditor()
        }
    })
}


init()

let lastTime
addEventListener("keydown", (evt) => G.keys[evt.key] = true)
addEventListener("keyup", (evt) => G.keys[evt.key] = false)
addEventListener("blur", () => {
    Object.keys(G.keys).forEach(key => G.keys[key] = false)
    lastTime = undefined
})

const loop = (time) => {
    if (time != undefined && document.visibilityState == "visible") {
        const dt = lastTime == undefined ? 0 : (time - lastTime) / 1
        game(dt)
        lastTime = time
    }
    requestAnimationFrame(loop)
}

loop()
