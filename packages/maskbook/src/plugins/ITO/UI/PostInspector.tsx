import { Typography } from '@material-ui/core'
import { useChainId } from '../../../web3/hooks/useChainState'
import { resolveChainName } from '../../../web3/pipes'
import { poolPayloadErrorRetry } from '../hooks/usePoolPayload'
import type { JSON_PayloadInMask } from '../types'
import { ITO, ITO_LoadingFail } from './ITO'

export interface PostInspectorProps {
    payload: JSON_PayloadInMask
}

export function PostInspector(props: PostInspectorProps) {
    const { chain_id, pid, password } = props.payload

    const chainId = useChainId()
    if (chain_id !== chainId) return <Typography>Not available on {resolveChainName(chainId)}.</Typography>

    return (
        <ITO_LoadingFail retryPoolPayload={poolPayloadErrorRetry}>
            <ITO pid={pid} password={password} />
        </ITO_LoadingFail>
    )
}
