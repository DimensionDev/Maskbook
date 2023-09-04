import { memo, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, useTheme } from '@mui/material'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../../utils/index.js'
import { Trans } from 'react-i18next'
import { StyledInput } from '../../../components/StyledInput/index.js'
import { PopupRoutes } from '@masknet/shared-base'
import Services from '#services'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.maskColor.secondaryBottom,
    },
    content: {
        flexGrow: 1,
        padding: '0px 16px',
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    titleWrapper: {
        paddingTop: 8,
        height: 100,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        lineHeight: '120%',
        fontStyle: 'normal',
        fontWeight: 700,
        marginBottom: 12,
    },
    description: {
        marginTop: 8,
        marginBottom: 16,
        textAlign: 'center',
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    strong: {
        color: theme.palette.maskColor.danger,
        fontWeight: 700,
    },
    bottomAction: {
        display: 'flex',
        justifyContent: 'center',
        background: theme.palette.maskColor.secondaryBottom,
        boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.05)',
        position: 'absolute',
        backdropFilter: 'blur(8px)',
        width: '100%',
        bottom: 0,
        zIndex: 100,
        padding: '16px',
        alignItems: 'center',
        alignSelf: 'stretch',
        gap: 6,
    },
    button: {
        flex: '1 0 0',
    },
}))

const ResetWallet = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()
    const theme = useTheme()
    const navigate = useNavigate()
    const [answer, setAnswer] = useState('')
    const disabled = answer !== 'RESET'

    const onBack = useCallback(() => navigate(PopupRoutes.Unlock), [])

    const onConfirm = useCallback(async () => {
        await browser.tabs.create({
            active: true,
            url: browser.runtime.getURL('/dashboard.html#/create-mask-wallet/form?reset=true'),
        })
        await Services.Helper.removePopupWindow()
    }, [])

    return (
        <Box className={classes.container}>
            <Box className={classes.content}>
                <Box className={classes.titleWrapper}>
                    <Typography className={classes.title}>{t('popups_wallet_reset_wallet')}</Typography>
                </Box>
                <Typography className={classes.description}>{t('popups_wallet_reset_wallet_description_1')}</Typography>
                <Typography className={classes.description}>
                    <Trans
                        i18nKey="popups_wallet_reset_wallet_description_2"
                        components={{ strong: <strong className={classes.strong} /> }}
                    />
                </Typography>
                <Typography className={classes.description}>{t('popups_wallet_reset_wallet_description_3')}</Typography>
                <StyledInput
                    type="text"
                    placeholder="RESET"
                    value={answer}
                    onChange={(ev) => {
                        setAnswer(ev.currentTarget.value)
                    }}
                />
            </Box>
            <Box className={classes.bottomAction}>
                <Button onClick={onBack} variant="outlined" className={classes.button}>
                    {t('cancel')}
                </Button>
                <ActionButton
                    variant="contained"
                    color="error"
                    onClick={onConfirm}
                    className={classes.button}
                    disabled={disabled}>
                    {t('confirm')}
                </ActionButton>
            </Box>
        </Box>
    )
})

export default ResetWallet
