const express = require("express");
const sha256 = require("crypto-js/sha256");
const app = express();

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

class Block {
    constructor(
        index,
        timestamp,
        transaction,
        precedingHash = ''
    ) {
        this.index = index;
        this.timestamp = timestamp;
        this.transaction = transaction;
        this.precedingHash = precedingHash;
        this.hash = this.computeHash();
    }

    computeHash() {
        return sha256(
            this.index +
            this.timestamp +
            this.precedingHash +
            JSON.stringify(this.transaction)
        ).toString();

    }

}
class Chain {
    constructor() {
        this.id = '';
        this.name = '';
        this.blockchain = '';
        this.difficulty = '';
    }
    create(id, name, genesis) {
        this.id = id;
        this.name = name;
        this.blockchain = [this.startGenesisblock(genesis)];
        this.difficulty = 4;
    }
    startGenesisblock(genesis) {
        return new Block(
            0,
            genesis.date,
            genesis.transaction,
            "0"
        );
    }

    obtainLatestBlock() {
        return this.blockchain[this.blockchain.length - 1]
    }

    addNewBlock(newBlock) {
        newBlock.precedingHash = this.obtainLatestBlock().hash;
        newBlock.hash = newBlock.computeHash();
        this.blockchain.push(newBlock);

    }
    checkChain() {
        for (let i = 1; i < this.blockchain.length; i++) {
            const currentBlcok = this.blockchain[i];
            const precedingBlcok = this.blockchain[i - 1];

            if (currentBlcok !== currentBlcok.computeHash()) {
                return false
            }
            if (precedingBlcok !== precedingBlcok.computeHash()) {
                return false
            }


        }
        return true;
    }
}

const GlobalChain = new Chain()

class KaiCoin {
    constructor() {
        this.chain = [];
    }
    validateNewChain = (req, res, next) => {
        if (req.body) {
            if (req.body.id &&
                req.body.name &&
                req.body.genesis &&
                req.body.genesis.date &&
                req.body.genesis.transaction
            ) {
                next();
            } else {
                res.status(400).json({
                    message: 'request format is not current'
                })
            }
        } else {
            res.status(400).json({
                message: 'body request format is not current'
            })
        }
    }

    createNewChain = (req, res) => {
        const block = GlobalChain.create(
            req.body.id,
            req.body.name,
            req.body.genesis,
        )
        res.status(200).json({
            message: 'Chain Created!',
            date: GlobalChain
        })

    }
    appendNewChild = (req, res) => {
        const block = new Block(
            this.chain.length,
            req.body.timestamp,
            req.body.transaction
        )
        GlobalChain.addNewBlock(block);
        res.status(200).json({
            message: 'Block added!'
        })

    }
    getChain = (req, res) => {
        res.status(200).json({
            chain: GlobalChain
        })
    }
}

const C = new KaiCoin();


app.post('/api/blockchain', C.validateNewChain, C.createNewChain)
app.get('/api/blockchain', C.getChain)
app.post('/api/blockchain/append', C.appendNewChild)

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome api blockchain'
    })
});
app.listen(8000, () => {
    console.log('Blockchain is running')
})
