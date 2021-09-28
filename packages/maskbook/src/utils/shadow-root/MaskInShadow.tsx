import { useRef } from 'react'
import { ThemeProvider } from '@material-ui/core/styles'
import { CustomSnackbarProvider } from '@masknet/theme'
import { activatedSocialNetworkUI } from '../../social-network'
import { MaskUIRootWithinShadow } from '../../UIRoot'
import { getMaskTheme } from '../theme'

export function MaskInShadow(props: React.PropsWithChildren<{}>) {
    const useTheme = useRef(activatedSocialNetworkUI.customization.useTheme).current
    const theme = useTheme?.() || getMaskTheme()
    return MaskUIRootWithinShadow(
        <ThemeProvider theme={theme}>
            <CustomSnackbarProvider
                disableWindowBlurListener={false}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <>{props.children}</>
            </CustomSnackbarProvider>
        </ThemeProvider>,
    )
}
