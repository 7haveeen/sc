import {
  Fields,
  Validators,
} from "remult";
import { customAlphabet } from "nanoid";
import * as v from "valibot";
import { alphaSmall } from "./helpers";

import type { ClassFieldDecorator, FieldOptions, StringFieldOptions } from "remult";

export type InputType =
  | "text"
  | "hidden"
  | "textarea"
  | "password"
  | "integer"
  | "float"
  | "date"
  | "datetime"
  | "checkbox"
  | "checkboxgroup"
  | "switch"
  | "select"
  | "multiselect"
  | "radio"
  | "combobox"
  | "multicombobox"
  | "richtext";

export interface FieldConfig {
  input?: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> | null;
  output?: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> | null;
  placeholder?: string;
  inputType?: InputType;
}

type DefaultOptionsConfig = Required<Pick<FieldConfig, "inputType">> &
  Partial<Omit<FieldConfig, "inputType">>;

type ValibotFieldOptions<EntityType, T> = FieldOptions<EntityType, T> &
  FieldConfig;

type ValibotStringOptions<EntityType, T = string> = StringFieldOptions<
  EntityType,
  T
> &
FieldConfig & { unique?: boolean | string };

type ValibotFieldResult<EntityType, T> = ClassFieldDecorator<
  EntityType,
  T | undefined
> &
FieldConfig;

/**
 * Extracts first error message from Valibot validation result
 */
function getFirstError(issues: v.BaseIssue<unknown>[]): string | undefined {
  return issues[0]?.message;
}

/**
 * Field validator that uses Valibot schema for validation
 */
function validateField<EntityType, T>(input: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>) {
  return (entity: EntityType, { value }: { value: T }): string | undefined => {
    const result = v.safeParse(input, value);
    return result.success ? undefined : getFirstError(result.issues);
  };
}

/**
 * Adds validators to the options
 */
function addValidators<EntityType, T>(options: ValibotFieldOptions<EntityType, T>, newValidators: unknown | unknown[]): ValibotFieldOptions<EntityType, T> {
  const currentValidate = options.validate ?? [];
  const validatorsArray = Array.isArray(currentValidate)
    ? currentValidate
    : [currentValidate];
  const newValidatorsArray = Array.isArray(newValidators)
    ? newValidators
    : [newValidators];

  return {
    ...options,
    validate: [...validatorsArray, ...newValidatorsArray].filter(Boolean),
  };
}

/**
 * Applies default options with special handling for unique validator
 */
function applyDefaultOptions<EntityType, T>(opts: Omit<ValibotStringOptions<EntityType, T>, "inputType"> = {}, defaults: DefaultOptionsConfig): ValibotFieldOptions<EntityType, T> {
  let options = { ...defaults, ...opts } as ValibotFieldOptions<EntityType, T>;

  // Add unique validator if needed
  if ("unique" in opts && opts.unique) {
    const uniqueValidator
      = typeof opts.unique === "string"
        ? Validators.unique(opts.unique)
        : Validators.unique;
    options = addValidators(options, uniqueValidator);
  }

  // Add Valibot validator when input schema is provided
  if (options.input && options.input !== null) {
    options = addValidators(
      options,
      validateField<EntityType, T>(options.input),
    );
  }

  return options;
}

/**
 * Creates a field with the specified options
 */
function createField<EntityType, T>(fieldFn: (
  options: ValibotFieldOptions<EntityType, T>
) => ClassFieldDecorator<EntityType, T>, opts: ValibotFieldOptions<EntityType, T> = {}, defaults: DefaultOptionsConfig): ValibotFieldResult<EntityType, T> {
  const options = applyDefaultOptions(opts, defaults);
  return fieldFn(options) as ValibotFieldResult<EntityType, T>;
}

/**
 * Class with static methods for creating valibot validated Remult fields
 */
export class vFields {
  static cuid<EntityType>(
    opts?: ValibotFieldOptions<EntityType, string>,
  ): ValibotFieldResult<EntityType, string> {
    return createField<EntityType, string>(Fields.cuid, opts, {
      input: null,
      inputType: "text",
    });
  }

  static createdAt<EntityType>(
    opts?: ValibotFieldOptions<EntityType, Date>,
  ): ValibotFieldResult<EntityType, Date> {
    return createField<EntityType, Date>(Fields.createdAt, opts, {
      input: null,
      inputType: "datetime",
    });
  }

  static updatedAt<EntityType>(
    opts?: ValibotFieldOptions<EntityType, Date>,
  ): ValibotFieldResult<EntityType, Date> {
    return createField<EntityType, Date>(Fields.updatedAt, opts, {
      input: null,
      inputType: "datetime",
    });
  }

  static integer<EntityType>(
    opts?: ValibotFieldOptions<EntityType, number>,
  ): ValibotFieldResult<EntityType, number> {
    return createField<EntityType, number>(Fields.integer, opts, {
      input: v.optional(v.pipe(v.number(), v.integer())),
      inputType: "integer",
    });
  }

  static float<EntityType>(
    opts?: ValibotFieldOptions<EntityType, number>,
  ): ValibotFieldResult<EntityType, number> {
    return createField<EntityType, number>(Fields.number, opts, {
      input: v.optional(v.number()),
      inputType: "float",
    });
  }

  static boolean<EntityType>(
    opts?: ValibotFieldOptions<EntityType, boolean>,
  ): ValibotFieldResult<EntityType, boolean> {
    return createField<EntityType, boolean>(Fields.boolean, opts, {
      input: v.optional(v.boolean()),
      inputType: "checkbox",
    });
  }

  static date<EntityType>(
    opts?: ValibotFieldOptions<EntityType, Date>,
  ): ValibotFieldResult<EntityType, Date> {
    return createField<EntityType, Date>(Fields.dateOnly, opts, {
      input: v.date(),
      inputType: "date",
    });
  }

  static dateTime<EntityType>(
    opts?: ValibotFieldOptions<EntityType, Date>,
  ): ValibotFieldResult<EntityType, Date> {
    return createField<EntityType, Date>(Fields.date, opts, {
      input: v.date(),
      inputType: "datetime",
    });
  }

  static string<EntityType>(
    opts?: ValibotStringOptions<EntityType, string>,
  ): ValibotFieldResult<EntityType, string> {
    return createField<EntityType, string>(Fields.string, opts, {
      input: v.optional(v.string()),
      inputType: "text",
    });
  }

  static json<EntityType = unknown, ValueType = unknown>(
    opts?: ValibotFieldOptions<EntityType, ValueType>,
  ): ValibotFieldResult<EntityType, ValueType> {
    return createField<EntityType, ValueType>(Fields.json, opts, {
      input: v.optional(v.record(v.string(), v.unknown())),
      inputType: "text",
    });
  }

  static publicId<EntityType>(
    prefix: string,
    length: number | undefined,
    opts?: ValibotStringOptions<EntityType, string>,
  ): ValibotFieldResult<EntityType, string> {
    const Id = () => [prefix, customAlphabet(alphaSmall, length ?? 10)()].join("_");

    return createField<EntityType, string>(
      Fields.string,
      {
        allowApiUpdate: false,
        defaultValue: Id,
        saving: (_, record) => {
          if (!record.value) {
            record.value = Id();
          }
        },
        ...opts,
      },
      {
        input: null,
        inputType: "text",
      },
    );
  }
}
