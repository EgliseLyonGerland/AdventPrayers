import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";

import Logo from "~/components/logo";

export const meta: MetaFunction = () => [{ title: "En Avent, la prière" }];

export default function Index() {
  const navigate = useNavigate();

  return (
    <main className="flex-1 flex-center flex-col h-full gap-8">
      <motion.div layoutId="foobar">
        <Logo className="fill-base-content h-40"></Logo>
      </motion.div>
      <button
        className="btn btn-lg btn-primary shadow-lg"
        onClick={() => navigate("/register")}
      >
        Je m‘inscris
      </button>
    </main>
  );
}
