// To parse this data:
//
//   import { Convert, MerchantResponse } from "./file";
//
//   const merchantResponse = Convert.toMerchantResponse(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface MerchantResponse {
  data: Data;
  meta: Meta;
}

export interface Data {
  id: number;
  name: string;
  email: string;
  contact_name: string;
  phone_number: string;
  active: boolean;
  logo_url: null;
  legal_name: string;
  legal_id_type: string;
  legal_id: string;
  public_key: string;
  accepted_currencies: string[];
  validated_legal_id: string;
  fraud_javascript_key: null;
  fraud_groups: any[];
  accepted_payment_methods: string[];
  payment_methods: PaymentMethod[];
  presigned_acceptance: Presigned;
  presigned_personal_data_auth: Presigned;
  click_to_pay_dpa_id: null;
  mcc: null;
  acquirer_id: null;
}

export interface PaymentMethod {
  name: string;
  payment_processors: PaymentProcessor[];
}

export interface PaymentProcessor {
  name: string;
}

export interface Presigned {
  acceptance_token: string;
  permalink: string;
  type: string;
}

export interface Meta {}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toMerchantResponse(json: string): MerchantResponse {
    return cast(JSON.parse(json), r('MerchantResponse'));
  }

  public static merchantResponseToJson(value: MerchantResponse): string {
    return JSON.stringify(uncast(value, r('MerchantResponse')), null, 2);
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
  MerchantResponse: o(
    [
      { json: 'data', js: 'data', typ: r('Data') },
      { json: 'meta', js: 'meta', typ: r('Meta') },
    ],
    false,
  ),
  Data: o(
    [
      { json: 'id', js: 'id', typ: 0 },
      { json: 'name', js: 'name', typ: '' },
      { json: 'email', js: 'email', typ: '' },
      { json: 'contact_name', js: 'contact_name', typ: '' },
      { json: 'phone_number', js: 'phone_number', typ: '' },
      { json: 'active', js: 'active', typ: true },
      { json: 'logo_url', js: 'logo_url', typ: null },
      { json: 'legal_name', js: 'legal_name', typ: '' },
      { json: 'legal_id_type', js: 'legal_id_type', typ: '' },
      { json: 'legal_id', js: 'legal_id', typ: '' },
      { json: 'public_key', js: 'public_key', typ: '' },
      { json: 'accepted_currencies', js: 'accepted_currencies', typ: a('') },
      { json: 'validated_legal_id', js: 'validated_legal_id', typ: '' },
      { json: 'fraud_javascript_key', js: 'fraud_javascript_key', typ: null },
      { json: 'fraud_groups', js: 'fraud_groups', typ: a('any') },
      {
        json: 'accepted_payment_methods',
        js: 'accepted_payment_methods',
        typ: a(''),
      },
      {
        json: 'payment_methods',
        js: 'payment_methods',
        typ: a(r('PaymentMethod')),
      },
      {
        json: 'presigned_acceptance',
        js: 'presigned_acceptance',
        typ: r('Presigned'),
      },
      {
        json: 'presigned_personal_data_auth',
        js: 'presigned_personal_data_auth',
        typ: r('Presigned'),
      },
      { json: 'click_to_pay_dpa_id', js: 'click_to_pay_dpa_id', typ: null },
      { json: 'mcc', js: 'mcc', typ: null },
      { json: 'acquirer_id', js: 'acquirer_id', typ: null },
    ],
    false,
  ),
  PaymentMethod: o(
    [
      { json: 'name', js: 'name', typ: '' },
      {
        json: 'payment_processors',
        js: 'payment_processors',
        typ: a(r('PaymentProcessor')),
      },
    ],
    false,
  ),
  PaymentProcessor: o([{ json: 'name', js: 'name', typ: '' }], false),
  Presigned: o(
    [
      { json: 'acceptance_token', js: 'acceptance_token', typ: '' },
      { json: 'permalink', js: 'permalink', typ: '' },
      { json: 'type', js: 'type', typ: '' },
    ],
    false,
  ),
  Meta: o([], false),
};
