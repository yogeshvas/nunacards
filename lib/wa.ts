const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "918796140284";

export function employeeWaLink(employeeCode: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(employeeCode)}`;
}
