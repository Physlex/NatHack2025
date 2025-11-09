import { requests } from "../lib/constants"
import { useEffect, useState } from "react"

export default function Dashboard() {
  const [data, setData] = useState(null)

  const fetchData = async () => {
    const response = await fetch(`${requests.base}${requests.test}`)
    const data = await response.json()
    setData(data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="bg-offwhite w-screen min-h-lvh flex items-center justify-center">
      <img src="/assets/images/background-lines-blue.png" className="fixed opacity-30" />
      <div className="z-10 bg-white p-8 rounded-xl shadow-lg w-1/4 flex flex-col items-center gap-4">
        <h2>Dashboard</h2>
        {data && (
          <pre className="text-sm text-left">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
