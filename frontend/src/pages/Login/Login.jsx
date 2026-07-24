import { Link } from "react-router-dom";


function Login() {
  return (
    <main>
      <h1>Log in to MataPool</h1>

      {/* Ava's login form goes here */}

      <p>
        Don&apos;t have an account?{" "}
        <Link to="/register">Create an account</Link>
      </p>
    </main>
  );
}

export default Login;