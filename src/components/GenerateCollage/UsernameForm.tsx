import React, {useState} from "react";
import Button from "../Button";
import { isUsernameExists } from "./fetchers";
import { StepProps } from "@/utils/types";



const UsernameForm: React.FC<StepProps> = ({ updateSettingsData, nextStep }) => {
  const [userExists, setUserExists] = useState<boolean>(true)
  const [username, setUsername] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    
    isUsernameExists(username.trim()).then((user) => { 
      if (!user) {
        setUserExists(false)
        setTimeout(() => {
          setUserExists(true)
        }, 3000);
      } else {
        updateSettingsData("username", username.trim())
        nextStep()
      }
      setLoading(false)
    })
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-bold text-center text-red-800 tracking-tight my-6">
        Create{" "}
        <span className="relative px-1">
          <span className="absolute inset-0 bg-yellow-300 rotate-[-2deg] rounded-md"></span>
          <span className="relative text-red-900">collage</span>
        </span>{" "}
        from your top music.
      </h1>


      <h2 className="text-lg font-semibold text-gray-800 my-4">
        Enter your Last.fm username to get started.
      </h2>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative z-0 w-full mb-5 group">
          <input 
          type="text" 
          name="floating_username" 
          id="floating_username" 
          className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 focus:border-red-600 peer" 
          placeholder=" " 
          required
          value={username || ""}
          onChange={(e) => setUsername(e.target.value)} />
          <label htmlFor="floating_username" className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-red-600 peer-focus:dark:text-red-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Username</label>
          {!userExists &&
            <p className="text-sm font-semibold text-red-500 my-2">
            Username not found.
          </p>
          }
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Loading..." : "Next"}</Button>
      </form>
    </div>
  );
};

export default UsernameForm;
