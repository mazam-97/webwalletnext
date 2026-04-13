"use client"
import { useState } from "react";
import { generateMnemonic, validateMnemonic } from 'bip39';
import { Button, SecondaryButton } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import {DisplayMnemonic} from "@/components/DisplayMnemonic";
import { GenerateWallet } from "@/components/generateWallet";
export type WalletType="Solana"|"Etherium";
import { WalletModel } from "@/components/generateWallet";
import { Wallet } from "ethers";
import { Fascinate } from "next/font/google";
import PrivateKeyToggle from "@/components/PrivateKeyToggle";

type SavedRecoverCounts = { Etherium: number; Solana: number };
const RECOVER_STORAGE_KEY = "webwalletnext.recoverCounts.v1";

async function mnemonicId(mnemonic: string) {
  const normalized = mnemonic.trim().toLowerCase().replace(/\s+/g, " ");
  const data = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readRecoverCountsFromStorage(): Record<string, SavedRecoverCounts> {
  try {
    const raw = localStorage.getItem(RECOVER_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, SavedRecoverCounts>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeRecoverCountsToStorage(data: Record<string, SavedRecoverCounts>) {
  try {
    localStorage.setItem(RECOVER_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore (storage may be disabled)
  }
}

export default function Home() {

  const [isExpand, setExpand] = useState<boolean>(false);
  const [isCreateMnemonic,setIsCreateMnemonic]=useState(false);
  const [wallet,setWallet]=useState<WalletModel[]|null>([]);
  
  const router=useRouter();
  const [mnemonic, setMnemonic] = useState<string>("");
  const [mnemonicInput, setMnemonicInput] = useState<string>("");
  const [mnemonicError, setMnemonicError] = useState<string>("");
  async function onClickHandler(){
    let mn=await generateMnemonic();
    setMnemonic(mn);
    setMnemonicInput("");
    setMnemonicError("");
  }
  async function onRecoverHandler() {
    const candidate = mnemonicInput.trim().replace(/\s+/g, " ");
    if (!candidate) {
      setMnemonicError("Enter your 12/24-word recovery phrase.");
      return;
    }
    if (!validateMnemonic(candidate)) {
      setMnemonicError("That recovery phrase is not valid. Check spelling and word order.");
      return;
    }
    // Replace current session with the recovered wallet seed
    setWallet([]);
    setMnemonic(candidate);
    setMnemonicError("");

    const id = await mnemonicId(candidate);
    const stored = readRecoverCountsFromStorage()[id];
    const ethCount = Math.max(0, Math.min(200, stored?.Etherium ?? 0));
    const solCount = Math.max(0, Math.min(200, stored?.Solana ?? 0));

    // Recover exactly what was created in this browser for this seed.
    // If there is no local history, we intentionally do not guess a number.
    const finalEth = ethCount;
    const finalSol = solCount;

    if (finalEth === 0 && finalSol === 0) {
      setMnemonicError(
        "No wallet history found on this device for that recovery phrase. This app can only auto-recover the exact count it previously created in this browser.",
      );
      return;
    }

    const generated = await Promise.all([
      ...Array.from({ length: finalEth }, (_, i) => GenerateWallet("Etherium", candidate, i)),
      ...Array.from({ length: finalSol }, (_, i) => GenerateWallet("Solana", candidate, i)),
    ]);

    const recovered = generated.filter(Boolean) as WalletModel[];
    setWallet(recovered);
  }
  
  const onDeleteHandler=(publickey:string)=>{
   let walletUpdated=wallet?.filter(a=>a.publicKey!=publickey) as WalletModel[];
   setWallet([...walletUpdated]);
  }
  const onDeleteAllHandler=(blockchain:string)=>{
    
    let walletUpdated=wallet?.filter(a=>a.type!=blockchain) as WalletModel[];
    setWallet([...walletUpdated ]);
  }
  const onWalletGenerate=async(walletType:WalletType)=>{
   const nextIndex = wallet?.filter(a=>a.type===walletType).length ?? 0;
   let newwallet= await (GenerateWallet(walletType,mnemonic,nextIndex ));
   console.log('walletgenerated'+newwallet);
   if(wallet){
    let modWallet=[...wallet,newwallet];
    setWallet(modWallet as WalletModel[]);
    console.log(wallet);
   }
   console.log("wallet created"+wallet);

   // Persist how many wallets have been created for this mnemonic in this browser,
   // so recovery can recreate the full set automatically later.
   try {
     if (mnemonic) {
       const id = await mnemonicId(mnemonic);
       const all = readRecoverCountsFromStorage();
       const prev = all[id] ?? { Etherium: 0, Solana: 0 };
       const updated = {
         ...prev,
         [walletType]: Math.max(prev[walletType], nextIndex + 1),
       } as SavedRecoverCounts;
       all[id] = updated;
       writeRecoverCountsToStorage(all);
     }
   } catch {
     // ignore
   }
  }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-slate-100 to-purple-100 py-10 px-2">
      <div className="w-full max-w-2xl flex flex-col items-center mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 drop-shadow mb-2 text-center">Web3 Multi-Chain Wallet</h1>
        <p className="text-lg md:text-xl text-slate-700 font-medium mb-6 text-center">Securely manage your Solana & Ethereum wallets in one place.</p>
      </div>
      <div className="w-full max-w-2xl bg-white/80 rounded-2xl shadow-2xl p-8 mb-8 border border-slate-200">
        {mnemonic === ""
          ? (
            <GenerateMnemonic
              onGenerate={onClickHandler}
              onRecover={onRecoverHandler}
              mnemonicInput={mnemonicInput}
              setMnemonicInput={setMnemonicInput}
              error={mnemonicError}
            />
          ) : (
            <DisplayMnemonic mnemonic={mnemonic} />
          )}
      </div>
      {mnemonic !== "" && (
        <div className="w-full max-w-4xl bg-white/90 rounded-2xl shadow-2xl p-8 border border-slate-200">
          <h1 className="flex justify-center text-4xl font-extrabold mb-6 text-slate-800 tracking-tight drop-shadow">Choose a blockchain to get started</h1>
          <DisplayWalletSection wallet={wallet} onWalletGenerate={onWalletGenerate} onDelete={onDeleteHandler} onDeleteAll={onDeleteAllHandler} />
        </div>
      )}
    </main>
  );
}
const GenerateMnemonic = ({
  onGenerate,
  onRecover,
  mnemonicInput,
  setMnemonicInput,
  error,
}: {
  onGenerate: () => void;
  onRecover: () => void;
  mnemonicInput: string;
  setMnemonicInput: (value: string) => void;
  error: string;
}) => {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-lg bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6 border border-slate-200">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 shadow">
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-7 h-7'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M16.5 10.5V6.75A4.5 4.5 0 008 6.75v3.75m8.25 0a2.25 2.25 0 11-4.5 0m4.5 0H7.5m8.25 0V17.25A2.25 2.25 0 0113.5 19.5h-3a2.25 2.25 0 01-2.25-2.25V10.5' />
            </svg>
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Secret Recovery Phrase</h1>
        </div>
        <p className="text-slate-600 text-center text-base md:text-lg font-medium bg-yellow-50 border-l-4 border-yellow-400 px-4 py-2 rounded mb-2">
          <span className="font-bold text-yellow-700">Warning:</span> Never share your secret phrase with anyone. Anyone with this phrase can access your wallet.
        </p>
        <input
          type="text"
          value={mnemonicInput}
          onChange={(e) => setMnemonicInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onRecover();
          }}
          className="p-3 w-full rounded-lg border-2 border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition outline-none shadow-sm bg-slate-50 text-lg mb-1 placeholder-slate-400"
          placeholder="Paste your recovery phrase to recover an existing wallet"
        />
        {error && (
          <div className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            className="w-full py-3 text-lg font-semibold rounded-lg shadow-md bg-slate-900 text-white hover:bg-slate-800 transition"
            onClick={onRecover}
          >
            Recover Wallet
          </Button>
          <Button
            className="w-full py-3 text-lg font-semibold rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition text-white"
            onClick={onGenerate}
          >
            Generate New
          </Button>
        </div>
      </div>
    </div>
  );
};



const DisplayWalletSection=({wallet,onWalletGenerate,onDelete,onDeleteAll}:
  {wallet:WalletModel[]|null;
   onWalletGenerate:(walletType:WalletType)=>void;
   onDelete:(publicKey:string)=>void;
   onDeleteAll:(blockchain:WalletType)=>void;
  })=>{

    const [blockchain,setBlockChain]=useState<WalletType|null>(null);
    const [isEthSelected,setIsEthSelected]=useState<boolean>(false);
    const [isSolSelected,setIsSolSelected]=useState<boolean>(false);
    const [copiedIndex, setCopiedIndex] = useState<number|null>(null);
  return <div className="w-full">
    <div className="flex justify-center gap-6 mb-6">
      <SecondaryButton
        isSelected={isEthSelected}
        onClick={() => {
          setBlockChain("Etherium");
          setIsEthSelected(true);
          setIsSolSelected(false);
        }}
        className={`px-8 py-3 rounded-lg font-semibold text-lg shadow-md transition border-2 ${isEthSelected ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
      >
        Etherium
      </SecondaryButton>
      <SecondaryButton
        isSelected={isSolSelected}
        onClick={() => {
          setBlockChain("Solana");
          setIsSolSelected(true);
          setIsEthSelected(false);
        }}
        className={`px-8 py-3 rounded-lg font-semibold text-lg shadow-md transition border-2 ${isSolSelected ? 'bg-purple-500 text-white border-purple-600' : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50'}`}
      >
        Solana
      </SecondaryButton>
    </div>
    <div className="bg-slate-50 rounded-xl shadow-inner p-6">
      {(isEthSelected || isSolSelected) && (
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => onWalletGenerate(blockchain as WalletType)}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition"
          >
            Add Wallet
          </Button>
          {(wallet?.filter(a => a.type === blockchain).length ?? 0) > 0 && (
            <Button
              onClick={() => onDeleteAll(blockchain as WalletType)}
              className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
            >
              Clear All
            </Button>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wallet?.filter(a => a.type === blockchain).map((a, i) => (
          <div key={a.publicKey} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col gap-4 hover:shadow-xl transition">
            <div className="flex justify-between items-center">
              <h1 className="font-bold text-lg text-slate-700">
                {blockchain} Wallet {i + 1}
              </h1>
              <Button
                onClick={() => onDelete(a.publicKey)}
                className="px-4 py-1 rounded bg-red-500 text-white font-semibold shadow hover:bg-red-600 transition"
              >
                Delete Wallet
              </Button>
            </div>
            <div className="bg-slate-100 rounded p-3 flex items-center gap-2">
              <h2 className="font-semibold text-slate-600 text-sm mb-1">Public Key</h2>
              <div className="text-xs break-all text-slate-800">{a.publicKey}</div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(a.publicKey);
                  setCopiedIndex(i);
                  setTimeout(() => setCopiedIndex(null), 1500);
                }}
                className="ml-2 px-2 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition"
                title="Copy Public Key"
              >
                {copiedIndex === i ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-slate-100 rounded p-3 break-all text-xs">
           
              <PrivateKeyToggle privateKey={a.privateKey} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div> 
  
  
}