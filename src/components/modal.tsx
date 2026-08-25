"use client";

import { type MouseEvent, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";

type ModalProps = {
  aberto: boolean;
  titulo: string;
  dialogRef: RefObject<HTMLDialogElement | null>;
  fechar: () => void;
  children: ReactNode;
};

export function Modal({ aberto, titulo, dialogRef, fechar, children }: ModalProps) {
  const fecharNoBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) fechar();
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onCancel={(event) => {
        event.preventDefault();
        fechar();
      }}
      onClick={fecharNoBackdrop}
      onClose={fechar}
    >
      <div className="linha modal-cabecalho">
        <h2>{titulo}</h2>
        <button type="button" className="icone" onClick={fechar} aria-label="Fechar">
          <X size={20} />
        </button>
      </div>
      {aberto && children}
    </dialog>
  );
}
