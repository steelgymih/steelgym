const TZ = "America/Ciudad_Juarez";

export type OpenState = {
  open: boolean;
  label: string;
  detail: string;
};

function partsNow(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  });
  const bag = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value]),
  );
  const weekday = bag.weekday;
  const hour = Number(bag.hour);
  const minute = Number(bag.minute);
  const minutes = hour * 60 + minute;
  return { weekday, minutes };
}

export function getOpenState(date = new Date()): OpenState {
  const { weekday, minutes } = partsNow(date);

  if (weekday === "Sun") {
    return {
      open: false,
      label: "Cerrado",
      detail: "Domingo cerrado · Abrimos lunes 00:00",
    };
  }

  if (weekday === "Sat") {
    const openMin = 8 * 60;
    const closeMin = 16 * 60 + 30;
    if (minutes >= openMin && minutes < closeMin) {
      return {
        open: true,
        label: "Abierto",
        detail: "Sábado · cierra 16:30",
      };
    }
    if (minutes < openMin) {
      return {
        open: false,
        label: "Cerrado",
        detail: "Sábado · abre 8:00",
      };
    }
    return {
      open: false,
      label: "Cerrado",
      detail: "Domingo cerrado · Lunes 00:00",
    };
  }

  return {
    open: true,
    label: "Abierto",
    detail: "24/5 · Lunes a viernes sin horario",
  };
}
