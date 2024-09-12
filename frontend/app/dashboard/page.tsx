"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  HardDrive,
  Plus,
  User,
  Home,
  Settings,
  HelpCircle,
  LogOut,
  MemoryStick,
} from "lucide-react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";



export default function DriveMounter() {
  const { user } = useUser();
  const [accounts, setAccounts] = useState<any[]>([]);



  useEffect(() => {
    const fetchData = async () => {
      console.log("Called");
      await Get_accounts();
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
      console.log(response.data);
      setAccounts(response.data.Accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };



  const handleClick = async () => {
    const response = await axios.get('http://localhost:3000/auth',{headers:{
         user_id:user?.id
    }});
    window.location.href = response.data.authUrl;
};


  
  const Total = accounts.length * 15;
  const TotalUsed = accounts.reduce(
    (acc, drive) => acc + Number(drive.Storage),
    0
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="sm:w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Drive Mounter</h1>
        </div>
        <nav className="mt-6">
          <a
            href="#"
            className="flex items-center px-4 py-2 text-gray-700 bg-gray-200"
          >
            <Home className="mr-3" />
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 mt-2 text-gray-600 hover:bg-gray-200"
          >
            <MemoryStick className="mr-3" />
            All Drives
          </a>
          {accounts.map((account) => (
            <a
              key={account.id}
              href={`/${account.gmail_id}`}
              className="flex items-center px-4 py-2 mt-2 text-gray-600 hover:bg-gray-200"
            >
              <img
                src={account.picture}
                alt={account.name}
                className="w-8 h-8 rounded-full mr-2"
              />
              {account.name}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Drives</h2>
          <Button variant="ghost" size="icon">
            <User className="h-6 w-6" />
          </Button>
        </header>

        {/* Drive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((drive) => (
            <Link prefetch={true} href={`/${drive.gmail_id}`} key={drive.id} className="">
            <Card key={drive.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {drive.name}
                </CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {drive.Storage} GB / 15 GB
                </div>
                <p className="text-xs text-muted-foreground">
                  {((drive.Storage / 15) * 100).toFixed(1)}% used
                </p>
                <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(drive.Storage / 15) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}

          {/* Add New Drive Card */}
          
              <Card onClick={handleClick} className="flex items-center justify-center cursor-pointer hover:bg-gray-50">
                <CardContent className="flex flex-col items-center py-8">
                  <Plus className="h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-sm font-medium text-gray-600">
                    Add New Drive
                  </p>
                </CardContent>
              </Card>
        </div>

        {/* Total Storage Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Total Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {TotalUsed} GB /{Total} GB
            </div>
            <p className="text-xs text-muted-foreground">
              {((TotalUsed / Total) * 100).toFixed(1)}% used
            </p>
            <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${(TotalUsed / Total) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
