import { makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { CurrentWalletBox } from './CurrentWalletBox'
import {
    step1ActiveIcon,
    stepSuccessIcon,
    dividerDisableIcon,
    dividerSuccessIcon,
    dividerActiveIcon,
    step2DisableIcon,
    step2ActiveIcon,
} from './constants'
import { ImageIcon } from '@masknet/shared'
import { Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import classNames from 'classnames'
import { useEffect } from 'react'
import { useI18N } from '../../../utils'
import type { Web3Plugin } from '@masknet/plugin-infra/src/web3-types'
import type { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-evm'
import { LoadingButton } from '@mui/lab'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    stepBox: {
        marginTop: 12,
        display: 'flex',
        alignItems: 'flex-start',
        flexGrow: 'grow',
    },
    stepLine: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginRight: 12,
    },
    stepRowBox: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 200,
    },
    stepRow: {
        color: theme.palette.text.secondary,
        minHeight: 100,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: 700,
    },

    stepIntro: {
        marginTop: 12,
        fontSize: 12,
    },
    divider: {
        margin: '4px 0',
    },
    actionBox: {
        width: 'calc(100% - 32px)',
        gap: 12,
        position: 'absolute',
        bottom: 16,
        display: 'flex',
        alignItems: 'center',
    },
    roundBtn: {
        borderRadius: 99,
    },
    disableBtn: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
    hasBound: {
        fontSize: 14,
        width: '100%',
        textAlign: 'left',
        color: theme.palette.error.main,
    },
}))

export enum SignSteps {
    Ready = 0,
    FirstStepDone = 1,
    SecondStepDone = 2,
}

interface StepsProps {
    step: SignSteps
    nickName?: string
    wallet: Web3Plugin.ConnectionResult<ChainId, NetworkType, ProviderType>
    disableConfirm?: boolean
    confirmLoading: boolean
    notInPop?: boolean
    notEvm?: boolean
    account?: string
    notConnected?: boolean
    isBound?: boolean
    walletName?: string
    changeWallet: () => void
    onConfirm: () => void
    onCustomCancel?: () => void
}

export function Steps(props: StepsProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const navigate = useNavigate()
    const {
        changeWallet,
        nickName,
        wallet,
        disableConfirm,
        onConfirm,
        step,
        confirmLoading,
        notInPop,
        notEvm,
        isBound,
        notConnected,
        walletName,
        onCustomCancel,
    } = props
    const { showSnackbar } = usePopupCustomSnackbar()

    const stepIconMap = {
        [SignSteps.Ready]: {
            step1: step1ActiveIcon,
            divider: dividerDisableIcon,
            step2: step2DisableIcon,
        },
        [SignSteps.FirstStepDone]: {
            step1: stepSuccessIcon,
            divider: dividerActiveIcon,
            step2: step2ActiveIcon,
        },
        [SignSteps.SecondStepDone]: {
            step1: stepSuccessIcon,
            divider: dividerSuccessIcon,
            step2: stepSuccessIcon,
        },
    }

    useEffect(() => {
        if (disableConfirm && !notInPop) {
            showSnackbar(t('wallet_verify_has_bound'), { variant: 'error' })
        }
    }, [disableConfirm])

    const onCancel = () => {
        if (notInPop && onCustomCancel !== undefined) {
            onCustomCancel()
            return
        }
        navigate(-1)
    }

    return (
        <div className={classes.container}>
            <CurrentWalletBox notInPop={notInPop} walletName={walletName} wallet={wallet} changeWallet={changeWallet} />
            {notEvm && <Typography className={classes.hasBound}>{t('plugin_tips_not_evm_alert')}</Typography>}
            {isBound && <Typography className={classes.hasBound}>{t('wallet_verify_has_bound')}</Typography>}
            {notConnected && (
                <Typography className={classes.hasBound} style={{ textAlign: 'center' }}>
                    {t('wallet_verify_empty_alert')}
                </Typography>
            )}
            {!notConnected && (
                <div className={classes.stepBox}>
                    <div className={classes.stepLine}>
                        <ImageIcon size={22} icon={stepIconMap[step].step1} />
                        <img className={classes.divider} src={stepIconMap[step].divider.toString()} />
                        <ImageIcon size={22} icon={stepIconMap[step].step2} />
                    </div>
                    <div className={classes.stepRowBox}>
                        <div className={classes.stepRow}>
                            <Typography className={classes.stepTitle}>
                                {t('wallet_verify_persona_name', {
                                    personaName: nickName ?? 'Persona Name',
                                })}
                            </Typography>
                            <Typography className={classes.stepIntro}>
                                {t('wallet_verify_persona_sign_intro')}
                            </Typography>
                        </div>
                        <div className={classes.stepRow}>
                            <Typography className={classes.stepTitle}>{walletName ?? t('wallet')} Sign</Typography>
                            <Typography className={classes.stepIntro}>
                                {t('waller_verify_wallet_sign_intro')}
                            </Typography>
                        </div>
                    </div>
                </div>
            )}

            <div className={classes.actionBox}>
                <Button
                    className={classes.roundBtn}
                    variant="outlined"
                    size="large"
                    fullWidth
                    color="primary"
                    onClick={onCancel}>
                    {t('cancel')}
                </Button>
                <LoadingButton
                    loading={confirmLoading}
                    className={disableConfirm ? classNames(classes.roundBtn, classes.disableBtn) : classes.roundBtn}
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={onConfirm}>
                    {disableConfirm ? t('wallet_verify_persona_sign') : step === 2 ? t('done') : t('confirm')}
                </LoadingButton>
            </div>
        </div>
    )
}
