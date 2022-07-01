import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import type { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { Loading as LoadingIcon } from '@masknet/icons'
import type { MaskSearchableListItemProps } from '@masknet/theme'
import { makeStyles, MaskLoadingButton } from '@masknet/theme'
import { LoadingAnimation, TokenIcon, useSharedI18N } from '@masknet/shared'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { Box } from '@mui/system'

import { toChainAddressEthers } from '../../../helpers'
import { SponsoredFarmIcon } from '../icons/SponsoredFarm'
import type { ChainAddress } from '../../../types'

const useStyles = makeStyles()((theme) => ({
    icon: {
        width: 36,
        height: 36,
    },
    list: {
        maxHeight: '100%',
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(1),
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
        display: 'block',
        lineHeight: '20px',
        fontSize: 16,
        // TODO: Should align dashboard and twitter theme in common component, depend twitter theme
        color: theme.palette.mode === 'dark' ? '#6E767D' : '#536471',
    },
    symbol: {
        lineHeight: '20px',
        fontSize: 16,
    },
    import: {
        '&:before': {
            content: '""',
            display: 'inline-block',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'transparent',
        },
    },
    importButton: {
        padding: '3px 0',
        borderRadius: 15,
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
    },
    metaInfo: {
        display: 'flex',
        alignItems: 'center',
    },
    typeIcon: {
        marginLeft: '5px',
    },
}))

export const getFungibleTokenItem =
    <T extends NetworkPluginID>(
        account: string,
        getSource: (address: string) => 'personal' | 'official' | 'external',
        getBalance: (address: string) => string,
        isSelected: (address: string) => boolean,
        isLoading: (address: string) => boolean,
        importToken: (
            token: FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>,
        ) => Promise<void>,
        referredTokensDefn: ChainAddress[],
    ) =>
    ({
        data: token,
        onSelect,
    }: MaskSearchableListItemProps<
        FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
    >) => {
        const t = useSharedI18N()
        const { classes } = useStyles()

        if (!token) return null
        const { address, name, symbol, decimals, logoURL, chainId } = token

        const { source, balance, selected, loading } = useMemo(() => {
            return {
                source: getSource(address),
                balance: getBalance(address),
                selected: isSelected(address),
                loading: isLoading(address),
            }
        }, [address, getSource, getBalance, isSelected, isLoading])

        const tokenChainAddr = toChainAddressEthers(chainId, address)
        const tokenHasFarm = referredTokensDefn.includes(tokenChainAddr)

        const onImport = useCallback(
            async (event: React.MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation()
                if (token) importToken(token)
            },
            [token, importToken],
        )

        const handleTokenSelect = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            onSelect(token)
        }

        const action = useMemo(() => {
            return source !== 'external' ? (
                <span>{loading ? <LoadingAnimation /> : null}</span>
            ) : (
                <MaskLoadingButton
                    color="primary"
                    onClick={onImport}
                    size="small"
                    className={classes.importButton}
                    soloLoading
                    loadingIndicator={<LoadingIcon size={14} />}>
                    {t.import()}
                </MaskLoadingButton>
            )
        }, [balance, decimals, loading])

        return (
            <ListItem
                key={address}
                button
                className={`${classes.list} dashboard token-list`}
                onClick={handleTokenSelect}
                disabled={selected}>
                <ListItemIcon>
                    <TokenIcon classes={{ icon: classes.icon }} address={address} name={name} logoURL={logoURL} />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.text }}>
                    <Typography
                        className={classNames(classes.primary, source === 'external' ? classes.import : '')}
                        color="textPrimary"
                        component="span">
                        <div className={classes.metaInfo}>
                            <span className={classes.symbol}>{symbol}</span>{' '}
                            {tokenHasFarm && (
                                <Box className={classes.typeIcon}>
                                    <SponsoredFarmIcon />
                                </Box>
                            )}
                        </div>
                        <span className={`${classes.name} dashboard token-list-symbol`}>
                            {name}
                            {source === 'personal' && <span> &bull; Added By User</span>}
                        </span>
                    </Typography>
                    <Typography sx={{ fontSize: 16 }} color="textSecondary" component="span">
                        {action}
                    </Typography>
                </ListItemText>
            </ListItem>
        )
    }
