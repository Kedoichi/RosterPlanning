// src/pages/index.tsx
import type { NextPage } from "next";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold">Welcome to the Roster Planner</h1>
      <Link href="/login">Login</Link>
    </div>
  );
};

export default Home;
