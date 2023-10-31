import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";

import Logo from "~/components/logo";
import Message from "~/components/register/message";
import { AppNameQuoted } from "~/config";
import { getCurrentDraw } from "~/models/draw.server";

export const loader = async () => {
  const draw = await getCurrentDraw();

  return json({ draw });
};

export default function Index() {
  const { draw } = useLoaderData<typeof loader>();
  const location = useLocation();
  const index = location.pathname === "/";
  const [complete, setComplete] = useState(!index);
  const [ready, setReady] = useState(!index);

  if (!draw) {
    return (
      <Message>
        {[
          "👋 Hey !",
          <>
            Ça me fait plaisir de te voir ici mais il semble que tu sois un
            petit trop pressé de participer à la prochaine édition de{" "}
            {AppNameQuoted}.
          </>,
          <>
            Si tu fais partie des contacts de l‘
            <a
              className="link-secondary link"
              href="https://egliselyongerland.org"
              rel="noreferrer"
              target="_blank"
            >
              église Lyon-Gerland
            </a>{" "}
            et/ou que tu t‘y rends régulièrement, alors il y a de grandes
            chances que tu sois informés du moment où les inscriptions
            débuteront.
          </>,
          "A bientôt j‘espère. 😉",
        ]}
      </Message>
    );
  }

  if (draw.drawn) {
    return (
      <Message>
        {[
          "Arf, ça s‘est joué à pas grand chose 😔",
          `L‘opération ${AppNameQuoted} a déjà commencé malheureusement. Il n‘est donc plus possible pour toi de t‘inscrire.`,
          "Mais il est fort propable qu‘on recommence l‘année prochaine. Alors stay tuned!",
          "A bientôt. 😉",
        ]}
      </Message>
    );
  }

  return (
    <main className="h-[100svh] overflow-hidden">
      <motion.div
        className={clsx(
          "fixed inset-x-8 h-0 flex-center",
          ready ? "top-16 md:top-32" : "top-[50vh]",
        )}
        layout={true}
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
