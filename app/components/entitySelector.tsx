import { Combobox } from "@headlessui/react";
import type { ReactNode } from "react";
import { useState, memo } from "react";

type Props<T> = {
  className?: string;
  name: string;
  items: T[];
  keyProp: keyof T;
  filterBy: keyof T | (keyof T)[];
  vertical?: "top" | "bottom";
  horizontal?: "start" | "end";
  renderItem: (value: T) => ReactNode;
  onSelect: (value: T) => void;
};

function EntitySelector<T>({
  className,
  name,
  items = [],
  keyProp,
  filterBy,
  vertical = "bottom",
  horizontal = "start",
  renderItem,
  onSelect,
}: Props<T>) {
  const [query, setQuery] = useState("");

  const filteredItems =
    query === ""
      ? items
      : items.filter((item) => {
          let value = Array.isArray(filterBy)
            ? filterBy.map((prop) => item[prop]).join(" ")
            : item[filterBy];

          return `${value}`.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox
      as="div"
      className={`dropdown-ope dropdown relative dropdown-${horizontal} dropdown-${vertical} ${className}`}
      onChange={onSelect}
    >
      <Combobox.Input
        className="input-ghost input-secondary input input-sm focus:outline-none"
        onChange={(event) => setQuery(event.target.value)}
        placeholder={name}
        autoComplete="off"
      />
      <Combobox.Options
        as="ul"
        static
        className="dropdown-content max-h-[320px] min-w-[400px] divide-y divide-white/10 overflow-auto rounded-md bg-base-200 shadow-xl focus:outline-none"
      >
        {filteredItems.length === 0 ? (
          <div className="cursor-default select-none py-3 px-4 italic">
            Aucun résultat
          </div>
        ) : (
          filteredItems.map((item) => (
            <Combobox.Option
              as="li"
              className="ui-selected:text-bold block w-full px-4 py-3 text-left ui-active:bg-base-300"
              key={`${item[keyProp]}`}
              value={item}
            >
              <span>{renderItem(item)}</span>
            </Combobox.Option>
          ))
        )}
      </Combobox.Options>
    </Combobox>
  );
}

export default memo(EntitySelector) as typeof EntitySelector;
