import { Link } from "@remix-run/react";

function Header() {
  return (
    <div className="navbar bg-neutral text-neutral-content">
      <div className="container mx-auto px-4">
        <Link to="/" className="btn-ghost btn text-xl normal-case">
          En Avent la prière !
        </Link>
      </div>
    </div>
  );
}

export default Header;
