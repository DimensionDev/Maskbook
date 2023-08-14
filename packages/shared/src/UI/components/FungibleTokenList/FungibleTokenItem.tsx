import { memo, useMemo } from 'react'
import { Box, Link, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { formatBalance, type FungibleToken } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { TokenIcon } from '../TokenIcon/index.js'
import { Icons } from '@masknet/icons'
import { useFungibleTokenBalance, useNetworkDescriptor, useWeb3Others } from '@masknet/web3-hooks-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { makeStyles, LoadingBase, ActionButton } from '@masknet/theme'
import { useSharedI18N } from '../../../locales/index.js'
import { TokenListMode } from './type.js'
import { SettingSwitch } from '../SettingSwitch/index.js'
import { useTokenBlocked, useTokenTrusted } from './useTokenBlocked.js'
import { FormattedBalance } from '../../wallet/index.js'
import { DotLoading, ImageIcon } from '../index.js'
import { useAsyncFn } from 'react-use'

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 36,
        height: 36,
    },
    list: {
        maxHeight: '100%',
        height: 'calc(100% - 16px)',
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        borderRadius: theme.spacing(1),
        boxShadow:
            theme.palette.mode === 'dark' ? '0px 0px 20px rgba(255, 255, 255, 0.12)' : '0 0 20px rgba(0, 0, 0, 0.05)',
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
    badgeIcon: {
        position: 'absolute',
        right: -6,
        bottom: -4,
        border: `1px solid ${theme.palette.common.white}`,
        borderRadius: '50%',
    },
    dotLoadingWrapper: {
        display: 'flex',
        flexDirection: 'column-reverse',
        height: 15,
    },
}))

export const getFungibleTokenItem = <T extends NetworkPluginID>(
    getSource: (address: string) => 'personal' | 'official' | 'external' | 'official-native',
    isSelected: (address: string) => boolean,
    mode: TokenListMode,
    addOrRemoveTokenToLocal: (
        token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
        strategy: 'add' | 'remove',
    ) => Promise<void>,
    trustOrBlockTokenToLocal: (
        token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
        strategy: 'trust' | 'block',
    ) => Promise<void>,
    isHiddenChainIcon?: boolean,
    isCustomToken?: boolean,
) => {
    return memo(({ data, index, style }: any) => {
        const t = useSharedI18N()
        const { classes } = useStyles()
        const Others = useWeb3Others()

        const token = data.dataSet[index]
        const onSelect = data.onSelect

        const { chainId, address, name, symbol, decimals, logoURL, balance } = token

        const isBlocked = useTokenBlocked(address)
        const isTrust = useTokenTrusted(address, token.chainId)

        const networkDescriptor = useNetworkDescriptor(undefined, chainId)

        const { source, selected } = useMemo(() => {
            return {
                source: getSource(address),
                selected: isSelected(address),
            }
        }, [address, getSource, isSelected])

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
            return Others.explorerResolver.fungibleTokenLink(token.chainId, token.address)
        }, [token.address, token.chainId, Others.explorerResolver.fungibleTokenLink])

        const action = useMemo(() => {
            if (mode === TokenListMode.Manage) {
                if (source === 'personal')
                    return <Icons.TrashLine onClick={(e) => onAddOrRemoveTokenToLocal(e, 'remove')} size={24} />
                return (
                    <>
                        {isCustomToken ? (
                            <ActionButton
                                color="primary"
                                disabled={onAddOrRemoveTokenToLocalLoading}
                                loading={onAddOrRemoveTokenToLocalLoading}
                                className={classes.importButton}
                                onClick={(e) => onAddOrRemoveTokenToLocal(e, 'add')}>
                                {t.import()}
                            </ActionButton>
                        ) : (
                            <SettingSwitch
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
                        )}
                    </>
                )
            }
            return (
                <Typography className={classes.balance}>
                    {balance === undefined ? (
                        <LoadingBase size={24} />
                    ) : balance === '' ? null : (
                        <FormattedBalance
                            value={balance}
                            decimals={decimals}
                            significant={6}
                            formatter={formatBalance}
                        />
                    )}
                </Typography>
            )
        }, [balance, decimals, isBlocked, source, mode, isTrust])

        const { data: tokenBalance, isLoading: isLoadingTokenBalance } = useFungibleTokenBalance(
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
                    key={address}
                    button
                    className={`${classes.list} dashboard token-list`}
                    onClick={mode === TokenListMode.List ? () => onSelect(token) : undefined}
                    disabled={!!(selected && mode === TokenListMode.List)}>
                    <ListItemIcon>
                        <Box position="relative">
                            <TokenIcon
                                className={classes.icon}
                                chainId={chainId}
                                address={address}
                                name={name}
                                logoURL={logoURL}
                            />
                            {isHiddenChainIcon || !networkDescriptor?.icon ? null : (
                                <ImageIcon className={classes.badgeIcon} size={16} icon={networkDescriptor?.icon} />
                            )}
                        </Box>
                    </ListItemIcon>
                    <ListItemText classes={{ primary: classes.text }}>
                        <Typography className={classes.primary} color="textPrimary" component="span">
                            <span className={classes.symbol}>{symbol}</span>
                            <span className={`${classes.name} dashboard token-list-symbol`}>
                                {isCustomToken ? (
                                    isLoadingTokenBalance ? (
                                        <span className={classes.dotLoadingWrapper}>
                                            <DotLoading />
                                        </span>
                                    ) : (
                                        <FormattedBalance
                                            value={tokenBalance}
                                            decimals={decimals}
                                            significant={6}
                                            formatter={formatBalance}
                                        />
                                    )
                                ) : (
                                    <>
                                        <span className={classes.nameText}>{name}</span>
                                        <Link
                                            onClick={(event) => event.stopPropagation()}
                                            href={explorerLink}
                                            style={{ width: 18, height: 18 }}
                                            target="_blank"
                                            rel="noopener noreferrer">
                                            <Icons.PopupLink size={18} className={classes.link} />
                                        </Link>
                                    </>
                                )}
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
