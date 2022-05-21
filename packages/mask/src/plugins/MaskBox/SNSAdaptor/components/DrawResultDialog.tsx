import { difference } from 'lodash-unified'
import { useContainer } from 'unstated-next'
import { makeStyles } from '@masknet/theme'
import { Box, DialogContent } from '@mui/material'
import type { BoxInfo } from '../../type'
import { TokenCard } from './TokenCard'
import { InjectedDialog } from '@masknet/shared'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { usePostLink } from '../../../../components/DataSource/usePostInfo'
import { Context } from '../../hooks/useContext'
import type { NonFungibleTokenContract } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { Icon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => ({
    main: { padding: 8 },
    list: {
        height: 360,
        overflow: 'auto',
        marginBottom: theme.spacing(2),
        display: 'grid',
        flexWrap: 'wrap',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gridGap: theme.spacing(1),
        padding: 8,
    },
    token: {},
}))

export interface DrawResultDialogProps {
    open: boolean
    onClose: () => void
    boxInfo: BoxInfo
    contractDetailed?: NonFungibleTokenContract<ChainId, SchemaType>
}

export function DrawResultDialog(props: DrawResultDialogProps) {
    const { open, onClose, boxInfo, contractDetailed } = props
    const { classes } = useStyles()

    const { lastPurchasedTokenIds } = useContainer(Context)

    const postLink = usePostLink()
    const shareText = `I just claimed a #MaskBox with @realMaskNetwork. Install mask.io and create your own NFT mystery box! \n ${postLink}`

    const onShare = () => {
        onClose()
        activatedSocialNetworkUI.utils.share?.(shareText)
    }

    if (!contractDetailed) return null

    return (
        <InjectedDialog title="Successful" open={open} onClose={onClose}>
            <DialogContent>
                <Box className={classes.main}>
                    <Box className={classes.list} display="flex" flexWrap="wrap">
                        {difference(boxInfo.tokenIdsPurchased, lastPurchasedTokenIds).map((x, i) => (
                            <Box className={classes.token} key={x} flex={1}>
                                <TokenCard tokenId={x} contractDetailed={contractDetailed} renderOrder={i} />
                            </Box>
                        ))}
                    </Box>
                    <ActionButton
                        startIcon={<Icon type="shared" size={18} />}
                        size="medium"
                        fullWidth
                        onClick={onShare}>
                        Share
                    </ActionButton>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
}
