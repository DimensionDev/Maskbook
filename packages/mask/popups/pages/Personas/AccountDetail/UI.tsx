import { Trans } from '@lingui/react/macro'
import type { BindingProof, EnhanceableSite, ProfileAccount } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Button, Typography } from '@mui/material'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BottomController } from '../../../components/BottomController/index.js'
import { WalletList } from '../../../components/WalletSettingList/index.js'
import { AccountAvatar } from '../components/AccountAvatar/index.js'

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
    isSupportNextDotID: boolean
    walletProofs?: BindingProof[]
}

export const AccountDetailUI = memo<AccountDetailUIProps>(function AccountDetailUI({
    account,
    isSupportNextDotID,
    walletProofs,
}) {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const handleBack = useCallback(() => navigate(-1), [])

    return (
        <Box height="100%" pb={9}>
            <Box pt={2} px={2} display="flex" flexDirection="column" height="100%">
                <Box className={classes.account}>
                    <AccountAvatar
                        avatar={account.avatar}
                        network={account.identifier.network as EnhanceableSite}
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
                    :   <Trans>
                            Other social networking platforms, such as <strong>Instagram, </strong>
                            <strong>Facebook,</strong> and <strong>Minds,</strong> do not have a verified relationship
                            like X's Next.ID verified connection.
                            <br />
                            <br />
                            When connecting a persona with an account on these platforms, they only support sending
                            encrypted posts.
                        </Trans>
                    }
                </Typography>

                <WalletList walletProofs={walletProofs} isValid={isSupportNextDotID ? account.is_valid : false} />
            </Box>

            {isSupportNextDotID ?
                <BottomController>
                    <Button variant="outlined" fullWidth onClick={handleBack}>
                        <Trans>Back</Trans>
                    </Button>
                </BottomController>
            :   null}
        </Box>
    )
})
