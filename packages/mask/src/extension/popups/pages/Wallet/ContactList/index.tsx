import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import {
    useAccount,
    useBalance,
    useChainContext,
    useFungibleTokenBalance,
    useNativeTokenAddress,
    useWallets,
} from '@masknet/web3-hooks-base'
import { explorerResolver, formatEthereumAddress, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { Box, Link, List, ListItem, MenuItem, Stack, Typography, useTheme } from '@mui/material'
import { memo, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { ContactsContext } from './contactsContext.js'
import { Icons } from '@masknet/icons'
import { EmojiAvatar, FormattedAddress, useMenuConfig } from '@masknet/shared'
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
    menu: {
        padding: '4px 4px 8px 4px',
        borderRadius: '16px',
    },
    menuItem: {
        padding: 8,
        width: 132,
        minHeight: 'unset',
    },
    optionName: {
        fontSize: 14,
        fontWeight: 700,
        marginLeft: 8,
    },
    emojiAvatar: {
        marginRight: 10,
        fontSize: 14,
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

const ContactListUI = memo(function TransferUI() {
    const location = useLocation()
    const { t } = useI18N()
    const { classes } = useStyles()
    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM)
    const address = useParams().address || nativeTokenAddress
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isNativeToken = !address || isNativeTokenAddress(address)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const { receiver, setReceiver, contacts, receiverValidationMessage } = ContactsContext.useContainer()
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
                    {contacts.length ? (
                        <Typography className={classes.contactTitle}>
                            {t('wallet_transfer_my_contacts_title')}
                        </Typography>
                    ) : null}
                    <List className={classes.contactsList}>
                        {contacts.map((contact, index) => {
                            return (
                                <Stack key={index}>
                                    <ContactListItem address={contact.id} name={contact.name} />
                                </Stack>
                            )
                        })}
                    </List>
                    <Typography className={classes.contactTitle}>{t('wallet_transfer_my_wallets_title')}</Typography>
                    <List className={classes.contactsList}>
                        {wallets.map((wallet, index) => {
                            return (
                                <Stack key={index}>
                                    <ContactListItem address={wallet.address} name={wallet.name} />
                                </Stack>
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

interface ContactListItemProps {
    address: string
    name: string
}

function ContactListItem({ address, name }: ContactListItemProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const theme = useTheme()

    const menuOptions = useMemo(
        () => [
            {
                name: t('edit'),
                icon: <Icons.Edit2 size={20} color={theme.palette.maskColor.second} />,
            },
            {
                name: t('delete'),
                icon: <Icons.Decrease size={20} color={theme.palette.maskColor.second} />,
            },
        ],
        [t],
    )

    const [menu, openMenu] = useMenuConfig(
        menuOptions.map((option, index) => (
            <MenuItem key={index} className={classes.menuItem}>
                {option.icon}
                <Typography className={classes.optionName}>{option.name}</Typography>
            </MenuItem>
        )),
        {
            anchorSibling: false,
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'right',
            },
            transformOrigin: {
                vertical: 'top',
                horizontal: 'right',
            },
            classes: { paper: classes.menu },
        },
    )

    return (
        <ListItem classes={{ root: classes.contactsListItem }}>
            <div className={classes.contactsListItemInfo}>
                <EmojiAvatar address={address} className={classes.emojiAvatar} sx={{ width: 24, height: 24 }} />
                <div>
                    <Typography className={classes.nickname}>{name}</Typography>
                    <Typography className={classes.identifier}>
                        <FormattedAddress address={address} formatter={formatEthereumAddress} size={4} />
                        <Link
                            onClick={(event) => event.stopPropagation()}
                            href={explorerResolver.addressLink(chainId, address ?? '')}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icons.PopupLink className={classes.icon} />
                        </Link>
                    </Typography>
                </div>
            </div>
            <Icons.More size={24} className={classes.iconMore} onClick={openMenu} />
            {menu}
        </ListItem>
    )
}

function ContactList() {
    return (
        <ContactsContext.Provider>
            <ContactListUI />
        </ContactsContext.Provider>
    )
}

export default ContactList
