import { Icons } from '@masknet/icons'
import { InjectedDialog, ImageIcon, useSnackbarCallback, TokenIcon, FormattedBalance } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { useFungibleAssets, useNetworkDescriptor } from '@masknet/web3-hooks-base'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Button, DialogActions, DialogContent, List, ListItem, ListItemText, Typography } from '@mui/material'
import { useCopyToClipboard } from 'react-use'
import { memo } from 'react'
import { formatBalance } from '@masknet/web3-shared-base'
import { isNaN } from 'lodash-es'
import { useI18N } from '../../locales/i18n_generated.js'
import { PluginSmartPayMessages } from '../../message.js'

const useStyles = makeStyles()((theme) => ({
    dialogContent: {
        padding: theme.spacing(2),
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
    dialogActions: {
        padding: theme.spacing(1.5),
        display: 'flex',
        justifyContent: 'space-between',
        columnGap: 12,
        '& > *': {
            marginLeft: '0px !important',
            fontSize: 12,
        },
    },
    card: {
        background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)',
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: theme.palette.maskColor.publicBg,
        color: theme.palette.maskColor.publicMain,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        right: -6,
        bottom: -4,
        border: `1px solid ${theme.palette.common.white}`,
        borderRadius: '50%',
    },
    address: {
        color: theme.palette.maskColor.publicSecond,
        fontSize: 14,
        lineHeight: '18px',
        display: 'flex',
        alignItems: 'center',
        columnGap: 2,
        marginTop: 4,
    },
    list: {
        marginTop: theme.spacing(1.5),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1),
        paddingTop: 0,
    },
    listItem: {
        backgroundColor: theme.palette.maskColor.bottom,
        borderRadius: 8,
        boxShadow:
            theme.palette.mode === 'light'
                ? '0px 0px 20px rgba(0, 0, 0, 0.05)'
                : '0px 0px 20px rgba(255, 255, 255, 0.12)',
        padding: theme.spacing(2, 1.5),
    },
    name: {
        display: 'flex',
        alignItems: 'center',
        fontSize: 14,
        color: theme.palette.maskColor.second,
        lineHeight: '18px',
        columnGap: 4,
    },
    balance: {
        textAlign: 'right',
        '& > span': {
            fontSize: 16,
            lineHeight: '20px',
            fontWeight: 700,
        },
    },
}))

export const SmartPayDialog = memo(() => {
    const t = useI18N()
    const { classes } = useStyles()
    const { open, closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.smartPayDialogEvent)
    const { setDialog: setDescriptionDialog } = useRemoteControlledDialog(
        PluginSmartPayMessages.smartPayDescriptionDialogEvent,
    )

    const polygonDescriptor = useNetworkDescriptor(NetworkPluginID.PLUGIN_EVM, ChainId.Matic)

    // #region copy event handler
    const [, copyToClipboard] = useCopyToClipboard()

    const onCopy = useSnackbarCallback({
        executor: async () => copyToClipboard('0x790116d0685eB197B886DAcAD9C247f785987A4a'),
        deps: [],
        successText: t.copy_wallet_address_success(),
    })
    // #endregion

    const { value: assets, loading } = useFungibleAssets(NetworkPluginID.PLUGIN_EVM, undefined, {
        chainId: ChainId.Matic,
        account: '0x790116d0685eB197B886DAcAD9C247f785987A4a',
    })

    const tokens = assets?.filter((x) => x.chainId === ChainId.Matic)
    return (
        <InjectedDialog
            open={open}
            onClose={closeDialog}
            title={t.__plugin_name()}
            titleTail={<Icons.Questions onClick={() => setDescriptionDialog({ open: true })} />}>
            <DialogContent className={classes.dialogContent}>
                <Box className={classes.card}>
                    <Box display="flex" alignItems="center" columnGap={1.5}>
                        <Box position="relative" width={30} height={30}>
                            <Icons.SmartPay size={30} />
                            <ImageIcon classes={{ icon: classes.badge }} size={12} icon={polygonDescriptor?.icon} />
                        </Box>
                        <Box display="flex" flexDirection="column" justifyContent="space-between">
                            <Typography fontSize={16} lineHeight="20px" fontWeight={700}>
                                Smart Pay 1
                            </Typography>
                            <Typography className={classes.address}>
                                {formatEthereumAddress('0x790116d0685eB197B886DAcAD9C247f785987A4a', 4)}
                                <Icons.PopupCopy onClick={onCopy} size={14} />
                                <Icons.LinkOut size={14} />
                            </Typography>
                        </Box>
                    </Box>

                    <Typography mt="14px" fontSize={36} fontWeight={700} lineHeight={1.2}>
                        $233.00
                    </Typography>
                    <Box display="flex" columnGap={1} position="absolute" top={16} right={16}>
                        <Icons.KeySquare size={24} />
                        <Icons.Add size={24} />
                    </Box>
                </Box>
                <List dense className={classes.list}>
                    {tokens?.map((token, index) => (
                        <ListItem className={classes.listItem} key={index}>
                            <Box display="flex" alignItems="center" columnGap="10px">
                                <TokenIcon
                                    size={36}
                                    address={token.address}
                                    name={token.name}
                                    chainId={token.chainId}
                                    logoURL={token.logoURL}
                                />
                                <Box>
                                    <Typography fontSize={16} lineHeight="20px" fontWeight={700}>
                                        {token.symbol}
                                    </Typography>
                                    <Typography className={classes.name}>
                                        {token.name} <Icons.LinkOut size={14} />
                                    </Typography>
                                </Box>
                            </Box>
                            <ListItemText className={classes.balance}>
                                <FormattedBalance
                                    value={isNaN(token.balance) ? 0 : token.balance}
                                    decimals={isNaN(token.decimals) ? 0 : token.decimals}
                                    significant={6}
                                    formatter={formatBalance}
                                />
                            </ListItemText>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions className={classes.dialogActions}>
                <Button variant="roundedContained" startIcon={<Icons.RedPacket />} fullWidth size="small">
                    {t.lucky_drop()}
                </Button>
                <Button variant="roundedContained" startIcon={<Icons.SwapColorful />} fullWidth size="small">
                    {t.swap()}
                </Button>
                <Button variant="roundedContained" startIcon={<Icons.SendColorful />} fullWidth size="small">
                    {t.send()}
                </Button>
                <Button variant="roundedContained" startIcon={<Icons.ReceiveColorful />} fullWidth size="small">
                    {t.receive()}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
})
