import test, { expect } from "@playwright/test";

test("Get Valid Data for current datetime", async ({ request }) => {
  const zone = "MLK01";
  const response = await request.get(`/solat/${zone}`);
  expect(response.status()).toBe(200);

  const result = await response.json();

  expect(result.status).toBe("OK!");
  expect(result.zone).toBe(zone);
  expect(result.periodType).toBe("month");
  expect(result.prayerTime).not.toBeNull();
  expect(result.prayerTime.length).toBeGreaterThan(28);
});

test("Get Valid Data for specific month", async ({ request }) => {
  const zone = "KDH01";
  const response = await request.get(`/solat/${zone}?year=2025&month=5`);
  expect(response.status()).toBe(200);

  const result = await response.json();

  expect(result.zone).toBe(zone);
  expect(result.periodType).toBe("month");

  // Assert first day data
  const firstDay = result.prayerTime[0];
  expect(firstDay.hijri).toBe("1446-11-03");
  expect(firstDay.date).toBe("01-May-2025");
  expect(firstDay.day).toBe("Thursday");
  expect(firstDay.fajr).toBe("05:55:00");
  expect(firstDay.syuruk).toBe("07:04:00");
  expect(firstDay.dhuhr).toBe("13:18:00");
  expect(firstDay.asr).toBe("16:34:00");
  expect(firstDay.maghrib).toBe("19:27:00");
  expect(firstDay.isha).toBe("20:39:00");
});

test("Get Valid Data for month rollover", async ({ request }) => {
  const zone = "PNG01";
  const response = await request.get(`/solat/${zone}?year=2025&month=13`);
  expect(response.status()).toBe(200);

  const result = await response.json();

  // Assert first day data
  const firstDay = result.prayerTime[0];
  expect(firstDay.hijri).toBe("1447-07-11");
  expect(firstDay.date).toBe("01-Jan-2026");
  expect(firstDay.day).toBe("Thursday");
  expect(firstDay.fajr).toBe("06:14:00");
  expect(firstDay.syuruk).toBe("07:26:00");
  expect(firstDay.dhuhr).toBe("13:24:00");
  expect(firstDay.asr).toBe("16:46:00");
  expect(firstDay.maghrib).toBe("19:18:00");
  expect(firstDay.isha).toBe("20:33:00");
});

test("Invalid Get Data for non-existing zone", async ({ request }) => {
  const zone = "XXX99";
  const response = await request.get(`/solat/${zone}`, {
    headers: {
      Accept: "application/json",
    },
  });
  expect(response.status()).toBe(500);
  const result = await response.json();
  expect(result.message).toBe("Server Error");
});

test("Invalid get non-existing data", async ({ request }) => {
  // data not available in database prior to 2023
  const year = 2022;
  const month = 12;
  const response = await request.get(
    `/solat/WLY02?year=${year}&month=${month}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  expect(response.status()).toBe(500);
  const result = await response.json();
  expect(result.message).toBe("Server Error");
});
