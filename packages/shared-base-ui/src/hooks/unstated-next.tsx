// modified from unstated-next
import { createContext, use, type JSX, type PropsWithChildren } from 'react'

export interface ContainerProviderProps<State = void> extends PropsWithChildren {
    initialState?: State
}

export interface Container<Value, State = void> {
    (props: ContainerProviderProps<State>): JSX.Element
    Provider: React.ComponentType<ContainerProviderProps<State>>
    useContainer: () => Value
}

export function createContainer<Value, State = void>(
    useHook: (initialState?: State) => Value,
): Container<Value, State> {
    const Context = createContext<Value | null>(null)
    const Provider: Container<Value, State> = function Provider(props: ContainerProviderProps<State>) {
        const value = useHook(props.initialState)
        return <Context.Provider value={value}>{props.children}</Context.Provider>
    }
    Provider.Provider = Provider
    Provider.useContainer = useContainer
    function useContainer(): Value {
        const value = use(Context)
        if (value === null) {
            throw new Error('Component must be wrapped with <Container.Provider>')
        }
        return value
    }
    return Provider
}

export function useContainer<Value, State = void>(container: Container<Value, State>): Value {
    return container.useContainer()
}
