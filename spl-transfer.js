const { Keypair, Transaction, Connection, PublicKey, LAMPORTS_PER_SOL, SystemProgram } = require("@solana/web3.js");
const { getAssociatedTokenAddress, createTransferCheckedInstruction, createAssociatedTokenAccountInstruction } = require("@solana/spl-token");
const { bs58 } = require("@coral-xyz/anchor/dist/cjs/utils/bytes");

//  to be deleted 
// const privateKey58 = [26,61,152,252,90,61,9,77,149,162,98,146,27,198,49,242,135,41,214,9,95,5,67,170,199,193,20,152,254,223,34,211,168,87,253,142,61,139,197,138,200,121,131,100,64,155,70,169,92,147,12,111,44,59,41,71,239,221,64,215,52,192,157,217]
// const strPrivateKey = bs58.encode(privateKey58);
// console.log(strPrivateKey);

const owner = '' // private key string previously obtained 
const spltoken = new PublicKey(""); // Program Id of your SPL Token, obtained during "anchor deploy"
const sourceWallet = Keypair.fromSecretKey(bs58.decode(owner));
const connection = new Connection("https://api.devnet.solana.com");

const destWallet = new PublicKey("");
const tokens = 1; // set the amount of tokens to transfer.

async function genAta(){
    let ata = await getAssociatedTokenAddress(
        spltoken, 
        destWallet,
        false
      );
    let tx = new Transaction();
        tx.add(
          createAssociatedTokenAccountInstruction(
            sourceWallet.publicKey, 
            ata,
            destWallet,
            spltoken
          )
        );
    console.log(`create ata txhash: ${await connection.sendTransaction(tx, [sourceWallet])}`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
}

const solanaTransferSpl = async () => {
    let amount = tokens * 10 ** 9;
    let sourceTokenRaw = await getAssociatedTokenAddress(
        spltoken,
        sourceWallet.publicKey,
        false
    );

    let destTokenRaw = await getAssociatedTokenAddress(
        spltoken,
        destWallet,
        false
    );
    let sourceATA = sourceTokenRaw.toBase58();
    let destATA = destTokenRaw.toBase58(); 
    try {
        let transaction = new Transaction();
        transaction.add(
            createTransferCheckedInstruction(
                new PublicKey(sourceATA),
                spltoken,
                new PublicKey(destATA),
                sourceWallet.publicKey,
                amount,
                9 
            )
        )
        let tx = await connection.sendTransaction(transaction, [sourceWallet])
        console.log('Tokens transferred Successfully, Receipt: ' + tx);
        return;
    }
    catch {
        let generateAta = await genAta();
            if (generateAta) {
                await new Promise((resolve) => setTimeout(resolve, 15000));
                solanaTransferSpl();
                return;
            }
        };
}

const solanSolTransfer = async ({
    amount
}) => {
    let transaction = new Transaction();
    transaction.add(
        SystemProgram.transfer({
            fromPubkey: sourceWallet.publicKey,
            toPubkey: destWallet,
            lamports: amount * LAMPORTS_PER_SOL // 1 lamport = 1/10^9 SOL
        })
    )
    let tx = await connection.sendTransaction(transaction, [sourceWallet])
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log('Solana transferred Successfully, Receipt: ' + tx);
    return;
}

// solanaTransferSpl()
//transfer 0.05 solana to the destination wallet
solanSolTransfer({
    amount: 0.1
})