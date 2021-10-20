import { useRef } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { CustomSnackbarProvider } from '@masknet/theme'
import { activatedSocialNetworkUI } from '../../social-network'
import { MaskUIRootWithinShadow } from '../../UIRoot'
import { getMaskTheme } from '../theme'
import { FACEBOOK_ID } from '../../social-network-adaptor/facebook.com/base'

export function MaskInShadow(props: React.PropsWithChildren<{}>) {
    const useTheme = useRef(activatedSocialNetworkUI.customization.useTheme).current
    const theme = useTheme?.() || getMaskTheme()
    return MaskUIRootWithinShadow(
        <ThemeProvider theme={theme}>
            <CustomSnackbarProvider
                isFacebook={activatedSocialNetworkUI.networkIdentifier === FACEBOOK_ID}
                disableWindowBlurListener={false}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <>{props.children}</>
            </CustomSnackbarProvider>
        </ThemeProvider>,
    )
}
