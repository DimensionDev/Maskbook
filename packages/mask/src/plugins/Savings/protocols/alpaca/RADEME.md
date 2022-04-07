# Alpaca

- `https://bscscan.com/address/0xcc7830c29fa5fdf0e289562470672285290e3a20#code`
- `https://alpaca-static-api.alpacafinance.org/bsc/v1/landing/summary.json`

## Vault ABI

```json
[
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "healthBefore", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "healthAfter", "type": "uint256" }
    ],
    "name": "AddCollateral",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "debtShare", "type": "uint256" }
    ],
    "name": "AddDebt",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "killer", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "posVal", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "debt", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "prize", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "left", "type": "uint256" }
    ],
    "name": "Kill",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "debtShare", "type": "uint256" }
    ],
    "name": "RemoveDebt",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "id", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "loan", "type": "uint256" }
    ],
    "name": "Work",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "POSITION_ID",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "STRATEGY",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "_IN_EXEC_LOCK",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "bool", "name": "goRogue", "type": "bool" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "addCollateral",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "config",
    "outputs": [{ "internalType": "contract IVaultConfig", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "debtShare", "type": "uint256" }],
    "name": "debtShareToVal",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "debtToken",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "debtVal", "type": "uint256" }],
    "name": "debtValToShare",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }
    ],
    "name": "decreaseAllowance",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amountToken", "type": "uint256" }],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fairLaunchPoolId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "addedValue", "type": "uint256" }
    ],
    "name": "increaseAllowance",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "contract IVaultConfig", "name": "_config", "type": "address" },
      { "internalType": "address", "name": "_token", "type": "address" },
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_symbol", "type": "string" },
      { "internalType": "uint8", "name": "_decimals", "type": "uint8" },
      { "internalType": "address", "name": "_debtToken", "type": "address" }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "kill",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastAccrueTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextPositionID",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "value", "type": "uint256" }],
    "name": "pendingInterest",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
    "name": "positionInfo",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "positions",
    "outputs": [
      { "internalType": "address", "name": "worker", "type": "address" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "uint256", "name": "debtShare", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "value", "type": "uint256" }],
    "name": "reduceReserve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  {
    "inputs": [
      { "internalType": "address", "name": "targetedToken", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "requestFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "reservePool",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_poolId", "type": "uint256" }],
    "name": "setFairLaunchPoolId",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalToken",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "sender", "type": "address" },
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "contract IVaultConfig", "name": "_config", "type": "address" }],
    "name": "updateConfig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vaultDebtShare",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "vaultDebtVal",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "share", "type": "uint256" }],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" }
    ],
    "name": "withdrawReserve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "address", "name": "worker", "type": "address" },
      { "internalType": "uint256", "name": "principalAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "borrowAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "maxReturn", "type": "uint256" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "work",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  { "stateMutability": "payable", "type": "receive" }
]
```

## All Pools

```json
[
  {
    "key": "bnb",
    "sourceName": "WBNB Vault",
    "symbol": "BNB",
    "baseTokenPerIbToken": "1.115832283573426974",
    "lendingApr": "3.6796010363245905",
    "stakingApr": "0.3115213059796938",
    "stakingAprs": [
      {
        "key": "ib-wbnb",
        "sourceName": "BNB Interest Bearing",
        "apr": "0.3115213059796938",
        "stakingTokenSymbol": "ibBNB",
        "rewardTokenSymbol": "ALPACA",
        "stakingContract": "Alpaca FairLaunch",
        "tvl": "231230228.784564441075052403",
        "rewardToken": {
          "address": "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
          "symbol": "ALPACA"
        },
        "stakingToken": {
          "address": "0xd7D069493685A581d27824Fc46EdA46B7EfC0063",
          "symbol": "ibBNB"
        }
      }
    ],
    "protocolApr": "0",
    "totalApr": "3.9911223423042843",
    "totalApy": "4.071838",
    "totalSupply": "590360.826645272319749007",
    "totalToken": "590297.002939965638956328",
    "totalFloating": "346697.021004734948180872",
    "totalBorrowed": "243663.805640537371568135",
    "tvl": "257549358.775324367453983426",
    "floatingTvl": "151265540.913081307765788609",
    "borrowingInterestPercent": "11.0063222193634785",
    "baseToken": {
      "address": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      "symbol": "BNB"
    },
    "ibToken": {
      "address": "0xd7D069493685A581d27824Fc46EdA46B7EfC0063",
      "symbol": "ibBNB"
    }
  },
  {
    "key": "busd",
    "sourceName": "BUSD Vault",
    "symbol": "BUSD",
    "baseTokenPerIbToken": "1.101717074806658693",
    "lendingApr": "4.3951769818426604",
    "stakingApr": "0.4736249079916553",
    "stakingAprs": [
      {
        "key": "ib-busd",
        "sourceName": "BUSD Interest Bearing",
        "apr": "0.4736249079916553",
        "stakingTokenSymbol": "ibBUSD",
        "rewardTokenSymbol": "ALPACA",
        "stakingContract": "Alpaca FairLaunch",
        "tvl": "117325806.875725310912407337",
        "rewardToken": {
          "address": "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
          "symbol": "ALPACA"
        },
        "stakingToken": {
          "address": "0x7C9e73d4C71dae564d41F78d56439bB4ba87592f",
          "symbol": "ibBUSD"
        }
      }
    ],
    "protocolApr": "0",
    "totalApr": "4.8688018898343157",
    "totalApy": "4.989275",
    "totalSupply": "124133861.779543441418824633",
    "totalToken": "124119096.80880528570617583",
    "totalFloating": "74050143.01709846884046345",
    "totalBorrowed": "50083718.762444972578361183",
    "tvl": "124119096.80880528570617583",
    "floatingTvl": "74050143.01709846884046345",
    "borrowingInterestPercent": "13.4488468186576115",
    "baseToken": {
      "address": "0xe9e7cea3dedca5984780bafc599bd69add087d56",
      "symbol": "BUSD"
    },
    "ibToken": {
      "address": "0x7C9e73d4C71dae564d41F78d56439bB4ba87592f",
      "symbol": "ibBUSD"
    }
  },
  {
    "key": "eth",
    "sourceName": "ETH Vault",
    "symbol": "ETH",
    "baseTokenPerIbToken": "1.01741096861275083",
    "lendingApr": "1.4936246356250328",
    "stakingApr": "0.9007277745755496",
    "stakingAprs": [
      {
        "key": "ib-eth",
        "sourceName": "ETH Interest Bearing",
        "apr": "0.9007277745755496",
        "stakingTokenSymbol": "ibETH",
        "rewardTokenSymbol": "ALPACA",
        "stakingContract": "Alpaca FairLaunch",
        "tvl": "34273781.500216842613384927",
        "rewardToken": {
          "address": "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
          "symbol": "ALPACA"
        },
        "stakingToken": {
          "address": "0xbfF4a34A4644a113E8200D7F1D79b3555f723AfE",
          "symbol": "ibETH"
        }
      }
    ],
    "protocolApr": "0",
    "totalApr": "2.3943524102005824",
    "totalApy": "2.423247",
    "totalSupply": "10570.27552513337509771",
    "totalToken": "10569.939117301348041118",
    "totalFloating": "8084.137936516926699731",
    "totalBorrowed": "2486.137588616448397979",
    "tvl": "35858136.652884558441797544",
    "floatingTvl": "27425145.938059392983030928",
    "borrowingInterestPercent": "7.8400277038034535",
    "baseToken": {
      "address": "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
      "symbol": "ETH"
    },
    "ibToken": {
      "address": "0xbfF4a34A4644a113E8200D7F1D79b3555f723AfE",
      "symbol": "ibETH"
    }
  },
  {
    "key": "alpaca",
    "sourceName": "ALPACA Vault",
    "symbol": "ALPACA",
    "baseTokenPerIbToken": "1.017030022223642445",
    "lendingApr": "0.3528680768502891",
    "stakingApr": "0.0",
    "stakingAprs": [
      {
        "key": "ib-alpaca",
        "sourceName": "ALPACA Interest Bearing",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "ALPACA",
        "stakingContract": "Alpaca FairLaunch",
        "tvl": "3263673.608037242961947296",
        "rewardToken": {
          "address": "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
          "symbol": "ALPACA"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "scix",
        "sourceName": "SCIX",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "SCIX",
        "stakingContract": "Scientix StakingPools",
        "tvl": "251892.212580254782350405",
        "rewardToken": {
          "address": "0x2cfc48cdfea0678137854f010b5390c5144c0aa5",
          "symbol": "SCIX"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "latte",
        "sourceName": "LATTE",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "LATTE",
        "stakingContract": "LatteSwap MasterBarista",
        "tvl": "5052.669416475830091946",
        "rewardToken": {
          "address": "0xa269A9942086f5F87930499dC8317ccC9dF2b6CB",
          "symbol": "LATTE"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "xms",
        "sourceName": "MarsEcosystem",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "XMS",
        "stakingContract": "MarsEcosystem LiquidityMiningMaster",
        "tvl": "15112.179777055061798568",
        "rewardToken": {
          "address": "0x7859B01BbF675d67Da8cD128a50D155cd881B576",
          "symbol": "XMS"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "eternal",
        "sourceName": "ETERNAL",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "ETERNAL",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "999.650785447213039166",
        "rewardToken": {
          "address": "0xD44FD09d74cd13838F137B590497595d6b3FEeA4",
          "symbol": "ETERNAL"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "plut",
        "sourceName": "PLUT",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "PLUT",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "1277.196599493410391569",
        "rewardToken": {
          "address": "0x2984f825bfe72e55e1725d5c020258e81ff97450",
          "symbol": "PLUT"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "sps",
        "sourceName": "SPS",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "SPS",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "223974.464438773429778226",
        "rewardToken": {
          "address": "0x1633b7157e7638C4d6593436111Bf125Ee74703F",
          "symbol": "SPS"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "caps",
        "sourceName": "CAPS",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "CAPS",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "28414.326022913068727428",
        "rewardToken": {
          "address": "0xffba7529ac181c2ee1844548e6d7061c9a597df4",
          "symbol": "CAPS"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "tenfi",
        "sourceName": "TENFI",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "TENFI",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "721.902143735331281215",
        "rewardToken": {
          "address": "0xd15c444f1199ae72795eba15e8c1db44e47abf62",
          "symbol": "TENFI"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "dep",
        "sourceName": "DEP",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "DEP",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "7590.962076257300603448",
        "rewardToken": {
          "address": "0xcaf5191fc480f43e4df80106c7695eca56e48b18",
          "symbol": "DEP"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "wnow",
        "sourceName": "WNOW",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "WNOW",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "3161.327797444096768825",
        "rewardToken": {
          "address": "0x56aa0237244c67b9a854b4efe8479cca0b105289",
          "symbol": "WNOW"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "leon",
        "sourceName": "LEON",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "LEON",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "14212.338186647210899736",
        "rewardToken": {
          "address": "0x27e873bee690c8e161813de3566e9e18a64b0381",
          "symbol": "LEON"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "arv",
        "sourceName": "ARV",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "ARV",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "6170.894227565798160792",
        "rewardToken": {
          "address": "0x6679eb24f59dfe111864aec72b443d1da666b360",
          "symbol": "ARV"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "xwin",
        "sourceName": "XWIN",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "XWIN",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "4480.627160186117362936",
        "rewardToken": {
          "address": "0xd88ca08d8eec1e9e09562213ae83a7853ebb5d28",
          "symbol": "XWIN"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "skill",
        "sourceName": "SKILL",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "SKILL",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "2784.781156217928547769",
        "rewardToken": {
          "address": "0x154a9f9cbd3449ad22fdae23044319d6ef2a1fab",
          "symbol": "SKILL"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "sheesha",
        "sourceName": "SHEESHA",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "SHEESHA",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "398.900270385839124298",
        "rewardToken": {
          "address": "0x232FB065D9d24c34708eeDbF03724f2e95ABE768",
          "symbol": "SHEESHA"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "nfty",
        "sourceName": "NFTY",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "NFTY",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "7008.317320160776448039",
        "rewardToken": {
          "address": "0x5774b2fc3e91af89f89141eacf76545e74265982",
          "symbol": "NFTY"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "bmon",
        "sourceName": "BMON",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "BMON",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "1605.752881454514732375",
        "rewardToken": {
          "address": "0x08ba0619b1e7a582e0bce5bbe9843322c954c340",
          "symbol": "BMON"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "moni",
        "sourceName": "MONI",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "MONI",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "2780.046332005412799224",
        "rewardToken": {
          "address": "0x9573c88aE3e37508f87649f87c4dd5373C9F31e0",
          "symbol": "MONI"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "polar",
        "sourceName": "POLAR",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "POLAR",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "136.726773918526193601",
        "rewardToken": {
          "address": "0xC64c9B30C981fc2eE4e13d0CA3f08258e725fd24",
          "symbol": "POLAR"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "lucky",
        "sourceName": "LUCKY",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "LUCKY",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "6397.614395436820252777",
        "rewardToken": {
          "address": "0xc3D912863152E1Afc935AD0D42d469e7C6B05B77",
          "symbol": "LUCKY"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "pots",
        "sourceName": "POTS",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "POTS",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "3836.672727072414091051",
        "rewardToken": {
          "address": "0x3fcca8648651e5b974dd6d3e50f61567779772a8",
          "symbol": "POTS"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "pear",
        "sourceName": "PEAR",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "PEAR",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "185.506451517154838811",
        "rewardToken": {
          "address": "0xdf7c18ed59ea738070e665ac3f5c258dcc2fbad8",
          "symbol": "PEAR"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "qbt",
        "sourceName": "QBT",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "QBT",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "357.360743731268317352",
        "rewardToken": {
          "address": "0x17b7163cf1dbd286e262ddc68b553d899b93f526",
          "symbol": "QBT"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "dvi",
        "sourceName": "DVI",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "DVI",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "410.11918006954273682",
        "rewardToken": {
          "address": "0x758fb037a375f17c7e195cc634d77da4f554255b",
          "symbol": "DVI"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "naos",
        "sourceName": "NAOS",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "NAOS",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "1067.508411771888064402",
        "rewardToken": {
          "address": "0x758d08864fb6cce3062667225ca10b8f00496cc2",
          "symbol": "NAOS"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "bmxx",
        "sourceName": "bMXX",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "bMXX",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "48186.405095386661653205",
        "rewardToken": {
          "address": "0x4131b87F74415190425ccD873048C708F8005823",
          "symbol": "bMXX"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "belt",
        "sourceName": "BELT",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "BELT",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "4446.229261323135456457",
        "rewardToken": {
          "address": "0xE0e514c71282b6f4e823703a39374Cf58dc3eA4f",
          "symbol": "BELT"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "bor",
        "sourceName": "BOR",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "BOR",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "4595.0562093838488149",
        "rewardToken": {
          "address": "0x92D7756c60dcfD4c689290E8A9F4d263b3b32241",
          "symbol": "BOR"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "bry",
        "sourceName": "BRY",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "BRY",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "619.131699909229310319",
        "rewardToken": {
          "address": "0xf859Bf77cBe8699013d6Dbc7C2b926Aaf307F830",
          "symbol": "BRY"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "cws",
        "sourceName": "pCWS",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "pCWS",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "2117.861610591963102902",
        "rewardToken": {
          "address": "0xbcf39F0EDDa668C58371E519AF37CA705f2bFcbd",
          "symbol": "pCWS"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "swingby",
        "sourceName": "SWINGBY",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "SWINGBY",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "721.940702730604732068",
        "rewardToken": {
          "address": "0x71de20e0c4616e7fcbfdd3f875d568492cbe4739",
          "symbol": "SWINGBY"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "dodo",
        "sourceName": "DODO",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "DODO",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "2961.842735589862387613",
        "rewardToken": {
          "address": "0x67ee3cb086f8a16f34bee3ca72fad36f7db929e2",
          "symbol": "DODO"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "oddz",
        "sourceName": "ODDZ",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "ODDZ",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "4727.351832472674272167",
        "rewardToken": {
          "address": "0xcd40f2670cf58720b694968698a5514e924f742d",
          "symbol": "ODDZ"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "form",
        "sourceName": "FORM",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "FORM",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "63109.0194825180135969",
        "rewardToken": {
          "address": "0x25A528af62e56512A19ce8c3cAB427807c28CC19",
          "symbol": "FORM"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "orbs",
        "sourceName": "ORBS",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "ORBS",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "9432.453484839242128165",
        "rewardToken": {
          "address": "0xebd49b26169e1b52c04cfd19fcf289405df55f80",
          "symbol": "ORBS"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "wex",
        "sourceName": "WEX",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "WEX",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "3468.821871766278014921",
        "rewardToken": {
          "address": "0xa9c41A46a6B3531d28d5c32F6633dd2fF05dFB90",
          "symbol": "WEX"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "pmon",
        "sourceName": "PMON",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "PMON",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "25072.95251668506701607",
        "rewardToken": {
          "address": "0x1796ae0b0fa4862485106a0de9b654efe301d0b2",
          "symbol": "PMON"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "pha",
        "sourceName": "PHA",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "PHA",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "3540.473882948348947935",
        "rewardToken": {
          "address": "0x0112e557d400474717056c4e6d40edd846f38351",
          "symbol": "PHA"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "alm",
        "sourceName": "ALM",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "ALM",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "48.088455420836713994",
        "rewardToken": {
          "address": "0x7c38870e93a1f959cb6c533eb10bbc3e438aac11",
          "symbol": "ALM"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      },
      {
        "key": "kala",
        "sourceName": "KALA",
        "apr": "0.0",
        "stakingTokenSymbol": "ibALPACA",
        "rewardTokenSymbol": "KALA",
        "stakingContract": "Alpaca GrazingRange",
        "tvl": "101.061314423145732925",
        "rewardToken": {
          "address": "0x32299c93960bb583a43c2220dc89152391a610c5",
          "symbol": "KALA"
        },
        "stakingToken": {
          "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
          "symbol": "ibALPACA"
        }
      }
    ],
    "protocolApr": "0",
    "totalApr": "0.3528680768502891",
    "totalApy": "0.353491",
    "totalSupply": "20003734.629955686379370849",
    "totalToken": "20003598.75916833056967618",
    "totalFloating": "17716896.695439375403323308",
    "totalBorrowed": "2286837.934516310976047541",
    "tvl": "9438525.303466525976869504",
    "floatingTvl": "8359564.684937692500686615",
    "borrowingInterestPercent": "3.8106849826127765",
    "baseToken": {
      "address": "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
      "symbol": "ALPACA"
    },
    "ibToken": {
      "address": "0xf1bE8ecC990cBcb90e166b71E368299f0116d421",
      "symbol": "ibALPACA"
    }
  },
  {
    "key": "usdt",
    "sourceName": "USDT Vault",
    "symbol": "USDT",
    "baseTokenPerIbToken": "1.052574169813908204",
    "lendingApr": "6.4150950746218671",
    "stakingApr": "0.5288625320930595",
    "stakingAprs": [
      {
        "key": "ib-usdt",
        "sourceName": "USDT Interest Bearing",
        "apr": "0.5288625320930595",
        "stakingTokenSymbol": "ibUSDT",
        "rewardTokenSymbol": "ALPACA",
        "stakingContract": "Alpaca FairLaunch",
        "tvl": "77830803.693102330653952272",
        "rewardToken": {
          "address": "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
          "symbol": "ALPACA"
        },
        "stakingToken": {
          "address": "0x158Da805682BdC8ee32d52833aD41E74bb951E59",
          "symbol": "ibUSDT"
        }
      }
    ],
    "protocolApr": "0",
    "totalApr": "6.9439576067149266",
    "totalApy": "7.190729",
    "totalSupply": "91057961.819240115477282516",
    "totalToken": "91041581.68540090813677051",
    "totalFloating": "39806417.048340408828718019",
    "totalBorrowed": "51251544.770899706648564497",
    "tvl": "90884769.980561050813949069",
    "floatingTvl": "39737853.739077103457297798",
    "borrowingInterestPercent": "14.0711322071537915",
    "baseToken": {
      "address": "0x55d398326f99059ff775485246999027b3197955",
      "symbol": "USDT"
    },
    "ibToken": {
      "address": "0x158Da805682BdC8ee32d52833aD41E74bb951E59",
      "symbol": "ibUSDT"
    }
  },
  {
    "key": "btcb",
    "sourceName": "BTCB Vault",
    "symbol": "BTCB",
    "baseTokenPerIbToken": "1.00787364925571976",
    "lendingApr": "0.209402040533122",
    "stakingApr": "0.5786334484703228",
    "stakingAprs": [
      {
        "key": "ib-btcb",
        "sourceName": "BTCB Interest Bearing",
        "apr": "0.5786334484703228",
        "stakingTokenSymbol": "ibBTCB",
        "rewardTokenSymbol": "ALPACA",
        "stakingContract": "Alpaca FairLaunch",
        "tvl": "71136219.354044252733552742",
        "rewardToken": {
          "address": "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
          "symbol": "ALPACA"
        },
        "stakingToken": {
          "address": "0x08FC9Ba2cAc74742177e0afC3dC8Aed6961c24e7",
          "symbol": "ibBTCB"
        }
      }
    ],
    "protocolApr": "0",
    "totalApr": "0.7880354890034448",
    "totalApy": "0.791149",
    "totalSupply": "1657.008181215665452031",
    "totalToken": "1656.998346916417220941",
    "totalFloating": "1511.081997325683742763",
    "totalBorrowed": "145.926183889981709268",
    "tvl": "78285759.906214342858508468",
    "floatingTvl": "71391865.092312268730706119",
    "borrowingInterestPercent": "2.935535373215487",
    "baseToken": {
      "address": "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      "symbol": "BTCB"
    },
    "ibToken": {
      "address": "0x08FC9Ba2cAc74742177e0afC3dC8Aed6961c24e7",
      "symbol": "ibBTCB"
    }
  },
  {
    "key": "tusd",
    "sourceName": "TUSD Vault",
    "symbol": "TUSD",
    "baseTokenPerIbToken": "1.007157766343506261",
    "lendingApr": "0.1335187092684758",
    "stakingApr": "0.4181946864930328",
    "stakingAprs": [
      {
        "key": "ib-tusd",
        "sourceName": "TUSD Interest Bearing",
        "apr": "0.4181946864930328",
        "stakingTokenSymbol": "ibTUSD",
        "rewardTokenSymbol": "ALPACA",
        "stakingContract": "Alpaca FairLaunch",
        "tvl": "59056411.636149813879965865",
        "rewardToken": {
          "address": "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
          "symbol": "ALPACA"
        },
        "stakingToken": {
          "address": "0x3282d2a151ca00BfE7ed17Aa16E42880248CD3Cd",
          "symbol": "ibTUSD"
        }
      }
    ],
    "protocolApr": "0",
    "totalApr": "0.5517133957615086",
    "totalApy": "0.553238",
    "totalSupply": "59173167.791327627739337001",
    "totalToken": "59172975.529789809374252207",
    "totalFloating": "55012011.767000463371438214",
    "totalBorrowed": "4161156.024327164367898787",
    "tvl": "59056740.573685127508439319",
    "floatingTvl": "54903950.296105723414898539",
    "borrowingInterestPercent": "2.344055692607909",
    "baseToken": {
      "address": "0x14016e85a25aeb13065688cafb43044c2ef86784",
      "symbol": "TUSD"
    },
    "ibToken": {
      "address": "0x3282d2a151ca00BfE7ed17Aa16E42880248CD3Cd",
      "symbol": "ibTUSD"
    }
  },
  {
    "key": "usdc",
    "sourceName": "USDC Vault",
    "symbol": "USDC",
    "baseTokenPerIbToken": "1.005074055798526461",
    "lendingApr": "2.4638284648254195",
    "stakingApr": "2.5966180839242908",
    "stakingAprs": [
      {
        "key": "ib-usdc",
        "sourceName": "Interest Bearing USDC",
        "apr": "2.5966180839242908",
        "stakingTokenSymbol": "ibUSDC",
        "rewardTokenSymbol": "ALPACA",
        "stakingContract": "Alpaca FairLaunch",
        "tvl": "7926039.676532595142681474",
        "rewardToken": {
          "address": "0x8F0528cE5eF7B51152A59745bEfDD91D97091d2F",
          "symbol": "ALPACA"
        },
        "stakingToken": {
          "address": "0x800933D685E7Dc753758cEb77C8bd34aBF1E26d7",
          "symbol": "ibUSDC"
        }
      }
    ],
    "protocolApr": "0",
    "totalApr": "5.0604465487497103",
    "totalApy": "5.190675",
    "totalSupply": "9322947.829693262879282854",
    "totalToken": "9322391.600430536911982109",
    "totalFloating": "6506662.8035541198621632",
    "totalBorrowed": "2816285.026139143017119654",
    "tvl": "9325119.573356023602386878",
    "floatingTvl": "6508566.821398912738397501",
    "borrowingInterestPercent": "10.069365318014421",
    "baseToken": {
      "address": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      "symbol": "USDC"
    },
    "ibToken": {
      "address": "0x800933D685E7Dc753758cEb77C8bd34aBF1E26d7",
      "symbol": "ibUSDC"
    }
  }
]
```
