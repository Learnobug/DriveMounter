"use client"
import axios from "axios"
import { useEffect,useState } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import { useRouter } from 'next/navigation';
import {categorizeCategory,icons} from '../../lib/icons'
import { useUser } from "@clerk/clerk-react";

export default function Showmore({params}){
    const { user } = useUser();

   const item=params.item;
    const [files, setFiles] = useState([]);
      const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);


      
  async function deleteFile(fileId) {
    const userId = user?.id;
    const response = await axios.delete('http://localhost:3000/delete-file', {
      params: { fileId, userId },
    });
    console.log(response.data);

  }

  async function downloadFile(fileId) {
    try {
      const userId = user?.id;
      console.log('file', fileId);
      const response = await axios.get('http://localhost:3000/download-file', {
        params: { fileId, userId },
        responseType: 'blob' // Change responseType to 'blob'
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
 

      const toggleMenu = (index: any) => {
        setOpenMenuIndex(openMenuIndex === index ? null : index);
      };

      const FetchData=async()=>{
        try {
            const response = await axios.get("http://localhost:3000/fetch-files", {
              headers: {
                user_id: user?.id,
              },
            });
            const { files: fetchedFiles } = response.data;
            console.log(fetchedFiles);
      
            const categorizedFiles = categorizeCategory(fetchedFiles);
            setFiles(categorizedFiles);
          } catch (error) {
            console.error("Error fetching files:", error);
          }
     }
 
     useEffect(()=>{
      FetchData();
     },[])

     return(
        <div>
            <div className="p-2 gap-2flex justify-between">
                  <h3 className="text-xl font-semibold mb-4">
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </h3>
                </div>
                {files.map((file: any, index: number) => (
                    <div key={file._id}>
                      <Link
                        target="blank"
                        href={file.webViewLink}
                        key={file.id}
                        className="mb-2 flex items-center gap-2 h-40 w-40 border flex-wrap justify-center"
                      >
                        <div>{icons[item as keyof typeof files]}</div>
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
                                <button onClick={()=>{deleteFile(file.id)}} className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                                  Delete
                                </button >
                                <Link href={`/${file.webViewLink}`} className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                                  View
                                </Link>
                            </ul>
                          </div>
                        )}
                        </div>
        </div>
     ))}
     </div>)
}