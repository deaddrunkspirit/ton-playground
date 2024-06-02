import { mnemonicToWalletKey } from 'ton-crypto'
import { TonClient, WalletContractV4, internal } from 'ton';
import { fromNano } from 'ton-core';
import { getHttpEndpoint } from '@orbs-network/ton-access';


async function main() {
    const mnemonic = "inherit juice finish flash never illegal require kitten elder cement nuclear pledge dove rug fame party taxi estate loyal devote fine dinosaur armor fall";
    const key = await mnemonicToWalletKey(mnemonic.split(' '));
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
   
    const endpoint = await getHttpEndpoint({ network: 'testnet' });
    const client = new TonClient({endpoint});
    if (!await client.isContractDeployed(wallet.address)) {
        console.log('not deployed!');
    }
    
    console.log('wallet is deployed');

    const balance = await client.getBalance(wallet.address);
    console.log('balance', fromNano(balance));

    const addressToSend = 'EQA4V9tF4lY2S_J-sEQR7aUj9IwW-Ou2vJQlCn--2DLOLR5e';
    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();
    await walletContract.sendTransfer({
        secretKey: key.secretKey,
        seqno: seqno,
        messages: [
            internal({
                to: addressToSend,
                value: '0.05',
                body: 'Hello',
                bounce: false,
            })
        ]
    });
    
    let currSeqno = seqno;
    
    while (currSeqno == seqno) {
        console.log('Pending . . .');
        await sleep(1500);
        currSeqno = await walletContract.getSeqno()
    }
    console.log('transaction confirmed');

}

main();

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

