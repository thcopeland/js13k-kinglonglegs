import { newWords } from "../comfort"
import { newLamppost } from "../lamppost"
import { newSpikes } from "../spikes"
import { newWater } from '../water'

// TODO: does this actually improve file size?
const reducePrecision = x => Math.round(x/10)*10

export const exportLevel = () => {
    const wallData = E.walls
        // .sort((a, b) => a.points[0] - b.points[0])
        .filter(({ points }) => points.length > 2)
        .map(({ roughness, points }) => `        [ ${roughness},\t${points.map(reducePrecision).map(x => Math.max(x, 0)).join(", ")} ]`)
        .join(",\n")
    const colliderData = E.colliders
        // .sort((a, b) => a.points[0] - b.points[0])
        .filter(({ points }) => points.length > 2)
        .map(({ points }) => `        [ ${points.map(reducePrecision).map(x => Math.max(x, 0)).join(", ")} ]`)
        .join(",\n")
    const objectData = E.objects
        .map((obj) => {
            if (obj.type === "spikes") {
                return `        newSpikes([${obj.points.map(reducePrecision).join(", ")}], ${obj.reach}, ${obj.speed}, ${obj.delay})`
            } else if (obj.type === "words") {
                return `        newWords(${JSON.stringify(obj.text)}, ${obj.x}, ${obj.y}, ${obj.rotation})`
            } else if (obj.type === "lamp") {
                return `        newLamppost(${obj.x}, ${obj.y}, ${obj.isPrelit}, ${obj.isFlipped ? -1 : 1}, ${obj.rotation})`
            } else if (obj.type === "water") {
                return `        newWater(${obj.x}, ${obj.y}, ${obj.width}, ${obj.height})`
            }
        })
        .join(",\n")

    const data = `objects: [
${objectData}
    ],
    walls: [
${wallData}
    ],
    colliders: [
${colliderData}
    ]`
    navigator.clipboard.writeText(data)
    console.log(data)
}


export const importLevel = () => {
    E.walls = G.level.walls.map((wall) => ({ type: "wall", roughness: wall[0], points: wall.slice(1) }))
    E.colliders = G.level.colliders.map(collider => ({ type: "collider", points: [...collider] }))

    for (let i = 0; i < E.colliders.length; i++) {
        const collider = E.colliders[i]
        for (let j = 0; j < E.walls.length; j++) {
            const wall = E.walls[j]
            if (collider.points.length === wall.points.length) {
                let match = true
                for (let k = 0; k < collider.points.length; k++) {
                    if (collider.points[k] !== wall.points[k]) {
                        match = false
                        break
                    }
                }

                if (match) {
                    collider.reference = wall
                    break
                }
            }
        }
    }

    E.objects = G.level.objects.map((obj) => {
        if (obj.type_ === "spikes") {
            return {
                type: "spikes",
                points: obj.vertices,
                reach: obj.reach,
                speed: obj.speed_,
                delay: obj.delay
            }
        } else if (obj.type_ === "words") {
            return {
                type: "words",
                text: obj.text,
                x: obj.x,
                y: obj.y,
                rotation: obj.r
            }
        } else if (obj.type_ === "lamp") {
            return {
                type: "lamp",
                x: obj.x,
                y: obj.y,
                isPrelit: obj.prelit,
                isFlipped: obj.s < 0,
                rotation: obj.r
            }
        } else if (obj.type_ === "water") {
            return {
                type: "water",
                x: obj.x,
                y: obj.y,
                width: obj.bounds_width,
                height: obj.bounds_height
            }
        } else {
            console.log(obj.type_ + " is unsupported")
        }
    }).filter(x => x !== undefined)
}


export const syncLevel = () => {
    cleanUpLevel()

    G.level.walls = E.walls.map((wall) => [ Math.round(wall.roughness), ...wall.points.map(reducePrecision) ])
        .filter(x => x.length > 2)
        // .sort((a, b) => a[1] - b[1])
    G.level.colliders = E.colliders.map((collider) => collider.points.map(reducePrecision))
        .filter(x => x.length > 3)
        // .sort((a, b) => a[0] - b[0])
    G.level.objects = E.objects.map((obj) => {
        if (obj.type === "spikes" && obj.points.length > 2) {
            return newSpikes(obj.points, obj.reach, obj.speed, obj.delay)
        } else if (obj.type === "words") {
            return newWords(obj.text, obj.x, obj.y, obj.rotation)
        } else if (obj.type === "lamp") {
            return newLamppost(obj.x, obj.y, obj.isPrelit, obj.isFlipped ? -1 : 1, obj.rotation)
        } else if (obj.type === "water") {
            return newWater(obj.x, obj.y, obj.width, obj.height)
        } else {
            console.log(obj.type + " is unsupported")
        }
    }).filter(x => x !== undefined)
}


const cleanUpLevel = () => {
    E.walls.forEach(({ points }) => {
        if (points.length >= 4 && Math.hypot(points[0] - points[points.length-2], points[1] - points[points.length-1]) < 20) {
            points[points.length-2] = points[0]
            points[points.length-1] = points[1]
        }
    })
    E.colliders.forEach((collider) => {
        if (collider.reference !== undefined) {
            collider.points = [...collider.reference.points]
        } else {
            const points = collider.points
            if (points.length >= 4 && Math.hypot(points[0] - points[points.length-2], points[1] - points[points.length-1]) < 20) {
                points[points.length-2] = points[0]
                points[points.length-1] = points[1]
            }
        }
    })
}
