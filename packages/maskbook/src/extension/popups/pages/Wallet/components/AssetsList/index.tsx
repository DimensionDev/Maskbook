import { memo, useCallback } from 'react'
import type { Asset } from '@masknet/web3-shared-evm'
import { List, ListItem, ListItemText } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ArrowRightIcon } from '@masknet/icons'
import { TokenIcon, FormattedBalance } from '@masknet/shared'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../../hooks/useWalletContext'
import { useHistory } from 'react-router-dom'
import { PopupRoutes } from '../../../../index'

const useStyles = makeStyles()({
    list: {
        backgroundColor: '#ffffff',
        padding: 0,
    },
    item: {
        padding: 14,
        borderBottom: '1px solid #F7F9FA',
        cursor: 'pointer',
    },
    tokenIcon: {
        width: 20,
        height: 20,
    },
    arrow: {
        stroke: '#15181B',
        fill: 'none',
        fontSize: 20,
    },
    text: {
        margin: '0 0 0 15px',
    },
    symbol: {
        color: '#1C68F3',
        fontSize: 14,
    },
    balance: {
        fontSize: 14,
    },
})

export const AssetsList = memo(() => {
    const history = useHistory()
    const { assets, setCurrentToken } = useContainer(WalletContext)
    const onItemClick = useCallback((asset: Asset) => {
        setCurrentToken(asset)
        history.push(PopupRoutes.TokenDetail)
    }, [])
    return <AssetsListUI dataSource={assets} onItemClick={onItemClick} />
})

export interface AssetsListUIProps {
    dataSource: Asset[]
    onItemClick: (token: Asset) => void
}

export const AssetsListUI = memo<AssetsListUIProps>(({ dataSource, onItemClick }) => {
    const { classes } = useStyles()
    return (
        <List dense className={classes.list}>
            {dataSource.map((asset, index) => {
                return (
                    <ListItem key={index} className={classes.item} onClick={() => onItemClick(asset)}>
                        <TokenIcon
                            classes={{ icon: classes.tokenIcon }}
                            address={asset.token.address}
                            name={asset.token.name}
                            chainId={asset.token.chainId}
                            logoURI={asset.token.logoURI}
                            AvatarProps={{ sx: { width: 20, height: 20 } }}
                        />
                        <ListItemText className={classes.text}>
                            <FormattedBalance
                                value={asset.balance}
                                decimals={asset.token.decimals}
                                symbol={asset.token.symbol}
                                classes={{ symbol: classes.symbol, balance: classes.balance }}
                                significant={6}
                            />
                        </ListItemText>
                        <ArrowRightIcon className={classes.arrow} style={{ fill: 'none' }} />
                    </ListItem>
                )
            })}
        </List>
    )
})
