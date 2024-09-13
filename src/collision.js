// Perform a swept sphere vs line segment collision.
export const raycastTerrain = (x, y, vx, vy, radius) => {
    // ctx.save()
    // ctx.translate(-G.viewport_x, -G.viewport_y)
    const result = { t: 1e10 }
    for (let i = 0; i < G.level.colliders.length; i++) {
        const collider = G.level.colliders[i]

        // Perform swept sphere vs vertex checks.
        for (let j = 0; j < collider.length; j += 2)
        {
            const qx = x - collider[j]
            const qy = y - collider[j+1]
            const qDotV = qx*vx + qy*vy
            const t = qroot(vx*vx + vy*vy, 2*qDotV, qx*qx + qy*qy - radius*radius)
            if (t >= 0 && t <= 1e3 && t < result.t)
            {
                // ctx.strokeStyle = "purple"
                // ctx.beginPath()
                // ctx.moveTo(x + vx*t, y+vy*t)
                // ctx.lineTo(x + vx*t + qx, y+vy*t + qy)
                // ctx.stroke()
                result.t = t    // normalized time
                result.s = 0    // normalized distance along segment
                result.i = i    // collider index
                result.j = j    // segment index
                result.contact_x = collider[j]
                result.contact_y = collider[j+1]
                result.impulse = -qDotV / radius
            }
        }

        // Perform swept sphere vs line segment checks.
        for (let j = 0; j < collider.length-2; j += 2)
        {
            let nx = collider[j+3] - collider[j+1]
            let ny = collider[j] - collider[j+2]
            const l = Math.hypot(nx, ny)
            nx /= l
            ny /= l
            const nDotV = vx * nx + vy * ny
            if (nDotV > 0)
                continue;
            const nDotP = (x - collider[j]) * nx + (y - collider[j+1]) * ny
            const t = (radius - nDotP) / nDotV
            // Check that the collision happens in the future.
            if (t >= 0 && t <= 1e3 && t < result.t)
            {
                // const ax = (collider[j] + collider[j+2])/2
                // const ay = (collider[j+1] + collider[j+3])/2
                // ctx.beginPath()
                // ctx.strokeStyle = "violet"
                // ctx.moveTo(ax, ay)
                // ctx.lineTo(ax + nx * 30, ay + ny * 30)
                // ctx.stroke()
                // ctx.strokeStyle = "black"
                // ctx.strokeText("t = " + Math.round(100*t)/100 + (t > 0 && t < 16 ? " COLLISION" : ""), ax, ay-35)
                const s = (-ny * (x + vx * t - collider[j]) + nx * (y + vy * t - collider[j+1])) / l
                // ctx.strokeText("s = " + Math.round(100*s)/100 + (s > 0 && s < 1 ? " COLLISION" : ""), ax, ay-20)
                // Check that the sphere intersects the line segment.
                if (s >= 0 && s <= 1)
                {
                    // ctx.strokeStyle = "purple"
                    // ctx.beginPath()
                    // ctx.moveTo(x + vx*t, y+vy*t)
                    // ctx.lineTo(x + vx*t + nx * 50, y+vy*t + ny * 50)
                    // ctx.stroke()
                    result.t = t    // normalized time
                    result.s = s    // normalized distance along segment
                    result.i = i    // collider index
                    result.j = j    // segment index
                    result.contact_x = collider[j] + (collider[j+2] - collider[j]) * s
                    result.contact_y = collider[j+1] + (collider[j+3] - collider[j+1]) * s
                    result.impulse = -nDotV
                    // ctx.fillStyle = "blue"
                    // ctx.beginPath()
                    // ctx.arc(result.dest_x, result.dest_y, 10, 0, 6.28)
                    // ctx.fill()
                    // ctx.beginPath()
                    // ctx.arc(result.dest_x + result.normal_x * 20, result.dest_y + result.normal_y * 20, 5, 0, 6.28)
                    // ctx.fill()
                }
            }
        }
    }

    result.dest_x = x + vx * result.t
    result.dest_y = y + vy * result.t
    result.normal_x = (result.dest_x - result.contact_x) / radius
    result.normal_y = (result.dest_y - result.contact_y) / radius
    // ctx.restore()
    return result
}


const qroot = (a, b, c) => {
    // Return the smaller positive real root of ax^2 + bx + c, or a negative number.
    const det = b*b - 4 * a * c
    if (det < 0)
        return -1
    const e = -b / (2 * a)
    const f = Math.sqrt(det) / (2 * a)
    return e-f >= 0 ? e-f : e+f
}
