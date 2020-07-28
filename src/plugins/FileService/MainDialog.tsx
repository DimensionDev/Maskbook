import { DialogContent, DialogProps, DialogTitle, Grid, IconButton, makeStyles, Typography } from '@material-ui/core'
import { isNil } from 'lodash-es'
import React from 'react'
import { useStylesExtends } from '../../components/custom-ui-helper'
import { DialogDismissIconUI } from '../../components/InjectedComponents/DialogDismissIcon'
import { getActivatedUI } from '../../social-network/ui'
import ShadowRootDialog from '../../utils/jss/ShadowRootDialog'
import { Entry } from './components'
import { InsertButton } from './components/InsertButton'
import { displayName, META_KEY_1 } from './constants'
import { Exchange } from './hooks/Exchange'
import type { FileInfo } from './types'

interface Props
    extends withClasses<
        | KeysInferFromUseStyles<typeof useStyles>
        | 'dialog'
        | 'backdrop'
        | 'container'
        | 'paper'
        | 'input'
        | 'header'
        | 'content'
        | 'close'
        | 'button'
        | 'label'
        | 'switch'
    > {
    open: boolean
    onConfirm: (file: FileInfo | undefined) => void
    onDecline: () => void
    DialogProps?: Partial<DialogProps>
}

const useStyles = makeStyles({
    title: { marginLeft: 6 },
    container: { width: '100%' },
    content: { padding: 12, background: '#fff' },
})

const MainDialog: React.FC<Props> = (props) => {
    const classes = useStylesExtends(useStyles(), props)
    const [selectedFileInfo, setSelectedFileInfo] = React.useState<FileInfo | null>(null)
    const onInsert = () => {
        if (isNil(selectedFileInfo)) {
            return
        }
        const { typedMessageMetadata } = getActivatedUI()
        const next = new Map(typedMessageMetadata.value.entries())
        if (selectedFileInfo) {
            next.set(META_KEY_1, selectedFileInfo)
        } else {
            next.delete(META_KEY_1)
        }
        typedMessageMetadata.value = next
        props.onConfirm(selectedFileInfo)
    }
    return (
        <ShadowRootDialog
            className={classes.dialog}
            classes={{ container: classes.container, paper: classes.paper }}
            open={props.open}
            scroll="paper"
            fullWidth
            maxWidth="sm"
            disableAutoFocus
            disableEnforceFocus
            BackdropProps={{ className: classes.backdrop }}
            {...props.DialogProps}>
            <DialogTitle className={classes.header}>
                <IconButton classes={{ root: classes.close }} onClick={props.onDecline}>
                    <DialogDismissIconUI />
                </IconButton>
                <Typography className={classes.title} display="inline" variant="inherit" children={displayName} />
            </DialogTitle>
            <DialogContent className={classes.content}>
                <Exchange onInsert={setSelectedFileInfo}>
                    <Entry />
                    <Grid container justify="center">
                        <InsertButton onClick={onInsert} disabled={isNil(selectedFileInfo)} />
                    </Grid>
                </Exchange>
            </DialogContent>
        </ShadowRootDialog>
    )
}

export default MainDialog
