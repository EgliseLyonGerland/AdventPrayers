import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "@remix-run/react";
import { Fragment } from "react";

import { getCurrentYear } from "~/utils";

import Logo from "./logo";

interface Props {
  draws: {
    year: number;
  }[];
}

function Header({ draws }: Props) {
  const navigate = useNavigate();

  const currentYear = getCurrentYear();
  const years = draws.map(({ year }) => year).sort((a, b) => a - b);
  if (years[years.length - 1] !== currentYear) {
    years.push(currentYear);
  }

  return (
    <div className="navbar sticky top-0 z-[1000] mb-12 border-b border-b-base-content/10 bg-base-100 text-neutral-content">
      <div className="container mx-auto">
        <div className="mr-8">
          <Link className="text-xl normal-case" to="/">
            <Logo className="my-2 h-16 fill-base-content" />
          </Link>
        </div>

        <Menu as="div" className="relative">
          <Menu.Button as="label" className="btn btn-sm">
            Éditions
            <ChevronDownIcon className="ml-2" height={16} />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Menu.Items
              as="ul"
              className="menu absolute left-0 z-[1000] mt-2 origin-top-right rounded-md bg-base-200 text-base-content shadow-md outline-none focus:outline-none"
            >
              {years.map((year) => (
                <Menu.Item
                  as="li"
                  className="ui-active:active"
                  key={year}
                  onClick={() => {
                    navigate(`/draws/${year}`);
                  }}
                >
                  <span className="min-w-[160px]">{year}</span>
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}

export default Header;
