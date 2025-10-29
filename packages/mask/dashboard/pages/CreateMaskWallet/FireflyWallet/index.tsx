import Services from '#services'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { makeStyles } from '@masknet/theme'
import { Typography } from '@mui/material'
import { memo } from 'react'
import { PrimaryButton } from '../../../components/PrimaryButton/index.js'
import { SetupFrameController } from '../../../components/SetupFrame/index.js'
import { useAsyncFn } from 'react-use'
import { PopupRoutes } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        flex: 1,
    },
    title: {
        fontSize: 30,
        margin: '12px 0',
        lineHeight: '120%',
        color: theme.palette.maskColor.main,
    },
    tips: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    bold: {
        fontWeight: 700,
    },
    notes: {
        display: 'flex',
        padding: theme.spacing(3, 2),
        alignItems: 'center',
        alignContent: 'stretch',
        borderRadius: 12,
        marginTop: theme.spacing(3),
        background:
            theme.palette.mode === 'dark' ?
                'linear-gradient(180deg, rgba(255, 255, 255, 0.10) 0%, rgba(255, 255, 255, 0.00) 100%)'
            :   'linear-gradient(180deg, rgba(255, 255, 255, 0.00) 0%, #FFF 100%), linear-gradient(90deg, rgba(98, 126, 234, 0.20) 0%, rgba(59, 153, 252, 0.20) 100%)',
    },
    fireflyLogo: {
        width: 120,
        height: 120,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        listStyle: 'none',
        color: theme.palette.maskColor.main,
        fontSize: '13px',
        lineHeight: '18px',
        fontWeight: 400,
        paddingLeft: 16,
        margin: 0,
        '& li': {
            marginBottom: 12,
            listStyle: 'disc',
        },
    },
}))

export const Component = memo(function CreateWalletForm() {
    const { classes, cx } = useStyles()
    const [{ loading }, request] = useAsyncFn(async () => {
        try {
            const data = await Services.Helper.loginFireflyViaTwitter()
            console.log('login data', data)
            if (!data) return
            await Services.Helper.openPopupWindow(PopupRoutes.CreateWallet, undefined)
        } catch (err) {
            console.log('login error', err)
        }
    }, [])

    return (
        <div className={classes.container}>
            <Typography className={cx(classes.title, classes.bold)}>
                <Trans>Create a Firefly.social wallet</Trans>
            </Typography>
            <Typography className={classes.tips}>
                <Trans>Create a Firefly.social wallet using an X account</Trans>
            </Typography>
            <div className={classes.notes}>
                <div className={classes.fireflyLogo}>
                    <Icons.Firefly size={60} />
                </div>
                <ul className={classes.list}>
                    <li>
                        Firefly.social wallet connects your Web3 identity to the entire Mask Network and firefly.social
                        ecosystem.
                    </li>
                    <li>
                        With a single wallet, you can like, post, collect, and transfer across multiple Web3 social
                        platforms — all in one seamless flow.
                    </li>
                    <li>
                        Log in securely in seconds with your X account and unify your EVM, Solana, and other chain
                        identities effortlessly.
                    </li>
                    <li>
                        Firefly.social wallet isn’t just a wallet — it’s your gateway to social, identity, and ownership
                        in Web3.
                    </li>
                </ul>
            </div>
            <SetupFrameController>
                <PrimaryButton
                    width="125px"
                    size="large"
                    color="primary"
                    className={classes.bold}
                    startIcon={<Icons.TwitterX size={20} />}
                    loading={loading}
                    onClick={request}>
                    <Trans>Continue</Trans>
                </PrimaryButton>
            </SetupFrameController>
        </div>
    )
})
