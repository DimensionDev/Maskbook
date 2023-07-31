import { v4 as uuid } from 'uuid'
import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import {
    MessageStateType,
    type ReasonableMessage,
    type TransferableMessage,
    type MessageState as Web3MessageState,
} from '@masknet/web3-shared-base'
import { type NetworkPluginID, PersistentStorages, type StorageObject, mapSubscription } from '@masknet/shared-base'

export class MessageState<Request, Response> implements Web3MessageState<Request, Response> {
    public storage: StorageObject<{
        messages: Record<string, ReasonableMessage<Request, Response>>
    }> = null!

    public messages?: Subscription<Array<ReasonableMessage<Request, Response>>>

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected options: {
            pluginID: NetworkPluginID
        },
    ) {
        const { storage } = PersistentStorages.Web3.createSubScope(`${this.options.pluginID}_Message`, {
            messages: {},
        })

        this.storage = storage

        this.messages = mapSubscription(this.storage.messages.subscription, (storage) => {
            return Object.values(storage)
                .filter((x) => x.state === MessageStateType.NOT_DEPEND)
                .sort((a, z) => z.createdAt.getTime() - a.createdAt.getTime())
        })
    }

    get ready() {
        return this.storage.messages.initialized
    }

    get readyPromise() {
        return this.storage.messages.initializedPromise
    }

    protected assertMessage(id: string) {
        const message = this.storage.messages.value[id]
        if (!message) throw new Error('Invalid message ID')
        return message
    }

    protected async validateMessage(message: TransferableMessage<Request, Response>) {
        return true
    }

    protected async waitForApprovingRequest(id: string): Promise<ReasonableMessage<Request, Response>> {
        return new Promise((resolve, reject) => {
            const observe = () => {
                const message = this.storage.messages.value[id]

                if (message) {
                    // not a state to be resolved
                    if (message.state === MessageStateType.NOT_DEPEND) return

                    if (message.state === MessageStateType.APPROVED) resolve(message)
                    else reject(new Error('User rejected the message.'))
                } else {
                    reject(new Error('Invalid request ID'))
                }

                unsubscribe()
            }

            const unsubscribe = this.storage.messages.subscription.subscribe(observe)
            observe()
        })
    }

    async applyRequest<T>(
        message: TransferableMessage<Request, Response>,
    ): Promise<ReasonableMessage<Request, Response>> {
        await this.validateMessage(message)

        const ID = uuid()
        const now = new Date()
        const message_ = {
            ...message,
            ID,
            state: MessageStateType.NOT_DEPEND,
            createdAt: now,
            updatedAt: now,
        }

        await this.storage.messages.setValue(
            Object.fromEntries([
                ...Object.entries(this.storage.messages.value).filter(
                    // remove those resolved messages
                    ([_, message]) => message.state === MessageStateType.NOT_DEPEND,
                ),
                [ID, message_],
            ]),
        )

        return message_
    }

    async applyAndWaitResponse(message: TransferableMessage<Request, Response>): Promise<Response> {
        const { ID } = await this.applyRequest(message)
        const { response } = await this.waitForApprovingRequest(ID)
        if (!response) throw new Error('Invalid response')
        return response
    }

    async updateMessage(id: string, updates: Partial<TransferableMessage<Request, Response>>): Promise<void> {
        const message = this.assertMessage(id)

        await this.storage.messages.setValue({
            ...this.storage.messages.value,
            [id]: {
                ...message,
                ...updates,
                updatedAt: new Date(),
            },
        })
    }

    async approveRequest(id: string): Promise<void> {
        await this.updateMessage(id, {
            state: MessageStateType.APPROVED,
        })
    }

    async denyRequest(id: string): Promise<void> {
        await this.updateMessage(id, {
            state: MessageStateType.DENIED,
        })
    }

    async denyAllRequests(): Promise<void> {
        await this.storage.messages.setValue(
            Object.fromEntries(
                Object.entries(this.storage.messages.value).map(([id, message]) => [
                    id,
                    {
                        ...message,
                        state: MessageStateType.DENIED,
                    },
                ]),
            ),
        )
    }
}
