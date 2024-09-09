import { syncLevel } from "./level"

export const addTool = () => {
    const [x, y] = E.mouse.currentXY
    if (E.objectType === "wall") {
        addWall(x, y)
    } else if (E.objectType === "collider") {
        addCollider(x, y)
    } else if (E.objectType === "spikes") {
        addSpikes(x, y)
    } else if (E.objectType === "words") {
        addWords(x, y)
    } else if (E.objectType === "lamp") {
        addLamppost(x, y)
    }

    syncLevel()
}


const addWall = (x, y) => {
    if (E.objectData === undefined || E.objectData.type !== "wall") {
        E.objectData = {
            type: "wall",
            roughness: E.config.wallRoughness,
            points: []
        }
        E.objectIndex = E.walls.length
        E.objectSubIndex = -1
        E.walls.push(E.objectData)

        if (E.config.automaticColliders) {
            E.colliders.push({
                type: "collider",
                points: [],
                reference: E.objectData
            })
        }
    }

    if (E.objectData.points.length < 4) {
        E.objectSubIndex = E.objectData.points.length
        E.objectData.points.push(x, y)
    } else {
        if (Math.hypot(x - E.objectData.points[0], y - E.objectData.points[1]) < 10) {
            E.objectSubIndex = E.objectData.points.length
            E.objectData.points.push(E.objectData.points[0], E.objectData.points[1])
        } else {
            E.objectSubIndex = E.objectData.points.length
            E.objectData.points.push(x, y)
        }
    }
}


const addCollider = (x, y) => {
    if (E.objectData === undefined || E.objectData.type !== "collider") {
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
        E.objectData.points.push(x, y)
    } else {
        if (Math.hypot(x - E.objectData.points[0], y - E.objectData.points[1]) < 10) {
            E.objectSubIndex = E.objectData.points.length
            E.objectData.points.push(E.objectData.points[0], E.objectData.points[1])
        } else {
            E.objectSubIndex = E.objectData.points.length
            E.objectData.points.push(x, y)
        }
    }
}


const addSpikes = (x, y) => {
    if (E.objectData === undefined || E.objectData.type !== "spikes") {
        E.objectData = {
            type: "spikes",
            points: [],
            speed: E.config.spikesSpeed,
            reach: E.config.spikesReach,
            delay: E.config.spikesDelay
        }
        E.objectIndex = E.objects.length
        E.objectSubIndex = -1
        E.objects.push(E.objectData)
    }


    if (E.objectData.points.length >= 4 && Math.hypot(x - E.objectData.points[0], y - E.objectData.points[1]) < 10) {
        E.objectSubIndex = E.objectData.points.length
        E.objectData.points.push(E.objectData.points[0], E.objectData.points[1])
    } else {
        for (let wall of E.walls) {
            for (let i = 0; i < wall.points.length; i += 2) {
                if (Math.hypot(x - wall.points[i], y - wall.points[i+1]) < 20) {
                    x = wall.points[i]
                    y = wall.points[i+1]
                    break
                }
            }
        }

        E.objectSubIndex = E.objectData.points.length
        E.objectData.points.push(x, y)
    }
}


const addWords = (x, y) => {
    E.objectData = {
        type: "words",
        x,
        y,
        text: E.config.wordsText,
        rotation: E.config.wordsRotation
    }
    E.objectIndex = E.objects.length
    E.objectSubIndex = -1
    E.objects.push(E.objectData)
    E.tool = "select"
}


const addLamppost = (x, y) => {
    E.objectData = {
        type: "lamp",
        x,
        y,
        isFlipped: E.config.lamppostIsFlipped,
        isPrelit: E.config.lamppostIsPrelit,
        rotation: E.config.lamppostRotation
    }
    E.objectIndex = E.objects.length
    E.objectSubIndex = -1
    E.objects.push(E.objectData)
    E.tool = "select"
}