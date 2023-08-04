import { memo, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import urlcat from 'urlcat'
import { Box, Link, List, ListItem, MenuItem, Typography, useTheme, type ListItemProps } from '@mui/material'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useWallets } from '@masknet/web3-hooks-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { EmojiAvatar, FormattedAddress, useMenuConfig } from '@masknet/shared'
import { ExplorerResolver } from '@masknet/web3-providers'
import { useI18N } from '../../../../../utils/index.js'
import { useTitle } from '../../../hook/useTitle.js'
import { ContactsContext } from '../../../hook/useContactsContext.js'
import AddContactInputPanel from '../../../components/AddContactInputPanel/index.js'
import { DeleteContactModal, EditContactModal } from '../../../modals/modals.js'
import { ContactType } from '../type.js'

const useStyles = makeStyles<{ showDivideLine?: boolean }>()((theme, { showDivideLine }) => ({
    root: {
        overflowX: 'hidden',
        height: '100%',
    },
    page: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        height: '100%',
    },
    contactsPanel: {
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
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
        paddingLeft: '16px !important',
        paddingRight: '16px !important',
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
        paddingLeft: 16,
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
        '&:first-of-type': showDivideLine
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
        backdropFilter: 'blur(8px)',
        width: '100%',
        bottom: 0,
        zIndex: 100,
    },
    confirmButton: {
        margin: '16px 0',
    },
}))

const ContactListUI = memo(function ContactListUI() {
    const { t } = useI18N()
    const { classes } = useStyles({})
    const wallets = useWallets(NetworkPluginID.PLUGIN_EVM)
    const { userInput, address, contacts, inputValidationMessage } = ContactsContext.useContainer()
    const [params] = useSearchParams()

    useTitle(t('popups_send'))

    const navigate = useNavigate()

    const handleSelectContact = useCallback(
        (addr: string, recipientName: string) => {
            const path = urlcat(PopupRoutes.Transfer, {
                ...Object.fromEntries(params.entries()),
                recipient: addr,
                recipientName,
            })
            navigate(path)
        },
        [navigate, params],
    )

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
                                <ContactListItem
                                    key={index}
                                    address={contact.address}
                                    name={contact.name}
                                    contactType={ContactType.Recipient}
                                    onSelectContact={handleSelectContact}
                                />
                            )
                        })}
                    </List>
                    <Typography className={classes.contactTitle}>{t('wallet_transfer_my_wallets_title')}</Typography>
                    <List className={classes.contactsList}>
                        {wallets.map((wallet, index) => {
                            return (
                                <ContactListItem
                                    key={index}
                                    address={wallet.address}
                                    name={wallet.name}
                                    contactType={ContactType.Owned}
                                    onSelectContact={handleSelectContact}
                                />
                            )
                        })}
                    </List>
                </Box>
                <Box className={classes.bottomAction}>
                    <ActionButton
                        fullWidth
                        onClick={() => {
                            const path = urlcat(PopupRoutes.Transfer, {
                                ...Object.fromEntries(params.entries()),
                                recipient: address,
                            })
                            navigate(path)
                        }}
                        width={368}
                        className={classes.confirmButton}
                        disabled={!!inputValidationMessage || !userInput}>
                        {t('next')}
                    </ActionButton>
                </Box>
            </Box>
        </div>
    )
})

interface ContactListItemProps extends ListItemProps {
    address: string
    name: string
    contactType: ContactType
    onSelectContact?: (address: string, name: string) => void
}

function ContactListItem({ address, name, contactType, onSelectContact, ...rest }: ContactListItemProps) {
    const { t } = useI18N()
    const { classes } = useStyles({ showDivideLine: contactType === ContactType.Recipient })
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const theme = useTheme()

    const editContact = useCallback(() => {
        return EditContactModal.openAndWaitForClose({
            title: t('wallet_edit_contact'),
            address,
            name,
            type: contactType,
        })
    }, [address, name, contactType, t])

    const deleteContact = useCallback(() => {
        return DeleteContactModal.openAndWaitForClose({
            title: t('wallet_edit_contact'),
            address,
            name,
        })
    }, [address, name, t])

    const menuOptions = useMemo(() => {
        const options = [
            {
                name: t('edit'),
                icon: <Icons.Edit2 size={20} color={theme.palette.maskColor.second} />,
                handler: editContact,
            },
        ]
        if (contactType === ContactType.Recipient)
            options.push({
                name: t('delete'),
                icon: <Icons.Decrease size={20} color={theme.palette.maskColor.second} />,
                handler: deleteContact,
            })
        return options
    }, [t, contactType])

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
        <ListItem
            classes={{ root: classes.contactsListItem }}
            onClick={() => onSelectContact?.(address, name)}
            {...rest}>
            <div className={classes.contactsListItemInfo}>
                <EmojiAvatar address={address} className={classes.emojiAvatar} sx={{ width: 24, height: 24 }} />
                <div>
                    <Typography className={classes.nickname}>{name}</Typography>
                    <Typography className={classes.identifier}>
                        <FormattedAddress address={address} formatter={formatEthereumAddress} size={4} />
                        <Link
                            onClick={(event) => event.stopPropagation()}
                            href={ExplorerResolver.addressLink(chainId, address ?? '')}
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
