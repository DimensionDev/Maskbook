export type PartialRequired<T, RequiredKeys extends keyof T> = Omit<T, RequiredKeys> & Pick<Required<T>, RequiredKeys>

export type UnboxPromise<T> = T extends Promise<infer U> ? U : never

export enum BooleanPreference {
    False = 0,
    Default = 1,
    True = 2,
}
