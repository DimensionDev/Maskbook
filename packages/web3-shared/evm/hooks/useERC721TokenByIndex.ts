import { useAsync } from 'react-use'
import type { ERC721Token } from '../types'
import { useERC721TokenContract } from '../contracts/useERC721TokenContract'
import { useChainId } from './useChainId'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

export function useERC721TokenByIndex(token?: ERC721Token, index = 0): AsyncState<string | undefined> {
    const chainId = useChainId()
    const erc721Contract = useERC721TokenContract(token?.address)
    return useAsync(async () => {
        if (!erc721Contract) return
        return erc721Contract.methods.tokenByIndex(index).call()
    }, [chainId, erc721Contract, index])
}
