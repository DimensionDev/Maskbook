import { useEffect, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useAccount } from '../hooks/useAccount'
import { useBlockNumber, useChainId, useChainIdValid } from '../hooks/useBlockNumber'
import { useEtherTokenBalance } from '../hooks/useEtherTokenBalance'
import { useEtherTokenDetailed } from '../hooks/useEtherTokenDetailed'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../types'

function useChainState() {
    const account = useAccount()
    const chainId = useChainId()
    const chainIdValid = useChainIdValid()
    const blockNumber = useBlockNumber(chainId)
    const chainTokenDetailed = useEtherTokenDetailed()
    const chainTokenBalance = useEtherTokenBalance(account)

    return {
        account,
        chainId,
        chainIdValid,
        blockNumber,
        chainTokenBalance,
        chainTokenDetailed,
        erc20TokenDetaileds: [],
        erc721TokenDetaileds: [],
    }
}

export const ChainState = createContainer(useChainState)
