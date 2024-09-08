import { addTool } from "./addTool"
import { moveTool } from "./moveTool"
import { selectTool } from "./selectTool"
import { syncLevel } from "./level"

export const editorOnMouseUp = (evt) => {
    syncLevel()
    E.mouse.down = false
    if (E.tool === "add") {
        addTool()
    } else if (E.tool === "select") {
        selectTool()
    }
}


export const editorOnMouseDown = (evt) => {
    const xy = getCoords(evt)
    if (Math.hypot(E.mouse.clickXY[0] - xy[0], E.mouse.clickXY[1] - xy[1]) < 10) {
        E.mouse.clickCount++
    } else {
        E.mouse.clickCount = 1
    }
    E.mouse.clickXY = xy
    E.mouse.down = true
}


export const editorOnMouseMove = (evt) => {
    E.mouse.currentXY = getCoords(evt)
    moveTool()

    // Must be last.
    E.mouse.lastXY = getCoords(evt)
}


const getCoords = (evt) => 
    [ Math.round(evt.offsetX + G.viewport_x), Math.round(evt.offsetY + G.viewport_y) ]

