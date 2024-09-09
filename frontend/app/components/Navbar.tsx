"use client";
import React from "react";
import DropDown from "./DropDown";
import axios from "axios";
import { useUser } from '@clerk/clerk-react';

const Navbar: React.FC = () => {

    const { user } = useUser();
    console.log(user?.id)
    const handleClick = async () => {
        const response = await axios.get('http://localhost:3000/auth',{headers:{
             user_id:user?.id
        }});
        window.location.href = response.data.authUrl;
  };


  return (
    <div className="flex justify-between items-center p-4 bg-black border-b border-gray-300 text-white">
      <div className="flex justify-center items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 13.5H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
          />
        </svg>

        <span className="text-xl font-bold">Drive Mounter</span>
      </div>
      <div className="flex justify-center items-center gap-3">
        <DropDown />
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Connect account
        </button>
      </div>
    </div>
  );
};

export default Navbar;
