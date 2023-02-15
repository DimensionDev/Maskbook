import { FC, PropsWithChildren, useCallback, useMemo, useContext } from 'react'
import { groupBy, toPairs } from 'lodash-es'
import { Icons } from '@masknet/icons'
import { openWindow } from '@masknet/shared-base-ui'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ChainId } from '@masknet/web3-shared-evm'
import { useSocialAccountsBySettings, FormattedAddress, AccountIcon, TokenMenuList } from '@masknet/shared'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { useI18N } from '../../../../utils/index.js'
import { EMPTY_LIST, CrossIsolationMessages } from '@masknet/shared-base'
import { SearchResultType, SocialIdentity, SocialAddressType } from '@masknet/web3-shared-base'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { Divider, MenuItem, Stack, Typography } from '@mui/material'
import { TrendingViewContext } from './context.js'

const useStyles = makeStyles()((theme) => ({
    socialMenu: {
        maxHeight: 600,
        width: 400,
        backgroundColor: theme.palette.maskColor.bottom,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        '& > ul': {
            paddingRight: '0 !important',
            width: '100% !important',
        },
        borderRadius: 16,
    },
    groupName: {
        height: 18,
        marginTop: 5,
        fontWeight: 700,
        fontSize: 14,
        padding: '0 12px',
    },
    menuItem: {
        display: 'flex',
        overflow: 'hidden',
        alignItems: 'center',
        height: 36,
        padding: '0 12px',
    },
    group: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    addressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },
    divider: {
        margin: theme.spacing(1, 0),
        width: 376,
        position: 'relative',
        left: 12,
    },
    addressIcon: {
        marginLeft: 4,
        color: theme.palette.maskColor.secondaryDark,
    },
}))

export interface SocialMenuProps {
    open: boolean
    anchorEl: HTMLElement | null
    isFromPopup: boolean
    optionList: Web3Helper.TokenResultAll[]
    identity?: SocialIdentity
    result: Web3Helper.TokenResultAll
    setActive?: (x: boolean) => void
    onChange?: (a: Web3Helper.TokenResultAll) => void
    onClose?: () => void
}

const menuGroupNameMap: Record<'FungibleToken' | 'NonFungibleToken' | 'NonFungibleCollection', string> = {
    FungibleToken: 'Token',
    NonFungibleToken: 'NFT',
    NonFungibleCollection: 'NFT',
}

export const SocialMenu: FC<PropsWithChildren<SocialMenuProps>> = ({
    open,
    result,
    optionList,
    isFromPopup = false,
    identity,
    setActive,
    anchorEl,
    onChange,
    onClose,
}) => {
    const { classes } = useStyles()
    const { badgeBounding } = useContext(TrendingViewContext)
    const { t } = useI18N()
    const onSelect = useCallback(
        (value: Web3Helper.TokenResultAll) => {
            onChange?.(value)
            onClose?.()
        },
        [onChange, onClose],
    )
    const { value: allSocialAccounts = EMPTY_LIST } = useSocialAccountsBySettings(identity)
    const socialAccount = allSocialAccounts[0]
    const { Others } = useWeb3State()

    const openRss3Profile = useCallback(() => {
        if (!isFromPopup) {
            return CrossIsolationMessages.events.hideSearchResultInspectorEvent.sendToLocal({ hide: true })
        }

        if (!identity?.identifier?.userId || !badgeBounding) return

        CrossIsolationMessages.events.profileCardEvent.sendToLocal({
            open: true,
            userId: identity?.identifier?.userId,
            badgeBounding,
            openFromTrendingCard: true,
        })
        onClose?.()
        setActive?.(false)
    }, [JSON.stringify(identity), isFromPopup, badgeBounding])

    const menuItems = useMemo(() => {
        const groups: Array<
            [
                type: SearchResultType.FungibleToken | SearchResultType.NonFungibleToken,
                optionList: Web3Helper.TokenResultAll[],
            ]
        > = toPairs(groupBy(optionList, (x) => x.type)).map(([type, optionList]) => [
            type as SearchResultType.FungibleToken | SearchResultType.NonFungibleToken,
            optionList,
        ])

        return groups
            .map(([type, groupOptions]) => (
                <div key={type} className={classes.group}>
                    <Typography className={classes.groupName}>{menuGroupNameMap[type]}</Typography>
                    <Divider className={classes.divider} />
                    <TokenMenuList options={groupOptions} result={result} onSelect={onSelect} />
                </div>
            ))
            .concat(
                socialAccount ? (
                    <div key="rss3" className={classes.group}>
                        <Typography className={classes.groupName}>{t('address')}</Typography>
                        <Divider className={classes.divider} />
                        <MenuItem key={socialAccount.address} className={classes.menuItem} onClick={openRss3Profile}>
                            <Stack className={classes.addressItem}>
                                <Typography
                                    fontSize={14}
                                    fontWeight={700}
                                    flexGrow={1}
                                    overflow="hidden"
                                    textOverflow="ellipsis">
                                    {socialAccount.supportedAddressTypes?.[0] === SocialAddressType.ENS ? (
                                        socialAccount.label
                                    ) : (
                                        <FormattedAddress
                                            address={socialAccount.address}
                                            size={4}
                                            formatter={Others?.formatAddress}
                                        />
                                    )}
                                </Typography>
                                <Icons.LinkOut
                                    className={classes.addressIcon}
                                    size={20}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        openWindow(
                                            Others?.explorerResolver.addressLink(
                                                ChainId.Mainnet,
                                                socialAccount.address,
                                            ),
                                        )
                                    }}
                                />
                                <AccountIcon socialAccount={socialAccount} />
                            </Stack>
                        </MenuItem>
                    </div>
                ) : (
                    []
                ),
            )
    }, [optionList, result, onSelect])

    return (
        <ShadowRootMenu
            open={open}
            onClose={onClose}
            anchorEl={anchorEl}
            PaperProps={{ className: classes.socialMenu }}>
            {menuItems}
        </ShadowRootMenu>
    )
}
