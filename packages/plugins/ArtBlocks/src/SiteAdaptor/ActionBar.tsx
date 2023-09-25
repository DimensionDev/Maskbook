import { Box } from '@mui/material'
import { makeStyles, ActionButton } from '@masknet/theme'
import { useControlledDialog } from '@masknet/shared-base-ui'
import type { ChainId } from '@masknet/web3-shared-evm'
import { PurchaseDialog } from './PurchaseDialog.js'
import type { Project } from '../types.js'
import { useArtBlocksTrans } from '../locales/index.js'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            flex: 1,
        },
    }
})

export interface ActionBarProps {
    project: Project
    chainId: ChainId
}

export function ActionBar(props: ActionBarProps) {
    const t = useArtBlocksTrans()
    const { classes } = useStyles()
    const { project, chainId } = props

    const { open: openMintDialog, onClose: onCloseMintDialog, onOpen: onOpenMintDialog } = useControlledDialog()

    const status = !project.active
        ? t.plugin_artblocks_not_active()
        : project.complete
        ? t.plugin_artblocks_completed()
        : project.paused
        ? t.plugin_artblocks_paused()
        : t.plugin_artblocks_purchase()

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
