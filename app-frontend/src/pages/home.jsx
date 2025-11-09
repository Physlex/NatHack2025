import { requests } from "../lib/constants"
import { Button } from "flowbite-react";

export default function Home() {

  const fetchData = async () => {
    const response = await fetch(`${requests.base}/data`)
    const data = await response.json()
    console.log(data)
  }

  return (
    <div className="bg-offwhite w-screen min-h-lvh flex items-center justify-center">
      <img src="/assets/images/background-lines-blue.png" className="fixed opacity-30" />
      <div className="z-10 bg-white p-8 rounded-lg shadow-lg w-1/4 flex flex-col items-center gap-4">
        <h2>bbox</h2>
        <Button color="blue">Blue Button</Button>
        <Button color="red">Red Button</Button>
        <Button color="green">Green Button</Button>
        <Button color="yellow">Yellow Button</Button>
        
        {/* Test regular Tailwind button to verify CSS is working */}
        <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
          Tailwind Button
        </button>
      </div>
    </div>
  )
}
