"use server";

import axios from "axios";

export async function engineGet(authToken: string, url: string) {
  const config = {
    headers: { Authorization: `Bearer ${authToken}` },
  };
  const res = await axios
    .get(url, config)
    .then(function (response) {
      const res = {
        error: false,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      };
      return res;
    })
    .catch(function (error) {
      const res = {
        error: true,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data?.error,
      };
      return res;
    });
  return res;
}

export async function engineGetNoAuth(url: string) {
  const res = await axios
    .get(url)
    .then(function (response) {
      const res = {
        error: false,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      };
      return res;
    })
    .catch(function (error) {
      const res = {
        error: true,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data?.error,
      };
      return res;
    });
  return res;
}

export async function engineCreateUpdateNoAuth(method: string, url: string, payload: Record<string, unknown>) {
  const hasFile =
    payload.photo instanceof File ||
    payload.logo instanceof File ||
    payload.media instanceof File ||
    payload.image instanceof File ||
    payload.file instanceof File;

  const config = {
    headers: {
      ...(hasFile ? {} : { "Content-Type": "application/json" }),
    },
  };

  try {
    let response;
    if (hasFile) {
      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        const value = payload[key];
        if ((key === "photo" || key === "logo" || key === "media" || key === "image" || key === "file") && value instanceof File && value.size > 0) {
          formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      response = await axios[method === "create" ? "post" : "patch"](url, formData, config);
    } else {
      response = await axios[method === "create" ? "post" : "patch"](url, payload, config);
    }

    return {
      error: false,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    };
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    return {
      error: true,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data?.error,
    };
  }
}

export async function engineCreateUpdate(method: string, authToken: string, url: string, payload: Record<string, unknown>) {
  const fileKeys = ["photo", "logo", "media", "image", "file"];

  const hasFile = fileKeys.some((key) => payload[key] instanceof File);

  const config = {
    headers: {
      Authorization: `Bearer ${authToken}`,
      ...(hasFile ? {} : { "Content-Type": "application/json" }),
    },
  };

  try {
    let response;

    if (hasFile) {
      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (fileKeys.includes(key)) {
          if (value instanceof File && value.size > 0) {
            formData.append(key, value);
          } else if (typeof value === "string") {
            formData.append(key, value);
          }
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      response = await axios[method === "create" ? "post" : "patch"](url, formData, config);
    } else {
      response = await axios[method === "create" ? "post" : "patch"](url, payload, config);
    }

    return {
      error: false,
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    };
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    return {
      error: true,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data?.error,
    };
  }
}

export async function engineDelete(authToken: string, url: string, id: number) {
  const config = {
    data: { id: id },
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  };
  const res = await axios
    .delete(url, config)
    .then(function (response) {
      const res = {
        error: false,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      };
      return res;
    })
    .catch(function (error) {
      const res = {
        error: true,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data?.error,
      };
      return res;
    });
  return res;
}

export async function engineBulkDelete(authToken: string, url: string, ids: Array<number>) {
  const config = {
    data: { ids: ids },
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  };
  const res = await axios
    .delete(url, config)
    .then(function (response) {
      const res = {
        error: false,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      };
      return res;
    })
    .catch(function (error) {
      const res = {
        error: true,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data?.error,
      };
      return res;
    });
  return res;
}
