import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-white w-screen min-h-lvh flex items-center justify-center">
      <img src="/assets/images/background-lines-blue.png" className="fixed opacity-30" />
      <div className="z-10 bg-white p-8 rounded-lg shadow-lg w-1/4 flex flex-col items-center gap-4">
        <h2>bbox</h2>
        <Button 
          onClick={() => navigate("/dashboard")} 
          color="blue"
          size="md"
          className="cursor-pointer !bg-primary !border-primary hover:!bg-primary-dark"
        >
          Get Started
        </Button>
      </div>
    </div>
  )
}
