import { Icons } from '@masknet/icons'
import { AccountIcons, AddressItem, TokenMenuList, useTokenMenuCollectionList } from '@masknet/shared'
import type { SocialAccount } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { isSameAddress, type SearchResultType } from '@masknet/web3-shared-base'
import { Divider, Menu, MenuItem, Typography, type MenuProps } from '@mui/material'
import { groupBy, toPairs } from 'lodash-es'
import { memo, useCallback, type PropsWithChildren } from 'react'
import { Trans } from '@lingui/macro'

const MENU_ITEM_HEIGHT = 40

const useStyles = makeStyles()((theme) => ({
    groupName: {
        height: 18,
        marginTop: 5,
        fontWeight: 700,
        fontSize: 14,
        padding: '0 12px',
    },

    group: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },

    menuPaper: {
        padding: theme.spacing(2, 0),
        borderRadius: 16,
        boxShadow:
            theme.palette.mode === 'dark' ?
                '0px 4px 30px rgba(255, 255, 255, 0.15)'
            :   '0px 4px 30px rgba(0, 0, 0, 0.1)',
    },
    addressMenu: {
        maxHeight: MENU_ITEM_HEIGHT * 9,
        minWidth: 320,
        padding: 0,
        backgroundColor: theme.palette.maskColor.bottom,
        overflow: 'auto',
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': {
            display: 'none',
        },
    },

    divider: {
        margin: theme.spacing(1, 0),
        width: 'calc(100% - 24px)',
        color: theme.palette.maskColor.line,
        borderColor: theme.palette.maskColor.line,
        position: 'relative',
        left: 12,
    },
    menuItem: {
        height: MENU_ITEM_HEIGHT,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    addressItem: {
        display: 'flex',
        alignItems: 'center',
    },
    secondLinkIcon: {
        color: theme.palette.maskColor.secondaryDark,
    },
    selectedIcon: {
        color: theme.palette.maskColor.primary,
        marginLeft: theme.spacing(2),
    },
}))

export interface TokenWithSocialGroupProps extends PropsWithChildren<MenuProps> {
    collectionList: Web3Helper.TokenResultAll[]
    currentCollection?: Web3Helper.TokenResultAll
    socialAccounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>
    currentAddress?: string
    onTokenChange?: (a: Web3Helper.TokenResultAll, index: number) => void
    onClose?: () => void
    onAddressChange?: (address: string) => void
    fromSocialCard?: boolean
}

const menuGroupNameMap: Record<'FungibleToken' | 'NonFungibleToken' | 'NonFungibleCollection', string> = {
    FungibleToken: 'Token',
    NonFungibleToken: 'NFT',
    NonFungibleCollection: 'NFT',
}

export const TokenWithSocialGroupMenu = memo(function TokenWithSocialGroupMenu({
    currentCollection,
    collectionList: collectionList_,
    disablePortal = true,
    disableScrollLock = true,
    socialAccounts,
    currentAddress,
    onAddressChange,
    fromSocialCard,
    onTokenChange,
    onClose,
    ...rest
}: TokenWithSocialGroupProps) {
    const { classes } = useStyles()

    const onSelect = useCallback(
        (value: Web3Helper.TokenResultAll, index: number) => {
            onTokenChange?.(value, index)
            onClose?.()
        },
        [onTokenChange, onClose],
    )

    const collectionList = useTokenMenuCollectionList(collectionList_, currentCollection)

    const groups: Array<
        [
            type: SearchResultType.FungibleToken | SearchResultType.NonFungibleToken,
            collectionList: Web3Helper.TokenResultAll[],
        ]
    > = toPairs(groupBy(collectionList, (x) => x.type)).map(([type, collectionList]) => [
        type as SearchResultType.FungibleToken | SearchResultType.NonFungibleToken,
        collectionList,
    ])

    return (
        <Menu
            disablePortal={disablePortal}
            disableScrollLock={disableScrollLock}
            PaperProps={{
                className: classes.menuPaper,
            }}
            MenuListProps={{
                className: classes.addressMenu,
            }}
            onClose={onClose}
            {...rest}>
            {groups.map(([type, groupOptions]) => (
                <div key={type} className={classes.group}>
                    <Typography className={classes.groupName}>{menuGroupNameMap[type]}</Typography>
                    <Divider className={classes.divider} />
                    <TokenMenuList
                        options={groupOptions}
                        currentOption={currentCollection}
                        onSelect={onSelect}
                        fromSocialCard={fromSocialCard}
                    />
                </div>
            ))}

            <div key="rss3" className={classes.group}>
                {collectionList.length > 0 && socialAccounts?.length ?
                    <>
                        <Typography className={classes.groupName}>
                            <Trans>Address</Trans>
                        </Typography>
                        <Divider className={classes.divider} />
                    </>
                :   null}
                {socialAccounts?.map((x) => {
                    return (
                        <MenuItem
                            className={classes.menuItem}
                            key={x.address}
                            value={x.address}
                            onClick={() => {
                                onAddressChange?.(x.address)
                                onClose?.()
                            }}>
                            <div className={classes.addressItem}>
                                <AddressItem socialAccount={x} linkIconClassName={classes.secondLinkIcon} />
                                <AccountIcons socialAccount={x} />
                            </div>
                            {isSameAddress(currentAddress, x.address) && (
                                <Icons.CheckCircle size={20} className={classes.selectedIcon} />
                            )}
                        </MenuItem>
                    )
                })}
            </div>
        </Menu>
    )
})
