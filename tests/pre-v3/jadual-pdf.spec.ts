import test, { expect } from "@playwright/test";
import { PDFParse } from "pdf-parse";

test("Get Valid Jadual PDF", async ({ request }) => {
  const zone = "SGR01";
  const year = 2026;
  const month = 1;

  const response = await request.get(
    `/jadual_solat/${zone}?year=${year}&month=${month}`
  );

  expect(response.status()).toBe(200);
  const contentType = response.headers()["content-type"];
  expect(contentType).toContain("application/pdf");

  const parser = new PDFParse({ data: await response.body() });
  const result = (await parser.getText()).text;
  await parser.destroy();

  // Assert PDF contains the correct content
  expect(result).toContain("Jadual Waktu Solat");
  expect(result).toContain(zone);
  expect(result).toContain("Januari 2026"); // Malay month name
  expect(result).toContain("Gombak"); // Location for SGR01
  expect(result).toContain("Petaling");
  expect(result).toContain("Shah Alam");

  // Check prayer time column headers
  expect(result).toContain("Subuh");
  expect(result).toContain("Syuruk");
  expect(result).toContain("Zohor");
  expect(result).toContain("Asar");
  expect(result).toContain("Maghrib");
  expect(result).toContain("Isyak");

  // Check for date column
  expect(result).toContain("Tarikh");

  // Verify it has all days of January (31 days)
  expect(result).toContain("01-01-2026");
  expect(result).toContain("15-01-2026");
  expect(result).toContain("31-01-2026");

  // Assert branding
  expect(result).toContain("Waktu Solat Malaysia");
});

test("Get Jadual PDF with current month and year", async ({ request }) => {
  const zone = "SGR01";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const response = await request.get(
    `/jadual_solat/${zone}?year=${year}&month=${month}`
  );

  expect(response.status()).toBe(200);

  const contentType = response.headers()["content-type"];
  expect(contentType).toContain("application/pdf");

  // Parse PDF content
  const parser = new PDFParse({ data: await response.body() });
  const result = (await parser.getText()).text;
  await parser.destroy();

  expect(result).toContain("Jadual Waktu Solat");
  expect(result).toContain(zone);
  expect(result).toContain(year.toString());
});

test("Get Jadual PDF with different valid zone", async ({ request }) => {
  const zone = "WLY01";
  const year = 2026;
  const month = 6;

  const response = await request.get(
    `/jadual_solat/${zone}?year=${year}&month=${month}`
  );

  expect(response.status()).toBe(200);

  const contentType = response.headers()["content-type"];
  expect(contentType).toContain("application/pdf");

  // Parse PDF content
  const parser = new PDFParse({ data: await response.body() });
  const result = (await parser.getText()).text;
  await parser.destroy();

  expect(result).toContain("Jadual Waktu Solat");
  expect(result).toContain(zone);
  expect(result).toContain("Jun 2026");
  expect(result).toContain("Kuala Lumpur"); // Location for WLY01
});

test("Get Jadual PDF with invalid zone", async ({ request }) => {
  const zone = "ASD01";
  const year = 2026;
  const month = 1;

  const response = await request.get(
    `/jadual_solat/${zone}?year=${year}&month=${month}`
  );

  expect(response.status()).toBe(404);

  const result = await response.json();
  expect(result.message).toBe("No data found for zone: ASD01 for Jan/2026");
});

test("Get Jadual PDF with month rollover", async ({ request }) => {
  const zone = "SGR01";
  const year = 2025;
  const month = 13; // Invalid month

  const response = await request.get(
    `/jadual_solat/${zone}?year=${year}&month=${month}`
  );

  expect(response.status()).toBe(200);

  const parser = new PDFParse({ data: await response.body() });
  const result = (await parser.getText()).text;
  await parser.destroy();

  expect(result).toContain("Jadual Waktu Solat");
  expect(result).toContain(zone);
  expect(result).toContain("Januari 2026");
});

test("Get Jadual PDF with non-existing data", async ({ request }) => {
  const zone = "SGR01";
  // No prayer data is available prior 2023
  const year = 2022;
  const month = 1;

  const response = await request.get(
    `/jadual_solat/${zone}?year=${year}&month=${month}`
  );

  expect(response.status()).toBe(404);

  const result = await response.json();
  expect(result.message).toBe("No data found for zone: SGR01 for Jan/2022");
});

test("Get Jadual PDF current Date", async ({ request }) => {
  const zone = "SGR01";

  const response = await request.get(`/jadual_solat/${zone}`);

  expect(response.status()).toBe(200);

  const parser = new PDFParse({ data: await response.body() });
  const result = (await parser.getText()).text;
  await parser.destroy();

  const now = new Date();

  // Assert PDF contains the correct content
  expect(result).toContain("Jadual Waktu Solat");
  expect(result).toContain(zone);

  // Get current month name in Malay using Intl.DateTimeFormat
  const currentMonthName = new Intl.DateTimeFormat("ms-MY", {
    month: "long",
  }).format(now);
  expect(result).toContain(`${currentMonthName} ${now.getFullYear()}`);

  expect(result).toContain(
    "Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Shah Alam"
  ); // Location for SGR01

  // Verify it has dates from current month
  const formatDate = (day: number) =>
    `${String(day).padStart(2, "0")}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${now.getFullYear()}`;

  const firstDay = formatDate(1);
  const midMonth = formatDate(15);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const lastDayFormatted = formatDate(lastDay);

  expect(result).toContain(firstDay);
  expect(result).toContain(midMonth);
  expect(result).toContain(lastDayFormatted);

  // Assert branding
  expect(result).toContain("Waktu Solat Malaysia");
});
