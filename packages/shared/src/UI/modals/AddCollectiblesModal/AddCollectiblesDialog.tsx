import { type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { DialogContent } from '@mui/material'
import { memo } from 'react'
import { InjectedDialog } from '../../contexts/components/index.js'
import { AddCollectibles, type AddCollectiblesProps } from '../../components/index.js'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()(() => ({
    content: {
        padding: 0,
    },
    grid: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(20%, 1fr))',
    },
}))

interface AddCollectiblesDialogProps<T extends NetworkPluginID = NetworkPluginID> extends AddCollectiblesProps<T> {
    open: boolean
}

export const AddCollectiblesDialog = memo(function AddCollectiblesDialog({
    open,
    pluginID,
    chainId,
    account,
    onAdd,
}: AddCollectiblesDialogProps) {
    const { classes } = useStyles()

    return (
        <InjectedDialog titleBarIconStyle={'back'} open={open} onClose={() => onAdd()} title={<Trans>Add NFTs</Trans>}>
            <DialogContent classes={{ root: classes.content }}>
                <AddCollectibles
                    pluginID={pluginID}
                    chainId={chainId}
                    account={account}
                    onAdd={onAdd}
                    classes={{ grid: classes.grid }}
                />
            </DialogContent>
        </InjectedDialog>
    )
})
