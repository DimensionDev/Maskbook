export type PartialRequired<T, RequiredKeys extends keyof T> = Omit<T, RequiredKeys> & Pick<Required<T>, RequiredKeys>

export type UnboxPromise<T> = T extends Promise<infer U> ? U : never
