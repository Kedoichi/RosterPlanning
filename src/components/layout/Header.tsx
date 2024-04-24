// src/components/layout/Header.tsx
import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-blue-500 text-white">
      <nav className="container mx-auto flex justify-between p-4">
        <Link href="/"></Link>
        <Link href="/login" passHref>
          Login
        </Link>
        <Link href="/signup" passHref>
          Sign Up
        </Link>
      </nav>
    </header>
  );
};

export default Header;
