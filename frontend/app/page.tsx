"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import Link from "next/link";

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

  // Define icons for each file type
  const icons: { [key in keyof typeof files]: JSX.Element } = {
    images: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path
          fillRule="evenodd"
          d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z"
          clipRule="evenodd"
        />
      </svg>
    ),
    videos: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
      </svg>
    ),
    audio: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
      </svg>
    ),
    documents: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
        <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
      </svg>
    ),
    folders: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
      </svg>
    ),
    others: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
        <path
          fillRule="evenodd"
          d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087ZM12 10.5a.75.75 0 0 1 .75.75v4.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72v-4.94a.75.75 0 0 1 .75-.75Z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  const categorizeFiles = (data: any[]) => {
    const categorized = {
      images: [],
      videos: [],
      audio: [],
      documents: [],
      folders: [],
      others: [],
    };

    data.forEach((file: any) => {
      const type = file.mimeType;
      if (type.includes("image")) categorized.images.push(file);
      else if (type.includes("video")) categorized.videos.push(file);
      else if (type.includes("audio")) categorized.audio.push(file);
      else if (type.includes("file")) categorized.documents.push(file);
      else if (type.includes("folder")) categorized.folders.push(file);
      else categorized.others.push(file);
    });

    return categorized;
  };

  const handleClick = async () => {
    console.log("called");
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
      <Navbar />
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
                      <div>
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
      </div>
    </div>
  );
}
