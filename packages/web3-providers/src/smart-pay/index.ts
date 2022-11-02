import type { ChainId, UserOperation } from "@masknet/web3-shared-evm";
import type { BundlerAPI } from "../types/Bundler.js";

export class SmartPayAPI implements BundlerAPI.Provider {
    simulate(chainId: ChainId, userOperation: UserOperation): Promise<{ preOpGas: string; prefund: string; }> {
        throw new Error("Method not implemented.");
    }
    send(chainId: ChainId, userOperation: UserOperation): Promise<string> {
        throw new Error("Method not implemented.");
    }
}