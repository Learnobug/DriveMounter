"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { categorizeCategory, icons } from '../../lib/icons';
import { useUser } from "@clerk/clerk-react";

type FileCategory = 'image' | 'video' | 'audio' | 'document' | 'folder' | 'others';

export default function Showmore({ params }:{params:{item: FileCategory}}) {
  const { user } = useUser();
  const id = user?.id;
  const item = params.item;
  
  type File = {
    _id: string;
    name: string;
    webViewLink: string;
  };
  
  const [files, setFiles] = useState<{
    image: File[];
    video: File[];
    audio: File[];
    document: File[];
    folder: File[];
    others: File[];
  }>({
    image: [],
    video: [],
    audio: [],
    document: [],
    folder: [],
    others: [],
  });
  const [pageToken, setPageToken] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [loadmore,setloadmore]=useState(true);
  const toggleMenu = (index: any) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  }
  async function deleteFile(fileId: any) {
    try {
      const response = await axios.delete('http://localhost:3000/delete-file', {
        params: { fileId, userId: id },
      });
      console.log(response.data);
      // Optionally, remove the deleted file from the state
      setFiles(prevFiles => ({
        ...prevFiles,
        [item]: prevFiles[item].filter(file => file._id !== fileId)
      }));
    } catch (error) {
      console.error('Error deleting the file:', (error as Error).message);
    }
  }

  async function downloadFile(fileId:any) {
    try {
      const response = await axios.get('http://localhost:3000/download-file', {
        params: { fileId, userId: id },
        responseType: 'blob'
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
      console.error('Error downloading the file:', (error as Error).message);
    }
  }
  const addFiles = (newFiles:any) => {
    setFiles(prevFiles => ({
      ...prevFiles,
      [item]: [...prevFiles[item], ...newFiles],
    }));
    console.log('called2', files);
  };
  
  const fetchFiles = async (nextPageToken:any) => {
    console.log(pageToken)
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/fetch-files", {
        headers: {
          user_id: id,
        },
        params: {
          pageSize: 100,
          pageToken: nextPageToken
        }
      });
      const { files: fetchedFiles, nextPageToken: newPageToken } = response.data;

      const categorizedFiles = categorizeCategory(fetchedFiles, item);
      addFiles(categorizedFiles);
      setPageToken(newPageToken);
      if(!newPageToken) setloadmore(false);
     
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFiles(null); // Fetch the first page of files
  }, [user]);

  const handleLoadMore = () => {
    if (pageToken) {
      fetchFiles(pageToken);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="p-2 gap-2 flex justify-between">
        <h3 className="text-xl font-semibold mb-4">
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </h3>
      </div >
      <div className="flex flex-wrap gap-4">
      {(files[item] || []).map((file: any) => (
        <div key={file._id}>
          <Link
            target="_blank"
            href={file.webViewLink}
            className="mb-2 flex items-center gap-2 h-40 w-40 border flex-wrap justify-center"
          >
            <div>{icons[item]}</div>
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
              onClick={() => toggleMenu(file._id)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
              />
            </svg>
            {openMenuIndex === file._id && (
              <div className="ellipsis-menu">
                <ul className="border px-4 py-2 text-xs text-nowrap flex flex-col gap-2 bg-white rounded-md shadow-lg">
                  <button onClick={() => downloadFile(file._id)} className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                    Download
                  </button>
                  <button onClick={() => deleteFile(file._id)} className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                    Delete
                  </button>
                  <Link href={file.webViewLink} prefetch={true}  className="py-1 px-2 hover:bg-gray-100 cursor-pointer">
                    View
                  </Link>
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
      {loading && <p>Loading more files...</p>}
      {loadmore &&pageToken && !loading && (
        <button onClick={handleLoadMore} className="py-2 px-4 mt-4 bg-blue-500 text-white rounded">
          Load More
        </button>
      )}
      
    </div>
  );
}
