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

const pvtKey=[
  "fc58d96e910d9e169bc59ff7ed9baea9ab641a276374ad559bb550832d159620",
  "c997d7cd0368eaab47fd889a0943da6d64b670b83bc7e6632f32f544d1ce2be2",
  "25c5df11a49cf60864de9ef517fb3627b466b4187409cb266061c7adb746c5fc",
  "623dace47daee2376fa5ca5c827f17ebce2ab0611c7c5366497996215cdfcf2e",
  "b47329e314d2191a5d264b423e292258ef872692d80a028abfd8c7b944dd8cc1",
  "8a451e28b8c4a95571d319da4448567b8bdb2069ba1455af3ead893dc82745a7",
  "5003c7413b74847b2da96dbf25e745101fd9ab5bcf33da993eb73d131181f121",
  "43bdab31c79d1ca7904167785c4231865c349c9f41a9bc86a54f951e55168d5f",
  "b08dca8f717243f49c23ba85b6c4dc655847b1ff30dd908317abf323b1bf84bb",
  "636a4eff0a6851d8df11142e90c204d72849386e428713546c32afc0869b9aab",
  "b65f4991ba3e2bd95fe00aae8a30c26f00f13333e3101202752a9072defc3f34",
  "a17043a5eed7cbd93c693bd07b675d2c77af5d2e7b57f2d88046b64508d77b21",
  "14fded64326af476885cf71e3f08b1582d023729c6d32973bc24482f38139706",
  "0e79e8d67103bf1fa4db3c8fb29a575de302b443e628c08f1c5cd1910a71ff55",
  "0db8da04cdf8861559f12e831d49f1c7b8764450f6f6f31b68f425c1154c37e7",
  "86aae2fff9cab8b03a28eaf74046068cf3c40506d92f04bac58211af1e4b5ce3",
  "e35515d15dfe39d1e75a78971fe416074d81c66d696c16f63a2b612f5f5084be",
  "2c562c31ee22913b2232c8127b2d02dc0e3d46f26e6e1e31ff65a2396cd6508c",
  "2e902161479dda1358ed85c8eb8e161c9a49be1cc1c43d5a97e28740137eaf8f",
  "d8b8f12a63a9a7595c3340e14ad7df5264f4d837233afa4ec96112dd1c651dfc",
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

  //   for (let j = 19; j >=0; j--) {
  //     const rpc = RPC_LIST[j % RPC_LIST.length];
  //     const provider = new ethers.JsonRpcProvider(rpc);
  //     const privateKey = pvtKey[j];
  //     const txWallet = new ethers.Wallet(privateKey, provider);
  //     console.log("Address:", txWallet.address);
  //     const contract = new ethers.Contract(contractAddress, abi, txWallet);
  //     const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
  //     const name = randomDocName();   // random name
  //     const docType = randomDocType(); // random type
  
  //     const tx = await contract.submitDocument(name, hash, docType, "");
  //     await tx.wait();
  //     console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);
  
  //     // Random delay between txs (8–25 seconds)
  //     await randomDelay(40000, 60000);
  //   }

  //   for (let j = 0; j < 10; j++) {
  //     const rpc = RPC_LIST[j % RPC_LIST.length];
  //     const provider = new ethers.JsonRpcProvider(rpc);
  //     const privateKey = pvtKey[j];
  //     const txWallet = new ethers.Wallet(privateKey, provider);
  //     console.log("Address:", txWallet.address);
  //     const contract = new ethers.Contract(contractAddress, abi, txWallet);
  //     const hash = `0x${crypto.randomBytes(32).toString("hex")}`;
  //     const name = randomDocName();   // random name
  //     const docType = randomDocType(); // random type
  
  //     const tx = await contract.submitDocument(name, hash, docType, "");
  //     await tx.wait();
  //     console.log(`Doc ${j + 1} TxHash: ${tx.hash}`);
  
  //     // Random delay between txs (8–25 seconds)
  //     await randomDelay(30000, 50000);
  //   }
  
    for (let j = 17; j>=10; j--) {
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

    for (let j =19; j>=0; j--) {
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