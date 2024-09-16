"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  MoreVertical,
  Search,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useFiles } from "../context/FileContext";
import { icons } from "../lib/icons";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



const fileTypes = ["image", "document", "folder", "audio", "video", "others"];




export default function EnhancedDriveMounter() {
  const [selectedDrive, setSelectedDrive] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const { user } = useUser();
  const [accounts, setAccounts] = useState<never[]>([]);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const { files,  fetchFiles } = useFiles();


  

  useEffect(() => {
    const fetchData = async () => {
      await Get_accounts();
      await fetchFiles();
    };
    fetchData();
  }, [user]);

  const Get_accounts = async () => {
    try {
      const response = await axios.get("http://localhost:3000/get-accounts", {
        headers: {
          user_id: user?.id,
        },
      });
      setAccounts(response.data.Accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  const handleClick = async () => {
    const response = await axios.get("http://localhost:3000/auth", {
      headers: {
        user_id: user?.id,
      },
    });
    window.location.href = response.data.authUrl;
  };

  const toggleMenu = (index: number) => {
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function downloadFile(fileId: any) {
    try {
      const userId = user?.id;
      const response = await axios.get("http://localhost:3000/download-file", {
        params: { fileId, userId },
        responseType: "blob",
      });
      const contentDisposition = response.headers["content-disposition"];
      const fileName = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "downloaded_file";

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error downloading the file:", error.message);
      } else {
        console.error("Error downloading the file:", error);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function deleteFile(fileId: any) {
    try {
      const userId = user?.id;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const response = await axios.delete("http://localhost:3000/delete-file", {
        params: { fileId, userId },
      });
    } catch (error) {
      console.error("Error deleting the file:", (error as Error).message);
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Drive Mounter</h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm font-medium text-gray-700"
          >
            Dashboard
          </Link>
          <Link
            href="/all"
            className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            All Drives
          </Link>
      
          {accounts && accounts.map((drive:{ gmail_id: string; name: string }) => (
            <Link
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              key={drive.gmail_id}
              href={`${drive.gmail_id}`}
            >
              {drive.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <Select value={selectedDrive} onValueChange={setSelectedDrive}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Drives" />
                </SelectTrigger>
                <SelectContent>
                {accounts.map((drive: { gmail_id: string; name: string }) => (
                  <SelectItem key={drive.gmail_id} value={drive.gmail_id}>
                    {drive.name}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleClick}>Connect account</Button>
          </div>
        </header>

        {/* Search Bar */}
        <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search files and folders"
              className="pl-10 pr-4 py-2 w-full bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* File Browser */}
        <div className="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="image" className="w-full">
            <TabsList>
              {fileTypes.map((type,index) => (
                <TabsTrigger key={index} value={type}>
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>
            {fileTypes.map((type) => (
              <TabsContent key={type} value={type}>
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {files[type]
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      .filter((file: any) =>
                        file.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .slice(0, 15)
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      .map((file: any, index: number) => (
                        <Card
                          key={index}
                          className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                        >
                          <CardContent className="p-4 flex flex-col items-center justify-center">
                            {icons[type as keyof typeof icons]}
                            <p className="mt-2 text-sm text-center truncate w-full">
                              {file.name}
                            </p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="relative left-16 bottom-20"
                                  onClick={() => toggleMenu(file.id)}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="relative left-20 bottom-10 z-10">
                                <DropdownMenuItem
                                  onClick={() => downloadFile(file.id)}
                                >
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteFile(file.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <a
                                    href={file.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    View
                                  </a>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </CardContent>
                        </Card>
                      ))}
                    <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
                      <Link href={`/show/${type}`}>
                        <CardContent className="p-4 flex flex-col items-center justify-center">
                          <ChevronRight className="h-8 w-8" />
                          <p className="mt-2 text-sm text-center truncate w-full">
                            Show All
                          </p>
                        </CardContent>
                      </Link>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
