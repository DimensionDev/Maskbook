import { useI18N } from '../../../utils'
import { makeStyles } from '@masknet/theme'
import {
    Card,
    CardActions,
    CardContent,
    Checkbox,
    DialogContent,
    FormControlLabel,
    Link,
    Typography,
} from '@mui/material'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
import {
    ERC20TokenDetailed,
    EthereumTokenType,
    FungibleTokenDetailed,
    useArtBlocksConstants,
    useFungibleTokenWatched,
} from '@masknet/web3-shared-evm'
import { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import { usePurchaseCallback } from '../hooks/usePurchaseCallback'
import { TokenAmountPanel } from '@masknet/shared'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { leftShift } from '@masknet/web3-shared-base'
import type { Project } from '../types'

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

export interface ActionBarProps {
    project: Project
    open: boolean
    onClose: () => void
}

export function PurchaseDialog(props: ActionBarProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { project, open, onClose } = props

    const { token, balance } = useFungibleTokenWatched({
        type: project.currencySymbol === 'ETH' || !project.currencySymbol ? 0 : 1,
        address: project.currencyAddress ? project.currencyAddress : '',
    })

    const [ToS_Checked, setToS_Checked] = useState(false)
    const [purchaseState, purchaseCallback] = usePurchaseCallback(
        project.projectId,
        project.pricePerTokenInWei,
        token.value?.type,
    )
    const { GEN_ART_721_MINTER: spender } = useArtBlocksConstants()

    const onCheckout = useCallback(() => {
        purchaseCallback()
    }, [usePurchaseCallback])

    const price = useMemo(() => {
        return leftShift(project.pricePerTokenInWei, token.value?.decimals)
    }, [project.pricePerTokenInWei, token.value?.decimals])

    const validationMessage = useMemo(() => {
        const balance_ = leftShift(balance.value ?? '0', token.value?.decimals)

        if (balance_.isZero() || price.isGreaterThan(balance_)) return t('plugin_collectible_insufficient_balance')
        if (!ToS_Checked) return t('plugin_artblocks_check_tos_document')

        return ''
    }, [price, balance.value, token.value?.decimals, ToS_Checked])

    return (
        <InjectedDialog title={t('plugin_artblocks_purchase')} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        <TokenAmountPanel
                            label={t('plugin_artblocks_price_per_mint')}
                            amount={price.toString()}
                            balance={balance.value ?? '0'}
                            token={token.value as FungibleTokenDetailed}
                            onAmountChange={() => {
                                return
                            }}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="primary"
                                    checked={ToS_Checked}
                                    onChange={(ev: ChangeEvent<HTMLInputElement>) => setToS_Checked(ev.target.checked)}
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    <Trans
                                        i18nKey="plugin_artblocks_legal_text"
                                        components={{
                                            terms: (
                                                <Link
                                                    color="primary"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href="https://www.artblocks.io/tos.pdf"
                                                />
                                            ),
                                        }}
                                    />
                                </Typography>
                            }
                        />
                    </CardContent>
                    <CardActions>
                        <EthereumWalletConnectedBoundary>
                            {token.value?.type === EthereumTokenType.Native ? (
                                <ActionButton
                                    className={classes.button}
                                    disabled={!!validationMessage}
                                    color="primary"
                                    variant="contained"
                                    onClick={purchaseCallback}
                                    fullWidth>
                                    {validationMessage || t('plugin_artblocks_purchase')}
                                </ActionButton>
                            ) : null}
                            {token.value?.type === EthereumTokenType.ERC20 ? (
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
                                        {validationMessage || t('plugin_artblocks_purchase')}
                                    </ActionButton>
                                </EthereumERC20TokenApprovedBoundary>
                            ) : null}
                        </EthereumWalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
