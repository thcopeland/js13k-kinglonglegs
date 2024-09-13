
const parseShape = (shape) =>
    [...shape.matchAll(/[a-zA-Z][^a-zA-Z]*/g)].map(match => ({
        cmd: match[0][0],
        data: match[0].substring(1).trim().split(/[\s,]+/).map(parseFloat)
    }))


export const WORDS_OF_COMFORT_PEDESTAL = parseShape(
    "S15F0W1" +
    "r -40,0 80,-20" +
    "l -40,-20 40,-20 25,-30 -25,-30 Zfs" +
    "r -25,-30 50,-100" +
    "Aa -25,-135 5 1.5 4.72 a 25,-135 5 4.72 1.5 Zfs" +
    "r -60,-140 120,-15")

export const WORDS_OF_COMFORT_BOOK = parseShape(
    "S0F14 W2Al -35,0 -7,0 a 0,12 15 4.1,5.39 l 35,0 s" +
    "W1Al -33,-1 -7,-1 a 0,11 15 4.1,5.39 l 33,-1 29,-6 15,-9 7,-8 0,-5 -7,-8 -15,-9 -29,-5 Zfs")


export const LAMPPOST = parseShape(
    "F1S1W0" +
    "r -12,-80 24,80 Al 6,-80 3,-250 -3,-250 -6,-80 Zf" +
    "W6 Aa -50,-250,50,3.16,0 s" +
    "W4 Aa -100,-220,30,-3.24,0.1 a -100,-290,80,1.2,1.95 s Aa -50,-220,60,3,3.7 s Aa -123,-220,40,-0.8,0.15 s" +
    "Al -30,-250 30,-250 s Aa -30,-250,2,0,6.28 fs Aa 30,-250,2,0,6.28 fs")

export const CROWN = parseShape(
    "F0S15W1" +
    "Al -22,-22 22,-22 22,-32, 10,-27, 0,-37 -10,-27, -22,-32 Zfs")
