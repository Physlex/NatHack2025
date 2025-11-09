import { FaFile } from "react-icons/fa6";
import { FaEye } from "react-icons/fa";
import { Button } from "flowbite-react";
import { FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function RecordingListItem({ recording }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex flex-row items-center px-4 hover:bg-neutral-100 rounded-lg cursor-pointer justify-between transition-all duration-200"
      onClick={() => navigate(`/recording/${recording.id}`)}
    >
      <div className="flex flex-row items-center">
        <FaFile className="text-4xl text-gray-500 mr-4" />
        <div className="flex flex-col p-3">
          <h2 className="font-bold">{recording.name}</h2>
          <p className="text-gray-600">{recording.date}</p>
          <p className="text-gray-400 italic">{recording.size}</p>
        </div>
      </div>
      <div className="flex flex-row gap-2">
        <Button
          size="sm"
          color="dark"
          className="cursor-pointer !bg-neutral-300 !border-primary hover:!bg-neutral-400 transition-all duration-200"
        >
          <FaEye className="!text-neutral-500" />
        </Button>
        <Button
          size="sm"
          color="dark"
          className="cursor-pointer !bg-neutral-300 !border-primary hover:!bg-neutral-400 transition-all duration-200"
        >
          <FaTrash className="!text-neutral-500" />
        </Button>
      </div>
    </div>
  )
}
