import { Trans } from '@lingui/react/macro'
import { type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNetworks } from '@masknet/web3-hooks-base'
import { DialogContent } from '@mui/material'
import { memo, useState } from 'react'
import { AddCollectibles, SelectNetworkSidebar, type AddCollectiblesProps } from '../../components/index.js'
import { InjectedDialog } from '../../contexts/components/index.js'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: 0,
        display: 'flex',
        gap: theme.spacing(1),
    },
    grid: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(20%, 1fr))',
    },
    sidebar: {
        paddingLeft: 12,
        paddingTop: 12,
        paddingRight: 4,
    },
    form: {
        flexGrow: 1,
    },
}))

interface AddCollectiblesDialogProps<T extends NetworkPluginID = NetworkPluginID> extends AddCollectiblesProps<T> {
    open: boolean
}

export const AddCollectiblesDialog = memo(function AddCollectiblesDialog({
    open,
    pluginID,
    chainId: defaultChainId,
    account,
    onAdd,
}: AddCollectiblesDialogProps) {
    const { classes } = useStyles()

    const [chainId, setChainId] = useState(defaultChainId)
    const allNetworks = useNetworks(pluginID, true)

    return (
        <InjectedDialog
            titleBarIconStyle={'back'}
            open={open}
            onClose={() => onAdd()}
            title={<Trans>Add Collectibles</Trans>}>
            <DialogContent classes={{ root: classes.content }}>
                <SelectNetworkSidebar
                    className={classes.sidebar}
                    chainId={chainId}
                    onChainChange={setChainId}
                    pluginID={pluginID}
                    networks={allNetworks}
                    hideAllButton
                />
                <AddCollectibles
                    className={classes.form}
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
