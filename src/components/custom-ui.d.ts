interface withClasses<ClassKeys extends string> {
    classes?: Partial<Record<ClassKeys, string>>
}

type PartialRequired<T, RequiredKeys extends keyof T> = Partial<T> & Pick<T, RequiredKeys>
