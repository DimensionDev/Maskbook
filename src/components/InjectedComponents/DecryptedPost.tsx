import * as React from 'react'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import { MaskbookLightTheme, withStylesTyped } from '../../utils/theme'
import Divider from '@material-ui/core/Divider/Divider'
import Typography from '@material-ui/core/Typography/Typography'

interface Props {
    decryptedContent: string
}
const _DecryptedPost = withStylesTyped({})<Props>(props => {
    return (
        <>
            <Divider style={{ marginBottom: 6 }} />
            <Typography variant="caption">Decrypted by Maskbook:</Typography>
            <Typography variant="body1">{props.decryptedContent}</Typography>
        </>
    )
})

export function DecryptedPost(props: Props) {
    return (
        <MuiThemeProvider theme={MaskbookLightTheme}>
            <_DecryptedPost {...props} />
        </MuiThemeProvider>
    )
}
