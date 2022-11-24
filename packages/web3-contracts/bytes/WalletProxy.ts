export const WalletProxyByteCode =
    '0x608060405234801561001057600080fd5b5060405161146638038061146683398101604081905261002f9161008f565b600180546001600160a01b039384166001600160a01b031990911617905560008054919092166c01000000000000000000000000026001600160601b039091161790556100c9565b6001600160a01b038116811461008c57600080fd5b50565b600080604083850312156100a257600080fd5b82516100ad81610077565b60208401519092506100be81610077565b809150509250929050565b61138e806100d86000396000f3fe6080604052600436106100cb5760003560e01c8063a9059cbb11610074578063c399ec881161004e578063c399ec8814610240578063d0cb75fa14610255578063fcbac1f41461027557600080fd5b8063a9059cbb146101c8578063affed0e0146101e8578063b0d691fe1461021557600080fd5b80634d44560d116100a55780634d44560d1461012157806380c5c7d0146101415780638da5cb5b1461016157600080fd5b80630565bb67146100d75780631b71bb6e146100f95780634a58db191461011957600080fd5b366100d257005b600080fd5b3480156100e357600080fd5b506100f76100f2366004610fb7565b610295565b005b34801561010557600080fd5b506100f7610114366004611040565b6102e4565b6100f76102f8565b34801561012d57600080fd5b506100f761013c366004611064565b610383565b34801561014d57600080fd5b506100f761015c366004610fb7565b610432565b34801561016d57600080fd5b5060005461019e906c01000000000000000000000000900473ffffffffffffffffffffffffffffffffffffffff1681565b60405173ffffffffffffffffffffffffffffffffffffffff90911681526020015b60405180910390f35b3480156101d457600080fd5b506100f76101e3366004611064565b61043a565b3480156101f457600080fd5b506000546bffffffffffffffffffffffff165b6040519081526020016101bf565b34801561022157600080fd5b5060015473ffffffffffffffffffffffffffffffffffffffff1661019e565b34801561024c57600080fd5b5061020761048a565b34801561026157600080fd5b506100f76102703660046110d5565b610540565b34801561028157600080fd5b506100f7610290366004611141565b610664565b61029d61069d565b6102de848484848080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061073a92505050565b50505050565b6102ec6107b7565b6102f5816107bf565b50565b600061031960015473ffffffffffffffffffffffffffffffffffffffff1690565b73ffffffffffffffffffffffffffffffffffffffff163460405160006040518083038185875af1925050503d8060008114610370576040519150601f19603f3d011682016040523d82523d6000602084013e610375565b606091505b50509050806102f557600080fd5b61038b61069d565b60015473ffffffffffffffffffffffffffffffffffffffff166040517f205c287800000000000000000000000000000000000000000000000000000000815273ffffffffffffffffffffffffffffffffffffffff848116600483015260248201849052919091169063205c287890604401600060405180830381600087803b15801561041657600080fd5b505af115801561042a573d6000803e3d6000fd5b505050505050565b61029d61084d565b61044261069d565b60405173ffffffffffffffffffffffffffffffffffffffff83169082156108fc029083906000818181858888f19350505050158015610485573d6000803e3d6000fd5b505050565b60006104ab60015473ffffffffffffffffffffffffffffffffffffffff1690565b6040517f70a0823100000000000000000000000000000000000000000000000000000000815230600482015273ffffffffffffffffffffffffffffffffffffffff91909116906370a0823190602401602060405180830381865afa158015610517573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061053b9190611195565b905090565b61054861069d565b8281146105b6576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601360248201527f77726f6e67206172726179206c656e677468730000000000000000000000000060448201526064015b60405180910390fd5b60005b8381101561065d5761064b8585838181106105d6576105d66111ae565b90506020020160208101906105eb9190611040565b60008585858181106105ff576105ff6111ae565b905060200281019061061191906111dd565b8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061073a92505050565b8061065581611271565b9150506105b9565b5050505050565b61066c61084d565b61067683836108ce565b61068360408401846111dd565b151590506106945761069483610a0b565b61048581610ad3565b6000546c01000000000000000000000000900473ffffffffffffffffffffffffffffffffffffffff163314806106d257503330145b610738576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152600a60248201527f6f6e6c79206f776e65720000000000000000000000000000000000000000000060448201526064016105ad565b565b6000808473ffffffffffffffffffffffffffffffffffffffff16848460405161076391906112aa565b60006040518083038185875af1925050503d80600081146107a0576040519150601f19603f3d011682016040523d82523d6000602084013e6107a5565b606091505b50915091508161065d57805160208201fd5b61073861069d565b60015460405173ffffffffffffffffffffffffffffffffffffffff8084169216907f450909c1478d09248269d4ad4fa8cba61ca3f50faed58c7aedefa51c7f62b83a90600090a3600180547fffffffffffffffffffffffff00000000000000000000000000000000000000001673ffffffffffffffffffffffffffffffffffffffff92909216919091179055565b60015473ffffffffffffffffffffffffffffffffffffffff163314610738576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601b60248201527f77616c6c65743a206e6f742066726f6d20456e747279506f696e74000000000060448201526064016105ad565b6000610927826040517f19457468657265756d205369676e6564204d6573736167653a0a3332000000006020820152603c8101829052600090605c01604051602081830303815290604052805190602001209050919050565b905061097761093a6101608501856111dd565b8080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152508593925050610b3e9050565b6000546c01000000000000000000000000900473ffffffffffffffffffffffffffffffffffffffff908116911614610485576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601760248201527f77616c6c65743a2077726f6e67207369676e617475726500000000000000000060448201526064016105ad565b600080546020830135916bffffffffffffffffffffffff9091169080610a30836112e5565b91906101000a8154816bffffffffffffffffffffffff02191690836bffffffffffffffffffffffff1602179055506bffffffffffffffffffffffff16146102f5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601560248201527f77616c6c65743a20696e76616c6964206e6f6e6365000000000000000000000060448201526064016105ad565b80156102f55760405160009033907fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff90849084818181858888f193505050503d806000811461065d576040519150601f19603f3d011682016040523d82523d6000602084013e61065d565b6000806000610b4d8585610b62565b91509150610b5a81610bd2565b509392505050565b600080825160411415610b995760208301516040840151606085015160001a610b8d87828585610e2b565b94509450505050610bcb565b825160401415610bc35760208301516040840151610bb8868383610f43565b935093505050610bcb565b506000905060025b9250929050565b6000816004811115610be657610be6611311565b1415610bef5750565b6001816004811115610c0357610c03611311565b1415610c6b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601860248201527f45434453413a20696e76616c6964207369676e6174757265000000000000000060448201526064016105ad565b6002816004811115610c7f57610c7f611311565b1415610ce7576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e6774680060448201526064016105ad565b6003816004811115610cfb57610cfb611311565b1415610d89576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c60448201527f756500000000000000000000000000000000000000000000000000000000000060648201526084016105ad565b6004816004811115610d9d57610d9d611311565b14156102f5576040517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c60448201527f756500000000000000000000000000000000000000000000000000000000000060648201526084016105ad565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115610e625750600090506003610f3a565b8460ff16601b14158015610e7a57508460ff16601c14155b15610e8b5750600090506004610f3a565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa158015610edf573d6000803e3d6000fd5b50506040517fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe0015191505073ffffffffffffffffffffffffffffffffffffffff8116610f3357600060019250925050610f3a565b9150600090505b94509492505050565b6000807f7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff831681610f7960ff86901c601b611340565b9050610f8787828885610e2b565b935093505050935093915050565b73ffffffffffffffffffffffffffffffffffffffff811681146102f557600080fd5b60008060008060608587031215610fcd57600080fd5b8435610fd881610f95565b935060208501359250604085013567ffffffffffffffff80821115610ffc57600080fd5b818701915087601f83011261101057600080fd5b81358181111561101f57600080fd5b88602082850101111561103157600080fd5b95989497505060200194505050565b60006020828403121561105257600080fd5b813561105d81610f95565b9392505050565b6000806040838503121561107757600080fd5b823561108281610f95565b946020939093013593505050565b60008083601f8401126110a257600080fd5b50813567ffffffffffffffff8111156110ba57600080fd5b6020830191508360208260051b8501011115610bcb57600080fd5b600080600080604085870312156110eb57600080fd5b843567ffffffffffffffff8082111561110357600080fd5b61110f88838901611090565b9096509450602087013591508082111561112857600080fd5b5061113587828801611090565b95989497509550505050565b60008060006060848603121561115657600080fd5b833567ffffffffffffffff81111561116d57600080fd5b8401610180818703121561118057600080fd5b95602085013595506040909401359392505050565b6000602082840312156111a757600080fd5b5051919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60008083357fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe184360301811261121257600080fd5b83018035915067ffffffffffffffff82111561122d57600080fd5b602001915036819003821315610bcb57600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214156112a3576112a3611242565b5060010190565b6000825160005b818110156112cb57602081860181015185830152016112b1565b818111156112da576000828501525b509190910192915050565b60006bffffffffffffffffffffffff8083168181141561130757611307611242565b6001019392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6000821982111561135357611353611242565b50019056fea26469706673582212201b0c6880ffa28501e74dc8ef800cef5dec124ae3d873b82786f264221c92360564736f6c634300080c0033'
