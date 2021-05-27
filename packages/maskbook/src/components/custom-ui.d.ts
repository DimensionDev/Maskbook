interface withClasses<ClassKeys extends string> {
    classes?: Partial<Record<ClassKeys, string>>
}

type PartialRequired<T, RequiredKeys extends keyof T> = Partial<T> & Pick<T, RequiredKeys>

type PropsOf<T> = T extends React.ComponentType<infer U> ? U : never

type EnumRecord<T extends number | string, U> = {
    [K in T]: U
}

type UnboxPromise<T> = T extends Promise<infer R> ? R : never
