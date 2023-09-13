/// <reference types="react/canary" />
import { Flags } from '@masknet/flags'
import Services from '#services'
import { Box, Link } from '@mui/material'
import { Suspense, cache, use, useState } from 'react'
import { ErrorBoundary } from '@masknet/shared-base-ui'

const f = cache(Services.SiteAdaptor.shouldSuggestConnectInPopup)
export default function MaskSDK() {
    if (!Flags.mask_SDK_ready) return null
    return (
        <ErrorBoundary>
            <Suspense>
                <MaskSDKLoader />
            </Suspense>
        </ErrorBoundary>
    )
}

function MaskSDKLoader() {
    const shouldShow = use(f())
    const [dismissed, setDismissed] = useState(false)
    if (!shouldShow) return null
    if (dismissed) return null
    return (
        <Box>
            (Dev mode only, UI to be done) Connect Mask on this site.
            <br />
            <Link
                onClick={async () => {
                    await Services.SiteAdaptor.attachMaskSDKToCurrentActivePage()
                    window.close()
                }}>
                Connect once
            </Link>
            <br />
            <Link
                onClick={async () => {
                    const result = await Services.Helper.requestHostPermissionForActiveTab()
                    if (!result) return
                    await Services.SiteAdaptor.attachMaskSDKToCurrentActivePage()
                    window.close()
                }}>
                Always connect this site
            </Link>
            <br />
            <Link
                onClick={async () => {
                    const result = await Services.Helper.requestHostPermission(['<all_urls>'])
                    if (!result) return
                    await Services.SiteAdaptor.attachMaskSDKToCurrentActivePage()
                    window.close()
                }}>
                Always connect all sites
            </Link>
            <br />
            <Link onClick={() => setDismissed(true)}>Close</Link>
        </Box>
    )
}
