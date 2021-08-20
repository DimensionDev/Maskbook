import { useCallback } from 'react'
import { Box, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { getAssetAsBlobURL, useI18N } from '../../../utils'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { formatBalance, isZero, FungibleTokenDetailed } from '@masknet/web3-shared'
import { useStylesExtends } from '@masknet/shared'
import type { BigNumber } from 'bignumber.js'

const useStyles = makeStyles()((theme) => ({
    shareWrapper: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: theme.spacing(2, 0),
    },
    shareAmount: {
        fontSize: 36,
        marginTop: 90,
        color: '#fff',
    },
    shareToken: {
        marginTop: 5,
        fontSize: 24,
        color: '#fff',
    },
    shareText: {
        marginTop: 20,
        fontSize: 24,
        color: '#fff',
    },
    shareButton: {
        width: 'fit-content',
        backgroundColor: '#FBD363 !important',
        padding: theme.spacing(0.5, 6),
        marginTop: theme.spacing(2),
        minHeight: 28,
    },
    shareImage: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundAttachment: 'local',
        backgroundPosition: '0',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        width: 475,
        height: 341,
        backgroundColor: '#FF5238',
        borderRadius: 10,
    },
}))

export interface ShareDialogProps extends withClasses<'root'> {
    shareSuccessLink: string | undefined
    token: FungibleTokenDetailed
    actualSwapAmount: BigNumber.Value
    poolName: string
    onClose: () => void
}

export function ShareDialog(props: ShareDialogProps) {
    const ShareBackground = getAssetAsBlobURL(new URL('../assets/share-background.jpg', import.meta.url))
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), {})
    const { token, actualSwapAmount, shareSuccessLink, onClose } = props
    const amount = formatBalance(actualSwapAmount, token.decimals)

    const onShareSuccess = useCallback(async () => {
        onClose()
        window.open(shareSuccessLink, '_blank', 'noopener noreferrer')
    }, [shareSuccessLink, onClose])

    return (
        <Box className={classes.shareWrapper}>
            <div
                className={classes.shareImage}
                style={{ backgroundImage: `url(${ShareBackground})`, borderRadius: 12 }}>
                <Typography variant="body1" className={classes.shareAmount}>
                    {amount}
                </Typography>
                <Typography variant="body1" className={classes.shareToken}>
                    {token.symbol}
                </Typography>
                <Typography variant="body1" className={classes.shareText}>
                    {isZero(actualSwapAmount) ? t('plugin_ito_out_of_stock_hit') : t('plugin_ito_congratulations')}
                </Typography>
                {shareSuccessLink ? (
                    <ActionButton
                        onClick={onShareSuccess}
                        variant="contained"
                        color="primary"
                        className={classes.shareButton}>
                        {t('plugin_ito_dialog_swap_share_title')}
                    </ActionButton>
                ) : null}
            </div>
        </Box>
    )
}
