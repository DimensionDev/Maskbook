import type { Plugin } from '@masknet/plugin-infra'
import type { ValueRefWithReady } from '@masknet/shared-base'
import type { Web3State } from '@masknet/web3-shared-base'

export class Web3StateAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction,
    TransactionParameter,
    State extends Web3State<
        ChainId,
        SchemaType,
        ProviderType,
        NetworkType,
        RequestArguments,
        RequestOptions,
        Transaction,
        TransactionParameter
    > = Web3State<
        ChainId,
        SchemaType,
        ProviderType,
        NetworkType,
        RequestArguments,
        RequestOptions,
        Transaction,
        TransactionParameter
    >,
> {
    constructor(private _ref: ValueRefWithReady<State>) {}

    get ref(): ValueRefWithReady<State> {
        return this._ref
    }

    /**
     * Access state fearlessly.
     * Please make sure you have set a context before access it.
     * Otherwise, you will get a runtime error.
     */
    get state(): State {
        return this.ref.value
    }

    /**
     * A singleton method to set plugin shared context into this web3 state.
     * @param context
     */
    setup(state: State): void {
        this._ref.value = state
    }

    /**
     * Create web3 state if a context was set.
     */
    create(context: Plugin.Shared.SharedUIContext): Promise<State> {
        throw new Error('Method not implemented.')
    }
}
