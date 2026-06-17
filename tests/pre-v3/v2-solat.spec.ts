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
    now.toLocaleString("en-US", { month: "short" }).toUpperCase(),
  );
  expect(result.month_number).toBe(now.getMonth() + 1);
  expect(result.prayers).toHaveLength(
    new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
  );
});

test("Get Valid Data for specific month", async ({ request }) => {
  const zone = "KDH01";
  const response = await request.get(`/v2/solat/${zone}?year=2026&month=8`);
  expect(response.status()).toBe(200);

  const result = await response.json();

  expect(result.zone).toBe(zone);
  expect(result.year).toBe(2026);
  expect(result.month).toBe("AUG");
  expect(result.month_number).toBe(8);
  expect(result.prayers).toHaveLength(31);

  // Assert first day data
  const firstDay = result.prayers[0];
  expect(firstDay.day).toBe(1);
  expect(firstDay.hijri).toBe("1448-02-17");
  expect(firstDay.imsak).toBe(1785534660);
  expect(firstDay.fajr).toBe(1785535260);
  expect(firstDay.syuruk).toBe(1785539460);
  expect(firstDay.dhuha).toBe(1785541080);
  expect(firstDay.dhuhr).toBe(1785562020);
  expect(firstDay.asr).toBe(1785574020);
  expect(firstDay.maghrib).toBe(1785584280);
  expect(firstDay.isha).toBe(1785588660);
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
  expect(firstDay.imsak).toBe(1767218640);
  expect(firstDay.fajr).toBe(1767219240);
  expect(firstDay.syuruk).toBe(1767223560);
  expect(firstDay.dhuha).toBe(1767225060);
  expect(firstDay.dhuhr).toBe(1767245040);
  expect(firstDay.asr).toBe(1767257160);
  expect(firstDay.maghrib).toBe(1767266280);
  expect(firstDay.isha).toBe(1767270780);
});

test("Get Valid Data with dhuha as null for year before 2025", async ({
  request,
}) => {
  const zone = "KTN01";
  const response = await request.get(`/v2/solat/${zone}?year=2024&month=1`);
  expect(response.status()).toBe(200);

  const result = await response.json();

  // Assert dhuha is null before 2025
  const firstDay = result.prayers[0];
  expect(firstDay.dhuha).toBeNull();
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
    `/v2/solat/WLY02?year=${year}&month=${month}`,
  );
  expect(response.status()).toBe(404);
  const result = await response.json();
  expect(result.message).toBe(`No data found for zone: WLY02 for Dec/2022`);
});

test.describe("Valid Get prayer time by GPS", () => {
  test("should get prayer time in Kuala Lumpur", async ({ request }) => {
    const response = await request.get(
      "/v2/solat/3.113034350544325/101.66375285717807?year=2026&month=6",
    );
    const result = await response.json();

    expect(result.zone).toBe("WLY01");
    expect(result.year).toBe(2026);
    expect(result.month).toBe("JUN");
    expect(result.month_number).toBe(6);
    expect(result.prayers).toHaveLength(30);

    // Assert first day data
    const firstDay = result.prayers[0];
    expect(firstDay.day).toBe(1);
    expect(firstDay.hijri).toBe("1447-12-15");
    expect(firstDay.imsak).toBe(1780263540);
    expect(firstDay.fajr).toBe(1780264140);
    expect(firstDay.syuruk).toBe(1780268520);
    expect(firstDay.dhuha).toBe(1780270020);
    expect(firstDay.dhuhr).toBe(1780290840);
    expect(firstDay.asr).toBe(1780303140);
    expect(firstDay.maghrib).toBe(1780312920);
    expect(firstDay.isha).toBe(1780317420);
  });

  test("should get prayer time at Bentong (Rumah Nenek)", async ({
    request,
  }) => {
    const response = await request.get(
      "/v2/solat/3.1834015431/102.276653656?year=2026&month=6",
    );
    const result = await response.json();

    expect(result.zone).toBe("PHG04");
    expect(result.year).toBe(2026);
    expect(result.month).toBe("JUN");
    expect(result.month_number).toBe(6);
    expect(result.prayers).toHaveLength(30);

    // Assert first day data
    const firstDay = result.prayers[0];
    expect(firstDay.day).toBe(1);
    expect(firstDay.hijri).toBe("1447-12-15");
    expect(firstDay.imsak).toBe(1780263360);
    expect(firstDay.fajr).toBe(1780263960);
    expect(firstDay.syuruk).toBe(1780268400);
    expect(firstDay.dhuha).toBe(1780269900);
    expect(firstDay.dhuhr).toBe(1780290720);
    expect(firstDay.asr).toBe(1780303020);
    expect(firstDay.maghrib).toBe(1780312860);
    expect(firstDay.isha).toBe(1780317360);
  });
});

test.describe("Invalid Get prayer time by GPS", () => {
  test("should throw error when coordinates is outside Malaysia", async ({
    request,
  }) => {
    // Location Marina Bay, Singapore
    const response = await request.get(
      "/v2/solat/1.282016154947726/103.85414065511813?year=2026&month=6",
    );
    const result = await response.json();

    expect(response.status()).toBe(422); // Unprocessable Entity
    expect(result).toHaveProperty("message");
    expect(result.message).toBe("No zone found for the given coordinates.");
  });

  test("Should throw error when coordinates is out of range", async ({
    request,
  }) => {
    const response = await request.get("/v2/solat/100/200");
    const result = await response.json();

    expect(response.status()).toBe(422); // Unprocessable Entity
    expect(result).toHaveProperty("message");
    expect(result.message).toBe(
      "SQLSTATE[22S02]: <<Unknown error>>: 3616 Longitude 200.000000 is out of range in function st_geomfromtext. It must be within (-180.000000, 180.000000]. (Connection: mysql, Host: 127.0.0.1, Port: 3306, Database: waktusolat-api, SQL: select * from `zone_polygons` where ST_Within(ST_GeomFromText(POINT(100.000000 200.000000), 4326), polygon) limit 1)",
    );
  });

  test("Should throw error when coordinates is not a number", async ({
    request,
  }) => {
    const response = await request.get("/v2/solat/borhan/ahmad");
    const result = await response.json();

    expect(response.status()).toBe(422); // Unprocessable Entity
    expect(result).toHaveProperty("message");
    expect(result.message).toBe(
      "Invalid coordinates. The lat field must be a number. The long field must be a number.",
    );
  });
});
