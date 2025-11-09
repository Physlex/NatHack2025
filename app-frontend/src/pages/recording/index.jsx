import { Button } from "flowbite-react";
import { testRecordings } from "../../lib/constants";
import { useEffect, useState } from "react";
import RecordingListItem from "../../components/RecordingListItem";

export default function Recordings() {
  const [recordings, setRecordings] = useState([]);

  const fetchRecordings = async () => {
    setRecordings(testRecordings);
  }

  useEffect(() => {
    fetchRecordings();
  }, []);

  return (
    <div className="bg-['#f2f8fc'] min-h-full flex flex-col px-8 py-12">
      <h1 className="!text-3xl font-bold">
        Recordings
      </h1>
      <div className="pt-4 flex flex-col gap-4">
        {
          recordings.map((rec) => (
            <RecordingListItem key={rec.id} recording={rec} className="!bg-white border border-neutral-200/80" />
          ))
        }
      </div>
    </div>
  );
}
