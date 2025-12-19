import test, { expect } from "@playwright/test";

test.describe("Get Valid All Zones", () => {
  test("should return success", async ({ request }) => {
    const response = await request.get("/zones");
    expect(response.status()).toBe(200);
  });

  test("should return array of objects", async ({ request }) => {
    const response = await request.get("/zones");
    const result = await response.json();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(60);
    expect(result[0]).toHaveProperty("jakimCode");
    expect(result[0]).toHaveProperty("negeri");
    expect(result[0]).toHaveProperty("daerah");
  });
});

test.describe("Get Valid Zones given state code", () => {
  test("should return success", async ({ request }) => {
    const response = await request.get("/zones/SGR");
    expect(response.status()).toBe(200);
  });

  test("should return array of objects", async ({ request }) => {
    const response = await request.get("/zones/SGR");
    const results = await response.json();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(3);
    expect(results[0]).toHaveProperty("jakimCode");
    expect(results[0]).toHaveProperty("negeri");
    expect(results[0]).toHaveProperty("daerah");
  });

  test("jakim code should starts with input state", async ({ request }) => {
    const response = await request.get("/zones/SGR");
    const results = await response.json();

    for (const item of results) {
      // Check string startsWith
      expect(item.jakimCode.startsWith("SGR")).toBe(true);
    }
  });
});

test.describe("Valid Get Zones Filtered by Invalid State", () => {
  test("should return success", async ({ request }) => {
    const response = await request.get("/zones/XYZ99");
    expect(response.status()).toBe(200);
  });

  test("should return empty array", async ({ request }) => {
    const response = await request.get("/zones/XYZ99");
    const results = await response.json();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });
});

test.describe("Valid Get zone by GPS", () => {
  test("should resolve correct zone (KL)", async ({ request }) => {
    const response = await request.get(
      "/zones/3.113034350544325/101.66375285717807"
    );
    const result = await response.json();

    expect(result.zone).toBe("WLY01");
    expect(result.state).toBe("KUL");
    expect(result.district).toBe("W.P. Kuala Lumpur");
  });

  test("should resolve correct zone (Rumah Nenek)", async ({ request }) => {
    const response = await request.get(
      "/zones/3.183401543161759/102.27665365633841"
    );
    const result = await response.json();

    expect(result.zone).toBe("PHG04");
    expect(result.state).toBe("PHG");
    expect(result.district).toBe("Bentong");
  });
});

test.describe("Invalid Get zone by GPS", () => {
  test("should throw error when coordinates is outside Malaysia", async ({
    request,
  }) => {
    // Location Marina Bay, Singapore
    const response = await request.get(
      "/zones/1.282016154947726/103.85414065511813"
    );
    const result = await response.json();

    expect(response.status()).toBe(500);
    expect(result).toHaveProperty("error");
    expect(result.error).toBe("No zone found for the given coordinates.");
  });

  test("Should throw error when coordinates is out of range", async ({
    request,
  }) => {
    const response = await request.get("/zones/100/200");
    const result = await response.json();

    expect(response.status()).toBe(500);
    expect(result).toHaveProperty("error");
    expect(result.error).toBe(
      "Longitude 200.000000 is out of range in function st_geomfromtext. It must be within (-180.000000, 180.000000]."
    );
  });
});
