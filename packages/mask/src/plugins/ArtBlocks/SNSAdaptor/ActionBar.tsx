import { useControlledDialog, useI18N } from '../../../utils'
import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { PurchaseDialog } from './PurchaseDialog'
import type { Project } from '../types'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            marginLeft: theme.spacing(-0.5),
            marginRight: theme.spacing(-0.5),
            marginTop: theme.spacing(1),
        },
        content: {
            padding: theme.spacing(0),
        },
        button: {
            flex: 1,
            margin: `${theme.spacing(0)} ${theme.spacing(0.5)}`,
        },
    }
})

export interface ActionBarProps {
    project: Project
}

export function ActionBar(props: ActionBarProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { project } = props

    const { open: openMintDialog, onClose: onCloseMintDialog, onOpen: onOpenMintDialog } = useControlledDialog()

    const status = !project.active
        ? t('plugin_artblocks_not_active')
        : project.complete
        ? t('plugin_artblocks_completed')
        : project.paused
        ? t('plugin_artblocks_paused')
        : t('plugin_artblocks_purchase')

    return (
        <Box className={classes.root} display="flex" justifyContent="center">
            <ActionButton
                className={classes.button}
                color="primary"
                variant="contained"
                onClick={onOpenMintDialog}
                disabled={project.complete || project.paused || !project.active}>
                {status}
            </ActionButton>
            <PurchaseDialog project={project} open={openMintDialog} onClose={onCloseMintDialog} />
        </Box>
    )
}
