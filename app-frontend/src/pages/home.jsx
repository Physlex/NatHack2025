import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Label, TextInput, HelperText } from "flowbite-react";
import { useState } from "react";
import { requests } from "../lib/constants";
import { useGlobalContext } from "../contexts/GlobalContext";

export default function Home() {
  const navigate = useNavigate();
  const { setUser, setLoading } = useGlobalContext();
  const [mode, setMode] = useState("login");
  const [data, setData] = useState({
    email: "",
    password: "",
    name: ""
  })
  const [errors, setErrors] = useState({});

  function onSubmit(e) {
    e.preventDefault();
    const url = mode === "login" ? requests.login : requests.signup;
    setLoading(true);
    fetch(requests.base + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(async response => {
        if (response.ok) {
          return await response.json();
        } else {
          setLoading(false);
          const data = await response.json();
          setErrors(data);
          throw new Error('Authentication failed');
        }
      })
      .then(result => {
        if (result.name) {
          setUser(result);
          setLoading(false);
          navigate('/dashboard');
        } else {
          throw new Error('Authentication failed');
        }
      })
      .catch(error => {
        setLoading(false);
        console.error('Error:', error);
      });
  }

  function changeMode(newMode) {
    setMode(newMode);
    setData({ email: "", password: "", name: "" });
    setErrors({});
  }

  return (
    <div className="bg-primary-light/10 w-screen min-h-lvh flex items-center justify-center grid grid-cols-2">
      <img src="/assets/images/background-lines-blue.png" alt="background-lines" className="w-full h-full fixed -left-1/4 -top-1/6 opacity-50" />
      <div className="col-span-1 h-full" />
      {
        mode === "login" ? (
          <div className="col-span-1 flex flex-col items-center justify-center px-12 bg-white z-10 h-full">
            <h1 className="!text-3xl font-bold mb-6 text-center">Sign In</h1>
            {
              errors.detail && <HelperText color="failure">{errors.detail}</HelperText>
            }
            <form className="flex flex-col gap-4 w-1/2">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="email" value="Email">Email</Label>
                </div>
                <TextInput
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={data.email}
                  onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
                {
                  errors.email && <HelperText color="failure">{errors.email}</HelperText>
                }
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="password" value="Password">Password</Label>
                </div>
                <TextInput
                  id="password"
                  type="password"
                  value={data.password}
                  placeholder="Password"
                  onChange={(e) => setData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
                {
                  errors.password && <HelperText color="failure">{errors.password}</HelperText>
                }
              </div>
              <div className="flex items-center gap-2 w-full">
                <Checkbox id="remember" />
                <p className="!my-0 !py-0 !text-gray-600">Remember Me</p>
              </div>
              <Button type="submit" onClick={onSubmit} className="cursor-pointer bg-primary transition-all duration-200">
                Sign In
              </Button>
              <p>Don't have an account? <span className="text-primary font-medium cursor-pointer" onClick={() => changeMode("signup")}>Sign Up</span></p>
            </form>
          </div>
        ) : (
          <div className="col-span-1 flex flex-col items-center justify-center px-12 bg-white z-10 h-full">
            <h1 className="!text-3xl font-bold mb-6 text-center">Sign Up</h1>
            {
              errors.detail && <HelperText color="failure">{errors.detail}</HelperText>
            }
            <form className="flex flex-col gap-4 w-1/2">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name">Name</Label>
                </div>
                <TextInput
                  id="name"
                  type="text"
                  value={data.name}
                  placeholder="Your full name"
                  onChange={(e) => setData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
                {
                  errors.name && <HelperText color="failure">{errors.name}</HelperText>
                }
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="email" value="Email">Email</Label>
                </div>
                <TextInput
                  id="email"
                  type="email"
                  value={data.email}
                  placeholder="name@example.com"
                  onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
                {
                  errors.email && <HelperText color="failure">{errors.email}</HelperText>
                }
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="password">Password</Label>
                </div>
                <TextInput
                  id="password"
                  type="password"
                  value={data.password}
                  placeholder="Password"
                  onChange={(e) => setData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
                {
                  errors.password && <HelperText color="failure">{errors.password}</HelperText>
                }
              </div>
              <div className="flex items-center gap-2 w-full">
                <Checkbox id="remember" />
                <p className="!my-0 !py-0 !text-gray-600">Remember Me</p>
              </div>
              <Button type="submit" onClick={onSubmit} className="cursor-pointer bg-primary transition-all duration-200">
                Sign Up
              </Button>
              <p>Have an account? <span className="text-primary font-medium cursor-pointer" onClick={() => changeMode("login")}>Sign In</span></p>
            </form>
          </div>
        )
      }
    </div>
  )
}
