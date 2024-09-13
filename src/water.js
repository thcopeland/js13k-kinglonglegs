export const newWater = (x, y, width, height) => {
    return {
        type_: "water",
        x, y,
        bounds_width: width,
        bounds_height: height
    }
}


export const updateWater = (obj, dt) => {
    if (G.player.x > obj.x && G.player.y < obj.x + obj.bounds_width && G.player.y + 50 > obj.y && G.player.y < obj.y + obj.bounds_height ) {
        const buoyancy = 0.0002 * Math.min(80, G.player.y + 50 - obj.y)
        G.player.vy -= buoyancy * dt
        G.player.vx *= Math.pow(0.95, dt/10)
        G.player.vy *= Math.pow(0.95, dt/10)
        G.player.isUnderWater = true
    } else {
        G.player.isUnderWater = false
    }
}
