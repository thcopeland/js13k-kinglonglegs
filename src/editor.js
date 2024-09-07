if (IS_DEVELOPMENT_BUILD) {
    E = {
        tool: "select",
        objectType: undefined,
        objectIndex: -1,
        objectSubIndex: -1,
        objectData: undefined,
        walls: [],
        colliders: [],
        objects: [],
        enabled: false
    }
}

export const initEditor = () => {
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
    exportButton.onclick = exportLevels
    container.appendChild(exportButton)

    ctx.canvas.addEventListener("mouseup", (evt) => {
    
    })


    ctx.canvas.addEventListener("mousedown", (evt) => {
        console.log({...E})
        if (E.tool === "add") {
            if (E.objectType === "wall") {
                addWall(evt.offsetX, evt.offsetY)
            } else if (E.objectType === "collider") {
                addCollider(evt.offsetX, evt.offsetY)
            }
        }
    })

    ctx.canvas.addEventListener("mousemove", (evt) => {

    })


    addEventListener("keydown", (evt) => {

    })
    E.enabled = true
}


const exportLevels = () => {
    const wallData = E.walls.map(({ roughness, points }) => `        [ ${roughness},\t${points.join(", ")} ]`).join(",\n")
    const colliderData = E.colliders.map(({ points }) => `        [ 0,\t${points.join(", ")} ]`).join(",\n")

    const data = `{
    walls: [
${wallData}
    ],
    colliders: [
${colliderData}
    ]
}`
    console.log(data)
    navigator.clipboard.writeText(data)
}

const importLevel = () => {
    E.walls = G.level.walls.map((wall) => ({ type: "wall", roughness: wall[0], points: wall.slice(1) }))
    E.colliders = G.level.colliders.map(collider => ({ type: "collider", points: collider.slice(1) }))
}


const updateLevel = () => {
    // G.level.objects = [
    //     // newSpikes([0,500, 1000,500, 1200,600,   1200,700,   -10,700], 30),
    //     // newSpikes([1300,600, 1500,600, 1500,700, 1300,700, 1300,600], 30, 0.003, 100),
    //     // newWords("The path ahead is dark.\nTake courage.", 700, 205)
    // ]
    // G.level.npcs = []
    G.level.walls = E.walls.map((wall) => [ wall.roughness, ...wall.points ])
    G.level.colliders = E.colliders.map((collider) => [0, ...collider.points]).filter(x => x.length > 1)
}


const addWall = (x, y) => {
    const worldX = Math.round(x + G.viewport_x)
    const worldY = Math.round(y + G.viewport_y)
    if (!(E.objectType === "wall" && E.objectData !== undefined)) {
        E.objectType = "wall"
        E.objectData = {
            type: "wall",
            roughness: parseInt(prompt("Roughness?", "10")),
            points: []
        }
        E.objectIndex = E.walls.length
        E.objectSubIndex = -1
        E.walls.push(E.objectData)
    }

    if (E.objectData.points.length < 4) {
        E.objectSubIndex = E.objectData.points.length
        E.objectData.points.push(worldX, worldY)
    } else {
        if (Math.hypot(worldX - E.objectData.points[0], worldY - E.objectData.points[1]) < 30) {
            E.objectSubIndex = E.objectData.points.length
            E.objectData.points.push(E.objectData.points[0], E.objectData.points[1])
        } else {
            E.objectSubIndex = E.objectData.points.length
            E.objectData.points.push(worldX, worldY)
        }
    }

    updateLevel()
}


const addCollider = (x, y) => {
    const worldX = Math.round(x + G.viewport_x)
    const worldY = Math.round(y + G.viewport_y)
    if (!(E.objectType === "collider" && E.objectData !== undefined)) {
        E.objectType = "collider"
        E.objectData = {
            type: "collider",
            points: []
        }
        E.objectIndex = E.walls.length
        E.objectSubIndex = -1
        E.colliders.push(E.objectData)
    }

    if (E.objectData.points.length < 4) {
        E.objectSubIndex = E.objectData.points.length
        E.objectData.points.push(worldX, worldY)
    } else {
        if (Math.hypot(worldX - E.objectData.points[0], worldY - E.objectData.points[1]) < 30) {
            E.objectSubIndex = E.objectData.points.length
            E.objectData.points.push(E.objectData.points[0], E.objectData.points[1])
        } else {
            E.objectSubIndex = E.objectData.points.length
            E.objectData.points.push(worldX, worldY)
        }
    }

    updateLevel()
}