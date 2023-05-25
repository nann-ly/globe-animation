import {useEffect, useRef} from "react";

export const ScrollingText = (props: {
  className?: string,
  duration?: number,
  delay?: number,
}) => {
  const {className, duration, delay, ...others} = props;
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current;
    if (el != null) {
      let stop = false;
      let start = Date.now();
      const time = duration ?? 60000

      const scrollLength = el.scrollHeight - el.offsetHeight
      const animation = () => {
        if (stop) return;
        let d = Date.now() - start - (delay ?? 0);
        if (d >= time) {
          start = Date.now();
        }
        if (d < 0) d = 0;

        el.scrollTo({
          top: d / time * scrollLength // takes 60s to scroll everything
        })

        requestAnimationFrame(animation)
      }

      animation();
      return () => {
        stop = true;
      }

    }
  }, [ref.current])

  return <div ref={ref} className={(className ?? '') + ' overflow-hidden'} {...others}/>
}