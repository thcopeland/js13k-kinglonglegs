import { raycastTerrain } from "./collision"
import { WALKER_SKULL, LEG_LENGTH, LEG_OFFSET } from "./walker_consts"

const LEG_PLANTED = 0
const LEG_LIFTING = 1
const LEG_LOWERING = 2

export const newWalker = (id_, x, y, legNum) => {
    const legs = []
    // legNum = 4
    for (let i = 0; i < legNum; i++) {
        const l = i / (legNum - 1)
        // const l = 0
        const lx = 0.5 * WALKER_SKULL * (2 * l - 1)
        const ly = WALKER_SKULL - Math.abs(lx / 2) - 4
        // start, end, target, time
        legs.push([lx, ly, lx, ly + LEG_LENGTH, x, y + LEG_LENGTH, LEG_LOWERING])
    }

    return {
        id_,
        x, y,
        vx: 0,
        vy: 0,
        facing_: 1,
        legs,
        isGrounded: false,
        isDead: false,
        isUnderWater: false
    }
}

export const updateWalker = (walker, dt) => {
    const ground = raycastTerrain(walker.x, walker.y + LEG_OFFSET - 30, 0, 1, 30)
    const ceiling = raycastTerrain(walker.x, walker.y, 0, -1 - Math.abs(walker.vy), WALKER_SKULL)
    walker.isGrounded = Math.abs(ground.normal_y) > 0.6 && ground.t < 2 * dt + 2

    updateLegs(walker, dt)

    if (!walker.isDead && !walker.isUnderWater && walker.isGrounded && walker.vy > -1 && ceiling.t > dt + 1) {
        walker.y = ground.contact_y + 0.01 * ground.normal_y * dt - LEG_OFFSET
        walker.vy = 0
    } else {
        walker.vy += 0.01 * dt
    }

    let movementTime = dt
    for (let i = 0; i < 3 && movementTime > 1e-3; i++) {
        const feetCollision = raycastTerrain(walker.x, walker.y + LEG_OFFSET - 30, walker.vx, walker.vy, 30)
        const headCollision = raycastTerrain(walker.x, walker.y, walker.vx, walker.vy, WALKER_SKULL)
        const collision = headCollision.t < feetCollision.t || walker.isDead ? headCollision : feetCollision

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

    walker.vy *= 0.98
    walker.vx *= walker.isDead ? 0.95 : 0.6
    if (walker.vx > 1)
        walker.vx = 1
    if (walker.vx < -1)
        walker.vx = -1
}

const legSpeed = (x, vx) => x * x * x / (Math.abs(x * x * x) + 1) * (0.5 * Math.abs(vx) + 0.4)

const updateLegs = (walker, dt) => {
    ctx.save()
    ctx.translate(walker.x - G.viewport_x, walker.y - G.viewport_y)
    ctx.beginPath()
    walker.legs.toSorted((a, b) => Math.hypot(b[2] - b[0], b[3] - b[1]) - Math.hypot(a[2] - a[0], a[3] - a[1])).forEach((leg) => {
        // if (leg[6] === 0)
        //     ctx.fillStyle = "#0f0"
        // else if (leg[6] === 1)
        //     ctx.fillStyle = "#0ff"
        // else if (leg[6] === 2)
        //     ctx.fillStyle = "#00f"
        // ctx.arc(leg[0], leg[1], 2, 0, 6.28)
        // ctx.fill()

        // ctx.beginPath()
        // ctx.arc(leg[2], leg[3], 2, 0, 6.28)
        // ctx.fill()

        // ctx.fillStyle = "#f00"
        // ctx.beginPath()
        // ctx.arc(leg[4] - walker.x, leg[5] - walker.y, 2, 0, 6.28)
        // ctx.fill()

        // Ensure the leg doesn't stretch too much.
        const stretch = LEG_LENGTH / Math.hypot(leg[2] - leg[0], leg[3] - leg[1])
        if (stretch < 0.8) {
            leg[2] = leg[0] + (leg[2] - leg[0]) * stretch
            leg[3] = leg[1] + (leg[3] - leg[1]) * stretch
            leg[6] = LEG_LOWERING
        }

        // if (walker.isDead && leg[6] === LEG_PLANTED) {
        //     if (Math.random() < 0.1) {
        //         leg[2] = leg[4] - walker.x
        //         leg[3] = leg[5] - walker.y
        //         const stretch = LEG_LENGTH / Math.hypot(leg[4] - walker.x - leg[0], leg[5] - walker.y - leg[1])
        //         if (stretch < 0.99) {
        //             leg[4] = leg[4] * 0.95 + 0.05 * (leg[0] + (leg[4] - walker.x - leg[0]) * stretch + walker.x)
        //             leg[5] = leg[5] * 0.95 + 0.05 * ((leg[5] - walker.y - leg[1]) * stretch + walker.y)
        //             leg[6] = LEG_LOWERING
        //         }
        //     } else {
        //         const collision = raycastTerrain(
        //             walker.x + leg[0],
        //             walker.y + leg[1],
        //             LEG_LENGTH * Math.cos(Math.PI/2),
        //             LEG_LENGTH * Math.sin(Math.PI/2),
        //             5)
        //         if (collision !== undefined && collision.t < dt) {
        //             leg[4] = collision.dest_x
        //             leg[5] = collision.dest_y
        //         } else {
        //             leg[6] = LEG_PLANTED
        //         }
        //     }
        // } else
        if (leg[6] === LEG_PLANTED) {
            leg[2] = leg[4] - walker.x
            leg[3] = leg[5] - walker.y
            if (walker.legs.every(leg => leg[6] === LEG_PLANTED) &&
                Math.hypot(leg[2] - leg[0], leg[3] - leg[1]) > LEG_LENGTH)
                leg[6] = LEG_LIFTING
        } else if (leg[6] === LEG_LIFTING && !walker.isDead) {
            leg[2] -= dt * legSpeed(leg[2] - leg[0], walker.vx)
            leg[3] -= dt * legSpeed(leg[3] - 0.8 * LEG_LENGTH, (walker.vx + walker.vy) / 2)
            if (Math.abs(leg[2] - leg[0]) < 20)
                leg[6] = LEG_LOWERING
        } else if (leg[6] === LEG_LOWERING || walker.isDead) {
            let bestCollision = undefined
            for (let i = 0; i < 20; i++) {
                const angle = (i - 10) * 0.04 + (Math.PI / 2 - walker.vx * dt * 0.03)
                const collision = raycastTerrain(
                    walker.x + leg[0],
                    walker.y + leg[1],
                    LEG_LENGTH * Math.cos(angle),
                    LEG_LENGTH * Math.sin(angle),
                    5)
                if (bestCollision === undefined || bestCollision.t > collision.t)
                    bestCollision = collision
                // ctx.strokeStyle = "#000"
                // if (collision.t < 0.5)
                //     ctx.fillStyle = "#f5f"
                // else if (collision.t < 0.9)
                //     ctx.fillStyle = "#f0f"
                // else
                //     ctx.fillStyle = "#555"
                // ctx.beginPath()
                // ctx.arc(collision.dest_x - walker.x, collision.dest_y - walker.y, 2, 0, 6.28)
                // ctx.fill()
            }

            if (bestCollision !== undefined && bestCollision.t < 0.98) {
                leg[4] = bestCollision.dest_x
                leg[5] = bestCollision.dest_y
                const dx = leg[2] - leg[4] + walker.x
                const dy = leg[3] - leg[5] + walker.y
                leg[2] -= dt * legSpeed(dx, walker.vx)
                leg[3] -= dt * legSpeed(dy, (walker.vx + walker.vy) / 2)
                if (Math.hypot(dx, dy) < 10)
                    leg[6] = LEG_PLANTED
            } else {
                if (walker.isDead) {
                    if (Math.random() < 0.01 * dt) {
                        leg[4] = leg[0] + walker.x + LEG_LENGTH * (Math.random() - 0.5)
                        leg[5] = leg[1] + walker.y + LEG_LENGTH * (Math.random() - 0.5) * 2
                    }
                    const dx = leg[2] - leg[4] + walker.x
                    const dy = leg[3] - leg[5] + walker.y
                    leg[2] -= dt * 0.05 * Math.sign(dx)
                    leg[3] -= dt * 0.05 * Math.sign(dy)
                } else {
                    leg[4] = leg[0] + walker.x + ((walker.isGrounded || walker.isUnderWater) ? LEG_LENGTH / 20 * Math.cos(G.t / 150 + leg[0]) : 0)
                    leg[5] = leg[1] + walker.y + LEG_LENGTH * 0.99
                    const dx = leg[2] - leg[4] + walker.x
                    const dy = leg[3] - leg[5] + walker.y
                    leg[2] -= dt * 0.05 * dx
                    leg[3] -= dt * 0.05 * dy
                }

            }
        }
    })
    ctx.restore()
}
