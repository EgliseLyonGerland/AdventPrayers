import { type Player } from "~/models/draw.server";
import { type Person } from "~/models/person.server";
import { pluralize } from "~/utils";

interface Props {
  person: Person & {
    exclude?: Person[];
    players?: Player[];
  };
}

export default function PersonRecord({ person }: Props) {
  return (
    <div className="flex items-center gap-6">
      {person.picture ? (
        <div className="avatar">
          <div className="w-10 rounded-full">
            <img alt={person.picture} src={`/uploads/${person.picture}`} />
          </div>
        </div>
      ) : (
        <div className="avatar placeholder">
          <div className="w-10 rounded-full bg-neutral-focus text-neutral-content">
            {`${person.firstName[0]}${person.lastName[0]}`.toUpperCase()}
          </div>
        </div>
      )}

      <div>
        <div className="mb-1 truncate">
          {person.firstName} {person.lastName}
          <span className="ml-2 text-base-content/50">{person.age}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-60">
            {person.email || <i>No email address</i>}
          </span>
          {person.players && person.players.length > 0 ? (
            <div
              className="tooltip tooltip-info whitespace-nowrap"
              data-tip={person.players.map((item) => item.drawYear).join(`, `)}
            >
              <div className="badge badge-outline badge-sm cursor-default opacity-30 hover:opacity-100">
                {person.players.length} {pluralize("edition", person.players)}
              </div>
            </div>
          ) : null}

          {person.exclude && person.exclude.length > 0 ? (
            <div
              className="tooltip tooltip-info whitespace-nowrap"
              data-tip={person.exclude
                .map((item) => `${item.firstName} ${item.lastName}`)
                .join(`, `)}
            >
              <div className="badge badge-outline badge-sm cursor-default opacity-30 hover:opacity-100">
                {person.exclude.length} {pluralize("exclusion", person.exclude)}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
