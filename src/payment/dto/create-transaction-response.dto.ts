// To parse this data:
//
//   import { Convert, CreateTransactionResponse } from "./file";
//
//   const createTransactionResponse = Convert.toCreateTransactionResponse(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface CreateTransactionResponse {
  data: Data;
  meta: Meta;
}

export interface Data {
  id: string;
  created_at: Date;
  finalized_at: null;
  amount_in_cents: number;
  reference: string;
  customer_email: string;
  currency: string;
  payment_method_type: string;
  payment_method: PaymentMethod;
  status: string;
  status_message: null;
  billing_data: null;
  shipping_address: null;
  redirect_url: string;
  payment_source_id: null;
  payment_link_id: null;
  customer_data: CustomerData;
  bill_id: null;
  taxes: any[];
  tip_in_cents: null;
}

export interface CustomerData {
  legal_id: string;
  full_name: string;
  phone_number: string;
  legal_id_type: string;
}

export interface PaymentMethod {
  type: string;
  extra: Extra;
  installments: number;
}

export interface Extra {
  bin: string;
  name: string;
  brand: string;
  card_type: string;
  last_four: string;
  card_holder: string;
  is_three_ds: boolean;
  three_ds_auth_type: null;
}

export interface Meta {}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toCreateTransactionResponse(
    json: string,
  ): CreateTransactionResponse {
    return cast(JSON.parse(json), r('CreateTransactionResponse'));
  }

  public static createTransactionResponseToJson(
    value: CreateTransactionResponse,
  ): string {
    return JSON.stringify(
      uncast(value, r('CreateTransactionResponse')),
      null,
      2,
    );
  }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
  const prettyTyp = prettyTypeName(typ);
  const parentText = parent ? ` on ${parent}` : '';
  const keyText = key ? ` for key "${key}"` : '';
  throw Error(
    `Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`,
  );
}

function prettyTypeName(typ: any): string {
  if (Array.isArray(typ)) {
    if (typ.length === 2 && typ[0] === undefined) {
      return `an optional ${prettyTypeName(typ[1])}`;
    } else {
      return `one of [${typ
        .map((a) => {
          return prettyTypeName(a);
        })
        .join(', ')}]`;
    }
  } else if (typeof typ === 'object' && typ.literal !== undefined) {
    return typ.literal;
  } else {
    return typeof typ;
  }
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(
  val: any,
  typ: any,
  getProps: any,
  key: any = '',
  parent: any = '',
): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key, parent);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val, key, parent);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(
      cases.map((a) => {
        return l(a);
      }),
      val,
      key,
      parent,
    );
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue(l('array'), val, key, parent);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue(l('Date'), val, key, parent);
    }
    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any,
  ): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue(l(ref || 'object'), val, key, parent);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, key, ref);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key, ref);
      }
    });
    return result;
  }

  if (typ === 'any') return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val, key, parent);
  }
  if (typ === false) return invalidValue(typ, val, key, parent);
  let ref: any = undefined;
  while (typeof typ === 'object' && typ.ref !== undefined) {
    ref = typ.ref;
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
        ? transformArray(typ.arrayItems, val)
        : typ.hasOwnProperty('props')
          ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val, key, parent);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
  return { literal: typ };
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  CreateTransactionResponse: o(
    [
      { json: 'data', js: 'data', typ: r('Data') },
      { json: 'meta', js: 'meta', typ: r('Meta') },
    ],
    false,
  ),
  Data: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'created_at', js: 'created_at', typ: Date },
      { json: 'finalized_at', js: 'finalized_at', typ: null },
      { json: 'amount_in_cents', js: 'amount_in_cents', typ: 0 },
      { json: 'reference', js: 'reference', typ: '' },
      { json: 'customer_email', js: 'customer_email', typ: '' },
      { json: 'currency', js: 'currency', typ: '' },
      { json: 'payment_method_type', js: 'payment_method_type', typ: '' },
      { json: 'payment_method', js: 'payment_method', typ: r('PaymentMethod') },
      { json: 'status', js: 'status', typ: '' },
      { json: 'status_message', js: 'status_message', typ: null },
      { json: 'billing_data', js: 'billing_data', typ: null },
      { json: 'shipping_address', js: 'shipping_address', typ: null },
      { json: 'redirect_url', js: 'redirect_url', typ: '' },
      { json: 'payment_source_id', js: 'payment_source_id', typ: null },
      { json: 'payment_link_id', js: 'payment_link_id', typ: null },
      { json: 'customer_data', js: 'customer_data', typ: r('CustomerData') },
      { json: 'bill_id', js: 'bill_id', typ: null },
      { json: 'taxes', js: 'taxes', typ: a('any') },
      { json: 'tip_in_cents', js: 'tip_in_cents', typ: null },
    ],
    false,
  ),
  CustomerData: o(
    [
      { json: 'legal_id', js: 'legal_id', typ: '' },
      { json: 'full_name', js: 'full_name', typ: '' },
      { json: 'phone_number', js: 'phone_number', typ: '' },
      { json: 'legal_id_type', js: 'legal_id_type', typ: '' },
    ],
    false,
  ),
  PaymentMethod: o(
    [
      { json: 'type', js: 'type', typ: '' },
      { json: 'extra', js: 'extra', typ: r('Extra') },
      { json: 'installments', js: 'installments', typ: 0 },
    ],
    false,
  ),
  Extra: o(
    [
      { json: 'bin', js: 'bin', typ: '' },
      { json: 'name', js: 'name', typ: '' },
      { json: 'brand', js: 'brand', typ: '' },
      { json: 'card_type', js: 'card_type', typ: '' },
      { json: 'last_four', js: 'last_four', typ: '' },
      { json: 'card_holder', js: 'card_holder', typ: '' },
      { json: 'is_three_ds', js: 'is_three_ds', typ: true },
      { json: 'three_ds_auth_type', js: 'three_ds_auth_type', typ: null },
    ],
    false,
  ),
  Meta: o([], false),
};
