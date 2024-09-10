"use client"
import React, { createContext, useState, useContext,useEffect } from 'react';
import { useUser } from "@clerk/clerk-react";
import {categorizeFiles} from '../lib/icons'
import axios from 'axios';

const FilesContext = createContext();

export const FilesProvider = ({ children }) => {
    const { user } = useUser();
    const [nextPageToken, setNextPageToken] = useState(null);
    const [files, setFiles] = useState({
      image: [],
      video: [],
      audio: [],
      document: [],
      folder: [],
      others: [],
    });
  const [loading, setLoading] = useState(false);
  const addFiles = (newFiles) => {
    setFiles(prevFiles => ({
      image: [...prevFiles.image, ...(newFiles.image || [])],
      video: [...prevFiles.video, ...(newFiles.video || [])],
      audio: [...prevFiles.audio, ...(newFiles.audio || [])],
      document: [...prevFiles.document, ...(newFiles.document || [])],
      folder: [...prevFiles.folder, ...(newFiles.folder || [])],
      others: [...prevFiles.others, ...(newFiles.others || [])],
    }));
    console.log('called2',files);
  };

  useEffect(() => {
    console.log('Updated files:', files);
  }, [addFiles]);
  
  const fetchFiles = async (pageSize = 100, pageToken = null) => {
    console.log("called2")
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/fetch-files', {
        headers: {
          'user_id': user.id
        },
        params: {
          pageSize: pageSize,
          pageToken: pageToken
        }
      });
        const { files: fetchedFiles,nextPageToken } = response.data;
          const categorizedFiles = categorizeFiles(fetchedFiles);
          addFiles(categorizedFiles);
          setNextPageToken(nextPageToken);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FilesContext.Provider value={{ files, loading, fetchFiles }}>
      {children}
    </FilesContext.Provider>
  );
};

export const useFiles = () => useContext(FilesContext);
