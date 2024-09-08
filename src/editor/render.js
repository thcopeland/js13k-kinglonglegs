export const drawEditor = () => {
    ctx.save()
    ctx.translate(-G.viewport_x, -G.viewport_y)
    if (E.objectData !== undefined && E.objectData.type === "wall"  && E.objectData.points.length > 0) {
        ctx.strokeStyle = "#ff0"
        ctx.beginPath()
        ctx.lineWidth = 1
        ctx.moveTo(E.objectData.points[0], E.objectData.points[1])
        for (let i = 0; i < E.objectData.points.length; i += 2)
            ctx.lineTo(E.objectData.points[i], E.objectData.points[i+1])
        ctx.stroke()

        if (E.objectSubIndex >= 0) {
            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.arc(E.objectData.points[E.objectSubIndex], E.objectData.points[E.objectSubIndex + 1], 6, 0, 2*Math.PI)
            ctx.stroke()
        }
    } else if (E.objectData !== undefined && E.objectData.type === "collider" && E.objectData.points.length > 0) {
        if (E.objectSubIndex >= 0) {
            ctx.beginPath()
            ctx.strokeStyle = "#ff0"
            ctx.lineWidth = 2
            ctx.arc(E.objectData.points[E.objectSubIndex], E.objectData.points[E.objectSubIndex + 1], 6, 0, 2*Math.PI)
            ctx.stroke()
        }
    }

    drawCursor()
    
    ctx.restore()
}


const drawCursor = () => {
    const [cursorX, cursorY] = E.mouse.currentXY
    if (E.tool === "add") {
        ctx.strokeStyle = "#0f0"
        if (E.objectData !== undefined && E.objectData.points !== undefined && E.objectData.points.length > 1) {
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(E.objectData.points[E.objectData.points.length-2], E.objectData.points[E.objectData.points.length-1])
            ctx.lineTo(cursorX, cursorY)
            ctx.stroke()
        }
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(cursorX, cursorY-8)
        ctx.lineTo(cursorX, cursorY+8)
        ctx.moveTo(cursorX-8, cursorY)
        ctx.lineTo(cursorX+8, cursorY)
        ctx.stroke()
    }
}