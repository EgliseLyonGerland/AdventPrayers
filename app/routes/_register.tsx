import type { MetaFunction } from "@remix-run/node";
import { Outlet, useLocation } from "@remix-run/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

import Logo from "~/components/logo";

export const meta: MetaFunction = () => [{ title: "En Avent la prière !" }];

export function Wrapper({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "h-full px-4 py-8 pt-36 def:overflow-hidden md:px-8 md:py-12 md:pt-64",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default function Index() {
  const location = useLocation();
  const index = location.pathname === "/";
  const [complete, setComplete] = useState(!index);
  const [ready, setReady] = useState(!index);

  return (
    <main className="h-[100svh] overflow-hidden">
      <motion.div
        className={clsx(
          "fixed inset-x-8 h-0 flex-center",
          ready ? "top-16 md:top-32" : "top-[50vh]",
        )}
        layout
        layoutId="logo"
        transition={{
          duration: 1,
          type: "tween",
          ease: "anticipate",
        }}
      >
        <Logo
          animate={index ? !complete : false}
          className={clsx(
            "max-w-full transition-[height] duration-1000 ease-in-out",
            complete ? "h-16 md:h-32" : "h-40",
          )}
          onAnimationComplete={() => {
            setTimeout(() => {
              setComplete(true);
            }, 2000);
            setTimeout(() => {
              setReady(true);
            }, 3000);
          }}
        />
      </motion.div>

      {ready ? <Outlet /> : null}
    </main>
  );
}
