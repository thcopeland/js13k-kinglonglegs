export const adjustViewport = (dt) => {
    let margin = G.viewport_w / 3
    if (G.player.x < G.viewport_x + margin)
        G.viewport_x = G.player.x - margin
    else if (G.player.x > G.viewport_x + G.viewport_w - margin)
        G.viewport_x = G.player.x - G.viewport_w + margin

    margin = G.viewport_h / 3
    if (G.player.y < G.viewport_y + margin)
        G.viewport_y = G.player.y - margin
    else if (G.player.y > G.viewport_y + G.viewport_h - margin)
        G.viewport_y = G.player.y - G.viewport_h + margin

    G.viewport_x = Math.min(Math.max(0, G.viewport_x), G.level.level_w - G.viewport_w)
    G.viewport_y = Math.min(Math.max(0, G.viewport_y), G.level.level_h - G.viewport_h)
}