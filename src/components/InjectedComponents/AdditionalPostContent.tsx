import * as React from 'react'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import { MaskbookLightTheme, withStylesTyped } from '../../utils/theme'
import Divider from '@material-ui/core/Divider/Divider'
import Typography from '@material-ui/core/Typography/Typography'

interface Props {
    title: React.ReactNode
    children?: any
}
const _AdditionalContent = withStylesTyped({})<Props>(props => {
    return (
        <>
            <Divider style={{ marginBottom: 6 }} />
            <Typography variant="caption" style={{ display: 'flex' }}>
                <img
                    src={chrome.runtime.getURL('/maskbook-icon-padded.png')}
                    style={{ transform: 'translate(-1px, -1px)' }}
                    width={16}
                    height={16}
                />
                {props.title}
            </Typography>
            <Typography variant="body1" style={{ marginBottom: 6, marginTop: 6, lineHeight: 1.2 }}>
                {props.children}
            </Typography>
        </>
    )
})

export function AdditionalContent(props: Props) {
    return (
        <MuiThemeProvider theme={MaskbookLightTheme}>
            <_AdditionalContent {...props} />
        </MuiThemeProvider>
    )
}
