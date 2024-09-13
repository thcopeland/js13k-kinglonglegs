import { addMessage } from "./message"
import { adjustViewport } from "./viewport"
import { LEG_OFFSET } from "./walker_consts"
import { importLevel } from "./editor/level"
import { LEVELS } from "./level_data"
import { raycastTerrain } from "./collision"

export const loadLevel = (num) => {
    const level = LEVELS[num]
    G.level = level
    G.level_num = num
    G.npcs = level.npcs || []
    G.objects = level.objects
    G.particles = []
    G.messages = []

    adjustViewport()

    if (!level.loadedBefore) {
        level.loadedBefore = true
        addMessage(level.level_name, 100, 100, undefined, true)
        // TODO: play a sound
    }

    if (level.level_enter)
        level.level_enter()

    if (IS_DEVELOPMENT_BUILD && E.enabled) {
        console.log("CURRENT LEVEL: " + num + " " + LEVELS[num].level_name)
        importLevel()
    }
}


export const enforceLevelBounds = () => {
    const level = G.level
    const horizonalMargin = 20
    const aboveMargin = 50
    const belowMargin = 100

    if (IS_DEVELOPMENT_BUILD && E.enabled && G.isEditPaused && E.tool === "add") {
        // Don't switch levels at inconvenient times.
        return
    }

    const viewportOffsetX = G.viewport_x - G.player.x
    const viewportOffsetY = G.viewport_y - G.player.y
    if (G.player.x < horizonalMargin) {
        loadLevel(level.level_left[0])
        G.player.y += level.level_left[1]
        G.player.x = G.level.level_w - horizonalMargin - 1
        if (IS_DEVELOPMENT_BUILD && level.level_left[1] !== -G.level.level_right[1] && level !== G.level) {
            console.error("Asymmetric left->right transition between " + level.level_name + " and " + G.level.level_name)
        }
    } else if (G.player.x > level.level_w - horizonalMargin) {
        loadLevel(level.level_right[0])
        G.player.y += level.level_right[1]
        G.player.x = horizonalMargin + 1
        if (IS_DEVELOPMENT_BUILD && level.level_right[1] !== -G.level.level_left[1] && level !== G.level) {
            console.error("Asymmetric right->left transition between " + level.level_name + " and " + G.level.level_name)
        }
    } else if (G.player.y < aboveMargin) {
        loadLevel(level.level_up[0])
        G.player.x += level.level_up[1]
        G.player.y = G.level.level_h - belowMargin
        if (IS_DEVELOPMENT_BUILD && level.level_up[1] !== -G.level.level_down[1] && level !== G.level) {
            console.error("Asymmetric up->down transition between " + level.level_name + " and " + G.level.level_name)
        }
    } else if (G.player.y > level.level_h - belowMargin) {
        loadLevel(level.level_down[0])
        G.player.x += level.level_down[1]
        G.player.y = aboveMargin
        if (IS_DEVELOPMENT_BUILD && level.level_down[1] !== -G.level.level_up[1] && level !== G.level) {
            console.error("Asymmetric down_up transition between " + level.level_name + " and " + G.level.level_name)
        }
    } else {
        return
    }

    // Ensure the player doesn't fall through the ground between levels.
    // This isn't strictly necessary but it makes level design much easier.
    const ground = raycastTerrain(G.player.x, G.player.y + LEG_OFFSET - 30, 0, 1, 30)
    if (IS_DEVELOPMENT_BUILD && ground.t > 50)
        console.error("difference:" + (G.player.y - (ground.contact_y - LEG_OFFSET)))
    if (ground.t < 50)
        G.player.y = ground.contact_y - LEG_OFFSET - 1
    G.viewport_x = viewportOffsetX + G.player.x
    G.viewport_y = viewportOffsetY + G.player.y
}
