export type ProducerPushFunction<T> = (item: T[]) => Promise<void>
export type ProducerKeyFunction = (provider: string) => Promise<string>

export interface ProducerArgBase {
    pageSize: number
    pageKey?: string
}

export interface RPCMethodRegistrationValue<T extends unknown = unknown, TArgs extends unknown = any> {
    method: string
    producer(push: ProducerPushFunction<T>, getKey: ProducerKeyFunction, args: TArgs): Promise<void>
    distinctBy(item: T): string
}
