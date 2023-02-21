import { FC, PropsWithChildren, useCallback, RefObject } from 'react'
import { groupBy, toPairs } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import { Icons } from '@masknet/icons'
import { TokenMenuList, AccountIcon, AddressItem, useTokenMenuCollectionList } from '@masknet/shared'
import type { SearchResultType } from '@masknet/web3-shared-base'
import { isSameAddress, SocialAccount } from '@masknet/web3-shared-base'
import { useSharedI18N } from '../../../locales/index.js'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { Divider, Typography, MenuItem } from '@mui/material'

const MENU_ITEM_HEIGHT = 40
const MENU_LIST_PADDING = 8

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

    addressMenu: {
        maxHeight: MENU_ITEM_HEIGHT * 9 + MENU_LIST_PADDING * 2,
        minWidth: 320,
        backgroundColor: theme.palette.maskColor.bottom,
        borderRadius: 16,
    },

    divider: {
        margin: theme.spacing(1, 0),
        width: 376,
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

export interface TokenWithSocialGroupProps {
    collectionList: Web3Helper.TokenResultAll[]
    currentCollection?: Web3Helper.TokenResultAll
    socialAccounts?: Array<SocialAccount<Web3Helper.ChainIdAll>>
    currentAddress?: string
    walletMenuOpen: boolean
    disablePortal?: boolean
    disableScrollLock?: boolean
    setWalletMenuOpen: (a: boolean) => void
    containerRef: RefObject<HTMLElement>
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

export const TokenWithSocialGroupMenu: FC<PropsWithChildren<TokenWithSocialGroupProps>> = ({
    currentCollection,
    collectionList: collectionList_,
    disablePortal = true,
    disableScrollLock = true,
    socialAccounts,
    currentAddress,
    containerRef,
    walletMenuOpen,
    setWalletMenuOpen,
    onAddressChange,
    fromSocialCard,
    onTokenChange,
    onClose,
}) => {
    const { classes } = useStyles()
    const t = useSharedI18N()

    const onSelect = useCallback(
        (value: Web3Helper.TokenResultAll, index: number) => {
            onTokenChange?.(value, index)
            onClose?.()
        },
        [onTokenChange, onClose],
    )

    const collectionList = useTokenMenuCollectionList(collectionList_)

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
        <ShadowRootMenu
            anchorEl={containerRef.current}
            open={walletMenuOpen}
            disablePortal={disablePortal}
            disableScrollLock={disableScrollLock}
            PaperProps={{
                className: classes.addressMenu,
            }}
            onClose={() => setWalletMenuOpen(false)}>
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
                {currentCollection && socialAccounts?.length ? (
                    <>
                        <Typography className={classes.groupName}>{t.address_viewer_address_name_address()}</Typography>
                        <Divider className={classes.divider} />
                    </>
                ) : null}
                {socialAccounts?.map((x) => {
                    return (
                        <MenuItem
                            className={classes.menuItem}
                            key={x.address}
                            value={x.address}
                            onClick={() => {
                                setWalletMenuOpen(false)
                                onAddressChange?.(x.address)
                            }}>
                            <div className={classes.addressItem}>
                                <AddressItem socialAccount={x} linkIconClassName={classes.secondLinkIcon} />
                                <AccountIcon socialAccount={x} />
                            </div>
                            {isSameAddress(currentAddress, x.address) && (
                                <Icons.CheckCircle size={20} className={classes.selectedIcon} />
                            )}
                        </MenuItem>
                    )
                })}
            </div>
        </ShadowRootMenu>
    )
}
