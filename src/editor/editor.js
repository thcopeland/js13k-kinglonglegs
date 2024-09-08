import { importLevel, exportLevel } from "./level"
import { editorOnMouseDown, editorOnMouseUp, editorOnMouseMove } from "./mouse"
import { deleteTool } from "./deleteTool"
import { drawEditor } from "./render"

export const initEditor = () => {
    E = {
        tool: "select",
        objectType: undefined,
        objectIndex: -1,
        objectSubIndex: -1,
        objectData: undefined,
        walls: [],
        colliders: [],
        objects: [],
        enabled: false,
        snap: false,
        mouse: {
            down: false,
            currentXY: [0, 0],
            clickXY: [0, 0],
            lastXY: [0, 0]
        },
        draw: drawEditor
    }
    importLevel()

    const container = document.createElement("div")
    container.style.backgroundColor = "lightgrey"
    container.style.gridColumn = "2"
    container.style.padding = "10px"
    ctx.canvas.style.gridColumn = "1"
    document.body.appendChild(container)

    const header = document.createElement("h1")
    header.innerText = "Level Editor"
    container.appendChild(header)

    const selectButton = document.createElement("button")
    selectButton.innerText = "Select"
    selectButton.onclick = () => E.tool = "select"
    container.appendChild(selectButton)

    const addWallButton = document.createElement("button")
    addWallButton.innerText = "Add Wall"
    addWallButton.onclick = () => {
        E.tool = "add"
        E.objectType = "wall"
        E.objectData = undefined
    }
    container.appendChild(addWallButton)

    const addColliderButton = document.createElement("button")
    addColliderButton.innerText = "Add Collider"
    addColliderButton.onclick = () => {
        E.tool = "add"
        E.objectType = "collider"
        E.objectData = undefined
    }
    container.appendChild(addColliderButton)

    const addWordsButton = document.createElement("button")
    addWordsButton.innerText = "Add Words"
    addWordsButton.onclick = () => {
        E.tool = "add"
        E.objectType = "words"
        E.objectData = undefined
    }
    container.appendChild(addWordsButton)

    const exportButton = document.createElement("button")
    exportButton.innerText = "Export"
    exportButton.onclick = exportLevel
    container.appendChild(exportButton)


    ctx.canvas.addEventListener("mouseup", editorOnMouseUp)
    ctx.canvas.addEventListener("mousedown", editorOnMouseDown)
    ctx.canvas.addEventListener("mousemove", editorOnMouseMove)


    addEventListener("keydown", (evt) => {
        if (evt.key === "Shift") E.snap = true
    })

    addEventListener("keyup", (evt) => {
        if (evt.key === "Shift") E.snap = false
        else if (evt.key === "Escape") {
            E.tool = "select"
            E.objectData = undefined
            importLevel() // Undo any in progress operations
        } else if (evt.key === "Delete") {
            deleteTool()
        }
    })

    E.enabled = true
}
