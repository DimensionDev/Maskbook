import { v4 as uuid } from 'uuid'
import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import {
    RequestStateType,
    type ReasonableRequest,
    type TransferableRequest,
    type RequestState as Web3RequestState,
} from '@masknet/web3-shared-base'
import { type NetworkPluginID, PersistentStorages, type StorageObject, mapSubscription } from '@masknet/shared-base'

export class RequestState<Arguments> implements Web3RequestState<Arguments> {
    public storage: StorageObject<{
        requests: Record<string, ReasonableRequest<Arguments>>
    }> = null!

    public requests?: Subscription<Array<ReasonableRequest<Arguments>>>

    ready: boolean = true
    readyPromise: Promise<void> = Promise.resolve()

    constructor(
        protected context: Plugin.Shared.SharedUIContext,
        protected options: {
            pluginID: NetworkPluginID
        },
    ) {
        const { storage } = PersistentStorages.Web3.createSubScope(`${this.options.pluginID}_Request`, {
            requests: {},
        })

        this.storage = storage

        this.requests = mapSubscription(this.storage.requests.subscription, (storage) => {
            return Object.values(storage).sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime())
        })
    }

    private assertNetwork(id: string) {
        if (!Object.hasOwn(this.storage.requests.value, id)) throw new Error('Invalid request ID')
        return this.storage.requests.value[id]
    }

    protected async validateRequest(request: TransferableRequest<Arguments>) {
        return true
    }

    async applyRequest<T>(request: TransferableRequest<Arguments>): Promise<string> {
        await this.validateRequest(request)

        const ID = uuid()
        const now = new Date()

        await this.storage.requests.setValue({
            ...this.storage.requests.value,
            [ID]: {
                ...request,
                ID,
                state: RequestStateType.NOT_DEPEND,
                createdAt: now,
                updatedAt: now,
            },
        })

        return ID
    }

    async applyAndWaitRequest(request: TransferableRequest<Arguments>): Promise<void> {
        const ID = await this.applyRequest(request)

        return new Promise((resolve, reject) => {
            this.requests?.subscribe(() => {
                this.requests?.getCurrentValue().forEach((request) => {
                    if (ID !== request.ID) return
                    if (request.state === RequestStateType.APPROVED) resolve()
                    else if (request.state === RequestStateType.DENIED) reject(new Error('User rejected the request.'))
                })
            })
        })
    }

    async updateRequest(id: string, updates: Partial<TransferableRequest<Arguments>>): Promise<void> {
        const request = this.assertNetwork(id)

        await this.storage.requests.setValue({
            ...this.storage.requests.value,
            [id]: {
                ...request,
                ...updates,
                updatedAt: new Date(),
            },
        })
    }

    async approveRequest(id: string): Promise<void> {
        await this.updateRequest(id, {
            state: RequestStateType.APPROVED,
        })
    }

    async denyRequest(id: string): Promise<void> {
        await this.updateRequest(id, {
            state: RequestStateType.DENIED,
        })
    }

    async denyAllRequests(): Promise<void> {
        await this.storage.requests.setValue(
            Object.fromEntries(
                Object.entries(this.storage.requests.value).map(([id, request]) => [
                    id,
                    {
                        ...request,
                        state: RequestStateType.DENIED,
                    },
                ]),
            ),
        )
    }
}
