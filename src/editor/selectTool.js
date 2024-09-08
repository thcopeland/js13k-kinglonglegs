export const selectTool = () => {
    const [x, y] = E.mouse.currentXY

    for (let i = 0; i < E.walls.length; i++) {
        const wall = E.walls[i]
        for (let j = 0; j < wall.points.length; j += 2) {
            if (Math.hypot(x - wall.points[j], y - wall.points[j+1]) < 20) {
                E.objectData = wall
                E.objectIndex = i
                E.objectSubIndex = j
                return
            }
        }
    }

    for (let i = 0; i < E.colliders.length; i++) {
        const collider = E.colliders[i]
        for (let j = 0; j < collider.points.length; j += 2) {
            if (Math.hypot(x - collider.points[j], y - collider.points[j+1]) < 20) {
                E.objectData = collider
                E.objectIndex = i
                E.objectSubIndex = j
                return
            }
        }
    }


    for (let i = 0; i < E.objects.length; i++) {
        const obj = E.objects[i]
        if (obj.type === "spikes") {
            for (let j = 0; j < obj.points.length; j += 2) {
                if (Math.hypot(x - obj.points[j], y - obj.points[j+1]) < 30) {
                    E.objectData = obj
                    E.objectIndex = i
                    E.objectSubIndex = j
                    return
                }
            }
        }
    }
}