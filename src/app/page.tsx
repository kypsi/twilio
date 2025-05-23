"use client"
// import Navbar from '@/components/Navbar';
import NewCenterSection from '@/components/NewCenterSection';
import NewLeftSideBar from '@/components/NewLeftSideBar';
import NewRightSideBar from '@/components/NewRightSideBar';
// import { useApp } from '@/context/AppContext';
// import {  useSearchParams } from 'next/navigation';
import React from 'react';
// import  { useEffect, useState } from 'react';

const Home = () => {
  // const { user  } = useApp();
  // const [loading, setLoading] = useState(true);
  // const searchParams = useSearchParams();
  // const chat = searchParams.get('chat');
  // const [isMobile, setIsMobile] = useState(false);

  // useEffect(() => {
  //   const checkIfMobile = () => {
  //     setIsMobile(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
  //   };

  //   checkIfMobile();
  //   window.addEventListener('resize', checkIfMobile);

  //   return () => {
  //     window.removeEventListener('resize', checkIfMobile);
  //   };
  // }, []);

  return (
    <>
      <div className="flex mb-4 gap-4 md:flex-row flex-col md:h-[calc(100dvh_-_1.25rem_-_1.25rem_-_75px_-_1rem)] xl:h-[calc(100dvh_-_1.25rem_-_1.25rem_-_85px_-_1rem)]">
        <div className="md:basis-[250px] lg:basis-[300px] xl:basis-[400px] shrink-0">
          <NewLeftSideBar />
        </div>
        <div className="basis-full shrink-1 grow-2">
          <NewCenterSection />
        </div>
        <div className="md:basis-[250px] lg:basis-[300px] xl:basis-[400px] shrink-0">
          <NewRightSideBar />
        </div>
      </div>
    </>
  );
};

export default Home;