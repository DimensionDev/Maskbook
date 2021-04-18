import { useCallback } from 'react'
import { makeStyles, createStyles, Box } from '@material-ui/core'
import { CollectibleState } from '../hooks/useCollectibleState'
import { useI18N } from '../../../utils/i18n-next-ui'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { PluginCollectibleRPC } from '../messages'
import { useAccount } from '../../../web3/hooks/useAccount'
import { toAsset } from '../helpers'

const useStyles = makeStyles((theme) => {
    return createStyles({
        button: {
            marginLeft: theme.spacing(1),
        },
    })
})

export interface ListingTabActionBarProps {}

export function ListingTabActionBar(props: ListingTabActionBarProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const account = useAccount()
    const { asset, token } = CollectibleState.useContainer()

    const onMakeListing = useCallback(async () => {
        console.log(asset)
        console.log(token)

        if (!token) return
        if (!asset.value) return

        try {
            const response = await PluginCollectibleRPC.createBuyOrder({
                asset: toAsset({
                    tokenId: token.tokenId,
                    tokenAddress: token.contractAddress,
                    schemaName: asset.value?.assetContract?.schemaName,
                }),
                accountAddress: account,
                startAmount: 0.1,
            })
            console.log(response)
        } catch (e) {
            console.log(e)
        }
    }, [account, asset, token])

    return (
        <Box sx={{ padding: 2 }} display="flex" justifyContent="flex-end">
            <ActionButton className={classes.button} color="primary" variant="contained" onClick={onMakeListing}>
                {t('plugin_collectible_sell')}
            </ActionButton>
        </Box>
    )
}
