import { Portal } from "@headlessui/react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { type ReactNode, useEffect, useRef } from "react";

interface Props {
  children: ReactNode;
  open?: boolean;
  closable?: boolean;
  className?: string;
  onClose?: () => void;
}

function SidePanel({
  children,
  open,
  closable = true,
  className,
  onClose,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [open]);

  return (
    <Portal>
      <dialog className="modal" ref={dialog}>
        {closable ? (
          <div className="modal-backdrop">
            <button onClick={onClose} />
          </div>
        ) : null}

        <motion.div
          animate={{
            opacity: open ? 1 : 0,
            x: open ? "0%" : "100%",
          }}
          className={clsx(
            "fixed inset-y-0 right-0 max-w-[95%] overflow-auto bg-base-100 def:w-[600px]",
            className,
          )}
          transition={{
            type: "tween",
            ease: "anticipate",
            duration: 0.3,
          }}
        >
          <motion.div
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ delay: 0.6 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </dialog>
    </Portal>
  );
}

export default SidePanel;
