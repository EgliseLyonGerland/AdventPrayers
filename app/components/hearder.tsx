import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "@remix-run/react";
import { Fragment } from "react";

type Props = {
  draws: {
    year: number;
  }[];
};

function Header({ draws }: Props) {
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const years = draws.map(({ year }) => year).sort((a, b) => a - b);
  if (years[years.length - 1] !== currentYear) {
    years.push(currentYear);
  }

  return (
    <div className="navbar bg-neutral text-neutral-content">
      <div className="container mx-auto px-4">
        <div className="mr-8">
          <Link to="/" className="text-xl normal-case">
            En Avent la prière !
          </Link>
        </div>

        <Menu as="div" className="relative">
          <Menu.Button as="label" className="btn">
            Tirages
            <ChevronDownIcon height={16} className="ml-2" />
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
              tabIndex={0}
              className="menu absolute left-0 z-[1000] mt-2 origin-top-right rounded-md bg-base-300 shadow-md outline-none focus:outline-none"
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
                  <span className="px-16">{year}</span>
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
