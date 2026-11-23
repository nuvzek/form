import { processDynamicValue } from "@/core/lifecycle/hooks/useDispatchHandler/processDynamicValue";
import Runtime from "@/core/runtime";

export async function processRequests(
  dispatch: keyof typeof runtime.ssr.actions,
  data: AnyObject,
  utils: AnyObject,
  runtime: Runtime,
  runtimeInfo?: AnyObject
) {
  const action = runtime.ssr.actions[dispatch];
  if (!action) {
    throw new Error(`SSR action "${String(dispatch)}" is not registered`);
  }

  const processedParams = processParams(data, utils, runtime, runtimeInfo);
  const processedData = processData(data, utils, runtime, runtimeInfo);

  runtime.recordDebug({
    kind: "request",
    status: "pending",
    path: `${String(dispatch)} ${data.target}`,
    detail: { params: processedParams, data: processedData },
  });

  try {
    const response = await action({
      ...data,
      params: processedParams,
      data: processedData,
    });
    runtime.recordDebug({
      kind: "request",
      status: "fulfilled",
      path: `${String(dispatch)} ${data.target}`,
      detail: { response },
    });
    return response;
  } catch (error) {
    runtime.recordDebug({
      kind: "request",
      status: "rejected",
      path: `${String(dispatch)} ${data.target}`,
      detail: { error },
    });
    throw error;
  }
}

function processParams(
  data: AnyObject,
  utils: AnyObject,
  runtime: Runtime,
  runtimeInfo?: AnyObject
) {
  if (!data.params) return {};
  const processedParams: AnyObject = {};

  Object.entries(data.params).forEach(([key, value]: [string, any]) => {
    processedParams[key] = processDynamicValue(
      value,
      utils,
      runtime,
      runtimeInfo
    );
  });

  return processedParams;
}

function processData(
  data: AnyObject,
  utils: AnyObject,
  runtime: Runtime,
  runtimeInfo?: AnyObject
) {
  if (!data.data) return {};
  const processedData: AnyObject = {};

  Object.entries(data.data).forEach(([key, value]: [string, any]) => {
    processedData[key] = processDynamicValue(
      value,
      utils,
      runtime,
      runtimeInfo
    );
  });

  return processedData;
}
