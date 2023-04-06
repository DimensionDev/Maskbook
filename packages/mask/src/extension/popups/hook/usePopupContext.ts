/**
 * Warning: Don't change this context.
 * This will be removed
 */

import { createContainer } from 'unstated-next'
import { useEffect, useState } from 'react'
import { useAsync } from 'react-use'
import { SmartPayBundler } from '@masknet/web3-providers'
import { MaskMessages } from '../../../utils/messages.js'

function usePopupContext() {
    const [initLoading, setInitLoading] = useState(true)
    const [signed, setSigned] = useState(false)
    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    useEffect(() => {
        return MaskMessages.events.allPluginsReady.on(() => {
            setInitLoading(false)
        })
    }, [])

    return {
        initLoading,
        smartPayChainId,
        signed,
        setSigned,
    }
}

export const PopupContext = createContainer(usePopupContext)
