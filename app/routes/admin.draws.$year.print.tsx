import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { getDraw } from "~/models/draw.server";
import { getYearParam } from "~/utils";
import { generate, getFileVersion } from "~/utils/pdf.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const year = getYearParam(params);
  const version = await getFileVersion(year);

  return json({ year, version });
};

export const action = async ({ params }: ActionFunctionArgs) => {
  const year = getYearParam(params);
  const draw = await getDraw({ year });

  if (draw) {
    await generate(draw);
  }

  return redirect(`/admin/draws/${year}/print`);
};

const Print = () => {
  const { year, version } = useLoaderData<typeof loader>();

  const filePath = `/exports/draw${year}.pdf?${version}`;

  return (
    <div className="container mx-auto flex flex-1 flex-col">
      <div className="mb-4 ml-auto flex items-center gap-4">
        {version ? (
          <a
            className="btn btn-secondary btn-sm"
            download={`draw${year}.pdf`}
            href={filePath}
          >
            Télécharger
          </a>
        ) : (
          <button className="btn btn-outline btn-sm" disabled={true}>
            Télécharger
          </button>
        )}

        <Form method="post">
          <button
            className="btn btn-secondary btn-outline btn-sm"
            type="submit"
          >
            {version ? "Re-générer" : "Générer"}
          </button>
        </Form>
      </div>

      {version ? (
        <iframe
          className="h-full flex-1"
          height="500px"
          src={filePath}
          title="Cartes imprimables"
          width="100%"
        />
      ) : (
        <div className="hero mt-4 bg-base-200 p-8">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-2xl font-bold">Aucun fichier disponible</h1>
              <p className="py-6 text-lg opacity-70">
                Le fichier imprimable des cartes doit être généré afin de
                pouvoir le télécharger.
              </p>
              <Form method="post">
                <button
                  className="btn btn-secondary btn-outline mt-8"
                  type="submit"
                >
                  Générer le fichier d‘impression
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Print;
