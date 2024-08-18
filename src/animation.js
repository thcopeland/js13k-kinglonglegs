const decodeAnimations = (animations) => 
    animations.map(animation =>
        animation.split("\n").map(frame => {
            const [time, elements] = frame.split(":")
            return {
                t: parseInt(time),
                e: elements.split("/").map((x) => x.split(",").map((y) => parseInt(y)))
            }
        }))

// time:x1,y1,x2,y2, ...,xn,yn/x1,y1,x2,y2,...,xn,yn
// Note: since the first frame is implicitly at time=0, the first frame is the total animation length before looping

export const animations = decodeAnimations([
// Idle
`1000:0,0,0,100,0,200
500:0,0,20,95,-20,190`,
// Tremble
// Climb
// Walk
// Panic
// Jump
// Fall
])  

