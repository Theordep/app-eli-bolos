"use client";

import { useState } from "react";
import { formatTelefoneBR } from "@/lib/phone";

export function PhoneInput({
  id,
  name,
  required,
  defaultValue,
  className,
}: {
  id: string;
  name: string;
  required?: boolean;
  defaultValue?: string | null;
  className?: string;
}) {
  const [value, setValue] = useState(() => formatTelefoneBR(defaultValue ?? ""));

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="tel"
      placeholder="(11) 99999-9999"
      required={required}
      value={value}
      onChange={(e) => setValue(formatTelefoneBR(e.target.value))}
      className={className}
    />
  );
}
