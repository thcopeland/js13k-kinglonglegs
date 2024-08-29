
const parseShape = (shape) => 
    shape.matchAll(/[a-zA-Z][^a-zA-Z]*/g).map(match => ({
        cmd: match[0][0],
        data: match[0].substring(1).trim().split(/[\s,]+/).map(parseFloat)
    })).toArray()


export const WORDS_OF_COMFORT_PEDESTAL = parseShape(
    "S 0 F 10 W 1 " +
    "r -40,0, 80,-20 " +
    "l -40,-20 40,-20 25,-30 -25,-30 Z f s" +
    "r -25,-30 50,-100 " +
    "A a -25,-135 5 1.5 4.72 a 25,-135 5 4.72 1.5 Z f s " +
    "r -60,-140 120,-15 ")

export const WORDS_OF_COMFORT_BOOK = parseShape(
    "W 2 A l -35,0 -7,0 a 0,12 15, 4.1,5.39 l 35,0 s " +
    "W 1 A l -33,-1 -7,-1 a 0,11 15, 4.1,5.39 l 33,-1 29,-6 15,-9 7,-8 0,-5 -7,-8 -15,-9 -29,-5 Z f s")