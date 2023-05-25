import {useCallback, useEffect, useState} from "react";

export const useWindowResize = () => {
  const [values, setValues] = useState<{
    width: number,
  } | undefined>(undefined);

  const updateValues = useCallback(() => {
    setValues((prev) => {
      if (prev === undefined || prev.width !== window.innerWidth){
        return {
          width: window.innerWidth
        }
      }
      return prev;
    });
  }, [setValues])

  useEffect(() => {
    updateValues()
    window.addEventListener("resize", updateValues);
    return () => {
      window.removeEventListener("resize", updateValues);
    }
  }, [updateValues]);

  return [values]
}