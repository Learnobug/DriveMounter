"use client"
import axios from "axios"
import { useEffect,useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import {categorizeFiles,icons} from '../lib/icons'
export default function DriveId({params}){
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
    
    const FetchData=async()=>{
       const response=await axios.get('http://localhost:3000/fetch-drive',{headers:{gmail_id:params.driveId}});
       const { files: fetchedFiles } = response.data;
       console.log(fetchedFiles);
 
       const categorizedFiles = categorizeFiles(fetchedFiles);
       setFiles(categorizedFiles);
    }

    useEffect(()=>{
     FetchData();
    },[])

    return(
        <><Navbar/>
      
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
                              <li className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                                Download
                              </li>
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
      </>
    )
}