import { memo, useCallback } from 'react'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { AccountAvatar } from '../components/AccountAvatar/index.js'
import { MaskSharedTrans } from '../../../../shared-ui/index.js'
import { useNavigate } from 'react-router-dom'
import type { BindingProof, ProfileAccount } from '@masknet/shared-base'

import { WalletList } from '../../../components/WalletSettingList/index.js'
import { BottomController } from '../../../components/BottomController/index.js'
import { Trans } from '@lingui/macro'

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
        toggleUnlisted,
        listingAddresses,
        loading,
        onSubmit,
        submitting,
    }) => {
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
                        {account.is_valid ?
                            <Trans>
                                Display the following address on your Web3 profile page and use it to receive tips.
                            </Trans>
                        : isSupportNextDotID ?
                            <Trans>
                                After connecting and verifying your persona, you can set up associated address for
                                displaying your web3 footprints or receiving tips.
                            </Trans>
                            // eslint-disable-next-line react/naming-convention/component-name
                        :   <MaskSharedTrans.popups_other_social_accounts_tips
                                components={{ strong: <strong />, br: <br /> }}
                            />
                        }
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

                {isSupportNextDotID ?
                    <BottomController>
                        <Button variant="outlined" fullWidth onClick={handleBack}>
                            <Trans>Back</Trans>
                        </Button>
                        <ActionButton loading={submitting} fullWidth onClick={account.is_valid ? onSubmit : onVerify}>
                            {account.is_valid ?
                                <Trans>Save</Trans>
                            :   <Trans>Verify Account</Trans>}
                        </ActionButton>
                    </BottomController>
                :   null}
            </Box>
        )
    },
)
