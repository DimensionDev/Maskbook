import type { StorageItem } from '@masknet/shared-base'
import type {
    IdentityAddress,
    SocialIdentity,
    IdentityServiceState as Web3SocialIdentityState,
} from '@masknet/web3-shared-base'

export class IdentityServiceState<
    ChainId,
    IdentityBook extends Record<string, IdentityAddress[]> = Record<string, IdentityAddress[]>,
> implements Web3SocialIdentityState
{
    protected storage: StorageItem<IdentityBook> = null!

    private getIdentityID(identity: SocialIdentity) {
        return `${identity.identifier.network}_${identity.identifier.userId}`
    }

    async lookup(identity: SocialIdentity): Promise<IdentityAddress[]> {
        return this.storage.value[this.getIdentityID(identity)]
    }
}
