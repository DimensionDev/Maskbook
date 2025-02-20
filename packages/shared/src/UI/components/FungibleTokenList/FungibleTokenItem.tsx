import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, CheckBoxIndicator, LoadingBase, makeStyles } from '@masknet/theme'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useFungibleTokenBalance, useNetworkContext, useWeb3Utils } from '@masknet/web3-hooks-base'
import { formatBalance, type FungibleToken } from '@masknet/web3-shared-base'
import { Box, Link, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { memo, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { FormattedBalance } from '../../wallet/index.js'
import { DotLoading } from '../index.js'
import { SettingSwitch } from '../SettingSwitch/index.js'
import { TokenIcon } from '../TokenIcon/index.js'
import { TokenListMode } from './type.js'
import { useTokenBlocked, useTokenTrusted } from './useTokenBlocked.js'

const useStyles = makeStyles()((theme) => ({
    list: {
        maxHeight: '100%',
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(0.5),
        borderRadius: theme.spacing(1),
        backdropFilter: 'blur(16px)',
        '&:hover': {
            background: theme.palette.maskColor.bg,
        },
    },
    text: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    primary: {
        flex: 1,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        paddingRight: theme.spacing(1),
    },
    name: {
        display: 'flex',
        gap: theme.spacing(0.5),
        alignItems: 'center',
        lineHeight: '20px',
        color: theme.palette.maskColor.second,
    },
    nameText: {
        maxWidth: 400,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
    symbol: {
        lineHeight: '20px',
        fontSize: 16,
    },
    balance: {
        fontSize: 16,
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    importButton: {
        borderRadius: 99,
    },
    action: {
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    switch: {
        position: 'relative',
        left: theme.spacing(1),
    },
    link: {
        color: theme.palette.maskColor.second,
    },
    dotLoadingWrapper: {
        display: 'flex',
        flexDirection: 'column-reverse',
        height: 15,
    },
    disabled: {
        cursor: 'not-allowed',
    },
}))

type GetItemOptions<T extends NetworkPluginID> = {
    getSource: (address: string) => 'personal' | 'official' | 'external' | 'official-native'
    isSelected: (address: string, chainId: Web3Helper.ChainIdAll) => boolean
    mode: TokenListMode
    addOrRemoveTokenToLocal: (
        token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
        strategy?: 'add' | 'remove',
    ) => Promise<void>
    trustOrBlockTokenToLocal: (
        token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
        strategy: 'trust' | 'block',
    ) => Promise<void>
    isHiddenChainIcon?: boolean
    isCustomToken?: boolean
    enabled?: boolean
}

export const getFungibleTokenItem = <T extends NetworkPluginID>({
    getSource,
    isSelected,
    mode,
    addOrRemoveTokenToLocal,
    trustOrBlockTokenToLocal,
    isHiddenChainIcon,
    isCustomToken,
    enabled,
}: GetItemOptions<T>) => {
    return memo(({ data, index, style }: any) => {
        const { classes, theme } = useStyles()
        const Utils = useWeb3Utils()

        const token = data.dataSet[index]
        const onSelect = data.onSelect

        const { chainId, address, name, symbol, decimals, logoURL, balance } = token

        const isBlocked = useTokenBlocked(address)
        const isTrust = useTokenTrusted(address, token.chainId)

        const { pluginID } = useNetworkContext<T>()

        const source = useMemo(() => getSource(address), [getSource, address])
        const selected = useMemo(() => isSelected(address, chainId), [isSelected, address, chainId])

        const [{ loading: onAddOrRemoveTokenToLocalLoading }, onAddOrRemoveTokenToLocal] = useAsyncFn(
            async (event: React.MouseEvent<HTMLButtonElement | HTMLElement>, strategy: 'add' | 'remove') => {
                event.stopPropagation()
                if (token) await addOrRemoveTokenToLocal(token, strategy)
            },
            [token, addOrRemoveTokenToLocal],
        )

        const [{ loading: onTrustOrBlockTokenToLocalLoading }, onTrustOrBlockTokenToLocal] = useAsyncFn(
            async (event: React.ChangeEvent<HTMLInputElement>) => {
                event.stopPropagation()
                if (token) await trustOrBlockTokenToLocal(token, event.target.checked ? 'trust' : 'block')
            },
            [token, trustOrBlockTokenToLocal],
        )

        const explorerLink = useMemo(() => {
            return Utils.explorerResolver.fungibleTokenLink(token.chainId, token.address)
        }, [token.address, token.chainId, Utils.explorerResolver.fungibleTokenLink])

        const action = useMemo(() => {
            if (mode === TokenListMode.Manage) {
                if (source === 'personal')
                    return <Icons.TrashLine onClick={(e) => onAddOrRemoveTokenToLocal(e, 'remove')} size={24} />
                return (
                    <>
                        {isCustomToken ?
                            <ActionButton
                                size="small"
                                color="primary"
                                disabled={onAddOrRemoveTokenToLocalLoading}
                                loading={onAddOrRemoveTokenToLocalLoading}
                                className={classes.importButton}
                                onClick={(e) => onAddOrRemoveTokenToLocal(e, 'add')}>
                                <Trans>Import</Trans>
                            </ActionButton>
                        :   <SettingSwitch
                                disabled={
                                    (source === 'official-native' && mode === TokenListMode.Manage) ||
                                    onTrustOrBlockTokenToLocalLoading
                                }
                                classes={{ root: classes.switch }}
                                onChange={async (event) => {
                                    event.stopPropagation()
                                    event.preventDefault()
                                    await onTrustOrBlockTokenToLocal(event)
                                }}
                                size="small"
                                checked={!isBlocked}
                            />
                        }
                    </>
                )
            }
            if (mode === TokenListMode.Select) {
                return (
                    <CheckBoxIndicator
                        className={enabled || selected ? undefined : classes.disabled}
                        color={theme.palette.maskColor.primary}
                        checked={selected}
                        uncheckedColor={theme.palette.maskColor.secondaryLine}
                    />
                )
            }
            return (
                <Typography className={classes.balance}>
                    {balance === undefined ?
                        <LoadingBase size={24} />
                    : balance === '' ?
                        null
                    :   <FormattedBalance
                            value={balance}
                            decimals={decimals}
                            significant={6}
                            formatter={formatBalance}
                        />
                    }
                </Typography>
            )
        }, [balance, decimals, isBlocked, source, mode, isTrust])

        const { data: tokenBalance, isPending: isLoadingTokenBalance } = useFungibleTokenBalance(
            NetworkPluginID.PLUGIN_EVM,
            isCustomToken ? address : '',
            {
                chainId,
            },
        )

        return (
            <div style={style}>
                <ListItem
                    title={address}
                    button
                    className={`${classes.list} dashboard token-list`}
                    onClick={() => {
                        if (mode === TokenListMode.List) {
                            onSelect(token)
                        } else if (mode === TokenListMode.Select) {
                            addOrRemoveTokenToLocal(token)
                        }
                    }}
                    disabled={!!(selected && mode === TokenListMode.List)}>
                    <ListItemIcon>
                        <Box position="relative">
                            <TokenIcon
                                pluginID={pluginID}
                                chainId={chainId}
                                address={address}
                                name={name}
                                logoURL={logoURL}
                                disableBadge={isHiddenChainIcon}
                                size={36}
                                badgeSize={16}
                            />
                        </Box>
                    </ListItemIcon>
                    <ListItemText classes={{ primary: classes.text }}>
                        <Typography className={classes.primary} color="textPrimary" component="span">
                            <span className={classes.symbol}>{symbol}</span>
                            <span className={`${classes.name} dashboard token-list-symbol`}>
                                {isCustomToken ?
                                    isLoadingTokenBalance ?
                                        <span className={classes.dotLoadingWrapper}>
                                            <DotLoading />
                                        </span>
                                    :   <FormattedBalance
                                            value={tokenBalance}
                                            decimals={decimals}
                                            significant={6}
                                            formatter={formatBalance}
                                        />

                                :   <>
                                        <span className={classes.nameText}>{name}</span>
                                        <Link
                                            onClick={(event) => event.stopPropagation()}
                                            href={explorerLink}
                                            style={{ width: 18, height: 18 }}
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <Icons.PopupLink size={18} className={classes.link} />
                                        </Link>
                                        {token.isCustomToken ?
                                            <span>
                                                <Trans>Added by user</Trans>
                                            </span>
                                        :   null}
                                    </>
                                }
                            </span>
                        </Typography>
                        <Typography
                            className={classes.action}
                            sx={{ fontSize: 16 }}
                            color="textSecondary"
                            component="span">
                            {action}
                        </Typography>
                    </ListItemText>
                </ListItem>
            </div>
        )
    })
}
