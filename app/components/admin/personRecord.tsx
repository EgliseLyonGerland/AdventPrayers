import { type Person, type PersonWithExclude } from "~/models/person.server";
import { pluralize } from "~/utils";

interface Props {
  person: Person | PersonWithExclude;
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

      <div className="flex-1">
        <div className="mb-1 truncate">
          {person.firstName} {person.lastName}
          <span className="ml-2 text-base-content/50">{person.age}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-60">
            {person.email || <i>No email address</i>}
          </span>

          {"exclude" in person && person.exclude.length > 0 ? (
            <span
              className="badge badge-neutral tooltip tooltip-accent block"
              data-tip={person.exclude
                .map((item) => `${item.firstName} ${item.lastName}`)
                .join(`, `)}
            >
              {person.exclude.length} {pluralize("exclusion", person.exclude)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
