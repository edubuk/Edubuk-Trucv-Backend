// const ethers = require("ethers");

// const contractAddress = "0x007aa7830d7E894C312d46389D1bD89144fCf076";
// const abi = [{
// 		"inputs": [
// 			{
// 				"internalType": "string",
// 				"name": "name",
// 				"type": "string"
// 			},
// 			{
// 				"internalType": "bytes32",
// 				"name": "hash",
// 				"type": "bytes32"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "docType",
// 				"type": "string"
// 			},
// 			{
// 				"internalType": "string",
// 				"name": "tokenUri",
// 				"type": "string"
// 			}
// 		],
// 		"name": "submitDocument",
// 		"outputs": [],
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	}];

// const txCount=3;
// const transferToken = async()=>{
//     for(let i=0;i<txCount;i++){
//     const newWallet = ethers.Wallet.createRandom();
//     const provider = new ethers.JsonRpcProvider("https://rpc.eniac.network");

//     const wallet = new ethers.Wallet(newWallet.privateKey, provider);
//     const transferWallet = new ethers.Wallet("b98201b751c6abf40ba658fa15a53516e38ec863080a3d137a80b39924dae14c", provider);
//     const contract = new ethers.Contract(contractAddress,abi,wallet)

//     console.log("transfering token")
//     console.log("wallet",wallet);
//     const tx = await transferWallet.sendTransaction({
//         to:newWallet.address,
//         value:ethers.parseEther("0.001")
//     })
//     console.log("txHash",tx.hash);
//     }
//     await tx.wait();

//     if(tx.hash)
//     {
//         const doc = await contract.submitDocument("test","test","test","test");
//         console.log("doc",doc);
//     }
// }


// transferToken();
