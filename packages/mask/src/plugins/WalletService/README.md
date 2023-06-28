# Wallets

- ./contracts/ - auto generated contract definition file
- ./database/ - database of the Mask Wallet database. Storing wallets (including exotic wallets) and balances. Also storing ERC20 token lists
- ./erc20/ - built-in list of ERC20 tokens
- ./UI/ - UI related to the Wallet

## Wallet Providers

It is possible to use Mask with multiple wallet providers. See src/protocols/wallet-provider for their definition.

Current Provider:

- Mask (built-in wallet)
- MetaMask
