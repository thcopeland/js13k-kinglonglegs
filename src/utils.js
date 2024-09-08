export const xorshift = (rng) => {
    rng ^= rng << 13
    rng ^= rng >> 7
    rng ^= rng << 5
    return rng & 0xffffffff
}


export const grayscale = (x) => {
    const grey = x.toString(16)
    return "#"+grey+grey+grey
}


export const setStrokeAndFill = (stroke, fill, width) => {
    ctx.strokeStyle = grayscale(stroke)
    ctx.fillStyle = grayscale(fill)
    ctx.lineWidth = width
}
