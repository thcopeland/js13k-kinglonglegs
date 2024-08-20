export const newWalker = (x, y, id_) => ({
    // Randomness
    id_,
    // Physics
    x, y,
    vx: 0,
    vy: 0,
    facing_: 1,
    scale_: 1,
    // Animation
    animation_: 0, // Idle, Walking, Running, Jumping
    time_: 0,
    // Logic
    state_: 0, // Normal, Panicking, Midair, Hiding, Resting
    type_: 0, // Normal, Hidden, Ghost, Crouching
    courage_: 10, // 0 - 10
})


export const updateWalker = (walker) => {
    walker.x += walker.vx * walker.scale_
    walker.y += walker.vy
    walker.vx *= 0.9
    walker.vy = Math.min(0.1 + walker.vy, 4)

    // if (Math.abs(walker.vx) < 1 && walker.animation_ == 0)
    //     walker.animation
}
