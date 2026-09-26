// The cloud container that wrote these tools could not reach the CDNs the
// prototype (concept-4-sensor.html) loads its libraries from, so it served
// them from disk here. On a normal machine the CDNs answer, so this is a
// no-op kept for the scripts that import it (frames, pinprobe, compare,
// protoshot).
export async function attachCdnRoutes() {}
