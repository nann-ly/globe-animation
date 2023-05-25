let promise;

export const getCountries = async (): Promise<{
  coordinates: [number, number][],
  name: string,
}[]> => {
  if (!promise) {
    promise = fetch('/countries.json')
      .then((r) => {
        return r.json()
      })
  }

  const data: {
    features: {
      geometry: {
        coordinates: [number, number][][] | [number,number][]
      },
      properties: {
        NAME: string,
      }
    }[]
  } = await promise;

  const ans = data.features.map((i) => {

    let coordinates = i.geometry.coordinates.flat();
    if (coordinates.some((i: any) => i.length > 2)) {
      coordinates = coordinates.flat();
    }
    return {
      name: i.properties.NAME,
      coordinates: coordinates as [number,number][],
    }
  });
  return ans;
}