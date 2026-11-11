import { isArray } from "lodash";

export function processTransform(data: any, transform: AnyObject, strict = false) {
  switch (transform.method) {
    case "map":
      if (strict && !isArray(data)) {
        throw new TypeError("transform.map expected an array");
      }
      if (isArray(data)) {
        return data.map((item: any) => {
          return {
            ...item,
            ...Object.keys(transform.relation).reduce((acc, current) => {
              return {
                ...acc,
                [transform.relation[current]]: item[current],
              };
            }, {}),
          };
        });
      }
      return data;
    default:
      return data;
  }
}
