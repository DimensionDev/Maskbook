import { Icons } from '@masknet/icons'
import { InjectedDialog, InjectedDialogProps } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { useCurrentWeb3NetworkPluginID, useNonFungibleAsset, useWeb3State } from '@masknet/web3-hooks-base'
import { SourceType } from '@masknet/web3-shared-base'
import { Box, Button, DialogActions, DialogContent, Typography } from '@mui/material'
import type { FC, PropsWithChildren } from 'react'
import { CollectibleCard } from '../../../../extension/options-page/DashboardComponents/CollectibleList/CollectibleCard.js'
import type { TipContextOptions } from '../../contexts'
import { useI18N } from '../../locales/index.js'
import { TipsType } from '../../types/tip.js'

const useStyles = makeStyles()((theme) => ({
    confirmDialog: {
        width: 420,
        height: 420,
        backgroundImage: 'none',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        justifyItems: 'center',
        padding: theme.spacing(3),
        boxSizing: 'border-box',
        color: theme.palette.text.primary,
        textAlign: 'center',
        fontSize: 18,
    },

    congratulation: {
        fontFamily: 'Helvetica',
        fontWeight: 700,
        fontSize: '20px',
        lineHeight: '24px',
        color: theme.palette.maskColor.success,
    },
    actions: {
        padding: theme.spacing(0, 3, 3),
    },
    nftContainer: {
        height: 126,
        width: 126,
        boxShadow: '0px 6px 12px rgba(253, 194, 40, 0.2)',
    },
    nftName: {
        display: 'flex',
        fontFamily: 'Helvetica',
        marginTop: 10,
    },
    nftMessage: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    collectibleCard: {
        width: '100%',
        height: '100%',
        aspectRatio: '1/1',
        borderRadius: theme.spacing(1),
        overflow: 'hidden',
    },
    messageText: {
        fontSize: 16,
        color: theme.palette.maskColor.second,
        lineHeight: '30px',
    },
}))

export interface ConfirmModalProps
    extends PropsWithChildren<InjectedDialogProps>,
        Pick<TipContextOptions, 'amount' | 'tipType' | 'token' | 'nonFungibleTokenContract' | 'nonFungibleTokenId'> {
    confirmText?: string
    onConfirm?(): void
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
    className,
    confirmText,
    onConfirm,
    children,
    amount,
    tipType,
    token,
    nonFungibleTokenContract,
    nonFungibleTokenId,
    ...rest
}) => {
    const { Others } = useWeb3State()
    const { classes } = useStyles()
    const t = useI18N()
    const pluginID = useCurrentWeb3NetworkPluginID()
    confirmText = confirmText || 'Confirm'
    const isTokenTip = tipType === TipsType.Tokens
    const { value: nonFungibleToken } = useNonFungibleAsset(
        undefined,
        nonFungibleTokenContract?.address,
        nonFungibleTokenId ?? '',
    )
    const uiTokenId = Others?.formatTokenId(nonFungibleToken?.tokenId)
    return (
        <InjectedDialog
            classes={{
                paper: classes.confirmDialog,
            }}
            BackdropProps={{
                style: {
                    opacity: 0,
                },
            }}
            {...rest}>
            <DialogContent className={classes.content}>
                {isTokenTip ? (
                    <Box>
                        <Icons.Success size={75} />
                        <Typography className={classes.congratulation} mt="19.5px">
                            Congratulations!
                        </Typography>
                        <Typography className={classes.messageText} mt="41px">
                            {t.send_specific_tip_successfully({
                                amount,
                                name: `$${token?.symbol}`,
                            })}
                        </Typography>
                    </Box>
                ) : (
                    <div className={classes.nftMessage}>
                        {nonFungibleToken ? (
                            <>
                                <div className={classes.nftContainer}>
                                    <CollectibleCard
                                        className={classes.collectibleCard}
                                        asset={nonFungibleToken}
                                        provider={SourceType.OpenSea}
                                        readonly
                                        disableLink
                                        renderOrder={0}
                                        pluginID={pluginID}
                                    />
                                </div>
                                <div className={classes.nftName}>
                                    <Typography fontWeight={700} fontSize={20} lineHeight="24px">
                                        {nonFungibleToken?.metadata?.name}
                                    </Typography>
                                    <Typography fontWeight={700} fontSize={16} mx="7px">
                                        {uiTokenId}
                                    </Typography>
                                    <Icons.Verified size={21.43} />
                                </div>
                            </>
                        ) : null}
                        <Typography className={classes.congratulation} mt="24px">
                            {t.congratulations()}
                        </Typography>
                        <Typography className={classes.messageText} mt="14px">
                            {t.send_specific_tip_successfully({
                                amount: '1',
                                name: nonFungibleToken?.contract?.name || 'NFT',
                            })}
                        </Typography>
                    </div>
                )}
            </DialogContent>
            <DialogActions className={classes.actions}>
                <Button fullWidth onClick={onConfirm}>
                    {confirmText}
                </Button>
            </DialogActions>
        </InjectedDialog>
    )
}
