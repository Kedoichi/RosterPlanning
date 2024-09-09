import type { NextPage } from "next";
import { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "@/hooks/useForm";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/LoginForm";
import { ErrorMessage } from "@/components/ErrorMessage";

interface LoginData {
  email: string;
  password: string;
  businessCode: string;
}

const Login: NextPage = () => {
  const [loginError, setLoginError] = useState("");
  const router = useRouter();
  const { login } = useAuth();
  const { formData, handleChange } = useForm<LoginData>({
    email: "",
    password: "",
    businessCode: "",
  });

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");

    try {
      const { role } = await login(formData);
      router.push(role === "manager" ? "/dashboard/admin" : "/dashboard/staff");
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center my-6">
        Login to your account
      </h1>
      <LoginForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleLogin}
      />
      {loginError && <ErrorMessage message={loginError} />}
      <div className="mt-4 text-center">
        <button
          onClick={() => router.push("/signup")}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Login;
