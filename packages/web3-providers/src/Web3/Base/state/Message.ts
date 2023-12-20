import { v4 as uuid } from 'uuid'
import type { Subscription } from 'use-subscription'
import {
    MessageStateType,
    type ReasonableMessage,
    type TransferableMessage,
    type MessageState as Web3MessageState,
} from '@masknet/web3-shared-base'
import { type StorageItem, mapSubscription } from '@masknet/shared-base'

export abstract class MessageState<Request, Response> implements Web3MessageState<Request, Response> {
    public messages: Subscription<Array<ReasonableMessage<Request, Response>>>

    constructor(private storage: StorageItem<Record<string, ReasonableMessage<Request, Response>>>) {
        this.messages = mapSubscription(this.storage.subscription, (storage) => {
            return Object.values(storage)
                .filter((x) => x.state === MessageStateType.NOT_DEPEND)
                .sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime())
        })
    }

    protected assertMessage(id: string) {
        const message = this.storage.value[id]
        if (!message) throw new Error('Invalid message ID')
        return message
    }

    protected async validateMessage(message: TransferableMessage<Request, Response>) {
        return true
    }

    protected async waitForApprovingRequest(id: string): Promise<ReasonableMessage<Request, Response>> {
        return new Promise((resolve, reject) => {
            const observe = () => {
                const message = this.storage.value[id]

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

            const unsubscribe = this.storage.subscription.subscribe(observe)
            observe()
        })
    }

    async applyRequest(message: TransferableMessage<Request, Response>): Promise<ReasonableMessage<Request, Response>> {
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

        await this.storage.setValue(
            Object.fromEntries([
                ...Object.entries(this.storage.value).filter(
                    // remove those resolved messages
                    ([_, message]) => message.state === MessageStateType.NOT_DEPEND,
                ),
                [ID, message_],
            ]),
        )

        return message_
    }

    async applyAndWaitResponse(
        message: TransferableMessage<Request, Response>,
    ): Promise<ReasonableMessage<Request, Response>> {
        const { ID } = await this.applyRequest(message)
        const reasonableMessage = await this.waitForApprovingRequest(ID)
        if (!reasonableMessage.response) throw new Error('Invalid response')
        return reasonableMessage
    }

    async updateMessage(id: string, updates: Partial<TransferableMessage<Request, Response>>): Promise<void> {
        const message = this.assertMessage(id)

        await this.storage.setValue({
            ...this.storage.value,
            [id]: {
                ...message,
                ...updates,
                updatedAt: new Date(),
            },
        })
    }

    async approveRequest(id: string, updates?: Request): Promise<Response | void> {
        const message = this.assertMessage(id)

        await this.updateMessage(id, {
            request: {
                ...message.request,
                ...updates,
            },
            state: MessageStateType.APPROVED,
        })
    }

    async denyRequest(id: string): Promise<void> {
        await this.updateMessage(id, {
            state: MessageStateType.DENIED,
        })
    }

    async denyAllRequests(): Promise<void> {
        await this.storage.setValue(
            Object.fromEntries(
                Object.entries(this.storage.value).map(([id, message]) => [
                    id,
                    {
                        ...message,
                        state: message.state === MessageStateType.NOT_DEPEND ? MessageStateType.DENIED : message.state,
                    },
                ]),
            ),
        )
    }
}
