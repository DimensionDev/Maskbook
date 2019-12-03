interface withClasses<ClassKeys extends string> {
    classes?: Partial<Record<ClassKeys, string>>
}

type PartialRequired<T, RequiredKeys extends keyof T> = Partial<T> & Pick<T, RequiredKeys>
type KeysInferFromUseStyles<T, OmitKeys extends keyof ReturnType<T> = ''> = keyof Omit<ReturnType<T>, OmitKeys>
