import { v4 as uuid } from 'uuid'
import type { Subscription } from 'use-subscription'
import {
    MessageStateType,
    type DenyRequestOptions,
    type ReasonableMessage,
    type TransferableMessage,
    type MessageState as Web3MessageState,
} from '@masknet/web3-shared-base'
import { type StorageItem, mapSubscription } from '@masknet/shared-base'
import { produce } from 'immer'

export abstract class MessageState<Request extends object, Response extends object>
    implements Web3MessageState<Request, Response>
{
    public messages: Subscription<Array<ReasonableMessage<Request, Response>>>

    constructor(private storage: StorageItem<Record<string, ReasonableMessage<Request, Response>>>) {
        if (!storage.initialized) throw new Error('Storage not initialized')
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

    private async applyRequest(
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

        const nextMessages = produce(this.storage.value, (draft: typeof this.storage.value) => {
            for (const key in draft) {
                if (draft[key].state !== MessageStateType.NOT_DEPEND) {
                    delete draft[key]
                }
            }
            draft[ID] = message_
        })
        await this.storage.setValue(nextMessages)
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
        this.assertMessage(id)

        await this.storage.setValue(
            produce(this.storage.value, (draft) => {
                Object.assign(draft[id], updates)
                draft[id].updatedAt = new Date()
            }),
        )
    }

    abstract approveRequest(id: string, updates?: Request): Promise<Response | void>

    async approveRequestWithResult(id: string, result: Response): Promise<void> {
        await this.updateMessage(id, {
            response: result,
            state: MessageStateType.APPROVED,
        })
    }

    async denyRequest(id: string): Promise<void> {
        await this.updateMessage(id, {
            state: MessageStateType.DENIED,
        })
    }

    async denyRequests({ keepChainUnrelated, keepNonceUnrelated }: DenyRequestOptions): Promise<void> {
        const messages = produce(this.storage.value, (draft: typeof this.storage.value) => {
            for (const key in draft) {
                if (draft[key].state === MessageStateType.NOT_DEPEND) {
                    if (keepChainUnrelated && this.isChainUnrelated(draft[key].request)) continue
                    if (keepNonceUnrelated && this.isNonceUnrelated(draft[key].request)) continue
                    draft[key].state = MessageStateType.DENIED
                }
            }
        })
        await this.storage.setValue(messages)
    }
    protected abstract isChainUnrelated(message: Request): boolean
    protected abstract isNonceUnrelated(message: Request): boolean
}
