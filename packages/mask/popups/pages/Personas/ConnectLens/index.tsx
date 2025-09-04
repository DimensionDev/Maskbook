import type { AccountAvailable, EvmAddress } from '@lens-protocol/client'
import { Image, PersonaContext, useAvailableLensAccounts, useLensClient, useMyLensAccount } from '@masknet/shared'
import { EMPTY_LIST, EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { LensV3 } from '@masknet/web3-providers'
import { isSameAddress } from '@masknet/web3-shared-base'
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Radio,
    Typography,
} from '@mui/material'
import { first } from 'lodash-es'
import { memo, useState } from 'react'
import { Icons } from '@masknet/icons'
import { formatEthereumAddress } from '@masknet/web3-shared-evm'
import { LoadingButton } from '@mui/lab'
import { useAsyncFn } from 'react-use'
import { Trans } from '@lingui/react/macro'
import { createLensSession } from './createLensSession'
import Services from '#services'

const useStyles = makeStyles()((theme) => ({
    container: {
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    loading: {
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        minHeight: 0,
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
            backgroundColor: theme.palette.maskColor.secondaryLine,
            backgroundClip: 'padding-box',
        },
    },
    avatar: {
        borderRadius: 99,
        overflow: 'hidden',
    },
    primary: {
        color: theme.palette.maskColor.main,
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
    address: {
        fontWeight: 700,
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    managedTag: {
        background: theme.palette.maskColor.third,
        color: theme.palette.maskColor.bottom,
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
    buttonWrap: {
        padding: theme.spacing(1.5),
    },
}))

export const Component = memo(function ConnectLensView() {
    const { classes, cx } = useStyles()
    const { data: accounts = EMPTY_LIST, isLoading } = useAvailableLensAccounts()
    const myLensAccount = useMyLensAccount()
    const myLensAddress = myLensAccount?.account.address
    const currentAccount = accounts?.find((p) => isSameAddress(p.account.address, myLensAddress)) || first(accounts)
    const lensClient = useLensClient()
    const [selected = currentAccount, setSelected] = useState<AccountAvailable>()
    const selectedAccountId = selected?.account.username?.id
    const { currentPersona } = PersonaContext.useContainer()

    const [{ loading }, connect] = useAsyncFn(async (account: AccountAvailable) => {
        const client = await lensClient.login(account as AccountAvailable)
        const profileId = account.account.address
        const session = createLensSession(profileId, client)
        if (currentPersona) {
            await Services.Identity.attachProfile(
                ProfileIdentifier.of(EnhanceableSite.Lens, profileId).unwrap(),
                currentPersona.identifier,
                { connectionConfirmState: 'pending' },
                { token: session.token },
            )
        }
    }, [])

    if (isLoading) {
        return (
            <div className={cx(classes.container, classes.loading)}>
                <LoadingBase />
            </div>
        )
    }

    return (
        <div className={classes.container}>
            <List disablePadding className={classes.list}>
                {accounts?.map((accountItem) => {
                    const { account, __typename: accountType } = accountItem
                    const avatar = LensV3.getAccountAvatar(account)
                    const name = account.metadata?.name || account.username?.localName
                    const ownerAddress: EvmAddress = account.username?.ownedBy as EvmAddress
                    const accountId = account.username?.id
                    const disabled = accountId === selectedAccountId
                    return (
                        <ListItemButton
                            className={cx(classes.item, { [classes.disabled]: disabled })}
                            key={accountId}
                            disabled={disabled}
                            onClick={() => {
                                if (disabled) return
                                setSelected(accountItem)
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
                                secondaryTypographyProps={{ component: 'div' }}
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
                                <Radio checked={selectedAccountId === accountId} />
                            </ListItemSecondaryAction>
                        </ListItemButton>
                    )
                })}
            </List>
            <div className={classes.buttonWrap}>
                <LoadingButton
                    loading={loading}
                    fullWidth
                    variant="contained"
                    disabled={!selectedAccountId}
                    onClick={() => {
                        if (!selected) return
                        connect(selected)
                    }}>
                    <Trans>Connect</Trans>
                </LoadingButton>
            </div>
        </div>
    )
})
