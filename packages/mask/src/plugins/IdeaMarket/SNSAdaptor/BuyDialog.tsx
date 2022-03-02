import { Card, CardActions, CardContent, DialogContent, Typography } from '@mui/material'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumTokenType, useFungibleTokenWatched } from '@masknet/web3-shared-evm'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { useMemo, useState } from 'react'
import { leftShift } from '@masknet/web3-shared-base'
import { SelectTokenAmountPanel } from '../../ITO/SNSAdaptor/SelectTokenAmountPanel'

const useStyles = makeStyles()((theme) => {
    return {
        root: {
            marginLeft: theme.spacing(-0.5),
            marginRight: theme.spacing(-0.5),
        },
        content: {
            padding: theme.spacing(0),
        },
        button: {
            flex: 1,
            margin: `${theme.spacing(0)} ${theme.spacing(0.5)}`,
        },
    }
})

interface BuyDialogProps {
    open: boolean
    onClose: () => void
}

export function BuyDialog(props: BuyDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { open, onClose } = props
    const defaultToken = '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'

    const { token, balance } = useFungibleTokenWatched({ type: EthereumTokenType.ERC20, address: defaultToken ?? '' })
    const [ToS_Checked, setToS_Checked] = useState(false)

    const validationMessage = useMemo(() => {
        const balance_ = leftShift(balance.value ?? '0', token.value?.decimals)

        // if (balance_.isZero() || price.isGreaterThan(balance_)) return t('plugin_collectible_insufficient_balance')
        if (!ToS_Checked) return t('plugin_artblocks_check_tos_document')

        return ''
    }, [balance.value, token.value?.decimals, ToS_Checked])

    return (
        <InjectedDialog title="Tests" open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        <Typography>test</Typography>
                        <SelectTokenAmountPanel
                            amount="0"
                            balance="0"
                            onAmountChange={() => console.log('amount change')}
                            onTokenChange={() => console.log('token change')}
                        />
                    </CardContent>
                    <CardActions>
                        <EthereumWalletConnectedBoundary>
                            {/* {token.value?.type === EthereumTokenType.Native ? ( */}
                            <ActionButton
                                className={classes.button}
                                // disabled={!!validationMessage}
                                color="primary"
                                variant="contained"
                                // onClick={purchaseCallback}
                                fullWidth>
                                {validationMessage ? t('plugin_artblocks_purchase') : t('plugin_artblocks_purchasing')}
                            </ActionButton>
                            {/* ) : null} */}
                            {/* {token.value?.type === EthereumTokenType.ERC20 ? (
                                <EthereumERC20TokenApprovedBoundary
                                    amount={project.pricePerTokenInWei}
                                    spender={spender}
                                    token={token.value as ERC20TokenDetailed}>
                                    <ActionButton
                                        className={classes.button}
                                        disabled={!!validationMessage}
                                        color="primary"
                                        variant="contained"
                                        onClick={onCheckout}
                                        fullWidth>
                                        {validationMessage || isTransaction
                                            ? t('plugin_artblocks_purchase')
                                            : t('plugin_artblocks_purchasing')}
                                    </ActionButton>
                                </EthereumERC20TokenApprovedBoundary>
                            ) : null} */}
                        </EthereumWalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
