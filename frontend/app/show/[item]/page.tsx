/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Image as Images,
  MoreVertical,
  Search,
  Upload,
  Download,
  Trash2,
  Grid,
  List,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { categorizeCategory } from "@/app/lib/icons";
import Link from "next/link";
import Image from "next/image";


const imageFiles = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `LMK_${6341 - i}.JPG`,
  selected: false,
}));

export default function EnhancedImageGallery({ params }: { params: any }) {
  const [selectedDrive, setSelectedDrive] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [images, setImages] = React.useState(imageFiles);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [accounts, setAccounts] = useState<any[]>([]);
  const [, setPageToken] = useState(null);
  const [, setLoading] = useState(false);
  const item = params.item as keyof typeof files;
  const id = user?.id;
  const [, setloadmore] = useState(true);

  type FileType = {
    id: number;
    name: string;
    webViewLink: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };

  const [files, setFiles] = useState<{
    image: FileType[];
    video: FileType[];
    audio: FileType[];
    document: FileType[];
    folder: FileType[];
    others: FileType[];
  }>({
    image: [],
    video: [],
    audio: [],
    document: [],
    folder: [],
    others: [],
  });

  const Get_accounts = async () => {
    try {
      const response = await axios.get("https://drivemounter-3.onrender.com/get-accounts", {
        headers: {
          user_id: user?.id,
        },
      });
      setAccounts(response.data.Accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchFiles = async (nextPageToken: any) => {
    setLoading(true);
    try {
      const response = await axios.get("https://drivemounter-3.onrender.com/fetch-files", {
        headers: {
          user_id: id,
        },
        params: {
          pageSize: 100,
          pageToken: nextPageToken,
        },
      });
      const { files: fetchedFiles, nextPageToken: newPageToken } =
        response.data;

      const categorizedFiles = categorizeCategory(fetchedFiles, item);
      addFiles(categorizedFiles);
      setPageToken(newPageToken);
      if (!newPageToken) setloadmore(false);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addFiles = (newFiles: any) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [item]: [...((prevFiles[item] as any[]) || []), ...newFiles],
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      await Get_accounts();
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    fetchFiles(null); // Fetch the first page of files
  }, [user]);



  const filteredFiles = files[item].filter((img) =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleImageSelection = (id: number) => {
    setImages(
      images.map((img) =>
        img.id === id ? { ...img, selected: !img.selected } : img
      )
    );
  };

  const selectAllImages = () => {
    setImages(images.map((img) => ({ ...img, selected: true })));
  };

  const deselectAllImages = () => {
    setImages(images.map((img) => ({ ...img, selected: false })));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function downloadFile(fileId: any) {
    try {
      const userId = user?.id;
      const response = await axios.get("https://drivemounter-3.onrender.com/download-file", {
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
      const response = await axios.delete("https://drivemounter-3.onrender.com/delete-file", {
        params: { fileId, userId },
      });
    } catch (error) {
      console.error("Error deleting the file:", (error as Error).message);
    }
  }
  const handleClick = async () => {
    const response = await axios.get("https://drivemounter-3.onrender.com/auth", {
      headers: {
        user_id: user?.id,
      },
    });
    window.location.href = response.data.authUrl;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 sm:flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href={'/dashboard'} className="text-2xl font-bold">Drive Mounter</Link>
            <Select value={selectedDrive} onValueChange={setSelectedDrive}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Drives" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((drive) => (
                  <SelectItem key={drive.gmail_id} value={drive}>
                    {drive.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleClick}>Connect account</Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Toolbar */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:flex space-y-2 justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search images"
                  className="pl-10 pr-4 py-2 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
              >
                {viewMode === "grid" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid className="h-4 w-4" />
                )}
              </Button>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={selectAllImages}>
                    Select All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={deselectAllImages}>
                    Deselect All
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                  : "grid-cols-1"
              }`}
            >
              {filteredFiles.map((file) => (
                <Link key={file.id} href={file.webViewLink}>
                  <Card
                    className={`overflow-hidden ${
                      viewMode === "list" ? "flex items-center" : ""
                    }`}
                  >
                    <CardContent
                      className={`p-2 ${
                        viewMode === "list"
                          ? "flex items-center space-x-4 w-full"
                          : ""
                      }`}
                    >
                      <div
                        className={`relative ${
                          viewMode === "grid" ? "aspect-square" : "h-16 w-16"
                        }`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                          { file.thumbnailLink ? (
                            <Image layout="responsive" className="border aspect-square" src={file.thumbnailLink} height={200} width={200} alt="" />
                          ) : (
                            <Images className="h-8 w-8 text-gray-400" />
                          )
                          }
                        </div>
                      </div>
                      <div
                        className={`mt-2 ${
                          viewMode === "list" ? "flex-1" : ""
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                      </div>
                      <div
                        className={`flex items-center ${
                          viewMode === "grid"
                            ? "mt-2 justify-between"
                            : "space-x-2"
                        }`}
                      >
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => toggleImageSelection(file.id)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Link target="blank" href={file.webViewLink}>View</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => downloadFile(file.id)}>Download</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteFile(file.id)} className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
