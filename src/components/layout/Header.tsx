import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-primary text-offWhite">
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
