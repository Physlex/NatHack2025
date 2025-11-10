import { Button } from "flowbite-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-['#f2f8fc']">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Sorry, the page you are looking for does not exist.</p>
      <Button className="cursor-pointer bg-primary transition-all duration-200" onClick={() => navigate("/dashboard")}>
        Go to Dashboard
      </Button>
    </div>
  );
}
