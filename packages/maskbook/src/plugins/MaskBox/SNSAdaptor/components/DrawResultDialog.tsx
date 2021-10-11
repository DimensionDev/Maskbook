import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, DialogContent } from '@material-ui/core'
import type { ERC721ContractDetailed } from '@masknet/web3-shared'
import type { BoxInfo } from '../../type'
import { TokenCard } from './TokenCard'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { usePostLink } from '../../../../components/DataSource/usePostInfo'

const useStyles = makeStyles()((theme) => ({
    main: {},
    list: {
        height: 360,
        overflow: 'auto',
        marginBottom: theme.spacing(2),
        display: 'grid',
        flexWrap: 'wrap',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gridGap: theme.spacing(1),
    },
    token: {},
}))

export interface DrawResultDialogProps {
    open: boolean
    onClose: () => void
    boxInfo: BoxInfo
    contractDetailed?: ERC721ContractDetailed
}

export function DrawResultDialog(props: DrawResultDialogProps) {
    const { open, onClose, boxInfo, contractDetailed } = props
    const { classes } = useStyles()

    const postLink = usePostLink()
    const shareSuccessLink = activatedSocialNetworkUI.utils.getShareLinkURL?.(
        `I just claimed a #MaskBox with @realMaskNetwork. Install mask.io and create your own NFT mystery box! \n ${postLink}`,
    )

    const onShare = useCallback(() => {
        onClose()
        window.open(shareSuccessLink, '_blank', 'noopener noreferrer')
    }, [shareSuccessLink])

    if (!contractDetailed) return null

    return (
        <InjectedDialog title="Successful" open={open} onClose={onClose}>
            <DialogContent>
                <Box className={classes.main}>
                    <Box className={classes.list} display="flex" flexWrap="wrap">
                        {boxInfo.tokenIdsPurchased.map((x) => (
                            <Box className={classes.token} key={x} flex={1}>
                                <TokenCard tokenId={x} contractDetailed={contractDetailed} />
                            </Box>
                        ))}
                    </Box>
                    <ActionButton size="medium" fullWidth variant="contained" onClick={onShare}>
                        Share
                    </ActionButton>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
}
