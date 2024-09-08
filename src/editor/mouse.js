import { addTool } from "./addTool"

export const editorOnMouseUp = (evt) => {
    
}


export const editorOnMouseDown = (evt) => {
    E.mouse.lastXY = getCoords(evt)
    if (E.tool === "add") {
        addTool()
    }
}


export const editorOnMouseMove = (evt) => {
    E.mouse.currentXY = getCoords(evt)
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

