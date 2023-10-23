import type { MetaFunction } from "@remix-run/node";
import { Outlet, useLocation } from "@remix-run/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";

import Logo from "~/components/logo";

export const meta: MetaFunction = () => [{ title: "En Avent la prière !" }];

export default function Index() {
  const location = useLocation();
  const animate = location.pathname === "/";
  const [complete, setComplete] = useState(!animate);

  return (
    <main className="flex h-screen flex-1 flex-col items-center justify-center gap-[8vh] overflow-hidden px-4 py-8 md:gap-[10vh] md:px-8 md:py-12">
      <motion.div
        layout
        transition={{
          duration: 1,
          type: "tween",
          ease: "easeInOut",
        }}
      >
        <Logo
          animate={animate}
          className={clsx(
            "max-w-full transition-[height] delay-500 duration-1000",
            complete ? "h-16 md:h-32" : "h-40",
          )}
          onAnimationComplete={() => {
            setTimeout(() => {
              setComplete(true);
            }, 2000);
          }}
          showOwner
        />
      </motion.div>

      {complete ? <Outlet /> : null}
    </main>
  );
}
