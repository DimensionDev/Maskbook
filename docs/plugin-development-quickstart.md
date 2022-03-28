---
author: Randolph
---

# Quick start for Plugin Development

## 1. Introduction

This is an example of how to develop plugin according to tools provided by Mask. And our task is to develop an app related to Ethereum Name Service, people can purchase ENS in application board and see details about specific ENS domain in timeline and profile of twitter.

## 2. Start a plugin file

You can create a plugin folder by entering following command

> npx gulp new-pkg

After entering related information about the plugin you want to create, a plugin folder will be created in `packages/plugins`. This folder contains lots of files, and core files are `SNSAdaptor` and `Worker`. The former contains all the code related to front-end interaction, the latter plays a database-like role.
Since we want to add a application into maskbook, we need to add related config:

`pnpm-lock.yaml`

```JavaScript
    '@masknet/plugin-ENS': workspace:*
    '@masknet/plugin-ENS': link:../plugins/ENS
```

`packages/mask/package.json`

```JavaScript
    "@masknet/plugin-ENS": "workspace:*",
```

`packages/mask/.webpack/config.ts`

```JavaScript
    '@masknet/plugin-ENS': join(__dirname, '../../plugins/your file name/src/'),
```

`packages/mask/src/plugin-infra/register.js`

```JavaScript
    import '@masknet/plugin-ENS'
```

## 3. How to inject UI

We will inject our UI in three places of twitter to provide different services. And `Plugin.SNSAdaptor.Definition` in `SNSAdaptor` is where we inject our UI mainly.

### 3.1 Add UI in application board

Add following config in `ApplicationBoard.tsx`：

```JavaScript
createEntry(
            'ENS',  // plugin-ENS
            new URL('./assets/files.png', import.meta.url).toString(),  // your icon image
            () => openEncryptedMessage(PluginId.ENS),  // your button click event
            undefined, // support chains
            false,  // hidden or not
            false, // require wallet or not
        ),
```

The `openEncryptedMessage` will open our plugin composition, therefore, we need to add following config in
`Plugin.SNSAdaptor.Definition`:

```JavaScript
CompositionDialogEntry: {
        label: 'ENS',
        dialog: ENSDialog, // the dialog component that will be opened when button clicked
    },
```

### 3.2 Add UI in Timeline

It is normal that we inject specific UI according to content in timeline. Now we want to parse the URLs in the content to generate our UI, Mask provide `PostInspector` entry:

```JavaScript
 PostInspector: function Component(): JSX.Element | null {
        const links = usePostInfoDetails.mentionedLinks() // links we find in timeline content
        const link = links.find(isENS) // find ENS url
        if (!link) return null
        return <ENSCard url={link} /> // render UI if ENS URL is found
    },
```

### 3.3 Add UI as a tab in user profile

We have injected `web3` tab in user profile, so we add a tab called `ENS` under it. Same as before, add following config in `Plugin.SNSAdaptor.Definition`:

```JavaScript
 ProfileTabs: [
     {
         ID: `${PLUGIN_ID}_tabContent`,  // PLUGIN_ID is generated when we use codegen command
         label: 'ENS',
         priority: 10,
         UI: {
             TabContent: ENSCard,  // ENSCard is the UI we want to display
         },
     },
 ],
```

Now we have created entries to inject UI, the rest is to add style and interaction logic like writing a web page in `ENSCard` and `ENSDialog` to meet our needs.

## 4. How to get data from blockchain and send a transaction

We have successfully injected entries in twitter, now we can focus on the UI and interaction. Additionally, we want to see ENS details and buy an ENS domain in our plugin, so we need to acquire information and send transactions on blockchain.

### 4.1 Acquire ens details in profile tab and timeline

We can grab user's ens in their profile and ENS url in timeline, and we want to inject a card to show details like owner and expiration date of this ENS domain. For acquiring information from blockchain, we need smart contract address of ENS which can be found in ENS website. The smart contract address we need is `0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5`, so we need to call related function of this smart contract.
Copy ABI of this smart contract from `etherscan` and make it as a `json` file. Mask provide tools to use it:

```JavaScript
import { useContract } from '@masknet/web3-shared-evm'
import ENS_ABI from '@masknet/web3-contracts/abis/ENS.json'

const contract = useContract('0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5', ENS_ABI)

const handleSearch = useCallback(async () => {
        const res = await contract?.methods.available(ensName).call({ from: account }) // we use call to use smart contract function without gas fee
    }, [ensName])
```

The above is an example to check whether an ENS name is registered or not. If you want to get other information about ENS, you can refer to its ABI, calling other methods to read the data from blockchain.

### 4.2 Rent an ENS on application board

ENS domain is not permanent, we need to rent a ENS domain that is not registered by others. Since data on blockchain is changed, we need to call payable function of smart contract. For completing renting an ENS domain, we take two steps to commit and register.

```JavaScript
import { useContract,useAccount } from '@masknet/web3-shared-evm'
import ENS_ABI from '@masknet/web3-contracts/abis/ENS.json'

// For registering an ENS, you need ENS name、duration and secret

const contract = useContract('0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5', ENS_ABI)
const account = useAccount() // a hook to acquire current wallet address
const value = await contract.methods.rentPrice(name,duration); // first param is ENS name, second param is duration
const commitment = await contract.methods.makeCommitment(name,address,secret); // get commitment

const handleBuy = useCallback(async () => {
        const gasForCommit = await contract.methods     //estimate gas for commit function
            .commit(commitment)
            .estimateGas({ from: account })
            .catch((error: Error) => {
                gasError = error
            })

        const configForCommit = {
                from: account,
                0,
                gasForCommit
            }

        await contract.methods   // send a transaction to commit on blockchain
            .commit(commitment)
            .send(configForCommit)
            .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                resolve()
            })
            .on(TransactionEventType.ERROR, (error: Error) => {
                reject(error)
            })

        const gasForRegister = await contract.methods     //estimate gas for register function
            .register(register amount,name,account,duration,secret)
            .estimateGas({ from: account,value })
            .catch((error: Error) => {
                gasError = error
            })

        const configForRegister = {
            from: account,
            value,
            gasForRegister
        }
        return new Promise<void>(async (resolve, reject) => {
            contract.methods                       // send a transaction to register
                .register(register amount,name,account,duration,secret)
                .send(configForRegister as PayableTx)
                .on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error: Error) => {
                    reject(error)
                })
        })

    }, [ensName])
```
