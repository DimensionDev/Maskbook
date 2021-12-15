import { useCallback, useEffect, useState } from 'react'
import { DialogContent } from '@mui/material'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { FungibleTokenDetailed, useChainId, ChainId, useTokenConstants } from '@masknet/web3-shared-evm'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { WalletMessages } from '../../Wallet/messages'
import { useI18N } from '../../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { delay } from '@masknet/shared-base'
import { MINDS_ID } from '../../../social-network-adaptor/minds.com/base'
import { activatedSocialNetworkUI } from '../../../social-network'

interface StyleProps {
    snsId: string
}

const useStyles = makeStyles<StyleProps>()((theme, { snsId }) => ({
    content: {
        ...(snsId === MINDS_ID ? { minWidth: 552 } : {}),
    },
    list: {
        marginTop: 16,
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
}))

export interface SelectTokenDialogProps extends withClasses<never> {}

export function SelectTokenDialog(props: SelectTokenDialogProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles({ snsId: activatedSocialNetworkUI.networkIdentifier }), props)
    const chainId = useChainId()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants(chainId)

    const [id, setId] = useState('')
    const [targetChainId, setChainId] = useState<ChainId | undefined>(chainId)
    const [rowSize, setRowSize] = useState(54)

    const [disableNativeToken, setDisableNativeToken] = useState(true)
    const [disableSearchBar, setDisableSearchBar] = useState(false)
    const [FixedTokenListProps, setFixedTokenListProps] = useState<ERC20TokenListProps | null>(null)

    useEffect(() => {
        try {
            const fontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
            setRowSize(fontSize * 3.6)
        } catch {
            setRowSize(54)
        }
    }, [])

    const { open, setDialog } = useRemoteControlledDialog(WalletMessages.events.selectTokenDialogUpdated, (ev) => {
        if (!ev.open) return
        setId(ev.uuid)
        setDisableNativeToken(ev.disableNativeToken ?? true)
        setDisableSearchBar(ev.disableSearchBar ?? false)
        setFixedTokenListProps(ev.FixedTokenListProps ?? null)
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
        <InjectedDialog open={open} onClose={onClose} title={t('plugin_wallet_select_a_token')}>
            <DialogContent className={classes.content}>
                <ERC20TokenList
                    classes={{ list: classes.list, placeholder: classes.placeholder }}
                    onSelect={onSubmit}
                    {...FixedTokenListProps}
                    tokens={[...(FixedTokenListProps?.tokens ?? [])]}
                    blacklist={
                        disableNativeToken && NATIVE_TOKEN_ADDRESS
                            ? [NATIVE_TOKEN_ADDRESS, ...(FixedTokenListProps?.blacklist ?? [])]
                            : [...(FixedTokenListProps?.blacklist ?? [])]
                    }
                    targetChainId={targetChainId}
                    disableSearch={disableSearchBar}
                    FixedSizeListProps={{
                        itemSize: rowSize,
                    }}
                />
            </DialogContent>
        </InjectedDialog>
    )
}
