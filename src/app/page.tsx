'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useChainId, useSendTransaction } from 'wagmi';
import { useState, useEffect } from 'react';
import { formatEther, parseEther } from 'viem';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, ArrowUpRight, ArrowDownLeft, Wallet, ExternalLink, Copy, Check } from 'lucide-react';
import { Modal } from '@/components/Modal';

interface CoinData {
  name: string;
  symbol: string;
  price: number;
  percentChange24h: number;
  marketCap: number;
  logo: string;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const chainId = useChainId();
  const [mounted, setMounted] = useState(false);
  const [activeModal, setActiveModal] = useState<'swap' | 'deposit' | 'withdraw' | null>(null);

  // Transaction states
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const { sendTransaction, isPending: txPending } = useSendTransaction();

  // Fetch market data
  const { data: marketData, isLoading: marketLoading } = useQuery<CoinData[]>({
    queryKey: ['marketData'],
    queryFn: async () => {
      const res = await fetch('/api/market-data');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 60000,
  });

  const ethData = marketData?.find(coin => coin.symbol === 'ETH');

  useEffect(() => setMounted(true), []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = () => {
    if (!recipient || !amount) return;
    sendTransaction({
      to: recipient as `0x${string}`,
      value: parseEther(amount),
    });
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center">
      <div className="glow-bg" />
      <div className="glow-point top-[-200px] left-[-200px] opacity-30" />
      <div className="glow-point bottom-[-200px] right-[-200px] opacity-20" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full">
        <div className="flex items-center justify-between p-6 md:p-10 max-w-[1400px] w-full">
          <div className="text-xl md:text-2xl font-black tracking-tighter text-white">
            WEB3<span className="text-blue-500">PROJECT</span>
          </div>
          <div className="flex items-center gap-4">
            {ethData && (
              <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 hover:bg-white/10 transition-colors">
                <img src={ethData.logo} alt="ETH" className="w-5 h-5 rounded-full" />
                <div className="flex flex-col items-start leading-none">
                  <div className="text-white font-bold text-xs">${ethData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  <div className={`text-[9px] font-black mt-1 ${ethData.percentChange24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {ethData.percentChange24h >= 0 ? '▲' : '▼'} {Math.abs(ethData.percentChange24h).toFixed(2)}%
                  </div>
                </div>
              </div>
            )}
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen px-6 pt-32 pb-20">
        <div className="flex flex-col items-center text-center gap-10 max-w-7xl w-full">

          {/* Hero Section */}
          <div className="space-y-6 animate-float">
            <h1 className="text-5xl md:text-8xl font-black tracking-tight text-gradient leading-[1.1]">
              The Future of <br /> Decentralized Finance
            </h1>
            <p className="text-zinc-400 text-base md:text-xl max-w-xl mx-auto font-medium">
              Seamlessly Swap, Deposit, and Withdraw assets with premium aesthetics and lightning-fast execution.
            </p>
          </div>

          <div className="w-full max-w-6xl space-y-12">
            {!isConnected ? (
              <div className="mt-6 flex justify-center">
                <ConnectButton label="Get Started Now" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Balance Cards Group */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  <div className="glass-card p-8 flex flex-col items-start gap-5 text-left border-white/10 bg-white/[0.02]">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                      <Wallet size={24} />
                    </div>
                    <div>
                      <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Balance</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-white text-3xl font-black">
                          {balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0.00'}
                        </span>
                        <span className="text-emerald-500 font-bold text-sm">{balance?.symbol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-8 flex flex-col items-start gap-5 text-left border-blue-500/30 bg-blue-500/5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                      <ArrowUpRight size={24} />
                    </div>
                    <div>
                      <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Estimated Value</h3>
                      <div className="flex flex-col mt-1">
                        <span className="text-white text-3xl font-black">
                          {balance && ethData
                            ? `$${(parseFloat(formatEther(balance.value)) * ethData.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                            : '$0.00'}
                        </span>
                        <p className="text-zinc-500 text-[10px] mt-1 font-mono uppercase tracking-widest">Live from CoinMarketCap</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Hub */}
                  <div className="glass-card p-8 flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20">
                    <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Quick Actions</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setActiveModal('swap')}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-blue-500 group-hover:border-blue-400 group-hover:scale-110 transition-all duration-300">
                          <ArrowUpDown size={20} />
                        </div>
                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">Swap</span>
                      </button>
                      <button
                        onClick={() => setActiveModal('deposit')}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-emerald-500 group-hover:border-emerald-400 group-hover:scale-110 transition-all duration-300">
                          <ArrowUpRight size={20} />
                        </div>
                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">Send</span>
                      </button>
                      <button
                        onClick={() => setActiveModal('withdraw')}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-purple-500 group-hover:border-purple-400 group-hover:scale-110 transition-all duration-300">
                          <ArrowDownLeft size={20} />
                        </div>
                        <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors">Receive</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Market Overview Section */}
            <div className="w-full flex flex-col gap-6 text-left">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Market Overview (Top 20)</h2>
                <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Real-time Intelligence</span>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="px-8 py-5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">Asset</th>
                        <th className="px-8 py-5 text-zinc-500 text-[10px] font-black uppercase tracking-widest">Price (USD)</th>
                        <th className="px-8 py-5 text-zinc-500 text-[10px] font-black uppercase tracking-widest text-right">24h Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {marketLoading ? (
                        [...Array(10)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td className="px-8 py-6"><div className="h-4 w-40 bg-white/5 rounded" /></td>
                            <td className="px-8 py-6"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                            <td className="px-8 py-6 flex justify-end"><div className="h-4 w-20 bg-white/5 rounded" /></td>
                          </tr>
                        ))
                      ) : (
                        marketData?.map((coin) => (
                          <tr key={coin.symbol} className="hover:bg-white/[0.02] transition-colors group">
                            <td className="px-8 py-6 relative">
                              <div className="flex items-center gap-4">
                                <div className="relative w-10 h-10 flex-shrink-0">
                                  <img
                                    src={coin.logo}
                                    alt={coin.name}
                                    className="w-full h-full rounded-2xl border border-white/10 group-hover:border-blue-500/30 group-hover:scale-105 transition-all p-1"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-white font-bold text-sm tracking-tight">{coin.name}</span>
                                  <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.1em]">{coin.symbol}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 font-mono font-bold text-white text-sm">
                              ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex justify-end">
                                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border leading-none ${coin.percentChange24h >= 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                  {coin.percentChange24h >= 0 ? '▲' : '▼'}{Math.abs(coin.percentChange24h).toFixed(2)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-20 py-10 text-zinc-600 text-[10px] font-bold tracking-[0.2em] uppercase">
          &copy; 2026 Web3 Premium Dashboard &middot; Trading without borders
        </footer>
      </main>

      {/* Transaction Modals */}
      <Modal
        isOpen={activeModal === 'swap'}
        onClose={() => setActiveModal(null)}
        title="Asset Swap"
      >
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">You Pay</label>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.0"
                className="bg-transparent text-2xl font-black text-white outline-none w-1/2"
              />
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl border border-white/10 cursor-pointer hover:bg-white/20 transition-colors">
                <img src={ethData?.logo} alt="ETH" className="w-5 h-5 rounded-full" />
                <span className="text-white font-bold text-sm">ETH</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center -my-2 relative z-10">
            <div className="p-2 bg-blue-500 rounded-xl border-4 border-[#050505] text-white">
              <ArrowUpDown size={20} />
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block mb-2">You Receive</label>
            <div className="flex items-center justify-between">
              <input
                type="number"
                placeholder="0.0"
                disabled
                className="bg-transparent text-2xl font-black text-white outline-none w-1/2"
              />
              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-xl border border-white/10 cursor-pointer hover:bg-white/20 transition-colors">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 text-[8px] font-bold">US</div>
                <span className="text-white font-bold text-sm">USDC</span>
              </div>
            </div>
          </div>
          <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-600/20 transition-all mt-4 transform active:scale-95">
            Swap Now
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'deposit'}
        onClose={() => setActiveModal(null)}
        title="Send Assets"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block ml-2">Recipient Address</label>
            <div className="relative">
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x... or ENS"
                className="w-full px-5 py-4 bg-white/5 rounded-2xl border border-white/10 text-white text-sm outline-none focus:border-emerald-500/50 transition-colors pr-10"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Wallet size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-zinc-500 text-[10px] font-black uppercase tracking-widest block ml-2">Amount to Send</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full px-5 py-4 bg-white/5 rounded-2xl border border-white/10 text-white text-2xl font-black outline-none focus:border-emerald-500/50 transition-colors pr-14"
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 font-bold text-sm">ETH</span>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
            <span className="text-zinc-400 text-xs">Estimated Gas Fee</span>
            <span className="text-emerald-500 font-bold text-xs">~0.0004 ETH</span>
          </div>

          <button
            onClick={handleSend}
            disabled={!recipient || !amount || txPending}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 transition-all transform active:scale-95"
          >
            {txPending ? 'Processing...' : 'Confirm Transaction'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'withdraw'}
        onClose={() => setActiveModal(null)}
        title="Receive Assets"
      >
        <div className="flex flex-col items-center gap-8 py-4">
          {/* QR Code Placeholder */}
          <div className="p-6 bg-white rounded-3xl shadow-xl shadow-white/5">
            <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center text-zinc-300 relative border-8 border-white">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ethereum:${address}`}
                alt="QR Code"
                className="w-full h-full mix-blend-multiply opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center p-2">
                  <img src={ethData?.logo} alt="ETH" className="w-full h-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full space-y-4">
            <p className="text-zinc-400 text-xs text-center px-4 leading-relaxed">
              Sharing your public address is safe. Only send assets supported on the <span className="text-purple-500 font-bold">Ethereum Network</span>.
            </p>

            <div
              onClick={handleCopy}
              className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between cursor-pointer group hover:bg-white/10 transition-all border-dashed"
            >
              <span className="text-white font-mono text-sm group-hover:text-purple-400 transition-colors">
                {address?.slice(0, 12)}...{address?.slice(-12)}
              </span>
              <div className="text-purple-500">
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 w-full text-zinc-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] mt-4">
              View on Etherscan <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
