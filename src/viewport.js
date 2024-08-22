export const adjustViewport = (dt) => {
    let margin = GAME.viewport_w / 3
    if (GAME.player.x < GAME.viewport_x + margin)
        GAME.viewport_x = GAME.player.x - margin
    else if (GAME.player.x > GAME.viewport_x + GAME.viewport_w - margin)
        GAME.viewport_x = GAME.player.x - GAME.viewport_w + margin

    margin = GAME.viewport_h / 4
    if (GAME.player.y < GAME.viewport_y + margin)
        GAME.viewport_y = GAME.player.y - margin
    else if (GAME.player.y > GAME.viewport_y + GAME.viewport_h - margin)
        GAME.viewport_y = GAME.player.y - GAME.viewport_h + margin
}