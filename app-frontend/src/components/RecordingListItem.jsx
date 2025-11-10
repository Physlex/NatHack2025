import { FaFile } from "react-icons/fa6";
import { FaEye } from "react-icons/fa";
import { Button } from "flowbite-react";
import { FaTrash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

export default function RecordingListItem({ recording, className = "" }) {
  const navigate = useNavigate();

  const handleViewClick = (e) => {
    e.stopPropagation();
    navigate(`/recording/${recording.id}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    console.log("Delete clicked for:", recording.name);
  };

  return (
    <div className="relative">
      <div
        className={`flex flex-row items-center justify-between px-4 py-3 hover:bg-neutral-100 rounded-lg cursor-pointer transition-all duration-200 ${className}`}
        onClick={() => navigate(`/recording/${recording.id}`)}
      >
        <div className="flex flex-row items-center">
          <FaFile className="text-4xl text-gray-500 mr-4" />
          <div className="flex flex-col">
            <h2 className="font-bold">{recording.name}</h2>
            <p className="text-gray-600">{recording.date}</p>
            <p className="text-gray-400 italic">{recording.size}</p>
          </div>
        </div>

        <div className="flex flex-row gap-2 relative z-10">
          <Button
            size="sm"
            color="alternative"
            className="cursor-pointer transition-all duration-200"
            onClick={handleViewClick}
          >
            <FaEye className="!text-neutral-500" />
          </Button>
          <Button
            size="sm"
            color="alternative"
            className="cursor-pointer transition-all duration-200"
            onClick={handleDeleteClick}
          >
            <FaTrash className="!text-neutral-500" />
          </Button>
        </div>
      </div>
    </div>
  )
}
