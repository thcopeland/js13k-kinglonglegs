export const getAnimation = (animationIdx, time) => {
    const frames = ANIMATIONS[animationIdx]
    time = time % frames[0][0]
    let p = 0
    while (p < frames.length-1 && frames[p+1][0] < time) p++
    const frame1 = frames[p]
    const frame2 = frames[(p + 1) % frames.length]
    const interp = p == 0 ? (time / frame2[0]) : (time - frame1[0]) / (frame2[0] - frame1[0])
    return frame1.slice(1).map((val, idx) => val*(1-interp) + frame2[idx+1]*interp)
}

// time:x1,y1,x2,y2, ...,xn,yn/x1,y1,x2,y2,...,xn,yn
// Note: since the first frame is implicitly at time=0, the first frame is the total animation length before looping

const ANIMATIONS = [
    // Walk
    [
        [2000,      0,0,0,100,0,170],
        [500,       0,0,0,100,0,200]
    ]
]

