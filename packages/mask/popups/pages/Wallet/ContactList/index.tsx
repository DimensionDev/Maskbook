import { memo, useCallback, useContext, useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import urlcat from 'urlcat'
import { Box, Link, List, ListItem, MenuItem, Typography, useTheme, type ListItemProps } from '@mui/material'
import { type NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useWallets } from '@masknet/web3-hooks-base'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { EmojiAvatar, FormattedAddress, useMenuConfig } from '@masknet/shared'
import { EVMExplorerResolver } from '@masknet/web3-providers'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { useTitle, ContactsContext, PageTitleContext } from '../../../hooks/index.js'
import AddContactInputPanel from '../../../components/AddContactInputPanel/index.js'
import { DeleteContactModal, EditContactModal, AddContactModal } from '../../../modals/modal-controls.js'
import { ContactType } from '../type.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles<{ showDivideLine?: boolean; isManage?: boolean; hasError?: boolean }>()(
    (theme, { showDivideLine, isManage, hasError }) => ({
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
            maxHeight: (isManage ? 470 : 400) - (hasError ? 20 : 0),
            overflow: 'scroll',
            '::-webkit-scrollbar': {
                display: 'none',
            },
        },
        contactsList: {
            padding: 0,
        },
        nickname: {
            color: theme.palette.maskColor.main,
            lineHeight: '18px',
            fontWeight: 700,
            maxWidth: 290,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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
            '&:first-of-type':
                showDivideLine ?
                    {
                        '&:after': {
                            content: '""',
                            background: theme.palette.divider,
                            bottom: 0,
                            position: 'absolute',
                            width: 120,
                            height: 1,
                        },
                    }
                :   {},
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
            position: 'absolute',
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
    }),
)

const ContactListUI = memo(function ContactListUI() {
    const { _ } = useLingui()
    const t = useMaskSharedTrans()
    const theme = useTheme()
    const { setExtension } = useContext(PageTitleContext)
    const state = useLocation().state as
        | {
              type: 'send' | 'manage'
          }
        | undefined
    const isManage = state?.type === 'manage'

    const wallets = useWallets()
    const { userInput, address, contacts, inputValidationMessage, inputWarningMessage } = ContactsContext.useContainer()
    const { classes } = useStyles({ isManage, hasError: !!inputValidationMessage || !!inputWarningMessage })
    const [params] = useSearchParams()

    const addContact = useCallback(() => {
        return AddContactModal.openAndWaitForClose({
            title: <Trans>Add Contact</Trans>,
            address: '',
            name: '',
        })
    }, [t])

    useEffect(() => {
        if (!isManage) return
        setExtension(<Icons.Add color={theme.palette.maskColor.main} sx={{ cursor: 'pointer' }} onClick={addContact} />)
        return () => setExtension(undefined)
    }, [isManage])

    useTitle(isManage ? _(msg`Contacts`) : _(msg`Send`))

    const navigate = useNavigate()
    const location = useLocation()

    const handleSelectContact = useCallback(
        (addr: string, recipientName: string) => {
            if (isManage) return
            const path = urlcat(PopupRoutes.Transfer, {
                ...Object.fromEntries(params.entries()),
                recipient: addr,
                recipientName,
            })
            navigate(path, {
                state: location.state,
            })
        },
        [navigate, params, location.state, isManage],
    )

    return (
        <div className={classes.root}>
            <Box className={classes.page}>
                <AddContactInputPanel isManage={isManage} autoFocus />
                <Box className={classes.contactsPanel}>
                    {contacts.length ?
                        <Typography className={classes.contactTitle}>
                            <Trans>Contacts</Trans>
                        </Typography>
                    :   null}
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
                    <Typography className={classes.contactTitle}>
                        <Trans>My Wallets</Trans>
                    </Typography>
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
                {isManage ? null : (
                    <Box className={classes.bottomAction}>
                        <ActionButton
                            fullWidth
                            onClick={() => {
                                const path = urlcat(PopupRoutes.Transfer, {
                                    ...Object.fromEntries(params.entries()),
                                    recipient: address,
                                })
                                navigate(path, {
                                    state: location.state,
                                })
                            }}
                            width={368}
                            className={classes.confirmButton}
                            disabled={!!inputValidationMessage || !userInput}>
                            <Trans>Next</Trans>
                        </ActionButton>
                    </Box>
                )}
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
    const t = useMaskSharedTrans()
    const { classes } = useStyles({ showDivideLine: contactType === ContactType.Recipient })
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const theme = useTheme()

    const editContact = useCallback(() => {
        return EditContactModal.openAndWaitForClose({
            title: <Trans>Edit Contact</Trans>,
            address,
            name,
            type: contactType,
        })
    }, [address, name, contactType, t])

    const deleteContact = useCallback(() => {
        return DeleteContactModal.openAndWaitForClose({
            title: <Trans>Delete Contact</Trans>,
            address,
            name,
        })
    }, [address, name, t])

    const menuOptions = [
        {
            name: <Trans>Edit</Trans>,
            icon: <Icons.Edit2 size={20} color={theme.palette.maskColor.second} />,
            handler: editContact,
        },
        {
            name: <Trans>Delete</Trans>,
            icon: <Icons.Decrease size={20} color={theme.palette.maskColor.second} />,
            handler: deleteContact,
        },
    ]

    const [menu, openMenu, __, isOpenMenu] = useMenuConfig(
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
            onClick={() => !isOpenMenu && onSelectContact?.(address, name)}
            {...rest}>
            <div className={classes.contactsListItemInfo}>
                <EmojiAvatar value={address} className={classes.emojiAvatar} sx={{ width: 24, height: 24 }} />
                <div>
                    <Typography className={classes.nickname}>{name}</Typography>
                    <Typography className={classes.identifier}>
                        <FormattedAddress address={address} formatter={formatEthereumAddress} size={4} />
                        <Link
                            onClick={(event) => event.stopPropagation()}
                            href={EVMExplorerResolver.addressLink(chainId, address ?? '')}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icons.PopupLink className={classes.icon} color={theme.palette.maskColor.second} />
                        </Link>
                    </Typography>
                </div>
            </div>
            {contactType === ContactType.Recipient ?
                <Icons.More
                    size={24}
                    className={classes.iconMore}
                    onClick={(event) => {
                        event.stopPropagation()
                        openMenu(event)
                    }}
                />
            :   null}
            {menu}
        </ListItem>
    )
}

export { ContactList as Component }
export function ContactList() {
    return (
        <ContactsContext>
            <ContactListUI />
        </ContactsContext>
    )
}
