import type { Account, AccountAvailable, EvmAddress } from '@lens-protocol/client'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { Image, SelectProviderModal, WalletIcon } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { useChainContext, useProviderDescriptor, useWeb3Utils } from '@masknet/web3-hooks-base'
import { LensV3 } from '@masknet/web3-providers'
import { ChainId, formatEthereumAddress } from '@masknet/web3-shared-evm'
import {
    Box,
    Button,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Popover,
    Radio,
    Typography,
} from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles()((theme) => ({
    paper: {
        background: theme.vars.palette.maskColor.bottom,
        width: 320,
        padding: theme.spacing(1.5),
        filter: 'drop-shadow(0px 4px 30px rgba(0, 0, 0, 0.1))',
        boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.1)',
        ...theme.applyStyles('dark', {
            filter: 'drop-shadow(0px 4px 30px rgba(255, 255, 255, 0.15))',
            boxShadow: '0px 4px 30px 0px rgba(255, 255, 255, 0.15)',
        }),
    },
    avatar: {
        borderRadius: 99,
        overflow: 'hidden',
    },
    primary: {
        color: theme.vars.palette.maskColor.main,
        fontWeight: 700,
        lineHeight: '18px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        paddingRight: 50,
    },
    second: {
        display: 'flex',
        columnGap: 4,
        alignItems: 'center',
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.vars.palette.maskColor.bg,
        borderRadius: 8,
        padding: theme.spacing(1.5),
    },
    description: {
        display: 'flex',
        columnGap: 4,
    },
    name: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.vars.palette.maskColor.main,
    },
    address: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.vars.palette.maskColor.second,
    },
    list: {
        maxHeight: 200,
        overflow: 'auto',
        marginBottom: theme.spacing(1.5),
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: 18,
        },
        '::-webkit-scrollbar-thumb': {
            borderRadius: '20px',
            width: 5,
            border: '7px solid rgba(0, 0, 0, 0)',
            backgroundColor: theme.vars.palette.maskColor.secondaryLine,
            backgroundClip: 'padding-box',
        },
    },
    managedTag: {
        background: theme.vars.palette.maskColor.third,
        color: theme.vars.palette.maskColor.bottom,
        fontSize: 12,
        padding: theme.spacing(0.5),
        borderRadius: 4,
        lineHeight: '12px',
    },
    item: {
        padding: theme.spacing(1.5),
        borderRadius: 8,
    },
    disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    listItemText: {
        margin: 0,
    },
}))

interface ProfilePopupProps {
    anchorEl: HTMLElement | null
    open: boolean
    accounts: AccountAvailable[]
    onClose: () => void
    onChange: (profile: Account) => void
    currentAccount: Account
    walletName?: string
}

export const ProfilePopup = memo<ProfilePopupProps>(function ProfilePopup({
    anchorEl,
    open,
    accounts: availableAccounts,
    onClose,
    currentAccount,
    onChange,
    walletName,
}) {
    const { classes, cx } = useStyles()
    const Utils = useWeb3Utils()

    const { account: walletAddress } = useChainContext()
    const providerDescriptor = useProviderDescriptor()
    const currentAccountId = currentAccount.username?.id

    return usePortalShadowRoot((container) => (
        <Popover
            disableScrollLock
            container={container}
            open={open}
            onClose={onClose}
            anchorEl={anchorEl}
            disableRestoreFocus
            classes={{ paper: classes.paper }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}>
            <List disablePadding className={classes.list}>
                {availableAccounts.map(({ account, __typename: accountType }) => {
                    const avatar = LensV3.getAccountAvatar(account)
                    const name = account.metadata?.name || account.username?.localName
                    const ownerAddress: EvmAddress = account.username?.ownedBy
                    const accountId = account.username?.id
                    const disabled = accountId === currentAccountId
                    return (
                        <ListItemButton
                            className={cx(classes.item, { [classes.disabled]: disabled })}
                            key={accountId}
                            disabled={disabled}
                            onClick={() => {
                                if (disabled) return
                                onChange(account)
                            }}>
                            <ListItemIcon>
                                {avatar ?
                                    <Image
                                        rounded
                                        size={36}
                                        src={avatar}
                                        fallback={<Icons.DarkLens size={36} className={classes.avatar} />}
                                    />
                                :   <Icons.DarkLens size={36} className={classes.avatar} />}
                            </ListItemIcon>
                            <ListItemText
                                classes={{ primary: classes.primary, root: classes.listItemText }}
                                primary={name}
                                slotProps={{
                                    secondary: { component: 'div' },
                                }}
                                secondary={
                                    <div className={classes.second}>
                                        <Typography component="div" className={classes.address}>
                                            {formatEthereumAddress(ownerAddress, 4)}
                                        </Typography>
                                        {accountType === 'AccountManaged' ?
                                            <Typography component="span" className={classes.managedTag}>
                                                Managed
                                            </Typography>
                                        :   null}
                                    </div>
                                }
                            />
                            <ListItemSecondaryAction>
                                <Radio checked={currentAccountId === accountId} />
                            </ListItemSecondaryAction>
                        </ListItemButton>
                    )
                })}
            </List>
            <Box className={classes.container}>
                <Box className={classes.description}>
                    <WalletIcon size={36} mainIcon={providerDescriptor?.icon} />
                    <Box>
                        <Typography className={classes.name}>{walletName}</Typography>
                        <Typography className={classes.address}>{Utils.formatAddress(walletAddress, 4)}</Typography>
                    </Box>
                </Box>
                <Button
                    variant="text"
                    onClick={() =>
                        SelectProviderModal.open({
                            requiredSupportPluginID: NetworkPluginID.PLUGIN_EVM,
                            requiredSupportChainIds: [ChainId.Polygon],
                        })
                    }>
                    <Trans>Change</Trans>
                </Button>
            </Box>
        </Popover>
    ))
})
