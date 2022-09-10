import Head from 'next/head';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '../components/Header';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import ABI from '../helpers/abi.json';
import { InfinitySpin } from 'react-loader-spinner'
import Countdown from 'react-countdown';



export default function Home() {
  const ContractAddress = '0xa7DBcdcf5D02de33Ef5b55d87F0c61dD49Fa256d';
  const [Address, setAddress] = useState();
  const [isConnected, setisConnected] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [Contract, setContract] = useState();
  const [Ticket, setTicket] = useState(1);
  const [RemainingTickts, setRemainingTickts] = useState(0);
  const [MaxTickts, setMaxTickts] = useState(0);
  const [TicketPrice, setTicketPrice] = useState(0.01);
  const [TicketDisplayPrice, setTicketDisplayPrice] = useState(0.01);
  const [Expire, setExpire] = useState(0);
  const [LastWinner, setLastWinner] = useState('');
  const [LastWinnerAmount, setLastWinnerAmount] = useState(0);
  const [Winner, setWinner] = useState();
  const [WinnerPrize, setWinnerPrize] = useState(0);
  const [Owner, setOwner] = useState();
  const [OwnerCommission, setOwnerCommission] = useState(0);

  const connection = async() => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        toast.loading('Connecting...');
        setisLoading(true);
        const provider =  new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
            const signer = provider.getSigner();
            const Lottery = new ethers.Contract(ContractAddress, ABI, signer);
            setContract(Lottery);
            const RemainingTickets = await Lottery.RemainingTickets();
            setRemainingTickts(Number(RemainingTickets));
            const ticketPrice = await Lottery.ticketPrice();
            setTicketPrice(Number(ticketPrice));
            setTicketDisplayPrice(ethers.utils.formatEther(ticketPrice));
            const maxTickets = await Lottery.maxTickets();
            setMaxTickts(Number(maxTickets));
            const expiration = await Lottery.expiration();
            setExpire(Number(expiration));
            const lastWinner = await Lottery.lastWinner();
            setLastWinner(lastWinner);
            const lastWinnerAmount = await Lottery.lastWinnerAmount();
            setLastWinnerAmount(ethers.utils.formatEther(lastWinnerAmount));
            const IsWinner = await Lottery.IsWinner();
            setWinner(IsWinner);
            const checkWinningsAmount = await Lottery.checkWinningsAmount();
            setWinnerPrize(ethers.utils.formatEther(checkWinningsAmount));
            const owner = await Lottery.owner();
            setOwner(owner);
            const operatorTotalCommission = await Lottery.operatorTotalCommission();
            setOwnerCommission(ethers.utils.formatEther(operatorTotalCommission));
            setAddress(accounts[0]);
            setisConnected(true);
            setisLoading(false);
            toast.dismiss();
            toast.success('Connected');
      }
    } catch (e) {
      toast.dismiss();
      toast.error(e.message);
    }
  };


   const disConnect = () => {
    setAddress();
    setisConnected(false);
   };

   const IncrementTickets = () => {
    let newticket = Ticket + 1;
    if (newticket > RemainingTickts) {
      newticket = RemainingTicktsl
    }
    setTicket(newticket);
   };

   const DecrementTickets = () => {
    let newticket = Ticket - 1;
    if (newticket < 1) {
      newticket = 1
    }
    setTicket(newticket);
   };


   const BuyTickets = async() => {
    const date = new Date().getTime();
    if(date > Expire * 1000) {
      toast.error("This Round Ends, Wait for The Next Round")
    } else {
    toast.loading(`Buying ${Ticket} Ticket...`);
    let price = String(TicketPrice * Ticket);
    try {
      const Buy = await Contract.BuyTickets(Ticket, {
        from: Address,
        value: price,
        gasLimit: 105000 * Ticket
      });
      const TX = await Buy.wait()
      .then(async(receipt) => {
        toast.dismiss();
        console.log(receipt);
        toast.success(`You Succesfully Bought ${Ticket} Ticket`);
        const RemainingTickets = await Contract.RemainingTickets();
        setRemainingTickts(Number(RemainingTickets));
      });
    } catch (e) {
      toast.dismiss();
      toast.error(e.message);
    }
  }
   };


   const ClaimRewards = async() => {
    toast.loading(`Claiming ${WinnerPrize} ETH...`);
    try {
      const Claim = await Contract.WithdrawWinnings({
        from: Address,
        gasLimit: 105000
      });
      const TX = await Claim.wait()
      .then(async(receipt) => {
        toast.dismiss();
        console.log(receipt);
        toast.success(`You Succesfully Claimed ${WinnerPrize} ETH`);
        const lastWinner = await Contract.lastWinner();
        setLastWinner(lastWinner);
        const lastWinnerAmount = await Contract.lastWinnerAmount();
        setLastWinnerAmount(ethers.utils.formatEther(lastWinnerAmount));
        const IsWinner = await Contract.IsWinner();
        setWinner(IsWinner);
        const checkWinningsAmount = await Contract.checkWinningsAmount();
        setWinnerPrize(ethers.utils.formatEther(checkWinningsAmount));
      });
    } catch (e) {
      toast.dismiss();
      toast.error(e.message);
    }
   };

   const PickWinner = async() => {
    toast.loading(`Picking Winner...`);
    try {
      const Claim = await Contract.DrawWinnerTicket({
        from: Address,
        gasLimit: 105000
      });
      const TX = await Claim.wait()
      .then(async(receipt) => {
        toast.dismiss();
        console.log(receipt);
        toast.success(`Winner Picked`);
        const lastWinner = await Contract.lastWinner();
        setLastWinner(lastWinner);
        const lastWinnerAmount = await Contract.lastWinnerAmount();
        setLastWinnerAmount(ethers.utils.formatEther(lastWinnerAmount));
      });
    } catch (e) {
      toast.dismiss();
      toast.error(e.message);
    }
   };

   const WithdrawCommision = async() => {
    toast.loading(`Withdraw Commision...`);
    try {
      const Claim = await Contract.WithdrawCommission({
        from: Address,
        gasLimit: 105000
      });
      const TX = await Claim.wait()
      .then(async(receipt) => {
        toast.dismiss();
        console.log(receipt);
        toast.success(`Commission Withdrawed`);
        const operatorTotalCommission = await Contract.operatorTotalCommission();
        setOwnerCommission(Number(operatorTotalCommission));
      });
    } catch (e) {
      toast.dismiss();
      toast.error(e.message);
    }
   };

   const RefundAll = async() => {
    toast.loading(`Refund All...`);
    try {
      const Claim = await Contract.RefundAll({
        from: Address,
        gasLimit: 105000 * RemainingTickts
      });
      const TX = await Claim.wait()
      .then(async(receipt) => {
        toast.dismiss();
        console.log(receipt);
        toast.success(`Refund Done`);
        const RemainingTickets = await Contract.RemainingTickets();
        setRemainingTickts(Number(RemainingTickets));
      });
    } catch (e) {
      toast.dismiss();
      toast.error(e.message);
    }
   };

   const RestartDraw = async() => {
    toast.loading(`Restarting...`);
    try {
      const Claim = await Contract.restartDraw({
        from: Address,
        gasLimit: 105000
      });
      const TX = await Claim.wait()
      .then(async(receipt) => {
        toast.dismiss();
        console.log(receipt);
        toast.success(`Done`);
        const RemainingTickets = await Contract.RemainingTickets();
        setRemainingTickts(Number(RemainingTickets));
      });
    } catch (e) {
      toast.dismiss();
      toast.error(e.message);
    }
   };

  return (
    <div className=' min-h-screen flex flex-col justify-center items-center bg-[#0F172A]'>
      <Head>
        <title>Crypto Lottery</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header Connect={connection} disConnect={disConnect} isConnected={isConnected}/>

      <div className=' flex flex-col justify-center items-center w-full min-h-[350px] lg:flex-col p-4'>
      {!isConnected ? (
        <>
        <div className='flex flex-col justify-center items-center'>
        {!isLoading ? (
          <h1 className='text-white text-xl'>
          Please Connect Your Wallet first
        </h1>

        ) : (
<>
<h1 className='text-white text-xl'>
          Loading Contract info...
        </h1>
        <InfinitySpin 
  width='200'
  color="#4fa94d"
/>
</>
        )}


        </div>
        </>

        
      ) : (
        <>
        {String(Address).toLocaleLowerCase == String(Owner).toLocaleLowerCase ? (
          <div className=' w-full lg:w-[60%] min-h-[180px] lg:min-h-[80px] bg-slate-500 flex flex-col lg:flex-row justify-between lg:justify-around p-5 items-center rounded-md mb-3 mt-24 lg:mt-3'>
          <button className=' w-28 h-8 bg-amber-600 text-black text-base rounded-md hover:bg-amber-800 hover:text-white' onClick={(e) => {
          e.preventDefault();
          PickWinner();
        }}>
          Pick Winner
        </button>
        <button className=' w-36 h-8 bg-amber-600 text-black text-base rounded-md hover:bg-amber-800 hover:text-white' onClick={(e) => {
          e.preventDefault();
          WithdrawCommision();
        }}>
          Withdraw {OwnerCommission}
        </button>
        <button className=' w-28 h-8 bg-amber-600 text-black text-base rounded-md hover:bg-amber-800 hover:text-white' onClick={(e) => {
          e.preventDefault();
          RefundAll();
        }}>
          Refund All
        </button>
        <button className=' w-28 h-8 bg-amber-600 text-black text-base rounded-md hover:bg-amber-800 hover:text-white' onClick={(e) => {
          e.preventDefault();
          RestartDraw();
        }}>
          Restart
        </button>
          </div>
        ) : (
          <></>
        )}
        <div className='flex flex-col lg:flex-row justify-center items-center gap-6 w-full mb-5'>
        <h1 className='text-white text-sm lg:text-xl text-center'>
         Last Winner: {String(LastWinner).substring(0,6)}...{String(LastWinner).substring(36,42)}
        </h1>
        <h1 className='text-white text-sm lg:text-xl text-center'>
          Prize Won: {LastWinnerAmount} ETH
        </h1>
        </div>
        <div className=' flex flex-col gap-8 lg:gap-0 lg:flex-row justify-around items-center w-full'>
        <div className='flex flex-col justify-around items-center min-h-[200px] min-w-full max-w-full lg:min-h-[300px] lg:min-w-[550px] bg-slate-500 p-2 rounded-md'>
        <h1 className='text-white text-sm lg:text-xl text-center'>
         Lottery Will be Expired:  <Countdown date={Expire * 1000} />
        </h1>
        <h1 className='text-white text-sm lg:text-xl text-center'>
         Max Tickets To Buy: {MaxTickts}
        </h1>
        <h1 className='text-white text-sm lg:text-xl text-center'>
         Tickets Remaining: {RemainingTickts}
        </h1>
        <h1 className='text-white text-sm lg:text-xl text-center'>
         Total Prize: {(MaxTickts - RemainingTickts) * TicketDisplayPrice} ETH
        </h1>





        </div>

        <div className='flex flex-col justify-around items-center min-h-[200px] min-w-full max-w-full lg:min-h-[300px] lg:min-w-[550px] bg-slate-500 p-2 rounded-md'>
        <h1 className='text-white text-sm lg:text-xl text-center'>
        Ticket Price: {TicketDisplayPrice} ETH
        </h1>
        <div className=' flex justify-center items-center gap-5'>
        <button className=' bg-lime-300 text-xl text-black w-8 h-8 rounded-full font-bold text-center hover:bg-lime-800 hover:text-white' onClick={(e) => {
          e.preventDefault();
          DecrementTickets();
        }}>
          -
        </button>
        <h1 className='text-white text-sm lg:text-xl text-center'>
         {Ticket}
        </h1>
        <button className=' bg-lime-300 text-xl text-black w-8 h-8 rounded-full font-bold text-center hover:bg-lime-800 hover:text-white' onClick={(e) => {
          e.preventDefault();
          IncrementTickets();
        }}>
          +
        </button>
        </div>
        <button className=' w-28 h-8 bg-lime-300 text-black text-base rounded-md hover:bg-lime-800 hover:text-white' onClick={(e) => {
          e.preventDefault();
          BuyTickets();
        }}>
          BUY
        </button>
        <h1 className='text-white text-sm lg:text-xl text-center'>
         {TicketDisplayPrice * Ticket} ETH
        </h1>
        {Winner ? (
          <>
          <h1 className=' text-green-400 text-sm lg:text-xl text-center font-bold'>
         Congrats you are the winner
        </h1>

          <button className=' w-28 h-8 bg-lime-300 text-black text-base rounded-md hover:bg-lime-800 hover:text-white' onClick={(e) => {
            e.preventDefault();
            ClaimRewards();
          }}>
          Claim {WinnerPrize}ETH
          </button>
          </>
        ) : (
          <></>
        )}
        </div>

        </div>


        </>
      )}
      </div>

     
    </div>
  )
}
