import { useAsyncRetry } from 'react-use'
import { PluginGitcoinRPC } from '../messages'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useCallback } from 'react'
import { createERC20Token } from '../../../web3/helpers'
import { useChainId } from '../../../web3/hooks/useChainState'
import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../web3/constants'
import { EthereumMessages } from '../../Ethereum/messages'
import { useGrant } from '../hooks/useGrant'
import { PreviewCard } from './PreviewCard'

export interface GitcoinProps {
    url: string
}

export function Gitcoin(props: GitcoinProps) {
    const [id = ''] = props.url.match(/\d+/) ?? []
    const { value: data } = useAsyncRetry(() => PluginGitcoinRPC.fetchGrant(id), [id])

    console.log('DEBUG: fetch gitcoin')
    console.log(data)

    const chainId = useChainId()
    const DAI_ADDRESS = useConstant(CONSTANTS, 'DAI_ADDRESS')
    const ITO_CONTRACT_ADDRESS = useConstant(CONSTANTS, 'MULTICALL_ADDRESS')

    const grant = useGrant(id)

    //#region remote controlled dialog logic
    const [open, setOpen] = useRemoteControlledDialog(EthereumMessages.events.unlockERC20TokenDialogUpdated)
    const onOpen = useCallback(() => {
        setOpen({
            open: true,
            token: createERC20Token(chainId, '0xe379c7a6BA07575A5a49D8F8EBfD04921b86917D', 18, 'MAKB', 'MAKB'),
            amount: '3',
            spender: '0xdb1eec6fecc708139aae82f0a4db0385968565c5',
        })
    }, [setOpen])
    //#endregion

    console.log('DEBUG: grant')
    console.log(grant)

    return <PreviewCard id={id} onRequest={() => console.log('request')} />
}
