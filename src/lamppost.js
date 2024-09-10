import { zzfx } from "./zzfx"

export const newLamppost = (x, y, prelit, s, r) => ({
    type_: "lamp",
    x: x,
    y: y,
    prelit: prelit,
    t: prelit ? 1000 : 0,
    s: s,
    r: r
})


export const updateLamppost = (obj, dt) => {
    if (IS_DEVELOPMENT_BUILD && obj.type_ !== "lamp") {
        throw new Error("Invalid game object passed to upateLamppost " + JSON.stringify(obj))
    }

    if (obj.t === 0) {
        if (Math.abs(G.player.x - obj.x + 100 * obj.s) < 40 && Math.abs(G.player.y - obj.y + 100) < 100) {
            G.damage.lastSavepoint = obj
            G.damage.lastSavepointLevel = G.level_num
            G.player_courage = G.player_maxCourage
            obj.t = 1
            zzfx(...[1.2,,300,.05,.19,1.,,3.6,.2,-0.1,,,.05,,100,,,.79,.13,.2,-1405])
        }
    } else if (obj.t < 1000) {
        obj.t += dt
        if (obj.t > 1000)
            obj.t = 1000
    }
}
