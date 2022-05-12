import { memo, useCallback } from 'react'
import { useAsync } from 'react-use'
import { ArrowDownCircle, ArrowUpCircle } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useContainer } from 'unstated-next'
import { WalletContext } from '../hooks/useWalletContext'
import { FormattedBalance, FormattedCurrency, TokenIcon } from '@masknet/shared'
import { getTokenUSDValue } from '../../../../../plugins/Wallet/helpers'
import { InteractionCircleIcon } from '@masknet/icons'
import { useI18N } from '../../../../../utils'
// import { PluginTransakMessages } from '../../../../../plugins/Transak/messages'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { formatBalance, formatCurrency } from '@masknet/web3-shared-evm'
import Services from '../../../../service'
import { compact, intersectionWith } from 'lodash-unified'
import urlcat from 'urlcat'
import { ActivityList } from '../components/ActivityList'
import { openWindow } from '@masknet/shared-base-ui'
import { useFungibleToken, useWallet } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()({
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 18,
    },
    tokenIcon: {
        width: 24,
        height: 24,
        marginBottom: 4,
    },
    balance: {
        fontSize: 14,
        lineHeight: '20px',
        color: '#1C68F3',
        fontWeight: 600,
    },
    text: {
        fontSize: 12,
        lineHeight: 1,
        color: '#7B8192',
    },
    controller: {
        display: 'grid',
        justifyContent: 'center',
        gap: 20,
        gridTemplateColumns: 'repeat(3,1fr)',
        marginTop: 20,
        '& > *': {
            textAlign: 'center',
            cursor: 'pointer',
        },
    },
    icon: {
        stroke: '#1C68F3',
        fill: 'none',
    },
})

const TokenDetail = memo(() => {
    return <></>
    // const { t } = useI18N()
    // const { classes } = useStyles()
    // const navigate = useNavigate()
    // const { currentToken } = useContainer(WalletContext)
    // const wallet = useWallet(NetworkPluginID.PLUGIN_EVM)
    // const { value: nativeToken } = useFungibleToken(NetworkPluginID.PLUGIN_EVM)

    // const { value: isActiveSocialNetwork } = useAsync(async () => {
    //     const urls = compact((await browser.tabs.query({ active: true })).map((tab) => tab.url))
    //     const definedSocialNetworkUrls = (await Services.SocialNetwork.getDefinedSocialNetworkUIs()).map(
    //         ({ networkIdentifier }) => networkIdentifier,
    //     )

    //     return !!intersectionWith(urls, definedSocialNetworkUrls, (a, b) => a.includes(b)).length
    // }, [])

    // const openBuyDialog = useCallback(async () => {
    //     if (isActiveSocialNetwork) {
    //         PluginTransakMessages.buyTokenDialogUpdated.sendToVisiblePages({
    //             open: true,
    //             address: wallet?.address ?? '',
    //             code: currentToken?.token.symbol ?? currentToken?.token.name,
    //         })
    //     } else {
    //         const url = urlcat('dashboard.html#', 'labs', {
    //             open: 'Transak',
    //             code: currentToken?.token.symbol ?? currentToken?.token.name,
    //         })
    //         openWindow(browser.runtime.getURL(url), 'BUY_DIALOG')
    //     }
    // }, [wallet?.address, isActiveSocialNetwork, currentToken])

    // const openSwapDialog = useCallback(async () => {
    //     const url = urlcat(
    //         'popups.html#/',
    //         PopupRoutes.Swap,
    //         !isSameAddress(nativeToken?.address, currentToken?.token.address)
    //             ? {
    //                   id: currentToken?.token.address,
    //                   name: currentToken?.token.name,
    //                   symbol: currentToken?.token.symbol,
    //                   contract_address: currentToken?.token.address,
    //                   decimals: currentToken?.token.decimals,
    //               }
    //             : {},
    //     )
    //     openWindow(browser.runtime.getURL(url), 'SWAP_DIALOG')
    // }, [currentToken, nativeToken])

    // if (!currentToken) return null

    // return (
    //     <>
    //         <div className={classes.content}>
    //             <TokenIcon
    //                 classes={{ icon: classes.tokenIcon }}
    //                 address={currentToken.token.address}
    //                 name={currentToken.token.name}
    //                 chainId={currentToken.token.chainId}
    //                 logoURL={currentToken.token.logoURI}
    //                 AvatarProps={{ sx: { width: 24, height: 24 } }}
    //             />
    //             <Typography className={classes.balance}>
    //                 <FormattedBalance
    //                     value={currentToken.balance}
    //                     decimals={currentToken.token.decimals}
    //                     symbol={currentToken.token.symbol}
    //                     significant={4}
    //                     formatter={formatBalance}
    //                 />
    //             </Typography>
    //             <Typography className={classes.text}>
    //                 <FormattedCurrency value={getTokenUSDValue(currentToken)} sign="$" formatter={formatCurrency} />
    //             </Typography>
    //             <div className={classes.controller}>
    //                 <div onClick={openBuyDialog}>
    //                     <ArrowDownCircle className={classes.icon} />
    //                     <Typography className={classes.text}>{t('popups_wallet_token_buy')}</Typography>
    //                 </div>
    //                 <div onClick={() => navigate(PopupRoutes.Transfer)}>
    //                     <ArrowUpCircle className={classes.icon} />
    //                     <Typography className={classes.text}>{t('popups_wallet_token_send')}</Typography>
    //                 </div>
    //                 <div onClick={openSwapDialog}>
    //                     <InteractionCircleIcon className={classes.icon} />
    //                     <Typography className={classes.text}>{t('popups_wallet_token_swap')}</Typography>
    //                 </div>
    //             </div>
    //         </div>
    //         <ActivityList tokenAddress={currentToken.token.address} />
    //     </>
    // )
})

export default TokenDetail
