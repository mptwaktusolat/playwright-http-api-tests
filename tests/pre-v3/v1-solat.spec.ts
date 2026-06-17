import test, { expect } from "@playwright/test";

test("Get Valid Data for current datetime", async ({ request }) => {
  const zone = "MLK01";
  const response = await request.get(`/solat/${zone}`, {
    params: {
      year: 2026,
      month: 8,
    },
  });
  expect(response.status()).toBe(200);

  const result = await response.json();

  expect(result.status).toBe("OK!");
  expect(result.zone).toBe(zone);
  expect(result.periodType).toBe("month");
  expect(result.prayerTime).not.toBeNull();
  expect(result.prayerTime.length).toBe(31);

  const firstDay = result.prayerTime[0];
  expect(firstDay.hijri).toBe("1448-02-17");
  expect(firstDay.date).toBe("01-Aug-2026");
  expect(firstDay.day).toBe("Saturday");
  expect(firstDay.imsak).toBe("05:50:00");
  expect(firstDay.fajr).toBe("06:00:00");
  expect(firstDay.syuruk).toBe("07:11:00");
  expect(firstDay.dhuha).toBe("07:39:00");
  expect(firstDay.dhuhr).toBe("13:20:00");
  expect(firstDay.asr).toBe("16:41:00");
  expect(firstDay.maghrib).toBe("19:26:00");
  expect(firstDay.isha).toBe("20:38:00");
});

test("Get Valid Data for specific month", async ({ request }) => {
  const zone = "KDH01";
  const response = await request.get(`/solat/${zone}?year=2026&month=8`);
  expect(response.status()).toBe(200);

  const result = await response.json();

  expect(result.zone).toBe(zone);
  expect(result.periodType).toBe("month");

  // Assert first day data
  const firstDay = result.prayerTime[0];
  expect(firstDay.hijri).toBe("1448-02-17");
  expect(firstDay.date).toBe("01-Aug-2026");
  expect(firstDay.day).toBe("Saturday");
  expect(firstDay.imsak).toBe("05:51:00");
  expect(firstDay.fajr).toBe("06:01:00");
  expect(firstDay.syuruk).toBe("07:11:00");
  expect(firstDay.dhuha).toBe("07:38:00");
  expect(firstDay.dhuhr).toBe("13:27:00");
  expect(firstDay.asr).toBe("16:47:00");
  expect(firstDay.maghrib).toBe("19:38:00");
  expect(firstDay.isha).toBe("20:51:00");
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
  expect(firstDay.imsak).toBe("06:04:00");
  expect(firstDay.fajr).toBe("06:14:00");
  expect(firstDay.syuruk).toBe("07:26:00");
  expect(firstDay.dhuha).toBe("07:51:00");
  expect(firstDay.dhuhr).toBe("13:24:00");
  expect(firstDay.asr).toBe("16:46:00");
  expect(firstDay.maghrib).toBe("19:18:00");
  expect(firstDay.isha).toBe("20:33:00");
});

test("Get Valid Data with dhuha as null for year before 2025", async ({
  request,
}) => {
  const zone = "KTN01";
  const response = await request.get(`/solat/${zone}?year=2024&month=1`);
  expect(response.status()).toBe(200);

  const result = await response.json();

  // Assert dhuha is null before 2025
  const firstDay = result.prayerTime[0];
  expect(firstDay.dhuha).toBeNull();
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
  expect(result.message).toContain("No data found for zone: XXX99");
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
    },
  );
  expect(response.status()).toBe(500);
  const result = await response.json();
  expect(result.message).toBe("No data found for zone: WLY02 for Dec/2022");
});
