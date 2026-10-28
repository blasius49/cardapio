/** A pizzaria abre às 18h e fecha 23h30 (00h30 às sextas e sábados), horário de São Paulo. */
export function computeOpenNow(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Mon";

  const minutes = hour * 60 + minute;
  const opensAt = 18 * 60;
  const closesAt = weekday === "Fri" || weekday === "Sat" ? 24 * 60 + 30 : 23 * 60 + 30;

  return minutes >= opensAt || minutes <= closesAt - 24 * 60;
}
