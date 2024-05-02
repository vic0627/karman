import { ClassSignature } from "@/types/common.type";
import { ParameterDescriptor } from "@/types/rules.type";
import { isUndefined, isNull, isString } from "lodash-es";

const existValue = (value: unknown) => !isUndefined(value) && !isNull(value);

export interface ValidationErrorOptions extends ParameterDescriptor {
  prop: string;
  value: any;
  message?: string;
  type?: string;
  instance?: ClassSignature;
  required?: boolean;
}

export default class ValidationError extends Error {
  name: string = "ValidationError";

  constructor(options: ValidationErrorOptions | string) {
    let message: string = "";

    if (isString(options)) message = options;
    else {
      const { value, min, max, equality, measurement, required, type, instance } = options;
      let { prop } = options;
      message = options?.message ?? "";

      if (measurement && measurement !== "self") prop += `.${measurement}`;

      if (!message) {
        message = `Parameter '${prop}' `;

        if (required) message += "is required";
        else if (existValue(type)) message += `should be '${type}' type`;
        else if (existValue(instance)) message += `should be instance of '${instance}'`;
        else if (existValue(equality)) message += `should be equal to '${equality}'`;
        else if (existValue(min) && !existValue(max)) message += `should be greater than or equal to '${min}'`;
        else if (existValue(max) && !existValue(min)) message += `should be less than or equal to '${max}'`;
        else if (existValue(min) && existValue(max)) message += `should be within the range of '${min}' and '${max}'`;
        else message += "validation failed";

        message += `, but received '${value}'.`;
      }
    }

    super(message);
  }
}
