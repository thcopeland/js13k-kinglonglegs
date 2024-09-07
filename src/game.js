import { drawWalker, drawLevel, drawBackdrop, drawParticles, drawGameObjects, drawMessages } from "./render"
import { newParticle, addParticle, updateParticles } from "./particles"
import { loadLevel, raycastTerrain } from "./level"
import { updateSpikes } from "./spikes"
import { updateWords } from "./comfort"
import { updateMessages } from "./message"
import { updateStats, incrementCourage, decrementCourage, drawStats } from "./stats"
import { adjustViewport } from "./viewport"
import { newWalker, updateWalker } from "./walker"
import { zzfx } from "./zzfx"


export const init = () => {
    M = Math
    G = {
        mode: 1, // Start, Game, Game Over
        level: undefined,
        level_num: 0,
        player: newWalker(42, 400, 100, 2),
        player_abilities: 0,
        player_courage: 10,
        player_maxCourage: 10,
        pendingDamage: undefined,
        invincibility: 0,
        npcs: [],
        objects: [],
        particles: [],
        messages: [],
        viewport_x: 0,
        viewport_y: 0,
        viewport_w: ctx.canvas.width,
        viewport_h: ctx.canvas.height,
        keys: {},
        t: 0,
        lastDash: 0,
        lastJump: 0
    }
    loadLevel(0)
    ctx.lineCap = "round"
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
}

export const game = (dt) => {
    // dt /= 10
    G.t += dt
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    drawBackdrop()
    drawWalker(G.player)
    drawGameObjects()
    drawParticles()
    drawLevel()
    drawMessages()
    drawStats()

    updateGameObjects(dt)
    updateParticles(dt)
    updateMessages(dt)
    updateStats(dt)
    adjustViewport(dt)

    if (IS_DEVELOPMENT_BUILD && E.enabled) {
        ctx.save()
        ctx.translate(-G.viewport_x, -G.viewport_y)
        if (E.objectType === "wall" && E.objectData !== undefined && E.objectData.points.length > 0) {
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
        } else if (E.objectType === "collider" && E.objectData !== undefined && E.objectData.points.length > 0) {
            if (E.objectSubIndex >= 0) {
                ctx.beginPath()
                ctx.strokeStyle = "#ff0"
                ctx.lineWidth = 2
                ctx.arc(E.objectData.points[E.objectSubIndex], E.objectData.points[E.objectSubIndex + 1], 6, 0, 2*Math.PI)
                ctx.stroke()
            }
        }
        ctx.restore()
    }

    // if (G.invincibility > 0)
    //     G.invincibility -= dt
    // if (G.pendingDamage != undefined) {
    //     if (G.player_courage > 0 && G.invincibility <= 0) {
    //         decrementCourage()
    //         G.invincibility = 500
    //         G.player.vx = 5*G.pendingDamage.push_x
    //         G.player.vy = 5*G.pendingDamage.push_y
    //     }
    //     G.pendingDamage = undefined
    // }

    // if (G.keys["q"] && G.player_courage < G.player_maxCourage) {
    //     incrementCourage(false, G.player.x, G.player.y)
    // }

    // if (Math.random() < 0.05)
    //     addParticle(newParticle(0, undefined, 3000*Math.random() - 1000, 0, 10000, 0.01 + 0.005*Math.random()))

    // const ground = raycastTerrain(G.player.x, G.player.y-40, 0, 1, 30)
    // const isGrounded = ground.t < 2*dt + 2
    // if (isGrounded)
    // {
    //     G.player.y = ground.contact_y + 0.01 * ground.normal_y * dt
    //     G.player.vy = 0
    // }

    if (G.keys["z"] && G.player.isGrounded) {
        zzfx(...[,,173,.03,.06,.05,1,.6,,91,,,,,,,,.6,.05])
        G.player.vy = -4
    }
    if (G.keys["c"] && G.t - G.lastDash > 300) {
        zzfx(...[,.1,800,.02,.01,.2,1,,-0.1,.1,,,,3,,,.1])
        G.player.vx = 1*G.player.facing_
        G.lastDash = G.t
    }
    if (G.keys["ArrowUp"])
        G.player.vy -= 0.2
    if (G.keys["ArrowDown"])
        G.player.vy += 0.2
    if (G.keys["ArrowLeft"]) {
        G.player.facing_ = -1
        G.player.vx -= 0.15
    }
    if (G.keys["ArrowRight"]) {
        G.player.facing_ = 1
        G.player.vx += 0.15
    }

    updateWalker(G.player, dt)

    // let movementTime = dt
    // for (let i = 0; i < 3; i++) {
    //     const collision = raycastTerrain(G.player.x, G.player.y-40, G.player.vx, G.player.vy, 30)
    //     if (collision.t <= movementTime) {
    //         const effective_t = Math.max(0, collision.t - 0.001)
    //         G.player.x += G.player.vx * effective_t
    //         G.player.y += G.player.vy * effective_t
    //         G.player.vx += collision.normal_x * (collision.impulse + 0.001)
    //         G.player.vy += collision.normal_y * (collision.impulse + 0.001)
    //         movementTime -= collision.t
    //     } else {
    //         G.player.x += G.player.vx * movementTime
    //         G.player.y += G.player.vy * movementTime
    //         break
    //     }
    // }

    // if (isGrounded)
    //     G.player.anim_time += 2 * dt

    // G.player.vx *= Math.pow(0.99, dt)
    // G.player.vy *= Math.pow(0.99, dt)
    // if (!isGrounded)
    //     G.player.vy += 0.01 * dt

    // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    // drawBackdrop()
    // drawWalker(G.player)
    // drawGameObjects()
    // drawParticles()
    // drawLevel()
    // drawMessages()
    // drawStats()
}


const updateGameObjects = (dt) => {
    for (let i = 0; i < G.level.objects.length; i++) {
        const obj = G.level.objects[i]
        // TODO: store draw/update in the objects
        if (obj.type_ === "spikes") {
            updateSpikes(obj, dt)
        } else if (obj.type_ === "words") {
            updateWords(obj, dt)
        } else {
            if (IS_DEVELOPMENT_BUILD) {
                throw new Error("Invalid game object "  + JSON.stringify(obj))
            }
        }
    }
}