import { useState } from 'react'
import { Checkbox, FormControlLabel, Link, Typography } from '@mui/material'
import { makeStyles, ActionButton } from '@masknet/theme'
import { FormattedAddress, TokenIcon } from '@masknet/shared'
import { useI18N } from '../../../utils/index.js'
import {
    type ChainId,
    formatEthereumAddress,
    explorerResolver,
    networkResolver,
    type SchemaType,
} from '@masknet/web3-shared-evm'
import { SwapStatus } from './SwapGuide.js'
import { useChainContext } from '@masknet/web3-hooks-base'
import type { FungibleToken } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'

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
    wrapper: {
        padding: theme.spacing(2),
        background: theme.palette.background.default,
        borderRadius: theme.shape.borderRadius,
    },
    tokenWrapper: {
        display: 'flex',
        alignItems: 'center',
        marginTop: theme.spacing(2),
        padding: theme.spacing(2.5, 0, 2.5, 2),
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
        marginLeft: 14,
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
}))

export interface RemindDialogProps extends withClasses<'root'> {
    token: FungibleToken<ChainId, SchemaType>
    chainId: ChainId
    setStatus: (status: SwapStatus) => void
}

export function RemindDialog(props: RemindDialogProps) {
    const { token, chainId, setStatus } = props

    const { t } = useI18N()
    const { classes, cx } = useStyles()
    const [agreeReminder, setAgreeReminder] = useState(false)
    const { networkType } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    return (
        <>
            <section className={classes.wrapper}>
                <Typography variant="body1" className={cx(classes.reminderText, classes.reminderTextFirst)}>
                    {t('plugin_ito_dialog_claim_reminder_text1', {
                        networkType: networkResolver.networkName(networkType),
                    })}
                </Typography>
                <Typography variant="body1" className={classes.reminderText}>
                    {t('plugin_ito_dialog_claim_reminder_text2')}
                </Typography>
                <Typography variant="body1" className={classes.reminderText}>
                    {t('plugin_ito_dialog_claim_reminder_text3')}
                </Typography>
                <Typography variant="body1" className={cx(classes.reminderText, classes.reminderTextLast)}>
                    {t('plugin_ito_dialog_claim_reminder_text4')}
                </Typography>
            </section>
            <section className={cx(classes.wrapper, classes.tokenWrapper)}>
                <TokenIcon
                    className={classes.tokenIcon}
                    chainId={token.chainId}
                    address={token.address}
                    name={token.name}
                    symbol={token.symbol}
                    logoURL={token.logoURL}
                />
                <div className={classes.tokenTextWrapper}>
                    <Typography variant="h5" className={classes.tokenSymbol}>
                        {token.name}
                    </Typography>
                    <Link
                        target="_blank"
                        className={classes.tokenLink}
                        rel="noopener noreferrer"
                        href={explorerResolver.fungibleTokenLink(chainId, token.address)}>
                        <Typography variant="body2">
                            <FormattedAddress address={token.address} size={4} formatter={formatEthereumAddress} /> (
                            {t('plugin_ito_view_on_explorer')})
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
                color="primary"
                fullWidth
                onClick={() => setStatus(SwapStatus.Swap)}
                disabled={!agreeReminder}>
                {t('plugin_ito_continue')}
            </ActionButton>
        </>
    )
}
