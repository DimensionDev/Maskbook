/// <reference types="react/canary" />
import { Flags } from '@masknet/flags'
import Services from '#services'
import { Button, SnackbarContent, Box } from '@mui/material'
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
    const [clicked, setClicked] = useState(false)
    if (!shouldShow) return null
    if (clicked) return null
    return (
        <Box>
            <SnackbarContent
                message="(Dev only) Enable Mask on this site"
                action={
                    <Button
                        onClick={async () => {
                            await Services.SiteAdaptor.attachMaskSDKToCurrentActivePage()
                            setClicked(true)
                            window.close()
                        }}>
                        Connect
                    </Button>
                }
            />
        </Box>
    )
}
