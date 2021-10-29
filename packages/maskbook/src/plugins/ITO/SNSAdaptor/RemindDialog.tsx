import { useState } from 'react'
import classNames from 'classnames'
import { Checkbox, FormControlLabel, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { FormattedAddress, TokenIcon, useStylesExtends } from '@masknet/shared'
import { useI18N } from '../../../utils'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import {
    ChainId,
    FungibleTokenDetailed,
    resolveLinkOnExplorer,
    resolveNetworkName,
    useERC20TokenDetailedFromTokenLists,
    useNetworkType,
} from '@masknet/web3-shared-evm'
import { SwapStatus } from './SwapGuide'
import { getMaskColor } from '@masknet/theme'
import urlcat from 'urlcat'

const useStyles = makeStyles()((theme) => ({
    reminderText: {
        color: '#FF5555',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1.5),
    },
    reminderTextFirst: {
        marginTop: 0,
    },
    reminderTextLast: {
        marginBottom: 0,
    },
    docBox: {
        overflow: 'scroll',
    },
    center: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1.2rem',
    },
    bigCenter: {
        fontSize: '1.5rem',
    },
    bold: {
        fontWeight: 'bold',
        fontSize: '1.1rem',
    },
    wrapper: {
        padding: theme.spacing(2),
        background: getMaskColor(theme).twitterBackground,
        borderRadius: theme.shape.borderRadius,
    },
    tokenWrapper: {
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(2),
        padding: theme.spacing(2.5, 0, 3.5, 2),
    },
    tokenIcon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 39,
        height: 39,
    },
    tokenTextWrapper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 45,
        marginLeft: '1rem',
    },
    tokenSymbol: {
        color: theme.palette.mode === 'dark' ? '#fff' : '#15181B',
        fontSize: 18,
        cursor: 'default',
    },
    tokenLink: {
        color: '#6F767C',
        fontSize: 15,
        '&:hover': {
            textDecoration: 'none',
        },
    },
    confirmWrapper: {
        marginTop: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
    },
    confirmText: {
        color: '#6F767C',
    },
    button: {
        width: 'fit-content',
        margin: '0 auto',
        padding: '6px 48px',
    },
    table: {
        border: '1px solid #FF5555',
        color: '#FF5555',
    },
    cell: {
        width: '50%',
        border: '1px solid #FF5555',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
    },
    moreCell: {
        flexDirection: 'column',
    },
    column: {
        width: '100%',
        display: 'flex',
    },
    lowSpacing: {
        marginTop: 4,
        marginBottom: 4,
    },
}))

export interface RemindDialogProps extends withClasses<'root'> {
    token: FungibleTokenDetailed
    chainId: ChainId
    setStatus: (status: SwapStatus) => void
}

export function RemindDialog(props: RemindDialogProps) {
    const { token, chainId, setStatus } = props

    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), {})
    const [agreeReminder, setAgreeReminder] = useState(false)
    const networkType = useNetworkType()
    const { tokensDetailed } = useERC20TokenDetailedFromTokenLists(token.address)

    return (
        <>
            <section className={classes.wrapper}>
                <Typography variant="body1" className={classNames(classes.reminderText, classes.reminderTextFirst)}>
                    {t('plugin_ito_dialog_claim_reminder_text1', {
                        networkType: resolveNetworkName(networkType),
                    })}
                </Typography>
                <Typography variant="body1" className={classes.reminderText}>
                    {t('plugin_ito_dialog_claim_reminder_text2')}
                </Typography>
                <Typography variant="body1" className={classes.reminderText}>
                    {t('plugin_ito_dialog_claim_reminder_text3')}
                </Typography>
                <Typography variant="body1" className={classNames(classes.reminderText, classes.reminderTextLast)}>
                    {t('plugin_ito_dialog_claim_reminder_text4')}
                </Typography>
            </section>
            <section className={classNames(classes.wrapper, classes.tokenWrapper)}>
                <TokenIcon
                    address={token.address}
                    classes={{ icon: classes.tokenIcon }}
                    logoURI={tokensDetailed?.logoURI}
                />
                <div className={classes.tokenTextWrapper}>
                    <Typography variant="h5" className={classes.tokenSymbol}>
                        {token.name}
                    </Typography>

                    <Link
                        target="_blank"
                        className={classes.tokenLink}
                        rel="noopener noreferrer"
                        href={urlcat(resolveLinkOnExplorer(chainId), '/token/:address', { address: token.address })}>
                        <Typography variant="body2">
                            <FormattedAddress address={token.address} size={4} /> ({t('plugin_ito_view_on_explorer')})
                        </Typography>
                    </Link>
                </div>
            </section>
            <section className={classes.confirmWrapper}>
                <FormControlLabel
                    control={
                        <Checkbox
                            color="primary"
                            checked={agreeReminder}
                            onChange={(event) => {
                                setAgreeReminder(event.target.checked)
                            }}
                        />
                    }
                    label={t('plugin_ito_dialog_claim_reminder_agree')}
                />
            </section>
            <ActionButton
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={() => setStatus(SwapStatus.Swap)}
                disabled={!agreeReminder}>
                {t('plugin_ito_continue')}
            </ActionButton>
        </>
    )
}
