import Button from "../components/Button"
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-offwhite w-screen min-h-lvh flex items-center justify-center">
      <img src="/assets/images/background-lines-blue.png" className="fixed opacity-30" />
      <div className="z-10 bg-white p-8 rounded-xl shadow-lg w-1/4 flex flex-col items-center gap-4">
        <h2>bbox</h2>
        <Button
          onClick={() => navigate('/dashboard')}
        >
          Get Started
        </Button>
      </div>
    </div>
  )
}
