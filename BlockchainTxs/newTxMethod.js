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
  "b8c4d7c8e93d942fa0e697ac31369baf59647df537b6d1e74ff6e2da6d3e0ad3",
  "a6f882d66bc673293bf91334675cdbc66ef8adfe865cbe8615a2f2999c71f845",
  "3bc6aec9cb541a0a14af9c366a4f7fcb596008c909071d42389bf50c1b2384c2",
  "444f6922de397b0eec30f1dae4c15048e9ad60c2059e08691a2e7dd347ae154a",
  "7a3928c2a011b94885aa493edf5d3fe6e66390295d0c3a5dfcb95cddd8c3b4d2",
  "2216953ea61820ca86998386d138dda1d0508ce3ebdfb6510389490d992393a3",
  "6026d99c1f9826ebadc381b4ad7f8a4e5d068e3b69a1c47ec27a2c6c88697cb5",
  "536244fcc23cae6374909466a5f11c46eca7e72b382056798f68e2fac1c16b2d",
  "ee88831f964bdb3df6bec031e152323f24b42d6184b6c5901c29a8da282b019c",
  "4d941d2c57e24a999736f72fdead89048fc4396970b687172408f8d8cdd8e7b6",
  "2c02b52d201b6ab21f690bf984a659db96bb6f46c486560911b7d8b567fd86f8",
  "c9f55df95c9ce8a65ab12a9703f174f8342411f7e290884152a4310d77d8b68e",
  "9dff78bffd8f3dfad8492f0f2946091fd9e09dee1e37088fb5cd07b0f85fc5f4",
  "5029c1cf84ba5cbfe175e0f80d0851068b1641160c9703d58e6a662f187e8b96",
  "d354c3e5fce0eb577256c03bf2fdb2b5b10cfb076c052a7f543ea64852cb215a",
  "f6cb75bf748c6cc1c05f465c80108985dccf5d0cab2d7b06b45e333cbfe15b61",
  "6d308021ca958ca3a1aea74952915eddb852b0038d8ff63e914a4712bc0194b7",
  "e9b0561b12e1bf507a1127adb7f876507dcbfa0007d6a6351368c0ccd1b0d55f",
  "a87142ff7e8114e2df70be6a81b96a5ccb8541c5ea1cfa701ca934530220ba1c",
  "f1fcd0ba423317908b8afbb9cbbbab27e6ff525fec7041b552aca130784822dd",
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