import { NetworkPluginID, generateContactAvatarColor } from '@masknet/shared-base'
import { ActionButton, MaskTextField, makeStyles } from '@masknet/theme'
import {
    useAccount,
    useBalance,
    useChainContext,
    useFungibleTokenBalance,
    useNativeTokenAddress,
    useWallets,
} from '@masknet/web3-hooks-base'
import { explorerResolver, formatEthereumAddress, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { Avatar, Box, Link, List, ListItem, Typography, useTheme } from '@mui/material'
import { memo, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { ContactsContext } from './contactsContext.js'
import { Icons } from '@masknet/icons'
import { EmojiAvatar, EthereumBlockie, FormattedAddress, TokenIcon, WalletIcon } from '@masknet/shared'
import AddContactInputPanel from './AddContactInputPanel.js'

const useStyles = makeStyles()((theme) => ({
    root: {
        overflowX: 'hidden',
        height: '100%',
    },
    page: {
        position: 'relative',
        height: '100%',
        overflow: 'auto',
    },
    contactsPanel: {
        display: 'flex',
        flexDirection: 'column',
        padding: '0 16px',
    },
    contactsList: {
        padding: 0,
    },
    nickname: {
        color: theme.palette.maskColor.main,
        lineHeight: '18px',
        fontWeight: 700,
    },
    identifier: {
        fontSize: 14,
        color: theme.palette.maskColor.second,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
    },
    contactsListItem: {
        display: 'flex',
        justifyContent: 'space-between',
        paddingLeft: '0px !important',
        paddingRight: '0px !important',
    },
    contactsListItemInfo: {
        display: 'flex',
        alignItems: 'center',
    },
    contactTitle: {
        color: theme.palette.maskColor.main,
        fontSize: 14,
        fontWeight: 700,
    },
    icon: {
        fontSize: 18,
        height: 18,
        width: 18,
        color: theme.palette.maskColor.main,
        cursor: 'pointer',
        marginLeft: 4,
    },
    emojiAvatar: {
        marginRight: 10,
        fontSize: 14,
    },
    input: {
        flex: 1,
    },
    save: {
        color: theme.palette.maskColor.primary,
        marginRight: 4,
    },
    endAdornment: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
    iconMore: {
        cursor: 'pointer',
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
    },
    confirmButton: {
        margin: '16px 0',
    },
}))

const TransferUI = memo(function TransferUI() {
    const location = useLocation()
    const { t } = useI18N()
    const { classes } = useStyles()
    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM)
    const address = useParams().address || nativeTokenAddress
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isNativeToken = !address || isNativeTokenAddress(address)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const { receiver, setReceiver, receiverValidationMessage } = ContactsContext.useContainer()
    const theme = useTheme()

    const { data: nativeTokenBalance = '0' } = useBalance(NetworkPluginID.PLUGIN_EVM)
    const { data: erc20Balance = '0' } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, address)
    const balance = isNativeToken ? nativeTokenBalance : erc20Balance

    const otherWallets = useMemo(
        () => wallets.map((wallet) => ({ name: wallet.name ?? '', address: wallet.address })),
        [wallets],
    )

    useTitle(t('popups_send'))

    return (
        <div className={classes.root}>
            <Box className={classes.page}>
                <AddContactInputPanel />
                <Box className={classes.contactsPanel}>
                    <Typography className={classes.contactTitle}>{t('wallet_transfer_my_wallets_title')}</Typography>
                    <List className={classes.contactsList}>
                        {wallets.map((wallet, index) => {
                            return (
                                <ListItem key={index} classes={{ root: classes.contactsListItem }}>
                                    <div className={classes.contactsListItemInfo}>
                                        <EmojiAvatar
                                            address={wallet.address}
                                            className={classes.emojiAvatar}
                                            sx={{ width: 24, height: 24 }}
                                        />
                                        <div>
                                            <Typography className={classes.nickname}>{wallet.name}</Typography>
                                            <Typography className={classes.identifier}>
                                                <FormattedAddress
                                                    address={wallet.address}
                                                    formatter={formatEthereumAddress}
                                                    size={4}
                                                />
                                                <Link
                                                    onClick={(event) => event.stopPropagation()}
                                                    href={explorerResolver.addressLink(chainId, wallet.address ?? '')}
                                                    target="_blank"
                                                    rel="noopener noreferrer">
                                                    <Icons.PopupLink className={classes.icon} />
                                                </Link>
                                            </Typography>
                                        </div>
                                    </div>
                                    <Icons.More size={24} className={classes.iconMore} />
                                </ListItem>
                            )
                        })}
                    </List>
                </Box>
                <Box className={classes.bottomAction}>
                    <ActionButton
                        fullWidth
                        onClick={() => {}}
                        width={368}
                        className={classes.confirmButton}
                        disabled={!!receiverValidationMessage || !receiver}>
                        {t('next')}
                    </ActionButton>
                </Box>
            </Box>
        </div>
    )
})

function Transfer() {
    return (
        <ContactsContext.Provider>
            <TransferUI />
        </ContactsContext.Provider>
    )
}

export default Transfer
