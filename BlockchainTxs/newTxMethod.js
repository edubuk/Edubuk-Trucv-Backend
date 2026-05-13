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
// "0e3bf98bb66683ce345131babf06d85b53fef7ba612cb17ec0e5fb21233212d7",
// Multiple funding wallets (different sources ideally)
const FUNDING_KEYS = [
  "dd08d6c16298e370d3ef27b61d5b5e59ae6d86deac37c0282a8fbd67af152eae"
];


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
  const totalWallets = 20;
  const pvtKey = [];
  for (let i = 0; i < totalWallets; i++) {
    console.log(`\n========== Wallet ${i + 1}/${totalWallets} ==========`);

    // Generate truly independent wallet
    const privateKey = ethers.hexlify(ethers.randomBytes(32));
    pvtKey.push(privateKey);
    const newWallet = new ethers.Wallet(privateKey);
    console.log("New Address:", newWallet.address,"privateKey:",privateKey);

    // Rotate RPC
    const rpc = RPC_LIST[i % RPC_LIST.length];
    const provider = new ethers.JsonRpcProvider(rpc);

    // Rotate funding wallet
    const fundingKey = FUNDING_KEYS[i % FUNDING_KEYS.length];
    const transferWallet = new ethers.Wallet(fundingKey, provider);
    console.log("Funding from:", transferWallet.address);

    //Random ETH amount
    const ethAmount = randomEthAmount();
    console.log(`Sending ${ethAmount} EGAS`);

    try {
      // Step 1: Fund the new wallet
      const fundTx = await transferWallet.sendTransaction({
        to: newWallet.address,
        value: ethers.parseEther(ethAmount),
      });
      console.log("Fund TxHash:", fundTx.hash);
      await fundTx.wait();

      //Random delay after funding (1–2 minutes)
      await randomDelay(30000, 45000);

    //   // Step 2: Submit documents from new wallet
    //   const txWallet = new ethers.Wallet(privateKey, provider);
    //   const contract = new ethers.Contract(contractAddress, abi, txWallet);

    //   const txCount = randomTxCount(); //random count
    //   console.log(`Submitting ${txCount} documents`);

    //   for (let j = 0; j < txCount; j++) {
    //     const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
    //     const name = randomDocName();   // random name
    //     const docType = randomDocType(); // random type

    //     const tx = await contract.submitDocument(name, hash, docType, "");
    //     await tx.wait();
    //     console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);

    //     // Random delay between txs (8–25 seconds)
    //     await randomDelay(8000, 25000);
    //   }

    //   console.log(`Wallet ${i + 1} completed`);

      // Longer delay between wallets (1–3 minutes)
    //   if (i < totalWallets - 1) {
    //     await randomDelay(60000, 180000);
    //   }

    } catch (err) {
      console.error(`Error on wallet ${i + 1}:`, err.message);
    }
  } 

    for (let j = 19; j >=0; j--) {
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
      await randomDelay(40000, 60000);
    }

    for (let j = 0; j < 10; j++) {
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
  
    for (let j = 19; j>=10; j--) {
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

    for (let j = 0; j < 20; j++) {
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
  

  console.log("\nAll wallets done!");
};

transferToken();