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

export class MessageState<Requset, Response> implements Web3MessageState<Requset, Response> {
    public storage: StorageObject<{
        messages: Record<string, ReasonableMessage<Requset, Response>>
    }> = null!

    public messages?: Subscription<Array<ReasonableMessage<Requset, Response>>>

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected options: {
            pluginID: NetworkPluginID
        },
    ) {
        const { storage } = PersistentStorages.Web3.createSubScope(`${this.options.pluginID}_Request`, {
            messages: {},
        })

        this.storage = storage

        this.messages = mapSubscription(this.storage.messages.subscription, (storage) => {
            return Object.values(storage)
                .filter((x) => x.state === MessageStateType.APPROVED)
                .sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime())
        })
    }

    get ready() {
        return this.storage.messages.initialized
    }

    get readyPromise() {
        return this.storage.messages.initializedPromise
    }

    protected assertMessage(id: string) {
        if (!Object.hasOwn(this.storage.messages.value, id)) throw new Error('Invalid request ID')
        return this.storage.messages.value[id]
    }

    protected async validateRequest(request: TransferableMessage<Requset, Response>) {
        return true
    }

    protected async waitForApprovingRequest(id: string): Promise<ReasonableMessage<Requset, Response>> {
        return new Promise((resolve, reject) => {
            const unsubscribe = this.messages?.subscribe(() => {
                const request = this.messages?.getCurrentValue().find((x) => x.ID === id)
                if (request?.state !== MessageStateType.APPROVED && request?.state !== MessageStateType.DENIED) return

                if (request.state === MessageStateType.APPROVED) resolve(request)
                else reject(new Error('User rejected the request.'))
                unsubscribe?.()
            })
        })
    }

    protected async waitForBroadcastingRequest(id: string): Promise<ReasonableMessage<Requset, Response>> {
        return new Promise((resolve) => {
            const unsubscribe = this.messages?.subscribe(() => {
                const request = this.messages?.getCurrentValue().find((x) => x.ID === id)
                if (request?.state !== MessageStateType.BROADCASTED) return

                resolve(request)
                unsubscribe?.()
            })
        })
    }

    async applyRequest<T>(
        request: TransferableMessage<Requset, Response>,
    ): Promise<ReasonableMessage<Requset, Response>> {
        await this.validateRequest(request)

        const ID = uuid()
        const now = new Date()
        const request_ = {
            ...request,
            ID,
            state: MessageStateType.NOT_DEPEND,
            createdAt: now,
            updatedAt: now,
        }

        await this.storage.messages.setValue(
            Object.fromEntries([
                ...Object.entries(this.storage.messages.value).filter(
                    ([_, request]) => request.state === MessageStateType.NOT_DEPEND,
                ),
                [ID, request_],
            ]),
        )

        return request_
    }

    async applyAndWaitResponse<T>(request: TransferableMessage<Requset, Response>): Promise<Response> {
        const { ID } = await this.applyRequest(request)
        await this.waitForApprovingRequest(ID)
        const broadcastedRequest = await this.waitForBroadcastingRequest(ID)
        if (!broadcastedRequest.response) throw new Error('Invalid response')
        return broadcastedRequest.response
    }

    async updateRequest(id: string, updates: Partial<TransferableMessage<Requset, Response>>): Promise<void> {
        const request = this.assertMessage(id)

        await this.storage.messages.setValue({
            ...this.storage.messages.value,
            [id]: {
                ...request,
                ...updates,
                updatedAt: new Date(),
            },
        })
    }

    async broadcastRequest(id: string): Promise<void> {
        await this.updateRequest(id, {
            state: MessageStateType.BROADCASTED,
            response: undefined,
        })
    }

    async approveRequest(id: string): Promise<void> {
        await this.updateRequest(id, {
            state: MessageStateType.APPROVED,
        })
    }

    async denyRequest(id: string): Promise<void> {
        await this.updateRequest(id, {
            state: MessageStateType.DENIED,
        })
    }

    async denyAllRequests(): Promise<void> {
        await this.storage.messages.setValue(
            Object.fromEntries(
                Object.entries(this.storage.messages.value).map(([id, request]) => [
                    id,
                    {
                        ...request,
                        state: MessageStateType.DENIED,
                    },
                ]),
            ),
        )
    }
}
