"use strict"

import { init, game } from "./game"
import { initEditor } from "./editor/editor"


const canvas = document.querySelector("canvas")
canvas.width = Math.min(1600, innerWidth-50)
canvas.height = Math.min(1200, innerHeight-50)
ctx = canvas.getContext("2d")

G = { }
if (IS_DEVELOPMENT_BUILD) {
    E = { }
    addEventListener("keydown", (evt) => {
        if (evt.key === "e" && !E.enabled) {
           initEditor()
           G.isEditPaused = true
        } else if (evt.key === "p") {
            G.isEditPaused = !G.isEditPaused
        }
    })
}


init()

let lastTime
addEventListener("keydown", (evt) => G.keys[evt.key] = true)
addEventListener("keyup", (evt) => G.keys[evt.key] = false)
addEventListener("blur", () => {
    G.keys = {}
    lastTime = undefined
})

const loop = (time) => {
    if (time != undefined && document.visibilityState === "visible") {
        const dt = lastTime === undefined ? 0 : (time - lastTime) / 1
        game(dt)
        lastTime = time
    }
    requestAnimationFrame(loop)
}

loop()
