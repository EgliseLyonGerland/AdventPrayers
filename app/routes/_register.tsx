import { json } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";

import Logo from "~/components/logo";
import Message from "~/components/register/message";
import { AppNameQuoted } from "~/config";
import { getCurrentDraw } from "~/models/draw.server";
import { getCurrentYear } from "~/utils";

export const loader = async () => {
  const draw = await getCurrentDraw();

  return json({ draw });
};

export default function Index() {
  const { draw } = useLoaderData<typeof loader>();
  const location = useLocation();
  const index = location.pathname === "/";

  const withIntro = index && !!draw && !draw.drawn;

  const [complete, setComplete] = useState(!withIntro);
  const [ready, setReady] = useState(!withIntro);

  return (
    <main className="h-[100svh] overflow-hidden">
      <motion.div
        className={clsx(
          "fixed inset-x-8 h-0 flex-center",
          ready ? "top-16 md:top-[12vh]" : "top-[50vh]",
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
          animate={withIntro ? !complete : false}
          className={clsx(
            "max-w-full transition-[height] duration-1000 ease-in-out",
            complete ? "h-16 md:h-[12vh]" : "h-40",
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

      {!draw ? (
        <Message heading="Déjà là ?! 😮" key="too-soon">
          <div>
            Ça me fait très plaisir de te voir ici mais il semble que tu sois un
            petit trop pressé•e de participer à l’édition {getCurrentYear()} de{" "}
            {AppNameQuoted}.
          </div>
          <div>
            Si tu fais partie des contacts de l’
            <a
              className="link-secondary link"
              href="https://egliselyongerland.org"
              rel="noreferrer"
              target="_blank"
            >
              église Lyon-Gerland
            </a>{" "}
            et/ou que tu t’y rends régulièrement, alors il y a de grandes
            chances que tu apprennes le moment où les inscriptions débuteront.
          </div>
          <div>A bientôt j’espère. 😉</div>
        </Message>
      ) : draw.drawn ? (
        <Message
          heading="Zut, ça s’est joué à pas grand chose 😔"
          key="too-late"
        >
          <div>
            L’opération {AppNameQuoted} a déjà commencé malheureusement. Il
            n’est donc plus possible pour toi de t’inscrire.
          </div>
          <div>
            Mais il est fort propable qu’on recommence l’année prochaine. Alors
            stay tuned* !
          </div>
          <div>A bientôt. 😉</div>
          <div className="text-[0.8em] opacity-60">* Reste à l’écoute</div>
        </Message>
      ) : ready ? (
        <Outlet />
      ) : null}
    </main>
  );
}
