export const exportLevel = () => {
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


export const importLevel = () => {
    E.walls = G.level.walls.map((wall) => ({ type: "wall", roughness: wall[0], points: wall.slice(1) }))
    E.colliders = G.level.colliders.map(collider => ({ type: "collider", points: [...collider] }))
}


export const syncLevel = () => {
    // G.level.objects = [
    //     // newSpikes([0,500, 1000,500, 1200,600,   1200,700,   -10,700], 30),
    //     // newSpikes([1300,600, 1500,600, 1500,700, 1300,700, 1300,600], 30, 0.003, 100),
    //     // newWords("The path ahead is dark.\nTake courage.", 700, 205)
    // ]
    // G.level.npcs = []
    cleanUpLevel()

    G.level.walls = E.walls.map((wall) => [ wall.roughness, ...wall.points ]).filter(x => x.length > 2)
    G.level.colliders = E.colliders.map((collider) => [...collider.points]).filter(x => x.length > 3)
}


const cleanUpLevel = () => {
    E.walls.forEach(({ points }) => {
        if (points.length >= 4 && Math.hypot(points[0] - points[points.length-2], points[1] - points[points.length-1]) < 20) {
            points[points.length-2] = points[0]
            points[points.length-1] = points[1]
        }
    })
    E.colliders.forEach(({ points }) => {
        if (points.length >= 4 && Math.hypot(points[0] - points[points.length-2], points[1] - points[points.length-1]) < 20) {
            points[points.length-2] = points[0]
            points[points.length-1] = points[1]
        }
    })
}