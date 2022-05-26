import { makeStyles } from '@masknet/theme'
import { Box } from '@mui/material'
import { useControlledDialog, useI18N } from '../../../utils'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { PurchaseDialog } from './PurchaseDialog'
import type { Project } from '../types'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            flex: 1,
        },
        content: {
            padding: theme.spacing(0),
        },
        button: {
            backgroundColor: theme.palette.maskColor.dark,
            color: 'white',
            '&:hover': {
                backgroundColor: theme.palette.maskColor.dark,
            },
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
                fullWidth
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
