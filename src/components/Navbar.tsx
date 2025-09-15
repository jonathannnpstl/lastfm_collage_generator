"use client"

import React, { useState } from "react";
import { Menu, X } from "lucide-react"; 
const Navbar: React.FC = () => {
  const [active, setActive] = useState<string>("Home");
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  const links: string[] = ["Home", "Albums", "Artists"];

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 
                 flex items-center justify-between
                 bg-white/80 backdrop-blur-md 
                 rounded-full shadow-lg 
                 px-6 py-2 max-w-4xl w-[90%] z-50"
    >
      <div className="hidden md:flex space-x-8">
        {links.map((link) => (
          <button
            key={link}
            onClick={() => setActive(link)}
            className={`relative pb-1 text-sm font-medium cursor-pointer transition-colors ${
              active === link
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {link}
            {active === link && (
              <span className="absolute left-0 -bottom-0.5 w-full h-0.5 bg-blue-600 rounded transition-all" />
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <button className="hidden md:block text-gray-600 hover:text-gray-900">
          🔍
        </button>
        <div className="hidden md:flex w-8 h-8 rounded-full bg-red-600 items-center justify-center text-white font-bold">
          U
        </div>

        <button
          className="md:hidden text-gray-800"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="absolute top-16 left-0 w-full 
                     bg-white/90 backdrop-blur-md 
                     shadow-md rounded-lg 
                     flex flex-col items-center 
                     py-4 space-y-4 md:hidden"
        >
          {links.map((link) => (
            <button
              key={link}
              onClick={() => {
                setActive(link);
                setMenuOpen(false);
              }}
              className={`text-lg font-medium ${
                active === link
                  ? "text-blue-600"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {link}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
