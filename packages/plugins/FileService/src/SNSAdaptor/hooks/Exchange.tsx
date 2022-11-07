import { noop, omit } from 'lodash-es'
import { createContext, useContext } from 'react'
import type { FileInfo, DialogCloseCallback } from '../../types.js'

export interface Props extends React.PropsWithChildren<{}> {
    onInsert(info: FileInfo | null): void
    onUploading(enabled: boolean): void
    onDialogClose(cb: DialogCloseCallback): void
}

const ExchangeContext = createContext<Props>({
    onInsert: noop,
    onUploading: noop,
    onDialogClose: noop,
})
ExchangeContext.displayName = 'ExchangeContext'

export const Exchange: React.FC<Props> = (props) => (
    <ExchangeContext.Provider value={omit(props, ['children'])} children={props.children} />
)

export const useExchange = () => useContext(ExchangeContext)
