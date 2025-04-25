'use client';

import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import default_profile from "../../assest/default_profile.jpg"

const Navbar = () => {
  const { user, logout } = useApp();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const toggleMobileMenus = () => {
    if (profileMenuRef.current && containerRef.current) {
      setProfileMenuOpen((prev) => {
        const height = profileMenuRef.current?.scrollHeight ?? 0;
        containerRef.current!.style.height = prev ? `0px` : `${height}px`;
        return !prev;
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        containerRef.current &&
        toggleBtnRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        containerRef.current.style.height = `0px`;
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full bg-white border-b border-gray-200 md:rounded-2xl lg:rounded-3xl px-4 py-3 mb-4">
      <div className="flex justify-end items-center gap-4">
        <div>
          <p className="font-medium text-base text-gray-700 text-right">{user?.name || 'Guest'}</p>
          <p className="text-sm text-gray-400 text-righ">{user?.twilioNumber || 'No number'}</p>
        </div>

        <div className="relative">
          <button
            ref={toggleBtnRef}
            onClick={toggleMobileMenus}
            className="rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          >
            <Image
              src={user?.image || default_profile}
              alt="Profile"
              width={50}
              height={50}
              className="rounded-full object-cover"
            />
          </button>

          <div
            className={`absolute top-[60px] right-0 w-[200px] transition-all duration-300 ease-in-out overflow-hidden z-[999] ${
              profileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            ref={containerRef}
          >
            <div
              className="flex flex-col bg-white shadow-xl rounded-xl p-4 space-y-2"
              ref={profileMenuRef}
            >
              <Link href="/#profile" className="text-sm text-gray-600 hover:text-black">
                Profile
              </Link>
              <Link href="/settings" className="text-sm text-gray-600 hover:text-black">
                Settings
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-black text-left"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
