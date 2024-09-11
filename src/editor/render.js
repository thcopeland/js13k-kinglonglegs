export const drawEditor = () => {
    ctx.save()
    ctx.translate(-G.viewport_x, -G.viewport_y)
    if (E.objectData !== undefined) {
        if (E.objectData.type === "wall" && E.objectData.points.length > 0) {
            ctx.strokeStyle = "#ff0"
            ctx.fillStyle = "#ff0"
            ctx.beginPath()
            ctx.lineWidth = 1
            ctx.moveTo(E.objectData.points[0], E.objectData.points[1])
            ctx.fillRect(E.objectData.points[0] - 2, E.objectData.points[1] - 2, 4, 4)
            for (let i = 0; i < E.objectData.points.length; i += 2) {
                ctx.fillRect(E.objectData.points[i] - 2, E.objectData.points[i+1] - 2, 4, 4)
                ctx.lineTo(E.objectData.points[i], E.objectData.points[i+1])
            }
            ctx.stroke()

            if (E.objectSubIndex >= 0) {
                ctx.beginPath()
                ctx.lineWidth = 2
                ctx.arc(E.objectData.points[E.objectSubIndex], E.objectData.points[E.objectSubIndex + 1], 6, 0, 2*Math.PI)
                ctx.stroke()
            }
        } else if (E.objectData.type === "collider" && E.objectData.points.length > 0) {
            if (E.objectSubIndex >= 0) {
                ctx.beginPath()
                ctx.strokeStyle = "#f00"
                ctx.lineWidth = 2
                ctx.arc(E.objectData.points[E.objectSubIndex], E.objectData.points[E.objectSubIndex + 1], 6, 0, 2*Math.PI)
                ctx.stroke()
            }
        } else if (E.objectData.type === "spikes" && E.objectData.points.length > 0) {
            ctx.strokeStyle = "#0ff"
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
        } else if (E.objectData.type === "words") {
            ctx.strokeStyle = "#0f0"
            ctx.strokeRect(E.objectData.x - 40, E.objectData.y - 170, 80, 170)
        } else if (E.objectData.type === "lamp") {
            ctx.strokeStyle = "#0f0"
            ctx.strokeRect(E.objectData.x - 40 - 100*(E.objectData.isFlipped ? -1 : 1), E.objectData.y - 200, 80, 200)
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

        const oldFont = ctx.font
        ctx.font = "12px sans-serif"
        ctx.fillStyle = "#0f0"
        ctx.fillText(E.objectType, cursorX, cursorY+30)
        ctx.font = oldFont
    } else if (E.tool === "select") {
        ctx.strokeStyle = "#ff0"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(cursorX, cursorY, 8, 0, 2 * Math.PI)
        ctx.stroke()
    }
}