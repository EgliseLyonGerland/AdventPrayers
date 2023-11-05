import { Portal } from "@headlessui/react";
import { motion } from "framer-motion";
import { type ReactNode, useEffect, useRef } from "react";

interface Props {
  children: ReactNode;
  open?: boolean;
  closable?: boolean;
  onClose?: () => void;
}

function SidePanel({ children, open, closable = true, onClose }: Props) {
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
            x: open ? 0 : "100%",
          }}
          className="fixed inset-y-0 right-0 w-[600px] max-w-[95%] overflow-auto bg-base-100"
          transition={{
            type: "tween",
            ease: "anticipate",
            duration: 0.5,
          }}
        >
          <motion.div
            animate={{ opacity: open ? 1 : 0 }}
            className="p-8"
            transition={{ delay: 1 }}
          >
            {children}
          </motion.div>
        </motion.div>
      </dialog>
    </Portal>
  );
}

export default SidePanel;
