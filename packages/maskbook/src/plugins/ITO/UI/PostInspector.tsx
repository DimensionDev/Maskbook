import { Typography } from '@material-ui/core'
import { useChainId } from '../../../web3/hooks/useChainState'
import { resolveChainName } from '../../../web3/pipes'
import { poolPayloadErrorRetry } from '../hooks/usePoolPayload'
import type { JSON_PayloadInMask } from '../types'
import { ITO, ITO_LoadingFail, ITO_ConnectMetaMask } from './ITO'
import { currentIsMetamaskLockedSettings, currentSelectedWalletProviderSettings } from '../../Wallet/settings'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { ProviderType } from '../../../web3/types'

export interface PostInspectorProps {
    payload: JSON_PayloadInMask
}

export function PostInspector(props: PostInspectorProps) {
    const { chain_id, pid, password, is_mask, test_nums } = props.payload
    const chainId = useChainId()
    const currentSelectedWalletProvider = useValueRef(currentSelectedWalletProviderSettings)
    const isMetamaskRedpacketLocked =
        useValueRef(currentIsMetamaskLockedSettings) && currentSelectedWalletProvider === ProviderType.MetaMask

    if (isMetamaskRedpacketLocked) return <ITO_ConnectMetaMask />
    if (chain_id !== chainId) return <Typography>Not available on {resolveChainName(chainId)}.</Typography>

    return (
        <ITO_LoadingFail retryPoolPayload={poolPayloadErrorRetry}>
            <ITO pid={pid} password={password} isMask={is_mask} testNums={test_nums} />
        </ITO_LoadingFail>
    )
}
