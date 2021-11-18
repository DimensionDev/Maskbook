import { first } from 'lodash-unified'
import { useAsyncRetry } from 'react-use'
import { EthereumAddress } from 'wallet.ts'
import { ChainId } from '..'
import { useReverseRecordsContract } from '../contracts/useReverseLookupContract'

const cached: Map<string, string> = new Map()

export function useENSLabel(address: string) {
    const reverseRecordsContract = useReverseRecordsContract()
    return useAsyncRetry(async () => {
        // validate address
        if (!address || !EthereumAddress.isValid(address)) return ''
        const address_ = EthereumAddress.checksumAddress(address)

        // check cache
        if (cached.has(address_)) return cached.get(address_)

        // fetch from chain
        if (!reverseRecordsContract) return ''
        const response = await reverseRecordsContract.methods.getNames([address_]).call({
            // it needs to be locked on the ethereum mainnet
            chainId: `0x${ChainId.Mainnet.toString(16)}`,
        })

        // validate response
        const label = first(response) ?? ''
        if (!label) return ''

        // update cache
        cached.set(address_, label)
        return cached.get(address_)
    }, [address, reverseRecordsContract])
}
