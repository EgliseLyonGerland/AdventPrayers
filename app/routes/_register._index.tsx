import { useNavigate } from "@remix-run/react";

import Message from "~/components/register/message";
import { AppNameQuoted } from "~/config";
import { formatDate, getCurrentYear, getFirstAdventSundayDate } from "~/utils";

function RegisterIndex() {
  const navigate = useNavigate();
  const startsAt = getFirstAdventSundayDate(getCurrentYear());

  return (
    <Message>
      <div>
        L’opération {AppNameQuoted} est une occasion pour toi de porter dans tes
        prières un frère ou une soeur de l’église en particulier pendant toute
        la période de l’Avent.
      </div>
      <div>
        En t’inscrivant, tu recevras le nom d’un autre participant à l’opération
        pour lequel tu t’engageras à prier quotidiennement du{" "}
        {formatDate(startsAt)} jusqu’au 24 décembre à minuit et ce, dans le plus
        grand secret 🤫.
      </div>
      <div>
        Ce n’est qu’ensuite que tu pourras te faire connâitre à la personne en
        lui offrant si possible un petit cadeau en fonction des tes moyens 🎁.
      </div>
      <div>C’est cool non ?! N’attends plus et inscris-toi !</div>

      <button
        className="btn btn-secondary btn-outline btn-lg mt-8 w-full max-w-md shadow-lg"
        onClick={() => navigate("/register")}
      >
        Je m’inscris !
      </button>
    </Message>
  );
}

export default RegisterIndex;
