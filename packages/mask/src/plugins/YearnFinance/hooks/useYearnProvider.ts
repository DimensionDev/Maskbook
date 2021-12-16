import { useAsyncRetry } from 'react-use'
import type { ChainId } from '@masknet/web3-shared-evm'
import {Context, VaultInterface, Yearn} from '@yfi/sdk'
import { JsonRpcProvider } from '@ethersproject/providers'

export function useYearnProvider(wProvider: any, chainId: ChainId  ) {
       
    return useAsyncRetry(async () => {
		
        //@ts-ignore
        const yearn = new Yearn(chainId, {provider: new JsonRpcProvider(wProvider.host ) });
                
        return yearn;
    }, [])
}
