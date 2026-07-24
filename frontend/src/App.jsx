import { useEffect, useState } from "react";
import Login from "./login"

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getMessage = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/");

        if (!response.ok) {
          throw new Error("Failed to connect to API");
        }

        const data = await response.json();

        setMessage(data.message);
      } catch (error) {
        console.error(error);
        setMessage("Could not connect to Django.");
      }
    };

    getMessage();
  }, []);

  return (
    <main>
      <h1>MataPool</h1>

      <p>{message}</p>

      <Login/>
    </main>
  );
}

export default App;