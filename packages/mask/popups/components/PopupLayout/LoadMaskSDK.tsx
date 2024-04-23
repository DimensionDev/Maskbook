/// <reference types="react/canary" />
import { Flags } from '@masknet/flags'
import Services from '#services'
import { Box, Link } from '@mui/material'
import { useState } from 'react'
import { ErrorBoundary } from '@masknet/shared-base-ui'
import { useAsync } from '@react-hookz/web'

export default function MaskSDK() {
    if (!Flags.mask_sdk_enabled) return null
    return (
        <ErrorBoundary>
            <MaskSDKLoader />
        </ErrorBoundary>
    )
}

function MaskSDKLoader() {
    const [{ result: shouldShow }] = useAsync(Services.SiteAdaptor.shouldSuggestConnectInPopup, false)
    const [dismissed, setDismissed] = useState(false)
    const [{ result: currentTab }] = useAsync(async () => {
        const tab = await Services.Helper.getActiveTab()
        return tab?.url ? new URL(tab.url).origin + '/*' : null
    })
    if (!shouldShow) return null
    if (dismissed) return null
    return (
        <Box sx={{ position: 'fixed', bottom: '3em' }}>
            (Dev mode only, No UI for now.)
            <br />
            Connect Mask on this site{' '}
            <Link
                onClick={async () => {
                    await Services.SiteAdaptor.attachMaskSDKToCurrentActivePage()
                    window.close()
                }}>
                once
            </Link>
            {currentTab ?
                <>
                    {', '}
                    <Link
                        onClick={async () => {
                            const granted = await browser.permissions.request({ origins: [currentTab] })
                            if (!granted) return
                            await Services.SiteAdaptor.attachMaskSDKToCurrentActivePage()
                            window.close()
                        }}>
                        always
                    </Link>
                </>
            :   null}
            {', or '}
            <Link
                onClick={async () => {
                    const granted = await browser.permissions.request({ origins: ['<all_urls>'] })
                    if (!granted) return
                    await Services.SiteAdaptor.attachMaskSDKToCurrentActivePage()
                    window.close()
                }}>
                all sites
            </Link>
            <br />
            <Link onClick={() => setDismissed(true)}>Close</Link>
        </Box>
    )
}
