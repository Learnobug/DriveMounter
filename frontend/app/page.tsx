"use client"
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import Link from "next/link";
import { useFiles } from '../app/context/FileContext';
import { icons } from '../app/lib/icons';

export default function Home() {
  const { user } = useUser();
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]); 
  
  const toggleMenu = (index: any) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  const Get_accounts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/get-accounts', {
        headers: {
          user_id: user?.id
        }
      });
      console.log(response.data);
      setAccounts(response.data.Accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }
  async function deleteFile(fileId) {
    try {
      const userId = user?.id;
      const response = await axios.delete('http://localhost:3000/delete-file', {
        params: { fileId, userId },
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error deleting the file:', error.message);
    }
  }

  async function downloadFile(fileId) {
    try {
      const userId = user?.id;
      const response = await axios.get('http://localhost:3000/download-file', {
        params: { fileId, userId },
        responseType: 'blob',
      });
  
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'downloaded_file';
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      console.log(`File downloaded successfully: ${fileName}`);
    } catch (error) {
      console.error('Error downloading the file:', error.message);
    }
  }

  const { files, loading, nextPageToken, fetchFiles } = useFiles();


  useEffect(() => {
    if (loading) {
      console.log('Loading files...');
    } else {
      console.log('Files:', files);
    }
  }, [loading, files]);

  const loadMoreFiles = () => {
    if (nextPageToken) {
      fetchFiles(100, nextPageToken); 
    }
  };

  const handleClick = async () => {
    try {
      await Get_accounts();
      await fetchFiles();
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
              <div className="flex flex-col py-3 ">
                <button
                  onClick={handleClick}
                  className="flex text-lg font-mono items-center gap-3 bg-[#333] dark:bg-[#333] text-[#fff] dark:text-[#fff] px-2 py-2 rounded-md"
                >
                  All Drives
                </button>
                {accounts.map((account) => (
              <Link prefetch={true} href={`/${account.gmail_id}`} key={account.id} className=" flex  block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                <img src={account.picture} alt={account.name} className="w-8 h-8 rounded-full mr-2" />
                <span>{account.name}</span>
                <div className="flex flex-col gap-2 p-1">
                <div className="gap-2">{account.Storage}GB/15GB</div>
                <div>{((Number(account.Storage) / 15) * 100).toFixed(2)}% Used</div>
                </div>
              </Link>
            ))}
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
                    <Link prefetch={true} href={`/show-more/${category}`}>Show More -&gt; </Link>
                  </div>
                  <ul className="flex gap-10 overflow-hidden">
                    {items.slice(0, 6).map((file: any, index: number) => (
                      <div key={file._id}>
                        <Link
                          target="blank"
                          href={file.webViewLink}
                          className="mb-2 flex items-center gap-2 h-40 w-40 border flex-wrap justify-center"
                        >
                          <div>{icons[category as keyof typeof icons]}</div>
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
                                <button onClick={() => downloadFile(file.id)} className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                                  Download
                                </button>
                                <button onClick={() => deleteFile(file.id)} className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                                  Delete
                                </button>
                                <Link href={`/${file.webViewLink}`} className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                                  View
                                </Link>
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
