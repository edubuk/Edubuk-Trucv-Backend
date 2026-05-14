const ethers = require("ethers");
const crypto = require("crypto");

const contractAddress = "0x007aa7830d7E894C312d46389D1bD89144fCf076";
const abi = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "bytes32", name: "hash", type: "bytes32" },
      { internalType: "string", name: "docType", type: "string" },
      { internalType: "string", name: "tokenUri", type: "string" },
    ],
    name: "submitDocument",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// Rotate RPC endpoints per wallet
const RPC_LIST = [
  "https://rpc.eniac.network",
  "https://rpc1.eniac.network",
  "https://rpc2.eniac.network",
];
//"17ce46facd5d8f0902a409c020d255de514c0433283c9916ddbce5f08fcac80a",
// Multiple funding wallets (different sources ideally)
// const FUNDING_KEYS = [
//   "0e3bf98bb66683ce345131babf06d85b53fef7ba612cb17ec0e5fb21233212d7",
//   "17ce46facd5d8f0902a409c020d255de514c0433283c9916ddbce5f08fcac80a",
// ];
const FUNDING_KEYS = [
  "3edb0915ba16b57e4eca4ac29f5d8ce0f1d05a569f3db41ad650af8f8f913d6a"
];

const pvtKey=[
  "7a39f479d4ac1734b4e498a50e05fe005e7d7ab093d9c4924d2408a99f4dc5cd",
  "711014894a9be28a99d319e12b1e2d1de85c1e0af9bee74b5802d302bb65d129",
  "223a7000e8dc13e83edf981b50ee4e31fe1d681ae061d5fd8eeed84e1b250240",
  "21213cb97d4a7981e8a3d65dfee8524f4308aec541453c8bea7cc4ffcf8f719a",
  "41794d9a46ac749fab5f89bb0cf61244aeda154eadc00cb5e0702cc8d8e297ad",
  "622a440ccc555c8ddf28944991545deca7a9bf89a3d2e5a340f19b38b4b2fc0c",
  "77c020407877c6b248f4c6586d0db733c27179cd3120f23882b04fdaf2d5c4db",
  "9161b4443592fca235749f3d693195927168d3e6ea3f39db38569022868a1496",
  "23fd654c6b656d28f8bc0481fab67a7e694584c48e0e6b6312efc6a6093eb1e6",
  "971d1e7dee8c56e8b94f578a109989fc121309c18ec1aafaf788bcbb3b318f89",
  "01c1c48ba3af1305afe7792695cba644b2b183d99a9ab8619f9b794f1880fcd6",
  "b0ee7eb8b2785c2309a7768a87fa0f685b9fe735e249a0a656c75d6114458663",
  "5548511d67fc1001dcb00c4c3286df027594cda87b2aa1026b46c641b7d32bff",
  "0e9b9d5faa8bdd56c7f8d83e5cf9381bbbef0db52bbe6061319ac0b0b0aeb049",
  "1384132cee63735ecd9a24f88806aa7b11e33253605097fcd68e577cf4371d1f",
  "23ad4abc2c268b2b3ddcfb2dea2751e58819bb721cbf51a4fef92eff6245eb84",
  "eb23350aa902ac0e27a50a911f28b6b9261f37108d24150ff2974b8136818b4a",
  "dc638d860c99e1bddb11b24ddf3a03f118bc9c73c250e6aade313a5349e76ecc",
  "050156db2921f063a0cf7134f9f4abddd3f05125b18f0b072d9a11429106e564",
  "c569aa2b9913ce7698e51e07387b960481ce0e81ded0ee825bdf58ca5d132c89",
]

// Randomize delay — human-like behavior
const randomDelay = (min, max) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`Waiting ${(ms/1000).toFixed(1)}s...`);
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Randomize ETH amount slightly
const randomEthAmount = () => {
  const base = 0.108;
  const jitter = (Math.random() * 0.002).toFixed(4); // 0.108 to 0.113
  return (base + parseFloat(jitter)).toFixed(4);
};

//  Randomize tx count per wallet (3–5)
const randomTxCount = () => Math.floor(Math.random() * 3) + 3;

// Randomize doc name and type
const DOC_NAMES = ["Certificate", "Diploma", "Transcript", "Badge", "License"];
const DOC_TYPES = ["academic", "professional", "identity", "credential", "award"];
const randomDocName = () => DOC_NAMES[Math.floor(Math.random() * DOC_NAMES.length)];
const randomDocType = () => DOC_TYPES[Math.floor(Math.random() * DOC_TYPES.length)];

const transferToken = async () => {
  // const totalWallets = 20;
  // const pvtKey = [];
  // for (let i = 0; i < totalWallets; i++) {
  //   console.log(`\n========== Wallet ${i + 1}/${totalWallets} ==========`);

  //   // Generate truly independent wallet
  //   const privateKey = ethers.hexlify(ethers.randomBytes(32));
  //   pvtKey.push(privateKey);
  //   const newWallet = new ethers.Wallet(privateKey);
  //   console.log("New Address:", newWallet.address,"privateKey:",privateKey);

  //   // Rotate RPC
  //   const rpc = RPC_LIST[i % RPC_LIST.length];
  //   const provider = new ethers.JsonRpcProvider(rpc);

  //   // Rotate funding wallet
  //   const fundingKey = FUNDING_KEYS[i % FUNDING_KEYS.length];
  //   const transferWallet = new ethers.Wallet(fundingKey, provider);
  //   console.log("Funding from:", transferWallet.address);

  //   //Random ETH amount
  //   const ethAmount = randomEthAmount();
  //   console.log(`Sending ${ethAmount} EGAS`);

  //   try {
  //     // Step 1: Fund the new wallet
  //     const fundTx = await transferWallet.sendTransaction({
  //       to: newWallet.address,
  //       value: ethers.parseEther(ethAmount),
  //     });
  //     console.log("Fund TxHash:", fundTx.hash);
  //     await fundTx.wait();

  //     //Random delay after funding (1–2 minutes)
  //     await randomDelay(30000, 45000);

  //   //   // Step 2: Submit documents from new wallet
  //   //   const txWallet = new ethers.Wallet(privateKey, provider);
  //   //   const contract = new ethers.Contract(contractAddress, abi, txWallet);

  //   //   const txCount = randomTxCount(); //random count
  //   //   console.log(`Submitting ${txCount} documents`);

  //   //   for (let j = 0; j < txCount; j++) {
  //   //     const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
  //   //     const name = randomDocName();   // random name
  //   //     const docType = randomDocType(); // random type

  //   //     const tx = await contract.submitDocument(name, hash, docType, "");
  //   //     await tx.wait();
  //   //     console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);

  //   //     // Random delay between txs (8–25 seconds)
  //   //     await randomDelay(8000, 25000);
  //   //   }

  //   //   console.log(`Wallet ${i + 1} completed`);

  //     // Longer delay between wallets (1–3 minutes)
  //   //   if (i < totalWallets - 1) {
  //   //     await randomDelay(60000, 180000);
  //   //   }

  //   } catch (err) {
  //     console.error(`Error on wallet ${i + 1}:`, err.message);
  //   }
  // } 


  //    for (let j = 10; j >=0; j--) {
  //   const rpc = RPC_LIST[j % RPC_LIST.length];
  //   const provider = new ethers.JsonRpcProvider(rpc);
  //   const privateKey = pvtKey[j];
  //   const txWallet = new ethers.Wallet(privateKey, provider);
  //   console.log("Address:", txWallet.address);
  //   const contract = new ethers.Contract(contractAddress, abi, txWallet);
  //   const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
  //   const name = randomDocName();   // random name
  //   const docType = randomDocType(); // random type

  //   const tx = await contract.submitDocument(name, hash, docType, "");
  //   await tx.wait();
  //   console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);

  //   // Random delay between txs (8–25 seconds)
  //   await randomDelay(40000, 60000);
  // }

  // for (let j = 19; j>=0; j--) {
  //   const rpc = RPC_LIST[j % RPC_LIST.length];
  //   const provider = new ethers.JsonRpcProvider(rpc);
  //   const privateKey = pvtKey[j];
  //   const txWallet = new ethers.Wallet(privateKey, provider);
  //   console.log("Address:", txWallet.address);
  //   const contract = new ethers.Contract(contractAddress, abi, txWallet);
  //   const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
  //   const name = randomDocName();   // random name
  //   const docType = randomDocType(); // random type

  //   const tx = await contract.submitDocument(name, hash, docType, "");
  //   await tx.wait();
  //   console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);

  //   // Random delay between txs (8–25 seconds)
  //   await randomDelay(30000, 50000);
  // }

   for (let j =14; j < 20; j++) {
    const rpc = RPC_LIST[j % RPC_LIST.length];
    const provider = new ethers.JsonRpcProvider(rpc);
    const privateKey = pvtKey[j];
    const txWallet = new ethers.Wallet(privateKey, provider);
    console.log("Address:", txWallet.address);
    const contract = new ethers.Contract(contractAddress, abi, txWallet);
    const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
    const name = randomDocName();   // random name
    const docType = randomDocType(); // random type

    const tx = await contract.submitDocument(name, hash, docType, "");
    await tx.wait();
    console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);

    // Random delay between txs (8–25 seconds)
    await randomDelay(30000, 50000);
  }


  for (let j =0; j < 20; j++) {
    const rpc = RPC_LIST[j % RPC_LIST.length];
    const provider = new ethers.JsonRpcProvider(rpc);
    const privateKey = pvtKey[j];
    const txWallet = new ethers.Wallet(privateKey, provider);
    console.log("Address:", txWallet.address);
    const contract = new ethers.Contract(contractAddress, abi, txWallet);
    const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
    const name = randomDocName();   // random name
    const docType = randomDocType(); // random type

    const tx = await contract.submitDocument(name, hash, docType, "");
    await tx.wait();
    console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);

    // Random delay between txs (8–25 seconds)
    await randomDelay(30000, 45000);
  }

  for (let j = 19; j>=0; j--) {
    const rpc = RPC_LIST[j % RPC_LIST.length];
    const provider = new ethers.JsonRpcProvider(rpc);
    const privateKey = pvtKey[j];
    const txWallet = new ethers.Wallet(privateKey, provider);
    console.log("Address:", txWallet.address);
    const contract = new ethers.Contract(contractAddress, abi, txWallet);
    const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
    const name = randomDocName();   // random name
    const docType = randomDocType(); // random type

    const tx = await contract.submitDocument(name, hash, docType, "");
    await tx.wait();
    console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);

    // Random delay between txs (8–25 seconds)
    await randomDelay(30000, 50000);
  }

  

  console.log("\nAll wallets done!");
};

transferToken();