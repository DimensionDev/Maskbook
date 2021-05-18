import { useRef } from 'react'
import { ThemeProvider } from '@material-ui/core/styles'
import { activatedSocialNetworkUI } from '../../social-network'
import { MaskUIRootWithinShadow } from '../../UIRoot'
import { getMaskbookTheme } from '../theme'

export function MaskInShadow(props: React.PropsWithChildren<{}>) {
    const useTheme = useRef(activatedSocialNetworkUI.customization.useTheme).current
    const theme = useTheme?.() || getMaskbookTheme()
    return MaskUIRootWithinShadow(
        <ThemeProvider theme={theme}>
            <>{props.children}</>
        </ThemeProvider>,
    )
}
