import { FC, useCallback, useState, createContext, useMemo, useContext } from 'react'
import { DialogContent } from '@material-ui/core'
import { SearchInput } from '@masknet/theme'
import { delay } from '@masknet/shared-base'
import { noop } from 'lodash-es'
import { FungibleTokenDetailed, useNativeTokenDetailed, useChainDetailed } from '@masknet/web3-shared'
import { InjectedDialog, InjectedDialogProps, FixedTokenList, FixedTokenListProps } from '../../components'
import { useStyles } from './styles'

interface OpenSelectTokenDialogOptions {
    uuid: string
    disableNativeToken?: boolean
    disableSearchBar?: boolean
    FixedTokenListProps?: FixedTokenListProps
}
interface CloseSelectTokenDialogOptions {
    uuid: string

    /**
     * The selected detailed token.
     */
    token?: FungibleTokenDetailed
}

export interface SelectTokenDialogOptions extends OpenSelectTokenDialogOptions, CloseSelectTokenDialogOptions {
    visible: boolean
    openDialog: (options: OpenSelectTokenDialogOptions) => void
    closeDialog: (options: CloseSelectTokenDialogOptions) => void
}
export const SelectTokenDialogContext = createContext<SelectTokenDialogOptions>({
    visible: false,
    uuid: '',
    openDialog: noop,
    closeDialog: noop,
})

export const useSelectTokenDialog = () => {
    return useContext(SelectTokenDialogContext)
}

interface SelectTokenDialogProps extends Pick<InjectedDialogProps, 'classes'> {}

export function SelectTokenDialog(props: SelectTokenDialogProps) {
    const { classes } = useStyles()
    const { visible, uuid, disableNativeToken, disableSearchBar, FixedTokenListProps, closeDialog } =
        useContext(SelectTokenDialogContext)

    const [keyword, setKeyword] = useState('')
    const chainDetailed = useChainDetailed()

    //#region the native token
    const { value: nativeTokenDetailed } = useNativeTokenDetailed()
    //#endregion

    //#region remote controlled dialog
    const onSubmit = useCallback(
        async (token: FungibleTokenDetailed) => {
            closeDialog({
                uuid,
                token,
            })
            await delay(300)
            setKeyword('')
        },
        [uuid, closeDialog, setKeyword],
    )
    const onClose = useCallback(async () => {
        closeDialog({
            uuid,
        })
        await delay(300)
        setKeyword('')
    }, [uuid, closeDialog])
    //#endregion

    return (
        <InjectedDialog onClose={onClose} open={visible} title="Select a Token" maxWidth="xs" {...props}>
            <DialogContent>
                {!disableSearchBar ? (
                    <SearchInput label="Search Tokens Symbols Name or Contract address" onChange={setKeyword} />
                ) : null}
                <FixedTokenList
                    classes={{ list: classes.list, placeholder: classes.placeholder }}
                    keyword={keyword}
                    onSelect={onSubmit}
                    {...{
                        ...FixedTokenListProps,
                        tokens: [
                            ...(!disableNativeToken &&
                            nativeTokenDetailed &&
                            (!keyword || chainDetailed?.nativeCurrency.symbol.includes(keyword.toLowerCase()))
                                ? [nativeTokenDetailed]
                                : []),
                            ...(FixedTokenListProps?.tokens ?? []),
                        ],
                    }}
                    FixedSizeListProps={{
                        height: disableSearchBar ? 350 : 288,
                        itemSize: 52,
                        overscanCount: 4,
                        ...FixedTokenListProps?.FixedSizeListProps,
                    }}
                />
            </DialogContent>
        </InjectedDialog>
    )
}

interface ProviderProps extends SelectTokenDialogProps {}

export const SelectTokenDialogProvider: FC<ProviderProps> = ({ children, classes }) => {
    const [visible, setVisible] = useState(false)
    const [state, setState] = useState<OpenSelectTokenDialogOptions | CloseSelectTokenDialogOptions>({ uuid: '' })
    const value = useMemo(() => {
        return {
            visible,
            ...state,
            openDialog: (options: OpenSelectTokenDialogOptions) => {
                setVisible(true)
                setState(options)
            },
            closeDialog: (options: CloseSelectTokenDialogOptions) => {
                setVisible(false)
                setState(options)
            },
        }
    }, [visible])
    return (
        <SelectTokenDialogContext.Provider value={value}>
            {children}
            <SelectTokenDialog classes={classes} />
        </SelectTokenDialogContext.Provider>
    )
}
