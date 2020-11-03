interface withClasses<ClassKeys extends string> {
    classes?: Partial<Record<ClassKeys, string>>
}

type PartialRequired<T, RequiredKeys extends keyof T> = Partial<T> & Pick<T, RequiredKeys>
/**
 * @deprecated This util seems encouraging a style that directly passing `classes` everywhere which is very bad for maintainers. Stylable component should deliberately opt-in for their chosen classes as part of their public API
 */
type KeysInferFromUseStyles<T, OmitKeys extends keyof ReturnType<T> = ''> = keyof Omit<ReturnType<T>, OmitKeys>

type PropsOf<T> = T extends React.ComponentType<infer U> ? U : never
