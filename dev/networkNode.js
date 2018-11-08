const express = require("express");
const app = express();
const Blockchain = require("./blockchain");
const bodyParser = require("body-parser");
const bitcoin = new Blockchain();
const uuid = require("uuid/v1"); // this library creates a random string for us, which we use as the address for each node
// in order to create different instances each time our blockchain is run, we make sure it's running on a different port each time, so it has different api paths. In order to do this, we use:
const port = process.argv[2]; // reads from our start script
const rp = require("request-promise");

const nodeAddress = uuid()
  .split("-")
  .join(""); // creates uuid and removes dashes

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res, next) => {
  res.send("hello world");
});

// to get our blockchain:
app.get("/blockchain", (req, res, next) => {
  res.send(bitcoin);
});

// to create a new transaction:
app.post("/transaction", (req, res, next) => {
  const blockIndex = bitcoin.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );
  res.json(`transaction will be added in block: ${blockIndex}`);
});

// to mine a block:
app.get("/mine", (req, res, next) => {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock["hash"];
  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock["index"] + 1
  };
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData); // from our proofOfWork method we get a nonce returned to us
  const blockHash = bitcoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );

  // when a node someone mines a block chain, they're rewarded. currently w/ bitcoin it's 12.5 bitcoin, and the sender is always '00', so that when this appears in the blockchain it's clear this is a mining reward. we have to create this transaction in our method. In order to give this node the reward, we have to
  bitcoin.createNewTransaction(12.5, "00", nodeAddress);

  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
  res.json({ note: "new block mined successfully", block: newBlock });
});

// whenever we want to register a new node w/ our network, we'll hit the register-and-broadcast path. This endpoint will register the new node on its server. That network will then broadcast it to all the other network nodes, and (in the 2nd path) all other network nodes will register it. We just want other nodes to register it, not to broadcast it, b/c it's already been broadcast (otherwise we'd have infinite loop if all were broadcasting).

// register a node and broadcast it to the network:
app.post("/register-and-broadcast-node", function(req, res, next) {
  const newNodeUrl = req.body.newNodeUrl;
  // push new node to our Blockchain instance networkNodes array if it's not there
  if (bitcoin.networkNodes.indexOf(newNodeUrl) === -1) {
    bitcoin.networkNodes.push(newNodeUrl);
  }
  // we want to register the new node with each node in the network
  const regNodesPromises = [];
  bitcoin.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true
    };
    // because we don't know how long it'll take to get the data we're asking for, we put all the promises in an array - then we promise all
    regNodesPromises.push(rp(requestOptions));
  });
  Promise.all(regNodesPromises)
    .then(data => {
      // use the data - we have to register all other nodes with the new nodes.
      const bulkRegisterOptions = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: {
          allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl]
        },
        json: true
      };
      return rp(bulkRegisterOptions);
    })
    .then(data => {
      res.json({ note: "New node registered with network successfully." });
    });
});

// register a node with the network:
app.post("/register-node", (req, res, next) => {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) === -1;
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) {
    bitcoin.networkNodes.push(newNodeUrl);
  }
  res.json({ note: "New node registered successfully." });
});

// register multiple nodes at once:
app.post("/register-nodes-bulk", (req, res, next) => {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeUrl => {
    const nodeNotAlreadyPresent =
      bitcoin.networkNodes.indexOf(networkNodeUrl) === -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
    if (notCurrentNode && nodeNotAlreadyPresent) {
      bitcoin.networkNodes.push(networkNodeUrl);
    }
  });
  res.json({ note: "Bulk registration successful." });
});

app.listen(port, function() {
  console.log(`listening on port ${port}!`);
});

// instead of running npm run start, we run npm run node 1, and then on a different command line, npm run node 2, etc
