const ethers = require("ethers");
const crypto = require("crypto");

const contractAddress = "0x007aa7830d7E894C312d46389D1bD89144fCf076";
const abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "docType",
        type: "string",
      },
      {
        internalType: "string",
        name: "tokenUri",
        type: "string",
      },
    ],
    name: "submitDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const delay = (ms) =>
  new Promise(resolve => setTimeout(resolve, ms));

const txCount = 3;
let count=0;
const transferToken = async () => {
  for(let i = 0; i < 5; i++) {
    count++;
    console.log("tx number", count);
  const newWallet = ethers.Wallet.createRandom();
  const provider = new ethers.JsonRpcProvider("https://rpc.eniac.network");

  const wallet = new ethers.Wallet(newWallet.privateKey, provider);
  console.log("private key", newWallet.privateKey);
  const transferWallet = new ethers.Wallet(
    "cf2f3c76699185c68641942dc53ea75081056c421a400a82109bbc61f033d8f5",
    provider,
  );
  //const wallet = new ethers.Wallet(newWallet.privateKey, provider);
  const txwallet = new ethers.Wallet(wallet.privateKey, provider);
  const contract = new ethers.Contract(contractAddress, abi, txwallet);
  console.log("transferWallet", transferWallet.address);
  console.log("transfering token");
  console.log("wallet", wallet);
  const tx = await transferWallet.sendTransaction({
    to: newWallet.address,
    value: ethers.parseEther("0.082"),
  });
  console.log("txHash", tx.hash);
  await tx.wait();
  console.log("waiting for 10 seconds");
  await delay(10000);
  if (tx.hash) {
    console.log("starting to submit documents");
    for (let j=0; j < txCount; j++) {
      const hash = crypto.randomBytes(32).toString("hex");

      //console.log("hash", hash);

      const tx = await contract.submitDocument("A", `0x${hash}`, "c", "");

      await tx.wait();

      console.log("txHash", tx.hash);
      console.log("waiting for 10 seconds");
      await delay(10000);
    }
  }
  }
};

transferToken();

