import { useNavigate } from "react-router-dom";
import { Button, Card, Checkbox, Label, TextInput } from "flowbite-react";

export default function Home() {
  const navigate = useNavigate();

  function login() {
    navigate('/dashboard');
  }

  return (
    <div className="bg-primary-light/10 w-screen min-h-lvh flex items-center justify-center grid grid-cols-2">
      <img src="/assets/images/background-lines-blue.png" alt="background-lines" className="w-full h-full fixed -left-1/4 -top-1/6 opacity-20" />
      <div className="col-span-1 h-full" />
      <div className="col-span-1 flex flex-col items-center justify-center px-12 bg-white z-10 h-full">
        <h1 className="!text-3xl font-bold mb-6 text-center">Sign In</h1>
        <form className="flex flex-col gap-4 w-1/2">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="email" value="Email" />
            </div>
            <TextInput
              id="email"
              type="email"
              placeholder="name@flowbite.com"
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="password" value="Password" />
            </div>
            <TextInput
              id="password"
              type="password"
              required
            />
          </div>
          <div className="flex items-center gap-2 w-full">
            <Checkbox id="remember" />
            <p className="!my-0 !py-0 !text-gray-600">Remember Me</p>
          </div>
          <Button type="submit" onClick={login} className="cursor-pointer">
            Submit
          </Button>
        </form>
      </div>
    </div>
  )
}
