type ProducerPushFunction<T> = (item: T[]) => Promise<void>
type GetKeyFunction = (provider: string) => Promise<string>

interface ProducerArgBase {
    size: number
}

interface Producer<T, R> {
    producerHandler(push: ProducerPushFunction<T>, getKey: GetKeyFunction, args: R): Promise<void>
    unionBy(item: T): unknown
}
