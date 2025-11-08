import { requests } from "../lib/constants"

export default function Home() {

  const fetchData = async () => {
    const response = await fetch(`${requests.base}/data`)
    const data = await response.json()
    console.log(data)
  }

  return (
    <div className="bg-offwhite w-screen min-h-lvh flex items-center justify-center">
      <img src="/assets/images/background-lines-blue.png" className="fixed " />
      <div className="z-10">
        <h1>hello bbox</h1>
      </div>
    </div>
  )
}
