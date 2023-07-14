import { NetworkPluginID, WalletContactType } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useNativeTokenAddress, useWallets } from '@masknet/web3-hooks-base'
import { explorerResolver, formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Box, Link, List, ListItem, MenuItem, Stack, Typography, useTheme } from '@mui/material'
import { memo, useCallback, useMemo } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { ContactsContext } from './contactsContext.js'
import { Icons } from '@masknet/icons'
import { EmojiAvatar, FormattedAddress, useMenuConfig } from '@masknet/shared'
import AddContactInputPanel from './AddContactInputPanel.js'
import { DeleteContactModal, EditContactModal } from '../../../modals/modals.js'

const useStyles = makeStyles<{ showDivideLine?: boolean }>()((theme, { showDivideLine }) => ({
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
        maxHeight: 380,
        overflow: 'scroll',
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
        cursor: 'pointer',
        '&:hover': {
            backgroundColor: theme.palette.background.default,
        },
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
        padding: '4px 0px 8px 0px',
        borderRadius: '16px',
    },
    menuItem: {
        padding: '8px 12px',
        width: 140,
        minHeight: 'unset',
        '&:first-child': showDivideLine
            ? {
                  '&:after': {
                      content: '""',
                      background: theme.palette.divider,
                      bottom: 0,
                      position: 'absolute',
                      width: 120,
                      height: 1,
                  },
              }
            : {},
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
    const { classes } = useStyles({})
    const nativeTokenAddress = useNativeTokenAddress(NetworkPluginID.PLUGIN_EVM)
    const address = useParams().address || nativeTokenAddress
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const { receiver, setReceiver, contacts, receiverValidationMessage } = ContactsContext.useContainer()

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
                                    <ContactListItem
                                        address={contact.id}
                                        name={contact.name}
                                        type={WalletContactType.Contact}
                                    />
                                </Stack>
                            )
                        })}
                    </List>
                    <Typography className={classes.contactTitle}>{t('wallet_transfer_my_wallets_title')}</Typography>
                    <List className={classes.contactsList}>
                        {wallets.map((wallet, index) => {
                            return (
                                <Stack key={index}>
                                    <ContactListItem
                                        address={wallet.address}
                                        name={wallet.name}
                                        type={WalletContactType.Wallet}
                                    />
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
    type: WalletContactType
}

function ContactListItem({ address, name, type }: ContactListItemProps) {
    const { t } = useI18N()
    const { classes } = useStyles({ showDivideLine: type === WalletContactType.Contact })
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const theme = useTheme()

    const editContact = useCallback(() => {
        EditContactModal.openAndWaitForClose({
            title: t('wallet_edit_contact'),
            address,
            name,
            type,
        })
    }, [address, name, type])

    const deleteContact = useCallback(() => {
        DeleteContactModal.openAndWaitForClose({
            title: t('wallet_edit_contact'),
            address,
            name,
        })
    }, [address, name])

    const menuOptions = useMemo(
        () => [
            {
                name: t('edit'),
                icon: <Icons.Edit2 size={20} color={theme.palette.maskColor.second} />,
                handler: editContact,
            },
            ...(type === WalletContactType.Contact
                ? [
                      {
                          name: t('delete'),
                          icon: <Icons.Decrease size={20} color={theme.palette.maskColor.second} />,
                          handler: deleteContact,
                      },
                  ]
                : []),
        ],
        [t, type],
    )

    const [menu, openMenu] = useMenuConfig(
        menuOptions.map((option, index) => (
            <MenuItem key={index} className={classes.menuItem} onClick={option.handler}>
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
