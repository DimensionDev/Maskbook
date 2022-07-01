import { memo, useState } from 'react'
import { Box, DialogContent, Stack, Typography } from '@mui/material'
import { Masks as MasksIcon } from '@masknet/icons'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { LoadingButton } from '@mui/lab'
import DoneIcon from '@mui/icons-material/Done'
import { useI18N } from '../locales'
import { getMaskColor, makeStyles, MaskColorVar } from '@masknet/theme'
import { InjectedDialog, LoadingAnimation } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
import AbstractTab, { AbstractTabProps } from '../../../components/shared/AbstractTab'
import { formatPersonaFingerprint, PersonaInformation } from '@masknet/shared-base'

const useStyles = makeStyles()((theme) => ({
    persona: {
        padding: theme.spacing(1.7),
        marginBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.default,
        borderRadius: 8,
        alignItems: 'center',
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        marginRight: '4px',
        width: 48,
        height: 48,
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: theme.palette.text.primary,
        fontWeight: 500,
    },
    identifier: {
        fontSize: 12,
        color: theme.palette.text.primary,
        display: 'flex',
        alignItems: 'center',
        wordBreak: 'break-all',
    },
    subTitle: {
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 600,
        marginBottom: 11.5,
        color: theme.palette.text.primary,
    },
    done: {
        background: '#60DFAB !important',
        color: `${MaskColorVar.white} !important`,
    },
    loadingIcon: {
        position: 'relative',
        right: -6,
    },
    error: {
        color: getMaskColor(theme).redMain,
        paddingLeft: theme.spacing(0.5),
        borderLeft: `solid 2px ${getMaskColor(theme).redMain}`,
    },
}))

interface BindPanelUIProps {
    title: string
    open: boolean
    currentPersona: PersonaInformation
    signature: {
        persona: {
            value?: string
            loading: boolean
        }
        wallet: {
            value?: string
            loading: boolean
        }
    }
    isBound: boolean
    isCurrentAccount: boolean
    onClose(): void
    onPersonaSign(): void
    onWalletSign(): void
}

const SUPPORTED_PLUGINS = [NetworkPluginID.PLUGIN_EVM]

export enum DialogTabs {
    persona = 0,
    wallet = 1,
}

export const UnbindPanelUI = memo<BindPanelUIProps>(
    ({ onPersonaSign, onWalletSign, currentPersona, signature, isBound, title, onClose, open, isCurrentAccount }) => {
        const t = useI18N()
        const { classes } = useStyles()
        const pluginId = useCurrentWeb3NetworkPluginID()
        const isSupported = SUPPORTED_PLUGINS.includes(pluginId)

        const isWalletSigned = !!signature.wallet.value
        const isPersonaSigned = !!signature.persona.value
        const state = useState(DialogTabs.persona)

        const tabProps: AbstractTabProps = {
            tabs: [
                {
                    label: t.persona(),
                    children: (
                        <Box mt={3}>
                            <Typography className={classes.subTitle}>{t.persona()}</Typography>
                            <Stack direction="row" className={classes.persona}>
                                <div className={classes.iconContainer}>
                                    <MasksIcon style={{ fontSize: '48px' }} />
                                </div>
                                <div>
                                    <Typography className={classes.name}>{currentPersona?.nickname}</Typography>
                                    <Typography className={classes.identifier}>
                                        {formatPersonaFingerprint(currentPersona?.identifier.rawPublicKey ?? '', 10)}
                                    </Typography>
                                </div>
                            </Stack>
                            {!isSupported && (
                                <Typography className={classes.error}>{t.unsupported_network()}</Typography>
                            )}
                            <Typography my={3}>{t.unbind_persona_tip()}</Typography>
                            <LoadingButton
                                fullWidth
                                disabled={!isBound || !!isPersonaSigned || !isSupported}
                                classes={{
                                    loadingIndicatorEnd: classes.loadingIcon,
                                }}
                                loadingPosition="end"
                                className={isPersonaSigned ? classes.done : ''}
                                loading={signature.persona.loading}
                                onClick={onPersonaSign}
                                endIcon={isPersonaSigned ? <DoneIcon sx={{ color: MaskColorVar.white }} /> : null}
                                loadingIndicator={<LoadingAnimation />}>
                                {isPersonaSigned ? t.done() : t.persona_sign()}
                            </LoadingButton>
                        </Box>
                    ),
                    sx: { p: 0 },
                },
                {
                    label: t.wallet(),
                    children: (
                        <Box mt={3}>
                            <Typography className={classes.subTitle}>{t.wallet()}</Typography>
                            <WalletStatusBox disableChange />
                            {!isSupported && (
                                <Typography className={classes.error}>{t.unsupported_network()}</Typography>
                            )}
                            {!isCurrentAccount && (
                                <Typography className={classes.error}>
                                    {t.unbind_wallet_same_account_error()}
                                </Typography>
                            )}
                            <Typography my={3}>{t.unbind_wallet_tip()}</Typography>
                            <LoadingButton
                                fullWidth
                                classes={{
                                    loadingIndicatorEnd: classes.loadingIcon,
                                }}
                                loadingPosition="end"
                                disabled={!isCurrentAccount || !!isWalletSigned || !isSupported}
                                className={isWalletSigned ? classes.done : ''}
                                loading={signature.wallet.loading}
                                onClick={onWalletSign}
                                endIcon={isWalletSigned ? <DoneIcon sx={{ color: MaskColorVar.white }} /> : null}
                                loadingIndicator={<LoadingAnimation />}>
                                {isWalletSigned ? t.done() : t.wallet_sign()}
                            </LoadingButton>
                        </Box>
                    ),
                    sx: { p: 0 },
                },
            ],
            state,
        }

        return (
            <InjectedDialog open={open} title={title} onClose={onClose}>
                <DialogContent style={{ padding: '24px' }}>
                    <AbstractTab height="auto" {...tabProps} />
                </DialogContent>
            </InjectedDialog>
        )
    },
)
