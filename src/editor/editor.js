import { importLevel, exportLevel, syncLevel } from "./level"
import { loadLevel } from "../level"
import { editorOnMouseDown, editorOnMouseUp, editorOnMouseMove } from "./mouse"
import { deleteTool } from "./deleteTool"
import { flipNormalsTool } from "./flipNormalsTool"
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
            lastXY: [0, 0],
            clickCount: 0
        },
        config: {
            automaticColliders: true,
            wallRoughness: 30,
            wordsText: "",
            wordsRotation: 0,
            spikesReach: 30,
            spikesSpeed: 0.003,
            spikesDelay: 10,
            lamppostIsFlipped: false,
            lamppostIsPrelit: false,
            lamppostRotation: 0
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
    document.body.style.gap = "10px"

    const header = document.createElement("h1")
    header.innerText = "Level Editor"
    container.appendChild(header)

    const help = document.createElement("div")
    help.innerHTML = "<p>Use the buttons below to modify the current level.</p> \
    <ul><li><b>Select</b> allows you to choose a specific element for modification or deletion.</li> \
    <li>Click <b>Add Wall</b> to add new walls to the level. Check <b>Automatic colliders</b> to automatically generate colliders for the wall. The <b>Roughness</b> field controls the roughness.</li>\
    <li>Click <b>Add Collider</b> to add new colliders to the level.</li>\
    <li>Click <b>Add Words</b> to add new words of comfort to the level. Type the desired text into the <b>Words</b> text area. Change <b>Rotation</b> to adjust its rendering orientation.</li>\
    <li>Click <b>Add Spikes</b> to add spikes to the level. The spikes' <b>Speed</b>, <b>Delay</b> and <b>Reach</b> can be set below.</li>\
    <li>Click <b>Add Lamppost</b> to a lamppost to the level. Its <b>Flipped</b> status and rendering <b>Rotation</b> and <b>Reach</b> can be set below.</li>\
    <li>Click and drag to move the selected element.</li>\
    <li>Press the <b>Delete</b> button on the keyboard to delete the selected element.</li>\
    <li>To save your changes, click the <b>Export</b> button. This doesn't actually save the level, but it prints it the browser console and copies it to your clipboard. You can then transfer it to the source code at your convenience.</li></ul>"
    container.appendChild(help)

    createButtons(container)
    createConfig(container)

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
        } else if (evt.key === "N") {
            flipNormalsTool()
        } else if (evt.key === "T") {
            const level = parseInt(prompt("What level to you want to teleport to?"))
            if (!isNaN(level)) {
                loadLevel(level)
                G.player.x = G.level.level_w / 2
                G.player.y = G.level.level_h / 2
            }
        }
    })

    E.enabled = true
}


const createButtons = (container) => {
    const selectButton = document.createElement("button")
    selectButton.innerText = "Select"
    selectButton.onclick = () => E.tool = "select"
    container.appendChild(selectButton)

    container.appendChild(document.createElement("p"))

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

    const addSpikesButton = document.createElement("button")
    addSpikesButton.innerText = "Add Spikes"
    addSpikesButton.onclick = () => {
        E.tool = "add"
        E.objectType = "spikes"
        E.objectData = undefined
    }
    container.appendChild(addSpikesButton)

    const addLamppostButton = document.createElement("button")
    addLamppostButton.innerText = "Add Lamppost"
    addLamppostButton.onclick = () => {
        E.tool = "add"
        E.objectType = "lamp"
        E.objectData = undefined
    }
    container.appendChild(addLamppostButton)

    container.appendChild(document.createElement("p"))

    const exportButton = document.createElement("button")
    exportButton.innerText = "Export"
    exportButton.onclick = exportLevel
    container.appendChild(exportButton)
}


const createConfig = (container) => {
    const configContainer = document.createElement("div")
    configContainer.appendChild(document.createElement("hr"))

    const wallHeader = document.createElement("h2")
    wallHeader.innerText = "Wall settings"
    configContainer.appendChild(wallHeader)

    const autoCollidersLabel = document.createElement("label")
    autoCollidersLabel.innerText = "Automatic colliders "
    configContainer.appendChild(autoCollidersLabel)

    const autoCollidersCheckbox = document.createElement("input")
    autoCollidersCheckbox.type = "checkbox"
    autoCollidersCheckbox.checked = E.config.automaticColliders
    autoCollidersLabel.appendChild(autoCollidersCheckbox)

    configContainer.appendChild(document.createElement("br"))

    const roughnessLabel = document.createElement("label")
    roughnessLabel.innerText = "Roughness "
    configContainer.appendChild(roughnessLabel)

    const roughnessField = document.createElement("input")
    roughnessField.type = "number"
    roughnessField.value = E.config.wallRoughness
    roughnessLabel.appendChild(roughnessField)
 
    configContainer.appendChild(document.createElement("hr"))
    
    const wordsHeader = document.createElement("h2")
    wordsHeader.innerText = "Words settings"
    configContainer.appendChild(wordsHeader)

    const wordsField = document.createElement("textarea")
    wordsField.type = "number"
    wordsField.placeholder = "Words"
    wordsField.style.width = "100%"
    wordsField.value = E.config.wordsText
    configContainer.appendChild(wordsField)

    const wordsRotationLabel = document.createElement("label")
    wordsRotationLabel.innerText = "Rotation (rad) "
    configContainer.appendChild(wordsRotationLabel)

    const wordsRotationField = document.createElement("input")
    wordsRotationField.type = "number"
    wordsRotationField.value = E.config.wordsRotation
    wordsRotationLabel.appendChild(wordsRotationField)

    configContainer.appendChild(document.createElement("hr"))

    const spikesHeader = document.createElement("h2")
    spikesHeader.innerText = "Spikes settings"
    configContainer.appendChild(spikesHeader)

    const reachLabel = document.createElement("label")
    reachLabel.innerText = "Reach (px) "
    configContainer.appendChild(reachLabel)

    const reachField = document.createElement("input")
    reachField.type = "number"
    reachField.value = E.config.spikesReach
    reachLabel.appendChild(reachField)

    configContainer.appendChild(document.createElement("br"))

    const speedLabel = document.createElement("label")
    speedLabel.innerText = "Speed (px/ms) "
    configContainer.appendChild(speedLabel)

    const speedField = document.createElement("input")
    speedField.type = "number"
    speedField.value = E.config.spikesSpeed
    speedLabel.appendChild(speedField)

    configContainer.appendChild(document.createElement("br"))

    const delayLabel = document.createElement("label")
    delayLabel.innerText = "Delay (ms) "
    configContainer.appendChild(delayLabel)

    const delayField = document.createElement("input")
    delayField.type = "number"
    delayField.value = E.config.spikesDelay
    delayLabel.appendChild(delayField)

    configContainer.appendChild(document.createElement("hr"))

    const lampHeader = document.createElement("h2")
    lampHeader.innerText = "Lamppost settings"
    configContainer.appendChild(lampHeader)

    const lampFlippedLabel = document.createElement("label")
    lampFlippedLabel.innerText = "Flipped "
    configContainer.appendChild(lampFlippedLabel)

    const lampFlippedCheckbox = document.createElement("input")
    lampFlippedCheckbox.type = "checkbox"
    lampFlippedCheckbox.value = E.config.lamppostIsFlipped
    lampFlippedLabel.appendChild(lampFlippedCheckbox)

    configContainer.appendChild(document.createElement("br"))

    const lampPrelitLabel = document.createElement("label")
    lampPrelitLabel.innerText = "Prelit "
    configContainer.appendChild(lampPrelitLabel)

    const lampPrelitCheckbox = document.createElement("input")
    lampPrelitCheckbox.type = "checkbox"
    lampPrelitCheckbox.value = E.config.lamppostIsPrelit
    lampPrelitLabel.appendChild(lampPrelitCheckbox)

    configContainer.appendChild(document.createElement("br"))

    const lampRotationLabel = document.createElement("label")
    lampRotationLabel.innerText = "Rotation (rad) "
    configContainer.appendChild(lampRotationLabel)

    const lampRotationField = document.createElement("input")
    lampRotationField.type = "number"
    lampRotationField.value = E.config.lamppostRotation
    lampRotationLabel.appendChild(lampRotationField)

    configContainer.appendChild(document.createElement("hr"))

    const getSelectedSettingsButton = document.createElement("button")
    getSelectedSettingsButton.innerText = "Get Selection Settings"
    configContainer.appendChild(getSelectedSettingsButton)

    const applySelectedSettingsButton = document.createElement("button")
    applySelectedSettingsButton.innerText = "Apply Settings to Selection"
    configContainer.appendChild(applySelectedSettingsButton)

    const onWallSettingsChange = (evt) => {
        E.config.automaticColliders = autoCollidersCheckbox.checked
        E.config.wallRoughness = parseInt(roughnessField.value)
    }
    autoCollidersCheckbox.addEventListener("change", onWallSettingsChange)
    roughnessField.addEventListener("change", onWallSettingsChange)

    const onWordsSettingsChange = (evt) => {
        E.config.wordsText = wordsField.value
        E.config.wordsRotation = parseFloat(wordsRotationField.value)
    }
    wordsField.addEventListener("change", onWordsSettingsChange)
    wordsRotationField.addEventListener("change", onWordsSettingsChange)

    const onSpikesSettingsChange = (evt) => {
        E.config.spikesReach = parseInt(reachField.value)
        E.config.spikesSpeed = parseFloat(speedField.value)
        E.config.spikesDelay = parseInt(delayField.value)
        if (isNaN(E.config.spikesSpeed) || isNaN(E.config.spikesDelay)) {
            E.config.spikesSpeed = undefined
            E.config.spikesDelay = undefined
        }
    }
    reachField.addEventListener("change", onSpikesSettingsChange)
    speedField.addEventListener("change", onSpikesSettingsChange)
    delayField.addEventListener("change", onSpikesSettingsChange)

    const onLamppostSettingsChange = (evt) => {
        E.config.lamppostIsFlipped = lampFlippedCheckbox.checked
        E.config.lamppostIsPrelit = lampPrelitCheckbox.checked
        E.config.lamppostRotation = parseFloat(lampRotationField.value)
    }
    lampFlippedCheckbox.addEventListener("change", onLamppostSettingsChange)
    lampPrelitCheckbox.addEventListener("change", onLamppostSettingsChange)
    lampRotationField.addEventListener("change", onLamppostSettingsChange)

    getSelectedSettingsButton.addEventListener("click", (evt) => {
        if (E.objectData !== undefined) {
            if (E.objectData.type === "wall") {
                roughnessField.value = E.objectData.roughness
                onWallSettingsChange()
            } else if (E.objectData.type === "words") {
                wordsField.value = E.objectData.text
                wordsRotationField.value = E.objectData.rotation
                onWordsSettingsChange()
            } else if (E.objectData.type === "spikes") {
                reachField.value = E.objectData.reach
                speedField.value = E.objectData.speed
                delayField.value = E.objectData.delay
                onSpikesSettingsChange()
            }  else if (E.objectData.type === "lamp") {
                lampFlippedCheckbox.checked = E.objectData.isFlipped
                lampPrelitCheckbox.checked = E.objectData.isPrelit
                lampRotationField.value = E.objectData.rotation
                onLamppostSettingsChange()
            }
        }
    })

    applySelectedSettingsButton.addEventListener("click", (evt) => {
        if (E.objectData !== undefined) {
            if (E.objectData.type === "wall") {
                E.objectData.roughness = E.config.wallRoughness
            } else if (E.objectData.type === "words") {
                E.objectData.text = E.config.wordsText
                E.objectData.rotation = E.config.wordsRotation
            } else if (E.objectData.type === "spikes") {
                E.objectData.reach = E.config.spikesReach
                E.objectData.speed = E.config.spikesSpeed
                E.objectData.delay = E.config.spikesDelay
            } else if (E.objectData.type === "lamp") {
                E.objectData.isFlipped = E.config.lamppostIsFlipped
                E.objectData.isPrelit = E.config.lamppostIsPrelit
                E.objectData.rotation = E.config.lamppostRotation
            }
            syncLevel()
        }
    })

    container.appendChild(configContainer)
}
