export const flipNormalsTool = () => {
    if ((E.objectData.type === "collider" && E.objectData.reference === undefined) || E.objectData.type === "wall") {
        E.objectData.points = reversedPoints(E.objectData.points)
        E.objectSubIndex = E.objectData.points.length - E.objectSubIndex - 2
        // The referenced will be automatically updated.
    }
}

const reversedPoints = (points) => {
    const newPoints = []
    for (let i = 0; i < points.length; i += 2) {
        newPoints.push(points[points.length - i - 2], points[points.length - i - 1])
    }
    return newPoints
}