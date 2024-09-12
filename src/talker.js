import { addMessage } from "./message"
import { updateWalker } from "./walker"

export const newTalker = (walker, messages) => ({
    type_: "talker",
    lastMessage: undefined,
    lastMessageIndex: -1,
    messages,
    walker
})


export const updateTalker = (talker, dt) => {
    updateWalker(talker.walker, dt)

    if (Math.abs(G.player.x - talker.walker.x) < 100 && Math.abs(G.player.y - talker.walker.y) < 100) {
        if ((talker.lastMessage === undefined || talker.lastMessage.t < 0) && talker.lastMessageIndex < talker.messages.length-1) {
            talker.lastMessageIndex++
            talker.lastMessage = addMessage(talker.messages[talker.lastMessageIndex], 0, -100, talker.walker.id_)
        }
    }
}
