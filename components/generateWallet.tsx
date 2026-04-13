import { WalletType } from "@/app/page";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import base58 from "bs58";

import { Wallet, HDNodeWallet } from "ethers";
import { BytesLike } from "ethers";
export interface WalletModel{
    type:WalletType,
    publicKey:string,
    privateKey:string,
    mnemonic:string,
    path:string
}

export const GenerateWallet= async (
    walletType:WalletType,mnemonic:string,index:number):Promise<WalletModel|null>=>{
    let encodedPublicKey:string;
    let encodedPrivateKey:string;
    let path:string;
    const seed = await  mnemonicToSeed(mnemonic);
    if(walletType ==="Solana"){
      
        path = `m/44'/501'/${index}'/0'`;
        //@ts-ignore
        const {key:derivedSeed} = derivePath(path, seed.toString("hex"))
        const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
        const keypair = Keypair.fromSecretKey(secret);
        // Standard: publicKey = base58(pubkey), privateKey = base58(secretKey)
        encodedPublicKey = keypair.publicKey.toBase58();
        encodedPrivateKey = base58.encode(secret).toString();

    }
    else if(walletType==="Etherium"){
        // Standard BIP44 (MetaMask compatible): m/44'/60'/0'/0/index
        path = `m/44'/60'/0'/0/${index}`;
        const hdNode = HDNodeWallet.fromSeed(seed);
        const child = hdNode.derivePath(path);
         encodedPrivateKey = child.privateKey;
        const wallet = new Wallet(encodedPrivateKey);
        encodedPublicKey=wallet.address;
    }
    else{
        return null;
    }

     return{
     publicKey:encodedPublicKey,
     privateKey:encodedPrivateKey,
     type:walletType,
     mnemonic,
     path,

    }
        
    

}