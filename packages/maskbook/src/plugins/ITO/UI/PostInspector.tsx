import { usePoolPayload } from '../hooks/usePoolPayload'
import { useEffect } from 'react'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import { Typography } from '@material-ui/core'
import type { JSON_PayloadInMask } from '../types'
import { ITO } from './ITO'

export interface PostInspectorProps {
    payload: JSON_PayloadInMask
}

export function PostInspector(props: PostInspectorProps) {
    // context
    const account = useAccount()
    const chainId = useChainId()
    const isChainValid = useChainIdValid()

    const { pid, password } = props.payload
    const { value: poolPayload, retry, loading, error } = usePoolPayload(pid)

    useEffect(() => retry(), [account, chainId, isChainValid])

    if (loading) return <Typography>Loading pool info…</Typography>
    if (error) return <Typography>Failed to load pool info.</Typography>
    if (!poolPayload) return null
    return (
        <ITO
            payload={{
                ...poolPayload,
                password: password || poolPayload.password,
            }}
            retryPayload={retry}
        />
    )
}
