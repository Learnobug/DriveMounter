import Image from "next/image";


export default function loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Image src={'/../loading.gif'} alt="Loading..." width={100} height={100} />
    </div>
  );
}