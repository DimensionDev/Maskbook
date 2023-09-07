import { NetworkPluginID, PersistentStorages } from '@masknet/shared-base'
import { MessageStateType, type ReasonableMessage } from '@masknet/web3-shared-base'

function checkMessages(messages: Array<ReasonableMessage<Request, Response>>) {
    const pendingTasks = messages
        .filter((x) => x.state === MessageStateType.NOT_DEPEND)
        .sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime())
    const length = Math.min(pendingTasks.length, 99)
    const action = browser.action || browser.browserAction
    action.setBadgeBackgroundColor({
        color: '#D92F0E',
    })
    action.setBadgeText({
        text: length ? length.toString() : '',
    })
}

async function watchTasks() {
    const { storage } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_Message`, {
        messages: {} as Record<string, ReasonableMessage<Request, Response>>,
    })
    await storage.messages.initializedPromise
    checkMessages(Object.values(storage.messages.value))
    storage.messages.subscription.subscribe(() => {
        const messages = Object.values(storage.messages.value)
        checkMessages(messages)
    })
}

watchTasks()
