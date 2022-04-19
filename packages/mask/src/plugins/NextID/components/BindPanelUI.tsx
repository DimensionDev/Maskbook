import { memo } from 'react'
import { Box, DialogContent, Stack, Typography } from '@mui/material'
import { Icon } from '@masknet/icons'
import { WalletStatusBox } from '../../../components/shared/WalletStatusBox'
import { LoadingButton } from '@mui/lab'
import DoneIcon from '@mui/icons-material/Done'
import { useI18N } from '../locales'
import { getMaskColor, makeStyles, MaskColorVar } from '@masknet/theme'
import { InjectedDialog, LoadingAnimation } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useCurrentWeb3NetworkPluginID } from '@masknet/plugin-infra/web3'
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
        color: theme.palette.text.primary,
    },
    deneText: {
        color: '#60DFAB',
    },
    done: {
        background: '#60DFAB !important',
        color: `${MaskColorVar.white} !important`,
        opacity: '1 !important',
    },
    loadingIcon: {
        position: 'relative',
        right: -6,
    },
    error: {
        marginTop: '14px',
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

export const BindPanelUI = memo<BindPanelUIProps>(
    ({ onPersonaSign, onWalletSign, currentPersona, signature, isBound, title, onClose, open, isCurrentAccount }) => {
        const t = useI18N()
        const { classes } = useStyles()
        const pluginId = useCurrentWeb3NetworkPluginID()
        const isSupported = SUPPORTED_PLUGINS.includes(pluginId)

        const isWalletSigned = !!signature.wallet.value
        const isPersonaSigned = !!signature.persona.value

        return (
            <InjectedDialog open={open} title={title} onClose={onClose}>
                <DialogContent style={{ padding: '24px' }}>
                    <Box>
                        <Stack alignItems="center" direction="row" justifyContent="space-between" mb={1.25}>
                            <Typography className={classes.subTitle}>{t.wallet()}</Typography>
                            <Typography>
                                <Typography
                                    variant="body2"
                                    className={isWalletSigned ? classes.deneText : ''}
                                    component="span">
                                    1
                                </Typography>
                                <Typography variant="body2" component="span">
                                    {' '}
                                    / 2{' '}
                                </Typography>
                            </Typography>
                        </Stack>
                        <WalletStatusBox />
                        {isBound && <Typography className={classes.error}>{t.bind_wallet_bound_error()}</Typography>}
                        <Box mt={3}>
                            <LoadingButton
                                fullWidth
                                classes={{
                                    loadingIndicatorEnd: classes.loadingIcon,
                                }}
                                loadingPosition="end"
                                disabled={!isCurrentAccount || isBound || !!isWalletSigned || !isSupported}
                                className={isWalletSigned ? classes.done : ''}
                                loading={signature.wallet.loading}
                                onClick={onWalletSign}
                                endIcon={isWalletSigned ? <DoneIcon sx={{ color: MaskColorVar.white }} /> : null}
                                loadingIndicator={<LoadingAnimation />}>
                                {isWalletSigned ? t.done() : t.wallet_sign()}
                            </LoadingButton>
                        </Box>
                    </Box>
                    {!isSupported && <Typography className={classes.error}>{t.unsupported_network()}</Typography>}
                    <Box mt={3}>
                        <Stack alignItems="center" direction="row" justifyContent="space-between" mb={1.25}>
                            <Typography className={classes.subTitle}>{t.persona()}</Typography>
                            <Typography>
                                <Typography
                                    variant="body2"
                                    className={isPersonaSigned ? classes.deneText : ''}
                                    component="span">
                                    2
                                </Typography>
                                <Typography component="span" variant="body2">
                                    {' '}
                                    / 2{' '}
                                </Typography>
                            </Typography>
                        </Stack>
                        <Stack direction="row" className={classes.persona} mb={3}>
                            <div className={classes.iconContainer}>
                                <Icon type="masks" size={48} />
                            </div>
                            <div>
                                <Typography className={classes.name}>{currentPersona?.nickname}</Typography>
                                <Typography className={classes.identifier}>
                                    {formatPersonaFingerprint(currentPersona?.identifier.rawPublicKey ?? '', 10)}
                                </Typography>
                            </div>
                        </Stack>
                        <Box mt={3}>
                            <LoadingButton
                                fullWidth
                                disabled={isBound || !!isPersonaSigned || !isSupported}
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
                    </Box>
                </DialogContent>
            </InjectedDialog>
        )
    },
)
