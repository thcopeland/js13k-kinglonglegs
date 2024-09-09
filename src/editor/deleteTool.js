import { syncLevel } from "./level"

export const deleteTool = () => {
    if (E.objectData !== undefined) {
        if ((E.objectData.type === "wall" || E.objectData.type === "collider" || E.objectData.type === "spikes") && E.objectSubIndex >= 0) {
            E.objectData.points.splice(E.objectSubIndex, 2)
            if (E.objectData.points.length > 0) {
                if (E.objectSubIndex > 0) {
                    E.objectSubIndex -= 2
                }
            } else {
                if (E.objectData.type === "wall") {
                    E.walls.splice(E.objectIndex, 1)

                    for (let i = 0; i < E.colliders.length; i++) {
                        if (E.colliders[i].reference === E.objectData) {
                            E.colliders.splice(i, 1)
                            break
                        }
                    }
                } else if (E.objectData.type === "collider") {
                    E.colliders.splice(E.objectIndex, 1)
                } else if (E.objectData.type === "spikes") {
                    E.objects.splice(E.objectIndex, 1)
                }
                E.objectData = undefined
                E.objectSubIndex = -1
                E.objectIndex = -1
            }
        } else if (E.objectData.type === "words" || E.objectData.type === "lamp") {
            E.objects.splice(E.objectIndex, 1)
            E.objectData = undefined
            E.objectSubIndex = -1
            E.objectIndex = -1
        }
    }

    syncLevel()
}