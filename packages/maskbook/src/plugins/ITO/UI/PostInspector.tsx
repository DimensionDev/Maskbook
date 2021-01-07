import { Typography } from '@material-ui/core'
import { useEffect } from 'react'
import { useAccount } from '../../../web3/hooks/useAccount'
import { useChainId, useChainIdValid } from '../../../web3/hooks/useChainState'
import { usePoolPayload } from '../hooks/usePoolPayload'
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
    const { value: payload, loading, error, retry } = usePoolPayload(pid)

    useEffect(retry, [account, chainId, isChainValid])

    if (loading) return <Typography>Loading pool info…</Typography>
    if (error) return <Typography>Failed to load pool info.</Typography>
    if (!payload) return null
    return (
        <ITO
            payload={{
                ...payload,
                password: password || payload.password,
            }}
            retryPayload={retry}
        />
    )
}
