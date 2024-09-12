import { File, FileMusic, FileText, FileVideo, Folder, ImageIcon } from "lucide-react";

export const icons= {
    image: (
      <ImageIcon className="h-10 w-10 text-blue-500" />
    ),
    video: (
      <FileVideo className="h-10 w-10 text-green-500" />
    ),
    audio: (
      <FileMusic className="h-10 w-10 text-red-500" />
    ),
    document: (
      <FileText className="h-10 w-10 text-yellow-500" />
    ),
    folder: (
      <Folder className="h-10 w-10 text-yellow-500" />
    ),
    others: (
      <File className="h-10 w-10 text-gray-500" />
    ),
  };
  export const categorizeFiles = (data) => {
    const categorized = {
      image: [],
      video: [],
      audio: [],
      document: [],
      folder: [],
      others: [],
    };

    data.forEach((file) => {
      const type = file.mimeType;
      if (type.includes("image")) categorized.image.push(file);
      else if (type.includes("video")) categorized.video.push(file);
      else if (type.includes("audio")) categorized.audio.push(file);
      else if (type.includes("file")) categorized.document.push(file);
      else if (type.includes("folder")) categorized.folder.push(file);
      else categorized.others.push(file);
    });

    return categorized;
  };
  export const categorizeCategory = (data,category) => {
    if(category=='others')
    {
      return data.filter(file => {
        const type = file.mimeType;
  
        return !type.includes('image') && !type.includes('audio') && !type.includes('video') && !type.includes('document') && !type.includes('folder');
      });
    }
    const cat=[]
   
    data.forEach((file) => {
      const type = file.mimeType;
      if (type.includes(`${category}`)) cat.push(file)
    }); 
    return cat;
  };