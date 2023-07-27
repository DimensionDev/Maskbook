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

export class RequestState<Arguments, Options = unknown> implements Web3RequestState<Arguments, Options> {
    public storage: StorageObject<{
        requests: Record<string, ReasonableRequest<Arguments, Options>>
    }> = null!

    public requests?: Subscription<Array<ReasonableRequest<Arguments, Options>>>

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
            return Object.values(storage)
                .filter((x) => x.state === RequestStateType.APPROVED)
                .sort((a, z) => a.createdAt.getTime() - z.createdAt.getTime())
        })
    }

    private assertNetwork(id: string) {
        if (!Object.hasOwn(this.storage.requests.value, id)) throw new Error('Invalid request ID')
        return this.storage.requests.value[id]
    }

    protected async validateRequest(request: TransferableRequest<Arguments, Options>) {
        return true
    }

    protected async waitRequest(id: string): Promise<ReasonableRequest<Arguments, Options>> {
        return new Promise((resolve, reject) => {
            const unsubscribe = this.requests?.subscribe(() => {
                const request = this.requests?.getCurrentValue().find((x) => x.ID === id)
                if (!request) return

                if (request.state === RequestStateType.APPROVED) resolve(request)
                else reject(new Error('User rejected the request.'))
                unsubscribe?.()
            })
        })
    }

    async applyRequest<T>(
        request: TransferableRequest<Arguments, Options>,
    ): Promise<ReasonableRequest<Arguments, Options>> {
        await this.validateRequest(request)

        const ID = uuid()
        const now = new Date()
        const request_ = {
            ...request,
            ID,
            state: RequestStateType.NOT_DEPEND,
            createdAt: now,
            updatedAt: now,
        }

        await this.storage.requests.setValue(
            Object.fromEntries([
                ...Object.entries(this.storage.requests.value).filter(
                    ([_, request]) => request.state === RequestStateType.NOT_DEPEND,
                ),
                [ID, request_],
            ]),
        )

        return request_
    }

    async applyAndWaitRequest(
        request: TransferableRequest<Arguments, Options>,
    ): Promise<ReasonableRequest<Arguments, Options>> {
        const { ID } = await this.applyRequest(request)
        return this.waitRequest(ID)
    }

    async updateRequest(id: string, updates: Partial<TransferableRequest<Arguments, Options>>): Promise<void> {
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
