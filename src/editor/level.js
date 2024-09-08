import { newSpikes } from "../spikes"

export const exportLevel = () => {
    const wallData = E.walls
        // .sort((a, b) => a.points[0] - b.points[0])
        .map(({ roughness, points }) => `        [ ${roughness},\t${points.join(", ")} ]`)
        .join(",\n")
    const colliderData = E.colliders
        // .sort((a, b) => a.points[0] - b.points[0])
        .map(({ points }) => `        [ ${points.join(", ")} ]`)
        .join(",\n")
    const objectData = E.objects
        .map((obj) => {
            if (obj.type === "spikes") {
                return `        newSpikes([${obj.points.join(", ")}], ${obj.reach}, ${obj.speed}, ${obj.delay})`
            }
        })
        .join(",\n")

    const data = `{
    objects: [
${objectData}
    }
    walls: [
${wallData}
    ],
    colliders: [
${colliderData}
    ]
}`
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
        } else {
            console.log(obj.type_ + " is unsupported")
        }
    }).filter(x => x !== undefined)
}


export const syncLevel = () => {
    // G.level.objects = [
    //     // newSpikes([0,500, 1000,500, 1200,600,   1200,700,   -10,700], 30),
    //     // newSpikes([1300,600, 1500,600, 1500,700, 1300,700, 1300,600], 30, 0.003, 100),
    //     // newWords("The path ahead is dark.\nTake courage.", 700, 205)
    // ]
    // G.level.npcs = []
    cleanUpLevel()

    G.level.walls = E.walls.map((wall) => [ Math.round(wall.roughness), ...wall.points.map(Math.round) ])
        .filter(x => x.length > 2)
        // .sort((a, b) => a[1] - b[1])
    G.level.colliders = E.colliders.map((collider) => collider.points.map(Math.round))
        .filter(x => x.length > 3)
        // .sort((a, b) => a[0] - b[0])
    G.level.objects = E.objects.map((obj) => {
        if (obj.type === "spikes" && obj.points.length > 2) {
            return newSpikes(obj.points, obj.reach, obj.speed, obj.delay)
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