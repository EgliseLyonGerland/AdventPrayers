import type { MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { motion } from "framer-motion";

import Logo from "~/components/logo";

export const meta: MetaFunction = () => [{ title: "En Avent, la prière" }];

export default function Index() {
  const navigate = useNavigate();

  return (
    <main className="h-full flex-1 flex-col gap-8 flex-center">
      <motion.div layoutId="foobar">
        <Logo className="h-40 fill-base-content"></Logo>
      </motion.div>
      <button
        className="btn btn-primary btn-lg shadow-lg"
        onClick={() => navigate("/register")}
      >
        Je m‘inscris
      </button>
    </main>
  );
}
