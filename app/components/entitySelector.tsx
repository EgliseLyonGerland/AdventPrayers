import { Combobox } from "@headlessui/react";
import clsx from "clsx";
import type { ReactNode } from "react";
import { useState, memo } from "react";

interface Props<T> {
  className?: string;
  name: string;
  items: T[];
  keyProp: keyof T;
  filterBy: keyof T | (keyof T)[];
  vertical?: "top" | "bottom";
  horizontal?: "start" | "end";
  renderItem: (value: T) => ReactNode;
  onSelect: (value: T) => void;
}

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
          const value = Array.isArray(filterBy)
            ? filterBy.map((prop) => item[prop]).join(" ")
            : item[filterBy];

          return `${value}`.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Combobox
      as="div"
      className={clsx(
        "dropdown relative",
        horizontal === "start" ? "" : "dropdown-end",
        vertical === "top" ? "dropdown-top" : "dropdown-bottom",
        className,
      )}
      onChange={(item: T) => onSelect(item)}
    >
      <Combobox.Input
        autoComplete="off"
        className="input input-ghost input-secondary input-sm focus:outline-none"
        onChange={(event) => setQuery(event.target.value)}
        placeholder={name}
      />
      <Combobox.Options
        as="ul"
        className="dropdown-content mt-2 max-h-[320px] min-w-[400px] divide-y divide-white/10 overflow-auto rounded-md border border-base-content/20 bg-base-200 shadow-xl focus:outline-none"
        static
      >
        {filteredItems.length === 0 ? (
          <div className="cursor-default select-none px-4 py-3 italic">
            Aucun résultat
          </div>
        ) : (
          filteredItems.map((item) => (
            <Combobox.Option
              as="li"
              className="block w-full cursor-pointer px-4 py-3 text-left ui-selected:font-bold ui-active:bg-base-300"
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
