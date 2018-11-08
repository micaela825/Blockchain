const Blockchain = require("./blockchain");
const bitcoin = new Blockchain();

const previousBlockHash = "0KJSDF839S9D9FS8DSKDJ8";
const currentBlockData = [
  {
    amount: 101,
    sender: "NKSDJF398SDF",
    recipient: "KDFS8939SJDF900"
  },
  {
    amount: 75,
    sender: "76ZD75X8F7JXJIK",
    recipient: "LV98XVKX98CVK"
  },
  {
    amount: 150,
    sender: "9SDFKSJDFS9DFJD9",
    recipient: "8SD8FS8DFJS8AKQQ"
  }
];

// bitcoin.createNewBlock(3849, "94jk849nd", "849djhertje76");
// bitcoin.createNewTransaction(100, "ALEX3HS9SDFD", "JENJIE389S8D");
// bitcoin.createNewBlock(7384, "3847nsd8fhsdf", "834hs73hus");
// bitcoin.createNewTransaction(200, "ALEX3HS9SDFD", "JENJIE389S8D");
// bitcoin.createNewTransaction(70, "ALEX3HS9SDFD", "JENJIE389S8D");
// bitcoin.createNewTransaction(2500, "ALEX3HS9SDFD", "JENJIE389S8D");
// create new transaction adds transaction to pending transactions. To get these transactions into the block chain, you have to create a new block:
//bitcoin.createNewBlock(8647, "KSJDF939SJD", "KSJDF9SKSLZ");

// when we ran: bitcoin.proofOfWork() we got 23564 - meaning it took that many iterations counting up the nonce from 0
console.log(bitcoin);
