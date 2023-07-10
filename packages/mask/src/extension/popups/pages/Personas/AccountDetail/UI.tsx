import { memo, useCallback } from 'react'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { AccountAvatar } from '../components/AccountAvatar/index.js'
import { useI18N } from '../../../../../utils/index.js'
import { useNavigate } from 'react-router-dom'
import { Trans } from 'react-i18next'
import type { BindingProof, ProfileAccount } from '@masknet/shared-base'

import { WalletList } from '../../../components/WalletSettingList/index.js'
import { BottomController } from '../../../components/BottomController/index.js'

const useStyles = makeStyles()((theme) => ({
    avatar: {
        boxShadow: '0px 6px 12px 0px rgba(120, 120, 120, 0.20)',
        backdropFilter: 'blur(8px)',
    },
    account: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    identity: {
        fontSize: 14,
        fontWeight: 700,
        marginTop: theme.spacing(1.5),
        lineHeight: '18px',
    },
    tips: {
        fontSize: 14,
        lineHeight: '18px',
        marginTop: theme.spacing(2),
    },
}))

interface AccountDetailUIProps {
    account: ProfileAccount
    onVerify: () => void
    isSupportNextDotID: boolean
    walletProofs?: BindingProof[]
    listingAddresses: string[]
    isClean: boolean
    toggleUnlisted: (identity: string, address: string) => void
    loading: boolean
    onSubmit: () => void
    submitting: boolean
}

export const AccountDetailUI = memo<AccountDetailUIProps>(
    ({
        account,
        onVerify,
        isSupportNextDotID,
        walletProofs,
        isClean,
        toggleUnlisted,
        listingAddresses,
        loading,
        onSubmit,
        submitting,
    }) => {
        const { t } = useI18N()
        const { classes } = useStyles()
        const navigate = useNavigate()
        const handleBack = useCallback(() => navigate(-1), [])

        return (
            <Box height="100%" pb={9}>
                <Box pt={2} px={2} display="flex" flexDirection="column" height="100%">
                    <Box className={classes.account}>
                        <AccountAvatar
                            avatar={account.avatar}
                            network={account.identifier.network}
                            isValid={account.is_valid}
                            classes={{ avatar: classes.avatar }}
                        />
                        <Typography className={classes.identity}>@{account.identity}</Typography>
                    </Box>
                    <Typography className={classes.tips}>
                        {account.is_valid ? (
                            t('popups_display_web3_address_tips')
                        ) : isSupportNextDotID ? (
                            t('popups_verify_account_tips')
                        ) : (
                            <Trans i18nKey="popups_other_social_accounts_tips" components={{ strong: <strong /> }} />
                        )}
                    </Typography>

                    <WalletList
                        loading={loading}
                        walletProofs={walletProofs}
                        listingAddresses={listingAddresses}
                        toggleUnlisted={toggleUnlisted}
                        isValid={isSupportNextDotID ? account.is_valid : false}
                        identity={account.identity}
                    />
                </Box>

                {isSupportNextDotID ? (
                    <BottomController>
                        <Button variant="outlined" fullWidth onClick={handleBack}>
                            {t('back')}
                        </Button>
                        <ActionButton
                            loading={submitting}
                            fullWidth
                            onClick={account.is_valid ? onSubmit : onVerify}
                            disabled={account.is_valid ? isClean || loading : submitting}>
                            {t(account.is_valid ? 'save' : 'popups_verify_account')}
                        </ActionButton>
                    </BottomController>
                ) : null}
            </Box>
        )
    },
)
