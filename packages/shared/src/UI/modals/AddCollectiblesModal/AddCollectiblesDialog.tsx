import { type NetworkPluginID } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type NonFungibleTokenContract } from '@masknet/web3-shared-base'
import { DialogContent } from '@mui/material'
import { memo } from 'react'
import { useSharedI18N } from '../../../locales/index.js'
import { InjectedDialog } from '../../contexts/components/index.js'
import { AddCollectibles } from '../../components/index.js'

const useStyles = makeStyles()(() => ({
    content: {
        padding: 0,
    },
    grid: {
        gridTemplateColumns: 'repeat(auto-fill, minmax(20%, 1fr))',
    },
}))

export interface AddCollectiblesDialogProps<T extends NetworkPluginID = NetworkPluginID> {
    open: boolean
    pluginID?: T
    chainId?: Web3Helper.Definition[T]['ChainId']
    /**
     * Specified account.
     * For example, in PFP, we can add collectibles from verified wallets if no wallet connected.
     */
    account?: string
    onClose(
        result?: [
            contract: NonFungibleTokenContract<
                Web3Helper.Definition[T]['ChainId'],
                Web3Helper.Definition[T]['SchemaType']
            >,
            tokenIds: string[],
        ],
    ): void
}

export const AddCollectiblesDialog = memo(function AddCollectiblesDialog({
    open,
    pluginID,
    chainId,
    account,
    onClose,
}: AddCollectiblesDialogProps) {
    const t = useSharedI18N()
    const { classes } = useStyles()

    return (
        <InjectedDialog titleBarIconStyle={'back'} open={open} onClose={() => onClose()} title={t.add_collectibles()}>
            <DialogContent classes={{ root: classes.content }}>
                <AddCollectibles
                    pluginID={pluginID}
                    chainId={chainId}
                    account={account}
                    onClose={onClose}
                    classes={{ grid: classes.grid }}
                />
            </DialogContent>
        </InjectedDialog>
    )
})
