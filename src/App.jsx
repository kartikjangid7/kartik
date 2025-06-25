import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { FaCopy } from 'react-icons/fa'; 
import './App.css';
import { Analytics } from "@vercel/analytics/react";


const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 20px rgba(74, 92, 255, 0.6)',
    transition: { duration: 0.3 },
  },
};

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [txHistory, setTxHistory] = useState([]);
  const [txStatus, setTxStatus] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const ETHERSCAN_API_KEY = 'WEJH56FVVWXJB9T3P7N5UKE3D5PXDZDQBF';
  const ETHERSCAN_API_URL = 'https://api-sepolia.etherscan.io/api';

  const [ethPrice, setEthPrice] = useState(null);
const [ethChange, setEthChange] = useState(null);

const fetchEthPrice = async () => {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true');
    const data = await res.json();
    setEthPrice(data.ethereum.usd);
    setEthChange(data.ethereum.usd_24h_change.toFixed(2));
  } catch (err) {
    console.error('Error fetching ETH price:', err);
  }
};

useEffect(() => {
  fetchEthPrice();
  const interval = setInterval(fetchEthPrice, 30000); 
  return () => clearInterval(interval);
}, []);


  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('MetaMask is not installed');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(balance));
      fetchTransactionHistory(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactionHistory = async (address) => {
    try {
      const response = await fetch(
        `${ETHERSCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${ETHERSCAN_API_KEY}`
      );
      const data = await response.json();
      if (data.status === '1') {
        setTxHistory(data.result);
      } else {
        setTxHistory([]);
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching transaction history');
    }
  };

  const sendTransaction = async () => {
    if (!recipient || !amount) {
      setTxStatus('Recipient and amount are required.');
      return;
    }

    try {
      setTxStatus('Sending...');
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });

      setTxStatus(`Transaction Sent! Waiting for confirmation...`);
      await tx.wait();

      setTxStatus(`✅ Sent! Tx Hash: ${tx.hash}`);
      setRecipient('');
      setAmount('');

      const newBalance = await provider.getBalance(account);
      setBalance(ethers.formatEther(newBalance));
      fetchTransactionHistory(account);
    } catch (err) {
      console.error(err);
      if (err.code === 'INSUFFICIENT_FUNDS') {
        setTxStatus('❌ Not enough ETH to send this transaction.');
      } else if (err.code === 4001) {
        setTxStatus('❌ Transaction rejected by the user.');
      } else {
        setTxStatus(`❌ Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(account);
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-r from-[#0f1123] to-[#0d0f20] text-white">
      <nav className="px-6 py-4 flex justify-between items-center shadow-md bg-opacity-80 bg-[#0f1123]">
      <img src="ethereum-eth-logo.png" alt="Ethereum Logo" className="w-8 h-8 mr-2" />
        <div className="text-xl font-bold text-white"> CryptWallet</div>
        <button
          onClick={connectWallet}
          className="bg-[#4a5cff] hover:bg-[#3f4edc] transition px-4 py-2 rounded-md font-medium"
        >
          {account ? 'Connected' : 'Connect Wallet'}
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Cryptocurrency Perfect <span className="text-[#4a5cff]">Investment</span>
          </h1>
          <p className="mt-4 text-gray-300 text-lg">Secure. Fast. Trusted by 20K+ users worldwide.</p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center mb-12">
          {['25K+', '100K+', '25+'].map((val, idx) => (
            <motion.div
              key={idx}
              className="border border-gray-700 rounded-lg py-6 bg-[#1b1e35]"
              {...hoverGlow}
            >
              <p className="text-3xl font-bold text-[#4a5cff]">{val}</p>
              <p className="text-gray-400 mt-2">
                {idx === 0 ? 'People who joined CryptWallet' : idx === 1 ? 'Transactions this month' : 'Corporate Partners'}
              </p>
            </motion.div>
          ))}
        </div>

        {account && (
          <>
          {ethPrice && (
  <motion.div
    className="bg-[#141627] p-4 mb-6 rounded-xl shadow-lg border border-[#4a5cff] flex items-center justify-between"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    {...hoverGlow}
  >
    <div>
      <h3 className="text-lg font-semibold text-white">🌐 Live Ethereum Price</h3>
      <p className="text-gray-300 text-sm mt-1">Data updates every 30 seconds</p>
    </div>
    <div className="text-right">
      <p className="text-2xl font-bold text-[#4a5cff]">${ethPrice.toFixed(2)}</p>
      <p className={`text-sm font-medium ${ethChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {ethChange >= 0 ? '▲' : '▼'} {Math.abs(ethChange)}%
      </p>
    </div>
  </motion.div>
)}

            <motion.div
              className="bg-[#1b1e35] p-6 rounded-xl shadow-lg mb-6 border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              {...hoverGlow}
            >
              <h2 className="text-xl font-semibold mb-2">Wallet Info</h2>
              <div className="flex justify-between items-center">
                <p className="break-all"><strong>Address:</strong> {account}</p>
                <FaCopy
                  onClick={copyToClipboard}
                  className="cursor-pointer text-gray-400 hover:text-white"
                />
              </div>
              <div className="mt-2">
                <button
                  className="text-[#4a5cff] font-medium"
                  onClick={() => setShowBalance((prev) => !prev)}
                >
                  {showBalance ? 'Hide Balance' : 'Show Balance'}
                </button>
                {showBalance && <p><strong>Balance:</strong> {balance} ETH</p>}
              </div>
            </motion.div>

            <motion.div
              className="bg-[#1b1e35] p-6 rounded-xl shadow-xl mb-6 border border-gray-700 flex flex-col gap-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              {...hoverGlow}
            >
              <h2 className="text-2xl font-bold text-white">🚀 Send ETH</h2>
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-400">Recipient Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="p-3 rounded-md bg-[#2c2f4a] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-[#4a5cff]"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-gray-400">Amount (ETH)</label>
                <input
                  type="number"
                  placeholder="e.g. 0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="p-3 rounded-md bg-[#2c2f4a] border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-[#4a5cff]"
                />
              </div>
              <button
                onClick={sendTransaction}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#4a5cff] to-[#6d78ff] hover:opacity-90 transition font-semibold py-2 rounded-md text-white text-lg"
              >
                {loading ? 'Sending...' : 'Send ETH'}
              </button>
              {txStatus && <p className="text-sm italic text-gray-300">{txStatus}</p>}
            </motion.div>

            <motion.div
              className="bg-[#1b1e35] p-6 rounded-xl shadow-xl border border-gray-700"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              {...hoverGlow}
            >
              <h2 className="text-2xl font-bold mb-5 text-white">📜 Transaction History</h2>
              {txHistory.length === 0 ? (
                <p className="text-gray-400">No transactions found.</p>
              ) : (
                <ul className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {txHistory.map((tx, index) => (
                    <li
                      key={index}
                      className="bg-[#2a2d4a] p-4 rounded-lg shadow-md border border-gray-600 hover:bg-[#323659] transition"
                    >
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 font-mono text-sm break-all hover:underline"
                      >
                        Tx Hash: {tx.hash}
                      </a>
                      <div className="text-gray-300 text-sm mt-2 space-y-1">
                        <p><span className="font-medium text-white">To:</span> {tx.to}</p>
                        <p>
                          <span className="font-medium text-white">Amount:</span>{' '}
                          <span className="text-green-400 font-semibold">{ethers.formatEther(tx.value)} ETH</span>
                        </p>
                        <p>
                          <span className="font-medium text-white">Date:</span>{' '}
                          {new Date(tx.timeStamp * 1000).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </main>

      <footer className="bg-[#0f1123] text-center text-gray-400 py-4 border-t border-gray-700">
        <p>&copy; {new Date().getFullYear()} CryptWallet. All rights reserved.</p>
      </footer>
       <Analytics />
    </div>
  );
}

export default App;      
 