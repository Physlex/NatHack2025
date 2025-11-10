import { useEffect, useState } from "react";
import RecordingListItem from "../../components/RecordingListItem";
import { requests } from "../../lib/constants";
import { useGlobalContext } from "../../contexts/GlobalContext";

export default function Recordings() {
  const [recordings, setRecordings] = useState([]);
  const { user, setLoading } = useGlobalContext();

  const fetchData = async () => {
    setLoading(true)
    fetch('/api' + requests.sessions + user.id + '/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(async response => {
        if (response.ok) {
          return await response.json();
        } else {
          console.log(response.body);
          throw new Error('Failed to fetch recordings');
        }
      })
      .then(result => {
        setRecordings(result.sessions.reverse());
        setLoading(false)
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  useEffect(() => {
    fetchData()
  }, [])

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
