"use client";

import { useFormStatus } from "react-dom";

type BotaoSubmitProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pendente: string;
};

export function BotaoSubmit({
  children,
  pendente,
  disabled,
  ...props
}: BotaoSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <button {...props} type="submit" disabled={disabled || pending}>
      {pending ? pendente : children}
    </button>
  );
}
