import { useCallback, useEffect, useState } from 'react'
import { DialogContent, Theme, useMediaQuery } from '@mui/material'
import { makeStyles, MaskColorVar, useStylesExtends } from '@masknet/theme'
import { FungibleTokenDetailed, useChainId, ChainId, useTokenConstants } from '@masknet/web3-shared-evm'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletMessages } from '../../Wallet/messages'
import { useI18N } from '../../../utils'
import { ERC20TokenList, ERC20TokenListProps, useRemoteControlledDialog } from '@masknet/shared'
import { delay } from '@masknet/shared-base'
import { MINDS_ID } from '../../../social-network-adaptor/minds.com/base'
import { activatedSocialNetworkUI } from '../../../social-network'

interface StyleProps {
    snsId: string
}

const useStyles = makeStyles<StyleProps>()((theme, { snsId }) => ({
    content: {
        ...(snsId === MINDS_ID ? { minWidth: 552 } : {}),
        padding: theme.spacing(3),
    },
    list: {
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    placeholder: {
        textAlign: 'center',
        height: 288,
        paddingTop: theme.spacing(14),
        boxSizing: 'border-box',
    },
    search: {
        backgroundColor: 'transparent !important',
        border: `solid 1px ${MaskColorVar.twitterBorderLine}`,
    },
}))

export interface SelectTokenDialogProps extends withClasses<never> {}

export function SelectTokenDialog(props: SelectTokenDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles({ snsId: activatedSocialNetworkUI.networkIdentifier }), props)
    const chainId = useChainId()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)
    const isMdScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'))

    const [id, setId] = useState('')
    const [targetChainId, setChainId] = useState<ChainId | undefined>(chainId)
    const [rowSize, setRowSize] = useState(54)

    const [disableNativeToken, setDisableNativeToken] = useState(true)
    const [disableSearchBar, setDisableSearchBar] = useState(false)
    const [FungibleTokenListProps, setFungibleTokenListProps] = useState<ERC20TokenListProps | null>(null)

    useEffect(() => {
        try {
            const fontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
            setRowSize(fontSize * 4)
        } catch {
            setRowSize(60)
        }
    }, [])

    const { open, setDialog } = useRemoteControlledDialog(WalletMessages.events.selectTokenDialogUpdated, (ev) => {
        if (!ev.open) return
        setId(ev.uuid)
        setDisableNativeToken(ev.disableNativeToken ?? true)
        setDisableSearchBar(ev.disableSearchBar ?? false)
        setFungibleTokenListProps(ev.FungibleTokenListProps ?? null)
        setChainId(ev.chainId ?? undefined)
    })
    const onSubmit = useCallback(
        async (token: FungibleTokenDetailed) => {
            setDialog({
                open: false,
                uuid: id,
                token,
            })
            await delay(300)
        },
        [id, setDialog],
    )
    const onClose = useCallback(async () => {
        setDialog({
            open: false,
            uuid: id,
        })
        await delay(300)
    }, [id, setDialog])

    return (
        <InjectedDialog
            titleBarIconStyle="back"
            open={open}
            onClose={onClose}
            title={t('plugin_wallet_select_a_token')}>
            <DialogContent classes={{ root: classes.content }}>
                <ERC20TokenList
                    classes={{ list: classes.list, placeholder: classes.placeholder }}
                    onSelect={onSubmit}
                    {...FungibleTokenListProps}
                    tokens={[...(FungibleTokenListProps?.tokens ?? [])]}
                    blacklist={
                        disableNativeToken && NATIVE_TOKEN_ADDRESS
                            ? [NATIVE_TOKEN_ADDRESS, ...(FungibleTokenListProps?.blacklist ?? [])]
                            : [...(FungibleTokenListProps?.blacklist ?? [])]
                    }
                    targetChainId={targetChainId}
                    disableSearch={disableSearchBar}
                    FixedSizeListProps={{
                        itemSize: rowSize,
                        height: isMdScreen ? 300 : 503,
                    }}
                    SearchTextFieldProps={{ InputProps: { classes: { root: classes.search } } }}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
