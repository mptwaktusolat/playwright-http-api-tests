import test, { expect } from "@playwright/test";

test("Get Valid Data for current datetime", async ({ request }) => {
  const zone = "WLY01";
  const response = await request.get(`/v2/solat/${zone}`);
  expect(response.status()).toBe(200);

  const result = await response.json();

  let now = new Date();
  expect(result.zone).toBe(zone);
  expect(result.year).toBe(now.getFullYear());
  expect(result.month).toBe(
    now.toLocaleString("en-US", { month: "short" }).toUpperCase()
  );
  expect(result.month_number).toBe(now.getMonth() + 1);
  expect(result.prayers).toHaveLength(
    new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  );
});

test("Get Valid Data for specific month", async ({ request }) => {
  const zone = "KDH01";
  const response = await request.get(`/v2/solat/${zone}?year=2025&month=5`);
  expect(response.status()).toBe(200);

  const result = await response.json();

  expect(result.zone).toBe(zone);
  expect(result.year).toBe(2025);
  expect(result.month).toBe("MAY");
  expect(result.month_number).toBe(5);
  expect(result.prayers).toHaveLength(31);

  // Assert first day data
  const firstDay = result.prayers[0];
  expect(firstDay.day).toBe(1);
  expect(firstDay.hijri).toBe("1446-11-03");
  expect(firstDay.fajr).toBe(1746050100);
  expect(firstDay.syuruk).toBe(1746054240);
  expect(firstDay.dhuhr).toBe(1746076680);
  expect(firstDay.asr).toBe(1746088440);
  expect(firstDay.maghrib).toBe(1746098820);
  expect(firstDay.isha).toBe(1746103140);
});

test("Get Valid Data for month rollover", async ({ request }) => {
  const zone = "PNG01";
  const response = await request.get(`/v2/solat/${zone}?year=2025&month=13`);
  expect(response.status()).toBe(200);

  const result = await response.json();

  expect(result.zone).toBe(zone);
  expect(result.year).toBe(2025);
  expect(result.month).toBe("JAN");
  expect(result.month_number).toBe(13);
  expect(result.prayers).toHaveLength(31);

  // Assert first day data
  const firstDay = result.prayers[0];
  expect(firstDay.day).toBe(1);
  expect(firstDay.hijri).toBe("1447-07-11");
  expect(firstDay.fajr).toBe(1767219240);
  expect(firstDay.syuruk).toBe(1767223560);
  expect(firstDay.dhuhr).toBe(1767245040);
  expect(firstDay.asr).toBe(1767257160);
  expect(firstDay.maghrib).toBe(1767266280);
  expect(firstDay.isha).toBe(1767270780);
});

test("Invalid Get Data for non-existing zone", async ({ request }) => {
  const zone = "XXX99";
  const response = await request.get(`/v2/solat/${zone}?year=2026&month=1`);
  expect(response.status()).toBe(404);
  const result = await response.json();
  expect(result.message).toBe(`No data found for zone: ${zone} for Jan/2026`);
});

test("Invalid get non-existing data", async ({ request }) => {
  // data not available in database prior to 2023
  const year = 2022;
  const month = 12;
  const response = await request.get(
    `/v2/solat/WLY02?year=${year}&month=${month}`
  );
  expect(response.status()).toBe(404);
  const result = await response.json();
  expect(result.message).toBe(`No data found for zone: WLY02 for Dec/2022`);
});
