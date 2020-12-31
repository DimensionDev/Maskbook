import { createStyles, makeStyles, Typography, Box } from '@material-ui/core'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'
import type BigNumber from 'bignumber.js'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { formatBalance } from '../../../plugins/Wallet/formatter'
import ITO_ShareImage from '../assets/share_ito'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { useShareLink } from '../../../utils/hooks/useShareLink'

const useStyles = makeStyles((theme) =>
    createStyles({
        shareWrapper: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: theme.spacing(2),
        },
        shareAmount: {
            fontSize: 23,
            marginTop: 140,
            color: '#fff',
        },
        shareToken: {
            fontSize: 23,
            color: '#fff',
        },
        shareText: {
            fontSize: 24,
            color: '#fff',
            marginTop: 80,
        },
        shareButton: {
            width: 'fit-content',
            padding: theme.spacing(1, 8),
            marginTop: theme.spacing(2),
        },
        shareImage: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundAttachment: 'local',
            backgroundPosition: '0',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            background: `url(${ITO_ShareImage})`,
            width: 475,
            height: 341,
            backgroundColor: '#332C61',
            borderRadius: 10,
        },
    }),
)

export interface ShareDialogProps extends withClasses<'root'> {
    token: EtherTokenDetailed | ERC20TokenDetailed
    tokenAmount: BigNumber
    onClose: () => void
}

export function ShareDialog(props: ShareDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), {})
    const { token, tokenAmount } = props
    const postLink = usePostLink()
    const amount = formatBalance(tokenAmount, token.decimals ?? 0)
    const shareLink = useShareLink(
        t('plugin_ito_claim_success_share', {
            link: postLink,
            amount,
            symbol: token.symbol,
        }),
    )
    return (
        <>
            <Box className={classes.shareWrapper}>
                <div className={classes.shareImage}>
                    <Typography variant="body1" className={classes.shareAmount}>
                        {amount}
                    </Typography>
                    <Typography variant="body1" className={classes.shareToken}>
                        {token.symbol}
                    </Typography>
                    <Typography variant="body1" className={classes.shareText}>
                        {t('plugin_ito_congratulations')}
                    </Typography>
                </div>
                <ActionButton
                    onClick={() => {
                        props.onClose()
                        window.open(shareLink, '_blank', 'noopener noreferrer')
                    }}
                    variant="contained"
                    color="primary"
                    className={classes.shareButton}>
                    {t('plugin_ito_dialog_claim_share_title')}
                </ActionButton>
            </Box>
        </>
    )
}
