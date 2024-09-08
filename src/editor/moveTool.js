export const moveTool = () => {
    if (E.tool === "select" && E.objectData !== undefined && E.mouse.down) {
        const [x, y] = E.mouse.currentXY
        const [x2, y2] = E.mouse.lastXY
        const dx = x - x2
        const dy = y - y2

        if ((E.objectData.type === "wall" || E.objectData.type === "collider") && E.objectSubIndex >= 0) {
            const points = E.objectData.points
            const i = E.objectSubIndex
            points[i] += dx
            points[i+1] += dy
        }
    }
}