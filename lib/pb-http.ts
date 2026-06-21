import http from "http";

const PB_HOST = "127.0.0.1";
const PB_PORT = 8090;

interface PBQueryParams {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
  fields?: string;
  expand?: string;
  skipTotal?: boolean;
}

function pbEncode(str: string): string {
  return encodeURIComponent(str).replace(/%20/g, "+");
}

function serializeQuery(params: PBQueryParams): string {
  const parts: string[] = [];
  if (params.page) parts.push(`page=${params.page}`);
  if (params.perPage) parts.push(`perPage=${params.perPage}`);
  if (params.filter) parts.push(`filter=${pbEncode(params.filter)}`);
  if (params.sort) parts.push(`sort=${pbEncode(params.sort)}`);
  if (params.fields) parts.push(`fields=${pbEncode(params.fields)}`);
  if (params.expand) parts.push(`expand=${pbEncode(params.expand)}`);
  if (params.skipTotal) parts.push("skipTotal=true");
  return parts.join("&");
}

function httpGet(path: string, token: string): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: PB_HOST, port: PB_PORT, path, method: "GET", headers: { Authorization: token } },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode || 500, data: JSON.parse(body) }); }
          catch { resolve({ status: res.statusCode || 500, data: { message: body } }); }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

function httpPost(path: string, token: string, data?: unknown): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : undefined;
    const req = http.request(
      {
        hostname: PB_HOST, port: PB_PORT, path, method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode || 500, data: JSON.parse(body) }); }
          catch { resolve({ status: res.statusCode || 500, data: { message: body } }); }
        });
      }
    );
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function httpPatch(path: string, token: string, data?: unknown): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : undefined;
    const req = http.request(
      {
        hostname: PB_HOST, port: PB_PORT, path, method: "PATCH",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          ...(postData ? { "Content-Length": Buffer.byteLength(postData) } : {}),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode || 500, data: JSON.parse(body) }); }
          catch { resolve({ status: res.statusCode || 500, data: { message: body } }); }
        });
      }
    );
    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function httpDelete(path: string, token: string): Promise<{ status: number; data: unknown }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: PB_HOST, port: PB_PORT, path, method: "DELETE", headers: { Authorization: token } },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          try { resolve({ status: res.statusCode || 500, data: JSON.parse(body) }); }
          catch { resolve({ status: res.statusCode || 500, data: { message: body } }); }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

/**
 * HTTP-based PocketBase client that bypasses Next.js fetch wrapping.
 * Uses raw Node.js http module.
 */
export class PBHttp {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  collection(name: string) {
    const self = this;
    const basePath = `/api/collections/${name}/records`;

    return {
      async getList(page = 1, perPage = 30, options: PBQueryParams = {}) {
        const query = serializeQuery({ ...options, page, perPage });
        const path = `${basePath}?${query}`;
        const res = await httpGet(path, self.token);
        if (res.status >= 400) throw new Error(`PB ${name}.getList ${res.status}: ${JSON.stringify(res.data)}`);
        return res.data as { items: any[]; totalItems: number; page: number; perPage: number; totalPages: number };
      },

      async getOne(id: string) {
        const res = await httpGet(`${basePath}/${id}`, self.token);
        if (res.status >= 400) throw new Error(`PB ${name}.getOne ${res.status}: ${JSON.stringify(res.data)}`);
        return res.data as any;
      },

      async create(data: Record<string, any>) {
        const res = await httpPost(basePath, self.token, data);
        if (res.status >= 400) throw new Error(`PB ${name}.create ${res.status}: ${JSON.stringify(res.data)}`);
        return res.data as any;
      },

      async update(id: string, data: Record<string, any>) {
        const res = await httpPatch(`${basePath}/${id}`, self.token, data);
        if (res.status >= 400) throw new Error(`PB ${name}.update ${res.status}: ${JSON.stringify(res.data)}`);
        return res.data as any;
      },

      async delete(id: string) {
        const res = await httpDelete(`${basePath}/${id}`, self.token);
        if (res.status >= 400) throw new Error(`PB ${name}.delete ${res.status}: ${JSON.stringify(res.data)}`);
        return true;
      },
    };
  }
}

/**
 * Create an authenticated PB HTTP client from the request cookie.
 */
export async function getAuthHTTP(token: string): Promise<PBHttp> {
  return new PBHttp(token);
}
