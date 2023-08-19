import { memo, useMemo } from 'react'
import { Trans } from 'react-i18next'
import { Box, Link, Typography, useTheme } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { EMPTY_LIST, NetworkPluginID } from '@masknet/shared-base'
import {
    useChainContext,
    useChainIdSupport,
    useNetworkContext,
    useNonFungibleCollections,
    useWeb3Connection,
} from '@masknet/web3-hooks-base'
import { ExplorerResolver } from '@masknet/web3-providers'
import { CopyButton, TokenIcon } from '@masknet/shared'
import { Icons } from '@masknet/icons'
import { GasSettingMenu } from '../GasSettingMenu/index.js'
import type { TransactionDetail } from '../../pages/Wallet/type.js'
import { useI18N } from '../../../../utils/i18n-next-ui.js'
import type { GasConfig } from '@masknet/web3-shared-evm'
import { useQuery } from '@tanstack/react-query'
import { TokenType, isSameAddress } from '@masknet/web3-shared-base'

const useStyles = makeStyles()((theme) => ({
    title: {
        fontSize: 18,
        fontWeight: 700,
        textAlign: 'center',
        lineHeight: '22px',
    },
    tips: {
        fontSize: 12,
        fontWeight: 700,
        textAlign: 'center',
        color: theme.palette.maskColor.second,
        marginTop: theme.spacing(1.25),
    },
    tokenInfo: {
        background: theme.palette.maskColor.modalTitleBg,
        padding: theme.spacing(1),
        marginTop: theme.spacing(1.25),
        display: 'flex',
        alignItems: 'center',
        borderRadius: 99,
    },
    tokenIcon: {
        width: 24,
        height: 24,
        borderRadius: '50%',
    },
    name: {
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
    },
    address: {
        fontSize: 12,
        transform: 'scale(0.8333)',
        color: theme.palette.maskColor.second,
        fontWeight: 400,
        transformOrigin: 'left',
    },
    link: {
        width: 16,
        height: 16,
        color: theme.palette.maskColor.main,
    },
    amountInfo: {
        marginTop: theme.spacing(3.25),
        padding: theme.spacing(1.5),
        borderRadius: 8,
        border: `1px solid ${theme.palette.maskColor.line}`,
        display: 'flex',
        flexDirection: 'column',
        rowGap: 10,
    },
    spender: {
        color: theme.palette.maskColor.second,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
        display: 'flex',
        flexDirection: 'column',
    },
    spenderAddress: {
        marginTop: 4,
        color: theme.palette.maskColor.main,
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
        display: 'flex',
        alignItems: 'center',
        columnGap: 4,
    },
    gasFeeTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
}))

export interface UnlockERC721TokenProps {
    transaction: TransactionDetail

    paymentToken?: string
    onConfigChange: (config: GasConfig) => void
    onPaymentTokenChange: (paymentToken: string) => void
}

export const UnlockERC721Token = memo<UnlockERC721TokenProps>(function UnlockERC721Token({
    transaction,

    onConfigChange,
    onPaymentTokenChange,
    paymentToken,
}) {
    const { pluginID } = useNetworkContext()
    const { t } = useI18N()
    const { classes } = useStyles()
    const theme = useTheme()

    const { chainId, account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const isSupport1559 = useChainIdSupport(NetworkPluginID.PLUGIN_EVM, 'EIP1559', chainId)

    const connection = useWeb3Connection(pluginID, { chainId })

    const { data: contract } = useQuery({
        queryKey: ['nft-contract', chainId, transaction.computedPayload.to],
        queryFn: () => {
            if (!transaction.computedPayload.to) return
            return connection.getNonFungibleTokenContract(transaction.computedPayload.to, undefined, { chainId })
        },
    })

    const { data: collections = EMPTY_LIST } = useNonFungibleCollections(NetworkPluginID.PLUGIN_EVM, {
        chainId,
        account,
    })

    const collection = collections.find((x) => isSameAddress(contract?.address, x.address))

    const initConfig = useMemo(() => {
        if (!transaction?.computedPayload) return
        if (isSupport1559) {
            if (transaction.computedPayload.maxFeePerGas && transaction.computedPayload.maxPriorityFeePerGas)
                return {
                    maxFeePerGas: transaction.computedPayload.maxFeePerGas,
                    maxPriorityFeePerGas: transaction.computedPayload.maxPriorityFeePerGas,
                }
            return
        }

        if (!transaction.computedPayload.gasPrice) return

        return {
            gasPrice: transaction.computedPayload.gasPrice,
        }
    }, [transaction?.computedPayload, isSupport1559])

    if (!transaction.formattedTransaction) return null

    return (
        <Box>
            <Typography className={classes.title}>
                <Trans
                    i18nKey="popups_wallet_unlock_erc721_title"
                    components={{ br: <br /> }}
                    values={{ symbol: contract?.symbol }}
                />
            </Typography>
            <Typography className={classes.tips}>
                <Trans i18nKey="popups_wallet_unlock_erc721_tips" components={{ br: <br /> }} />
            </Typography>
            <Box className={classes.tokenInfo}>
                {contract?.address ? (
                    <TokenIcon
                        address={contract?.address}
                        name={contract?.name}
                        label=""
                        logoURL={collection?.iconURL ?? ''}
                        className={classes.tokenIcon}
                        tokenType={TokenType.NonFungible}
                    />
                ) : null}
                <Box width="262px" mr="18px" ml={1}>
                    <Typography className={classes.name}>{contract?.symbol}</Typography>
                    <Typography className={classes.address}>{contract?.address}</Typography>
                </Box>
                {contract?.address ? (
                    <Box display="flex" columnGap={1} alignItems="center">
                        <CopyButton text={contract.address} size={16} />
                        <Link
                            href={ExplorerResolver.addressLink(chainId, contract.address)}
                            className={classes.link}
                            target="_blank"
                            rel="noopener noreferrer">
                            <Icons.LinkOut size={16} />
                        </Link>
                    </Box>
                ) : null}
            </Box>
            <Box className={classes.amountInfo}>
                <Typography className={classes.name}>{t('popups_wallet_unlock_erc20_requested_by')}</Typography>
                {transaction.formattedTransaction.popup?.erc721Spender ? (
                    <Typography className={classes.spender}>
                        {t('contract')}:
                        <Typography className={classes.spenderAddress}>
                            {transaction.formattedTransaction.popup?.erc721Spender}{' '}
                            <Link
                                target="_blank"
                                rel="noopener noreferrer"
                                href={ExplorerResolver.addressLink(
                                    chainId,
                                    transaction.formattedTransaction.popup.erc721Spender,
                                )}
                                className={classes.link}
                                style={{ color: theme.palette.maskColor.second }}>
                                <Icons.LinkOut size={16} />
                            </Link>
                        </Typography>
                    </Typography>
                ) : null}
            </Box>

            <Box mt={3.75} display="flex" justifyContent="space-between" alignItems="center">
                <Typography className={classes.gasFeeTitle}>{t('popups_wallet_gas_fee')}</Typography>
                {transaction.computedPayload.gas && initConfig ? (
                    <GasSettingMenu
                        minimumGas={transaction.computedPayload.gas}
                        initConfig={initConfig}
                        onChange={onConfigChange}
                        onPaymentTokenChange={onPaymentTokenChange}
                        owner={transaction.owner}
                        paymentToken={paymentToken}
                        allowMaskAsGas={transaction.allowMaskAsGas}
                    />
                ) : null}
            </Box>
        </Box>
    )
})
