export const selectTool = () => {
    const [x, y] = E.mouse.currentXY
    
    if (Math.hypot(x - E.mouse.clickXY[0], y - E.mouse.clickXY[1]) > 5)
        return;


    let selectIdx = E.mouse.clickCount
    let anyPotentialSelections = true

    while (selectIdx > 0 && anyPotentialSelections) {
        anyPotentialSelections = false
        for (let i = 0; i < E.walls.length; i++) {
            const wall = E.walls[i]
            for (let j = 0; j < wall.points.length; j += 2) {
                if (Math.hypot(x - wall.points[j], y - wall.points[j+1]) < 20) {
                    E.objectData = wall
                    E.objectIndex = i
                    E.objectSubIndex = j
                    if (selectIdx === 1) {
                        return
                    } else {
                        selectIdx -= 1
                        anyPotentialSelections = true
                    }
                }
            }
        }

        for (let i = 0; i < E.colliders.length; i++) {
            const collider = E.colliders[i]
            // Don't allow automatic colliders to be selected. They should be manipulated via the associated wall.
            if (collider.reference === undefined) {
                for (let j = 0; j < collider.points.length; j += 2) {
                    if (Math.hypot(x - collider.points[j], y - collider.points[j+1]) < 20) {
                        E.objectData = collider
                        E.objectIndex = i
                        E.objectSubIndex = j
                        if (selectIdx === 1) {
                            return
                        } else {
                            selectIdx -= 1
                            anyPotentialSelections = true
                        }
                    }
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
                        if (selectIdx === 1) {
                            return
                        } else {
                            selectIdx -= 1
                            anyPotentialSelections = true
                        }
                    }
                }
            } else if (obj.type === "words") {
                if (Math.abs(x - obj.x) < 40 && Math.abs(y - obj.y + 80) < 80) {
                    E.objectData = obj
                    E.objectIndex = i
                    E.objectSubIndex = -1
                    if (selectIdx === 1) {
                        return
                    } else {
                        selectIdx -= 1
                        anyPotentialSelections = true
                    }
                }
            } else if (obj.type === "lamp") {
                if (Math.abs(x - obj.x + 25*(obj.isFlipped ? -1 : 1)) < 60 && Math.abs(y - obj.y + 150) < 150) {
                    E.objectData = obj
                    E.objectIndex = i
                    E.objectSubIndex = -1
                    if (selectIdx === 1) {
                        return
                    } else {
                        selectIdx -= 1
                        anyPotentialSelections = true
                    }
                }
            }
        }
    }
}