import { NameServiceID } from '@masknet/shared-base'
import type { NameServiceAPI } from '../entry-types.js'

export class ARBID_API implements NameServiceAPI.Provider {
    get id() {
        return NameServiceID.ARBID
    }

    lookup(name: string): Promise<string | undefined> {
        throw new Error('Method not implemented.')
    }

    reverse(address: string): Promise<string | undefined> {
        throw new Error('Method not implemented.')
    }
}
