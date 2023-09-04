import { ImportSource, type Wallet } from '@masknet/shared-base'
import { useWallets } from '@masknet/web3-hooks-base'
import { groupBy, uniqBy } from 'lodash-es'
import Services from '#services'
import { useAsync } from 'react-use'

export function useWalletGroup() {
    const wallets = useWallets()
    // TODO: sort by time
    const { value } = useAsync(async () => {
        const imported = wallets.filter((x) => !x.mnemonicId && x.source !== ImportSource.LocalGenerated)
        // old version data
        if (wallets.some((x) => x.source === ImportSource.LocalGenerated && !x.mnemonicId)) {
            const localGenerated = wallets.filter((x) => x.source === ImportSource.LocalGenerated)
            const primary = await Services.Wallet.getWalletPrimary()
            if (!primary) return
            const groups = { [primary.address]: uniqBy([...localGenerated, primary], (x) => x.address) }
            return {
                groups,
                imported,
            }
        }
        return {
            groups: groupBy(
                wallets.filter((x) => !!x.mnemonicId),
                (x) => x.mnemonicId,
            ) as {
                [index: string]: Wallet[]
            },
            imported,
        }
    }, [wallets])

    return value
}
