export const moveTool = () => {
    if (E.tool === "select" && E.objectData !== undefined && E.mouse.down) {
        const [x, y] = E.mouse.currentXY
        const [x2, y2] = E.mouse.lastXY
        const dx = x - x2
        const dy = y - y2

        if ((E.objectData.type === "wall" || E.objectData.type === "collider" || E.objectData.type === "spikes") && E.objectSubIndex >= 0) {
            const points = E.objectData.points
            const i = E.objectSubIndex

            if (E.objectData.type === "wall") {
                for (const obj of E.objects) {
                    if (obj.type === "spikes") {
                        for (let j = 0; j < obj.points.length; j += 2) {
                            if (obj.points[j] === points[i] && obj.points[j+1] === points[i+1]) {
                                obj.points[j] += dx
                                obj.points[j+1] += dy
                                break
                            }
                        }
                    }
                }
            } 

            points[i] += dx
            points[i+1] += dy

            if (E.objectData.type === "spikes" && E.snap) {
                for (const wall of E.walls) {
                    for (let j = 0; j < wall.points.length; j += 2) {
                        if (Math.hypot(points[i] - wall.points[j], points[i+1] - wall.points[j+1]) < 20) {
                            points[i] = wall.points[j]
                            points[i+1] = wall.points[j+1]
                            break
                        }
                    }
                }
            }

        } else if (E.objectData.type === "words" || E.objectData.type === "lamp") {
            E.objectData.x += dx
            E.objectData.y += dy
        }
    }
}