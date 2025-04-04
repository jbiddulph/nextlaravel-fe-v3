"use client";

import Link from "next/link";
import { useState } from "react";
import { myAppHook } from "../context/AppProvider";

const NavBar = () => {
  const { logout, authToken } = myAppHook();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="bg-indigo-600 flex h-[60px] items-center justify-between w-full">
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-0">
        <Link className="text-white text-xl font-bold" href="/">
          goSchool.uk
        </Link>
        <button
          className="text-white md:hidden text-2xl"
          type="button"
          aria-label="Toggle navigation"
          onClick={toggleMobileMenu}
        >
          ☰
        </button>
        <div
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          }  z-20 bg-indigo-800 py-4 md:py-0 md:bg-indigo-600 absolute top-[60px] left-0 w-full bg-indigo-600 md:static md:flex md:justify-end md:space-x-4 md:items-center`}
        >
          {authToken ? (
            <>
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center">
                    <Link
                        className="block text-white hover:text-gray-300 py-2 px-4 md:inline"
                        href="/map"
                    >
                        Map
                    </Link>
                    <button
                        className="block bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 md:inline"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </>
          ) : (
            <>
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 items-center">
                    <Link
                        className="block text-white hover:text-gray-300 py-2 px-4 md:inline"
                        href="/"
                    >
                        Home
                    </Link>
                    <Link
                        className="block text-white hover:text-gray-300 py-2 px-4 md:inline"
                        href="/auth"
                    >
                        Login
                    </Link>
                </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;