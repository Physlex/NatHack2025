import { requests } from "../lib/constants"

export default function Home() {

  const fetchData = async () => {
    const response = await fetch(`${requests.base}/data`)
    const data = await response.json()
    console.log(data)
  }

  return (
    <div>
      <h1>hello bbox</h1>
    </div>
  )
}
