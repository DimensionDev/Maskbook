import { ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import classNames from 'classnames'
import { currySameAddress, FungibleAsset, FungibleToken, isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, formatBalance, SchemaType } from '@masknet/web3-shared-evm'
import { TokenIcon } from '../TokenIcon'
import type { MaskSearchableListItemProps } from '@masknet/theme'
import { makeStyles, MaskLoadingButton } from '@masknet/theme'
import { some } from 'lodash-unified'
import { useCallback, useMemo } from 'react'
import { LoadingIcon } from '@masknet/icons'
import { useSharedI18N } from '../../../locales'
import { LoadingAnimation } from '../LoadingAnimation'
import BigNumber from 'bignumber.js'

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
}))

export const getERC20TokenListItem =
    (
        addedTokens: FungibleToken<ChainId, SchemaType.ERC20>[],
        externalTokens: FungibleToken<ChainId, SchemaType.ERC20>[],
        info: {
            from: 'search' | 'defaultList'
            inList: boolean
        },
        selectedTokens: string[],
        loadingAsset: boolean,
        account?: string,
    ) =>
    ({ data, onSelect }: MaskSearchableListItemProps<FungibleAsset<ChainId, SchemaType>>) => {
        const t = useSharedI18N()
        const { classes } = useStyles()
        // const [, addERC20Token] = useAddERC20TokenCallback()
        // const [, trustERC20Token] = useTrustERC20TokenCallback()
        const token = data

        if (!token) return null
        const { address, name, symbol, logoURL } = token
        const isNotAdded = some(externalTokens, (t: any) => isSameAddress(address, t.address))
        const isAdded = some(addedTokens, (t: any) => isSameAddress(address, t.address))

        const onImport = useCallback(
            async (event: React.MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation()
                if (!token || !account) return
                // await addERC20Token(token as FungibleToken<ChainId, SchemaType.ERC20>)
                // await trustERC20Token(account, token as FungibleToken<ChainId, SchemaType.ERC20>)
            },
            [token, account],
        )

        const handleTokenSelect = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation()
            onSelect(data)
        }

        const action = useMemo(() => {
            return !isNotAdded || isAdded || (info.inList && info.from === 'search') ? (
                data.balance === null ? null : (
                    <span>
                        {loadingAsset ? (
                            <LoadingAnimation />
                        ) : (
                            Number.parseFloat(
                                new BigNumber(formatBalance(data.balance ?? 0, token.decimals, 6)).toFixed(6),
                            )
                        )}
                    </span>
                )
            ) : (
                <MaskLoadingButton
                    variant="contained"
                    color="primary"
                    onClick={onImport}
                    size="small"
                    className={classes.importButton}
                    soloLoading
                    loadingIndicator={<LoadingIcon sx={{ fontSize: 14 }} />}>
                    {t.import()}
                </MaskLoadingButton>
            )
        }, [info, isNotAdded, isAdded, data.balance])

        return (
            <ListItem
                key={address}
                button
                className={`${classes.list} dashboard token-list`}
                onClick={handleTokenSelect}
                disabled={selectedTokens.some(currySameAddress(address))}>
                <ListItemIcon>
                    <TokenIcon classes={{ icon: classes.icon }} address={address} name={name} logoURL={logoURL} />
                </ListItemIcon>
                <ListItemText classes={{ primary: classes.text }}>
                    <Typography
                        className={classNames(classes.primary, isNotAdded ? classes.import : '')}
                        color="textPrimary"
                        component="span">
                        <span className={classes.symbol}>{symbol}</span>
                        <span className={`${classes.name} dashboard token-list-symbol`}>
                            {name}
                            {isAdded && <span> &bull; Added By User</span>}
                        </span>
                    </Typography>
                    <Typography sx={{ fontSize: 16 }} color="textSecondary" component="span">
                        {action}
                    </Typography>
                </ListItemText>
            </ListItem>
        )
    }
