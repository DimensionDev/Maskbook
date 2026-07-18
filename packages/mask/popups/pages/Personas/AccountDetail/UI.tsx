import { Trans } from '@lingui/react/macro'
import type { ProfileAccount } from '@masknet/shared-base'
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
}

export const AccountDetailUI = memo<AccountDetailUIProps>(function AccountDetailUI({ account }) {
    const { classes } = useStyles()
    const navigate = useNavigate()
    const handleBack = useCallback(() => navigate(-1), [])

    return (
        <Box sx={{ height: '100%', pb: 9 }}>
            <Box sx={{ pt: 2, px: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box className={classes.account}>
                    <AccountAvatar
                        avatar={account.avatar}
                        network={account.identifier.network}
                        classes={{ avatar: classes.avatar }}
                    />
                    <Typography className={classes.identity}>@{account.nickname}</Typography>
                </Box>
                <Typography className={classes.tips}>
                    <Trans>Display the following address on your Web3 profile page and use it to receive tips.</Trans>
                </Typography>

                <WalletList />
            </Box>

            <BottomController>
                <Button variant="outlined" fullWidth onClick={handleBack}>
                    <Trans>Back</Trans>
                </Button>
            </BottomController>
        </Box>
    )
})
