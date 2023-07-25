import type { ChainId } from '@masknet/web3-shared-evm'
import { useState } from 'react'

function useTransferFungibleToken(chainId: ChainId, address: string) {
    const [recipient] = useState('')
}
