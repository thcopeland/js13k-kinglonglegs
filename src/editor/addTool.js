import { syncLevel } from "./level"

export const addTool = () => {
    const [x, y] = E.mouse.currentXY
    if (E.objectType === "wall") {
        addWall(x, y)
    } else if (E.objectType === "collider") {
        addCollider(x, y)
    }

    syncLevel()
}


const addWall = (x, y) => {
    if (E.objectData === undefined || E.objectData.type !== "wall") {
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
        E.objectData.points.push(x, y)
    } else {
        if (Math.hypot(x - E.objectData.points[0], y - E.objectData.points[1]) < 30) {
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
        if (Math.hypot(x - E.objectData.points[0], y - E.objectData.points[1]) < 30) {
            E.objectSubIndex = E.objectData.points.length
            E.objectData.points.push(E.objectData.points[0], E.objectData.points[1])
        } else {
            E.objectSubIndex = E.objectData.points.length
            E.objectData.points.push(x, y)
        }
    }
}