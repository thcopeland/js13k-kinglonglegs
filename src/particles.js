import { raycastTerrain } from "./collision"

/*
 * variety  0 - basic, 1 - courage gained
 * life
 * lifetime
 * x, y
 * vx, vy
 * g
 * jitter
 * wind
 * drag
 * swoop
 * screenspace
 */

export const newParticle = (variety, varietyData, x, y, lifetime, g, drag, jitter, swoop) => ({
    variety: variety,
    varietyData: varietyData,
    x: x,
    y: y,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0,
    life: 0,
    lifetime: lifetime,
    g: g || 0.5,
    drag: drag || 0.9,
    jitter: jitter || 0.05,
    wind: 0,
    swoop: swoop || 0.001,
    screenspace: false
})


export const addParticle = (particle) => {
    for (let i = 0; i < G.particles.length; i++) {
        if (G.particles[i] === undefined) {
            G.particles[i] = particle
            return;
        }
    }
    G.particles.push(particle)
}


export const updateParticles = (dt) => {
    for (let i = 0; i < G.particles.length; i++)
    {
        const particle = G.particles[i]
        if (particle !== undefined) {
            if (IS_DEVELOPMENT_BUILD) {
                if (particle.x == undefined || particle.y == undefined || particle.vx == undefined || particle.vy == undefined ||
                    particle.ax == undefined || particle.ay == undefined || particle.g == undefined || particle.drag == undefined ||
                    particle.jitter == undefined || particle.wind == undefined || particle.swoop == undefined || particle.screenspace == undefined)
                    throw new Error("Invalid particle " + JSON.stringify(obj))
            }

            if ((particle.life += dt) > particle.lifetime) {
                // Time to rest, little one.
                G.particles[i] = undefined
            } else {
                particle.x += particle.vx * dt
                particle.y += particle.vy * dt
                particle.vx *= Math.pow(particle.drag, dt)
                particle.vy *= Math.pow(particle.drag, dt)
                particle.vx += particle.ax * dt + particle.wind * dt
                particle.vy += (particle.g + particle.ay) * dt
                particle.ax *= Math.pow(0.99, dt)
                particle.ay *= Math.pow(0.99, dt)
                if (10 * Math.random() < particle.jitter) {
                    particle.ax += 0.02 * (Math.random() - 0.5) * particle.jitter
                    particle.ay += 0.02 * (Math.random() - 0.5) * particle.jitter
                }
                if (particle.swoop !== 0) {
                    const speed2 = particle.vx * particle.vx + particle.vy * particle.vy
                    const swoop = particle.swoop * Math.sin((particle.life + (particle.x + particle.y) / 10 + 17*i) / (1000 + ((i * 731) & 511))) / (4 + speed2)
                    particle.ax -= particle.vy * swoop
                    particle.ay += particle.vx * swoop
                }
                if (particle.variety === 1) {
                    let dx = particle.x - particle.varietyData[0]
                    let dy = particle.y - particle.varietyData[1]
                    const len = Math.hypot(dx, dy)
                    particle.vx -= dx / (len + 10) / 4
                    particle.vy -= dy / (len + 10) / 4
                } else if (particle.variety === 2 && !particle.screenspace) {
                    const collision = raycastTerrain(particle.x, particle.y, particle.vx, particle.vy, 4)
                    if (collision.t < dt)
                        G.particles[i] = undefined
                }
            }
        }
    }
}
