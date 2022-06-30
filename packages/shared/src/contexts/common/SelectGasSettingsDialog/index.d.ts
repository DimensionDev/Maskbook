/// <reference types="react" />
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import { SelectGasSettingsDialogProps } from '../../components/SelectGasSettingsDialog'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
declare const SelectGasSettingsProvider: import('react').FC<{
    children?: import('react').ReactNode
}>
export declare function useSelectGasSettings<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
>(
    pluginID?: T,
): (
    options: Omit<SelectGasSettingsDialogProps<NetworkPluginID>, 'open' | 'onClose'>,
    signal?: AbortSignal | undefined,
) => Promise<Web3Helper.FungibleTokenScope<S, T>>
export { SelectGasSettingsProvider }
//# sourceMappingURL=index.d.ts.map
