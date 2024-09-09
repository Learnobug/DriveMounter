"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import Link from "next/link";
import {categorizeFiles,icons} from './lib/icons'
// import fs from 'fs'

export default function Home() {
  const { user } = useUser();
  const [files, setFiles] = useState({
    images: [],
    videos: [],
    audio: [],
    documents: [],
    folders: [],
    others: [],
  });

  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const toggleMenu = (index: any) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  async function downloadFile(fileId) {
    try {
      const userId=user?.id;
      console.log('file',fileId)
      const response = await axios.get(`http://localhost:3000/download-file`, {
        params: { fileId, userId },
        responseType: 'stream' 
      });
  
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'downloaded_file';
  
   
      const fileStream = fs.createWriteStream(fileName);
      response.data.pipe(fileStream);
  
      fileStream.on('finish', () => {
        console.log(`File downloaded successfully: ${fileName}`);
      });
  
      fileStream.on('error', (err) => {
        console.error('Error writing the file to disk:', err);
      });
    } catch (error) {
      console.error('Error downloading the file:', error.message);
    }
  }
 


  const handleClick = async () => {
    // console.log("called");
    try {
      const response = await axios.get("http://localhost:3000/fetch-files", {
        headers: {
          user_id: user?.id,
        },
      });
      const { files: fetchedFiles } = response.data;
      console.log(fetchedFiles);

      const categorizedFiles = categorizeFiles(fetchedFiles);
      setFiles(categorizedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  return (
    <div>
      <Navbar/>
      <div className="grid grid-cols-5 h-screen">
        <div className="h-screen col-span-1 bg-[#f5f5f4] border-solid border-r-2 black rounded-sm">
          <div className="flex h-screen gap-1 flex-col">
            <div className="p-4 flex-col gap-3 items-center justify-between">
              <h2 className="text-2xl py-6 font-bold font-mono dark:text-[#040404]">
                My Drives
              </h2>
              <div className="flex flex-col py-3 border-b-4 border-[#333]">
                <button
                  onClick={handleClick}
                  className="flex text-lg font-mono items-center gap-3 bg-[#333] dark:bg-[#333] text-[#fff] dark:text-[#fff] px-2 py-2 rounded-md"
                >
                  All Drives
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-4 p-4 overflow-y-auto">
          {Object.entries(files).map(
            ([category, items]) =>
              items.length > 0 && (
                <div key={category} className="mb-6">
                  <div className="flex justify-between">
                    <h3 className="text-xl font-semibold mb-4">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h3>
                    <button>Show More -&gt; </button>
                  </div>
                  <ul className="flex gap-10 overflow-hidden">
                    {items.slice(0, 6).map((file: any, index: number) => (
                      <div key={file._id}>
                        <Link
                          target="blank"
                          href={file.webViewLink}
                          key={file.id}
                          className="mb-2 flex items-center gap-2 h-40 w-40 border flex-wrap justify-center"
                        >
                          <div>{icons[category as keyof typeof files]}</div>
                        </Link>
                        <div className="flex justify-between">
                          <span className="text-sm text-wrap w-full">
                            {file.name}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6 cursor-pointer"
                            onClick={() => toggleMenu(file.id)}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                            />
                          </svg>
                          {openMenuIndex === file.id && (
                            <div className="ellipsis-menu">
                              <ul className="border px-4 py-2 text-xs text-nowrap flex flex-col gap-2 bg-white rounded-md shadow-lg">
                                <button onClick={()=>{downloadFile(file.id)}} className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                                  Download
                                </button>
                                <li className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                                  Delete
                                </li>
                                <li className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                                  View
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </ul>
                </div>
              )
          )}
        </div>
      </div>
    </div>
  );
}
