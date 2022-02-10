import { noop, omit } from 'lodash-unified'
import { createContext, useContext } from 'react'
import type { FileInfo } from '../../types'

export interface Props {
    onInsert(info: FileInfo | null): void
    onUploading(enabled: boolean): void
    onDialogClose(cb: Function): void
}

const Context = createContext<Props>({
    onInsert: noop,
    onUploading: noop,
    onDialogClose: noop,
})

export const Exchange: React.FC<Props> = (props) => (
    <Context.Provider value={omit(props, ['children'])} children={props.children} />
)

export const useExchange = () => useContext(Context)
