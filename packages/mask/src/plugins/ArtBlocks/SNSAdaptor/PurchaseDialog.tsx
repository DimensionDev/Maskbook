import { useCallback, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import { InjectedDialog, TokenAmountPanel, useOpenShareTxDialog, useShowConfirm } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { FungibleToken, leftShift, NetworkPluginID } from '@masknet/web3-shared-base'
import { SchemaType, useArtBlocksConstants, ChainId } from '@masknet/web3-shared-evm'
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
import { WalletConnectedBoundary } from '../../../web3/UI/WalletConnectedBoundary'
import { useFungibleTokenWatched } from '@masknet/plugin-infra/web3'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { useI18N } from '../../../utils'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { usePurchaseCallback } from '../hooks/usePurchaseCallback'
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
    chainId: ChainId
    project: Project
    open: boolean
    onClose: () => void
}

export function PurchaseDialog(props: ActionBarProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const { project, open, onClose, chainId } = props

    const { token, balance } = useFungibleTokenWatched(
        NetworkPluginID.PLUGIN_EVM,
        project.currencyAddress ? project.currencyAddress : '',
    )

    const [ToS_Checked, setToS_Checked] = useState(false)
    const [{ loading: isPurchasing }, purchaseCallback] = usePurchaseCallback(
        chainId,
        project.projectId,
        project.pricePerTokenInWei,
        token.value?.schema,
    )
    const price = useMemo(
        () => leftShift(project.pricePerTokenInWei, token.value?.decimals),
        [project.pricePerTokenInWei, token.value?.decimals],
    )
    const postLink = usePostLink()

    const shareText = [
        t(
            isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                ? 'plugin_artblocks_share'
                : 'plugin_artblocks_share_no_official_account',
            {
                name: project.name,
                price,
                symbol: token.value?.symbol,
            },
        ),
        '#mask_io #artblocks_io #nft',
        postLink,
    ].join('\n')
    const openShareTxDialog = useOpenShareTxDialog()
    const showConfirm = useShowConfirm()
    const purchase = useCallback(async () => {
        try {
            const hash = await purchaseCallback()
            if (typeof hash !== 'string') return
            await openShareTxDialog({
                hash,
                onShare() {
                    activatedSocialNetworkUI.utils.share?.(shareText)
                },
            })
            onClose()
        } catch (err: any) {
            showConfirm({
                title: 'Error',
                content: err.message,
            })
        }
    }, [openShareTxDialog, onClose])
    const { GEN_ART_721_MINTER: spender } = useArtBlocksConstants()

    const validationMessage = useMemo(() => {
        const balance_ = leftShift(balance.value ?? '0', token.value?.decimals)

        if (balance_.isZero() || price.isGreaterThan(balance_)) return t('plugin_collectible_insufficient_balance')
        if (!ToS_Checked) return t('plugin_artblocks_check_tos_document')

        return ''
    }, [price, balance.value, token.value?.decimals, ToS_Checked])

    const actionButton = (
        <ActionButton
            loading={isPurchasing}
            className={classes.button}
            disabled={!!validationMessage || isPurchasing}
            color="primary"
            onClick={purchase}
            fullWidth>
            {validationMessage || (isPurchasing ? t('plugin_artblocks_purchasing') : t('plugin_artblocks_purchase'))}
        </ActionButton>
    )

    return (
        <InjectedDialog title={t('plugin_artblocks_purchase')} open={open} onClose={onClose}>
            <DialogContent className={classes.content}>
                <Card elevation={0}>
                    <CardContent>
                        <TokenAmountPanel
                            label={t('plugin_artblocks_price_per_mint')}
                            amount={price.toString()}
                            balance={balance.value ?? '0'}
                            token={token.value as FungibleToken<ChainId, SchemaType>}
                            onAmountChange={() => {}}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="primary"
                                    checked={ToS_Checked}
                                    onChange={(event) => setToS_Checked(event.target.checked)}
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
                        <WalletConnectedBoundary>
                            {token.value?.schema === SchemaType.Native ? actionButton : null}
                            {token.value?.schema === SchemaType.ERC20 ? (
                                <EthereumERC20TokenApprovedBoundary
                                    amount={project.pricePerTokenInWei}
                                    spender={spender}
                                    token={token.value}>
                                    {actionButton}
                                </EthereumERC20TokenApprovedBoundary>
                            ) : null}
                        </WalletConnectedBoundary>
                    </CardActions>
                </Card>
            </DialogContent>
        </InjectedDialog>
    )
}
