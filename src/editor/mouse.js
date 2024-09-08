import { addTool } from "./addTool"
import { moveTool } from "./moveTool"
import { selectTool } from "./selectTool"
import { syncLevel } from "./level"

export const editorOnMouseUp = (evt) => {
    syncLevel()
    E.mouse.down = false
}


export const editorOnMouseDown = (evt) => {
    E.mouse.clickXY = getCoords(evt)
    E.mouse.down = true
    if (E.tool === "add") {
        addTool()
    } else if (E.tool === "select") {
        selectTool()
    }
}


export const editorOnMouseMove = (evt) => {
    E.mouse.currentXY = getCoords(evt)
    moveTool()

    // Must be last.
    E.mouse.lastXY = getCoords(evt)
}


const getCoords = (evt) => {
    let worldX = Math.round(evt.offsetX + G.viewport_x)
    let worldY = Math.round(evt.offsetY + G.viewport_y)
    if (E.snap) {
        worldX = Math.round(worldX / 16) * 16
        worldY = Math.round(worldY / 16) * 16
    }
    return [ worldX, worldY ]
}

