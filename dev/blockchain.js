const sha256 = require("sha256");
// we add this for our node to know what url its currently on (located in package.json start script)
const currentNodeUrl = process.argv[3];

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];
  // creating Genesis block:
  this.createNewBlock(100, "0", "0");
  this.currentNodeUrl = currentNodeUrl;
  // we'll fill this array with netowrk nodes so each node is aware of every other node in the network
  this.networkNodes = [];
}

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
  // create a new block:
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    // transactions created since last block was mined:
    transactions: this.pendingTransactions,
    nonce: nonce,
    hash: hash,
    previousBlockHash: previousBlockHash
  };

  // clear out new array for new transactions:
  this.pendingTransactions = [];
  // push block into chain & return it:
  this.chain.push(newBlock);
  return newBlock;
};

Blockchain.prototype.getLastBlock = function() {
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function(
  amount,
  sender,
  recipient
) {
  const newTransaction = {
    amount: amount,
    sender: sender,
    recipient: recipient
  };
  this.pendingTransactions.push(newTransaction);

  // return block that this will be added to:
  return this.getLastBlock()["index"] + 1;
};

// a nonce is a proof of work - in our case, just a number that proves we created the block in a valid method

Blockchain.prototype.hashBlock = function(
  previousBlockHash,
  currentBlockData,
  nonce
) {
  const dataAsString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = sha256(dataAsString);
  return hash;
};

Blockchain.prototype.proofOfWork = function(
  previousBlockHash,
  currentBlockData
) {
  // bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce)
  //repeatedly hash block until it finds correct hash => which was 000...
  // uses current block data for the hash, but also the previousBlockHash
  // continuously changes nonce value until it finds the correct hash
  // returns to us the nonce value until it finds the correct hash
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while (hash.substring(0, 4) !== "0000") {
    // increase nonce then run this again:
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }
  return nonce;
};
module.exports = Blockchain;

// proof of work method could be run tens or hundreds of thousands of times to get the right hash.
