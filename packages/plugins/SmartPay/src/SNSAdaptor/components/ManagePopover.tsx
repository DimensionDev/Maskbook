import { Icons } from '@masknet/icons'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'
import { useSnackbarCallback } from '@masknet/shared'
import { DashboardRoutes, formatPersonaFingerprint, PopupRoutes } from '@masknet/shared-base'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { isSameAddress } from '@masknet/web3-shared-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Button, Popover, Radio, Typography } from '@mui/material'
import { memo } from 'react'
import { useCopyToClipboard } from 'react-use'
import { useManagers } from '../../hooks/useManagers.js'
import { useI18N } from '../../locales/index.js'
import { type ManagerAccount, ManagerAccountType } from '../../type.js'

export interface ManagePopoverProps {
    open: boolean
    anchorEl: HTMLElement | null
    onClose: () => void
    selectedAddress?: string
    onSelect: (account: ManagerAccount) => void
}

const useStyles = makeStyles()((theme) => ({
    paper: {
        padding: theme.spacing(1.5, 1.5, 2, 1.5),
        boxSizing: 'border-box',
        backgroundColor: theme.palette.maskColor.bottom,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0px 0px 20px rgba(255, 255, 255, 0.12)'
                : '0px 4px 30px rgba(0, 0, 0, 0.1)',
        borderRadius: 16,
        maxHeight: 296,
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 20,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            backgroundClip: 'padding-box',
        },
    },
    title: {
        color: theme.palette.maskColor.main,
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
    },
    list: {
        padding: theme.spacing(2, 0),
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10,
    },
    item: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    identity: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
        display: 'flex',
        columnGap: '2px',
        alignItems: 'center',
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    desc: {
        fontSize: 14,
        lineHeight: '18px',
    },
}))

export const ManagePopover = memo<ManagePopoverProps>(({ open, anchorEl, onClose, onSelect, selectedAddress }) => {
    const t = useI18N()
    const { classes } = useStyles()
    const { personaManagers, walletManagers } = useManagers()

    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useSnackbarCallback({
        executor: async (text) => copyToClipboard(text),
        deps: [],
        successText: t.copy_wallet_address_success(),
    })

    const { openPopupWindow, openDashboard } = useSNSAdaptorContext()

    return usePortalShadowRoot((container) => (
        <Popover
            disableScrollLock
            container={container}
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            PaperProps={{ style: { minWidth: `${anchorEl?.clientWidth ?? 568}px` }, className: classes.paper }}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            disableRestoreFocus>
            <Typography className={classes.title}>{t.personas()}</Typography>
            {personaManagers.length ? (
                <Box className={classes.list}>
                    {personaManagers.map((persona, index) => (
                        <Box
                            key={index}
                            className={classes.item}
                            onClick={() =>
                                onSelect({
                                    type: ManagerAccountType.Persona,
                                    name: persona.nickname,
                                    address: persona.address,
                                    identifier: persona.identifier,
                                })
                            }>
                            <Box display="flex" alignItems="center" columnGap={0.5}>
                                <Icons.MaskBlue size={30} />
                                <Box>
                                    <Typography className={classes.title}>{persona.nickname}</Typography>
                                    <Typography className={classes.identity}>
                                        {formatPersonaFingerprint(persona.identifier.rawPublicKey, 4)}
                                        <Icons.PopupCopy
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                event.preventDefault()
                                                onCopy(persona.identifier.rawPublicKey)
                                            }}
                                            size={14}
                                        />
                                    </Typography>
                                </Box>
                            </Box>
                            <Radio checked={isSameAddress(persona.address, selectedAddress)} />
                        </Box>
                    ))}
                </Box>
            ) : (
                <Box className={classes.footer} sx={{ py: 2 }}>
                    <Box>
                        <Typography className={classes.title}>{t.create_a_new_persona_title()}</Typography>
                        <Typography className={classes.desc}>{t.create_a_new_persona_desc()}</Typography>
                    </Box>
                    <Button
                        variant="roundedContained"
                        size="small"
                        sx={{ height: 32 }}
                        onClick={() => openDashboard(DashboardRoutes.Setup)}>
                        {t.create()}
                    </Button>
                </Box>
            )}
            <Typography className={classes.title}>{t.wallets()}</Typography>
            {walletManagers.length ? (
                <Box className={classes.list}>
                    {walletManagers.map((wallet, index) => (
                        <Box
                            key={index}
                            className={classes.item}
                            onClick={() =>
                                onSelect({
                                    type: ManagerAccountType.Wallet,
                                    name: wallet.name,
                                    address: wallet.address,
                                })
                            }>
                            <Box display="flex" alignItems="center" columnGap={0.5}>
                                <Icons.MaskBlue size={30} />
                                <Box>
                                    <Typography className={classes.title}>{wallet.name}</Typography>
                                    <Typography className={classes.identity}>
                                        {formatEthereumAddress(wallet.address, 4)}
                                        <Icons.PopupCopy
                                            size={14}
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                event.preventDefault()
                                                onCopy(wallet.address)
                                            }}
                                        />
                                    </Typography>
                                </Box>
                            </Box>
                            <Radio checked={isSameAddress(selectedAddress, wallet.address)} />
                        </Box>
                    ))}
                </Box>
            ) : (
                <Box className={classes.footer}>
                    <Box>
                        <Typography className={classes.title}>{t.create_a_new_wallet_title()}</Typography>
                        <Typography className={classes.desc}>{t.create_a_new_wallet_desc()}</Typography>
                    </Box>
                    <Button
                        variant="roundedContained"
                        size="small"
                        sx={{ height: 32 }}
                        onClick={() => openPopupWindow(PopupRoutes.WalletStartUp)}>
                        {t.create()}
                    </Button>
                </Box>
            )}
        </Popover>
    ))
})
