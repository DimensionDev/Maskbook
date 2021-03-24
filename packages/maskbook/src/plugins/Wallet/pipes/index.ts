import { unreachable } from "../../../utils/utils";
import { TransactionProvider } from "../types";

export function resolveDataProviderName(provider: TransactionProvider) {
    switch (provider) {
        case TransactionProvider.ZERION:
            return 'Zerion'
        case TransactionProvider.DEBANK:
            return 'Debank'
        default:
            unreachable(provider)
    }
}
