import { NavLink } from "@remix-run/react";

import Message from "~/components/register/message";

export default function Registered() {
  return (
    <Message heading="Inscription reçue 5 sur 5 ! 🎉">
      <div>
        Tu vas recevoir un email de confirmation dans lequel tu trouveras un
        lien qui te permettra de te désinscrire (ce que je ne souhaite pas bien
        sûr).
      </div>
      <div>
        Maintenant, tu peux quitter cette page ou effectuer une nouvelle
        inscription.
      </div>
      <NavLink
        className="btn btn-secondary btn-outline btn-lg mt-8"
        to="/register"
      >
        Nouvelle inscription
      </NavLink>
    </Message>
  );
}
