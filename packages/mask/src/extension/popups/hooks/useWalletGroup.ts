import { ImportSource, type Wallet } from '@masknet/shared-base'
import { useWallets } from '@masknet/web3-hooks-base'
import { groupBy } from 'lodash-es'
import { useMemo } from 'react'

export function useWalletGroup() {
    const wallets = useWallets()
    // TODO: sort by time
    return useMemo<
        | {
              groups: {
                  [index: string]: Wallet[]
              }
              imported: Wallet[]
          }
        | undefined
    >(() => {
        const imported = wallets.filter((x) => !x.mnemonicId && x.source !== ImportSource.LocalGenerated)
        return {
            groups: groupBy(
                wallets.filter((x) => !!x.mnemonicId),
                (x) => x.mnemonicId,
            ),
            imported,
        }
    }, [wallets])
}
