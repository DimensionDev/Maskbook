type ProducerPushFunction<T> = (item: T[]) => Promise<void>
type ProducerKeyFunction = (provider: string) => Promise<string>

interface ProducerArgBase {
    size: number
}

interface RpcMethodRegistrationValue<T, TArgs> {
    producer(push: ProducerPushFunction<T>, getKey: ProducerKeyFunction, args: TArgs): Promise<void>
    keyHasher(item: T): string
}
