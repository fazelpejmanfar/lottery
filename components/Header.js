import React from 'react'

function Header({ Connect, disConnect, isConnected }) {
  return (
    <div className=' w-full h-20 flex justify-between items-center px-5 absolute top-0 shadow-lg border-b border-black'>
    <h1 className=' text-white text-xl'>
        Lottery
    </h1>
    <div>
    {!isConnected ? (
        <button className=' w-28 h-8 bg-lime-300 text-black text-base rounded-md hover:bg-lime-800 hover:text-white' onClick={(e) => {
            e.preventDefault();
            Connect();
        }}>
            Connect
        </button> 
    ) : (
        <button className=' w-28 h-8 bg-lime-300 text-black text-base rounded-md hover:bg-lime-800 hover:text-white' onClick={(e) => {
            e.preventDefault();
            disConnect();
        }}>
            Disconnect
        </button>
    )}
    </div>
    </div>
  )
}

export default Header