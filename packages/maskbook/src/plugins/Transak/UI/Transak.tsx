import React, { useEffect } from 'react'
import { noop } from 'lodash-es'
import type { TransakSDKConfig } from '@transak/transak-sdk'
import { useTransak } from '../hooks/useTransak'

export interface TransakProps {
    open: boolean
    onClose?: () => void
    TransakSDKConfig?: Partial<TransakSDKConfig>
}

export function Transak(props: TransakProps) {
    const { open, onClose = noop, TransakSDKConfig } = props

    const sdk = useTransak(TransakSDKConfig)

    useEffect(() => {
        sdk.on(sdk.EVENTS.TRANSAK_WIDGET_CLOSE, onClose)
        return () => sdk.close()
    }, [sdk])

    useEffect(() => {
        if (open) sdk.init()
        else sdk.close()
    }, [open, sdk])
    return null
}
