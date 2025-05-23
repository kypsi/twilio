// 'use client';

// import { useApp } from '@/context/AppContext';
// import Link from 'next/link';
// import Image from 'next/image';
// import React, { useEffect, useRef, useState } from 'react';
// import default_profile from "../../assest/default_profile.jpg"
// import { IoMenu } from "react-icons/io5";

// const Navbar = () => {
//   const { user, logout } = useApp();
//   const profileMenuRef = useRef<HTMLDivElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const toggleBtnRef = useRef<HTMLButtonElement>(null);
//   const [profileMenuOpen, setProfileMenuOpen] = useState(false);

//   const toggleMobileMenus = () => {
//     if (profileMenuRef.current && containerRef.current) {
//       setProfileMenuOpen((prev) => {
//         const height = profileMenuRef.current?.scrollHeight ?? 0;
//         containerRef.current!.style.height = prev ? `0px` : `${height}px`;
//         return !prev;
//       });
//     }
//   };

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         profileMenuRef.current &&
//         containerRef.current &&
//         toggleBtnRef.current &&
//         !containerRef.current.contains(event.target as Node) &&
//         !toggleBtnRef.current.contains(event.target as Node)
//       ) {
//         containerRef.current.style.height = `0px`;
//         setProfileMenuOpen(false);
//       }
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => {
//       document.removeEventListener('click', handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="w-full bg-white border-b border-gray-200 md:rounded-2xl lg:rounded-3xl px-4 py-3 mb-4">
//       <div className="flex justify-end items-center gap-4">
//         <div>
//           <p className="font-medium text-base text-gray-700 text-right">{user?.name || 'Guest'}</p>
//           <p className="text-sm text-gray-400 text-righ">{user?.twilioNumber || 'No number'}</p>
//         </div>

//         <div className="relative">
//           <button
//             ref={toggleBtnRef}
//             onClick={toggleMobileMenus}
//             className="rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
//           >
//             <Image
//               src={user?.image || default_profile}
//               alt="Profile"
//               width={50}
//               height={50}
//               className="rounded-full object-cover"
//             />
//           </button>

//           <div
//             className={`absolute top-[60px] right-0 w-[200px] transition-all duration-300 ease-in-out overflow-hidden z-[999] ${
//               profileMenuOpen ? 'opacity-100' : 'opacity-0'
//             }`}
//             ref={containerRef}
//           >
//             <div
//               className="flex flex-col bg-white shadow-xl rounded-xl p-4 space-y-2"
//               ref={profileMenuRef}
//             >
//               <Link href="/#profile" className="text-sm text-gray-600 hover:text-black">
//                 Profile
//               </Link>
//               <Link href="/settings" className="text-sm text-gray-600 hover:text-black">
//                 Settings
//               </Link>
//               <button
//                 onClick={logout}
//                 className="text-sm text-gray-600 hover:text-black text-left"
//               >
//                 Log Out
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Navbar;



'use client';

import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { IoMenu } from "react-icons/io5";
import default_profile from "../../assest/default_profile.jpg"

const Navbar = () => {
  const { user, logout } = useApp();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  // if (user) console.log(user)
  const sideMenuRef = useRef<HTMLDivElement>(null);
  const sideToggleRef = useRef<HTMLButtonElement>(null);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const toggleProfileMenu = () => {
    if (profileMenuRef.current && containerRef.current) {
      setProfileMenuOpen((prev) => {
        const height = profileMenuRef.current?.scrollHeight ?? 0;
        containerRef.current!.style.height = prev ? `0px` : `${height}px`;
        return !prev;
      });
    }
  };

  const toggleSideMenu = () => {
    setSideMenuOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        profileMenuRef.current &&
        containerRef.current &&
        toggleBtnRef.current &&
        !containerRef.current.contains(target) &&
        !toggleBtnRef.current.contains(target)
      ) {
        containerRef.current.style.height = `0px`;
        setProfileMenuOpen(false);
      }

      if (
        sideMenuRef.current &&
        sideToggleRef.current &&
        !sideMenuRef.current.contains(target) &&
        !sideToggleRef.current.contains(target)
      ) {
        setSideMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="w-full bg-white border-b border-gray-200 md:rounded-2xl lg:rounded-3xl px-4 py-3 mb-4">
      <div className="flex justify-between items-center">
        {/* Left Side Menu Button */}
        <div className="relative">
          <button
            ref={sideToggleRef}
            onClick={toggleSideMenu}
            className="text-2xl text-gray-700 hover:text-black focus:outline-none"
          >
            <IoMenu />
          </button>

          {/* Side Dropdown */}
          {sideMenuOpen && (
            <div
              ref={sideMenuRef}
              className="absolute left-0 top-[50px] w-[200px] bg-white shadow-xl rounded-xl p-4 z-[999]"
            >
              <Link href="/" className="block text-sm text-gray-600 hover:text-black mb-2">
                Home
              </Link>
              <Link href="/profile" className="block text-sm text-gray-600 hover:text-black mb-2">
                Profile
              </Link>
              <Link href="/settings" className="block text-sm text-gray-600 hover:text-black mb-2">
                Settings
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin" className="block text-sm text-gray-600 hover:text-black mb-2">
                  Admin Settings
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right Side Profile */}
        <div className="flex items-center gap-4">
          <div>
            <p className="font-medium text-base text-gray-700 text-right">
              {user?.name || 'Guest'}
            </p>
            <p className="text-sm text-gray-400 text-right">
              {user?.twilioNumber || 'No number'}
            </p>
          </div>

          <div className="relative">
            <button
              ref={toggleBtnRef}
              onClick={toggleProfileMenu}
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
              className={`absolute top-[60px] right-0 w-[200px] transition-all duration-300 ease-in-out overflow-hidden z-[999] ${profileMenuOpen ? 'opacity-100' : 'opacity-0'
                }`}
              ref={containerRef}
            >
              <div
                className="flex flex-col bg-white shadow-xl rounded-xl p-4 space-y-2"
                ref={profileMenuRef}
              >
                <Link href="/profile" className="text-sm text-gray-600 hover:text-black">
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
    </div>
  );
};

export default Navbar;
