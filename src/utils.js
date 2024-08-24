export const xorshift = (rng) => {
    rng ^= rng << 13
    rng ^= rng >> 7
    rng ^= rng << 5
    return rng & 0xffffffff
}


export const setStrokeAndFill = (stroke, fill, width) => {
    ctx.strokeStyle = stroke
    ctx.fillStyle = fill
    ctx.lineWidth = width
}
