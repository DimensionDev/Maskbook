import { InjectedDialog, TokenAmountPanel, useOpenShareTxDialog } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { leftShift } from '@masknet/web3-shared-base'
import {
    ERC20TokenDetailed,
    EthereumTokenType,
    FungibleTokenDetailed,
    useArtBlocksConstants,
    useFungibleTokenWatched,
} from '@masknet/web3-shared-evm'
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
import { useCallback, useMemo, useState } from 'react'
import { Trans } from 'react-i18next'
import { usePostLink } from '../../../components/DataSource/usePostInfo'
import ActionButton from '../../../extension/options-page/DashboardComponents/ActionButton'
import { activatedSocialNetworkUI } from '../../../social-network'
import { isFacebook } from '../../../social-network-adaptor/facebook.com/base'
import { isTwitter } from '../../../social-network-adaptor/twitter.com/base'
import { useI18N } from '../../../utils'
import { EthereumERC20TokenApprovedBoundary } from '../../../web3/UI/EthereumERC20TokenApprovedBoundary'
import { EthereumWalletConnectedBoundary } from '../../../web3/UI/EthereumWalletConnectedBoundary'
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
    const [isPurchasing, purchaseCallback] = usePurchaseCallback(
        project.projectId,
        project.pricePerTokenInWei,
        token.value?.type,
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
    const purchase = useCallback(async () => {
        const hash = await purchaseCallback()
        if (hash) {
            await openShareTxDialog({
                hash,
                onShare() {
                    activatedSocialNetworkUI.utils.share?.(shareText)
                },
            })
            onClose()
        }
    }, [openShareTxDialog, onClose])
    const { GEN_ART_721_MINTER: spender } = useArtBlocksConstants()

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
                        <EthereumWalletConnectedBoundary>
                            {token.value?.type === EthereumTokenType.Native ? (
                                <ActionButton
                                    className={classes.button}
                                    disabled={!!validationMessage}
                                    color="primary"
                                    variant="contained"
                                    onClick={purchase}
                                    fullWidth>
                                    {validationMessage || isPurchasing
                                        ? t('plugin_artblocks_purchase')
                                        : t('plugin_artblocks_purchasing')}
                                </ActionButton>
                            ) : null}
                            {token.value?.type === EthereumTokenType.ERC20 ? (
                                <EthereumERC20TokenApprovedBoundary
                                    amount={project.pricePerTokenInWei}
                                    spender={spender}
                                    token={token.value as ERC20TokenDetailed}>
                                    <ActionButton
                                        loading={isPurchasing}
                                        className={classes.button}
                                        disabled={!!validationMessage}
                                        color="primary"
                                        variant="contained"
                                        onClick={purchase}
                                        fullWidth>
                                        {validationMessage || !isPurchasing
                                            ? t('plugin_artblocks_purchase')
                                            : t('plugin_artblocks_purchasing')}
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
