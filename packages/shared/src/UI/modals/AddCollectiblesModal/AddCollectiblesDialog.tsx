import { Trans } from '@lingui/react/macro'
import type { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useNetworks } from '@masknet/web3-hooks-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { memo, useMemo, useState } from 'react'
import { AddCollectibles, SelectNetworkSidebar, type AddCollectiblesProps } from '../../components/index.js'
import { InjectedDialog } from '../../contexts/components/index.js'
import type { Web3Helper } from '@masknet/web3-helpers'

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
    chainWhiteList?: Web3Helper.ChainIdAll[]
}

export const AddCollectiblesDialog = memo(function AddCollectiblesDialog({
    open,
    pluginID,
    chainId: defaultChainId,
    account,
    chainWhiteList,
    onAdd,
}: AddCollectiblesDialogProps) {
    const { classes } = useStyles()

    const [chainId, setChainId] = useState(defaultChainId)
    const allNetworks = useNetworks(pluginID, true)
    const networks = useMemo(() => {
        if (!chainWhiteList?.length) return allNetworks
        return allNetworks.filter((x) => chainWhiteList.includes(x.chainId as ChainId))
    }, [allNetworks, chainWhiteList])

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
                    networks={networks}
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
