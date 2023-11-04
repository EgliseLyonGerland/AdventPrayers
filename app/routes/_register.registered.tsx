import { NavLink } from "@remix-run/react";

import Message from "~/components/register/message";

export default function Registered() {
  return (
    <Message heading="Reçu 5 sur 5 👩‍🚀">
      <div>Ton inscription est bien enregistrée !</div>
      <div>
        Tu as du recevoir un email de confirmation à l’adresse que tu as
        indiquée dans le formulaire. Sache que je dois encore effectuer une
        validation manuelle pour confirmer ta participation à l’opération.
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
