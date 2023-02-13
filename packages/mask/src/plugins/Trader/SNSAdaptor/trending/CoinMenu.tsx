import { FC, PropsWithChildren, useCallback, useMemo } from 'react'
import { groupBy, toPairs, isEqual } from 'lodash-es'
import { Icons } from '@masknet/icons'
import type { Web3Helper } from '@masknet/web3-helpers'
import { TokenIcon, useSocialAccountsBySettings, FormattedAddress } from '@masknet/shared'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { useI18N } from '../../../../utils/index.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { SearchResultType, SocialIdentity, SocialAddressType } from '@masknet/web3-shared-base'
import { makeStyles, ShadowRootMenu } from '@masknet/theme'
import { RadioButtonUnchecked as RadioButtonUncheckedIcon } from '@mui/icons-material'
import { Divider, MenuItem, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/system'
import type { Coin } from '../../types/index.js'

const useStyles = makeStyles()((theme) => ({
    coinMenu: {
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
        fontWeight: 'bold',
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
    itemText: {
        flexDirection: 'row',
        flexGrow: 1,
        justifyContent: 'space-around',
        gap: theme.spacing(1),
        alignItems: 'center',
        overflow: 'hidden',
    },
    itemCheckout: {
        display: 'flex',
        alignItems: 'center',
    },
    divider: {
        margin: theme.spacing(1, 0),
        width: 376,
        position: 'relative',
        left: 12,
    },
    rank: {
        marginRight: 4,
    },
    name: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    symbol: {
        marginLeft: theme.spacing(0.5),
    },
    coinIcon: {
        marginRight: 4,
    },
    checkedIcon: {
        filter: 'drop-shadow(0px 4px 10px rgba(28, 104, 243, 0.2))',
        color: theme.palette.maskColor.primary,
    },
}))

export interface CoinMenuOption {
    coin: Coin
    value: string
}
interface TokenMenuListProps {
    options: Web3Helper.TokenResultAll[]
    result: Web3Helper.TokenResultAll
    onSelect(value: Web3Helper.TokenResultAll): void
}

const TokenMenuList: FC<TokenMenuListProps> = ({ options, result, onSelect }) => {
    const { classes } = useStyles()
    const theme = useTheme()
    return (
        <>
            {options.map((x, i) => {
                const selected = isEqual(x, result)
                return (
                    <MenuItem className={classes.menuItem} key={i} onClick={() => onSelect(x)}>
                        <TokenIcon
                            className={classes.coinIcon}
                            logoURL={x.logoURL}
                            address={x.address || ''}
                            symbol={x.symbol}
                            size={20}
                        />

                        <Stack className={classes.itemText}>
                            <Typography
                                fontSize={14}
                                fontWeight={700}
                                flexGrow={1}
                                overflow="hidden"
                                textOverflow="ellipsis">
                                <span className={classes.name}>{x.name}</span>
                                {x.symbol ? <span className={classes.symbol}>({x.symbol})</span> : null}
                            </Typography>
                            <div className={classes.itemCheckout}>
                                {x.rank ? (
                                    <Typography
                                        fontSize={14}
                                        fontWeight={700}
                                        flexGrow={1}
                                        overflow="hidden"
                                        className={classes.rank}
                                        textOverflow="ellipsis">
                                        #{x.rank}
                                    </Typography>
                                ) : null}
                                {selected ? (
                                    <Icons.CheckCircle size={20} className={classes.checkedIcon} />
                                ) : (
                                    <RadioButtonUncheckedIcon
                                        style={{ fontSize: 20, color: theme.palette.maskColor.secondaryLine }}
                                    />
                                )}
                            </div>
                        </Stack>
                    </MenuItem>
                )
            })}
        </>
    )
}

export interface CoinMenuProps {
    open: boolean
    anchorEl: HTMLElement | null
    optionList: Web3Helper.TokenResultAll[]
    identity?: SocialIdentity
    result: Web3Helper.TokenResultAll
    onChange?: (a: Web3Helper.TokenResultAll) => void
    onClose?: () => void
}

const menuGroupNameMap: Record<'FungibleToken' | 'NonFungibleToken' | 'NonFungibleCollection', string> = {
    FungibleToken: 'Token',
    NonFungibleToken: 'NFT',
    NonFungibleCollection: 'NFT',
}

export const CoinMenu: FC<PropsWithChildren<CoinMenuProps>> = ({
    open,
    result,
    optionList,
    identity,
    anchorEl,
    onChange,
    onClose,
}) => {
    const { classes } = useStyles()
    const { t } = useI18N()
    const onSelect = useCallback(
        (value: Web3Helper.TokenResultAll) => {
            onChange?.(value)
            onClose?.()
        },
        [onChange, onClose],
    )
    const { value: allSocialAccounts = EMPTY_LIST } = useSocialAccountsBySettings(identity)
    const { Others } = useWeb3State()

    const openRss3Profile = useCallback(() => {
        onClose?.()
    }, [onClose])

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
                <div key="rss3" className={classes.group}>
                    <Typography className={classes.groupName}>{t('address')}</Typography>
                    <Divider className={classes.divider} />
                    {allSocialAccounts.map((x, i) => (
                        <MenuItem key={x.address} className={classes.menuItem} onClick={openRss3Profile}>
                            <Typography
                                fontSize={14}
                                fontWeight={700}
                                flexGrow={1}
                                overflow="hidden"
                                textOverflow="ellipsis">
                                {x.supportedAddressTypes?.[0] === SocialAddressType.ENS ? (
                                    x.label
                                ) : (
                                    <FormattedAddress address={x.address} size={4} formatter={Others?.formatAddress} />
                                )}
                            </Typography>
                        </MenuItem>
                    ))}
                </div>,
            )
    }, [optionList, result, onSelect])

    return (
        <ShadowRootMenu open={open} onClose={onClose} anchorEl={anchorEl} PaperProps={{ className: classes.coinMenu }}>
            {menuItems}
        </ShadowRootMenu>
    )
}
