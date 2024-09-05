import { raycastTerrain } from "./level"

export const WALKER_FEMUR = 40
export const WALKER_FIBULA = 50
export const WALKER_SKULL = 30
const LEG_LENGTH = WALKER_FEMUR + WALKER_FIBULA
const LEG_OFFSET = LEG_LENGTH + WALKER_SKULL / 2

export const newWalker = (id_, x, y, legNum) => {
    const legs = []
    // legNum = 10
    for (let i = 0; i < legNum; i++) {
        const l = i / (legNum - 1)
        // const l = 0
        const lx = 0.5 * WALKER_SKULL * (2 * l - 1)
        const ly = WALKER_SKULL-Math.abs(lx/2) - 4
        // start, end, target, time 
        legs.push([lx, ly, lx, ly + LEG_LENGTH, x, y + LEG_LENGTH, 0])
    }

    return {
        id_,
        x, y,
        vx: 0,
        vy: 0,
        facing_: 1,
        scale_: 1,
        state: 1, // Idle, Running, Jumping, Falling, Collapsing
        legs
    }
}

export const updateWalker = (walker, dt) => {
    const ground = raycastTerrain(walker.x, walker.y+LEG_OFFSET-30, 0, 1, 30)
    const isGrounded = ground.t < 2*dt + 2

    if (walker.state === 0) {

    } else if (walker.state === 1) {
        if (isGrounded)
        {
            walker.y = ground.contact_y + 0.01 * ground.normal_y * dt - LEG_OFFSET - 1
            walker.vy = 0
        } else {
            walker.state = 3
        }
        for (let i = 0; i < walker.legs.length; i++) {
            updateLegWalking(walker, walker.legs[i], dt)
        }
    } else if (walker.state === 3) {
        if (isGrounded) {
            walker.state = 1
            walker.vy = 0
        } else {
            walker.y += walker.vy * dt
            walker.vy += 0.01 * dt
        }
    }

    let movementTime = dt
    for (let i = 0; i < 3; i++) {
        const collision = raycastTerrain(walker.x, walker.y+LEG_OFFSET-30, walker.vx, walker.vy, 30)
        if (collision.t <= movementTime) {
            const effective_t = Math.max(0, collision.t - 0.001)
            walker.x += walker.vx * effective_t
            walker.y += walker.vy * effective_t
            walker.vx += collision.normal_x * (collision.impulse + 0.001)
            walker.vy += collision.normal_y * (collision.impulse + 0.001)
            movementTime -= collision.t
        } else {
            walker.x += walker.vx * movementTime
            walker.y += walker.vy * movementTime
            break
        }
    }

    walker.vy *= 0.9
    walker.vx *= 0.8
    if (walker.vx > 1)
        walker.vx = 1
    if (walker.vx < -1)
        walker.vx = -1
}

const legSpeed = (x, vx) => x*x*x / (Math.abs(x*x*x) + 1) * (0.8 * Math.abs(vx) + 0.3)

const updateLegWalking = (walker, leg, dt) => {
    ctx.save()
    ctx.translate(walker.x - G.viewport_x, walker.y - G.viewport_y)
    ctx.beginPath()
    if (leg[6] === 0)
        ctx.fillStyle = "#0f0"
    else if (leg[6] === 1)
        ctx.fillStyle = "#0ff"
    else if (leg[6] === 2)
        ctx.fillStyle = "#00f"
    ctx.arc(leg[0], leg[1], 2, 0, 6.28)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(leg[2], leg[3], 2, 0, 6.28)
    ctx.fill()

    ctx.fillStyle = "#f00"
    ctx.beginPath()
    ctx.arc(leg[4] - walker.x, leg[5] - walker.y, 2, 0, 6.28)
    ctx.fill()

    // Foot is planted.
    if (leg[6] === 0) {
        leg[2] = leg[4] - walker.x
        leg[3] = leg[5] - walker.y
        // Lift the foot.
        const anyLifted = walker.legs.filter(leg => leg[6] !== 0).length > 0
        if (!anyLifted && Math.hypot(leg[2] - leg[0], leg[3] - leg[1]) > LEG_LENGTH) {
            leg[6] = 1
        }
    }

    // Raising the foot.
    if (leg[6] === 1) {
        leg[2] -= dt * legSpeed(leg[2] - leg[0], walker.vx)
        leg[3] -= dt * legSpeed(leg[3] - 0.9 * LEG_LENGTH, walker.vx)
        if (Math.abs(leg[2] - leg[0]) < 10)
            leg[6] = 2
    }

    // Lowering the foot.
    if (leg[6] === 2) {
        let skip = false
        for (let i = 0; i < 10; i++) {
            const angle = (i % 2 ? -1 : 1) * i * 0.05 + (Math.PI/2 - 0.6 * walker.facing_)
            const collision = raycastTerrain(walker.x + leg[0], walker.y + leg[1], LEG_LENGTH * Math.cos(angle), LEG_LENGTH * Math.sin(angle), 5)
            ctx.strokeStyle = "#000"
            if (collision.t < 0.5)
                ctx.fillStyle = "#f5f"
            else if (collision.t < 0.9)
                ctx.fillStyle = "#f0f"
            else
                ctx.fillStyle = "#555"
            ctx.beginPath()
            ctx.arc(collision.dest_x - walker.x, collision.dest_y - walker.y, 2, 0, 6.28)
            ctx.fill()
            if (collision.t < 0.97 &&  !skip) {
                leg[4] = collision.dest_x
                leg[5] = collision.dest_y
                const dx = leg[2] - leg[4] + walker.x
                const dy = leg[3] - leg[5] + walker.y
                leg[2] -= dt * legSpeed(dx, walker.vx)
                leg[3] -= dt * legSpeed(dy, walker.vy)
                // Plant the foot.
                if (Math.hypot(dx, dy) < 8) {
                    leg[6] = 0
                }
                // break
                skip = true
            }
        }
    }
    ctx.restore()
}