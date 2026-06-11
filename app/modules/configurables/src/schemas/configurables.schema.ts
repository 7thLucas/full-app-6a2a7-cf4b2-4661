/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 160,
    },
    {
      fieldName: "loginHeading",
      type: "string",
      required: false,
      label: "Login Heading",
      maxLength: 120,
    },
    {
      fieldName: "checkInTitle",
      type: "string",
      required: false,
      label: "Check-In Section Title",
      maxLength: 120,
    },
    {
      fieldName: "checkInInstruction",
      type: "string",
      required: false,
      label: "Check-In Instruction",
      maxLength: 240,
    },
    {
      fieldName: "validBadgeLabel",
      type: "string",
      required: false,
      label: "Valid Status Label",
      maxLength: 40,
    },
    {
      fieldName: "invalidBadgeLabel",
      type: "string",
      required: false,
      label: "Invalid Status Label",
      maxLength: 40,
    },
    {
      fieldName: "validColor",
      type: "color",
      required: false,
      label: "Valid Signal Color",
    },
    {
      fieldName: "invalidColor",
      type: "color",
      required: false,
      label: "Invalid Signal Color",
    },
  ],
};