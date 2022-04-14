import { useAsyncRetry } from 'react-use'
import { NextIDProof } from '@masknet/web3-providers'
import { NextIDPlatform } from '../../../../../plugin-infra/node_modules/@masknet/shared-base/dist'

export function useQueryIsBound(account?: string) {
    const { value: infos } = useAsyncRetry(async () => {
        if (!account) return false
        return NextIDProof.queryExistedBindingByPlatform(NextIDPlatform.Ethereum, account)
    })
    return infos
}
