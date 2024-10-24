'use client';

import { useState, useEffect, useRef } from 'react';

// export const useCountdown = (defaultTime: number, onFinish: CallableFunction) => {
//   const [time, setTime] = useState(defaultTime);
//   const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     intervalIdRef.current = setInterval(() => {
//       if (time > 0) {
//         setTime(time - 1);
//       } else {
//         clearInterval(intervalIdRef.current!);
//         onFinish();
//       }
//     }, 1000);

//     return () => {
//       clearInterval(intervalIdRef.current!);
//     };
//   }, [time, onFinish]);

//   const restartTimer = () => {
//     setTime(defaultTime);
//   };

//   return { time, restartTimer };
// };

type Params = {
  defaultTime: number;
  onFinish: CallableFunction;
  infinite?: boolean;
};

export const useCountdown = (params: Params) => {
  const { defaultTime, onFinish, infinite = false } = params;

  const [time, setTime] = useState(defaultTime);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startCountdown = () => {
      intervalIdRef.current = setInterval(() => {
        if (time > 0) {
          setTime(time - 1);
        } else {
          clearInterval(intervalIdRef.current!);

          onFinish();

          if (infinite) {
            setTime(defaultTime);
            startCountdown();
          }
        }
      }, 1000);
    };

    startCountdown();

    return () => {
      clearInterval(intervalIdRef.current!);
    };
  }, [defaultTime, infinite, onFinish, time]);
  // }, [time, onFinish, infinite]);

  const restartTimer = () => {
    setTime(defaultTime);
  };

  return { time, restartTimer };
};
