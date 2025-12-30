export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
  currentTime: string;
}
export const getTimezones = (): TimezoneOption[] => {
  const timezones = (Intl as any).supportedValuesOf("timeZone");

  return timezones.map((tz: string) => {
    const now = new Date();

    // Current time
    const currentTime = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(now);

    // Offset e.g. GMT+05:30
    const offset =
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "shortOffset",
      })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value || "";

    // Readable label like "India Standard Time"
    const longName =
      new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "long",
      })
        .formatToParts(now)
        .find((p) => p.type === "timeZoneName")?.value || tz;

    return {
      value: tz, // Asia/Kolkata
      label: longName, // India Standard Time
      offset, // GMT+05:30
      currentTime, // 12:39 PM
    };
  });
};

export const formatTimeInTimezone = (date: Date, timezone: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
};

export const getUTCOffsetInMinutes = (timezone: string): number => {
  const now = new Date();
  const tzDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  return (tzDate.getTime() - utcDate.getTime()) / 60000;
};
