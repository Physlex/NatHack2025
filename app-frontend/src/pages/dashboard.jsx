import { useEffect, useState } from "react"
import RecordingListItem from "../components/RecordingListItem";
import { testRecordings } from "../lib/constants";
import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../contexts/GlobalContext";

export default function Dashboard() {
  const [data, setData] = useState([])
  const { user } = useGlobalContext();
  const navigate = useNavigate();

  const fetchData = async () => {
    setData(testRecordings)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="bg-['#f2f8fc'] min-h-full flex flex-col px-8 py-12">
      <h1 className="!text-3xl font-bold">
        Dashboard
      </h1>
      <div className="pt-4 flex flex-col gap-4">
        <div className="flex flex-row grid grid-cols-4 gap-4">
          <div
            className="!bg-primary relative overflow-hidden p-6 rounded-xl w-full col-span-3"
            horizontal
          >
            <img
              src="/assets/images/background-lines-white.png"
              alt="Dashboard"
              className="absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none"
            />
            <div className="flex flex-row items-center justify-between gap-4 h-full">
              {/* <img
                src="/assets/images/recording-eeg.png"
                alt="Recording EEG"
                className="absolute right-4 top-[5%] h-80 pointer-events-none z-0"
              /> */}
              <div className="relative z-10 h-full justify-center flex flex-col flex-1">
                <h5 className="text-2xl font-bold tracking-tight text-white">
                  Welcome, {user.name}!
                </h5>
                <p className="font-normal text-white">
                  View your recent activity and insights here.
                </p>
              </div>
            </div>
          </div>
          <div className="col-span-1 bg-white rounded-xl p-6 flex flex-col justify-center border border-neutral-200/80">
            <h1 className="!text-xl font-bold mb-4">
              Profile
            </h1>
            {
              user.image ? (
                <img
                  src={user.image}
                  alt="User Avatar"
                  className="w-24 h-24 rounded-full mb-4 self-center"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-300 mb-4 self-center flex items-center justify-center text-3xl text-white">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
              )
            }
            <h2 className="text-xl font-bold text-center">{user.name}</h2>
            <div className="text-gray-600 text-center">
              {user.title}
            </div>
          </div>
        </div>
        <div className="flex flex-col bg-white border border-neutral-200/80 p-6 rounded-xl gap-4">
          <div className="flex flex-row justify-between">
            <h1 className="!text-xl font-bold">
              Recent Recordings
            </h1>
            <Button
              color="alternative"
              className="cursor-pointer transition-all duration-200"
              onClick={() => navigate('/recording')}
            >
              View All
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {data ? data.map((recording) => (
              <RecordingListItem recording={recording} key={recording.id} />
            )) : <div>No recordings found.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
