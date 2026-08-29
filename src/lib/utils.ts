import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMxn(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

export function waLink(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const full = digits.startsWith("52") ? digits : `52${digits}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
}
