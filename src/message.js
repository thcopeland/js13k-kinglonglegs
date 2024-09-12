export const addMessage = (text, x, y, reference, isBigMessage) => {
    if (reference === 0) {
        x += G.player.x
        y += G.player.y
    } else if (reference > 0) {
        const npc = G.level.npcs.find((npc) => npc.id === reference)
        if (npc == undefined && IS_DEVELOPMENT_BUILD)
            throw new Error("Unknown message reference " + reference)
        x += npc.x
        y += npc.y
    }

    const m = {
        text: text,
        x: x,
        y: y,
        t: text.length * 100 + (isBigMessage ? 2000 : 1000),
        big: isBigMessage
    }

    for (let i = 0; i < G.messages.length; i++) {
        if (G.messages[i] === undefined) {
            G.messages[i] = m
            return
        }
    }
    G.messages.push(m)
}


export const updateMessages = (dt) => {
    for (let i = 0; i < G.messages.length; i++) {
        const m = G.messages[i]
        if (m !== undefined) {
            m.t -= dt
            if (m.t < 0) {
                G.messages[i] = undefined
            } else if (m.t < 1000) {
                m.y -= 0.00005 * dt * (1000 - m.t)
            }
        }
    }
}
