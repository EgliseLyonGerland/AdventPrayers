import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";

interface Props {
  title: string;
  src: string;
}

export default function Picture({ title, src }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="flex h-32 items-center justify-start gap-4 md:gap-8">
      <img alt={title} className="aspect-square h-32 object-cover" src={src} />
      <button
        className="btn btn-outline max-md:btn-sm"
        onClick={() => {
          dialogRef.current?.showModal();
        }}
      >
        Voir en grand
      </button>

      <dialog className="modal" ref={dialogRef}>
        <div className="modal-box max-w-6xl p-4 md:p-8">
          <form className="sticky top-0 mb-4 flex justify-end" method="dialog">
            <button className="btn btn-circle btn-neutral btn-sm md:btn-md">
              <XMarkIcon className="h-6" />
            </button>
          </form>

          <img alt={title} className="mx-auto block h-full" src={src} />
        </div>

        <form className="modal-backdrop" method="dialog">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
