import { Box } from '@mui/material'
import { makeStyles, ActionButton } from '@masknet/theme'
import { useControlledDialog } from '@masknet/shared-base-ui'
import type { ChainId } from '@masknet/web3-shared-evm'
import { PurchaseDialog } from './PurchaseDialog.js'
import type { Project } from '../types.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            flex: 1,
        },
    }
})

interface ActionBarProps {
    project: Project
    chainId: ChainId
}

export function ActionBar(props: ActionBarProps) {
    const { classes } = useStyles()
    const { project, chainId } = props

    const { open: openMintDialog, onClose: onCloseMintDialog, onOpen: onOpenMintDialog } = useControlledDialog()

    const status =
        !project.active ? <Trans>This project is no longer active</Trans>
        : project.complete ? <Trans>Completed</Trans>
        : project.paused ? <Trans>Paused</Trans>
        : <Trans>Purchase</Trans>

    return (
        <Box className={classes.root} display="flex" justifyContent="center">
            <ActionButton
                fullWidth
                variant="roundedDark"
                onClick={onOpenMintDialog}
                disabled={project.complete || project.paused || !project.active}>
                {status}
            </ActionButton>
            <PurchaseDialog project={project} chainId={chainId} open={openMintDialog} onClose={onCloseMintDialog} />
        </Box>
    )
}
